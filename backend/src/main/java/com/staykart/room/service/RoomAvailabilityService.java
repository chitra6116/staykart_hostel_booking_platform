package com.staykart.room.service;

import com.staykart.booking.entity.Booking;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.room.entity.RoomMaintenance;
import com.staykart.room.repository.RoomMaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoomAvailabilityService {

    private final BookingRepository bookingRepository;
    private final RoomMaintenanceRepository maintenanceRepository;

    public RoomAvailabilityService(BookingRepository bookingRepository, RoomMaintenanceRepository maintenanceRepository) {
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Transactional(readOnly = true)
    public boolean isRoomAvailable(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        // Date semantics: [checkIn, checkOut) half-open
        List<Booking> overlappingBookings = bookingRepository.findOverlappingActiveBookings(roomId, checkIn, checkOut);
        if (!overlappingBookings.isEmpty()) {
            return false;
        }

        List<RoomMaintenance> overlappingMaintenance = maintenanceRepository.findOverlappingMaintenance(roomId, checkIn, checkOut);
        return overlappingMaintenance.isEmpty();
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getUnavailableDates(Long roomId) {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(180);

        List<Booking> bookings = bookingRepository.findOverlappingActiveBookings(roomId, start, end);
        List<RoomMaintenance> maintenanceList = maintenanceRepository.findOverlappingMaintenance(roomId, start, end);

        Set<LocalDate> disabledDates = new HashSet<>();

        // Booking dates are [checkIn, checkOut)
        for (Booking b : bookings) {
            LocalDate d = b.getCheckIn().isBefore(start) ? start : b.getCheckIn();
            while (d.isBefore(b.getCheckOut()) && d.isBefore(end)) {
                disabledDates.add(d);
                d = d.plusDays(1);
            }
        }

        // Maintenance dates are [startDate, endDate)
        for (RoomMaintenance m : maintenanceList) {
            LocalDate d = m.getStartDate().isBefore(start) ? start : m.getStartDate();
            while (d.isBefore(m.getEndDate()) && d.isBefore(end)) {
                disabledDates.add(d);
                d = d.plusDays(1);
            }
        }

        return disabledDates.stream().sorted().toList();
    }
}
