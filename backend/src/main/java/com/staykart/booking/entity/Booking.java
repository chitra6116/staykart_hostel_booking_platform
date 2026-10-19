package com.staykart.booking.entity;

import com.staykart.room.entity.Room;
import com.staykart.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(name = "guests_count", nullable = false)
    private Integer guestsCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status;

    @Column(name = "total_base_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalBaseInr;

    @Column(name = "total_discount_inr", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalDiscountInr = BigDecimal.ZERO;

    @Column(name = "taxable_amount_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxableAmountInr;

    @Column(name = "cgst_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal cgstInr;

    @Column(name = "sgst_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal sgstInr;

    @Column(name = "total_amount_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmountInr;

    @Column(name = "refund_amount_inr", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal refundAmountInr = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "refund_status", length = 30)
    private RefundStatus refundStatus;

    @Column(name = "refund_reason", columnDefinition = "TEXT")
    private String refundReason;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(name = "guest_email", nullable = false, length = 150)
    private String guestEmail;

    @Column(name = "guest_phone", nullable = false, length = 20)
    private String guestPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "guest_id_type", nullable = false, length = 50)
    private IdProofType guestIdType;

    @Column(name = "guest_id_last4", nullable = false, length = 4)
    private String guestIdLast4;

    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;

    @Column(name = "idempotency_key", unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "payment_deadline")
    private OffsetDateTime paymentDeadline;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
