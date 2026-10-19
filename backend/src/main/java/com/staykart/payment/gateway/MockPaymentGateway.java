package com.staykart.payment.gateway;

import com.staykart.payment.entity.PaymentMode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class MockPaymentGateway implements PaymentGateway {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        if (request.simulateFailure()) {
            return new PaymentResult(false, null, "Payment declined by issuing bank (Simulated failure)");
        }

        if (request.paymentMode() == PaymentMode.UPI) {
            if (request.upiId() == null || !request.upiId().contains("@")) {
                return new PaymentResult(false, null, "Invalid UPI VPA format. Must be like username@bank");
            }
            if (request.upiId().toLowerCase().contains("fail")) {
                return new PaymentResult(false, null, "UPI collect request timed out or was rejected by user");
            }
        } else if (request.paymentMode() == PaymentMode.CARD) {
            String sanitizedCard = request.cardNumber() != null ? request.cardNumber().replaceAll("\\s+", "") : "";
            if (sanitizedCard.length() < 12) {
                return new PaymentResult(false, null, "Invalid card number");
            }
            if (sanitizedCard.endsWith("0000")) {
                return new PaymentResult(false, null, "Card payment declined: Insufficient funds");
            }
        } else if (request.paymentMode() == PaymentMode.NET_BANKING) {
            if (request.bankName() == null || request.bankName().isBlank()) {
                return new PaymentResult(false, null, "Please select your bank for Net Banking");
            }
        }

        String datePrefix = LocalDate.now().format(DATE_FORMATTER);
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String txnId = "TXN-SK-" + datePrefix + "-" + randomSuffix;

        return new PaymentResult(true, txnId, "Payment processed successfully via " + request.paymentMode());
    }

    @Override
    public PaymentResult processRefund(String originalTransactionId, BigDecimal refundAmount) {
        String datePrefix = LocalDate.now().format(DATE_FORMATTER);
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String refundTxnId = "REF-SK-" + datePrefix + "-" + randomSuffix;

        return new PaymentResult(true, refundTxnId, "Refund of ₹" + refundAmount + " processed back to original source");
    }
}
