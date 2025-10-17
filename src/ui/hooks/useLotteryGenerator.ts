import { useState, useCallback } from 'react';
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
}

const DEFAULT_CONFIG: LotteryConfig = {
  excludeTop: 3,
  excludeBottom: 3,
  numberOfDraws: 1,
  threshold: 2,
  warmUpIterations: 100,
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
  // We don't need historical data for generation - only for statistics
  // Just generate unique sets among the warm-up iterations
  const results: number[][] = [];
  
  for (let i = 0; i <= warmUp; i++) {
    results.push(generateRandomNumbers(game, results, exclude, threshold));
  }

  return results[warmUp];
}

// eslint-disable-next-line max-lines-per-function
export function useLotteryGenerator(): {
  state: LotteryState;
  setSelectedGame: (game: GameKey) => void;
  updateConfig: (config: Partial<LotteryConfig>) => void;
  generateNumbers: () => Promise<void>;
  clearHistory: () => void;
  getCurrentGame: () => GameConfig;
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
  });

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

      // Generate multiple draws
      const draws: number[][] = [];
      for (let i = 0; i < state.config.numberOfDraws; i++) {
        const draw = generateSingleDraw(
          game,
          excludeNumbers,
          state.config.threshold,
          state.config.warmUpIterations,
        );
        draws.push(draw);
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

  return {
    state,
    setSelectedGame,
    updateConfig,
    generateNumbers,
    clearHistory,
    getCurrentGame,
  };
}
