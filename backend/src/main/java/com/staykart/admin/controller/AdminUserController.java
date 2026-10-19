package com.staykart.admin.controller;

import com.staykart.auth.dto.UserSummaryDto;
import com.staykart.common.audit.AuditService;
import com.staykart.common.dto.PagedResponse;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Users", description = "User management and account lockout/enablement controls")
public class AdminUserController {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminUserController(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "View paginated list of users")
    public ResponseEntity<PagedResponse<UserSummaryDto>> getAllUsers(@PageableDefault(size = 15) Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return ResponseEntity.ok(PagedResponse.from(page.map(UserSummaryDto::from)));
    }

    @PatchMapping("/{id}/toggle-status")
    @Operation(summary = "Enable or disable user account")
    public ResponseEntity<UserSummaryDto> toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (currentUser != null && currentUser.getId().equals(user.getId())) {
            throw new com.staykart.common.exception.BadRequestException("You cannot disable your own administrator account");
        }
        if (user.getRole() == com.staykart.user.entity.Role.ADMIN) {
            throw new com.staykart.common.exception.BadRequestException("Administrator accounts cannot be disabled");
        }

        user.setEnabled(!user.isEnabled());
        user = userRepository.save(user);

        auditService.record(currentUser, "USER_STATUS_TOGGLED", "User", id,
                "Account enabled set to: " + user.isEnabled(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok(UserSummaryDto.from(user));
    }
}
