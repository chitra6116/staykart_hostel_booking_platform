package com.staykart.booking.service;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.entity.RefundStatus;
import com.staykart.common.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Component
public class RefundCalculator {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");

    public record RefundDetails(
        BigDecimal refundPercentage,
        BigDecimal refundAmountInr,
        RefundStatus refundStatus,
        String refundReason
    ) {}

    public RefundDetails calculateRefund(Booking booking, OffsetDateTime cancellationTime) {
        if (booking.getStatus() == BookingStatus.CHECKED_IN || booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new BadRequestException("Cancellation is not allowed after check-in");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BadRequestException("Booking is already " + booking.getStatus());
        }

        // If booking is PENDING (no payment made yet), 0 refund required
        if (booking.getStatus() == BookingStatus.PENDING) {
            return new RefundDetails(
                BigDecimal.ZERO,
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                RefundStatus.NONE,
                "Cancelled prior to payment confirmation"
            );
        }

        // Determine property check-in time (defaults to 14:00 IST if parsing fails)
        LocalTime checkInTime = LocalTime.of(14, 0);
        try {
            if (booking.getRoom().getProperty().getCheckInTime() != null) {
                checkInTime = LocalTime.parse(booking.getRoom().getProperty().getCheckInTime());
            }
        } catch (Exception ignored) {}

        OffsetDateTime checkInDateTime = booking.getCheckIn()
                .atTime(checkInTime)
                .atZone(IST_ZONE)
                .toOffsetDateTime();

        Duration durationUntilCheckIn = Duration.between(cancellationTime, checkInDateTime);
        long hoursUntilCheckIn = durationUntilCheckIn.toHours();

        BigDecimal totalPaid = booking.getTotalAmountInr();

        if (hoursUntilCheckIn >= 48) {
            // 48+ hours: 100% refund
            return new RefundDetails(
                BigDecimal.valueOf(100).setScale(2, RoundingMode.HALF_UP),
                totalPaid.setScale(2, RoundingMode.HALF_UP),
                RefundStatus.COMPLETED,
                "Cancelled " + hoursUntilCheckIn + " hours before check-in (100% full refund as per policy)"
            );
        } else if (hoursUntilCheckIn >= 24) {
            // 24 to 48 hours: 50% refund
            BigDecimal halfRefund = totalPaid.multiply(BigDecimal.valueOf(0.50)).setScale(2, RoundingMode.HALF_UP);
            return new RefundDetails(
                BigDecimal.valueOf(50).setScale(2, RoundingMode.HALF_UP),
                halfRefund,
                RefundStatus.COMPLETED,
                "Cancelled " + hoursUntilCheckIn + " hours before check-in (50% refund as per policy)"
            );
        } else {
            // Less than 24 hours: 0% refund
            return new RefundDetails(
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                RefundStatus.REJECTED,
                "Cancelled " + Math.max(0, hoursUntilCheckIn) + " hours before check-in (0% refund under 24 hours as per policy)"
            );
        }
    }
}
