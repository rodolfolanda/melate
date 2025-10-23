import { describe, it, expect } from 'vitest';
import {
  getDateRangeFromPreset,
  filterDrawsByDateRange,
  drawsToNumbers,
  getDateBounds,
  validateDateRange,
  formatDateRange,
} from '../core/melate.dateFilter';
import type { LotteryDraw } from '../core/melate.history.browser';

describe('melate.dateFilter', () => {
  // Sample test data
  const createDraw = (dateStr: string, numbers: number[]): LotteryDraw => ({
    date: new Date(dateStr),
    numbers,
    drawNumber: 1,
  });

  const sampleDraws: LotteryDraw[] = [
    createDraw('2023-01-15', [1, 2, 3, 4, 5, 6]),
    createDraw('2023-06-20', [7, 8, 9, 10, 11, 12]),
    createDraw('2024-01-10', [13, 14, 15, 16, 17, 18]),
    createDraw('2024-06-15', [19, 20, 21, 22, 23, 24]),
    createDraw('2024-10-01', [25, 26, 27, 28, 29, 30]),
    createDraw('2024-10-20', [31, 32, 33, 34, 35, 36]),
  ];

  describe('getDateRangeFromPreset', () => {
    it('should return null range for "all" preset', () => {
      const range = getDateRangeFromPreset('all');
      expect(range.from).toBeNull();
      expect(range.to).toBeNull();
    });

    it('should return correct range for "30days" preset', () => {
      const range = getDateRangeFromPreset('30days');
      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);
      
      if (range.from && range.to) {
        const diffDays = Math.floor((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
        expect(diffDays).toBeGreaterThanOrEqual(29);
        expect(diffDays).toBeLessThanOrEqual(31);
      }
    });

    it('should return correct range for "1year" preset', () => {
      const range = getDateRangeFromPreset('1year');
      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);
      
      if (range.from && range.to) {
        const diffYears = range.to.getFullYear() - range.from.getFullYear();
        expect(diffYears).toBe(1);
      }
    });

    it('should return null range for "custom" preset', () => {
      const range = getDateRangeFromPreset('custom');
      expect(range.from).toBeNull();
      expect(range.to).toBeNull();
    });
  });

  describe('filterDrawsByDateRange', () => {
    it('should return all draws when no date range specified', () => {
      const filtered = filterDrawsByDateRange(sampleDraws, { from: null, to: null });
      expect(filtered).toHaveLength(6);
      expect(filtered).toEqual(sampleDraws);
    });

    it('should filter draws after a specific from date', () => {
      const fromDate = new Date('2024-01-01');
      const filtered = filterDrawsByDateRange(sampleDraws, { from: fromDate, to: null });
      
      expect(filtered).toHaveLength(4); // Should include 2024 draws only
      expect(filtered.every(draw => draw.date >= fromDate)).toBe(true);
    });

    it('should filter draws before a specific to date', () => {
      const toDate = new Date('2024-01-01');
      const filtered = filterDrawsByDateRange(sampleDraws, { from: null, to: toDate });
      
      expect(filtered).toHaveLength(2); // Should include 2023 draws only (toDate is exclusive for time)
      expect(filtered.every(draw => draw.date <= toDate)).toBe(true);
    });

    it('should filter draws within a date range', () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-06-30');
      const filtered = filterDrawsByDateRange(sampleDraws, { from: fromDate, to: toDate });
      
      expect(filtered).toHaveLength(2); // Jan and Jun 2024
      expect(filtered.every(draw => draw.date >= fromDate && draw.date <= toDate)).toBe(true);
    });

    it('should handle same day range correctly', () => {
      const date = new Date('2024-10-01');
      const filtered = filterDrawsByDateRange(sampleDraws, { from: date, to: date });
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].numbers).toEqual([25, 26, 27, 28, 29, 30]);
    });

    it('should return empty array when no draws match range', () => {
      const fromDate = new Date('2025-01-01');
      const toDate = new Date('2025-12-31');
      const filtered = filterDrawsByDateRange(sampleDraws, { from: fromDate, to: toDate });
      
      expect(filtered).toHaveLength(0);
    });
  });

  describe('drawsToNumbers', () => {
    it('should convert draws to number arrays', () => {
      const numbers = drawsToNumbers(sampleDraws);
      
      expect(numbers).toHaveLength(6);
      expect(numbers[0]).toEqual([1, 2, 3, 4, 5, 6]);
      expect(numbers[5]).toEqual([31, 32, 33, 34, 35, 36]);
    });

    it('should handle empty array', () => {
      const numbers = drawsToNumbers([]);
      expect(numbers).toHaveLength(0);
    });
  });

  describe('getDateBounds', () => {
    it('should return min and max dates', () => {
      const bounds = getDateBounds(sampleDraws);
      
      expect(bounds.min).toEqual(new Date('2023-01-15'));
      expect(bounds.max).toEqual(new Date('2024-10-20'));
    });

    it('should return null for empty array', () => {
      const bounds = getDateBounds([]);
      
      expect(bounds.min).toBeNull();
      expect(bounds.max).toBeNull();
    });

    it('should handle single draw', () => {
      const singleDraw = [createDraw('2024-05-15', [1, 2, 3, 4, 5, 6])];
      const bounds = getDateBounds(singleDraw);
      
      expect(bounds.min).toEqual(new Date('2024-05-15'));
      expect(bounds.max).toEqual(new Date('2024-05-15'));
    });
  });

  describe('validateDateRange', () => {
    it('should validate when both dates are null', () => {
      const result = validateDateRange({ from: null, to: null });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate when from is before to', () => {
      const result = validateDateRange({
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      });
      expect(result.valid).toBe(true);
    });

    it('should invalidate when from is after to', () => {
      const result = validateDateRange({
        from: new Date('2024-12-31'),
        to: new Date('2024-01-01'),
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Start date must be before end date');
    });

    it('should validate when only from is set', () => {
      const result = validateDateRange({
        from: new Date('2024-01-01'),
        to: null,
      });
      expect(result.valid).toBe(true);
    });

    it('should validate when only to is set', () => {
      const result = validateDateRange({
        from: null,
        to: new Date('2024-12-31'),
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('formatDateRange', () => {
    it('should format "All time" when both dates are null', () => {
      const formatted = formatDateRange({ from: null, to: null });
      expect(formatted).toBe('All time');
    });

    it('should format date range when both dates are set', () => {
      const formatted = formatDateRange({
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31'),
      });
      expect(formatted).toContain('2024');
      expect(formatted).toContain('-');
    });

    it('should format "From" when only from date is set', () => {
      const formatted = formatDateRange({
        from: new Date('2024-06-15'),
        to: null,
      });
      expect(formatted).toContain('From');
      expect(formatted).toContain('2024');
    });

    it('should format "Until" when only to date is set', () => {
      const formatted = formatDateRange({
        from: null,
        to: new Date('2024-12-31'),
      });
      expect(formatted).toContain('Until');
      expect(formatted).toContain('2024');
    });
  });
});
