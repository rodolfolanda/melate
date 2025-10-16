import { describe, it, expect } from 'vitest';
import { getLastXNumbers, getFirstXNumbers, countNumbersInCSV } from '../melate.statistics.js';

describe('melate.statistics', () => {
  describe('countNumbersInCSV', () => {
    it('should count occurrences of numbers in CSV data', () => {
      const csvData = `Header,Row,Date,Other,1,2,3
ignored,columns,here,data,5,10,15
more,ignored,data,cols,5,10,20
final,row,data,info,5,15,25`;

      const result = countNumbersInCSV(csvData);

      expect(result[5]).toBe(3);  // appears 3 times
      expect(result[10]).toBe(2); // appears 2 times
      expect(result[15]).toBe(2); // appears 2 times
      expect(result[20]).toBe(1); // appears 1 time
      expect(result[25]).toBe(1); // appears 1 time
    });

    it('should ignore zeros and empty values', () => {
      const csvData = `Header,Row,Date,Other,1,2,3
ignored,columns,here,data,0,,5
more,ignored,data,cols,0,10,`;

      const result = countNumbersInCSV(csvData);

      expect(result[0]).toBeUndefined(); // zeros should be ignored
      expect(result[5]).toBe(1);
      expect(result[10]).toBe(1);
    });

    it('should handle empty CSV data', () => {
      const csvData = 'Header,Row,Date,Other';

      const result = countNumbersInCSV(csvData);

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('getFirstXNumbers', () => {
    it('should return the most frequent numbers', () => {
      const numberCount = {
        1: 10,
        2: 5,
        3: 15,
        4: 8,
        5: 20,
      };

      const result = getFirstXNumbers(numberCount, 2);

      expect(result).toHaveLength(2);
      expect(result).toContain(5);  // highest count (20)
      expect(result).toContain(3);  // second highest (15)
    });

    it('should return empty array when n is 0', () => {
      const numberCount = { 1: 10, 2: 5 };

      const result = getFirstXNumbers(numberCount, 0);

      expect(result).toHaveLength(0);
    });

    it('should handle requesting more numbers than available', () => {
      const numberCount = { 1: 10, 2: 5 };

      const result = getFirstXNumbers(numberCount, 10);

      expect(result).toHaveLength(2);
      expect(result).toContain(1);
      expect(result).toContain(2);
    });
  });

  describe('getLastXNumbers', () => {
    it('should return the least frequent numbers', () => {
      const numberCount = {
        1: 10,
        2: 5,
        3: 15,
        4: 8,
        5: 20,
      };

      const result = getLastXNumbers(numberCount, 2);

      expect(result).toHaveLength(2);
      expect(result).toContain(2);  // lowest count (5)
      expect(result).toContain(4);  // second lowest (8)
    });

    it('should handle n is 0 (returns all numbers due to slice behavior)', () => {
      const numberCount = { 1: 10, 2: 5 };

      const result = getLastXNumbers(numberCount, 0);

      // slice(-0) returns the entire array in JavaScript
      expect(result).toHaveLength(2);
    });

    it('should handle requesting more numbers than available', () => {
      const numberCount = { 1: 10, 2: 5 };

      const result = getLastXNumbers(numberCount, 10);

      expect(result).toHaveLength(2);
      expect(result).toContain(1);
      expect(result).toContain(2);
    });
  });
});
