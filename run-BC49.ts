import * as fs from 'fs';
import { games, getBC49CsvData } from './melate.numbers';
import { generateDrawsForGame } from './melate.play';

// Example usage:
const csvDataFilePath = fs.readFileSync(games.bcSixFourtyNine.filePath, 'utf-8');

const excludeXTopNumbers = 2;
const excludeXLastNumbers = 2;
const threshold = 2
const warmUp = 100;
const howManyDraws = 10;

generateDrawsForGame(games.bcSixFourtyNine, csvDataFilePath, getBC49CsvData, excludeXTopNumbers, excludeXLastNumbers, threshold, warmUp, howManyDraws);
