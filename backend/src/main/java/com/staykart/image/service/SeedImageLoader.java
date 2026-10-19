package com.staykart.image.service;

import jakarta.annotation.PostConstruct;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Component
public class SeedImageLoader {

    private static final Logger log = LoggerFactory.getLogger(SeedImageLoader.class);

    private final Path storagePath;
    private final Path seedSourcePath;

    public SeedImageLoader(
            @Value("${app.storage.path:./data/images}") String storagePath,
            @Value("${app.storage.seed-path:./seed-images}") String seedSourcePath) {
        this.storagePath = Paths.get(storagePath).toAbsolutePath().normalize();
        this.seedSourcePath = Paths.get(seedSourcePath).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void seedImagesIfMissing() {
        if (!Files.exists(seedSourcePath)) {
            log.info("Seed images directory not found at: {}. Skipping seed image copying.", seedSourcePath);
            return;
        }

        try {
            Files.createDirectories(storagePath);
            seedDirectory(seedSourcePath.resolve("properties"), storagePath.resolve("properties"));
            seedDirectory(seedSourcePath.resolve("rooms"), storagePath.resolve("rooms"));
            log.info("Seed images synchronization completed successfully into: {}", storagePath);
        } catch (Exception e) {
            log.error("Failed during seed image processing: {}", e.getMessage(), e);
        }
    }

    private void seedDirectory(Path sourceDir, Path targetDir) throws IOException {
        if (!Files.exists(sourceDir)) {
            return;
        }

        try (Stream<Path> stream = Files.walk(sourceDir)) {
            stream.filter(Files::isRegularFile)
                  .filter(p -> p.toString().toLowerCase().endsWith(".webp") ||
                               p.toString().toLowerCase().endsWith(".jpg") ||
                               p.toString().toLowerCase().endsWith(".jpeg") ||
                               p.toString().toLowerCase().endsWith(".png"))
                  .filter(p -> !p.getFileName().toString().contains("_thumb") &&
                               !p.getFileName().toString().contains("_card") &&
                               !p.getFileName().toString().contains("_large"))
                  .forEach(imageFile -> processSingleSeedImage(imageFile, sourceDir, targetDir));
        }
    }

    private void processSingleSeedImage(Path imageFile, Path sourceDir, Path targetDir) {
        try {
            Path relative = sourceDir.relativize(imageFile);
            Path destFile = targetDir.resolve(relative);
            Files.createDirectories(destFile.getParent());

            String fileName = destFile.getFileName().toString();
            String baseName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            Path parent = destFile.getParent();

            Path thumbFile = parent.resolve(baseName + "_thumb.webp");
            Path cardFile = parent.resolve(baseName + "_card.webp");
            Path largeFile = parent.resolve(baseName + "_large.webp");

            if (Files.exists(destFile) && Files.exists(thumbFile) && Files.exists(cardFile) && Files.exists(largeFile)) {
                return;
            }

            BufferedImage sourceImage = ImageIO.read(imageFile.toFile());
            if (sourceImage == null) {
                return;
            }

            // Generate main .webp
            Thumbnails.of(sourceImage)
                    .scale(1.0)
                    .outputFormat("webp")
                    .outputQuality(0.90)
                    .toFile(destFile.toFile());

            // Generate 1600px large
            Thumbnails.of(sourceImage)
                    .size(1600, 1600)
                    .outputFormat("webp")
                    .outputQuality(0.85)
                    .toFile(largeFile.toFile());

            // Generate 800px card
            Thumbnails.of(sourceImage)
                    .size(800, 800)
                    .outputFormat("webp")
                    .outputQuality(0.85)
                    .toFile(cardFile.toFile());

            // Generate 400px thumb
            Thumbnails.of(sourceImage)
                    .size(400, 400)
                    .outputFormat("webp")
                    .outputQuality(0.85)
                    .toFile(thumbFile.toFile());

        } catch (Exception e) {
            log.warn("Could not process seed image {}: {}", imageFile, e.getMessage());
        }
    }
}
