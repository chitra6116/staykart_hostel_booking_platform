package com.staykart.image.service;

import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.BadRequestException;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.dto.ImageReorderRequest;
import com.staykart.image.dto.ImageResponse;
import com.staykart.image.dto.ImageUpdateRequest;
import com.staykart.image.entity.ImageMetadata;
import com.staykart.image.repository.ImageRepository;
import com.staykart.image.storage.ImageStorage;
import com.staykart.image.storage.StoredImageResult;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import com.staykart.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ImageService {

    private final ImageRepository imageRepository;
    private final ImageStorage imageStorage;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final AuditService auditService;

    public ImageService(
            ImageRepository imageRepository,
            ImageStorage imageStorage,
            PropertyRepository propertyRepository,
            RoomRepository roomRepository,
            AuditService auditService) {
        this.imageRepository = imageRepository;
        this.imageStorage = imageStorage;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.auditService = auditService;
    }

    @Transactional
    public List<ImageResponse> uploadPropertyImages(Long propertyId, List<MultipartFile> files, User currentUser, String ipAddress) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found: " + propertyId));

        long currentCount = imageRepository.countByPropertyId(propertyId);
        if (currentCount + files.size() > 15) {
            throw new BadRequestException("Maximum 15 photos allowed per property. Currently has " + currentCount + " photos.");
        }

        List<ImageResponse> uploaded = new ArrayList<>();
        int currentSortOrder = (int) currentCount;
        boolean hasCover = imageRepository.findCoverByPropertyId(propertyId).isPresent();

        for (MultipartFile file : files) {
            validateMultipartFile(file);
            try {
                StoredImageResult stored = imageStorage.storeImage(file.getInputStream(), "properties/" + property.getSlug());

                boolean isCover = !hasCover && uploaded.isEmpty();
                ImageMetadata metadata = ImageMetadata.builder()
                        .property(property)
                        .filePath(stored.originalPath())
                        .thumbPath(stored.thumbPath())
                        .cardPath(stored.cardPath())
                        .largePath(stored.largePath())
                        .altText(property.getName() + " photo " + (currentSortOrder + 1))
                        .sortOrder(currentSortOrder++)
                        .cover(isCover)
                        .uploadedBy(currentUser)
                        .build();

                metadata = imageRepository.save(metadata);
                uploaded.add(ImageResponse.from(metadata));

                auditService.record(currentUser, "IMAGE_UPLOADED", "Property", propertyId,
                        "Uploaded photo ID: " + metadata.getId(), ipAddress);

            } catch (IOException e) {
                throw new BadRequestException("Failed to process image: " + file.getOriginalFilename());
            }
        }

        return uploaded;
    }

    @Transactional
    public List<ImageResponse> uploadRoomImages(Long roomId, List<MultipartFile> files, User currentUser, String ipAddress) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));

        long currentCount = imageRepository.countByRoomId(roomId);
        if (currentCount + files.size() > 10) {
            throw new BadRequestException("Maximum 10 photos allowed per room. Currently has " + currentCount + " photos.");
        }

        List<ImageResponse> uploaded = new ArrayList<>();
        int currentSortOrder = (int) currentCount;
        boolean hasCover = imageRepository.findCoverByRoomId(roomId).isPresent();

        for (MultipartFile file : files) {
            validateMultipartFile(file);
            try {
                StoredImageResult stored = imageStorage.storeImage(file.getInputStream(), "rooms/" + room.getId());

                boolean isCover = !hasCover && uploaded.isEmpty();
                ImageMetadata metadata = ImageMetadata.builder()
                        .room(room)
                        .filePath(stored.originalPath())
                        .thumbPath(stored.thumbPath())
                        .cardPath(stored.cardPath())
                        .largePath(stored.largePath())
                        .altText(room.getRoomType().getName() + " room photo " + (currentSortOrder + 1))
                        .sortOrder(currentSortOrder++)
                        .cover(isCover)
                        .uploadedBy(currentUser)
                        .build();

                metadata = imageRepository.save(metadata);
                uploaded.add(ImageResponse.from(metadata));

                auditService.record(currentUser, "IMAGE_UPLOADED", "Room", roomId,
                        "Uploaded room photo ID: " + metadata.getId(), ipAddress);

            } catch (IOException e) {
                throw new BadRequestException("Failed to process image: " + file.getOriginalFilename());
            }
        }

        return uploaded;
    }

    @Transactional
    public ImageResponse updateImage(Long imageId, ImageUpdateRequest request, User currentUser, String ipAddress) {
        ImageMetadata image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        image.setAltText(request.altText().trim());

        if (Boolean.TRUE.equals(request.isCover())) {
            if (image.getProperty() != null) {
                Optional<ImageMetadata> existingCover = imageRepository.findCoverByPropertyId(image.getProperty().getId());
                existingCover.ifPresent(cov -> {
                    cov.setCover(false);
                    imageRepository.save(cov);
                });
            } else if (image.getRoom() != null) {
                Optional<ImageMetadata> existingCover = imageRepository.findCoverByRoomId(image.getRoom().getId());
                existingCover.ifPresent(cov -> {
                    cov.setCover(false);
                    imageRepository.save(cov);
                });
            }
            image.setCover(true);
            auditService.record(currentUser, "IMAGE_COVER_SET", "Image", imageId, "Set as cover photo", ipAddress);
        }

        image = imageRepository.save(image);
        return ImageResponse.from(image);
    }

    @Transactional
    public void reorderImages(ImageReorderRequest request, User currentUser, String ipAddress) {
        List<Long> ids = request.imageIds();
        for (int i = 0; i < ids.size(); i++) {
            Long imgId = ids.get(i);
            Optional<ImageMetadata> opt = imageRepository.findById(imgId);
            if (opt.isPresent()) {
                ImageMetadata img = opt.get();
                img.setSortOrder(i);
                imageRepository.save(img);
            }
        }
        auditService.record(currentUser, "IMAGES_REORDERED", "Image", null, "Reordered " + ids.size() + " photos", ipAddress);
    }

    @Transactional
    public void deleteImage(Long imageId, User currentUser, String ipAddress) {
        ImageMetadata image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

        boolean wasCover = image.isCover();
        Long propertyId = image.getProperty() != null ? image.getProperty().getId() : null;
        Long roomId = image.getRoom() != null ? image.getRoom().getId() : null;

        // Clean up disk files
        imageStorage.delete(image.getFilePath());
        imageStorage.delete(image.getThumbPath());
        imageStorage.delete(image.getCardPath());
        imageStorage.delete(image.getLargePath());

        imageRepository.delete(image);

        // Auto-promote next image to cover if deleted image was cover
        if (wasCover) {
            List<ImageMetadata> remaining = propertyId != null
                    ? imageRepository.findByPropertyIdOrderBySortOrderAsc(propertyId)
                    : imageRepository.findByRoomIdOrderBySortOrderAsc(roomId);

            if (!remaining.isEmpty()) {
                ImageMetadata nextCover = remaining.get(0);
                nextCover.setCover(true);
                imageRepository.save(nextCover);
            }
        }

        auditService.record(currentUser, "IMAGE_DELETED", "Image", imageId, "Deleted image and files from disk", ipAddress);
    }

    private void validateMultipartFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded image cannot be empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Image is larger than 5 MB");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            throw new BadRequestException("Only JPG, PNG or WebP files are allowed");
        }
    }
}
