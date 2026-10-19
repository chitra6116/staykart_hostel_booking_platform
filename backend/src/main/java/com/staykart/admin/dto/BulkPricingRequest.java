package com.staykart.admin.dto;

import com.staykart.pricing.entity.PricingRuleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BulkPricingRequest(
    @NotBlank(message = "Rule name is required")
    String name,

    @NotNull(message = "Rule type is required")
    PricingRuleType ruleType,

    List<Long> propertyIds,
    List<Long> roomTypeIds,

    LocalDate startDate,
    LocalDate endDate,
    BigDecimal multiplier,
    Integer minNights,
    BigDecimal discountPercentage
) {}
