package com.staykart.auth;

import com.staykart.auth.dto.LoginRequest;
import com.staykart.auth.dto.RegisterRequest;
import com.staykart.auth.service.AuthService;
import com.staykart.auth.service.JwtTokenService;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ConflictException;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenService jwtTokenService;

    @Mock
    private AuditService auditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                jwtTokenService,
                auditService,
                "refresh_token",
                604800000
        );
    }

    @Test
    void shouldRegisterNewGuestSuccessfully() {
        RegisterRequest request = new RegisterRequest("Aarav Sharma", "aarav@example.in", "+919876543210", "Password@123");

        when(userRepository.existsByEmail("aarav@example.in")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");

        User savedUser = User.builder()
                .id(1L)
                .fullName("Aarav Sharma")
                .email("aarav@example.in")
                .phone("+919876543210")
                .passwordHash("hashed_pass")
                .role(Role.GUEST)
                .enabled(true)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenService.generateAccessToken(savedUser)).thenReturn("access_token_123");
        when(jwtTokenService.generateRefreshToken(savedUser)).thenReturn("refresh_token_123");

        AuthService.AuthResult result = authService.register(request, "127.0.0.1");

        assertNotNull(result);
        assertEquals("access_token_123", result.response().accessToken());
        assertEquals("aarav@example.in", result.response().user().email());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        RegisterRequest request = new RegisterRequest("Aarav Sharma", "existing@example.in", "+919876543210", "Password@123");
        when(userRepository.existsByEmail("existing@example.in")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request, "127.0.0.1"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        LoginRequest request = new LoginRequest("aarav@example.in", "Password@123");

        User user = User.builder()
                .id(1L)
                .email("aarav@example.in")
                .fullName("Aarav Sharma")
                .passwordHash("hashed_pass")
                .role(Role.GUEST)
                .enabled(true)
                .failedLoginAttempts(0)
                .build();

        when(userRepository.findByEmail("aarav@example.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@123", "hashed_pass")).thenReturn(true);
        when(jwtTokenService.generateAccessToken(user)).thenReturn("access_token_123");
        when(jwtTokenService.generateRefreshToken(user)).thenReturn("refresh_token_123");

        AuthService.AuthResult result = authService.login(request, "127.0.0.1");

        assertNotNull(result);
        assertEquals("access_token_123", result.response().accessToken());
        assertEquals(0, user.getFailedLoginAttempts());
    }

    @Test
    void shouldIncrementFailedAttemptsOnBadPassword() {
        LoginRequest request = new LoginRequest("aarav@example.in", "WrongPassword");

        User user = User.builder()
                .id(1L)
                .email("aarav@example.in")
                .passwordHash("hashed_pass")
                .role(Role.GUEST)
                .enabled(true)
                .failedLoginAttempts(2)
                .build();

        when(userRepository.findByEmail("aarav@example.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_pass")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request, "127.0.0.1"));
        assertEquals(3, user.getFailedLoginAttempts());
        verify(userRepository).save(user);
    }

    @Test
    void shouldLockAccountAfter5FailedAttempts() {
        LoginRequest request = new LoginRequest("aarav@example.in", "WrongPassword");

        User user = User.builder()
                .id(1L)
                .email("aarav@example.in")
                .passwordHash("hashed_pass")
                .role(Role.GUEST)
                .enabled(true)
                .failedLoginAttempts(4)
                .build();

        when(userRepository.findByEmail("aarav@example.in")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_pass")).thenReturn(false);

        assertThrows(LockedException.class, () -> authService.login(request, "127.0.0.1"));
        assertEquals(5, user.getFailedLoginAttempts());
        assertNotNull(user.getLockoutUntil());
        verify(userRepository).save(user);
    }
}
