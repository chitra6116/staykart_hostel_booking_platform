package com.staykart.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminDashboardResponse(
    BigDecimal currentOccupancyRate,
    BigDecimal totalRevenueInr,
    BigDecimal revenueTodayInr,
    long bookingsTodayCount,
    long checkInsTodayCount,
    long checkOutsTodayCount,
    long totalActiveRooms,
    List<DailyRevenueStat> revenueLast30Days,
    List<DailyOccupancyStat> occupancyLast30Days,
    List<CityRevenueStat> cityWiseRevenue
) {}
