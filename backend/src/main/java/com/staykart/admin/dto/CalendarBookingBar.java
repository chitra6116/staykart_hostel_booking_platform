package com.staykart.admin.dto;

import com.staykart.booking.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CalendarBookingBar(
    Long bookingId,
    String bookingCode,
    LocalDate checkIn,
    LocalDate checkOut,
    BookingStatus status,
    String guestName,
    String guestPhone,
    BigDecimal totalAmountInr
) {}
