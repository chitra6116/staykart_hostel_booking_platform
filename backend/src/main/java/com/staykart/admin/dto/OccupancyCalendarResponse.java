package com.staykart.admin.dto;

import java.time.LocalDate;
import java.util.List;

public record OccupancyCalendarResponse(
    LocalDate startDate,
    LocalDate endDate,
    List<CalendarRoomRow> rooms
) {}
