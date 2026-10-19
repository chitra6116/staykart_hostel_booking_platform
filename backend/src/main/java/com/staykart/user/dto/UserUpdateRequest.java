package com.staykart.user.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    String fullName,

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9\\s-]{7,20}$", message = "Please enter a valid phone number (7 to 15 digits)")
    String phone
) {
    @JsonCreator
    public UserUpdateRequest(
            @JsonProperty("fullName") String fullName,
            @JsonProperty("phone") String phone,
            @JsonProperty("phoneNumber") String phoneNumber) {
        this(
            fullName,
            (phone != null && !phone.isBlank()) ? phone : ((phoneNumber != null && !phoneNumber.isBlank()) ? phoneNumber : "")
        );
    }
}
