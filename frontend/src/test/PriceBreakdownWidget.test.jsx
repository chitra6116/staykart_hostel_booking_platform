import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceBreakdownWidget from '../components/booking/PriceBreakdownWidget';

describe('PriceBreakdownWidget', () => {
  it('displays empty prompt when no quote is provided', () => {
    render(<PriceBreakdownWidget quote={null} />);
    expect(screen.getByText(/Select check-in and check-out dates/i)).toBeInTheDocument();
  });

  it('renders itemized breakdown with GST slab and CGST/SGST split', () => {
    const mockQuote = {
      nightsCount: 2,
      totalBaseInr: '8000.00',
      totalDiscountInr: '0.00',
      taxableAmountInr: '8000.00',
      cgstInr: '720.00',
      sgstInr: '720.00',
      totalAmountInr: '9440.00',
      dailyBreakdown: [
        {
          date: '2026-11-14',
          dayOfWeek: 'SATURDAY',
          basePriceInr: '4000.00',
          seasonalMultiplier: '1.00',
          isWeekend: true,
          weekendMultiplier: '1.00',
          discountPercentage: '0.00',
          discountAmountInr: '0.00',
          taxableAmountInr: '4000.00',
          gstPercentage: '18.00',
          cgstInr: '360.00',
          sgstInr: '360.00',
          totalNightInr: '4720.00'
        }
      ]
    };

    render(<PriceBreakdownWidget quote={mockQuote} />);

    expect(screen.getByText('Price Breakdown')).toBeInTheDocument();
    expect(screen.getByText('2 Nights')).toBeInTheDocument();
    expect(screen.getByText(/18% GST/i)).toBeInTheDocument();
    expect(screen.getByText(/CGST \(Central GST: 9.0%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/SGST \(State GST: 9.0%\)/i)).toBeInTheDocument();
  });
});
