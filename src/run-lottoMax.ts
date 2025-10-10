import * as fs from 'fs';
import { games, getLottoMaxCsvData } from './melate.numbers';
import { generateDrawsForGame } from './melate.play';

// Example usage:
const csvDataFilePath = fs.readFileSync(games.lottoMax.filePath, 'utf-8');

const excludeXTopNumbers = 3;
const excludeXLastNumbers = 3;
const threshold = 2
const warmUp = 100;
const howManyDraws = 1;

generateDrawsForGame(games.lottoMax, csvDataFilePath, getLottoMaxCsvData, excludeXTopNumbers, excludeXLastNumbers, threshold, warmUp, howManyDraws);