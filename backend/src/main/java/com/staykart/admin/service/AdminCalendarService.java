package com.staykart.admin.service;

import com.staykart.admin.dto.CalendarBookingBar;
import com.staykart.admin.dto.CalendarMaintenanceBar;
import com.staykart.admin.dto.CalendarRoomRow;
import com.staykart.admin.dto.OccupancyCalendarResponse;
import com.staykart.booking.entity.Booking;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.room.entity.Room;
import com.staykart.room.entity.RoomMaintenance;
import com.staykart.room.repository.RoomMaintenanceRepository;
import com.staykart.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class AdminCalendarService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RoomMaintenanceRepository maintenanceRepository;

    public AdminCalendarService(
            RoomRepository roomRepository,
            BookingRepository bookingRepository,
            RoomMaintenanceRepository maintenanceRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @Transactional(readOnly = true)
    public OccupancyCalendarResponse getCalendarData(LocalDate startDate, LocalDate endDate, String city, Long roomTypeId) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = (endDate != null) ? endDate : start.plusMonths(1);

        List<Room> allRooms = roomRepository.findAllActiveWithDetails();

        Stream<Room> stream = allRooms.stream();
        if (city != null && !city.isBlank()) {
            stream = stream.filter(r -> r.getProperty().getCity().equalsIgnoreCase(city.trim()));
        }
        if (roomTypeId != null) {
            stream = stream.filter(r -> r.getRoomType().getId().equals(roomTypeId));
        }

        List<Room> filteredRooms = stream.toList();
        List<CalendarRoomRow> rows = new ArrayList<>();

        for (Room room : filteredRooms) {
            List<Booking> overlappingBookings = bookingRepository.findOverlappingActiveBookings(room.getId(), start, end);
            List<CalendarBookingBar> bookingBars = overlappingBookings.stream().map(b -> new CalendarBookingBar(
                b.getId(),
                b.getBookingCode(),
                b.getCheckIn(),
                b.getCheckOut(),
                b.getStatus(),
                b.getGuestName(),
                b.getGuestPhone(),
                b.getTotalAmountInr()
            )).toList();

            List<RoomMaintenance> overlappingMaintenance = maintenanceRepository.findOverlappingMaintenance(room.getId(), start, end);
            List<CalendarMaintenanceBar> maintenanceBars = overlappingMaintenance.stream().map(m -> new CalendarMaintenanceBar(
                m.getId(),
                m.getStartDate(),
                m.getEndDate(),
                m.getReason()
            )).toList();

            rows.add(new CalendarRoomRow(
                room.getId(),
                room.getRoomNumber(),
                room.getFloor(),
                room.getRoomType().getId(),
                room.getRoomType().getName(),
                room.getProperty().getId(),
                room.getProperty().getName(),
                room.getProperty().getCity(),
                bookingBars,
                maintenanceBars
            ));
        }

        return new OccupancyCalendarResponse(start, end, rows);
    }
}
