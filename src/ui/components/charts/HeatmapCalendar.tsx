/**
 * HeatmapCalendar Component
 * 
 * Displays a GitHub-style calendar heatmap showing when a specific lottery number
 * appeared throughout a year. Each cell represents one day, with color intensity
 * indicating whether the number was drawn on that date.
 */

import React, { useState, useMemo } from 'react';
import type { HeatmapData, HeatmapDay } from '../../../core/analytics';

interface HeatmapCalendarProps {
  heatmapData: HeatmapData;
  onNumberChange?: (number: number) => void;
  maxNumber: number;
}

interface TooltipData {
  day: HeatmapDay;
  x: number;
  y: number;
}

/**
 * Format date for tooltip display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Tooltip component for day details
 */
function DayTooltip({ day, x, y }: TooltipData): React.ReactElement {
  return (
    <div 
      className="heatmap-tooltip"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="heatmap-tooltip__date">{formatDate(day.date)}</div>
      {day.appeared && day.drawNumbers ? (
        <div className="heatmap-tooltip__info">
          <div className="heatmap-tooltip__status">✓ Number appeared</div>
          <div className="heatmap-tooltip__numbers">
            Draw: {day.drawNumbers.sort((a, b) => a - b).join(', ')}
          </div>
        </div>
      ) : (
        <div className="heatmap-tooltip__status">No draw this day</div>
      )}
    </div>
  );
}

/**
 * Number selector component
 */
function NumberSelector({ 
  selectedNumber, 
  maxNumber, 
  onChange,
}: { 
  selectedNumber: number; 
  maxNumber: number; 
  onChange: (num: number) => void;
}): React.ReactElement {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="heatmap-selector">
      <label htmlFor="number-select" className="heatmap-selector__label">
        Track Number:
      </label>
      <select
        id="number-select"
        value={selectedNumber}
        onChange={handleChange}
        className="heatmap-selector__select"
      >
        {Array.from({ length: maxNumber }, (_, i) => i + 1).map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Legend component showing color intensity meaning
 */
function HeatmapLegend(): React.ReactElement {
  return (
    <div className="heatmap-legend">
      <span className="heatmap-legend__label">Activity:</span>
      <div className="heatmap-legend__scale">
        <span className="heatmap-legend__label-min">Less</span>
        <div className="heatmap-legend__boxes">
          <div className="heatmap-legend__box heatmap-legend__box--none" />
          <div className="heatmap-legend__box heatmap-legend__box--appeared" />
        </div>
        <span className="heatmap-legend__label-max">More</span>
      </div>
    </div>
  );
}

/**
 * Day cell component
 */
function DayCell({
  day,
  onHover,
  onLeave,
}: {
  day: HeatmapDay;
  onHover: (day: HeatmapDay, x: number, y: number) => void;
  onLeave: () => void;
}): React.ReactElement {
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
    const TOOLTIP_OFFSET = 10;
    const rect = e.currentTarget.getBoundingClientRect();
    onHover(day, rect.left + rect.width / 2, rect.top - TOOLTIP_OFFSET);
  };

  const cellClass = `heatmap-day ${
    day.appeared ? 'heatmap-day--appeared' : 'heatmap-day--none'
  }`;

  return (
    <div
      className={cellClass}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      title={formatDate(day.date)}
    />
  );
}

/**
 * Month row component
 */
function MonthRow({
  monthName,
  days,
  onDayHover,
  onDayLeave,
}: {
  monthName: string;
  days: HeatmapDay[];
  onDayHover: (day: HeatmapDay, x: number, y: number) => void;
  onDayLeave: () => void;
}): React.ReactElement {
  return (
    <div className="heatmap-month">
      <div className="heatmap-month__label">{monthName}</div>
      <div className="heatmap-month__days">
        {days.map((day, idx) => (
          <DayCell
            key={idx}
            day={day}
            onHover={onDayHover}
            onLeave={onDayLeave}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Main HeatmapCalendar component
 */
export function HeatmapCalendar({
  heatmapData,
  onNumberChange,
  maxNumber,
}: HeatmapCalendarProps): React.ReactElement {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const handleDayHover = (day: HeatmapDay, x: number, y: number): void => {
    setTooltip({ day, x, y });
  };

  const handleDayLeave = (): void => {
    setTooltip(null);
  };

  const handleNumberChange = (num: number): void => {
    if (onNumberChange) {
      onNumberChange(num);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalDays = heatmapData.months.reduce((sum, month) => sum + month.days.length, 0);
    const daysWithDraws = heatmapData.months.reduce(
      (sum, month) => sum + month.days.filter(d => d.drawNumbers).length,
      0,
    );
    const appearanceRate = daysWithDraws > 0 
      ? ((heatmapData.totalAppearances / daysWithDraws) * 100).toFixed(1)
      : '0.0';

    return {
      totalDays,
      daysWithDraws,
      totalAppearances: heatmapData.totalAppearances,
      appearanceRate,
    };
  }, [heatmapData]);

  return (
    <div className="heatmap-calendar">
      <div className="heatmap-header">
        <div className="heatmap-controls">
          <NumberSelector
            selectedNumber={heatmapData.number}
            maxNumber={maxNumber}
            onChange={handleNumberChange}
          />
          <HeatmapLegend />
        </div>
        
        <div className="heatmap-stats">
          <div className="heatmap-stat">
            <span className="heatmap-stat__value">{stats.totalAppearances}</span>
            <span className="heatmap-stat__label">appearances</span>
          </div>
          <div className="heatmap-stat">
            <span className="heatmap-stat__value">{stats.daysWithDraws}</span>
            <span className="heatmap-stat__label">draws in {heatmapData.year}</span>
          </div>
          <div className="heatmap-stat">
            <span className="heatmap-stat__value">{stats.appearanceRate}%</span>
            <span className="heatmap-stat__label">appearance rate</span>
          </div>
        </div>
      </div>

      <div className="heatmap-grid">
        {heatmapData.months.map((month) => (
          <MonthRow
            key={month.month}
            monthName={month.monthName}
            days={month.days}
            onDayHover={handleDayHover}
            onDayLeave={handleDayLeave}
          />
        ))}
      </div>

      {tooltip && <DayTooltip day={tooltip.day} x={tooltip.x} y={tooltip.y} />}

      <div className="heatmap-info">
        💡 Hover over any day to see details. Dark cells indicate when number{' '}
        <strong>{heatmapData.number}</strong> was drawn.
      </div>
    </div>
  );
}
