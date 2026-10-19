package com.staykart.booking.dto;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.entity.IdProofType;
import com.staykart.booking.entity.RefundStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record BookingResponse(
    Long id,
    String bookingCode,
    Long roomId,
    String roomNumber,
    String roomTypeName,
    Long propertyId,
    String propertyName,
    String propertyCity,
    String propertyAddress,
    LocalDate checkIn,
    LocalDate checkOut,
    String checkInTime,
    String checkOutTime,
    int guestsCount,
    BookingStatus status,
    BigDecimal totalBaseInr,
    BigDecimal totalDiscountInr,
    BigDecimal taxableAmountInr,
    BigDecimal cgstInr,
    BigDecimal sgstInr,
    BigDecimal totalAmountInr,
    BigDecimal refundAmountInr,
    RefundStatus refundStatus,
    String refundReason,
    String guestName,
    String guestEmail,
    String guestPhone,
    IdProofType guestIdType,
    String guestIdLast4,
    String specialRequests,
    String coverImageUrl,
    OffsetDateTime paymentDeadline,
    OffsetDateTime cancelledAt,
    OffsetDateTime createdAt
) {
    public static BookingResponse from(Booking b, String coverImageUrl) {
        return new BookingResponse(
            b.getId(),
            b.getBookingCode(),
            b.getRoom().getId(),
            b.getRoom().getRoomNumber(),
            b.getRoom().getRoomType().getName(),
            b.getRoom().getProperty().getId(),
            b.getRoom().getProperty().getName(),
            b.getRoom().getProperty().getCity(),
            b.getRoom().getProperty().getAddressLine(),
            b.getCheckIn(),
            b.getCheckOut(),
            b.getRoom().getProperty().getCheckInTime(),
            b.getRoom().getProperty().getCheckOutTime(),
            b.getGuestsCount(),
            b.getStatus(),
            b.getTotalBaseInr(),
            b.getTotalDiscountInr(),
            b.getTaxableAmountInr(),
            b.getCgstInr(),
            b.getSgstInr(),
            b.getTotalAmountInr(),
            b.getRefundAmountInr(),
            b.getRefundStatus(),
            b.getRefundReason(),
            b.getGuestName(),
            b.getGuestEmail(),
            b.getGuestPhone(),
            b.getGuestIdType(),
            b.getGuestIdLast4(),
            b.getSpecialRequests(),
            coverImageUrl,
            b.getPaymentDeadline(),
            b.getCancelledAt(),
            b.getCreatedAt()
        );
    }
}
