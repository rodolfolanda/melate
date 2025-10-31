import { generateRandomNumbers, GameConfig } from './melate.numbers.js';
import { getLastXNumbers, getFirstXNumbers, countNumbersInCSV } from './melate.statistics.js';

async function getDrawFor(config: { min: number; max: number; count: number }, dataFetcher: () => Promise<number[][]>, exclude: number[], threshold: number, warmUp: number): Promise<number[]> {
  // Pre-load data (for potential future use with historical analysis)
  await dataFetcher();
  
  // During warm-up, we don't need to check for uniqueness - just randomize
  // This dramatically improves performance for high warm-up values
  let result: number[] = [];
  
  for (let i = 0; i <= warmUp; i++) {
    result = generateRandomNumbers(config, [], exclude, threshold);
  }

  return result;
}

function generateDrawsForGame(
  game: GameConfig,
  csvDataFilePath: string,
  csvDataForGame: () => Promise<number[][]>,
  excludeTop: number,
  excludeLast: number,
  threshold: number,
  warmUp: number,
  howManyDraws: number,
): void {
  const topNKeys = getFirstXNumbers(countNumbersInCSV(csvDataFilePath), excludeTop);
  const lastNKeys = getLastXNumbers(countNumbersInCSV(csvDataFilePath), excludeLast);
  const excludeForGame = [...topNKeys, ...lastNKeys];

  console.log(`Generated numbers for ${game.gameType} game:`);
  for (let i = 0; i < howManyDraws; i++) {
    void getDrawFor(game, csvDataForGame, excludeForGame, threshold, warmUp).then((draw: number[]) => {
      console.log(draw);
    });
  }
}

export { generateDrawsForGame };
