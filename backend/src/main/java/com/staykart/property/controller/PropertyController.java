package com.staykart.property.controller;

import com.staykart.common.dto.PagedResponse;
import com.staykart.property.dto.PropertyDetailDto;
import com.staykart.property.dto.PropertySummaryDto;
import com.staykart.property.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@Tag(name = "Properties", description = "Public property browsing and destination discovery")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping
    @Operation(summary = "Get paginated active properties")
    public ResponseEntity<PagedResponse<PropertySummaryDto>> getAllProperties(
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(propertyService.getAllActiveProperties(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get property details by ID")
    public ResponseEntity<PropertyDetailDto> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get property details by URL slug")
    public ResponseEntity<PropertyDetailDto> getPropertyBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(propertyService.getPropertyBySlug(slug));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get list of popular destination cities")
    public ResponseEntity<List<String>> getPopularCities() {
        return ResponseEntity.ok(propertyService.getPopularCities());
    }
}
