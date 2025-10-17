import { processCsvFile } from './melate.history.js';

let csvDataFor649: Promise<number[][]> | null = null;
let csvDataForLottoMax: Promise<number[][]> | null = null;
let csvDataForBC49: Promise<number[][]> | null = null;

const games: { [game: string]: GameConfig } = {
  sixFourtyNine: { min: 1, max: 49, count: 6, filePath: 'data/649.csv', gameType: '6/49' },
  lottoMax: { min: 1, max: 50, count: 7, filePath: 'data/lottomax.csv', gameType: 'Lotto Max' },
  bcSixFourtyNine: { min: 1, max: 49, count: 6, filePath: 'data/BC49.csv', gameType: 'BC 49' },   
};

interface GameConfig {
    min: number;
    max: number;
    count: number;
    filePath: string
    gameType?: string
}

function get649CsvData(): Promise<number[][]> {
  csvDataFor649 ??= processCsvFile(games.sixFourtyNine.filePath);
  return csvDataFor649;
}

function getLottoMaxCsvData(): Promise<number[][]> {
  csvDataForLottoMax ??= processCsvFile(games.lottoMax.filePath);
  return csvDataForLottoMax;
}

function getBC49CsvData(): Promise<number[][]> {
  csvDataForBC49 ??= processCsvFile(games.bcSixFourtyNine.filePath);
  return csvDataForBC49;
}

function isUniqueSet(numbers: number[], existingSets: number[][], threshold = 0): boolean {
  return !existingSets.some(set => {
    const commonNumbers = set.filter(num => numbers.includes(num));
    return commonNumbers.length >= set.length - threshold;
  });
}

function generateRandomNumbers(config: { min: number, max: number, count: number }, existingSets: number[][], exclude: number[], threshold = 0): number[] {
  const { min, max, count } = config;
  let numbers: number[] = [];
  do {
    numbers = [];
    while (numbers.length < count) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(randomNumber) && !exclude.includes(randomNumber)) {
        numbers.push(randomNumber);
      }
    }
    numbers.sort((a, b) => a - b);
  } while (!isUniqueSet(numbers, existingSets, threshold));
  return numbers;
}



export { generateRandomNumbers, games, get649CsvData, getLottoMaxCsvData, getBC49CsvData };
export type { GameConfig };