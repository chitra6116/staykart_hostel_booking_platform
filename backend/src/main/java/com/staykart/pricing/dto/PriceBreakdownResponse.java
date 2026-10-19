package com.staykart.pricing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PriceBreakdownResponse(
    Long roomId,
    String propertyName,
    String roomTypeName,
    LocalDate checkIn,
    LocalDate checkOut,
    int nightsCount,
    int guestsCount,
    BigDecimal totalBaseInr,
    BigDecimal totalDiscountInr,
    BigDecimal taxableAmountInr,
    BigDecimal cgstInr,
    BigDecimal sgstInr,
    BigDecimal totalAmountInr,
    List<DailyPriceItem> dailyBreakdown
) {}
