import React from 'react';

export type DateFilterPreset = 'all' | '30days' | '3months' | '6months' | '1year' | '2years' | 'custom';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateFilterPanelProps {
  preset: DateFilterPreset;
  customRange: DateRange;
  onPresetChange: (preset: DateFilterPreset) => void;
  onCustomRangeChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
}

interface PresetOption {
  value: DateFilterPreset;
  label: string;
  icon: string;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    value: 'all',
    label: 'All Time',
    icon: '∞',
    description: 'Include all historical data',
  },
  {
    value: '30days',
    label: 'Last 30 Days',
    icon: '📅',
    description: 'Recent month',
  },
  {
    value: '3months',
    label: 'Last 3 Months',
    icon: '📆',
    description: 'Recent quarter',
  },
  {
    value: '6months',
    label: 'Last 6 Months',
    icon: '📊',
    description: 'Last half year',
  },
  {
    value: '1year',
    label: 'Last Year',
    icon: '📈',
    description: 'Last 12 months',
  },
  {
    value: '2years',
    label: 'Last 2 Years',
    icon: '📉',
    description: 'Last 24 months',
  },
  {
    value: 'custom',
    label: 'Custom Range',
    icon: '🎯',
    description: 'Select specific dates',
  },
];

/**
 * Formats a date to YYYY-MM-DD for input elements
 */
function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date for display
 */
function formatDateForDisplay(date: Date | null): string {
  if (!date) return 'Not set';
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
  });
}

/**
 * Preset filter buttons
 */
function PresetButtons({
  preset,
  onPresetChange,
}: {
  preset: DateFilterPreset;
  onPresetChange: (preset: DateFilterPreset) => void;
}): React.ReactElement {
  return (
    <div className="date-filter__presets">
      {PRESET_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`date-filter__preset-btn ${preset === option.value ? 'date-filter__preset-btn--active' : ''}`}
          onClick={(): void => onPresetChange(option.value)}
          title={option.description}
        >
          <span className="date-filter__preset-icon">{option.icon}</span>
          <span className="date-filter__preset-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Custom date range inputs
 */
function CustomRangeInputs({
  customRange,
  onCustomRangeChange,
  minDate,
  maxDate,
  isVisible,
}: {
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  isVisible: boolean;
}): React.ReactElement | null {
  if (!isVisible) return null;

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onCustomRangeChange({ ...customRange, from: date });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onCustomRangeChange({ ...customRange, to: date });
  };

  return (
    <div className="date-filter__custom">
      <div className="date-filter__custom-group">
        <label htmlFor="date-from" className="date-filter__label">
          From Date
        </label>
        <input
          id="date-from"
          type="date"
          value={formatDateForInput(customRange.from)}
          onChange={handleFromChange}
          min={minDate ? formatDateForInput(minDate) : undefined}
          max={customRange.to ? formatDateForInput(customRange.to) : maxDate ? formatDateForInput(maxDate) : undefined}
          className="date-filter__input"
        />
        <span className="date-filter__display">
          {formatDateForDisplay(customRange.from)}
        </span>
      </div>

      <div className="date-filter__custom-group">
        <label htmlFor="date-to" className="date-filter__label">
          To Date
        </label>
        <input
          id="date-to"
          type="date"
          value={formatDateForInput(customRange.to)}
          onChange={handleToChange}
          min={customRange.from ? formatDateForInput(customRange.from) : minDate ? formatDateForInput(minDate) : undefined}
          max={maxDate ? formatDateForInput(maxDate) : undefined}
          className="date-filter__input"
        />
        <span className="date-filter__display">
          {formatDateForDisplay(customRange.to)}
        </span>
      </div>
    </div>
  );
}

/**
 * DateFilterPanel Component
 * 
 * Provides UI controls for filtering historical lottery data by date range.
 * Supports both preset time periods and custom date ranges.
 */
export function DateFilterPanel({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  minDate,
  maxDate,
}: DateFilterPanelProps): React.ReactElement {
  return (
    <div className="date-filter-panel">
      <div className="date-filter-panel__header">
        <h4 className="date-filter-panel__title">📅 Date Range Filter</h4>
        <p className="date-filter-panel__subtitle">
          Filter statistics by time period
        </p>
      </div>

      <PresetButtons preset={preset} onPresetChange={onPresetChange} />

      <CustomRangeInputs
        customRange={customRange}
        onCustomRangeChange={onCustomRangeChange}
        minDate={minDate}
        maxDate={maxDate}
        isVisible={preset === 'custom'}
      />

      {minDate && maxDate && (
        <div className="date-filter-panel__info">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">
            Available data: {formatDateForDisplay(minDate)} to {formatDateForDisplay(maxDate)}
          </span>
        </div>
      )}
    </div>
  );
}
