package com.staykart.admin.controller;

import com.staykart.booking.dto.BookingResponse;
import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.booking.service.BookingService;
import com.staykart.booking.service.BookingStateMachine;
import com.staykart.common.audit.AuditService;
import com.staykart.common.dto.PagedResponse;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.repository.ImageRepository;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Bookings", description = "Operational booking management: search, filter, check-in, check-out")
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final BookingStateMachine stateMachine;
    private final ImageRepository imageRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminBookingController(
            BookingRepository bookingRepository,
            BookingService bookingService,
            BookingStateMachine stateMachine,
            ImageRepository imageRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.stateMachine = stateMachine;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "Search and filter all platform bookings with pagination")
    public ResponseEntity<PagedResponse<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) BookingStatus status,
            @PageableDefault(size = 15) Pageable pageable) {

        String term = query == null ? "" : query.trim().toLowerCase();
        java.util.List<BookingStatus> statuses = status == null
                ? java.util.Arrays.asList(BookingStatus.values())
                : java.util.List.of(status);

        Page<Booking> page = bookingRepository.searchForAdmin(term, statuses, pageable);
        return ResponseEntity.ok(PagedResponse.from(page.map(this::toResponse)));
    }

    @PostMapping("/{id}/check-in")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Check in guest on arrival")
    public ResponseEntity<BookingResponse> checkInGuest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Booking booking = bookingRepository.findByIdWithDetails(id)
                .or(() -> bookingRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.CHECKED_IN);
        booking.setStatus(BookingStatus.CHECKED_IN);
        booking = bookingRepository.save(booking);

        auditService.record(user, "GUEST_CHECKED_IN", "Booking", id,
                "Checked in guest: " + booking.getGuestName(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(toResponse(booking));
    }

    @PostMapping("/{id}/check-out")
    @org.springframework.transaction.annotation.Transactional
    @Operation(summary = "Check out guest on departure")
    public ResponseEntity<BookingResponse> checkOutGuest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Booking booking = bookingRepository.findByIdWithDetails(id)
                .or(() -> bookingRepository.findById(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        stateMachine.validateTransition(booking.getStatus(), BookingStatus.CHECKED_OUT);
        booking.setStatus(BookingStatus.CHECKED_OUT);
        booking = bookingRepository.save(booking);

        auditService.record(user, "GUEST_CHECKED_OUT", "Booking", id,
                "Checked out guest: " + booking.getGuestName(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(toResponse(booking));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Admin cancellation with policy refund")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "Admin cancelled";
        return ResponseEntity.ok(bookingService.cancelBooking(id, user, reason, httpRequest.getRemoteAddr()));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
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
