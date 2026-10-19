package com.staykart.auth.controller;

import com.staykart.auth.dto.AuthResponse;
import com.staykart.auth.dto.LoginRequest;
import com.staykart.auth.dto.RegisterRequest;
import com.staykart.auth.dto.UserSummaryDto;
import com.staykart.auth.service.AuthService;
import com.staykart.common.exception.UnauthorizedException;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration, login, token refresh and session management")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final String cookieName;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            @Value("${app.jwt.cookie-name:refresh_token}") String cookieName) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.cookieName = cookieName;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new guest account")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String clientIp = resolveIp(httpRequest);
        AuthService.AuthResult result = authService.register(request, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, result.cookie().toString())
                .body(result.response());
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user with email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String clientIp = resolveIp(httpRequest);
        AuthService.AuthResult result = authService.login(request, clientIp);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.cookie().toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT access token using HttpOnly cookie")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest httpRequest) {
        String refreshToken = extractCookie(httpRequest, cookieName);
        if (refreshToken == null) {
            throw new UnauthorizedException("No refresh token found in request cookie");
        }
        String clientIp = resolveIp(httpRequest);
        AuthService.AuthResult result = authService.refreshToken(refreshToken, clientIp);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.cookie().toString())
                .body(result.response());
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out and clear session cookie")
    public ResponseEntity<Void> logout() {
        ResponseCookie clearCookie = authService.createLogoutCookie();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<UserSummaryDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));
        return ResponseEntity.ok(UserSummaryDto.from(user));
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private String resolveIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
