package com.staykart.payment.gateway;

import java.math.BigDecimal;

public interface PaymentGateway {

    PaymentResult processPayment(PaymentRequest request);

    PaymentResult processRefund(String originalTransactionId, BigDecimal refundAmount);
}
