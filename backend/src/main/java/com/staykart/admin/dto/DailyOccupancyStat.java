package com.staykart.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyOccupancyStat(
    LocalDate date,
    BigDecimal occupancyPercentage,
    int occupiedRooms,
    int totalRooms
) {}
