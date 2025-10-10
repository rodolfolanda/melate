import { generateRandomNumbers, GameConfig } from './melate.numbers.js';
import { getLastXNumbers, getFirstXNumbers, countNumbersInCSV } from './melate.statistics.js';

async function getDrawFor(config: { min: number; max: number; count: number }, dataFetcher: () => Promise<number[][]>, exclude: number[], threshold: number, warmUp: number): Promise<number[]> {
  const data = await dataFetcher();
  const results: number[][] = [];
  for (let i = 0; i <= warmUp; i++) {
    results.push(generateRandomNumbers(config, data, exclude, threshold));
  }

  return results[warmUp];
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
