import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDrawsForGame } from '../melate.play.js';
import * as melateNumbers from '../melate.numbers.js';
import * as melateStatistics from '../melate.statistics.js';

describe('melate.play', () => {
  // Mock console.log to avoid cluttering test output
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('generateDrawsForGame', () => {
    it('should generate the specified number of draws', async () => {
      // Mock dependencies
      const mockCsvData = `Header,Row,Date,Other,1,2,3
data,row,2024,info,5,10,15
data,row,2024,info,5,10,20`;

      const mockGameData = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'Test Game',
      };

      // Spy on functions
      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({
        5: 2,
        10: 2,
        15: 1,
        20: 1,
      });

      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([5]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([20]);

      const generateRandomNumbersSpy = vi
        .spyOn(melateNumbers, 'generateRandomNumbers')
        .mockReturnValue([1, 2, 3, 4, 6, 7]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      // Execute
      generateDrawsForGame(
        mockGame,
        mockCsvData,
        mockCsvDataForGame,
        1, // excludeTop
        1, // excludeLast
        0, // threshold
        2, // warmUp
        3, // howManyDraws
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify
      expect(consoleLogSpy).toHaveBeenCalledWith('Generated numbers for Test Game game:');
      expect(mockCsvDataForGame).toHaveBeenCalledTimes(3); // Called for each draw
      expect(generateRandomNumbersSpy).toHaveBeenCalled();
    });

    it('should exclude top and bottom frequent numbers', async () => {
      const mockCsvData = `Header,1,2,3
data,1,2,3
data,1,2,4
data,1,2,5`;

      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'Exclude Test',
      };

      const countSpy = vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({
        1: 3, // Most frequent
        2: 3,
        3: 1, // Least frequent
        4: 1,
        5: 1,
      });

      const firstXSpy = vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([1, 2]);
      const lastXSpy = vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([3, 4]);

      const generateSpy = vi
        .spyOn(melateNumbers, 'generateRandomNumbers')
        .mockReturnValue([5, 6, 7, 8, 9, 10]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      // Execute
      generateDrawsForGame(
        mockGame,
        mockCsvData,
        mockCsvDataForGame,
        2, // excludeTop (exclude 1, 2)
        2, // excludeLast (exclude 3, 4)
        0,
        1,
        1,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify exclusions were calculated
      expect(countSpy).toHaveBeenCalledWith(mockCsvData);
      expect(firstXSpy).toHaveBeenCalledWith(expect.any(Object), 2);
      expect(lastXSpy).toHaveBeenCalledWith(expect.any(Object), 2);

      // Verify generateRandomNumbers was called with correct exclusions
      expect(generateSpy).toHaveBeenCalledWith(
        mockGame,
        mockGameData,
        expect.arrayContaining([1, 2, 3, 4]), // Should exclude both top and bottom
        expect.any(Number),
      );
    });

    it('should use correct warmUp iterations', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'WarmUp Test',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({ 1: 1 });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);

      const generateSpy = vi
        .spyOn(melateNumbers, 'generateRandomNumbers')
        .mockReturnValue([1, 2, 3, 4, 5, 6]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      const warmUpIterations = 5;

      // Execute
      generateDrawsForGame(
        mockGame,
        mockCsvData,
        mockCsvDataForGame,
        0,
        0,
        0,
        warmUpIterations,
        1, // Just one draw
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify generateRandomNumbers was called warmUpIterations + 1 times
      // (warmUp iterations + final result)
      expect(generateSpy).toHaveBeenCalledTimes(warmUpIterations + 1);
    });

    it('should pass correct threshold to generateRandomNumbers', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'Threshold Test',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({ 1: 1 });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);

      const generateSpy = vi
        .spyOn(melateNumbers, 'generateRandomNumbers')
        .mockReturnValue([1, 2, 3, 4, 5, 6]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      const threshold = 2;

      // Execute
      generateDrawsForGame(mockGame, mockCsvData, mockCsvDataForGame, 0, 0, threshold, 1, 1);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify threshold was passed correctly
      expect(generateSpy).toHaveBeenCalledWith(
        mockGame,
        mockGameData,
        expect.any(Array),
        threshold,
      );
    });

    it('should work with zero excludes', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'No Exclude Test',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({
        1: 1,
        2: 1,
        3: 1,
      });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);

      const generateSpy = vi
        .spyOn(melateNumbers, 'generateRandomNumbers')
        .mockReturnValue([1, 2, 3, 4, 5, 6]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      // Execute with zero excludes
      generateDrawsForGame(
        mockGame,
        mockCsvData,
        mockCsvDataForGame,
        0, // excludeTop = 0
        0, // excludeLast = 0
        0,
        1,
        1,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify empty exclusion array was passed
      expect(generateSpy).toHaveBeenCalledWith(mockGame, mockGameData, [], expect.any(Number));
    });

    it('should handle multiple draws correctly', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'Multiple Draws Test',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({ 1: 1 });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);

      vi.spyOn(melateNumbers, 'generateRandomNumbers').mockReturnValue([1, 2, 3, 4, 5, 6]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      const numberOfDraws = 5;

      // Execute
      generateDrawsForGame(mockGame, mockCsvData, mockCsvDataForGame, 0, 0, 0, 1, numberOfDraws);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify console.log was called for header + each draw
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Generated numbers for Multiple Draws Test game:',
      );
      // Each draw logs its numbers
      expect(consoleLogSpy).toHaveBeenCalledWith([1, 2, 3, 4, 5, 6]);
      expect(mockCsvDataForGame).toHaveBeenCalledTimes(numberOfDraws);
    });

    it('should log game type correctly', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 50,
        count: 7,
        filePath: 'data/test.csv',
        gameType: 'Custom Game Name',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({ 1: 1 });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);
      vi.spyOn(melateNumbers, 'generateRandomNumbers').mockReturnValue([1, 2, 3, 4, 5, 6, 7]);

      const mockCsvDataForGame = vi.fn().mockResolvedValue(mockGameData);

      // Execute
      generateDrawsForGame(mockGame, mockCsvData, mockCsvDataForGame, 0, 0, 0, 1, 1);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify correct game name was logged
      expect(consoleLogSpy).toHaveBeenCalledWith('Generated numbers for Custom Game Name game:');
    });

    it('should handle async data fetcher correctly', async () => {
      const mockCsvData = 'test,data';
      const mockGameData = [[1, 2, 3, 4, 5, 6]];

      const mockGame = {
        min: 1,
        max: 49,
        count: 6,
        filePath: 'data/test.csv',
        gameType: 'Async Test',
      };

      vi.spyOn(melateStatistics, 'countNumbersInCSV').mockReturnValue({ 1: 1 });
      vi.spyOn(melateStatistics, 'getFirstXNumbers').mockReturnValue([]);
      vi.spyOn(melateStatistics, 'getLastXNumbers').mockReturnValue([]);
      vi.spyOn(melateNumbers, 'generateRandomNumbers').mockReturnValue([1, 2, 3, 4, 5, 6]);

      // Create async mock that takes time to resolve
      const mockCsvDataForGame = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockGameData), 10);
          }),
      );

      // Execute
      generateDrawsForGame(mockGame, mockCsvData, mockCsvDataForGame, 0, 0, 0, 1, 2);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify async fetcher was called
      expect(mockCsvDataForGame).toHaveBeenCalledTimes(2);
    });
  });
});
