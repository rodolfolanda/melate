"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDrawsForGame = generateDrawsForGame;
const melate_numbers_1 = require("./melate.numbers");
const melate_statistics_1 = require("./melate.statistics");
async function getDrawFor(config, dataFetcher, exclude, threshold, warmUp) {
    const data = await dataFetcher();
    const results = [];
    for (let i = 0; i <= warmUp; i++) {
        results.push((0, melate_numbers_1.generateRandomNumbers)(config, data, exclude, threshold));
    }
    return results[warmUp];
}
function generateDrawsForGame(game, csvDataFilePath, csvDataForGame, excludeTop, excludeLast, threshold, warmUp, howManyDraws) {
    const topNKeys = (0, melate_statistics_1.getFirstXNumbers)((0, melate_statistics_1.countNumbersInCSV)(csvDataFilePath), excludeTop);
    const lastNKeys = (0, melate_statistics_1.getLastXNumbers)((0, melate_statistics_1.countNumbersInCSV)(csvDataFilePath), excludeLast);
    const excludeForGame = [...topNKeys, ...lastNKeys];
    console.log(`Generated numbers for ${game.gameType} game:`);
    for (let i = 0; i < howManyDraws; i++) {
        getDrawFor(game, csvDataForGame, excludeForGame, threshold, warmUp).then((draw) => {
            console.log(draw);
        });
    }
}
