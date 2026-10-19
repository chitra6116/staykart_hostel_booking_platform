package com.staykart.booking.service;

import com.staykart.booking.dto.BookingPaymentRequest;
import com.staykart.booking.dto.BookingResponse;
import com.staykart.booking.dto.CreateBookingRequest;
import com.staykart.booking.dto.RefundPreviewResponse;
import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.common.audit.AuditService;
import com.staykart.common.dto.PagedResponse;
import com.staykart.common.exception.ConflictException;
import com.staykart.common.exception.ForbiddenException;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.repository.ImageRepository;
import com.staykart.payment.entity.Payment;
import com.staykart.payment.entity.PaymentStatus;
import com.staykart.payment.gateway.PaymentGateway;
import com.staykart.payment.gateway.PaymentRequest;
import com.staykart.payment.gateway.PaymentResult;
import com.staykart.payment.repository.PaymentRepository;
import com.staykart.pricing.dto.PriceBreakdownResponse;
import com.staykart.pricing.service.PricingService;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import com.staykart.room.service.RoomAvailabilityService;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final PaymentRepository paymentRepository;
    private final ImageRepository imageRepository;
    private final RoomAvailabilityService availabilityService;
    private final PricingService pricingService;
    private final BookingStateMachine stateMachine;
    private final RefundCalculator refundCalculator;
    private final PaymentGateway paymentGateway;
    private final InvoicePdfGenerator invoicePdfGenerator;
    private final AuditService auditService;

    private final SecureRandom secureRandom = new SecureRandom();

    public BookingService(
            BookingRepository bookingRepository,
            RoomRepository roomRepository,
            PaymentRepository paymentRepository,
            ImageRepository imageRepository,
            RoomAvailabilityService availabilityService,
            PricingService pricingService,
            BookingStateMachine stateMachine,
            RefundCalculator refundCalculator,
            PaymentGateway paymentGateway,
            InvoicePdfGenerator invoicePdfGenerator,
            AuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.paymentRepository = paymentRepository;
        this.imageRepository = imageRepository;
        this.availabilityService = availabilityService;
        this.pricingService = pricingService;
        this.stateMachine = stateMachine;
        this.refundCalculator = refundCalculator;
        this.paymentGateway = paymentGateway;
        this.invoicePdfGenerator = invoicePdfGenerator;
        this.auditService = auditService;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, User currentUser, String ipAddress) {
        // 1. Idempotency Key check: prevents duplicate booking creation
        if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
            Optional<Booking> existing = bookingRepository.findByIdempotencyKey(request.idempotencyKey());
            if (existing.isPresent()) {
                return toResponse(existing.get());
            }
        }

        // 2. Concurrency control: acquire pessimistic write lock on Room row
        Room room = roomRepository.findByIdWithLock(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.roomId()));

        if (!room.isActive() || !room.getProperty().isActive()) {
            throw new ConflictException("This room is currently not available for reservation");
        }

        // 3. Check date availability (check-in inclusive, check-out exclusive)
        if (!availabilityService.isRoomAvailable(room.getId(), request.checkIn(), request.checkOut())) {
            throw new ConflictException("Selected dates are not available for this room");
        }

        // 4. Server-side price calculation (never trust client amounts)
        PriceBreakdownResponse quote = pricingService.calculatePriceForRoom(
                room, request.checkIn(), request.checkOut(), request.guestsCount()
        );

        // 5. Generate human-readable Indian booking code (e.g. SK-2026-104928)
        String bookingCode = generateUniqueBookingCode();

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime deadline = now.plusMinutes(10);

        Booking booking = Booking.builder()
                .bookingCode(bookingCode)
                .user(currentUser)
                .room(room)
                .checkIn(request.checkIn())
                .checkOut(request.checkOut())
                .guestsCount(request.guestsCount())
                .status(BookingStatus.PENDING)
                .totalBaseInr(quote.totalBaseInr())
                .totalDiscountInr(quote.totalDiscountInr())
                .taxableAmountInr(quote.taxableAmountInr())
                .cgstInr(quote.cgstInr())
                .sgstInr(quote.sgstInr())
                .totalAmountInr(quote.totalAmountInr())
                .guestName(request.guestName().trim())
                .guestEmail(request.guestEmail().trim().toLowerCase())
                .guestPhone(request.guestPhone().trim())
                .guestIdType(request.guestIdType())
                .guestIdLast4(request.guestIdLast4().trim())
                .specialRequests(request.specialRequests())
                .idempotencyKey(request.idempotencyKey())
                .paymentDeadline(deadline)
                .build();

        booking = bookingRepository.save(booking);

        auditService.record(currentUser, "BOOKING_CREATED", "Booking", booking.getId(),
                "Booking held in PENDING state. Code: " + bookingCode, ipAddress);

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse processPayment(Long bookingId, BookingPaymentRequest request, User currentUser, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateOwnership(booking, currentUser);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Booking is already " + booking.getStatus());
        }

        if (OffsetDateTime.now().isAfter(booking.getPaymentDeadline())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            throw new ConflictException("Booking hold expired after 10 minutes. Please search and book again.");
        }

        PaymentRequest pRequest = new PaymentRequest(
            booking.getId(),
            booking.getTotalAmountInr(),
            request.paymentMode(),
            request.upiId(),
            request.cardNumber(),
            request.cardExpiry(),
            request.cardCvv(),
            request.bankName(),
            request.simulateFailure()
        );

        PaymentResult pResult = paymentGateway.processPayment(pRequest);

        if (!pResult.success()) {
            Payment failedPayment = Payment.builder()
                    .booking(booking)
                    .amountInr(booking.getTotalAmountInr())
                    .paymentMode(request.paymentMode())
                    .transactionId("FAILED-" + System.currentTimeMillis())
                    .status(PaymentStatus.FAILED)
                    .errorMessage(pResult.message())
                    .build();
            paymentRepository.save(failedPayment);
            throw new ConflictException(pResult.message());
        }

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.CONFIRMED);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);

        String cardLast4 = null;
        if (request.cardNumber() != null && request.cardNumber().length() >= 4) {
            String sanitized = request.cardNumber().replaceAll("\\s+", "");
            cardLast4 = sanitized.substring(sanitized.length() - 4);
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amountInr(booking.getTotalAmountInr())
                .paymentMode(request.paymentMode())
                .transactionId(pResult.transactionId())
                .status(PaymentStatus.SUCCESS)
                .upiId(request.upiId())
                .cardLast4(cardLast4)
                .bankName(request.bankName())
                .build();
        paymentRepository.save(payment);

        auditService.record(currentUser, "BOOKING_CONFIRMED", "Booking", booking.getId(),
                "Payment confirmed via " + request.paymentMode() + ". Txn: " + pResult.transactionId(), ipAddress);

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, User currentUser, String reason, String ipAddress) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateOwnership(booking, currentUser);

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.CANCELLED);

        RefundCalculator.RefundDetails refund = refundCalculator.calculateRefund(booking, OffsetDateTime.now());

        if (refund.refundAmountInr().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Optional<Payment> latestPayment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(booking.getId());
            if (latestPayment.isPresent()) {
                paymentGateway.processRefund(latestPayment.get().getTransactionId(), refund.refundAmountInr());
                latestPayment.get().setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(latestPayment.get());
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRefundAmountInr(refund.refundAmountInr());
        booking.setRefundStatus(refund.refundStatus());
        booking.setRefundReason(reason != null && !reason.isBlank() ? reason : refund.refundReason());
        booking.setCancelledAt(OffsetDateTime.now());
        booking = bookingRepository.save(booking);

        auditService.record(currentUser, "BOOKING_CANCELLED", "Booking", booking.getId(),
                "Booking cancelled. Refund: ₹" + refund.refundAmountInr() + " (" + refund.refundStatus() + ")", ipAddress);

        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public RefundPreviewResponse getRefundPreview(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        validateOwnership(booking, currentUser);

        RefundCalculator.RefundDetails refund = refundCalculator.calculateRefund(booking, OffsetDateTime.now());
        return new RefundPreviewResponse(
            booking.getBookingCode(),
            booking.getTotalAmountInr(),
            refund.refundPercentage(),
            refund.refundAmountInr(),
            refund.refundStatus(),
            refund.refundReason()
        );
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode, User currentUser) {
        Booking booking = bookingRepository.findByBookingCodeWithDetails(bookingCode)
                .or(() -> bookingRepository.findByBookingCode(bookingCode))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingCode));
        validateOwnership(booking, currentUser);
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BookingResponse> getUserBookings(User currentUser, String filter, Pageable pageable) {
        Page<Booking> page;
        if ("upcoming".equalsIgnoreCase(filter)) {
            page = bookingRepository.findByUserIdAndStatusInWithDetails(
                currentUser.getId(),
                List.of(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.PENDING),
                pageable
            );
        } else if ("cancelled".equalsIgnoreCase(filter)) {
            page = bookingRepository.findByUserIdAndStatusInWithDetails(
                currentUser.getId(),
                List.of(BookingStatus.CANCELLED, BookingStatus.EXPIRED),
                pageable
            );
        } else if ("past".equalsIgnoreCase(filter)) {
            page = bookingRepository.findByUserIdAndStatusInWithDetails(
                currentUser.getId(),
                List.of(BookingStatus.CHECKED_OUT),
                pageable
            );
        } else {
            page = bookingRepository.findByUserIdWithDetails(currentUser.getId(), pageable);
        }
        return PagedResponse.from(page.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public byte[] downloadInvoicePdf(String bookingCode, User currentUser) {
        Booking booking = bookingRepository.findByBookingCodeWithDetails(bookingCode)
                .or(() -> bookingRepository.findByBookingCode(bookingCode))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingCode));
        validateOwnership(booking, currentUser);

        Payment payment = paymentRepository.findFirstByBookingIdOrderByCreatedAtDesc(booking.getId()).orElse(null);
        return invoicePdfGenerator.generateInvoice(booking, payment);
    }

    private void validateOwnership(Booking booking, User currentUser) {
        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You are not authorized to view or modify this booking");
        }
    }

    private String generateUniqueBookingCode() {
        int year = LocalDate.now().getYear();
        for (int i = 0; i < 10; i++) {
            int randomNum = 100000 + secureRandom.nextInt(900000);
            String code = "SK-" + year + "-" + randomNum;
            if (bookingRepository.findByBookingCode(code).isEmpty()) {
                return code;
            }
        }
        return "SK-" + year + "-" + System.currentTimeMillis() % 1000000;
    }

    private BookingResponse toResponse(Booking b) {
        String coverUrl = imageRepository.findCoverByRoomId(b.getRoom().getId())
                .map(i -> "/media/" + i.getCardPath())
                .orElseGet(() -> imageRepository.findCoverByPropertyId(b.getRoom().getProperty().getId())
                        .map(i -> "/media/" + i.getCardPath())
                        .orElse("/images/hero/hero-banner.webp"));
        return BookingResponse.from(b, coverUrl);
    }
}
