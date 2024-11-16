import * as fs from 'fs';
import { games, get649CsvData } from './melate.numbers';
import { generateDrawsForGame } from './melate.play';

// Example usage:
const csvDataFilePath = fs.readFileSync(games.sixFourtyNine.filePath, 'utf-8');

const excludeXTopNumbers = 2;
const excludeXLastNumbers = 2;
const threshold = 2
const warmUp = 100;
const howManyDraws = 10;

generateDrawsForGame(games.sixFourtyNine, csvDataFilePath, get649CsvData, excludeXTopNumbers, excludeXLastNumbers, threshold, warmUp, howManyDraws);

