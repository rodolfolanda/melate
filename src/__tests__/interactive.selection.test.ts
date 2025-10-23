/**
 * Interactive Number Selection Tests
 * 
 * Tests for the manual number exclusion feature where users can:
 * - Click numbers in the frequency chart to manually exclude them
 * - Have both auto-exclusion (top N, bottom N) and manual exclusion work together
 * - Clear manual exclusions
 */

import { describe, it, expect } from 'vitest';

describe('Interactive Number Selection', () => {
  describe('Manual Exclusion State Management', () => {
    it('should toggle number in manual exclusion list', () => {
      const manuallyExcluded: number[] = [];
      const numberToToggle = 7;
      
      // Add number
      if (!manuallyExcluded.includes(numberToToggle)) {
        manuallyExcluded.push(numberToToggle);
      }
      
      expect(manuallyExcluded).toContain(7);
      expect(manuallyExcluded.length).toBe(1);
    });

    it('should remove number from manual exclusion list when toggled again', () => {
      const manuallyExcluded = [7, 15, 23];
      const numberToToggle = 15;
      
      // Remove number
      const index = manuallyExcluded.indexOf(numberToToggle);
      if (index > -1) {
        manuallyExcluded.splice(index, 1);
      }
      
      expect(manuallyExcluded).not.toContain(15);
      expect(manuallyExcluded).toEqual([7, 23]);
      expect(manuallyExcluded.length).toBe(2);
    });

    it('should handle multiple toggles correctly', () => {
      const manuallyExcluded: number[] = [];
      
      // Add 5
      manuallyExcluded.push(5);
      expect(manuallyExcluded).toEqual([5]);
      
      // Add 10
      manuallyExcluded.push(10);
      expect(manuallyExcluded).toEqual([5, 10]);
      
      // Remove 5
      const idx5 = manuallyExcluded.indexOf(5);
      manuallyExcluded.splice(idx5, 1);
      expect(manuallyExcluded).toEqual([10]);
      
      // Add 15
      manuallyExcluded.push(15);
      expect(manuallyExcluded).toEqual([10, 15]);
    });

    it('should clear all manual exclusions', () => {
      const manuallyExcluded = [1, 5, 10, 15, 20];
      
      // Clear
      manuallyExcluded.length = 0;
      
      expect(manuallyExcluded).toEqual([]);
      expect(manuallyExcluded.length).toBe(0);
    });
  });

  describe('Auto + Manual Exclusion Combination', () => {
    it('should combine auto-excluded and manually-excluded numbers', () => {
      const autoExcluded = [1, 2, 48, 49]; // top 2 and bottom 2
      const manuallyExcluded = [7, 13, 21];
      
      // Combine using Set to deduplicate
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      expect(allExcluded).toHaveLength(7);
      expect(allExcluded).toContain(1);
      expect(allExcluded).toContain(2);
      expect(allExcluded).toContain(7);
      expect(allExcluded).toContain(13);
      expect(allExcluded).toContain(21);
      expect(allExcluded).toContain(48);
      expect(allExcluded).toContain(49);
    });

    it('should deduplicate when manual exclusion overlaps with auto exclusion', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [1, 7, 48]; // 1 and 48 overlap with auto
      
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      // Should have 5 unique numbers, not 7
      expect(allExcluded).toHaveLength(5);
      expect(allExcluded.sort((a, b) => a - b)).toEqual([1, 2, 7, 48, 49]);
    });

    it('should handle empty manual exclusions', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded: number[] = [];
      
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      expect(allExcluded).toEqual(autoExcluded);
      expect(allExcluded).toHaveLength(4);
    });

    it('should handle empty auto exclusions', () => {
      const autoExcluded: number[] = [];
      const manuallyExcluded = [7, 13, 21];
      
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      expect(allExcluded).toEqual(manuallyExcluded);
      expect(allExcluded).toHaveLength(3);
    });

    it('should handle both empty exclusion lists', () => {
      const autoExcluded: number[] = [];
      const manuallyExcluded: number[] = [];
      
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      expect(allExcluded).toEqual([]);
      expect(allExcluded).toHaveLength(0);
    });
  });

  describe('Number Validation', () => {
    it('should not allow numbers outside valid range to be manually excluded', () => {
      const maxNumber = 49;
      const numberToExclude = 50; // Invalid
      
      const isValid = numberToExclude >= 1 && numberToExclude <= maxNumber;
      
      expect(isValid).toBe(false);
    });

    it('should allow numbers within valid range to be manually excluded', () => {
      const maxNumber = 49;
      const numberToExclude = 25;
      
      const isValid = numberToExclude >= 1 && numberToExclude <= maxNumber;
      
      expect(isValid).toBe(true);
    });

    it('should validate edge cases (1 and max)', () => {
      const maxNumber = 49;
      const min = 1;
      
      expect(1 >= min && 1 <= maxNumber).toBe(true);
      expect(49 >= min && 49 <= maxNumber).toBe(true);
      expect(0 >= min && 0 <= maxNumber).toBe(false);
      expect(50 >= min && 50 <= maxNumber).toBe(false);
    });
  });

  describe('User Workflow Scenarios', () => {
    it('should handle typical user workflow: auto exclude + manual select + generate', () => {
      // Step 1: Auto exclusions configured (top 3, bottom 3)
      const frequencyData = [
        { number: 1, count: 5 },
        { number: 2, count: 8 },
        { number: 3, count: 12 },
        { number: 47, count: 45 },
        { number: 48, count: 50 },
        { number: 49, count: 52 },
      ];
      
      const sortedByFreq = [...frequencyData].sort((a, b) => b.count - a.count);
      const autoExcluded = [
        ...sortedByFreq.slice(0, 3).map(d => d.number), // top 3: 49, 48, 47
        ...sortedByFreq.slice(-3).map(d => d.number),   // bottom 3: 1, 2, 3
      ];
      
      // Step 2: User manually clicks on 7 and 13
      const manuallyExcluded = [7, 13];
      
      // Step 3: Combine for generation
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      expect(autoExcluded).toHaveLength(6);
      expect(manuallyExcluded).toHaveLength(2);
      expect(allExcluded).toHaveLength(8);
      expect(allExcluded).toContain(49);
      expect(allExcluded).toContain(48);
      expect(allExcluded).toContain(47);
      expect(allExcluded).toContain(1);
      expect(allExcluded).toContain(2);
      expect(allExcluded).toContain(3);
      expect(allExcluded).toContain(7);
      expect(allExcluded).toContain(13);
    });

    it('should handle user clicking already auto-excluded number', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [1]; // User clicks on 1 which is already auto-excluded
      
      const allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      
      // Should still only have 4 unique numbers
      expect(allExcluded).toHaveLength(4);
      
      // When user "unclicks" 1, it should be removed from manual but still in auto
      const updatedManual = manuallyExcluded.filter(n => n !== 1);
      const newAllExcluded = [...new Set([...autoExcluded, ...updatedManual])];
      
      // Should still have 4 because it's still in auto
      expect(newAllExcluded).toHaveLength(4);
      expect(newAllExcluded).toContain(1); // Still excluded via auto
    });

    it('should handle clearing manual exclusions but keeping auto exclusions', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [7, 13, 21];
      
      let allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      expect(allExcluded).toHaveLength(7);
      
      // User clicks "Clear Manual Exclusions"
      manuallyExcluded.length = 0;
      
      allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      expect(allExcluded).toHaveLength(4);
      expect(allExcluded).toEqual(autoExcluded);
    });

    it('should handle changing auto exclusion settings while manual exclusions are active', () => {
      const frequencyData = [
        { number: 1, count: 5 },
        { number: 2, count: 8 },
        { number: 3, count: 12 },
        { number: 47, count: 45 },
        { number: 48, count: 50 },
        { number: 49, count: 52 },
      ];
      
      const manuallyExcluded = [7, 13];
      
      // Initially: top 2, bottom 2
      const sortedByFreq = [...frequencyData].sort((a, b) => b.count - a.count);
      let autoExcluded = [
        ...sortedByFreq.slice(0, 2).map(d => d.number),
        ...sortedByFreq.slice(-2).map(d => d.number),
      ];
      let allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      expect(allExcluded).toHaveLength(6); // 4 auto + 2 manual
      
      // User changes to top 1, bottom 1
      autoExcluded = [
        ...sortedByFreq.slice(0, 1).map(d => d.number),
        ...sortedByFreq.slice(-1).map(d => d.number),
      ];
      allExcluded = [...new Set([...autoExcluded, ...manuallyExcluded])];
      expect(allExcluded).toHaveLength(4); // 2 auto + 2 manual
      expect(allExcluded).toContain(49); // top 1
      expect(allExcluded).toContain(1);  // bottom 1
      expect(allExcluded).toContain(7);  // manual
      expect(allExcluded).toContain(13); // manual
    });
  });

  describe('Visual State Tracking', () => {
    it('should identify numbers as manually excluded', () => {
      const manuallyExcluded = [7, 13, 21];
      const number = 13;
      
      const isManuallyExcluded = manuallyExcluded.includes(number);
      
      expect(isManuallyExcluded).toBe(true);
    });

    it('should identify numbers as auto-excluded', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [7, 13];
      const number = 48;
      
      const isAutoExcluded = autoExcluded.includes(number);
      const isManuallyExcluded = manuallyExcluded.includes(number);
      
      expect(isAutoExcluded).toBe(true);
      expect(isManuallyExcluded).toBe(false);
    });

    it('should identify numbers excluded by both methods', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [1, 7, 48];
      const number = 1;
      
      const isAutoExcluded = autoExcluded.includes(number);
      const isManuallyExcluded = manuallyExcluded.includes(number);
      
      expect(isAutoExcluded).toBe(true);
      expect(isManuallyExcluded).toBe(true);
    });

    it('should determine visual priority: manual over auto', () => {
      const autoExcluded = [1, 2, 48, 49];
      const manuallyExcluded = [1, 7];
      
      // For number 1 (both auto and manual)
      const getVisualState = (num: number): 'manual' | 'auto' | 'normal' => {
        if (manuallyExcluded.includes(num)) {
          return 'manual'; // Manual takes priority
        }
        if (autoExcluded.includes(num)) {
          return 'auto';
        }
        return 'normal';
      };
      
      expect(getVisualState(1)).toBe('manual');  // In both, shows as manual
      expect(getVisualState(2)).toBe('auto');    // Only in auto
      expect(getVisualState(7)).toBe('manual');  // Only in manual
      expect(getVisualState(25)).toBe('normal'); // Not excluded
    });
  });
});
