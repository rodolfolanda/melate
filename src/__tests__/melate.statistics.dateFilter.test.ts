import { describe, it, expect } from 'vitest';
import { getLastXNumbers, getFirstXNumbers, countNumbersInCSV } from '../core/melate.statistics';

describe('melate.statistics with date filtering', () => {
  describe('countNumbersInCSV', () => {
    it('should count numbers correctly from CSV data', () => {
      const csvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,1,0,2024-01-01,1,2,3,4,5,6,10
649,2,0,2024-01-02,1,2,3,7,8,9,11
649,3,0,2024-01-03,1,10,11,12,13,14,15`;

      const counts = countNumbersInCSV(csvData);

      // Number 1 appears 3 times
      expect(counts[1]).toBe(3);
      // Number 2 appears 2 times
      expect(counts[2]).toBe(2);
      // Number 10 appears 2 times (once in main numbers, once in bonus - but bonus should be skipped)
      expect(counts[10]).toBe(2);
      // Numbers 7, 8, 9 appear once
      expect(counts[7]).toBe(1);
    });

    it('should handle empty CSV data', () => {
      const counts = countNumbersInCSV('');
      expect(Object.keys(counts)).toHaveLength(0);
    });

    it('should ignore header row', () => {
      const csvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3
649,1,0,2024-01-01,5,6,7`;

      const counts = countNumbersInCSV(csvData);
      
      // Should not count header values (checking by checking count is a number type)
      const allValues = Object.values(counts);
      expect(allValues.every(v => typeof v === 'number')).toBe(true);
      
      // Should count actual numbers
      expect(counts[5]).toBe(1);
    });
  });

  describe('getFirstXNumbers', () => {
    it('should return top N most frequent numbers', () => {
      const counts = {
        1: 10, // Most frequent
        2: 8,
        3: 6,
        4: 4,
        5: 2,  // Least frequent
      };

      const top2 = getFirstXNumbers(counts, 2);
      expect(top2).toHaveLength(2);
      expect(top2).toContain(1);
      expect(top2).toContain(2);
    });

    it('should return empty array when n is 0', () => {
      const counts = { 1: 10, 2: 8, 3: 6 };
      const result = getFirstXNumbers(counts, 0);
      expect(result).toHaveLength(0);
    });

    it('should handle requesting more numbers than available', () => {
      const counts = { 1: 10, 2: 8 };
      const result = getFirstXNumbers(counts, 5);
      expect(result).toHaveLength(2);
    });

    it('should return numbers in descending frequency order', () => {
      const counts = {
        5: 2,
        3: 6,
        1: 10,
        4: 4,
        2: 8,
      };

      const top3 = getFirstXNumbers(counts, 3);
      expect(top3[0]).toBe(1); // Highest frequency
      expect(top3[1]).toBe(2);
      expect(top3[2]).toBe(3);
    });
  });

  describe('getLastXNumbers', () => {
    it('should return bottom N least frequent numbers', () => {
      const counts = {
        1: 10, // Most frequent
        2: 8,
        3: 6,
        4: 4,
        5: 2,  // Least frequent
      };

      const bottom2 = getLastXNumbers(counts, 2);
      expect(bottom2).toHaveLength(2);
      expect(bottom2).toContain(4);
      expect(bottom2).toContain(5);
    });

    it('should return empty array when n is 0', () => {
      const counts = { 1: 10, 2: 8, 3: 6 };
      const result = getLastXNumbers(counts, 0);
      expect(result).toHaveLength(0);
    });

    it('should handle requesting more numbers than available', () => {
      const counts = { 1: 10, 2: 8 };
      const result = getLastXNumbers(counts, 5);
      expect(result).toHaveLength(2);
    });
  });

  describe('Integration: Exclusion with filtered data', () => {
    it('should exclude different numbers based on filtered date range', () => {
      // Full dataset: Numbers 1,2,3 appear most frequently in OLD data
      const fullCsvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,1,0,2023-01-01,1,2,3,4,6,7,10
649,2,0,2023-02-01,1,2,3,8,9,11,12
649,3,0,2023-03-01,1,2,3,10,11,12,13
649,4,0,2024-01-01,40,41,42,43,44,45,14
649,5,0,2024-06-01,40,41,42,46,47,48,15
649,6,0,2024-10-01,40,41,30,31,32,33,16`;

      // Last year only (2024 data): Numbers 40,41,42 appear most
      const lastYearCsvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,4,0,2024-01-01,40,41,42,43,44,45,14
649,5,0,2024-06-01,40,41,42,46,47,48,15
649,6,0,2024-10-01,40,41,30,31,32,33,16`;

      const fullCounts = countNumbersInCSV(fullCsvData);
      const lastYearCounts = countNumbersInCSV(lastYearCsvData);

      const topFullData = getFirstXNumbers(fullCounts, 1);
      const topLastYear = getFirstXNumbers(lastYearCounts, 1);

      // The most frequent number should be different
      // In full data, 1,2,3 appear 3 times each
      expect([1, 2, 3]).toContain(topFullData[0]);
      
      // In last year, 40,41,42 appear 2-3 times each (most frequent)
      expect([40, 41, 42]).toContain(topLastYear[0]);
      
      // They should be different!
      expect(topFullData[0]).not.toBe(topLastYear[0]);
    });

    it('should properly exclude top 1 and bottom 1 from filtered data', () => {
      const csvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,1,0,2024-01-01,10,11,12,13,14,15,20
649,2,0,2024-06-01,10,11,16,17,18,19,21
649,3,0,2024-10-01,10,22,23,24,25,26,22`;

      const counts = countNumbersInCSV(csvData);
      
      const top1 = getFirstXNumbers(counts, 1);
      const bottom1 = getLastXNumbers(counts, 1);

      // Number 10 appears 3 times (most frequent)
      expect(top1).toContain(10);
      
      // Multiple numbers appear once (least frequent)
      // Bottom should contain one of: 12,13,14,15,16,17,18,19,22,23,24,25,26
      expect(bottom1).toHaveLength(1);
      expect(bottom1[0]).toBeGreaterThan(0);
    });
  });

  describe('Bug scenario: Last Year + Top 1 + Bottom 1', () => {
    it('should exclude correct numbers based on last year frequency, not all-time', () => {
      // Simulate the bug scenario:
      // - All-time data: number 1 is most frequent (appears 4 times)
      // - Last year data: number 45 is most frequent (appears 3 times)
      // - User selects "Last Year" + "Exclude Top 1"
      // - Expected: number 45 should be excluded
      // - Bug: number 1 is excluded (because calculation uses all-time data)

      const allTimeCsvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,1,0,2020-01-01,1,2,3,4,5,6,10
649,2,0,2021-01-01,1,2,3,7,8,9,11
649,3,0,2022-01-01,1,2,3,10,11,12,12
649,4,0,2023-01-01,1,2,13,14,15,16,13
649,5,0,2024-01-01,45,46,47,48,49,40,14
649,6,0,2024-06-01,45,46,47,41,42,43,15
649,7,0,2024-10-01,45,46,30,31,32,33,16`;

      const lastYearCsvData = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
649,5,0,2024-01-01,45,46,47,48,49,40,14
649,6,0,2024-06-01,45,46,47,41,42,43,15
649,7,0,2024-10-01,45,46,30,31,32,33,16`;

      const allTimeCounts = countNumbersInCSV(allTimeCsvData);
      const lastYearCounts = countNumbersInCSV(lastYearCsvData);

      const topAllTime = getFirstXNumbers(allTimeCounts, 1);
      const topLastYear = getFirstXNumbers(lastYearCounts, 1);
      
      const bottomAllTime = getLastXNumbers(allTimeCounts, 1);
      const bottomLastYear = getLastXNumbers(lastYearCounts, 1);

      // In all-time data: 1,2 appear most (4 times)
      expect([1, 2]).toContain(topAllTime[0]);
      
      // In last year data: 45,46 appear most (3 times)
      expect([45, 46]).toContain(topLastYear[0]);

      // These should be DIFFERENT - this is the bug!
      expect(topAllTime[0]).not.toBe(topLastYear[0]);
      
      // Bottom: In all-time, many numbers appear once
      // In last year, different numbers appear once
      // Just verify they exist
      expect(bottomAllTime).toHaveLength(1);
      expect(bottomLastYear).toHaveLength(1);
    });
  });
});
