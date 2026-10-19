package com.staykart.room;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.room.entity.RoomMaintenance;
import com.staykart.room.repository.RoomMaintenanceRepository;
import com.staykart.room.service.RoomAvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomAvailabilityServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomMaintenanceRepository maintenanceRepository;

    private RoomAvailabilityService availabilityService;

    @BeforeEach
    void setUp() {
        availabilityService = new RoomAvailabilityService(bookingRepository, maintenanceRepository);
    }

    @Test
    void shouldBeAvailableWhenNoBookingsOrMaintenance() {
        LocalDate checkIn = LocalDate.of(2026, 11, 10);
        LocalDate checkOut = LocalDate.of(2026, 11, 15);

        when(bookingRepository.findOverlappingActiveBookings(1L, checkIn, checkOut)).thenReturn(Collections.emptyList());
        when(maintenanceRepository.findOverlappingMaintenance(1L, checkIn, checkOut)).thenReturn(Collections.emptyList());

        assertTrue(availabilityService.isRoomAvailable(1L, checkIn, checkOut));
    }

    @Test
    void shouldNotBeAvailableWhenOverlappingBookingExists() {
        LocalDate checkIn = LocalDate.of(2026, 11, 10);
        LocalDate checkOut = LocalDate.of(2026, 11, 15);

        Booking booking = Booking.builder().id(99L).status(BookingStatus.CONFIRMED).checkIn(checkIn).checkOut(checkOut).build();
        when(bookingRepository.findOverlappingActiveBookings(1L, checkIn, checkOut)).thenReturn(List.of(booking));

        assertFalse(availabilityService.isRoomAvailable(1L, checkIn, checkOut));
    }

    @Test
    void shouldNotBeAvailableWhenMaintenanceBlockExists() {
        LocalDate checkIn = LocalDate.of(2026, 11, 10);
        LocalDate checkOut = LocalDate.of(2026, 11, 15);

        RoomMaintenance maintenance = RoomMaintenance.builder().id(5L).startDate(checkIn).endDate(checkOut).build();
        when(bookingRepository.findOverlappingActiveBookings(1L, checkIn, checkOut)).thenReturn(Collections.emptyList());
        when(maintenanceRepository.findOverlappingMaintenance(1L, checkIn, checkOut)).thenReturn(List.of(maintenance));

        assertFalse(availabilityService.isRoomAvailable(1L, checkIn, checkOut));
    }
}
