package com.staykart.room.dto;

import com.staykart.amenity.dto.AmenityDto;

import java.math.BigDecimal;
import java.util.List;

public record RoomSearchResultDto(
    Long roomId,
    Long propertyId,
    String propertyName,
    String propertySlug,
    String city,
    String state,
    String addressLine,
    String roomNumber,
    int floor,
    Long roomTypeId,
    String roomTypeName,
    String roomTypeDescription,
    int maxGuests,
    BigDecimal basePriceInr,
    BigDecimal pricePerNightInr,
    BigDecimal totalPriceInr,
    String coverImageUrl,
    List<AmenityDto> amenities
) {}
