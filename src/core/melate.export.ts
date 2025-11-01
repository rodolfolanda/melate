/**
 * Export functionality for lottery draws
 * Supports CSV export with metadata and validation columns
 */

interface ExportMetadata {
  game: string;
  generatedDate: Date;
  totalDraws: number;
  configuration: {
    excludeTop: number;
    excludeBottom: number;
    threshold: number;
    warmUpIterations: number;
    warmUpOnce: boolean;
  };
  dateFilter?: {
    preset: string;
    customRange?: { start: Date | null; end: Date | null };
  };
  generatorVersion: string;
  excludedNumbers?: number[];
}

interface DrawRecord {
  drawNumber: number;
  generatedDate: string;
  numbers: number[];
  playDate?: string;
  actualDrawDate?: string;
  matchCount?: number;
  matched?: string;
  prize?: string;
}

interface ValidationResult {
  drawNumber: number;
  generated: number[];
  actual: number[];
  matches: number[];
  matchCount: number;
  prize?: string;
}

/**
 * Format date to YYYY-MM-DD HH:MM:SS
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date to YYYY-MM-DD-HHMM for filename
 */
function formatFilenameDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hours}${minutes}`;
}

/**
 * Generate CSV filename based on metadata
 */
export function generateFilename(metadata: ExportMetadata): string {
  const gameSlug = metadata.game.toLowerCase().replace(/[/\s]+/g, '');
  const dateStr = formatFilenameDate(metadata.generatedDate);
  const count = metadata.totalDraws;
  
  return `lottery-${gameSlug}-${dateStr}-draws-${count}.csv`;
}

/**
 * Generate CSV header comments with metadata
 */
function generateCSVHeader(metadata: ExportMetadata): string {
  const lines: string[] = [
    '# Lottery Draw Export',
    `# Game: ${metadata.game}`,
    `# Generated: ${formatDateTime(metadata.generatedDate)}`,
    `# Total Draws: ${metadata.totalDraws}`,
    `# Configuration: excludeTop=${metadata.configuration.excludeTop}, excludeBottom=${metadata.configuration.excludeBottom}, threshold=${metadata.configuration.threshold}, warmup=${metadata.configuration.warmUpIterations}, warmupOnce=${metadata.configuration.warmUpOnce}`,
    `# Generator Version: ${metadata.generatorVersion}`,
  ];
  
  if (metadata.excludedNumbers && metadata.excludedNumbers.length > 0) {
    lines.push(`# Excluded Numbers: ${metadata.excludedNumbers.join(',')}`);
  }
  
  if (metadata.dateFilter) {
    lines.push(`# Date Filter: ${metadata.dateFilter.preset}`);
  }
  
  lines.push('#');
  
  return lines.join('\n');
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string | number | undefined): string {
  if (field === undefined || field === null) {
    return '';
  }
  
  const str = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Export draws to CSV format
 */
export function exportDrawsToCSV(
  draws: number[][],
  metadata: ExportMetadata,
): string {
  const header = generateCSVHeader(metadata);
  
  // CSV column headers
  const columnHeaders = [
    'DrawNumber',
    'GeneratedDate',
    'Numbers',
    'PlayDate',
    'ActualDrawDate',
    'MatchCount',
    'Matched',
    'Prize',
  ].join(',');
  
  // Convert draws to CSV rows
  const generatedDateStr = formatDateTime(metadata.generatedDate);
  const rows = draws.map((numbers, index) => {
    const record: DrawRecord = {
      drawNumber: index + 1,
      generatedDate: generatedDateStr,
      numbers,
      playDate: '',
      actualDrawDate: '',
      matchCount: undefined,
      matched: '',
      prize: '',
    };
    
    // Use pipe separator for numbers (Excel-friendly)
    const numbersStr = numbers.join('|');
    
    return [
      record.drawNumber,
      escapeCSVField(record.generatedDate),
      numbersStr,
      escapeCSVField(record.playDate),
      escapeCSVField(record.actualDrawDate),
      escapeCSVField(record.matchCount),
      escapeCSVField(record.matched),
      escapeCSVField(record.prize),
    ].join(',');
  });
  
  return [header, columnHeaders, ...rows].join('\n');
}

/**
 * Download CSV file to user's computer
 */
export function downloadCSV(content: string, filename: string): void {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): DrawRecord[] {
  const lines = content.split('\n');
  const records: DrawRecord[] = [];
  
  let headerFound = false;
  
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      continue;
    }
    
    // Skip header row
    if (!headerFound) {
      headerFound = true;
      continue;
    }
    
    // Parse data row
    const fields = line.split(',');
    if (fields.length < 3) {
      continue;
    }
    
    const PLAY_DATE_INDEX = 3;
    const ACTUAL_DRAW_DATE_INDEX = 4;
    const MATCH_COUNT_INDEX = 5;
    const MATCHED_INDEX = 6;
    const PRIZE_INDEX = 7;
    
    const record: DrawRecord = {
      drawNumber: parseInt(fields[0]),
      generatedDate: fields[1],
      numbers: fields[2].split('|').map(n => parseInt(n.trim())),
      playDate: fields[PLAY_DATE_INDEX] || undefined,
      actualDrawDate: fields[ACTUAL_DRAW_DATE_INDEX] || undefined,
      matchCount: fields[MATCH_COUNT_INDEX] ? parseInt(fields[MATCH_COUNT_INDEX]) : undefined,
      matched: fields[MATCHED_INDEX] || undefined,
      prize: fields[PRIZE_INDEX] || undefined,
    };
    
    records.push(record);
  }
  
  return records;
}

