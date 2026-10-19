package com.staykart.pricing.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record PriceQuoteRequest(
    @NotNull(message = "Room ID is required")
    Long roomId,

    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    LocalDate checkIn,

    @NotNull(message = "Check-out date is required")
    LocalDate checkOut,

    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest is required")
    Integer guestsCount
) {}
