import * as fs from 'fs';
import { games, get649CsvData } from './melate.numbers';
import { generateDrawsForGame } from './melate.play';

// Example usage:
const csvDataFilePath = fs.readFileSync(games.sixFourtyNine.filePath, 'utf-8');

const excludeXTopNumbers = 3;
const excludeXLastNumbers = 3;
const threshold = 2
const warmUp = 1000;
const howManyDraws = 1;

generateDrawsForGame(games.sixFourtyNine, csvDataFilePath, get649CsvData, excludeXTopNumbers, excludeXLastNumbers, threshold, warmUp, howManyDraws);

