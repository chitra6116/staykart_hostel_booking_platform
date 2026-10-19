package com.staykart.booking.dto;

import com.staykart.payment.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;

public record BookingPaymentRequest(
    @NotNull(message = "Payment mode is required")
    PaymentMode paymentMode,

    String upiId,
    String cardNumber,
    String cardExpiry,
    String cardCvv,
    String bankName,
    boolean simulateFailure
) {}
