package com.staykart.image.storage;

import com.staykart.common.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileSystemImageStorage implements ImageStorage {

    private final Path rootLocation;

    public FileSystemImageStorage(@Value("${app.storage.path:./data/images}") String storagePath) {
        this.rootLocation = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not initialize storage directory: " + rootLocation, e);
        }
    }

    @Override
    public StoredImageResult storeImage(InputStream inputStream, String subDirectory) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        validateImageMagicBytes(bytes);

        BufferedImage sourceImage = ImageIO.read(new ByteArrayInputStream(bytes));
        if (sourceImage == null) {
            throw new BadRequestException("Uploaded file could not be decoded as a valid image");
        }

        String safeSubDir = (subDirectory == null || subDirectory.isBlank()) ? "general" : subDirectory.replaceAll("[^a-zA-Z0-9_-]", "");
        Path targetDir = rootLocation.resolve(safeSubDir).normalize();
        if (!targetDir.startsWith(rootLocation)) {
            throw new BadRequestException("Invalid storage path target");
        }
        Files.createDirectories(targetDir);

        String fileId = UUID.randomUUID().toString();
        String originalFileName = fileId + "_orig.webp";
        String thumbFileName = fileId + "_thumb.webp";
        String cardFileName = fileId + "_card.webp";
        String largeFileName = fileId + "_large.webp";

        File originalFile = targetDir.resolve(originalFileName).toFile();
        File thumbFile = targetDir.resolve(thumbFileName).toFile();
        File cardFile = targetDir.resolve(cardFileName).toFile();
        File largeFile = targetDir.resolve(largeFileName).toFile();

        // 1600px Large
        Thumbnails.of(sourceImage)
                .size(1600, 1600)
                .outputFormat("webp")
                .outputQuality(0.85)
                .toFile(largeFile);

        // 800px Card
        Thumbnails.of(sourceImage)
                .size(800, 800)
                .outputFormat("webp")
                .outputQuality(0.85)
                .toFile(cardFile);

        // 400px Thumbnail
        Thumbnails.of(sourceImage)
                .size(400, 400)
                .outputFormat("webp")
                .outputQuality(0.85)
                .toFile(thumbFile);

        // Original re-encoded
        Thumbnails.of(sourceImage)
                .scale(1.0)
                .outputFormat("webp")
                .outputQuality(0.90)
                .toFile(originalFile);

        String relOriginal = safeSubDir + "/" + originalFileName;
        String relThumb = safeSubDir + "/" + thumbFileName;
        String relCard = safeSubDir + "/" + cardFileName;
        String relLarge = safeSubDir + "/" + largeFileName;

        return new StoredImageResult(relOriginal, relThumb, relCard, relLarge);
    }

    @Override
    public Resource loadAsResource(String relativePath) throws IOException {
        Path filePath = rootLocation.resolve(relativePath).normalize();
        if (!filePath.startsWith(rootLocation)) {
            throw new BadRequestException("Access outside storage directory is forbidden");
        }
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        }
        return null;
    }

    @Override
    public void delete(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Path filePath = rootLocation.resolve(relativePath).normalize();
            if (filePath.startsWith(rootLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
            // Best effort file deletion
        }
    }

    @Override
    public boolean exists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return false;
        }
        Path filePath = rootLocation.resolve(relativePath).normalize();
        return filePath.startsWith(rootLocation) && Files.exists(filePath);
    }

    private void validateImageMagicBytes(byte[] bytes) {
        if (bytes == null || bytes.length < 12) {
            throw new BadRequestException("Image file is empty or corrupted");
        }

        // JPEG: FF D8 FF
        boolean isJpeg = (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF);

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        boolean isPng = (bytes[0] == (byte) 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47);

        // WebP: RIFF....WEBP
        boolean isWebP = (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                          bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P');

        if (!isJpeg && !isPng && !isWebP) {
            throw new BadRequestException("Only JPG, PNG or WebP files are allowed. SVG and executable files are strictly prohibited.");
        }
    }
}
