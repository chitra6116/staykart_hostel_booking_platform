package com.staykart.admin.controller;

import com.staykart.admin.dto.BulkBlockRequest;
import com.staykart.admin.dto.MaintenanceBlockRequest;
import com.staykart.admin.dto.RoomCreateRequest;
import com.staykart.amenity.repository.AmenityRepository;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ConflictException;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.room.dto.RoomDetailDto;
import com.staykart.room.entity.Room;
import com.staykart.room.entity.RoomMaintenance;
import com.staykart.room.entity.RoomType;
import com.staykart.room.repository.RoomMaintenanceRepository;
import com.staykart.room.repository.RoomRepository;
import com.staykart.room.repository.RoomTypeRepository;
import com.staykart.room.service.RoomAvailabilityService;
import com.staykart.room.service.RoomService;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/admin/rooms")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Rooms", description = "Room management, maintenance blocks and bulk operations")
public class AdminRoomController {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final RoomMaintenanceRepository maintenanceRepository;
    private final RoomAvailabilityService availabilityService;
    private final RoomService roomService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminRoomController(
            RoomRepository roomRepository,
            PropertyRepository propertyRepository,
            RoomTypeRepository roomTypeRepository,
            AmenityRepository amenityRepository,
            RoomMaintenanceRepository maintenanceRepository,
            RoomAvailabilityService availabilityService,
            RoomService roomService,
            UserRepository userRepository,
            AuditService auditService) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.amenityRepository = amenityRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.availabilityService = availabilityService;
        this.roomService = roomService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @PostMapping
    @Operation(summary = "Create a new room in a property")
    public ResponseEntity<RoomDetailDto> createRoom(
            @Valid @RequestBody RoomCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Property property = propertyRepository.findById(request.propertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + request.propertyId()));
        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room Type not found: " + request.roomTypeId()));

        Room room = Room.builder()
                .property(property)
                .roomType(roomType)
                .roomNumber(request.roomNumber().trim())
                .floor(request.floor() > 0 ? request.floor() : 1)
                .active(true)
                .amenities(new HashSet<>())
                .build();

        if (request.amenityIds() != null && !request.amenityIds().isEmpty()) {
            room.setAmenities(new HashSet<>(amenityRepository.findAllById(request.amenityIds())));
        }

        room = roomRepository.save(room);
        auditService.record(user, "ROOM_CREATED", "Room", room.getId(),
                "Created room #" + room.getRoomNumber() + " at " + property.getName(), httpRequest.getRemoteAddr());

        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.getRoomById(room.getId()));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a room")
    public ResponseEntity<RoomDetailDto> toggleRoomStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));

        room.setActive(!room.isActive());
        room = roomRepository.save(room);

        auditService.record(user, "ROOM_STATUS_TOGGLED", "Room", id,
                "Status set to active=" + room.isActive(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PostMapping("/maintenance")
    @Operation(summary = "Schedule a maintenance block for a room")
    public ResponseEntity<Void> blockRoomForMaintenance(
            @Valid @RequestBody MaintenanceBlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.roomId()));

        if (!availabilityService.isRoomAvailable(room.getId(), request.startDate(), request.endDate())) {
            throw new ConflictException("Cannot schedule maintenance: existing booking or block conflicts with selected dates");
        }

        RoomMaintenance maintenance = RoomMaintenance.builder()
                .room(room)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .reason(request.reason().trim())
                .build();

        maintenanceRepository.save(maintenance);
        auditService.record(user, "MAINTENANCE_BLOCKED", "Room", room.getId(),
                "Blocked dates [" + request.startDate() + " to " + request.endDate() + "]: " + request.reason(), httpRequest.getRemoteAddr());

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/maintenance/{id}")
    @Operation(summary = "Release a scheduled maintenance block")
    public ResponseEntity<Void> releaseMaintenanceBlock(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        RoomMaintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance block not found: " + id));

        maintenanceRepository.delete(m);
        auditService.record(user, "MAINTENANCE_RELEASED", "Room", m.getRoom().getId(),
                "Released maintenance block #" + id, httpRequest.getRemoteAddr());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-block")
    @Operation(summary = "Block multiple rooms simultaneously for maintenance")
    public ResponseEntity<Void> bulkBlockRooms(
            @Valid @RequestBody BulkBlockRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        List<Room> rooms = roomRepository.findAllById(request.roomIds());

        for (Room r : rooms) {
            if (availabilityService.isRoomAvailable(r.getId(), request.startDate(), request.endDate())) {
                RoomMaintenance m = RoomMaintenance.builder()
                        .room(r)
                        .startDate(request.startDate())
                        .endDate(request.endDate())
                        .reason(request.reason().trim())
                        .build();
                maintenanceRepository.save(m);
            }
        }

        auditService.record(user, "BULK_ROOMS_BLOCKED", "Room", null,
                "Bulk blocked " + rooms.size() + " rooms: " + request.reason(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
