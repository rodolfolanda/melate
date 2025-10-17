import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCsvFileBrowser } from '../core/melate.history.browser';

describe('melate.history.browser', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.restoreAllMocks();
  });

  describe('processCsvFileBrowser', () => {
    it('should fetch and parse CSV file correctly', async () => {
      const mockCsvContent = `DRAW NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
1,2023-01-01,1,2,3,4,5,6,7
2,2023-01-02,8,9,10,11,12,13,14`;

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvContent),
        } as Response),
      );

      const result = await processCsvFileBrowser('/data/test.csv');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result[1]).toEqual([8, 9, 10, 11, 12, 13]);
    });

    it('should handle CSV with empty values', async () => {
      const mockCsvContent = `DRAW NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
1,2023-01-01,1,2,,4,5,6,7
2,2023-01-02,8,9,10,0,12,13,14`;

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvContent),
        } as Response),
      );

      const result = await processCsvFileBrowser('/data/test.csv');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([1, 2, 4, 5, 6]); // Empty value filtered out
      expect(result[1]).toEqual([8, 9, 10, 12, 13]); // 0 value filtered out
    });

    it('should skip header row', async () => {
      const mockCsvContent = `DRAW NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
1,2023-01-01,1,2,3,4,5,6,7`;

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvContent),
        } as Response),
      );

      const result = await processCsvFileBrowser('/data/test.csv');

      expect(result).toHaveLength(1);
      expect(result[0]).not.toContain('DRAW'); // Header not in result
    });

    it('should throw error when fetch fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        } as Response),
      );

      await expect(processCsvFileBrowser('/data/nonexistent.csv')).rejects.toThrow(
        'Failed to fetch',
      );
    });

    it('should handle empty CSV file', async () => {
      const mockCsvContent = 'DRAW NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER';

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvContent),
        } as Response),
      );

      const result = await processCsvFileBrowser('/data/empty.csv');

      expect(result).toHaveLength(0);
    });

    it('should handle malformed CSV rows gracefully', async () => {
      const mockCsvContent = `DRAW NUMBER,DRAW DATE,NUMBER DRAWN 1,NUMBER DRAWN 2,NUMBER DRAWN 3,NUMBER DRAWN 4,NUMBER DRAWN 5,NUMBER DRAWN 6,BONUS NUMBER
1,2023-01-01,1,2,3,4,5,6,7
2,2023-01-02,a,b,c,d,e,f,g
3,2023-01-03,10,11,12,13,14,15,16`;

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockCsvContent),
        } as Response),
      );

      const result = await processCsvFileBrowser('/data/test.csv');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result[1]).toEqual([]); // Invalid numbers filtered out
      expect(result[2]).toEqual([10, 11, 12, 13, 14, 15]);
    });
  });
});
