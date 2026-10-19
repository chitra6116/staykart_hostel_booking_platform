package com.staykart.user.service;

import com.staykart.auth.dto.UserSummaryDto;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.user.dto.UserUpdateRequest;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return UserSummaryDto.from(user);
    }

    @Transactional
    public UserSummaryDto updateProfile(String email, UserUpdateRequest request, String ipAddress) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setFullName(request.fullName().trim());
        user.setPhone(request.phone().trim());
        user = userRepository.save(user);

        auditService.record(user, "PROFILE_UPDATED", "User", user.getId(), "Profile details updated", ipAddress);

        return UserSummaryDto.from(user);
    }
}
