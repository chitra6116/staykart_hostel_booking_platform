package com.staykart.pricing.repository;

import com.staykart.pricing.entity.PricingRule;
import com.staykart.pricing.entity.PricingRuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    List<PricingRule> findByActiveTrue();

    @Query("""
        SELECT r FROM PricingRule r
        WHERE r.active = true
          AND (r.property.id IS NULL OR r.property.id = :propertyId)
          AND (r.roomType.id IS NULL OR r.roomType.id = :roomTypeId)
          AND (
            (r.ruleType IN ('FESTIVAL', 'SEASONAL') AND :date BETWEEN r.startDate AND r.endDate)
            OR r.ruleType IN ('WEEKEND', 'LENGTH_OF_STAY')
          )
    """)
    List<PricingRule> findApplicableRules(
            @Param("propertyId") Long propertyId,
            @Param("roomTypeId") Long roomTypeId,
            @Param("date") LocalDate date
    );

    List<PricingRule> findByRuleTypeAndActiveTrue(PricingRuleType ruleType);
}
