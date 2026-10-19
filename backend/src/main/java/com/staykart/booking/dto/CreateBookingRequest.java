package com.staykart.booking.dto;

import com.staykart.booking.entity.IdProofType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CreateBookingRequest(
    @NotNull(message = "Room ID is required")
    Long roomId,

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    LocalDate checkIn,

    @NotNull(message = "Check-out date is required")
    LocalDate checkOut,

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest is required")
    Integer guestsCount,

    @NotBlank(message = "Guest full name is required")
    @Size(min = 2, max = 100, message = "Guest name must be between 2 and 100 characters")
    String guestName,

    @NotBlank(message = "Guest email is required")
    @Email(message = "Please enter a valid email address")
    String guestEmail,

    @NotBlank(message = "Guest phone is required")
    @Pattern(regexp = "^\\+?[0-9\\s-]{7,20}$", message = "Please enter a valid phone number (7 to 15 digits)")
    String guestPhone,

    @NotNull(message = "ID proof type is required")
    IdProofType guestIdType,

    @NotBlank(message = "Last 4 digits of ID proof are required")
    @Pattern(regexp = "^\\d{4}$", message = "Please enter exactly the last 4 digits of the ID proof")
    String guestIdLast4,

    String specialRequests,

    String idempotencyKey
) {}
