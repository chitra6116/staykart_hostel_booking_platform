package com.staykart.pricing;

import com.staykart.common.exception.BadRequestException;
import com.staykart.pricing.dto.PriceBreakdownResponse;
import com.staykart.pricing.entity.PricingRule;
import com.staykart.pricing.entity.PricingRuleType;
import com.staykart.pricing.repository.PricingRuleRepository;
import com.staykart.pricing.service.GstCalculator;
import com.staykart.pricing.service.PricingService;
import com.staykart.property.entity.Property;
import com.staykart.room.entity.Room;
import com.staykart.room.entity.RoomType;
import com.staykart.room.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @Mock
    private GstCalculator gstCalculator;

    private PricingService pricingService;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        pricingService = new PricingService(roomRepository, pricingRuleRepository, gstCalculator);

        Property property = Property.builder().id(1L).name("Jaipur Haveli").city("Jaipur").build();
        RoomType roomType = RoomType.builder().id(2L).name("Deluxe Room").maxGuests(3).basePriceInr(BigDecimal.valueOf(3000.00)).build();
        testRoom = Room.builder().id(10L).property(property).roomType(roomType).roomNumber("102").build();
    }

    @Test
    void shouldCalculatePricingForSingleWeekdayNight() {
        // Find next Tuesday to Wednesday
        LocalDate checkIn = LocalDate.now().plusWeeks(2);
        while (checkIn.getDayOfWeek().getValue() != 2) { // Tuesday
            checkIn = checkIn.plusDays(1);
        }
        LocalDate checkOut = checkIn.plusDays(1);

        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.LENGTH_OF_STAY)).thenReturn(Collections.emptyList());
        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.WEEKEND)).thenReturn(Collections.emptyList());
        when(pricingRuleRepository.findApplicableRules(eq(1L), eq(2L), any(LocalDate.class))).thenReturn(Collections.emptyList());

        // ₹3,000 tariff -> 5% GST (CGST 75, SGST 75, total 150)
        when(gstCalculator.calculateGst(any(BigDecimal.class))).thenReturn(
            new GstCalculator.GstResult(
                BigDecimal.valueOf(5.00),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(75.00),
                BigDecimal.valueOf(75.00),
                BigDecimal.valueOf(150.00)
            )
        );

        PriceBreakdownResponse response = pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 2);

        assertNotNull(response);
        assertEquals(1, response.nightsCount());
        assertEquals(new BigDecimal("3000.00"), response.totalBaseInr());
        assertEquals(new BigDecimal("0.00"), response.totalDiscountInr());
        assertEquals(new BigDecimal("3000.00"), response.taxableAmountInr());
        assertEquals(new BigDecimal("75.00"), response.cgstInr());
        assertEquals(new BigDecimal("75.00"), response.sgstInr());
        assertEquals(new BigDecimal("3150.00"), response.totalAmountInr());
    }

    @Test
    void shouldApplyWeekendSurchargeOnFridayAndSaturdayNights() {
        // Find next Friday to Sunday (2 nights)
        LocalDate checkIn = LocalDate.now().plusWeeks(3);
        while (checkIn.getDayOfWeek().getValue() != 5) { // Friday
            checkIn = checkIn.plusDays(1);
        }
        LocalDate checkOut = checkIn.plusDays(2); // Sunday

        PricingRule weekendRule = PricingRule.builder().ruleType(PricingRuleType.WEEKEND).multiplier(BigDecimal.valueOf(1.15)).active(true).build();
        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.WEEKEND)).thenReturn(List.of(weekendRule));
        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.LENGTH_OF_STAY)).thenReturn(Collections.emptyList());
        when(pricingRuleRepository.findApplicableRules(eq(1L), eq(2L), any(LocalDate.class))).thenReturn(Collections.emptyList());

        when(gstCalculator.calculateGst(any(BigDecimal.class))).thenReturn(
            new GstCalculator.GstResult(
                BigDecimal.valueOf(5.00),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(86.25),
                BigDecimal.valueOf(86.25),
                BigDecimal.valueOf(172.50)
            )
        );

        PriceBreakdownResponse response = pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 2);

        assertEquals(2, response.nightsCount());
        // ₹3,000 * 1.15 = ₹3,450.00 per night * 2 = ₹6,900.00
        assertEquals(new BigDecimal("6900.00"), response.taxableAmountInr());
    }

    @Test
    void shouldApplyLengthOfStayDiscountForSevenOrMoreNights() {
        LocalDate checkIn = LocalDate.now().plusWeeks(2);
        LocalDate checkOut = checkIn.plusDays(7);

        PricingRule stayRule = PricingRule.builder().ruleType(PricingRuleType.LENGTH_OF_STAY).minNights(7).discountPercentage(BigDecimal.valueOf(10.00)).active(true).build();
        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.LENGTH_OF_STAY)).thenReturn(List.of(stayRule));
        when(pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.WEEKEND)).thenReturn(Collections.emptyList());
        when(pricingRuleRepository.findApplicableRules(eq(1L), eq(2L), any(LocalDate.class))).thenReturn(Collections.emptyList());

        when(gstCalculator.calculateGst(any(BigDecimal.class))).thenReturn(
            new GstCalculator.GstResult(
                BigDecimal.valueOf(5.00),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(2.50),
                BigDecimal.valueOf(67.50),
                BigDecimal.valueOf(67.50),
                BigDecimal.valueOf(135.00)
            )
        );

        PriceBreakdownResponse response = pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 2);

        assertEquals(7, response.nightsCount());
        assertTrue(response.totalDiscountInr().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void shouldRejectPastCheckInDate() {
        LocalDate checkIn = LocalDate.now().minusDays(1);
        LocalDate checkOut = checkIn.plusDays(2);

        assertThrows(BadRequestException.class, () -> pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 2));
    }

    @Test
    void shouldRejectCheckOutBeforeOrOnCheckIn() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = checkIn;

        assertThrows(BadRequestException.class, () -> pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 2));
    }

    @Test
    void shouldRejectGuestCountExceedingCapacity() {
        LocalDate checkIn = LocalDate.now().plusDays(5);
        LocalDate checkOut = checkIn.plusDays(2);

        assertThrows(BadRequestException.class, () -> pricingService.calculatePriceForRoom(testRoom, checkIn, checkOut, 5));
    }
}
