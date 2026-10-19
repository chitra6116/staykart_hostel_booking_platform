package com.staykart.pricing;

import com.staykart.pricing.entity.GstSlab;
import com.staykart.pricing.repository.GstSlabRepository;
import com.staykart.pricing.service.GstCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GstCalculatorTest {

    @Mock
    private GstSlabRepository gstSlabRepository;

    private GstCalculator gstCalculator;

    @BeforeEach
    void setUp() {
        gstCalculator = new GstCalculator(gstSlabRepository);

        List<GstSlab> slabs = List.of(
            GstSlab.builder().id(1L).minTariff(BigDecimal.ZERO).maxTariff(BigDecimal.valueOf(1000.00)).gstPercentage(BigDecimal.ZERO).active(true).build(),
            GstSlab.builder().id(2L).minTariff(BigDecimal.valueOf(1000.01)).maxTariff(BigDecimal.valueOf(7500.00)).gstPercentage(BigDecimal.valueOf(5.00)).active(true).build(),
            GstSlab.builder().id(3L).minTariff(BigDecimal.valueOf(7500.01)).maxTariff(null).gstPercentage(BigDecimal.valueOf(18.00)).active(true).build()
        );

        when(gstSlabRepository.findByActiveTrueOrderByMinTariffAsc()).thenReturn(slabs);
    }

    @Test
    void shouldApplyZeroGstForTariffUpTo1000() {
        BigDecimal tariff = BigDecimal.valueOf(800.00);
        GstCalculator.GstResult result = gstCalculator.calculateGst(tariff);

        assertEquals(new BigDecimal("0.00"), result.gstPercentage());
        assertEquals(new BigDecimal("0.00"), result.cgstAmountInr());
        assertEquals(new BigDecimal("0.00"), result.sgstAmountInr());
        assertEquals(new BigDecimal("0.00"), result.totalGstInr());
    }

    @Test
    void shouldApplyFivePercentGstForTariffBetween1001And7500WithEqualCgstSgstSplit() {
        // Tariff ₹3,500: 5% = ₹175.00 (CGST 2.5% = ₹87.50, SGST 2.5% = ₹87.50)
        BigDecimal tariff = BigDecimal.valueOf(3500.00);
        GstCalculator.GstResult result = gstCalculator.calculateGst(tariff);

        assertEquals(new BigDecimal("5.00"), result.gstPercentage());
        assertEquals(new BigDecimal("2.50"), result.cgstPercentage());
        assertEquals(new BigDecimal("2.50"), result.sgstPercentage());
        assertEquals(new BigDecimal("87.50"), result.cgstAmountInr());
        assertEquals(new BigDecimal("87.50"), result.sgstAmountInr());
        assertEquals(new BigDecimal("175.00"), result.totalGstInr());
    }

    @Test
    void shouldApplyEighteenPercentGstForTariffAbove7500WithEqualCgstSgstSplit() {
        // Tariff ₹10,000: 18% = ₹1,800.00 (CGST 9% = ₹900.00, SGST 9% = ₹900.00)
        BigDecimal tariff = BigDecimal.valueOf(10000.00);
        GstCalculator.GstResult result = gstCalculator.calculateGst(tariff);

        assertEquals(new BigDecimal("18.00"), result.gstPercentage());
        assertEquals(new BigDecimal("9.00"), result.cgstPercentage());
        assertEquals(new BigDecimal("9.00"), result.sgstPercentage());
        assertEquals(new BigDecimal("900.00"), result.cgstAmountInr());
        assertEquals(new BigDecimal("900.00"), result.sgstAmountInr());
        assertEquals(new BigDecimal("1800.00"), result.totalGstInr());
    }
}
