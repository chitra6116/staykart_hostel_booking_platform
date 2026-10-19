package com.staykart.pricing.service;

import com.staykart.common.exception.BadRequestException;
import com.staykart.common.exception.ResourceNotFoundException;
import com.staykart.pricing.dto.DailyPriceItem;
import com.staykart.pricing.dto.PriceBreakdownResponse;
import com.staykart.pricing.entity.PricingRule;
import com.staykart.pricing.entity.PricingRuleType;
import com.staykart.pricing.repository.PricingRuleRepository;
import com.staykart.room.entity.Room;
import com.staykart.room.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class PricingService {

    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    private final RoomRepository roomRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final GstCalculator gstCalculator;

    public PricingService(
            RoomRepository roomRepository,
            PricingRuleRepository pricingRuleRepository,
            GstCalculator gstCalculator) {
        this.roomRepository = roomRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.gstCalculator = gstCalculator;
    }

    @Transactional(readOnly = true)
    public PriceBreakdownResponse calculatePrice(Long roomId, LocalDate checkIn, LocalDate checkOut, int guestsCount) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + roomId));
        return calculatePriceForRoom(room, checkIn, checkOut, guestsCount);
    }

    public PriceBreakdownResponse calculatePriceForRoom(Room room, LocalDate checkIn, LocalDate checkOut, int guestsCount) {
        validateBookingParameters(room, checkIn, checkOut, guestsCount);

        long nightsCount = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal baseRate = room.getRoomType().getBasePriceInr();

        // Check if length-of-stay discount applies (e.g. 7+ nights = 10%)
        BigDecimal lengthOfStayDiscountPct = BigDecimal.ZERO;
        List<PricingRule> stayRules = pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.LENGTH_OF_STAY);
        for (PricingRule rule : stayRules) {
            if (rule.getMinNights() != null && nightsCount >= rule.getMinNights()) {
                if (rule.getDiscountPercentage() != null && rule.getDiscountPercentage().compareTo(lengthOfStayDiscountPct) > 0) {
                    lengthOfStayDiscountPct = rule.getDiscountPercentage();
                }
            }
        }

        BigDecimal weekendSurchargeMultiplier = BigDecimal.valueOf(1.15); // Standard 15% weekend surcharge
        List<PricingRule> weekendRules = pricingRuleRepository.findByRuleTypeAndActiveTrue(PricingRuleType.WEEKEND);
        if (!weekendRules.isEmpty() && weekendRules.get(0).getMultiplier() != null) {
            weekendSurchargeMultiplier = weekendRules.get(0).getMultiplier();
        }

        List<DailyPriceItem> dailyItems = new ArrayList<>();
        BigDecimal totalBase = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTaxable = BigDecimal.ZERO;
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (int i = 0; i < nightsCount; i++) {
            LocalDate nightDate = checkIn.plusDays(i);
            DayOfWeek dow = nightDate.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY);

            // Determine seasonal or festival multiplier for this date
            BigDecimal seasonalMultiplier = BigDecimal.ONE.setScale(2, RoundingMode.HALF_UP);
            List<PricingRule> applicableRules = pricingRuleRepository.findApplicableRules(
                    room.getProperty().getId(),
                    room.getRoomType().getId(),
                    nightDate
            );

            for (PricingRule rule : applicableRules) {
                if ((rule.getRuleType() == PricingRuleType.FESTIVAL || rule.getRuleType() == PricingRuleType.SEASONAL)
                        && rule.getMultiplier() != null
                        && rule.getMultiplier().compareTo(seasonalMultiplier) > 0) {
                    seasonalMultiplier = rule.getMultiplier();
                }
            }

            BigDecimal currentWeekendMult = isWeekend ? weekendSurchargeMultiplier : BigDecimal.ONE.setScale(2, RoundingMode.HALF_UP);

            // Step 1: Base price adjusted for season
            BigDecimal adjustedNightRate = baseRate.multiply(seasonalMultiplier).setScale(2, RoundingMode.HALF_UP);

            // Step 2: Weekend surcharge
            if (isWeekend) {
                adjustedNightRate = adjustedNightRate.multiply(currentWeekendMult).setScale(2, RoundingMode.HALF_UP);
            }

            // Step 3: Length-of-stay discount
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (lengthOfStayDiscountPct.compareTo(BigDecimal.ZERO) > 0) {
                discountAmount = adjustedNightRate.multiply(lengthOfStayDiscountPct)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            BigDecimal finalNightTariff = adjustedNightRate.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);

            // Step 4: Dynamic GST by slab on final per-night tariff
            GstCalculator.GstResult gst = gstCalculator.calculateGst(finalNightTariff);

            BigDecimal nightTotal = finalNightTariff.add(gst.totalGstInr()).setScale(2, RoundingMode.HALF_UP);

            dailyItems.add(new DailyPriceItem(
                nightDate,
                dow.name(),
                baseRate,
                seasonalMultiplier,
                isWeekend,
                currentWeekendMult,
                lengthOfStayDiscountPct,
                discountAmount,
                finalNightTariff,
                gst.gstPercentage(),
                gst.cgstAmountInr(),
                gst.sgstAmountInr(),
                nightTotal
            ));

            totalBase = totalBase.add(adjustedNightRate);
            totalDiscount = totalDiscount.add(discountAmount);
            totalTaxable = totalTaxable.add(finalNightTariff);
            totalCgst = totalCgst.add(gst.cgstAmountInr());
            totalSgst = totalSgst.add(gst.sgstAmountInr());
            grandTotal = grandTotal.add(nightTotal);
        }

        return new PriceBreakdownResponse(
            room.getId(),
            room.getProperty().getName(),
            room.getRoomType().getName(),
            checkIn,
            checkOut,
            (int) nightsCount,
            guestsCount,
            totalBase.setScale(2, RoundingMode.HALF_UP),
            totalDiscount.setScale(2, RoundingMode.HALF_UP),
            totalTaxable.setScale(2, RoundingMode.HALF_UP),
            totalCgst.setScale(2, RoundingMode.HALF_UP),
            totalSgst.setScale(2, RoundingMode.HALF_UP),
            grandTotal.setScale(2, RoundingMode.HALF_UP),
            dailyItems
        );
    }

    private void validateBookingParameters(Room room, LocalDate checkIn, LocalDate checkOut, int guestsCount) {
        if (checkIn == null || checkOut == null) {
            throw new BadRequestException("Check-in and check-out dates are required");
        }

        LocalDate todayIst = LocalDate.now(IST_ZONE);
        if (checkIn.isBefore(todayIst)) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }

        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights < 1) {
            throw new BadRequestException("Minimum booking duration is 1 night");
        }

        if (nights > 30) {
            throw new BadRequestException("Maximum booking duration is 30 nights");
        }

        if (guestsCount < 1) {
            throw new BadRequestException("At least 1 guest is required");
        }

        if (guestsCount > room.getRoomType().getMaxGuests()) {
            throw new BadRequestException("Guest count exceeds the room maximum capacity of " + room.getRoomType().getMaxGuests() + " guests");
        }
    }
}
