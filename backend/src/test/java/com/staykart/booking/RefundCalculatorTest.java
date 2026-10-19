package com.staykart.booking;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.entity.RefundStatus;
import com.staykart.booking.service.RefundCalculator;
import com.staykart.common.exception.BadRequestException;
import com.staykart.property.entity.Property;
import com.staykart.room.entity.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class RefundCalculatorTest {

    private RefundCalculator refundCalculator;
    private Booking confirmedBooking;
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    @BeforeEach
    void setUp() {
        refundCalculator = new RefundCalculator();

        Property property = Property.builder().id(1L).checkInTime("14:00").build();
        Room room = Room.builder().id(1L).property(property).build();

        // Booking starting 5 days in future, ₹10,000 total
        confirmedBooking = Booking.builder()
                .id(1L)
                .room(room)
                .status(BookingStatus.CONFIRMED)
                .checkIn(LocalDate.now(IST).plusDays(5))
                .checkOut(LocalDate.now(IST).plusDays(8))
                .totalAmountInr(BigDecimal.valueOf(10000.00))
                .build();
    }

    @Test
    void shouldProvide100PercentRefundWhenCancelled48HoursBeforeCheckIn() {
        // Cancelled now (5 days = ~120 hours before check-in)
        OffsetDateTime cancelTime = OffsetDateTime.now(IST);
        RefundCalculator.RefundDetails result = refundCalculator.calculateRefund(confirmedBooking, cancelTime);

        assertEquals(new BigDecimal("100.00"), result.refundPercentage());
        assertEquals(new BigDecimal("10000.00"), result.refundAmountInr());
        assertEquals(RefundStatus.COMPLETED, result.refundStatus());
    }

    @Test
    void shouldProvide50PercentRefundWhenCancelledBetween24And48HoursBeforeCheckIn() {
        // CheckIn is 14:00 on checkIn date. Set cancellation 30 hours prior.
        OffsetDateTime checkInDateTime = confirmedBooking.getCheckIn().atTime(14, 0).atZone(IST).toOffsetDateTime();
        OffsetDateTime cancelTime = checkInDateTime.minusHours(30);

        RefundCalculator.RefundDetails result = refundCalculator.calculateRefund(confirmedBooking, cancelTime);

        assertEquals(new BigDecimal("50.00"), result.refundPercentage());
        assertEquals(new BigDecimal("5000.00"), result.refundAmountInr());
        assertEquals(RefundStatus.COMPLETED, result.refundStatus());
    }

    @Test
    void shouldProvideZeroRefundWhenCancelledUnder24HoursBeforeCheckIn() {
        OffsetDateTime checkInDateTime = confirmedBooking.getCheckIn().atTime(14, 0).atZone(IST).toOffsetDateTime();
        OffsetDateTime cancelTime = checkInDateTime.minusHours(12);

        RefundCalculator.RefundDetails result = refundCalculator.calculateRefund(confirmedBooking, cancelTime);

        assertEquals(new BigDecimal("0.00"), result.refundPercentage());
        assertEquals(new BigDecimal("0.00"), result.refundAmountInr());
        assertEquals(RefundStatus.REJECTED, result.refundStatus());
    }

    @Test
    void shouldRejectCancellationAfterCheckIn() {
        confirmedBooking.setStatus(BookingStatus.CHECKED_IN);
        assertThrows(BadRequestException.class, () -> refundCalculator.calculateRefund(confirmedBooking, OffsetDateTime.now(IST)));
    }
}
