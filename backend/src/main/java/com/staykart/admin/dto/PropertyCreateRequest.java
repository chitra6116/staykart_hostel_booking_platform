package com.staykart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record PropertyCreateRequest(
    @NotBlank(message = "Property name is required")
    @Size(min = 3, max = 150)
    String name,

    @NotBlank(message = "Slug is required")
    String slug,

    @NotBlank(message = "Description is required")
    String description,

    @NotBlank(message = "Address line is required")
    String addressLine,

    @NotBlank(message = "City is required")
    String city,

    @NotBlank(message = "State is required")
    String state,

    @NotBlank(message = "PIN code is required")
    @Pattern(regexp = "^\\d{6}$", message = "PIN code must be exactly 6 digits")
    String pincode,

    String checkInTime,
    String checkOutTime,

    @NotBlank(message = "House rules are required")
    String houseRules,

    List<Long> amenityIds
) {}
