/**
 * Analytics utilities for lottery number analysis
 * Provides statistical functions for data visualization
 */

// Constants
const DEFAULT_TOP_COUNT = 10;
const DEFAULT_RANGE_SIZE = 10;
const DEFAULT_MIN_PAIR_OCCURRENCES = 5;

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
}

export interface OddEvenStats {
  odd: number;
  even: number;
  oddPercentage: number;
  evenPercentage: number;
}

export interface RangeDistribution {
  range: string;
  count: number;
  percentage: number;
}

/**
 * Calculate frequency distribution of all numbers from historical draws
 */
export function calculateFrequencyDistribution(
  historicalData: number[][],
  maxNumber: number,
): NumberFrequency[] {
  const frequencyMap: Record<number, number> = {};
  let totalNumbers = 0;

  // Initialize all numbers with 0 count
  for (let i = 1; i <= maxNumber; i++) {
    frequencyMap[i] = 0;
  }

  // Count occurrences
  historicalData.forEach(draw => {
    draw.forEach(num => {
      if (num >= 1 && num <= maxNumber) {
        frequencyMap[num]++;
        totalNumbers++;
      }
    });
  });

  // Convert to array with percentages
  return Object.entries(frequencyMap)
    .map(([number, count]) => ({
      number: parseInt(number),
      count,
      percentage: totalNumbers > 0 ? (count / totalNumbers) * 100 : 0,
    }))
    .sort((a, b) => a.number - b.number);
}

/**
 * Get the N most frequent numbers (hot numbers)
 */
export function getHotNumbers(
  frequencyData: NumberFrequency[],
  count = DEFAULT_TOP_COUNT,
): NumberFrequency[] {
  return [...frequencyData]
    .sort((a, b) => b.count - a.count)
    .slice(0, count);
}

/**
 * Get the N least frequent numbers (cold numbers)
 */
export function getColdNumbers(
  frequencyData: NumberFrequency[],
  count = DEFAULT_TOP_COUNT,
): NumberFrequency[] {
  return [...frequencyData]
    .sort((a, b) => a.count - b.count)
    .slice(0, count);
}

/**
 * Calculate odd vs even number distribution
 */
export function calculateOddEvenRatio(
  historicalData: number[][],
): OddEvenStats {
  let oddCount = 0;
  let evenCount = 0;

  historicalData.forEach(draw => {
    draw.forEach(num => {
      if (num % 2 === 0) {
        evenCount++;
      } else {
        oddCount++;
      }
    });
  });

  const total = oddCount + evenCount;

  return {
    odd: oddCount,
    even: evenCount,
    oddPercentage: total > 0 ? (oddCount / total) * 100 : 0,
    evenPercentage: total > 0 ? (evenCount / total) * 100 : 0,
  };
}

/**
 * Calculate distribution across number ranges
 */
export function calculateRangeDistribution(
  historicalData: number[][],
  maxNumber: number,
  rangeSize = DEFAULT_RANGE_SIZE,
): RangeDistribution[] {
  const ranges: Record<string, number> = {};
  let totalNumbers = 0;

  // Initialize ranges
  for (let i = 1; i <= maxNumber; i += rangeSize) {
    const rangeEnd = Math.min(i + rangeSize - 1, maxNumber);
    const rangeKey = `${i}-${rangeEnd}`;
    ranges[rangeKey] = 0;
  }

  // Count occurrences in each range
  historicalData.forEach(draw => {
    draw.forEach(num => {
      const rangeStart = Math.floor((num - 1) / rangeSize) * rangeSize + 1;
      const rangeEnd = Math.min(rangeStart + rangeSize - 1, maxNumber);
      const rangeKey = `${rangeStart}-${rangeEnd}`;
      
      if (ranges[rangeKey] !== undefined) {
        ranges[rangeKey]++;
        totalNumbers++;
      }
    });
  });

  // Convert to array with percentages
  return Object.entries(ranges).map(([range, count]) => ({
    range,
    count,
    percentage: totalNumbers > 0 ? (count / totalNumbers) * 100 : 0,
  }));
}

/**
 * Calculate statistics for a specific number set
 */
export function analyzeNumberSet(numbers: number[]): {
  oddCount: number;
  evenCount: number;
  sum: number;
  average: number;
  rangeSpread: number;
  consecutiveCount: number;
} {
  const sorted = [...numbers].sort((a, b) => a - b);
  const oddCount = numbers.filter(n => n % 2 !== 0).length;
  const evenCount = numbers.length - oddCount;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  const average = sum / numbers.length;
  const rangeSpread = sorted[sorted.length - 1] - sorted[0];
  
  // Count consecutive numbers
  let consecutiveCount = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutiveCount++;
    }
  }

  return {
    oddCount,
    evenCount,
    sum,
    average,
    rangeSpread,
    consecutiveCount,
  };
}

/**
 * Get numbers that appear together frequently (number pairs)
 */
export function calculateNumberPairs(
  historicalData: number[][],
  minOccurrences = DEFAULT_MIN_PAIR_OCCURRENCES,
): { pair: [number, number]; count: number }[] {
  const pairMap: Record<string, number> = {};

  historicalData.forEach(draw => {
    const sorted = [...draw].sort((a, b) => a - b);
    
    // Generate all pairs
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const pairKey = `${sorted[i]}-${sorted[j]}`;
        pairMap[pairKey] = (pairMap[pairKey] || 0) + 1;
      }
    }
  });

  // Convert to array and filter by minimum occurrences
  return Object.entries(pairMap)
    .filter(([, count]) => count >= minOccurrences)
    .map(([pair, count]) => {
      const [num1, num2] = pair.split('-').map(Number);
      return { pair: [num1, num2] as [number, number], count };
    })
    .sort((a, b) => b.count - a.count);
}
