interface NumberCount {
    [key: number]: number;
}

const COLUMNS_TO_SKIP = 4;

function removeFirstFourColumns(csvData: string): string {
  const lines = csvData.split('\n');
  const processedLines = lines.map(line => {
    const columns = line.split(',');
    return columns.slice(COLUMNS_TO_SKIP).join(',');
  });
  return processedLines.join('\n');
}

function removeHeader(csvData: string): string {
  const lines = csvData.split('\n');
  lines.shift(); // Remove the first line (header)
  return lines.join('\n');
}

function sortNumberCountDescending(numberCount: NumberCount): [number, number][] {
  return Object.entries(numberCount)
    .map(([num, count]): [number, number] => [Number(num), count as number])
    .sort((a, b) => b[1] - a[1]);
}

function countNumbersInCSV(csvData: string): NumberCount {
  const processedCsvData = processCsvData(csvData);

  const lines = processedCsvData.split('\n');
  const numberCount: NumberCount = {};

  lines.forEach(line => {
    const numbers = line.split(',').map(num => num.trim()).filter(num => num !== '' && num !== '0').map(num => Number(num));
    numbers.forEach(num => {
      if (!isNaN(num)) {
        if (numberCount[num]) {
          numberCount[num]++;
        } else {
          numberCount[num] = 1;
        }
      }
    });
  });

  return numberCount;
}

function getLastXNumbers(numberCount: NumberCount, n: number): number[] {
  const sortedEntries = sortNumberCountDescending(numberCount);
  return sortedEntries.slice(-n).map(entry => entry[0]);
}

function getFirstXNumbers(numberCount: NumberCount, n: number): number[] {
  const sortedEntries = sortNumberCountDescending(numberCount);
  return sortedEntries.slice(0, n).map(entry => entry[0]);
}

function processCsvData(csvData: string): string {
  const processedCsvData = removeFirstFourColumns(csvData);
  return removeHeader(processedCsvData);
}

export { getLastXNumbers, getFirstXNumbers, countNumbersInCSV };
