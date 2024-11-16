"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.games = void 0;
exports.generateRandomNumbers = generateRandomNumbers;
exports.get649CsvData = get649CsvData;
exports.getLottoMaxCsvData = getLottoMaxCsvData;
exports.getBC49CsvData = getBC49CsvData;
const melate_history_1 = require("./melate.history");
let csvDataFor649 = null;
let csvDataForLottoMax = null;
let csvDataForBC49 = null;
const games = {
    sixFourtyNine: { min: 1, max: 49, count: 6, filePath: 'data/649.csv', gameType: '6/49' },
    lottoMax: { min: 1, max: 50, count: 7, filePath: 'data/lottomax.csv', gameType: 'Lotto Max' },
    bcSixFourtyNine: { min: 1, max: 49, count: 6, filePath: 'data/BC49.csv', gameType: 'BC 49' }
};
exports.games = games;
function get649CsvData() {
    if (csvDataFor649 === null) {
        csvDataFor649 = (0, melate_history_1.processCsvFile)(games.sixFourtyNine.filePath);
    }
    return csvDataFor649;
}
function getLottoMaxCsvData() {
    if (csvDataForLottoMax === null) {
        csvDataForLottoMax = (0, melate_history_1.processCsvFile)(games.lottoMax.filePath);
    }
    return csvDataForLottoMax;
}
function getBC49CsvData() {
    if (csvDataForBC49 === null) {
        csvDataForBC49 = (0, melate_history_1.processCsvFile)(games.bcSixFourtyNine.filePath);
    }
    return csvDataForBC49;
    ;
}
function isUniqueSet(numbers, existingSets, threshold = 0) {
    return !existingSets.some(set => {
        const commonNumbers = set.filter(num => numbers.includes(num));
        return commonNumbers.length >= set.length - threshold;
    });
}
function generateRandomNumbers(config, existingSets, exclude, threshold = 0) {
    const { min, max, count } = config;
    let numbers = [];
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
