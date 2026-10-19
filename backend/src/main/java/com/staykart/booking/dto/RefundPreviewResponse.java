package com.staykart.booking.dto;

import com.staykart.booking.entity.RefundStatus;

import java.math.BigDecimal;

public record RefundPreviewResponse(
    String bookingCode,
    BigDecimal totalPaidInr,
    BigDecimal refundPercentage,
    BigDecimal refundAmountInr,
    RefundStatus refundStatus,
    String refundReason
) {}
