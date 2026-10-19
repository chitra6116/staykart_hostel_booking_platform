package com.staykart.property.service;

import com.staykart.amenity.dto.AmenityDto;
import com.staykart.common.dto.PagedResponse;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.dto.ImageResponse;
import com.staykart.image.entity.ImageMetadata;
import com.staykart.image.repository.ImageRepository;
import com.staykart.property.dto.PropertyDetailDto;
import com.staykart.property.dto.PropertySummaryDto;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final ImageRepository imageRepository;

    public PropertyService(
            PropertyRepository propertyRepository,
            RoomRepository roomRepository,
            ImageRepository imageRepository) {
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<PropertySummaryDto> getAllActiveProperties(Pageable pageable) {
        Page<Property> page = propertyRepository.findByActiveTrue(pageable);
        return PagedResponse.from(page.map(this::toSummaryDto));
    }

    @Transactional(readOnly = true)
    public PropertyDetailDto getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));
        return toDetailDto(property);
    }

    @Transactional(readOnly = true)
    public PropertyDetailDto getPropertyBySlug(String slug) {
        Property property = propertyRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with slug: " + slug));
        return toDetailDto(property);
    }

    @Transactional(readOnly = true)
    public List<String> getPopularCities() {
        return propertyRepository.findDistinctCities();
    }

    private PropertySummaryDto toSummaryDto(Property property) {
        String coverUrl = getCoverImageUrl(property.getId());
        BigDecimal startingPrice = calculateStartingPrice(property.getId());
        List<AmenityDto> amenities = property.getAmenities().stream().map(AmenityDto::from).toList();

        return new PropertySummaryDto(
            property.getId(),
            property.getName(),
            property.getSlug(),
            property.getDescription(),
            property.getAddressLine(),
            property.getCity(),
            property.getState(),
            property.getPincode(),
            property.getCheckInTime(),
            property.getCheckOutTime(),
            coverUrl,
            startingPrice,
            amenities
        );
    }

    private PropertyDetailDto toDetailDto(Property property) {
        String coverUrl = getCoverImageUrl(property.getId());
        BigDecimal startingPrice = calculateStartingPrice(property.getId());
        List<AmenityDto> amenities = property.getAmenities().stream().map(AmenityDto::from).toList();
        List<ImageResponse> images = imageRepository.findByPropertyIdOrderBySortOrderAsc(property.getId())
                .stream().map(ImageResponse::from).toList();

        return new PropertyDetailDto(
            property.getId(),
            property.getName(),
            property.getSlug(),
            property.getDescription(),
            property.getAddressLine(),
            property.getCity(),
            property.getState(),
            property.getPincode(),
            property.getCheckInTime(),
            property.getCheckOutTime(),
            property.getHouseRules(),
            coverUrl,
            startingPrice,
            images,
            amenities
        );
    }

    private String getCoverImageUrl(Long propertyId) {
        return imageRepository.findCoverByPropertyId(propertyId)
                .map(i -> "/media/" + i.getCardPath())
                .orElse("/images/hero/hero-banner.webp");
    }

    private BigDecimal calculateStartingPrice(Long propertyId) {
        List<Room> rooms = roomRepository.findByPropertyIdAndActiveTrue(propertyId);
        return rooms.stream()
                .map(r -> r.getRoomType().getBasePriceInr())
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.valueOf(1499.00));
    }
}
