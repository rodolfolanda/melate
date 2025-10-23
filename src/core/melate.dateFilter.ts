import type { LotteryDraw } from './melate.history.browser';
import type { DateFilterPreset, DateRange } from '../ui/components/DateFilterPanel';

export type { DateFilterPreset, DateRange };

// Time constants
const LAST_HOUR = 23;
const LAST_MINUTE = 59;
const LAST_SECOND = 59;
const LAST_MS = 999;
const DAYS_IN_MONTH = 30;
const MONTHS_IN_QUARTER = 3;
const MONTHS_IN_HALF_YEAR = 6;

/**
 * Calculate the date range based on a preset filter
 */
export function getDateRangeFromPreset(preset: DateFilterPreset): DateRange {
  const now = new Date();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), LAST_HOUR, LAST_MINUTE, LAST_SECOND);

  switch (preset) {
  case 'all':
    return { from: null, to: null };
    
  case '30days': {
    const from = new Date(to);
    from.setDate(from.getDate() - DAYS_IN_MONTH);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
    
  case '3months': {
    const from = new Date(to);
    from.setMonth(from.getMonth() - MONTHS_IN_QUARTER);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
    
  case '6months': {
    const from = new Date(to);
    from.setMonth(from.getMonth() - MONTHS_IN_HALF_YEAR);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
    
  case '1year': {
    const from = new Date(to);
    from.setFullYear(from.getFullYear() - 1);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
    
  case '2years': {
    const from = new Date(to);
    from.setFullYear(from.getFullYear() - 2);
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }
    
  case 'custom':
    return { from: null, to: null };
    
  default:
    return { from: null, to: null };
  }
}

/**
 * Filter lottery draws by date range
 */
export function filterDrawsByDateRange(
  draws: LotteryDraw[],
  dateRange: DateRange,
): LotteryDraw[] {
  // If no range specified, return all draws
  if (!dateRange.from && !dateRange.to) {
    return draws;
  }

  return draws.filter(draw => {
    const drawDate = draw.date;
    
    // Check from date
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      if (drawDate < fromDate) {
        return false;
      }
    }
    
    // Check to date
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(LAST_HOUR, LAST_MINUTE, LAST_SECOND, LAST_MS);
      if (drawDate > toDate) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Convert LotteryDraw array to number array for backwards compatibility
 */
export function drawsToNumbers(draws: LotteryDraw[]): number[][] {
  return draws.map(draw => draw.numbers);
}

/**
 * Get the min and max dates from lottery draws
 */
export function getDateBounds(draws: LotteryDraw[]): { min: Date | null; max: Date | null } {
  if (draws.length === 0) {
    return { min: null, max: null };
  }

  let min = draws[0].date;
  let max = draws[0].date;

  for (const draw of draws) {
    if (draw.date < min) {
      min = draw.date;
    }
    if (draw.date > max) {
      max = draw.date;
    }
  }

  return { min, max };
}

/**
 * Validate a date range
 */
export function validateDateRange(range: DateRange): { valid: boolean; error?: string } {
  if (!range.from && !range.to) {
    return { valid: true };
  }

  if (range.from && range.to) {
    if (range.from > range.to) {
      return { valid: false, error: 'Start date must be before end date' };
    }
  }

  return { valid: true };
}

/**
 * Format a date range for display
 */
export function formatDateRange(range: DateRange): string {
  if (!range.from && !range.to) {
    return 'All time';
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
    });
  };

  if (range.from && range.to) {
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  }

  if (range.from) {
    return `From ${formatDate(range.from)}`;
  }

  if (range.to) {
    return `Until ${formatDate(range.to)}`;
  }

  return 'All time';
}
