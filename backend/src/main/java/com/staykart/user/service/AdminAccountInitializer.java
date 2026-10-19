package com.staykart.user.service;

import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Initializes and manages the seed administrator account password.
 * - Allows configuring the admin password via the ADMIN_PASSWORD environment variable.
 * - If running in the production profile and no ADMIN_PASSWORD is provided, disables
 *   the seeded admin account to prevent unauthorized access.
 */
@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${app.admin.initial-password:}")
    private String adminPasswordConfig;

    public AdminAccountInitializer(UserRepository userRepository,
                                   PasswordEncoder passwordEncoder,
                                   Environment environment) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        userRepository.findByEmail("admin@staykart.in").ifPresent(admin -> {
            boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

            if (adminPasswordConfig != null && !adminPasswordConfig.trim().isEmpty()) {
                admin.setPasswordHash(passwordEncoder.encode(adminPasswordConfig.trim()));
                admin.setEnabled(true);
                userRepository.save(admin);
                log.info("Administrator account password updated from ADMIN_PASSWORD environment variable.");
            } else if (isProd) {
                admin.setEnabled(false);
                userRepository.save(admin);
                log.warn("Seeded administrator account (admin@staykart.in) disabled: ADMIN_PASSWORD environment variable not set in production profile.");
            } else {
                log.info("Development profile active: default seeded admin account preserved.");
            }
        });
    }
}
