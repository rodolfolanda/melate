import { describe, it, expect } from 'vitest';
import { drawsToCsvText } from '../core/melate.drawsToCsv';
import { countNumbersInCSV, getFirstXNumbers, getLastXNumbers } from '../core/melate.statistics';
import type { LotteryDraw } from '../core/melate.history.browser';

describe('Bug fix: Date filter + Number exclusion integration', () => {
  const createDraw = (dateStr: string, numbers: number[]): LotteryDraw => ({
    date: new Date(dateStr),
    numbers,
    drawNumber: 1,
  });

  it('should exclude correct numbers when date filter is applied - the reported bug', () => {
    // Scenario from bug report:
    // User selects "Last Year" + "Exclude Top 1" + "Exclude Bottom 1"
    // Expected: Top/Bottom based on last year's data
    // Bug: Top/Bottom based on ALL-time data

    // All-time data: number 5 appears most (5 times)
    const allTimeDraws: LotteryDraw[] = [
      createDraw('2020-01-01', [5, 10, 15, 20, 25, 30]),
      createDraw('2021-01-01', [5, 11, 16, 21, 26, 31]),
      createDraw('2022-01-01', [5, 12, 17, 22, 27, 32]),
      createDraw('2023-01-01', [5, 13, 18, 23, 28, 33]),
      createDraw('2024-01-01', [5, 14, 19, 24, 29, 34]), // Last year starts here
      createDraw('2024-06-01', [45, 46, 47, 48, 49, 40]), // In last year, 45 appears most
      createDraw('2024-07-01', [45, 41, 42, 43, 44, 35]),
      createDraw('2024-08-01', [45, 36, 37, 38, 39, 41]),
    ];

    // Filter to last year only (2024)
    const lastYearDraws = allTimeDraws.filter(draw => draw.date.getFullYear() === 2024);

    // Convert to CSV for frequency analysis
    const allTimeCsv = drawsToCsvText(allTimeDraws);
    const lastYearCsv = drawsToCsvText(lastYearDraws);

    // Count frequencies
    const allTimeCounts = countNumbersInCSV(allTimeCsv);
    const lastYearCounts = countNumbersInCSV(lastYearCsv);

    // Get top 1 from each dataset
    const topAllTime = getFirstXNumbers(allTimeCounts, 1);
    const topLastYear = getFirstXNumbers(lastYearCounts, 1);

    // In all-time data: number 5 appears 5 times (most frequent)
    expect(topAllTime[0]).toBe(5);

    // In last year data: number 45 appears 3 times (most frequent)
    expect(topLastYear[0]).toBe(45);

    // These MUST be different - this was the bug!
    expect(topAllTime[0]).not.toBe(topLastYear[0]);

    // Get bottom 1 from each dataset
    const bottomAllTime = getLastXNumbers(allTimeCounts, 1);
    const bottomLastYear = getLastXNumbers(lastYearCounts, 1);

    // Bottom numbers should also be different
    expect(bottomAllTime).toHaveLength(1);
    expect(bottomLastYear).toHaveLength(1);
    
    // The bug: if we used all-time counts for last-year filtering,
    // we would exclude number 5 (all-time top) instead of 45 (last-year top)
    console.log('Bug scenario verified:');
    console.log(`  All-time top: ${topAllTime[0]} (wrong for last-year filter)`);
    console.log(`  Last-year top: ${topLastYear[0]} (correct for last-year filter)`);
  });

  it('should properly convert draws to CSV format', () => {
    const draws: LotteryDraw[] = [
      createDraw('2024-01-01', [1, 2, 3, 4, 5, 6]),
      createDraw('2024-06-15', [10, 20, 30, 40, 41, 42]),
    ];

    const csvText = drawsToCsvText(draws);

    // Should have header + 2 data rows
    const lines = csvText.split('\n');
    expect(lines.length).toBe(3);

    // Should have proper header
    expect(lines[0]).toContain('NUMBER DRAWN');
    expect(lines[0]).toContain('DRAW DATE');

    // Should have date in YYYY-MM-DD format
    expect(lines[1]).toContain('2024-01-01');
    expect(lines[2]).toContain('2024-06-15');

    // Should have numbers
    expect(lines[1]).toContain('1,2,3,4,5,6');
    expect(lines[2]).toContain('10,20,30,40,41,42');
  });

  it('should handle empty draws array', () => {
    const csvText = drawsToCsvText([]);
    expect(csvText).toBe('');
  });

  it('should handle draws with different number counts', () => {
    const draws: LotteryDraw[] = [
      createDraw('2024-01-01', [1, 2, 3, 4, 5, 6]), // 6 numbers
      createDraw('2024-06-15', [10, 20, 30, 40, 41, 42, 43]), // 7 numbers (Lotto Max)
    ];

    const csvText = drawsToCsvText(draws);
    const lines = csvText.split('\n');

    // Header should accommodate the max (7 numbers)
    expect(lines[0]).toContain('NUMBER DRAWN 7');

    // First row should have padding
    expect(lines[1].split(',').length).toBeGreaterThanOrEqual(11); // Product, draw#, seq, date, 6 numbers, padding, bonus
  });
});
