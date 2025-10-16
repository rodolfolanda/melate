import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateRandomNumbers, games } from '../melate.numbers.js';

describe('melate.numbers', () => {
  describe('games configuration', () => {
    it('should have correct 6/49 game config', () => {
      expect(games.sixFourtyNine).toEqual({
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/649.csv',
        gameType: '6/49',
      });
    });

    it('should have correct Lotto Max game config', () => {
      expect(games.lottoMax).toEqual({
        min: 1,
        max: 50,
        count: 7,
        filePath: 'data/lottomax.csv',
        gameType: 'Lotto Max',
      });
    });

    it('should have correct BC49 game config', () => {
      expect(games.bcSixFourtyNine).toEqual({
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/BC49.csv',
        gameType: 'BC 49',
      });
    });
  });

  describe('generateRandomNumbers', () => {
    beforeEach(() => {
      // Reset random seed for consistent testing
      vi.spyOn(Math, 'random');
    });

    it('should generate the correct count of numbers', () => {
      const config = { min: 1, max: 49, count: 6 };
      const result = generateRandomNumbers(config, [], [], 0);

      expect(result).toHaveLength(6);
    });

    it('should generate numbers within the specified range', () => {
      const config = { min: 1, max: 49, count: 6 };
      const result = generateRandomNumbers(config, [], [], 0);

      result.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(49);
      });
    });

    it('should generate unique numbers (no duplicates)', () => {
      const config = { min: 1, max: 49, count: 6 };
      const result = generateRandomNumbers(config, [], [], 0);

      const uniqueNumbers = new Set(result);
      expect(uniqueNumbers.size).toBe(6);
    });

    it('should return sorted numbers in ascending order', () => {
      const config = { min: 1, max: 49, count: 6 };
      const result = generateRandomNumbers(config, [], [], 0);

      const sortedResult = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sortedResult);
    });

    it('should exclude specified numbers', () => {
      const config = { min: 1, max: 10, count: 5 };
      const exclude = [1, 2, 3];
      
      // Run multiple times to ensure exclusion works consistently
      for (let i = 0; i < 10; i++) {
        const result = generateRandomNumbers(config, [], exclude, 0);
        
        result.forEach(num => {
          expect(exclude).not.toContain(num);
        });
      }
    });

    it('should generate unique sets compared to existing sets', () => {
      const config = { min: 1, max: 20, count: 5 };
      const existingSets = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
      ];

      const result = generateRandomNumbers(config, existingSets, [], 0);

      // Should not be identical to any existing set
      expect(result).not.toEqual([1, 2, 3, 4, 5]);
      expect(result).not.toEqual([6, 7, 8, 9, 10]);
    });

    it('should respect threshold when checking uniqueness', () => {
      const config = { min: 1, max: 20, count: 5 };
      const existingSets = [
        [1, 2, 3, 4, 5],
      ];
      
      // With threshold 1, can have up to 4 matching numbers
      const result = generateRandomNumbers(config, existingSets, [], 1);

      const matches = result.filter(num => existingSets[0].includes(num));
      // Should have fewer than 5 matches (length - threshold)
      expect(matches.length).toBeLessThan(5);
    });

    it('should work with different game configurations', () => {
      // Test with 6/49 config
      const result649 = generateRandomNumbers(
        { min: games.sixFourtyNine.min, max: games.sixFourtyNine.max, count: games.sixFourtyNine.count },
        [],
        [],
        0,
      );
      expect(result649).toHaveLength(6);
      result649.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(49);
      });

      // Test with Lotto Max config
      const resultMax = generateRandomNumbers(
        { min: games.lottoMax.min, max: games.lottoMax.max, count: games.lottoMax.count },
        [],
        [],
        0,
      );
      expect(resultMax).toHaveLength(7);
      resultMax.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(50);
      });
    });
  });
});
