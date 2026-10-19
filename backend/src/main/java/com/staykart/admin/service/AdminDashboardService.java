package com.staykart.admin.service;

import com.staykart.admin.dto.AdminDashboardResponse;
import com.staykart.admin.dto.CityRevenueStat;
import com.staykart.admin.dto.DailyOccupancyStat;
import com.staykart.admin.dto.DailyRevenueStat;
import com.staykart.booking.entity.Booking;
import com.staykart.booking.entity.BookingStatus;
import com.staykart.booking.repository.BookingRepository;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class AdminDashboardService {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public AdminDashboardService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        LocalDate today = LocalDate.now(IST_ZONE);
        List<Booking> allBookings = bookingRepository.findAll();
        List<Room> activeRooms = roomRepository.findAllActiveWithDetails();
        int totalActiveRooms = activeRooms.size();

        // 1. Total & Today Revenue
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal revenueToday = BigDecimal.ZERO;
        long bookingsToday = 0;
        long checkInsToday = 0;
        long checkOutsToday = 0;
        Set<Long> occupiedRoomIdsToday = new HashSet<>();

        Map<String, BigDecimal> cityRevenueMap = new HashMap<>();
        Map<String, Integer> cityBookingsCountMap = new HashMap<>();

        for (Booking b : allBookings) {
            boolean isRevenueEligible = (b.getStatus() == BookingStatus.CONFIRMED ||
                                         b.getStatus() == BookingStatus.CHECKED_IN ||
                                         b.getStatus() == BookingStatus.CHECKED_OUT);

            if (isRevenueEligible) {
                totalRevenue = totalRevenue.add(b.getTotalAmountInr());

                String city = b.getRoom().getProperty().getCity();
                cityRevenueMap.put(city, cityRevenueMap.getOrDefault(city, BigDecimal.ZERO).add(b.getTotalAmountInr()));
                cityBookingsCountMap.put(city, cityBookingsCountMap.getOrDefault(city, 0) + 1);
            }

            LocalDate createdDate = b.getCreatedAt().atZoneSameInstant(IST_ZONE).toLocalDate();
            if (createdDate.equals(today)) {
                bookingsToday++;
                if (isRevenueEligible) {
                    revenueToday = revenueToday.add(b.getTotalAmountInr());
                }
            }

            if (b.getCheckIn().equals(today) && (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN)) {
                checkInsToday++;
            }

            if (b.getCheckOut().equals(today) && b.getStatus() == BookingStatus.CHECKED_IN) {
                checkOutsToday++;
            }

            // Occupancy today: checkIn <= today < checkOut
            if (!today.isBefore(b.getCheckIn()) && today.isBefore(b.getCheckOut()) &&
                (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN)) {
                occupiedRoomIdsToday.add(b.getRoom().getId());
            }
        }

        BigDecimal currentOccupancyRate = BigDecimal.ZERO;
        if (totalActiveRooms > 0) {
            currentOccupancyRate = BigDecimal.valueOf(occupiedRoomIdsToday.size())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalActiveRooms), 1, RoundingMode.HALF_UP);
        }

        // 2. Last 30 Days Trends
        List<DailyRevenueStat> revenueLast30Days = new ArrayList<>();
        List<DailyOccupancyStat> occupancyLast30Days = new ArrayList<>();

        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            BigDecimal dayRevenue = BigDecimal.ZERO;
            int dayBookings = 0;
            Set<Long> occupiedRoomIdsOnDate = new HashSet<>();

            for (Booking b : allBookings) {
                LocalDate createdDate = b.getCreatedAt().atZoneSameInstant(IST_ZONE).toLocalDate();
                if (createdDate.equals(d) && (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT)) {
                    dayRevenue = dayRevenue.add(b.getTotalAmountInr());
                    dayBookings++;
                }

                if (!d.isBefore(b.getCheckIn()) && d.isBefore(b.getCheckOut()) &&
                    (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT)) {
                    occupiedRoomIdsOnDate.add(b.getRoom().getId());
                }
            }

            revenueLast30Days.add(new DailyRevenueStat(d, dayRevenue.setScale(2, RoundingMode.HALF_UP), dayBookings));

            BigDecimal dayOccupancy = BigDecimal.ZERO;
            if (totalActiveRooms > 0) {
                dayOccupancy = BigDecimal.valueOf(occupiedRoomIdsOnDate.size())
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalActiveRooms), 1, RoundingMode.HALF_UP);
            }
            occupancyLast30Days.add(new DailyOccupancyStat(d, dayOccupancy, occupiedRoomIdsOnDate.size(), totalActiveRooms));
        }

        // 3. City-wise Revenue
        List<CityRevenueStat> cityStats = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : cityRevenueMap.entrySet()) {
            cityStats.add(new CityRevenueStat(
                entry.getKey(),
                entry.getValue().setScale(2, RoundingMode.HALF_UP),
                cityBookingsCountMap.getOrDefault(entry.getKey(), 0)
            ));
        }
        cityStats.sort(Comparator.comparing(CityRevenueStat::revenueInr).reversed());

        return new AdminDashboardResponse(
            currentOccupancyRate,
            totalRevenue.setScale(2, RoundingMode.HALF_UP),
            revenueToday.setScale(2, RoundingMode.HALF_UP),
            bookingsToday,
            checkInsToday,
            checkOutsToday,
            totalActiveRooms,
            revenueLast30Days,
            occupancyLast30Days,
            cityStats
        );
    }
}
