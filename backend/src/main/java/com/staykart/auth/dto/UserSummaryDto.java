package com.staykart.auth.dto;

import com.staykart.user.entity.Role;
import com.staykart.user.entity.User;

public record UserSummaryDto(
    Long id,
    String fullName,
    String email,
    String phone,
    Role role
) {
    public static UserSummaryDto from(User user) {
        return new UserSummaryDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
    }
}
