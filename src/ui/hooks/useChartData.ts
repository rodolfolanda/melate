import { useState, useEffect, useMemo } from 'react';
import { 
  calculateFrequencyDistribution, 
  getHotNumbers, 
  getColdNumbers,
  calculateOddEvenRatio,
  calculateRangeDistribution,
  type NumberFrequency,
  type OddEvenStats,
  type RangeDistribution,
} from '../../core/analytics';

interface ChartData {
  frequencyData: NumberFrequency[];
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
  oddEvenStats: OddEvenStats;
  rangeDistribution: RangeDistribution[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to process lottery data for chart visualizations
 */
export function useChartData(
  historicalData: number[][],
  maxNumber: number,
  excludedNumbers: number[] = [],
): ChartData {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate all statistics - memoized for performance
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return {
        frequencyData: [],
        hotNumbers: [],
        coldNumbers: [],
        oddEvenStats: { odd: 0, even: 0, oddPercentage: 0, evenPercentage: 0 },
        rangeDistribution: [],
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate frequency distribution
      const frequencyData = calculateFrequencyDistribution(historicalData, maxNumber);

      // Mark excluded numbers in frequency data
      const frequencyWithExclusion = frequencyData.map((item: NumberFrequency) => ({
        ...item,
        isExcluded: excludedNumbers.includes(item.number),
      }));

      const topCount = 10;
      // Get hot and cold numbers
      const hotNumbers = getHotNumbers(frequencyData, topCount);
      const coldNumbers = getColdNumbers(frequencyData, topCount);

      // Calculate odd/even ratio
      const oddEvenStats = calculateOddEvenRatio(historicalData);

      // Calculate range distribution
      const rangeSize = 10;
      const rangeDistribution = calculateRangeDistribution(historicalData, maxNumber, rangeSize);

      setIsLoading(false);

      return {
        frequencyData: frequencyWithExclusion,
        hotNumbers,
        coldNumbers,
        oddEvenStats,
        rangeDistribution,
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to process chart data');
      return {
        frequencyData: [],
        hotNumbers: [],
        coldNumbers: [],
        oddEvenStats: { odd: 0, even: 0, oddPercentage: 0, evenPercentage: 0 },
        rangeDistribution: [],
      };
    }
  }, [historicalData, maxNumber, excludedNumbers]);

  useEffect(() => {
    // Reset loading state when data changes
    setIsLoading(false);
  }, [chartData]);

  return {
    ...chartData,
    isLoading,
    error,
  };
}
