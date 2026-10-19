package com.staykart.admin.controller;

import com.staykart.admin.dto.OccupancyCalendarResponse;
import com.staykart.admin.service.AdminCalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/calendar")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Calendar", description = "Interactive room occupancy and booking grid")
public class AdminCalendarController {

    private final AdminCalendarService calendarService;

    public AdminCalendarController(AdminCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping
    @Operation(summary = "Get occupancy grid matrix with status-colored bars")
    public ResponseEntity<OccupancyCalendarResponse> getCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long roomTypeId) {
        return ResponseEntity.ok(calendarService.getCalendarData(startDate, endDate, city, roomTypeId));
    }
}
