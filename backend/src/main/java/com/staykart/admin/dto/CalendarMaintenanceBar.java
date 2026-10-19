package com.staykart.admin.dto;

import java.time.LocalDate;

public record CalendarMaintenanceBar(
    Long id,
    LocalDate startDate,
    LocalDate endDate,
    String reason
) {}
