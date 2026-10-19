package com.staykart.admin.controller;

import com.staykart.image.dto.ImageReorderRequest;
import com.staykart.image.dto.ImageResponse;
import com.staykart.image.dto.ImageUpdateRequest;
import com.staykart.image.service.ImageService;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Images", description = "Multi-file photo upload, reordering, and gallery management")
public class AdminImageController {

    private final ImageService imageService;
    private final UserRepository userRepository;

    public AdminImageController(ImageService imageService, UserRepository userRepository) {
        this.imageService = imageService;
        this.userRepository = userRepository;
    }

    @PostMapping(value = "/properties/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload photos for a property (drag & drop / multi-file)")
    public ResponseEntity<List<ImageResponse>> uploadPropertyImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.uploadPropertyImages(id, files, user, ipAddress));
    }

    @PostMapping(value = "/rooms/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload photos for a room (drag & drop / multi-file)")
    public ResponseEntity<List<ImageResponse>> uploadRoomImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.uploadRoomImages(id, files, user, ipAddress));
    }

    @PutMapping("/images/{id}")
    @Operation(summary = "Update image alt-text or mark as cover photo")
    public ResponseEntity<ImageResponse> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody ImageUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        return ResponseEntity.ok(imageService.updateImage(id, request, user, ipAddress));
    }

    @PutMapping("/images/reorder")
    @Operation(summary = "Reorder images via drag-and-drop array of IDs")
    public ResponseEntity<Void> reorderImages(
            @Valid @RequestBody ImageReorderRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        imageService.reorderImages(request, user, ipAddress);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/images/{id}")
    @Operation(summary = "Delete an image and remove all resized files from disk")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        String ipAddress = resolveIp(httpRequest);
        imageService.deleteImage(id, user, ipAddress);
        return ResponseEntity.noContent().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }

    private String resolveIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
