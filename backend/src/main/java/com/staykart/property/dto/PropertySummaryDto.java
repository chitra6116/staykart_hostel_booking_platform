package com.staykart.property.dto;

import com.staykart.amenity.dto.AmenityDto;

import java.math.BigDecimal;
import java.util.List;

public record PropertySummaryDto(
    Long id,
    String name,
    String slug,
    String description,
    String addressLine,
    String city,
    String state,
    String pincode,
    String checkInTime,
    String checkOutTime,
    String coverImageUrl,
    BigDecimal startingPriceInr,
    List<AmenityDto> amenities
) {}
