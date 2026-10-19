package com.staykart.booking.service;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.common.audit.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class BookingExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryJob.class);

    private final BookingRepository bookingRepository;
    private final BookingStateMachine stateMachine;
    private final AuditService auditService;

    public BookingExpiryJob(
            BookingRepository bookingRepository,
            BookingStateMachine stateMachine,
            AuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.stateMachine = stateMachine;
        this.auditService = auditService;
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expirePendingBookings() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusMinutes(10);
        List<Booking> expiredList = bookingRepository.findExpiredPendingBookings(cutoff);

        if (!expiredList.isEmpty()) {
            log.info("Found {} expired pending bookings exceeding 10-minute hold window", expiredList.size());
            for (Booking booking : expiredList) {
                stateMachine.validateTransition(booking.getStatus(), BookingStatus.EXPIRED);
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);

                auditService.record(
                    booking.getUser(),
                    "BOOKING_EXPIRED",
                    "Booking",
                    booking.getId(),
                    "Pending booking hold expired after 10 minutes without payment",
                    "SYSTEM"
                );
            }
        }
    }
}
