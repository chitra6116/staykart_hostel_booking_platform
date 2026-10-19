package com.staykart.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyPriceItem(
    LocalDate date,
    String dayOfWeek,
    BigDecimal basePriceInr,
    BigDecimal seasonalMultiplier,
    boolean isWeekend,
    BigDecimal weekendMultiplier,
    BigDecimal discountPercentage,
    BigDecimal discountAmountInr,
    BigDecimal taxableAmountInr,
    BigDecimal gstPercentage,
    BigDecimal cgstInr,
    BigDecimal sgstInr,
    BigDecimal totalNightInr
) {}
