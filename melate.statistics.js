"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastXNumbers = getLastXNumbers;
exports.getFirstXNumbers = getFirstXNumbers;
exports.countNumbersInCSV = countNumbersInCSV;
function removeFirstFourColumns(csvData) {
    const lines = csvData.split('\n');
    const processedLines = lines.map(line => {
        const columns = line.split(',');
        return columns.slice(4).join(',');
    });
    return processedLines.join('\n');
}
function removeHeader(csvData) {
    const lines = csvData.split('\n');
    lines.shift(); // Remove the first line (header)
    return lines.join('\n');
}
function sortNumberCountDescending(numberCount) {
    return Object.entries(numberCount)
        .map(([num, count]) => [Number(num), count])
        .sort((a, b) => b[1] - a[1]);
}
function countNumbersInCSV(csvData) {
    const processedCsvData = processCsvData(csvData);
    const lines = processedCsvData.split('\n');
    const numberCount = {};
    lines.forEach(line => {
        const numbers = line.split(',').map(num => num.trim()).filter(num => num !== '' && num !== '0').map(num => Number(num));
        numbers.forEach(num => {
            if (!isNaN(num)) {
                if (numberCount[num]) {
                    numberCount[num]++;
                }
                else {
                    numberCount[num] = 1;
                }
            }
        });
    });
    return numberCount;
}
function getLastXNumbers(numberCount, n) {
    const sortedEntries = sortNumberCountDescending(numberCount);
    return sortedEntries.slice(-n).map(entry => entry[0]);
}
function getFirstXNumbers(numberCount, n) {
    const sortedEntries = sortNumberCountDescending(numberCount);
    return sortedEntries.slice(0, n).map(entry => entry[0]);
}
function processCsvData(csvData) {
    let processedCsvData = removeFirstFourColumns(csvData);
    return removeHeader(processedCsvData);
}
