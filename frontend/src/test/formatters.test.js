import { describe, it, expect } from 'vitest';
import { formatINR, formatDate, formatDateTime } from '../utils/formatters';

describe('formatters', () => {
  describe('formatINR', () => {
    it('formats numbers with rupee symbol and Indian digit grouping', () => {
      const formatted = formatINR(125000);
      expect(formatted).toContain('₹');
      // Indian digit grouping: 1,25,000
      expect(formatted).toMatch(/1,25,000/);
    });

    it('formats small amounts', () => {
      const formatted = formatINR(4500);
      expect(formatted).toContain('₹');
      expect(formatted).toMatch(/4,500/);
    });

    it('formats with exact 2 decimal places when alwaysDecimals is true', () => {
      const formatted = formatINR(1250.5, true);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,250.50');
    });

    it('handles null and undefined gracefully', () => {
      expect(formatINR(null)).toBe('₹0');
      expect(formatINR(undefined)).toBe('₹0');
    });
  });

  describe('formatDate', () => {
    it('formats YYYY-MM-DD into DD MMM YYYY format', () => {
      const formatted = formatDate('2026-11-14');
      expect(formatted).toBe('14 Nov 2026');
    });

    it('returns empty string for null or undefined input', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });
});
