package com.staykart.admin.dto;

import java.math.BigDecimal;

public record CityRevenueStat(
    String city,
    BigDecimal revenueInr,
    int bookingsCount
) {}
