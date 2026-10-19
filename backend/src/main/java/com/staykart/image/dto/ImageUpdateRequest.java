package com.staykart.image.dto;

import jakarta.validation.constraints.NotBlank;

public record ImageUpdateRequest(
    @NotBlank(message = "Alt text is required")
    String altText,

    Boolean isCover
) {}
