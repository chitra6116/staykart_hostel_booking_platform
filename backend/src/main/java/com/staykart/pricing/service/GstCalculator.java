package com.staykart.pricing.service;

import com.staykart.pricing.entity.GstSlab;
import com.staykart.pricing.repository.GstSlabRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class GstCalculator {

    private final GstSlabRepository gstSlabRepository;

    public GstCalculator(GstSlabRepository gstSlabRepository) {
        this.gstSlabRepository = gstSlabRepository;
    }

    public record GstResult(
        BigDecimal gstPercentage,
        BigDecimal cgstPercentage,
        BigDecimal sgstPercentage,
        BigDecimal cgstAmountInr,
        BigDecimal sgstAmountInr,
        BigDecimal totalGstInr
    ) {}

    public GstResult calculateGst(BigDecimal perNightTariff) {
        if (perNightTariff == null || perNightTariff.compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal zero = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            return new GstResult(zero, zero, zero, zero, zero, zero);
        }

        List<GstSlab> slabs = gstSlabRepository.findByActiveTrueOrderByMinTariffAsc();
        BigDecimal applicableGstRate = BigDecimal.valueOf(18.00); // Fallback standard rate

        for (GstSlab slab : slabs) {
            boolean matchesMin = perNightTariff.compareTo(slab.getMinTariff()) >= 0;
            boolean matchesMax = (slab.getMaxTariff() == null || perNightTariff.compareTo(slab.getMaxTariff()) <= 0);
            if (matchesMin && matchesMax) {
                applicableGstRate = slab.getGstPercentage();
                break;
            }
        }

        BigDecimal halfRate = applicableGstRate.divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP);
        BigDecimal divisor = BigDecimal.valueOf(100);

        BigDecimal cgst = perNightTariff.multiply(halfRate).divide(divisor, 2, RoundingMode.HALF_UP);
        BigDecimal sgst = perNightTariff.multiply(halfRate).divide(divisor, 2, RoundingMode.HALF_UP);
        BigDecimal totalGst = cgst.add(sgst);

        return new GstResult(
            applicableGstRate.setScale(2, RoundingMode.HALF_UP),
            halfRate.setScale(2, RoundingMode.HALF_UP),
            halfRate.setScale(2, RoundingMode.HALF_UP),
            cgst,
            sgst,
            totalGst
        );
    }
}
