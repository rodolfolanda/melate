import { useState, useCallback, useEffect } from 'react';
import { 
  games, 
  get649CsvData, 
  getLottoMaxCsvData, 
  getBC49CsvData,
  generateRandomNumbers,
  type GameConfig,
} from '../../core/melate.numbers.browser';
import { 
  getLastXNumbers, 
  getFirstXNumbers, 
  countNumbersInCSV,
} from '../../core/melate.statistics';
import { 
  processCsvFileBrowserWithDates,
  type LotteryDraw,
} from '../../core/melate.history.browser';
import {
  getDateRangeFromPreset,
  filterDrawsByDateRange,
  drawsToNumbers,
  getDateBounds,
  type DateFilterPreset,
  type DateRange,
} from '../../core/melate.dateFilter';
import { drawsToCsvText } from '../../core/melate.drawsToCsv';

type GameKey = 'sixFourtyNine' | 'lottoMax' | 'bcSixFourtyNine';

interface GeneratedSet {
  id: string;
  numbers: number[];
  timestamp: Date;
  gameName: string;
}

interface LotteryConfig {
  excludeTop: number;
  excludeBottom: number;
  numberOfDraws: number;
  threshold: number;
  warmUpIterations: number;
  warmUpOnce: boolean; // true = warm up once (fast), false = warm up per draw (slower but more random)
}

interface LotteryState {
  selectedGame: GameKey;
  config: LotteryConfig;
  generatedNumbers: number[][];
  history: GeneratedSet[];
  isGenerating: boolean;
  error: string | null;
  historicalData: number[][];
  excludedNumbers: number[];
  manuallyExcludedNumbers: number[];
  dateFilterPreset: DateFilterPreset;
  customDateRange: DateRange;
  allDraws: LotteryDraw[];
  filteredDraws: LotteryDraw[];
  minDate: Date | null;
  maxDate: Date | null;
}

const DEFAULT_CONFIG: LotteryConfig = {
  excludeTop: 0,
  excludeBottom: 0,
  numberOfDraws: 1,
  threshold: 2,
  warmUpIterations: 100,
  warmUpOnce: true, // Default to better performance
};

function getDataFetcherForGame(gameKey: GameKey): () => Promise<number[][]> {
  switch (gameKey) {
  case 'sixFourtyNine':
    return get649CsvData;
  case 'lottoMax':
    return getLottoMaxCsvData;
  case 'bcSixFourtyNine':
    return getBC49CsvData;
  default:
    return get649CsvData;
  }
}

function generateSingleDraw(
  game: GameConfig,
  exclude: number[],
  threshold: number,
  warmUp: number,
): number[] {
  // During warm-up, we don't need to check for uniqueness - just randomize
  // Only the final draw needs uniqueness checking
  let result: number[] = [];
  
  for (let i = 0; i <= warmUp; i++) {
    result = generateRandomNumbers(game, [], exclude, threshold);
  }

  return result;
}

