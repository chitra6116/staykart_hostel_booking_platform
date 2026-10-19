package com.staykart.image.dto;

import com.staykart.image.entity.ImageMetadata;

public record ImageResponse(
    Long id,
    Long propertyId,
    Long roomId,
    String originalUrl,
    String thumbUrl,
    String cardUrl,
    String largeUrl,
    String altText,
    int sortOrder,
    boolean isCover
) {
    public static ImageResponse from(ImageMetadata img) {
        return new ImageResponse(
            img.getId(),
            img.getProperty() != null ? img.getProperty().getId() : null,
            img.getRoom() != null ? img.getRoom().getId() : null,
            "/media/" + img.getFilePath(),
            "/media/" + img.getThumbPath(),
            "/media/" + img.getCardPath(),
            "/media/" + img.getLargePath(),
            img.getAltText(),
            img.getSortOrder(),
            img.isCover()
        );
    }
}
