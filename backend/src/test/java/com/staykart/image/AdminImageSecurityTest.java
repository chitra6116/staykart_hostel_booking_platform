package com.staykart.image;

import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.BadRequestException;
import com.staykart.image.entity.ImageMetadata;
import com.staykart.image.repository.ImageRepository;
import com.staykart.image.service.ImageService;
import com.staykart.image.storage.FileSystemImageStorage;
import com.staykart.image.storage.ImageStorage;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.room.repository.RoomRepository;
import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminImageSecurityTest {

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private AuditService auditService;

    @TempDir
    Path tempStorageDir;

    private ImageStorage imageStorage;
    private ImageService imageService;
    private User adminUser;
    private Property testProperty;

    @BeforeEach
    void setUp() {
        imageStorage = new FileSystemImageStorage(tempStorageDir.toString());
        imageService = new ImageService(imageRepository, imageStorage, propertyRepository, roomRepository, auditService);

        adminUser = User.builder().id(1L).email("admin@staykart.in").role(Role.ADMIN).build();
        testProperty = Property.builder().id(1L).name("Jaipur Haveli").slug("jaipur-haveli").build();
    }

    @Test
    void shouldRejectExecutableDisguisedAsJpg() {
        // Windows executable magic bytes: 'MZ' (0x4D, 0x5A) disguised with a .jpg filename
        byte[] exeBytes = new byte[]{0x4D, 0x5A, (byte) 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00};
        MockMultipartFile fakeJpg = new MockMultipartFile("files", "malicious.jpg", "image/jpeg", exeBytes);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));
        when(imageRepository.countByPropertyId(1L)).thenReturn(0L);

        assertThrows(BadRequestException.class, () ->
            imageService.uploadPropertyImages(1L, List.of(fakeJpg), adminUser, "127.0.0.1")
        );
    }

    @Test
    void shouldRejectOversizedFileOver5MB() {
        // 6 MB dummy payload
        byte[] largeBytes = new byte[6 * 1024 * 1024];
        MockMultipartFile largeFile = new MockMultipartFile("files", "large.jpg", "image/jpeg", largeBytes);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(testProperty));
        when(imageRepository.countByPropertyId(1L)).thenReturn(0L);

        assertThrows(BadRequestException.class, () ->
            imageService.uploadPropertyImages(1L, List.of(largeFile), adminUser, "127.0.0.1")
        );
    }

    @Test
    void shouldDeleteFilesFromDiskWhenImageIsDeleted() throws IOException {
        Path orig = tempStorageDir.resolve("test_orig.webp");
        Path thumb = tempStorageDir.resolve("test_thumb.webp");
        Path card = tempStorageDir.resolve("test_card.webp");
        Path large = tempStorageDir.resolve("test_large.webp");

        Files.writeString(orig, "test");
        Files.writeString(thumb, "test");
        Files.writeString(card, "test");
        Files.writeString(large, "test");

        assertTrue(Files.exists(orig));

        ImageMetadata metadata = ImageMetadata.builder()
                .id(99L)
                .property(testProperty)
                .filePath("test_orig.webp")
                .thumbPath("test_thumb.webp")
                .cardPath("test_card.webp")
                .largePath("test_large.webp")
                .cover(false)
                .build();

        when(imageRepository.findById(99L)).thenReturn(Optional.of(metadata));

        imageService.deleteImage(99L, adminUser, "127.0.0.1");

        assertFalse(Files.exists(orig), "Original image must be deleted from disk");
        assertFalse(Files.exists(thumb), "Thumbnail must be deleted from disk");
        verify(imageRepository).delete(metadata);
    }
}
