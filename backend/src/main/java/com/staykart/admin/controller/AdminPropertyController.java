package com.staykart.admin.controller;

import com.staykart.admin.dto.PropertyCreateRequest;
import com.staykart.amenity.entity.Amenity;
import com.staykart.amenity.repository.AmenityRepository;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.property.dto.PropertyDetailDto;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.property.service.PropertyService;
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
import java.util.Set;

@RestController
@RequestMapping("/api/admin/properties")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Properties", description = "Property CRUD and activation management")
public class AdminPropertyController {

    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;
    private final AmenityRepository amenityRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminPropertyController(
            PropertyRepository propertyRepository,
            PropertyService propertyService,
            AmenityRepository amenityRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
        this.amenityRepository = amenityRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @PostMapping
    @Operation(summary = "Create a new property listing")
    public ResponseEntity<PropertyDetailDto> createProperty(
            @Valid @RequestBody PropertyCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);

        Set<Amenity> amenities = new HashSet<>();
        if (request.amenityIds() != null && !request.amenityIds().isEmpty()) {
            amenities.addAll(amenityRepository.findAllById(request.amenityIds()));
        }

        Property property = Property.builder()
                .name(request.name().trim())
                .slug(request.slug().trim().toLowerCase())
                .description(request.description().trim())
                .addressLine(request.addressLine().trim())
                .city(request.city().trim())
                .state(request.state().trim())
                .pincode(request.pincode().trim())
                .checkInTime(request.checkInTime() != null ? request.checkInTime() : "14:00")
                .checkOutTime(request.checkOutTime() != null ? request.checkOutTime() : "11:00")
                .houseRules(request.houseRules().trim())
                .active(true)
                .amenities(amenities)
                .build();

        property = propertyRepository.save(property);
        auditService.record(user, "PROPERTY_CREATED", "Property", property.getId(), "Created property: " + property.getName(), httpRequest.getRemoteAddr());

        return ResponseEntity.status(HttpStatus.CREATED).body(propertyService.getPropertyById(property.getId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update property details and amenities")
    public ResponseEntity<PropertyDetailDto> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody PropertyCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + id));

        property.setName(request.name().trim());
        property.setSlug(request.slug().trim().toLowerCase());
        property.setDescription(request.description().trim());
        property.setAddressLine(request.addressLine().trim());
        property.setCity(request.city().trim());
        property.setState(request.state().trim());
        property.setPincode(request.pincode().trim());
        if (request.checkInTime() != null) property.setCheckInTime(request.checkInTime());
        if (request.checkOutTime() != null) property.setCheckOutTime(request.checkOutTime());
        property.setHouseRules(request.houseRules().trim());

        if (request.amenityIds() != null) {
            property.setAmenities(new HashSet<>(amenityRepository.findAllById(request.amenityIds())));
        }

        property = propertyRepository.save(property);
        auditService.record(user, "PROPERTY_UPDATED", "Property", id, "Updated property: " + property.getName(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Activate or deactivate a property listing")
    public ResponseEntity<PropertyDetailDto> togglePropertyStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + id));

        property.setActive(!property.isActive());
        property = propertyRepository.save(property);

        auditService.record(user, "PROPERTY_STATUS_TOGGLED", "Property", id,
                "Status set to active=" + property.isActive(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
