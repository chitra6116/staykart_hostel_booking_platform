package com.staykart.property.dto;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.image.dto.ImageResponse;

import java.math.BigDecimal;
import java.util.List;

public record PropertyDetailDto(
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
    String houseRules,
    String coverImageUrl,
    BigDecimal startingPriceInr,
    List<ImageResponse> images,
    List<AmenityDto> amenities
) {}
