package com.staykart.amenity.dto;

import com.staykart.amenity.entity.Amenity;

public record AmenityDto(
    Long id,
    String name,
    String category,
    String iconName
) {
    public static AmenityDto from(Amenity amenity) {
        return new AmenityDto(
            amenity.getId(),
            amenity.getName(),
            amenity.getCategory(),
            amenity.getIconName()
        );
    }
}
