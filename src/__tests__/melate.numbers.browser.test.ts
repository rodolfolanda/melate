import { describe, it, expect } from 'vitest';
import { generateRandomNumbers } from '../core/melate.numbers.browser';

describe('melate.numbers.browser', () => {
  describe('generateRandomNumbers', () => {
    it('should generate numbers with no exclusions (threshold > 0)', () => {
      const config = { min: 1, max: 49, count: 6 };
      const existingSets: number[][] = [[1, 2, 3, 4, 5, 6]];
      const exclude: number[] = [];
      const threshold = 2;

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(6);
      expect(result.every(num => num >= 1 && num <= 49)).toBe(true);
      expect(new Set(result).size).toBe(6); // All unique
      expect(result).toEqual([...result].sort((a, b) => a - b)); // Sorted
    });

    it('should generate numbers with empty exclusion list', () => {
      const config = { min: 1, max: 49, count: 6 };
      const existingSets: number[][] = [];
      const exclude: number[] = [];
      const threshold = 0;

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(6);
      expect(result.every(num => num >= 1 && num <= 49)).toBe(true);
    });

    it('should exclude specified numbers', () => {
      const config = { min: 1, max: 10, count: 5 };
      const existingSets: number[][] = [];
      const exclude = [1, 2, 3, 4, 5];
      const threshold = 0;

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(5);
      // Should only contain numbers 6-10
      expect(result.every(num => num >= 6 && num <= 10)).toBe(true);
      expect(result.every(num => !exclude.includes(num))).toBe(true);
    });

    it('should generate unique sets with threshold', () => {
      const config = { min: 1, max: 49, count: 6 };
      const existingSets: number[][] = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ];
      const exclude: number[] = [];
      const threshold = 3; // Allow up to 3 matching numbers

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(6);
      
      // Check that result doesn't match any existing set too closely
      existingSets.forEach(existingSet => {
        const matches = result.filter(num => existingSet.includes(num));
        expect(matches.length).toBeLessThan(6 - threshold);
      });
    });

    it('should handle small number ranges', () => {
      const config = { min: 1, max: 7, count: 6 };
      const existingSets: number[][] = [];
      const exclude: number[] = [];
      const threshold = 2;

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(6);
      expect(result.every(num => num >= 1 && num <= 7)).toBe(true);
    });

    it('should throw error when impossible to generate valid numbers', () => {
      const config = { min: 1, max: 10, count: 6 };
      const existingSets: number[][] = [];
      // Exclude too many numbers, making it impossible
      const exclude = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const threshold = 0;

      expect(() => {
        generateRandomNumbers(config, existingSets, exclude, threshold);
      }).toThrow('Unable to generate valid numbers');
    });

    it('should work with Lotto Max config (7 numbers from 1-50)', () => {
      const config = { min: 1, max: 50, count: 7 };
      const existingSets: number[][] = [[1, 2, 3, 4, 5, 6, 7]];
      const exclude = [1, 2, 3];
      const threshold = 2;

      const result = generateRandomNumbers(config, existingSets, exclude, threshold);

      expect(result).toHaveLength(7);
      expect(result.every(num => num >= 1 && num <= 50)).toBe(true);
      expect(result.every(num => !exclude.includes(num))).toBe(true);
    });
  });

});

