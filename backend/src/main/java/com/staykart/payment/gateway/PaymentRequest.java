package com.staykart.payment.gateway;

import com.staykart.payment.entity.PaymentMode;

import java.math.BigDecimal;

public record PaymentRequest(
    Long bookingId,
    BigDecimal amountInr,
    PaymentMode paymentMode,
    String upiId,
    String cardNumber,
    String cardExpiry,
    String cardCvv,
    String bankName,
    boolean simulateFailure
) {}
