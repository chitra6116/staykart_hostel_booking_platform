package com.staykart.auth.service;

import com.staykart.auth.dto.AuthResponse;
import com.staykart.auth.dto.LoginRequest;
import com.staykart.auth.dto.RegisterRequest;
import com.staykart.auth.dto.UserSummaryDto;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ConflictException;
import com.staykart.common.exception.UnauthorizedException;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final AuditService auditService;
    private final String cookieName;
    private final long refreshTokenExpirationMs;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            AuditService auditService,
            @Value("${app.jwt.cookie-name:refresh_token}") String cookieName,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.auditService = auditService;
        this.cookieName = cookieName;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    @Transactional
    public record AuthResult(AuthResponse response, ResponseCookie cookie) {}

    @Transactional
    public AuthResult register(RegisterRequest request, String ipAddress) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ConflictException("An account with this email address already exists");
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(request.email().toLowerCase().trim())
                .phone(request.phone().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.GUEST)
                .enabled(true)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        auditService.record(user, "USER_REGISTERED", "User", user.getId(), "Guest account registered", ipAddress);

        String accessToken = jwtTokenService.generateAccessToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken(user);

        ResponseCookie cookie = createRefreshTokenCookie(refreshToken, refreshTokenExpirationMs / 1000);
        return new AuthResult(new AuthResponse(accessToken, UserSummaryDto.from(user)), cookie);
    }

    @Transactional
    public AuthResult login(LoginRequest request, String ipAddress) {
        String email = request.email().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getLockoutUntil() != null) {
            if (now.isBefore(user.getLockoutUntil())) {
                throw new LockedException("Your account is locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.");
            } else {
                user.setFailedLoginAttempts(0);
                user.setLockoutUntil(null);
            }
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int failedAttempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(failedAttempts);
            if (failedAttempts >= 5) {
                user.setLockoutUntil(now.plusMinutes(15));
                userRepository.save(user);
                auditService.record(user, "ACCOUNT_LOCKED", "User", user.getId(), "Account locked after 5 failed login attempts", ipAddress);
                throw new LockedException("Your account has been locked for 15 minutes after 5 consecutive failed login attempts.");
            }
            userRepository.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new UnauthorizedException("This account has been disabled. Please contact StayKart support.");
        }

        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        auditService.record(user, "USER_LOGIN", "User", user.getId(), "Successful user login", ipAddress);

        String accessToken = jwtTokenService.generateAccessToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken(user);

        ResponseCookie cookie = createRefreshTokenCookie(refreshToken, refreshTokenExpirationMs / 1000);
        return new AuthResult(new AuthResponse(accessToken, UserSummaryDto.from(user)), cookie);
    }

    @Transactional
    public AuthResult refreshToken(String refreshToken, String ipAddress) {
        if (refreshToken == null || !jwtTokenService.validateToken(refreshToken) || !jwtTokenService.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Session expired or invalid. Please sign in again.");
        }

        String email = jwtTokenService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found for session"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        String newAccessToken = jwtTokenService.generateAccessToken(user);
        String newRefreshToken = jwtTokenService.generateRefreshToken(user);

        ResponseCookie cookie = createRefreshTokenCookie(newRefreshToken, refreshTokenExpirationMs / 1000);
        return new AuthResult(new AuthResponse(newAccessToken, UserSummaryDto.from(user)), cookie);
    }

    public ResponseCookie createLogoutCookie() {
        return createRefreshTokenCookie("", 0);
    }

    private ResponseCookie createRefreshTokenCookie(String token, long maxAgeSeconds) {
        return ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(false) // Allow HTTP during local development, secure in prod
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
    }
}
