package com.staykart.room.controller;

import com.staykart.room.dto.RoomDetailDto;
import com.staykart.room.dto.RoomSearchFilter;
import com.staykart.room.dto.RoomSearchResultDto;
import com.staykart.room.service.RoomAvailabilityService;
import com.staykart.room.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Room search, availability filtering and detailed room view")
public class RoomController {

    private final RoomService roomService;
    private final RoomAvailabilityService availabilityService;

    public RoomController(RoomService roomService, RoomAvailabilityService availabilityService) {
        this.roomService = roomService;
        this.availabilityService = availabilityService;
    }

    @GetMapping("/search")
    @Operation(summary = "Search available rooms with filters (city, dates, guests, price slider, amenities)")
    public ResponseEntity<List<RoomSearchResultDto>> searchRooms(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false, defaultValue = "1") Integer guests,
            @RequestParam(required = false) Long roomTypeId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<Long> amenityIds,
            @RequestParam(required = false, defaultValue = "price_asc") String sortBy) {

        RoomSearchFilter filter = new RoomSearchFilter(
            city, checkIn, checkOut, guests, roomTypeId, minPrice, maxPrice, amenityIds, sortBy
        );
        return ResponseEntity.ok(roomService.searchRooms(filter));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed room view with gallery, amenities, house rules and disabled dates")
    public ResponseEntity<RoomDetailDto> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/{id}/disabled-dates")
    @Operation(summary = "Get unavailable date ranges for calendar picker")
    public ResponseEntity<List<LocalDate>> getDisabledDates(@PathVariable Long id) {
        return ResponseEntity.ok(availabilityService.getUnavailableDates(id));
    }
}
