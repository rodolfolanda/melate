import { describe, it, expect } from 'vitest';
import {
  exportDrawsToCSV,
  generateFilename,
  parseCSV,
  validateDraws,
  updateCSVWithResults,
  type ExportMetadata,
} from '../core/melate.export';

describe('melate.export', () => {
  describe('generateFilename', () => {
    it('should generate correct filename format', () => {
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date('2025-11-01T14:35:22'),
        totalDraws: 100,
        configuration: {
          excludeTop: 5,
          excludeBottom: 3,
          threshold: 2,
          warmUpIterations: 1000,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const filename = generateFilename(metadata);
      expect(filename).toMatch(/^lottery-649-\d{4}-\d{2}-\d{2}-\d{4}-draws-100\.csv$/);
      expect(filename).toContain('lottery-649');
      expect(filename).toContain('draws-100');
      expect(filename.endsWith('.csv')).toBe(true);
    });

    it('should handle different game types', () => {
      const metadata: ExportMetadata = {
        game: 'Lotto Max',
        generatedDate: new Date('2025-11-01T10:00:00'),
        totalDraws: 50,
        configuration: {
          excludeTop: 0,
          excludeBottom: 0,
          threshold: 0,
          warmUpIterations: 100,
          warmUpOnce: false,
        },
        generatorVersion: '1.0.0',
      };

      const filename = generateFilename(metadata);
      expect(filename).toContain('lottomax');
      expect(filename).toContain('draws-50');
    });
  });

  describe('exportDrawsToCSV', () => {
    it('should generate CSV with header comments', () => {
      const draws = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]];
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date('2025-11-01T14:35:22'),
        totalDraws: 2,
        configuration: {
          excludeTop: 5,
          excludeBottom: 3,
          threshold: 2,
          warmUpIterations: 1000,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
      };

      const csv = exportDrawsToCSV(draws, metadata);
      
      expect(csv).toContain('# Lottery Draw Export');
      expect(csv).toContain('# Game: 6/49');
      expect(csv).toContain('# Total Draws: 2');
      expect(csv).toContain('# Configuration: excludeTop=5');
      expect(csv).toContain('# Generator Version: 1.0.0');
    });

    it('should include column headers', () => {
      const draws = [[1, 2, 3, 4, 5, 6]];
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date(),
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
      
      expect(csv).toContain('DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize');
    });

    it('should format numbers with pipe separator', () => {
      const draws = [[1, 2, 3, 4, 5, 6], [10, 20, 30, 40, 45, 49]];
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date('2025-11-01T10:00:00'),
        totalDraws: 2,
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
      
      expect(csv).toContain('1|2|3|4|5|6');
      expect(csv).toContain('10|20|30|40|45|49');
    });

    it('should include excluded numbers in metadata', () => {
      const draws = [[10, 11, 12, 13, 14, 15]];
      const metadata: ExportMetadata = {
        game: '6/49',
        generatedDate: new Date(),
        totalDraws: 1,
        configuration: {
          excludeTop: 2,
          excludeBottom: 2,
          threshold: 0,
          warmUpIterations: 100,
          warmUpOnce: true,
        },
        generatorVersion: '1.0.0',
        excludedNumbers: [1, 2, 48, 49],
      };

      const csv = exportDrawsToCSV(draws, metadata);
      
      expect(csv).toContain('# Excluded Numbers: 1,2,48,49');
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV content correctly', () => {
      const csvContent = `# Lottery Draw Export
# Game: 6/49
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01 14:35:22,1|2|3|4|5|6,,,,,
2,2025-11-01 14:35:22,7|8|9|10|11|12,,,,,`;

      const records = parseCSV(csvContent);
      
      expect(records).toHaveLength(2);
      expect(records[0].drawNumber).toBe(1);
      expect(records[0].numbers).toEqual([1, 2, 3, 4, 5, 6]);
      expect(records[1].drawNumber).toBe(2);
      expect(records[1].numbers).toEqual([7, 8, 9, 10, 11, 12]);
    });

    it('should skip comment lines', () => {
      const csvContent = `# Comment 1
# Comment 2
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01 14:35:22,1|2|3|4|5|6,,,,,`;

      const records = parseCSV(csvContent);
      
      expect(records).toHaveLength(1);
      expect(records[0].numbers).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('should parse validation columns when present', () => {
      const csvContent = `DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01 14:35:22,1|2|3|4|5|6,2025-11-02,2025-11-02,3,1|2|3,Fourth Prize`;

      const records = parseCSV(csvContent);
      
      expect(records[0].matchCount).toBe(3);
      expect(records[0].matched).toBe('1|2|3');
      expect(records[0].prize).toBe('Fourth Prize');
    });
  });

  describe('validateDraws', () => {
    it('should correctly identify matching numbers', () => {
      const generatedDraws = [
        [1, 2, 3, 4, 5, 6],
        [10, 20, 30, 40, 45, 49],
      ];
      const actualResults = [1, 2, 3, 10, 11, 12];

      const results = validateDraws(generatedDraws, actualResults);
      
      expect(results).toHaveLength(2);
      expect(results[0].matchCount).toBe(3);
      expect(results[0].matches).toEqual([1, 2, 3]);
      expect(results[1].matchCount).toBe(1);
      expect(results[1].matches).toEqual([10]);
    });

    it('should assign correct prizes based on match count', () => {
      const generatedDraws = [
        [1, 2, 3, 4, 5, 6],  // 6 matches - JACKPOT
        [1, 2, 3, 4, 5, 7],  // 5 matches - Second Prize
        [1, 2, 3, 4, 7, 8],  // 4 matches - Third Prize
        [1, 2, 3, 7, 8, 9],  // 3 matches - Fourth Prize
        [1, 2, 7, 8, 9, 10], // 2 matches - Free Play
        [7, 8, 9, 10, 11, 12], // 0 matches - No prize
      ];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(generatedDraws, actualResults);
      
      expect(results[0].prize).toBe('JACKPOT');
      expect(results[1].prize).toBe('Second Prize');
      expect(results[2].prize).toBe('Third Prize');
      expect(results[3].prize).toBe('Fourth Prize');
      expect(results[4].prize).toBe('Free Play');
      expect(results[5].prize).toBeUndefined();
    });

    it('should handle no matches', () => {
      const generatedDraws = [[10, 11, 12, 13, 14, 15]];
      const actualResults = [1, 2, 3, 4, 5, 6];

      const results = validateDraws(generatedDraws, actualResults);
      
      expect(results[0].matchCount).toBe(0);
      expect(results[0].matches).toEqual([]);
      expect(results[0].prize).toBeUndefined();
    });
  });

  describe('updateCSVWithResults', () => {
    it('should update CSV with validation results', () => {
      const originalCSV = `# Lottery Draw Export
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01 14:35:22,1|2|3|4|5|6,,,,,
2,2025-11-01 14:35:22,7|8|9|10|11|12,,,,,`;

      const validationResults = [
        {
          drawNumber: 1,
          generated: [1, 2, 3, 4, 5, 6],
          actual: [1, 2, 3, 10, 11, 12],
          matches: [1, 2, 3],
          matchCount: 3,
          prize: 'Fourth Prize',
        },
        {
          drawNumber: 2,
          generated: [7, 8, 9, 10, 11, 12],
          actual: [1, 2, 3, 10, 11, 12],
          matches: [10, 11, 12],
          matchCount: 3,
          prize: 'Fourth Prize',
        },
      ];

      const updatedCSV = updateCSVWithResults(originalCSV, validationResults);
      
      expect(updatedCSV).toContain('3');
      expect(updatedCSV).toContain('1|2|3');
      expect(updatedCSV).toContain('Fourth Prize');
      expect(updatedCSV).toContain('10|11|12');
    });

    it('should preserve header comments', () => {
      const originalCSV = `# Lottery Draw Export
# Game: 6/49
DrawNumber,GeneratedDate,Numbers,PlayDate,ActualDrawDate,MatchCount,Matched,Prize
1,2025-11-01 14:35:22,1|2|3|4|5|6,,,,,`;

      const validationResults = [
        {
          drawNumber: 1,
          generated: [1, 2, 3, 4, 5, 6],
          actual: [1, 2, 3, 10, 11, 12],
          matches: [1, 2, 3],
          matchCount: 3,
          prize: 'Fourth Prize',
        },
      ];

      const updatedCSV = updateCSVWithResults(originalCSV, validationResults);
      
      expect(updatedCSV).toContain('# Lottery Draw Export');
      expect(updatedCSV).toContain('# Game: 6/49');
    });
  });
});
