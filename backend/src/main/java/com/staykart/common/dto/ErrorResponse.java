package com.staykart.common.dto;

import java.util.List;

public record ErrorResponse(
    String timestamp,
    int status,
    String code,
    String message,
    List<FieldErrorDetail> fieldErrors,
    String path
) {}
