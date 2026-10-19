package com.staykart.auth;

import com.staykart.auth.service.JwtTokenService;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenServiceTest {

    private JwtTokenService jwtTokenService;
    private User testUser;

    @BeforeEach
    void setUp() {
        // 256-bit dummy test key
        String secret = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
        jwtTokenService = new JwtTokenService(secret, 900000, 604800000);

        testUser = User.builder()
                .id(42L)
                .email("aarav.sharma@example.in")
                .fullName("Aarav Sharma")
                .role(Role.GUEST)
                .build();
    }

    @Test
    void shouldGenerateAndValidateAccessToken() {
        String token = jwtTokenService.generateAccessToken(testUser);
        assertNotNull(token);
        assertTrue(jwtTokenService.validateToken(token));
        assertFalse(jwtTokenService.isRefreshToken(token));
        assertEquals("aarav.sharma@example.in", jwtTokenService.extractEmail(token));
        assertEquals(42L, jwtTokenService.extractUserId(token));
        assertEquals("GUEST", jwtTokenService.extractRole(token));
    }

    @Test
    void shouldGenerateAndIdentifyRefreshToken() {
        String refreshToken = jwtTokenService.generateRefreshToken(testUser);
        assertNotNull(refreshToken);
        assertTrue(jwtTokenService.validateToken(refreshToken));
        assertTrue(jwtTokenService.isRefreshToken(refreshToken));
        assertEquals("aarav.sharma@example.in", jwtTokenService.extractEmail(refreshToken));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtTokenService.validateToken("invalid.jwt.token"));
    }
}
