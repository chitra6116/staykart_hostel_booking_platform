package com.staykart.room.service;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.amenity.entity.Amenity;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.dto.ImageResponse;
import com.staykart.image.repository.ImageRepository;
import com.staykart.pricing.dto.PriceBreakdownResponse;
import com.staykart.pricing.service.PricingService;
import com.staykart.room.dto.RoomDetailDto;
import com.staykart.room.dto.RoomSearchFilter;
import com.staykart.room.dto.RoomSearchResultDto;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ImageRepository imageRepository;
    private final RoomAvailabilityService availabilityService;
    private final PricingService pricingService;

    public RoomService(
            RoomRepository roomRepository,
            ImageRepository imageRepository,
            RoomAvailabilityService availabilityService,
            PricingService pricingService) {
        this.roomRepository = roomRepository;
        this.imageRepository = imageRepository;
        this.availabilityService = availabilityService;
        this.pricingService = pricingService;
    }

    @Transactional(readOnly = true)
    public List<RoomSearchResultDto> searchRooms(RoomSearchFilter filter) {
        List<Room> allRooms = roomRepository.findAllActiveWithDetails();

        Stream<Room> stream = allRooms.stream();

        // Filter by City
        if (filter.city() != null && !filter.city().isBlank()) {
            String cityNormalized = filter.city().trim().toLowerCase();
            stream = stream.filter(r -> r.getProperty().getCity().toLowerCase().contains(cityNormalized));
        }

        // Filter by Room Type
        if (filter.roomTypeId() != null) {
            stream = stream.filter(r -> r.getRoomType().getId().equals(filter.roomTypeId()));
        }

        // Filter by Capacity
        int guestCount = (filter.guests() != null && filter.guests() > 0) ? filter.guests() : 1;
        stream = stream.filter(r -> r.getRoomType().getMaxGuests() >= guestCount);

        // Filter by Availability on Dates
        boolean hasDates = (filter.checkIn() != null && filter.checkOut() != null);
        if (hasDates) {
            stream = stream.filter(r -> availabilityService.isRoomAvailable(r.getId(), filter.checkIn(), filter.checkOut()));
        }

        // Filter by Amenities
        if (filter.amenityIds() != null && !filter.amenityIds().isEmpty()) {
            Set<Long> reqAmenities = new HashSet<>(filter.amenityIds());
            stream = stream.filter(r -> {
                Set<Long> availableIds = Stream.concat(
                    r.getAmenities().stream().map(Amenity::getId),
                    r.getProperty().getAmenities().stream().map(Amenity::getId)
                ).collect(Collectors.toSet());
                return availableIds.containsAll(reqAmenities);
            });
        }

        List<Room> filteredRooms = stream.toList();

        // Map and compute live pricing if dates given
        List<RoomSearchResultDto> results = new ArrayList<>();
        for (Room r : filteredRooms) {
            BigDecimal pricePerNight = r.getRoomType().getBasePriceInr();
            BigDecimal totalPrice = null;

            if (hasDates) {
                try {
                    PriceBreakdownResponse quote = pricingService.calculatePriceForRoom(
                        r, filter.checkIn(), filter.checkOut(), guestCount
                    );
                    totalPrice = quote.totalAmountInr();
                    if (quote.nightsCount() > 0) {
                        pricePerNight = quote.taxableAmountInr()
                                .divide(BigDecimal.valueOf(quote.nightsCount()), 2, RoundingMode.HALF_UP);
                    }
                } catch (Exception ignored) {
                    // Fallback to base price if date logic rejects
                }
            }

            // Price filter check
            if (filter.minPrice() != null && pricePerNight.compareTo(filter.minPrice()) < 0) {
                continue;
            }
            if (filter.maxPrice() != null && pricePerNight.compareTo(filter.maxPrice()) > 0) {
                continue;
            }

            String coverUrl = getCoverImageUrl(r);
            List<AmenityDto> amenities = Stream.concat(
                r.getAmenities().stream(),
                r.getProperty().getAmenities().stream()
            ).distinct().map(AmenityDto::from).toList();

            results.add(new RoomSearchResultDto(
                r.getId(),
                r.getProperty().getId(),
                r.getProperty().getName(),
                r.getProperty().getSlug(),
                r.getProperty().getCity(),
                r.getProperty().getState(),
                r.getProperty().getAddressLine(),
                r.getRoomNumber(),
                r.getFloor(),
                r.getRoomType().getId(),
                r.getRoomType().getName(),
                r.getRoomType().getDescription(),
                r.getRoomType().getMaxGuests(),
                r.getRoomType().getBasePriceInr(),
                pricePerNight,
                totalPrice,
                coverUrl,
                amenities
            ));
        }

        // Sorting
        if ("price_asc".equalsIgnoreCase(filter.sortBy())) {
            results.sort(Comparator.comparing(RoomSearchResultDto::pricePerNightInr));
        } else if ("price_desc".equalsIgnoreCase(filter.sortBy())) {
            results.sort(Comparator.comparing(RoomSearchResultDto::pricePerNightInr).reversed());
        }

        return results;
    }

    @Transactional(readOnly = true)
    public RoomDetailDto getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        String coverUrl = getCoverImageUrl(room);

        // Fetch room photos + property photos for rich gallery
        List<ImageResponse> images = imageRepository.findByRoomIdOrderBySortOrderAsc(room.getId()).stream()
                .map(ImageResponse::from).toList();

        if (images.isEmpty()) {
            images = imageRepository.findByPropertyIdOrderBySortOrderAsc(room.getProperty().getId()).stream()
                    .map(ImageResponse::from).toList();
        }

        List<AmenityDto> amenities = Stream.concat(
            room.getAmenities().stream(),
            room.getProperty().getAmenities().stream()
        ).distinct().map(AmenityDto::from).toList();

        List<LocalDate> disabledDates = availabilityService.getUnavailableDates(room.getId());

        return new RoomDetailDto(
            room.getId(),
            room.getProperty().getId(),
            room.getProperty().getName(),
            room.getProperty().getSlug(),
            room.getProperty().getDescription(),
            room.getProperty().getAddressLine(),
            room.getProperty().getCity(),
            room.getProperty().getState(),
            room.getProperty().getPincode(),
            room.getProperty().getCheckInTime(),
            room.getProperty().getCheckOutTime(),
            room.getProperty().getHouseRules(),
            room.getRoomNumber(),
            room.getFloor(),
            room.getRoomType().getId(),
            room.getRoomType().getName(),
            room.getRoomType().getDescription(),
            room.getRoomType().getMaxGuests(),
            room.getRoomType().getBasePriceInr(),
            coverUrl,
            images,
            amenities,
            disabledDates
        );
    }

    private String getCoverImageUrl(Room room) {
        return imageRepository.findCoverByRoomId(room.getId())
                .map(i -> "/media/" + i.getCardPath())
                .orElseGet(() -> imageRepository.findCoverByPropertyId(room.getProperty().getId())
                        .map(i -> "/media/" + i.getCardPath())
                        .orElse("/images/hero/hero-banner.webp"));
    }
}
