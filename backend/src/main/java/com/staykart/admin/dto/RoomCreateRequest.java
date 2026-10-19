package com.staykart.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record RoomCreateRequest(
    @NotNull(message = "Property ID is required")
    Long propertyId,

    @NotNull(message = "Room Type ID is required")
    Long roomTypeId,

    @NotBlank(message = "Room number is required")
    String roomNumber,

    int floor,

    List<Long> amenityIds
) {}
