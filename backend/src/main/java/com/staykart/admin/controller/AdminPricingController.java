package com.staykart.admin.controller;

import com.staykart.admin.dto.BulkPricingRequest;
import com.staykart.common.audit.AuditService;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.pricing.entity.PricingRule;
import com.staykart.pricing.repository.PricingRuleRepository;
import com.staykart.property.entity.Property;
import com.staykart.property.repository.PropertyRepository;
import com.staykart.room.entity.RoomType;
import com.staykart.room.repository.RoomTypeRepository;
import com.staykart.user.entity.User;
import com.staykart.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pricing")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Pricing", description = "Dynamic pricing rules, festival surge rates, and bulk pricing tools")
public class AdminPricingController {

    private final PricingRuleRepository pricingRuleRepository;
    private final PropertyRepository propertyRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminPricingController(
            PricingRuleRepository pricingRuleRepository,
            PropertyRepository propertyRepository,
            RoomTypeRepository roomTypeRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.pricingRuleRepository = pricingRuleRepository;
        this.propertyRepository = propertyRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @GetMapping("/rules")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    @Operation(summary = "List all active pricing rules")
    public ResponseEntity<List<PricingRule>> getAllRules() {
        return ResponseEntity.ok(pricingRuleRepository.findAll());
    }

    @PostMapping("/rules")
    @Operation(summary = "Create a seasonal or festival pricing rule")
    public ResponseEntity<PricingRule> createRule(
            @Valid @RequestBody BulkPricingRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        PricingRule rule = PricingRule.builder()
                .name(request.name().trim())
                .ruleType(request.ruleType())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .multiplier(request.multiplier())
                .minNights(request.minNights())
                .discountPercentage(request.discountPercentage())
                .active(true)
                .build();

        if (request.propertyIds() != null && !request.propertyIds().isEmpty()) {
            rule.setProperty(propertyRepository.findById(request.propertyIds().get(0)).orElse(null));
        }

        if (request.roomTypeIds() != null && !request.roomTypeIds().isEmpty()) {
            rule.setRoomType(roomTypeRepository.findById(request.roomTypeIds().get(0)).orElse(null));
        }

        rule = pricingRuleRepository.save(rule);
        auditService.record(user, "PRICING_RULE_CREATED", "PricingRule", rule.getId(),
                "Created rule: " + rule.getName() + " (" + rule.getRuleType() + ")", httpRequest.getRemoteAddr());

        return ResponseEntity.status(HttpStatus.CREATED).body(rule);
    }

    @DeleteMapping("/rules/{id}")
    @Operation(summary = "Delete a pricing rule")
    public ResponseEntity<Void> deleteRule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);
        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + id));

        pricingRuleRepository.delete(rule);
        auditService.record(user, "PRICING_RULE_DELETED", "PricingRule", id,
                "Deleted rule: " + rule.getName(), httpRequest.getRemoteAddr());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @Operation(summary = "Apply special rates or multipliers across multiple destinations")
    public ResponseEntity<Void> bulkApplyPricing(
            @Valid @RequestBody BulkPricingRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        User user = getUser(userDetails);

        List<Property> properties = (request.propertyIds() != null && !request.propertyIds().isEmpty())
                ? propertyRepository.findAllById(request.propertyIds())
                : List.of((Property) null);

        List<RoomType> roomTypes = (request.roomTypeIds() != null && !request.roomTypeIds().isEmpty())
                ? roomTypeRepository.findAllById(request.roomTypeIds())
                : List.of((RoomType) null);

        for (Property prop : properties) {
            for (RoomType rt : roomTypes) {
                PricingRule rule = PricingRule.builder()
                        .name(request.name().trim() + (prop != null ? " - " + prop.getName() : ""))
                        .ruleType(request.ruleType())
                        .property(prop)
                        .roomType(rt)
                        .startDate(request.startDate())
                        .endDate(request.endDate())
                        .multiplier(request.multiplier())
                        .minNights(request.minNights())
                        .discountPercentage(request.discountPercentage())
                        .active(true)
                        .build();
                pricingRuleRepository.save(rule);
            }
        }

        auditService.record(user, "BULK_PRICING_APPLIED", "PricingRule", null,
                "Bulk created pricing rules: " + request.name(), httpRequest.getRemoteAddr());

        return ResponseEntity.ok().build();
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
    }
}
