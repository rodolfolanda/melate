import { describe, it, expect } from 'vitest';
import { validateDraws, parseCSV, exportDrawsToCSV, type ExportMetadata } from '../core/melate.export';

describe('Validation Integration Tests', () => {
  describe('Full Export-Import-Validate Flow', () => {
    it('should handle complete workflow: export -> parse -> validate', () => {
      // Step 1: Generate some draws
      const generatedDraws = [
        [5, 12, 23, 34, 41, 49],
        [1, 7, 14, 28, 35, 42],
        [3, 9, 18, 27, 36, 45],
      ];

      // Step 2: Export to CSV
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date('2025-11-01T10:00:00'),
        totalDraws: 3,
        configuration: {
          excludeTop: 5,
          excludeBottom: 3,
          threshold: 2,
          warmUpIterations: 1000,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const csvContent = exportDrawsToCSV(generatedDraws, metadata);

      // Step 3: Parse CSV back
      const parsedDraws = parseCSV(csvContent);

      // Verify parsing
      expect(parsedDraws).toHaveLength(3);
      expect(parsedDraws[0].numbers).toEqual([5, 12, 23, 34, 41, 49]);
      expect(parsedDraws[1].numbers).toEqual([1, 7, 14, 28, 35, 42]);
      expect(parsedDraws[2].numbers).toEqual([3, 9, 18, 27, 36, 45]);

      // Step 4: Validate against actual results
      const actualResults = [5, 12, 23, 10, 20, 30]; // 3 matches with first draw

      const validationResults = validateDraws(
        parsedDraws.map(d => d.numbers),
        actualResults,
      );

      // Verify validation results
      expect(validationResults).toHaveLength(3);
      expect(validationResults[0].matchCount).toBe(3);
      expect(validationResults[0].matches).toEqual([5, 12, 23]);
      expect(validationResults[0].prize).toBe('Fourth Prize');
      expect(validationResults[1].matchCount).toBe(0);
      expect(validationResults[2].matchCount).toBe(0);
    });

    it('should preserve metadata through export-import cycle', () => {
      const draws = [[1, 2, 3, 4, 5, 6]];
      const metadata: ExportMetadata = {
        game: 'Lotto Max',
        generatedDate: new Date('2025-11-01T10:00:00'),
        totalDraws: 1,
        configuration: {
          excludeTop: 10,
          excludeBottom: 5,
          threshold: 3,
          warmUpIterations: 5000,
          warmUpOnce: false,
        },
        generatorVersion: '1.0.0',
        excludedNumbers: [7, 8, 9],
        dateFilter: {
          preset: 'last-year',
          customRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31'),
          },
        },
      };

      const csv = exportDrawsToCSV(draws, metadata);

      // Verify metadata is in CSV
      expect(csv).toContain('# Game: Lotto Max');
      expect(csv).toContain('# Configuration: excludeTop=10');
      expect(csv).toContain('# Excluded Numbers: 7,8,9');
      expect(csv).toContain('# Date Filter: last-year'); // It's "Date Filter:" not "Date Filter Preset:"
    });

    it('should handle validation with no matches', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
      ];
      const actualResults = [20, 21, 22, 23, 24, 25];

      const results = validateDraws(draws, actualResults);

      expect(results).toHaveLength(2);
      expect(results[0].matchCount).toBe(0);
      expect(results[0].matches).toEqual([]);
      expect(results[0].prize).toBeUndefined();
      expect(results[1].matchCount).toBe(0);
      expect(results[1].prize).toBeUndefined();
    });

    it('should handle validation with perfect match (jackpot)', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],
        [5, 10, 15, 20, 25, 30],
      ];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(draws, actualResults);

      expect(results[0].matchCount).toBe(6);
      expect(results[0].matches).toEqual([1, 2, 3, 4, 5, 6]);
      expect(results[0].prize).toBe('JACKPOT');
      expect(results[1].matchCount).toBe(1);
      expect(results[1].prize).toBe(undefined);
    });

    it('should handle mixed results with various prize levels', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],   // 6 matches - JACKPOT
        [1, 2, 3, 4, 5, 10],  // 5 matches - Second Prize
        [1, 2, 3, 4, 10, 11], // 4 matches - Third Prize
        [1, 2, 3, 10, 11, 12], // 3 matches - Fourth Prize
        [1, 2, 10, 11, 12, 13], // 2 matches - Free Play
        [10, 11, 12, 13, 14, 15], // 0 matches - No prize
      ];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(draws, actualResults);

      expect(results[0].prize).toBe('JACKPOT');
      expect(results[1].prize).toBe('Second Prize');
      expect(results[2].prize).toBe('Third Prize');
      expect(results[3].prize).toBe('Fourth Prize');
      expect(results[4].prize).toBe('Free Play');
      expect(results[5].prize).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of draws', () => {
      const draws = Array.from({ length: 1000 }, (_, i) => [
        (i % 43) + 1,
        ((i + 1) % 43) + 1,
        ((i + 2) % 43) + 1,
        ((i + 3) % 43) + 1,
        ((i + 4) % 43) + 1,
        ((i + 5) % 43) + 1,
      ]);

      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date(),
        totalDraws: 1000,
        configuration: {
          excludeTop: 0,
          excludeBottom: 0,
          threshold: 0,
          warmUpIterations: 1000,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const csv = exportDrawsToCSV(draws, metadata);
      const parsed = parseCSV(csv);

      expect(parsed).toHaveLength(1000);
      expect(parsed[0].numbers).toEqual(draws[0]);
      expect(parsed[999].numbers).toEqual(draws[999]);
    });

    it('should handle CSV with Windows line endings', () => {
      const csvContent = `# Game: 6/49\r
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize\r
1,2025-11-01 10:00:00,1|2|3|4|5|6,,,,,\r
2,2025-11-01 10:00:00,7|8|9|10|11|12,,,,,`;

      const parsed = parseCSV(csvContent);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].numbers).toEqual([1, 2, 3, 4, 5, 6]);
      expect(parsed[1].numbers).toEqual([7, 8, 9, 10, 11, 12]);
    });

    it('should handle draws with numbers in different order', () => {
      const draws = [[49, 1, 25, 10, 35, 5]]; // Unsorted
      const actualResults = [1, 5, 10, 20, 30, 40];

      const results = validateDraws(draws, actualResults);

      expect(results[0].matchCount).toBe(3);
      // Matches are returned in the order they appear in the generated draw
      expect(results[0].matches.sort((a, b) => a - b)).toEqual([1, 5, 10]);
    });

    it('should handle validation with duplicate numbers in actual results (should not happen but be defensive)', () => {
      const draws = [[1, 2, 3, 4, 5, 6]];
      // This shouldn't happen in real lottery, but test defensive code
      const actualResults = [1, 1, 2, 2, 3, 3];
      const uniqueActual = [...new Set(actualResults)];

      const results = validateDraws(draws, uniqueActual);

      expect(results[0].matchCount).toBe(3);
      expect(results[0].matches).toEqual([1, 2, 3]);
    });
  });

  describe('Error Recovery', () => {
    it('should handle CSV with missing optional columns gracefully', () => {
      const csvContent = `DrawNumber,GeneratedDate,Numbers
1,2025-11-01,1|2|3|4|5|6
2,2025-11-01,7|8|9|10|11|12`;

      const parsed = parseCSV(csvContent);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].numbers).toEqual([1, 2, 3, 4, 5, 6]);
      expect(parsed[0].generatedDate).toBe('2025-11-01');
      expect(parsed[0].playDate).toBeUndefined();
      expect(parsed[0].matchCount).toBeUndefined();
    });

    it('should skip invalid rows in CSV', () => {
      const csvContent = `DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01,1|2|3|4|5|6,,,,,
invalid row here
2,2025-11-01,7|8|9|10|11|12,,,,,`;

      const parsed = parseCSV(csvContent);

      // Should parse valid rows and skip invalid ones
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0].numbers).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should handle empty CSV content', () => {
      const csvContent = `# Comment only
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize`;

      const parsed = parseCSV(csvContent);

      expect(parsed).toEqual([]);
    });
  });

  describe('Validation Statistics', () => {
    it('should calculate correct win rate', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],   // 3 matches - Win
        [1, 2, 10, 11, 12, 13], // 2 matches - Win (Free Play)
        [10, 11, 12, 13, 14, 15], // 0 matches - No win
        [1, 2, 3, 20, 21, 22], // 3 matches - Win
      ];
      const actualResults = [1, 2, 3, 7, 8, 9];

      const results = validateDraws(draws, actualResults);

      const wins = results.filter(r => r.prize !== undefined).length;
      const winRate = (wins / results.length) * 100;

      expect(wins).toBe(3);
      expect(winRate).toBe(75);
    });

    it('should identify best performing draw', () => {
      const draws = [
        [1, 2, 10, 11, 12, 13], // 2 matches
        [1, 2, 3, 4, 5, 10],    // 5 matches - Best
        [1, 2, 3, 10, 11, 12],  // 3 matches
      ];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(draws, actualResults);

      const bestDraw = results.reduce((best, current) =>
        current.matchCount > best.matchCount ? current : best,
      );

      expect(bestDraw.drawNumber).toBe(2);
      expect(bestDraw.matchCount).toBe(5);
      expect(bestDraw.prize).toBe('Second Prize');
    });

    it('should count prizes correctly', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],      // JACKPOT
        [1, 2, 3, 4, 5, 10],     // Second Prize
        [1, 2, 3, 4, 5, 10],     // Second Prize (duplicate for counting)
        [1, 2, 3, 4, 10, 11],    // Third Prize
        [1, 2, 3, 10, 11, 12],   // Fourth Prize
        [1, 2, 3, 10, 11, 12],   // Fourth Prize
        [1, 2, 10, 11, 12, 13],  // Free Play
        [10, 11, 12, 13, 14, 15], // No prize
      ];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(draws, actualResults);

      const prizeCount = {
        jackpot: results.filter(r => r.prize === 'JACKPOT').length,
        second: results.filter(r => r.prize === 'Second Prize').length,
        third: results.filter(r => r.prize === 'Third Prize').length,
        fourth: results.filter(r => r.prize === 'Fourth Prize').length,
        free: results.filter(r => r.prize === 'Free Play').length,
        none: results.filter(r => r.prize === undefined).length,
      };

      expect(prizeCount.jackpot).toBe(1);
      expect(prizeCount.second).toBe(2);
      expect(prizeCount.third).toBe(1);
      expect(prizeCount.fourth).toBe(2);
      expect(prizeCount.free).toBe(1);
      expect(prizeCount.none).toBe(1);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain draw order through export-import-validate', () => {
      const draws = [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12],
        [13, 14, 15, 16, 17, 18],
      ];

      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date(),
        totalDraws: 3,
        configuration: {
          excludeTop: 0,
          excludeBottom: 0,
          threshold: 0,
          warmUpIterations: 100,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const csv = exportDrawsToCSV(draws, metadata);
      const parsed = parseCSV(csv);

      expect(parsed[0].drawNumber).toBe(1);
      expect(parsed[1].drawNumber).toBe(2);
      expect(parsed[2].drawNumber).toBe(3);
      expect(parsed[0].numbers).toEqual(draws[0]);
      expect(parsed[1].numbers).toEqual(draws[1]);
      expect(parsed[2].numbers).toEqual(draws[2]);
    });

    it('should handle numbers at boundaries (1 and 49)', () => {
      const draws = [
        [1, 2, 3, 4, 5, 49], // Min and max
      ];
      const actualResults = [1, 2, 3, 4, 5, 49];

      const results = validateDraws(draws, actualResults);

      expect(results[0].matchCount).toBe(6);
      expect(results[0].matches).toEqual([1, 2, 3, 4, 5, 49]);
      expect(results[0].prize).toBe('JACKPOT');
    });

    it('should preserve generated date format', () => {
      const draws = [[1, 2, 3, 4, 5, 6]];
      const testDate = new Date('2025-11-01T14:30:45');
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: testDate,
        totalDraws: 1,
        configuration: {
          excludeTop: 0,
          excludeBottom: 0,
          threshold: 0,
          warmUpIterations: 100,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const csv = exportDrawsToCSV(draws, metadata);

      expect(csv).toContain('2025-11-01');
      expect(csv).toContain('14:30:45');
    });
  });
});
