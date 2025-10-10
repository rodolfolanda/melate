import { generateRandomNumbers, GameConfig } from './melate.numbers';
import { getLastXNumbers, getFirstXNumbers, countNumbersInCSV } from './melate.statistics';

async function getDrawFor(config: { min: number; max: number; count: number }, dataFetcher: () => Promise<any>, exclude: number[], threshold: number, warmUp: number): Promise<number[]> {
  const data = await dataFetcher();
  const results = [];
  for (let i = 0; i <= warmUp; i++) {
    results.push(generateRandomNumbers(config, data, exclude, threshold));
  }

  return results[warmUp];
}

function generateDrawsForGame(
  game: GameConfig,
  csvDataFilePath: string,
  csvDataForGame: () => Promise<any>,
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
    getDrawFor(game, csvDataForGame, excludeForGame, threshold, warmUp).then((draw: any) => {
      console.log(draw);
    });
  }
}

export { generateDrawsForGame };
