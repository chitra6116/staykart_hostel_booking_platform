package com.staykart.payment.gateway;

public record PaymentResult(
    boolean success,
    String transactionId,
    String message
) {}
