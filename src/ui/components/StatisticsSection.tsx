import React from 'react';
import { StatisticsPanel } from './StatisticsPanel';
import type { DateFilterPreset, DateRange } from './DateFilterPanel';
import type { LotteryDraw } from '../../core/melate.history.browser';

interface StatisticsSectionProps {
  historicalData: number[][];
  maxNumber: number;
  excludedNumbers: number[];
  onNumberToggle: (number: number) => void;
  dateFilterPreset: DateFilterPreset;
  customDateRange: DateRange;
  onDateFilterPresetChange: (preset: DateFilterPreset) => void;
  onCustomDateRangeChange: (range: DateRange) => void;
  minDate: Date | null;
  maxDate: Date | null;
  manuallyExcludedNumbers: number[];
  filteredDraws: LotteryDraw[];
}

export function StatisticsSection({
  historicalData,
  maxNumber,
  excludedNumbers,
  onNumberToggle,
  dateFilterPreset,
  customDateRange,
  onDateFilterPresetChange,
  onCustomDateRangeChange,
  minDate,
  maxDate,
  manuallyExcludedNumbers,
  filteredDraws,
}: StatisticsSectionProps): React.ReactElement {
  return (
    <div className="section-panel">
      <h2>📊 Statistics</h2>
      {historicalData.length > 0 ? (
        <StatisticsPanel
          historicalData={historicalData}
          maxNumber={maxNumber}
          excludedNumbers={excludedNumbers}
          onNumberToggle={onNumberToggle}
          dateFilterPreset={dateFilterPreset}
          customDateRange={customDateRange}
          onDateFilterPresetChange={onDateFilterPresetChange}
          onCustomDateRangeChange={onCustomDateRangeChange}
          minDate={minDate}
          maxDate={maxDate}
          manuallyExcludedNumbers={manuallyExcludedNumbers}
          filteredDraws={filteredDraws}
        />
      ) : (
        <p className="help-text">Load a game first to view statistics</p>
      )}
    </div>
  );
}
