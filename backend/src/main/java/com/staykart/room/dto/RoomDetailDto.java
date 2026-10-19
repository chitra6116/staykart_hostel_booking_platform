package com.staykart.room.dto;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.image.dto.ImageResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RoomDetailDto(
    Long id,
    Long propertyId,
    String propertyName,
    String propertySlug,
    String propertyDescription,
    String addressLine,
    String city,
    String state,
    String pincode,
    String checkInTime,
    String checkOutTime,
    String houseRules,
    String roomNumber,
    int floor,
    Long roomTypeId,
    String roomTypeName,
    String roomTypeDescription,
    int maxGuests,
    BigDecimal basePriceInr,
    String coverImageUrl,
    List<ImageResponse> images,
    List<AmenityDto> amenities,
    List<LocalDate> disabledDates
) {}
