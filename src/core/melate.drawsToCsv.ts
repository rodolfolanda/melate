import type { LotteryDraw } from './melate.history.browser';

/**
 * Convert lottery draws to CSV-like text for frequency analysis
 * This allows us to use existing countNumbersInCSV function with filtered data
 */
export function drawsToCsvText(draws: LotteryDraw[]): string {
  if (draws.length === 0) {
    return '';
  }

  // Create header
  const maxNumbers = Math.max(...draws.map(d => d.numbers.length));
  const numberHeaders = Array.from({ length: maxNumbers }, (_, i) => `NUMBER DRAWN ${i + 1}`).join(',');
  const header = `PRODUCT,DRAW NUMBER,SEQUENCE NUMBER,DRAW DATE,${numberHeaders},BONUS NUMBER`;

  // Create rows
  const rows = draws.map((draw, index) => {
    const dateStr = draw.date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const drawNum = draw.drawNumber ?? index + 1;
    const numbers = draw.numbers.join(',');
    const padding = Array.from({ length: maxNumbers - draw.numbers.length }, () => '').join(',');
    const paddingStr = padding ? `,${padding}` : '';
    
    return `649,${drawNum},0,${dateStr},${numbers}${paddingStr},0`;
  });

  return [header, ...rows].join('\n');
}
