package com.staykart.image.controller;

import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.image.storage.ImageStorage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;

@RestController
@Tag(name = "Media", description = "Public media and image serving with HTTP caching")
public class MediaController {

    private final ImageStorage imageStorage;

    public MediaController(ImageStorage imageStorage) {
        this.imageStorage = imageStorage;
    }

    @GetMapping("/media/**")
    @Operation(summary = "Serve public image file with cache headers")
    public ResponseEntity<Resource> serveMedia(HttpServletRequest request) {
        String fullPath = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String relativePath = fullPath.substring("/media/".length());

        try {
            Resource resource = imageStorage.loadAsResource(relativePath);
            if (resource == null || !resource.exists()) {
                throw new ResourceNotFoundException("Media file not found: " + relativePath);
            }

            MediaType mediaType = MediaType.IMAGE_JPEG;
            String lower = relativePath.toLowerCase();
            if (lower.endsWith(".webp")) {
                mediaType = MediaType.parseMediaType("image/webp");
            } else if (lower.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, mediaType.toString())
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=604800, immutable")
                    .header("X-Content-Type-Options", "nosniff")
                    .body(resource);

        } catch (IOException e) {
            throw new ResourceNotFoundException("Error loading image resource: " + relativePath);
        }
    }
}
