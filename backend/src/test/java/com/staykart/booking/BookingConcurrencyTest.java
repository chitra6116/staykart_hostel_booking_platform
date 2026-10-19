package com.staykart.booking;

import com.staykart.booking.dto.BookingResponse;
import com.staykart.booking.dto.CreateBookingRequest;
import com.staykart.booking.entity.IdProofType;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.booking.service.BookingService;
import com.staykart.common.exception.ConflictException;
import com.staykart.property.entity.Property;
import com.staykart.room.entity.Room;
import com.staykart.room.entity.RoomType;
import com.staykart.room.repository.RoomRepository;
import com.staykart.room.service.RoomAvailabilityService;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingConcurrencyTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomAvailabilityService availabilityService;

    @Mock
    private com.staykart.pricing.service.PricingService pricingService;

    @Mock
    private com.staykart.image.repository.ImageRepository imageRepository;

    @Mock
    private com.staykart.common.audit.AuditService auditService;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).email("guest@staykart.in").role(Role.GUEST).build();
        Property property = Property.builder().id(1L).name("Jaipur Haveli").city("Jaipur").active(true).build();
        RoomType roomType = RoomType.builder().id(1L).name("Deluxe").maxGuests(2).basePriceInr(BigDecimal.valueOf(2000.00)).build();
        testRoom = Room.builder().id(10L).property(property).roomType(roomType).active(true).build();
    }

    @Test
    void shouldAllowOnlyOneSuccessfulBookingWhenTwentyThreadsAttemptSimultaneously() throws Exception {
        int numberOfThreads = 20;
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        LocalDate checkIn = LocalDate.now().plusWeeks(1);
        LocalDate checkOut = checkIn.plusDays(3);

        when(roomRepository.findByIdWithLock(eq(10L))).thenReturn(Optional.of(testRoom));

        com.staykart.pricing.dto.PriceBreakdownResponse quote = new com.staykart.pricing.dto.PriceBreakdownResponse(
            10L, "Jaipur Haveli", "Deluxe", checkIn, checkOut, 3, 2,
            BigDecimal.valueOf(6000.00), BigDecimal.ZERO, BigDecimal.valueOf(6000.00),
            BigDecimal.valueOf(150.00), BigDecimal.valueOf(150.00), BigDecimal.valueOf(6300.00),
            java.util.Collections.emptyList()
        );
        when(pricingService.calculatePriceForRoom(any(), any(), any(), anyInt())).thenReturn(quote);

        // Atomic booking slot tracker: only first thread sees room available
        AtomicBoolean slotAcquired = new AtomicBoolean(false);
        when(availabilityService.isRoomAvailable(eq(10L), eq(checkIn), eq(checkOut))).thenAnswer(invocation -> {
            // First thread succeeds in claiming slot; all concurrent subsequent threads fail
            return slotAcquired.compareAndSet(false, true);
        });

        when(bookingRepository.save(any())).thenAnswer(invocation -> {
            com.staykart.booking.entity.Booking b = invocation.getArgument(0);
            b.setId(ThreadLocalRandom.current().nextLong(100, 9999));
            return b;
        });

        for (int i = 0; i < numberOfThreads; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // Wait for all threads to align
                    CreateBookingRequest request = new CreateBookingRequest(
                        10L, checkIn, checkOut, 2,
                        "Guest " + index, "guest" + index + "@test.in", "+919876543210",
                        IdProofType.AADHAAR, "1234", "Late arrival", "IDEMP-" + index
                    );
                    BookingResponse resp = bookingService.createBooking(request, testUser, "127.0.0.1");
                    if (resp != null) {
                        successCount.incrementAndGet();
                    }
                } catch (ConflictException ce) {
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // unexpected error
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // Trigger all 20 threads simultaneously
        boolean completed = doneLatch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(true, completed);
        assertEquals(1, successCount.get(), "Exactly one thread must succeed");
        assertEquals(19, conflictCount.get(), "Exactly 19 threads must receive ConflictException");
    }
}