// eslint-disable-next-line max-lines-per-function
export function useLotteryGenerator(): {
  state: LotteryState;
  setSelectedGame: (game: GameKey) => void;
  updateConfig: (config: Partial<LotteryConfig>) => void;
  generateNumbers: () => Promise<void>;
  clearHistory: () => void;
  getCurrentGame: () => GameConfig;
  setDateFilterPreset: (preset: DateFilterPreset) => void;
  setCustomDateRange: (range: DateRange) => void;
  toggleManualExclusion: (number: number) => void;
  clearManualExclusions: () => void;
  } {
  const [state, setState] = useState<LotteryState>({
    selectedGame: 'sixFourtyNine',
    config: DEFAULT_CONFIG,
    generatedNumbers: [],
    history: [],
    isGenerating: false,
    error: null,
    historicalData: [],
    excludedNumbers: [],
    manuallyExcludedNumbers: [],
    dateFilterPreset: 'all',
    customDateRange: { from: null, to: null },
    allDraws: [],
    filteredDraws: [],
    minDate: null,
    maxDate: null,
  });

  // Load historical data whenever the game changes
  useEffect(() => {
    const loadHistoricalData = async (
      gameKey: GameKey,
    ): Promise<void> => {
      try {
        const game = games[gameKey];
        
        // Load draws with dates
        const allDraws = await processCsvFileBrowserWithDates(game.filePath);
        const { min, max } = getDateBounds(allDraws);
        
        setState(prev => ({
          ...prev,
          allDraws,
          filteredDraws: allDraws,
          historicalData: drawsToNumbers(allDraws),
          minDate: min,
          maxDate: max,
        }));
        // Note: excludedNumbers will be calculated in the date filter effect
      } catch (err) {
        console.error('Error loading historical data:', err);
      }
    };

    void loadHistoricalData(state.selectedGame);
  }, [state.selectedGame]);

  // Apply date filters whenever filter settings change
  useEffect(() => {
    if (state.allDraws.length === 0) return;

    const dateRange = state.dateFilterPreset === 'custom' 
      ? state.customDateRange 
      : getDateRangeFromPreset(state.dateFilterPreset);

    const filtered = filterDrawsByDateRange(state.allDraws, dateRange);
    const filteredNumbers = drawsToNumbers(filtered);

    // BUGFIX: Recalculate excluded numbers based on FILTERED data, not all data
    const filteredCsvText = drawsToCsvText(filtered);
    const numberCounts = countNumbersInCSV(filteredCsvText);
    const topNumbers = getFirstXNumbers(numberCounts, state.config.excludeTop);
    const bottomNumbers = getLastXNumbers(numberCounts, state.config.excludeBottom);
    
    // Combine auto-excluded with manually-excluded numbers
    const autoExcluded = [...topNumbers, ...bottomNumbers];
    const allExcluded = [...new Set([...autoExcluded, ...state.manuallyExcludedNumbers])];

    setState(prev => ({
      ...prev,
      filteredDraws: filtered,
      historicalData: filteredNumbers,
      excludedNumbers: allExcluded, // Combined auto + manual exclusions
    }));
  }, [state.dateFilterPreset, state.customDateRange, state.allDraws, state.config.excludeTop, state.config.excludeBottom, state.manuallyExcludedNumbers]);

  const getCurrentGame = useCallback((): GameConfig => {
    return games[state.selectedGame];
  }, [state.selectedGame]);

  const setSelectedGame = useCallback((game: GameKey): void => {
    setState(prev => ({
      ...prev,
      selectedGame: game,
      generatedNumbers: [],
      historicalData: [],
      excludedNumbers: [],
      allDraws: [],
      filteredDraws: [],
      minDate: null,
      maxDate: null,
      error: null,
    }));
  }, []);

  const updateConfig = useCallback((configUpdate: Partial<LotteryConfig>): void => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdate },
      error: null,
    }));
  }, []);

  const generateNumbers = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const game = games[state.selectedGame];
      const dataFetcher = getDataFetcherForGame(state.selectedGame);
      
      // Get historical data
      const historicalData = await dataFetcher();
      
      // Get CSV content as string for frequency analysis
      const response = await fetch(`/${game.filePath}`);
      const csvText = await response.text();
      
      // Get excluded numbers based on frequency
      const numberCounts = countNumbersInCSV(csvText);
      const topNumbers = getFirstXNumbers(numberCounts, state.config.excludeTop);
      const bottomNumbers = getLastXNumbers(numberCounts, state.config.excludeBottom);
      const excludeNumbers = [...topNumbers, ...bottomNumbers];

      // Generate multiple draws with chosen warm-up strategy
      const draws: number[][] = [];
      
      if (state.config.warmUpOnce) {
        // Strategy 1: Warm up once, then generate all draws (faster)
        // Do the warm-up iterations first to "randomize" the RNG
        for (let i = 0; i < state.config.warmUpIterations; i++) {
          generateRandomNumbers(game, [], excludeNumbers, state.config.threshold);
        }
        
        // Now generate all draws without additional warm-up
        for (let i = 0; i < state.config.numberOfDraws; i++) {
          const draw = generateRandomNumbers(game, draws, excludeNumbers, state.config.threshold);
          draws.push(draw);
        }
      } else {
        // Strategy 2: Warm up for each draw (slower but more independent randomization)
        for (let i = 0; i < state.config.numberOfDraws; i++) {
          const draw = generateSingleDraw(
            game,
            excludeNumbers,
            state.config.threshold,
            state.config.warmUpIterations,
          );
          draws.push(draw);
        }
      }

      // Add to history
      const newHistoryEntries: GeneratedSet[] = draws.map(numbers => ({
        id: `${Date.now()}-${Math.random()}`,
        numbers,
        timestamp: new Date(),
        gameName: game.gameType ?? 'Unknown',
      }));

      setState(prev => ({
        ...prev,
        generatedNumbers: draws,
        history: [...newHistoryEntries, ...prev.history],
        historicalData,
        excludedNumbers: excludeNumbers,
        isGenerating: false,
        error: null,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Failed to generate numbers',
      }));
    }
  }, [state.selectedGame, state.config]);

  const clearHistory = useCallback((): void => {
    setState(prev => ({
      ...prev,
      history: [],
    }));
  }, []);

  const setDateFilterPreset = useCallback((preset: DateFilterPreset): void => {
    setState(prev => ({
      ...prev,
      dateFilterPreset: preset,
      error: null,
    }));
  }, []);

  const setCustomDateRange = useCallback((range: DateRange): void => {
    setState(prev => ({
      ...prev,
      customDateRange: range,
      error: null,
    }));
  }, []);

  const toggleManualExclusion = useCallback((number: number): void => {
    setState(prev => {
      const isCurrentlyExcluded = prev.manuallyExcludedNumbers.includes(number);
      const newManualExclusions = isCurrentlyExcluded
        ? prev.manuallyExcludedNumbers.filter(n => n !== number)
        : [...prev.manuallyExcludedNumbers, number];
      
      return {
        ...prev,
        manuallyExcludedNumbers: newManualExclusions,
      };
    });
  }, []);

  const clearManualExclusions = useCallback((): void => {
    setState(prev => ({
      ...prev,
      manuallyExcludedNumbers: [],
    }));
  }, []);

  return {
    state,
    setSelectedGame,
    updateConfig,
    generateNumbers,
    clearHistory,
    getCurrentGame,
    setDateFilterPreset,
    setCustomDateRange,
    toggleManualExclusion,
    clearManualExclusions,
  };
}
