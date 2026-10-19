package com.staykart.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailyRevenueStat(
    LocalDate date,
    BigDecimal revenueInr,
    int bookingsCount
) {}
