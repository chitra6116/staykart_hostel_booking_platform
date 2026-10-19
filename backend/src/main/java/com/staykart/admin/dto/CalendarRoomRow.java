package com.staykart.admin.dto;

import java.util.List;

public record CalendarRoomRow(
    Long roomId,
    String roomNumber,
    int floor,
    Long roomTypeId,
    String roomTypeName,
    Long propertyId,
    String propertyName,
    String city,
    List<CalendarBookingBar> bookings,
    List<CalendarMaintenanceBar> maintenanceBlocks
) {}
