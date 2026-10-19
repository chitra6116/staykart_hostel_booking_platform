package com.staykart.auth.dto;

public record AuthResponse(
    String accessToken,
    UserSummaryDto user
) {}
