package com.staykart.room.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RoomSearchFilter(
    String city,
    LocalDate checkIn,
    LocalDate checkOut,
    Integer guests,
    Long roomTypeId,
    BigDecimal minPrice,
    BigDecimal maxPrice,
    List<Long> amenityIds,
    String sortBy
) {}
