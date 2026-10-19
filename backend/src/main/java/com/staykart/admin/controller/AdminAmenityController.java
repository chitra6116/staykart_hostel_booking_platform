package com.staykart.admin.controller;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.amenity.entity.Amenity;
import com.staykart.amenity.repository.AmenityRepository;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ResourceNotFoundException;
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

@RestController
@RequestMapping("/api/admin/amenities")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Amenities", description = "Add, edit and delete platform amenities")
public class AdminAmenityController {

    private final AmenityRepository amenityRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminAmenityController(AmenityRepository amenityRepository, UserRepository userRepository, AuditService auditService) {
        this.amenityRepository = amenityRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @PostMapping
    @Operation(summary = "Create a new platform amenity")
    public ResponseEntity<AmenityDto> createAmenity(
            @Valid @RequestBody AmenityDto request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Amenity amenity = Amenity.builder()
                .name(request.name().trim())
                .category(request.category() != null ? request.category().trim() : "General")
                .iconName(request.iconName() != null ? request.iconName().trim() : "sparkles")
                .build();
        amenity = amenityRepository.save(amenity);

        auditService.record(user, "AMENITY_CREATED", "Amenity", amenity.getId(), "Created amenity: " + amenity.getName(), httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(AmenityDto.from(amenity));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing amenity")
    public ResponseEntity<AmenityDto> updateAmenity(
            @PathVariable Long id,
            @Valid @RequestBody AmenityDto request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found: " + id));

        amenity.setName(request.name().trim());
        if (request.category() != null) amenity.setCategory(request.category().trim());
        if (request.iconName() != null) amenity.setIconName(request.iconName().trim());

        amenity = amenityRepository.save(amenity);
        auditService.record(user, "AMENITY_UPDATED", "Amenity", id, "Updated amenity: " + amenity.getName(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(AmenityDto.from(amenity));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an amenity")
    public ResponseEntity<Void> deleteAmenity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Amenity not found: " + id));

        amenityRepository.delete(amenity);
        auditService.record(user, "AMENITY_DELETED", "Amenity", id, "Deleted amenity: " + amenity.getName(), httpRequest.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
