import { describe, it, expect } from 'vitest';
import {
  calculateFrequencyDistribution,
  getHotNumbers,
  getColdNumbers,
  calculateOddEvenRatio,
  calculateRangeDistribution,
  analyzeNumberSet,
  calculateNumberPairs,
} from '../core/analytics';

describe('analytics', () => {
  const mockHistoricalData = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
    [1, 2, 3, 13, 14, 15],
    [1, 2, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25],
  ];

  describe('calculateFrequencyDistribution', () => {
    it('should calculate frequency for all numbers', () => {
      const result = calculateFrequencyDistribution(mockHistoricalData, 25);

      expect(result).toHaveLength(25);
      expect(result[0].number).toBe(1);
      expect(result[0].count).toBe(3); // 1 appears 3 times
      expect(result[1].count).toBe(3); // 2 appears 3 times
      expect(result[2].count).toBe(2); // 3 appears 2 times
    });

    it('should calculate correct percentages', () => {
      const result = calculateFrequencyDistribution(mockHistoricalData, 25);
      const totalDraws = mockHistoricalData.length * 6; // 5 draws * 6 numbers = 30

      const firstNumber = result.find(r => r.number === 1);
      expect(firstNumber).toBeDefined();
      if (firstNumber) {
        expect(firstNumber.percentage).toBeCloseTo((3 / totalDraws) * 100, 2);
      }
    });

    it('should handle empty data', () => {
      const result = calculateFrequencyDistribution([], 10);

      expect(result).toHaveLength(10);
      expect(result.every(r => r.count === 0)).toBe(true);
      expect(result.every(r => r.percentage === 0)).toBe(true);
    });

    it('should ignore numbers outside range', () => {
      const dataWithOutliers = [[1, 2, 3, 4, 5, 100]]; // 100 is out of range
      const result = calculateFrequencyDistribution(dataWithOutliers, 50);

      const num100 = result.find(r => r.number === 100);
      expect(num100).toBeUndefined();
    });
  });

  describe('getHotNumbers', () => {
    it('should return top N most frequent numbers', () => {
      const frequency = calculateFrequencyDistribution(mockHistoricalData, 25);
      const hotNumbers = getHotNumbers(frequency, 3);

      expect(hotNumbers).toHaveLength(3);
      expect(hotNumbers[0].number).toBe(1); // Most frequent
      expect(hotNumbers[0].count).toBe(3);
      expect(hotNumbers[1].number).toBe(2);
      expect(hotNumbers[1].count).toBe(3);
    });

    it('should default to 10 numbers', () => {
      const frequency = calculateFrequencyDistribution(mockHistoricalData, 25);
      const hotNumbers = getHotNumbers(frequency);

      expect(hotNumbers).toHaveLength(10);
    });

    it('should handle requesting more than available', () => {
      const frequency = calculateFrequencyDistribution(mockHistoricalData, 5);
      const hotNumbers = getHotNumbers(frequency, 20);

      expect(hotNumbers).toHaveLength(5);
    });
  });

  describe('getColdNumbers', () => {
    it('should return top N least frequent numbers', () => {
      const frequency = calculateFrequencyDistribution(mockHistoricalData, 25);
      const coldNumbers = getColdNumbers(frequency, 3);

      expect(coldNumbers).toHaveLength(3);
      // Numbers that never appeared should be coldest
      expect(coldNumbers.every(n => n.count === 0 || n.count === 1)).toBe(true);
    });

    it('should default to 10 numbers', () => {
      const frequency = calculateFrequencyDistribution(mockHistoricalData, 25);
      const coldNumbers = getColdNumbers(frequency);

      expect(coldNumbers).toHaveLength(10);
    });
  });

  describe('calculateOddEvenRatio', () => {
    it('should calculate odd/even distribution', () => {
      const result = calculateOddEvenRatio(mockHistoricalData);

      // In mockHistoricalData: odd numbers are 1,3,5,7,9,11,13,15,17,19,21,23,25
      // even numbers are 2,4,6,8,10,12,14,16,18,20,22,24
      expect(result.odd).toBeGreaterThan(0);
      expect(result.even).toBeGreaterThan(0);
      expect(result.oddPercentage + result.evenPercentage).toBeCloseTo(100, 1);
    });

    it('should handle empty data', () => {
      const result = calculateOddEvenRatio([]);

      expect(result.odd).toBe(0);
      expect(result.even).toBe(0);
      expect(result.oddPercentage).toBe(0);
      expect(result.evenPercentage).toBe(0);
    });

    it('should handle all odd numbers', () => {
      const allOdd = [[1, 3, 5, 7, 9, 11]];
      const result = calculateOddEvenRatio(allOdd);

      expect(result.odd).toBe(6);
      expect(result.even).toBe(0);
      expect(result.oddPercentage).toBe(100);
      expect(result.evenPercentage).toBe(0);
    });

    it('should handle all even numbers', () => {
      const allEven = [[2, 4, 6, 8, 10, 12]];
      const result = calculateOddEvenRatio(allEven);

      expect(result.odd).toBe(0);
      expect(result.even).toBe(6);
      expect(result.oddPercentage).toBe(0);
      expect(result.evenPercentage).toBe(100);
    });
  });

  describe('calculateRangeDistribution', () => {
    it('should distribute numbers into ranges', () => {
      const result = calculateRangeDistribution(mockHistoricalData, 25, 10);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.range.includes('-'))).toBe(true);
      expect(result.every(r => r.count >= 0)).toBe(true);
      expect(result.every(r => r.percentage >= 0)).toBe(true);
    });

    it('should have correct range format', () => {
      const result = calculateRangeDistribution(mockHistoricalData, 30, 10);

      const firstRange = result[0];
      expect(firstRange.range).toBe('1-10');
      expect(firstRange.count).toBeGreaterThan(0);
    });

    it('should handle custom range size', () => {
      const result = calculateRangeDistribution(mockHistoricalData, 20, 5);

      expect(result[0].range).toBe('1-5');
      expect(result[1].range).toBe('6-10');
    });

    it('should handle empty data', () => {
      const result = calculateRangeDistribution([], 50, 10);

      expect(result.every(r => r.count === 0)).toBe(true);
      expect(result.every(r => r.percentage === 0)).toBe(true);
    });
  });

  describe('analyzeNumberSet', () => {
    it('should analyze a number set correctly', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const result = analyzeNumberSet(numbers);

      expect(result.oddCount).toBe(3); // 1, 3, 5
      expect(result.evenCount).toBe(3); // 2, 4, 6
      expect(result.sum).toBe(21);
      expect(result.average).toBe(3.5);
      expect(result.rangeSpread).toBe(5); // 6 - 1
      expect(result.consecutiveCount).toBe(5); // All consecutive
    });

    it('should handle non-consecutive numbers', () => {
      const numbers = [1, 5, 10, 15, 20, 25];
      const result = analyzeNumberSet(numbers);

      expect(result.consecutiveCount).toBe(0);
      expect(result.rangeSpread).toBe(24); // 25 - 1
    });

    it('should handle mixed odd/even', () => {
      const numbers = [1, 2, 4, 7, 9, 12];
      const result = analyzeNumberSet(numbers);

      expect(result.oddCount).toBe(3); // 1, 7, 9
      expect(result.evenCount).toBe(3); // 2, 4, 12
    });

    it('should handle single number', () => {
      const numbers = [42];
      const result = analyzeNumberSet(numbers);

      expect(result.sum).toBe(42);
      expect(result.average).toBe(42);
      expect(result.rangeSpread).toBe(0);
      expect(result.consecutiveCount).toBe(0);
    });
  });

  describe('calculateNumberPairs', () => {
    it('should find frequently occurring pairs', () => {
      const result = calculateNumberPairs(mockHistoricalData, 2);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(p => p.pair.length === 2)).toBe(true);
      expect(result.every(p => p.count >= 2)).toBe(true);
      // Pairs should be sorted by count descending
      if (result.length > 1) {
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
      }
    });

    it('should filter by minimum occurrences', () => {
      const result = calculateNumberPairs(mockHistoricalData, 3);

      // Only pairs that appear 3+ times
      expect(result.every(p => p.count >= 3)).toBe(true);
    });

    it('should find common pairs', () => {
      const result = calculateNumberPairs(mockHistoricalData, 1);

      // 1-2 appears 3 times, should be one of the top pairs
      const pair12 = result.find(
        p => (p.pair[0] === 1 && p.pair[1] === 2) ||
             (p.pair[0] === 2 && p.pair[1] === 1),
      );
      expect(pair12).toBeDefined();
      if (pair12) {
        expect(pair12.count).toBe(3);
      }
    });

    it('should handle empty data', () => {
      const result = calculateNumberPairs([], 1);

      expect(result).toHaveLength(0);
    });

    it('should default to minimum 5 occurrences', () => {
      const result = calculateNumberPairs(mockHistoricalData);

      // With our mock data, no pairs appear 5+ times
      expect(result.length).toBeLessThan(mockHistoricalData.length);
    });
  });
});
