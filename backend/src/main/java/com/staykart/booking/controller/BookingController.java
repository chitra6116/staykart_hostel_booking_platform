package com.staykart.booking.controller;

import com.staykart.booking.dto.BookingPaymentRequest;
import com.staykart.booking.dto.BookingResponse;
import com.staykart.booking.dto.CreateBookingRequest;
import com.staykart.booking.dto.RefundPreviewResponse;
import com.staykart.booking.service.BookingService;
import com.staykart.common.dto.PagedResponse;
import com.staykart.common.exception.UnauthorizedException;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Room reservations, mock payments, cancellations and PDF invoices")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @Operation(summary = "Hold a room booking in PENDING state awaiting payment")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getCurrentUser(userDetails);
        if (user.getRole() == com.staykart.user.entity.Role.ADMIN) {
            throw new com.staykart.common.exception.ForbiddenException("Admin accounts cannot book rooms. Please use a guest account.");
        }
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, user, ipAddress));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Complete payment for a held booking (UPI, Card, Net Banking)")
    public ResponseEntity<BookingResponse> payForBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getCurrentUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.ok(bookingService.processPayment(id, request, user, ipAddress));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking and process eligible refund")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getCurrentUser(userDetails);
        String reason = body != null ? body.get("reason") : "Guest requested cancellation";
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.ok(bookingService.cancelBooking(id, user, reason, ipAddress));
    }

    @GetMapping("/{id}/refund-preview")
    @Operation(summary = "Get preview of refund percentage and amount before confirming cancellation")
    public ResponseEntity<RefundPreviewResponse> getRefundPreview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getRefundPreview(id, user));
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get paginated bookings of the current guest (filter: upcoming, past, cancelled)")
    public ResponseEntity<PagedResponse<BookingResponse>> getMyBookings(
            @RequestParam(required = false) String filter,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getUserBookings(user, filter, pageable));
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get booking details by booking code")
    public ResponseEntity<BookingResponse> getBookingByCode(
            @PathVariable String code,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getBookingByCode(code, user));
    }

    @GetMapping("/{code}/invoice")
    @Operation(summary = "Download official GST invoice and booking confirmation PDF")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable String code,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getCurrentUser(userDetails);
        byte[] pdfBytes = bookingService.downloadInvoicePdf(code, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"StayKart-Invoice-" + code + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    private User getCurrentUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User session not found"));
    }

    private String resolveIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
