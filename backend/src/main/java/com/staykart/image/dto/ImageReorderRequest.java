package com.staykart.image.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ImageReorderRequest(
    @NotEmpty(message = "Image IDs list cannot be empty")
    List<Long> imageIds
) {}