/**
 * Validate generated draws against actual lottery results
 */
export function validateDraws(
  generatedDraws: number[][],
  actualResults: number[],
): ValidationResult[] {
  return generatedDraws.map((generated, index) => {
    const matches = generated.filter(num => actualResults.includes(num));
    
    return {
      drawNumber: index + 1,
      generated,
      actual: actualResults,
      matches,
      matchCount: matches.length,
      prize: calculatePrize(matches.length),
    };
  });
}

/**
 * Calculate prize based on match count (simplified)
 * Note: Actual prize calculations vary by lottery and draw
 */
function calculatePrize(matchCount: number): string | undefined {
  const JACKPOT_MATCHES = 6;
  const SECOND_PRIZE_MATCHES = 5;
  const THIRD_PRIZE_MATCHES = 4;
  const FOURTH_PRIZE_MATCHES = 3;
  const FREE_PLAY_MATCHES = 2;
  
  switch (matchCount) {
  case JACKPOT_MATCHES:
    return 'JACKPOT';
  case SECOND_PRIZE_MATCHES:
    return 'Second Prize';
  case THIRD_PRIZE_MATCHES:
    return 'Third Prize';
  case FOURTH_PRIZE_MATCHES:
    return 'Fourth Prize';
  case FREE_PLAY_MATCHES:
    return 'Free Play';
  default:
    return undefined;
  }
}

/**
 * Update CSV with validation results
 */
export function updateCSVWithResults(
  csvContent: string,
  validationResults: ValidationResult[],
): string {
  const lines = csvContent.split('\n');
  const updatedLines: string[] = [];
  
  let dataRowIndex = 0;
  let headerFound = false;
  
  for (const line of lines) {
    // Keep comments and header
    if (line.startsWith('#') || !headerFound) {
      updatedLines.push(line);
      if (!line.startsWith('#') && line.includes('DrawNumber')) {
        headerFound = true;
      }
      continue;
    }
    
    // Update data row with validation results
    if (dataRowIndex < validationResults.length) {
      const result = validationResults[dataRowIndex];
      const fields = line.split(',');
      
      const MATCH_COUNT_INDEX = 5;
      const MATCHED_INDEX = 6;
      const PRIZE_INDEX = 7;
      
      // Update validation columns
      fields[MATCH_COUNT_INDEX] = String(result.matchCount); // MatchCount
      fields[MATCHED_INDEX] = result.matches.join('|'); // Matched
      fields[PRIZE_INDEX] = result.prize ?? ''; // Prize
      
      updatedLines.push(fields.join(','));
      dataRowIndex++;
    } else {
      updatedLines.push(line);
    }
  }
  
  return updatedLines.join('\n');
}

export type { ExportMetadata, DrawRecord, ValidationResult };
