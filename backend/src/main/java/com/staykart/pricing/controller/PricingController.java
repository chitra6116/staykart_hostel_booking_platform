package com.staykart.pricing.controller;

import com.staykart.pricing.dto.PriceBreakdownResponse;
import com.staykart.pricing.dto.PriceQuoteRequest;
import com.staykart.pricing.service.PricingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/pricing")
@Tag(name = "Pricing", description = "Dynamic tariff calculation, GST breakdown and live price quotes")
public class PricingController {

    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @PostMapping("/quote")
    @Operation(summary = "Calculate itemized price quote for room and date range")
    public ResponseEntity<PriceBreakdownResponse> calculateQuote(@Valid @RequestBody PriceQuoteRequest request) {
        return ResponseEntity.ok(
            pricingService.calculatePrice(request.roomId(), request.checkIn(), request.checkOut(), request.guestsCount())
        );
    }

    @GetMapping("/rooms/{roomId}/quote")
    @Operation(summary = "Get price quote for room via query parameters")
    public ResponseEntity<PriceBreakdownResponse> getQuoteByParams(
            @PathVariable Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") int guests) {
        return ResponseEntity.ok(pricingService.calculatePrice(roomId, checkIn, checkOut, guests));
    }
}
