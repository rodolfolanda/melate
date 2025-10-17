import React from 'react';
import type { NumberFrequency } from '../../../core/analytics';

interface HotColdGridProps {
  hotNumbers: NumberFrequency[];
  coldNumbers: NumberFrequency[];
  onNumberClick?: (number: number) => void;
}

// Constants
const MAX_DISPLAY_COUNT = 10;
const BASE_LIGHTNESS = 95;
const LIGHTNESS_RANGE = 40;
const HUE_RED = 0;
const HUE_BLUE = 217;
const SATURATION = 100;

/**
 * Get intensity color for hot numbers (red gradient)
 */
function getHotColor(count: number, maxCount: number): string {
  const intensity = count / maxCount;
  const lightness = BASE_LIGHTNESS - (intensity * LIGHTNESS_RANGE); // 95% to 55%
  return `hsl(${HUE_RED}, ${SATURATION}%, ${lightness}%)`;
}

/**
 * Get intensity color for cold numbers (blue gradient)
 */
function getColdColor(count: number, minCount: number, range: number): string {
  const intensity = range > 0 ? (count - minCount) / range : 0;
  const lightness = BASE_LIGHTNESS - (intensity * LIGHTNESS_RANGE); // 95% to 55%
  return `hsl(${HUE_BLUE}, ${SATURATION}%, ${lightness}%)`;
}

/**
 * Number badge component
 */
function NumberBadge({
  number,
  count,
  percentage,
  backgroundColor,
  onClick,
}: {
  number: number;
  count: number;
  percentage: number;
  backgroundColor: string;
  onClick?: () => void;
}): React.ReactElement {
  const handleClick = (): void => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`number-badge ${onClick ? 'clickable' : ''}`}
      style={{ backgroundColor }}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Number ${number}, drawn ${count} times (${percentage.toFixed(1)}%)`}
    >
      <div className="badge-number">{number}</div>
      <div className="badge-count">{count}</div>
      <div className="badge-percentage">{percentage.toFixed(1)}%</div>
    </div>
  );
}

/**
 * Section header component
 */
function SectionHeader({ 
  title, 
  icon, 
  color,
}: { 
  title: string; 
  icon: string;
  color: string;
}): React.ReactElement {
  return (
    <div className="grid-section-header">
      <span className="section-icon" style={{ color }}>{icon}</span>
      <h4>{title}</h4>
    </div>
  );
}

/**
 * Visual grid displaying hot (most frequent) and cold (least frequent) numbers
 * with color-coded intensity and click interaction
 */
export function HotColdGrid({
  hotNumbers,
  coldNumbers,
  onNumberClick,
}: HotColdGridProps): React.ReactElement {
  if ((!hotNumbers || hotNumbers.length === 0) && (!coldNumbers || coldNumbers.length === 0)) {
    return (
      <div className="chart-empty-state">
        <p>No data available for hot/cold analysis</p>
      </div>
    );
  }

  // Limit to top N numbers
  const topHot = hotNumbers.slice(0, MAX_DISPLAY_COUNT);
  const topCold = coldNumbers.slice(0, MAX_DISPLAY_COUNT);

  // Calculate color ranges
  const maxHotCount = topHot.length > 0 ? topHot[0].count : 0;
  const minColdCount = topCold.length > 0 ? topCold[0].count : 0;
  const maxColdCount = topCold.length > 0 ? topCold[topCold.length - 1].count : 0;
  const coldRange = maxColdCount - minColdCount;

  return (
    <div className="hot-cold-grid">
      <div className="grid-header">
        <h3>Hot & Cold Numbers</h3>
        <p className="grid-subtitle">
          Numbers are ranked by frequency. Click a number to exclude/include it.
        </p>
      </div>

      <div className="grid-sections">
        {/* Hot Numbers Section */}
        <div className="grid-section hot-section">
          <SectionHeader 
            title="Hot Numbers (Most Frequent)" 
            icon="🔥"
            color="#ef4444"
          />
          <div className="number-grid">
            {topHot.map((item) => (
              <NumberBadge
                key={`hot-${item.number}`}
                number={item.number}
                count={item.count}
                percentage={item.percentage}
                backgroundColor={getHotColor(item.count, maxHotCount)}
                onClick={onNumberClick ? (): void => onNumberClick(item.number) : undefined}
              />
            ))}
          </div>
          <div className="gradient-legend">
            <span>Lighter = Less Frequent</span>
            <div className="gradient-bar hot-gradient"></div>
            <span>Darker = More Frequent</span>
          </div>
        </div>

        {/* Cold Numbers Section */}
        <div className="grid-section cold-section">
          <SectionHeader 
            title="Cold Numbers (Least Frequent)" 
            icon="❄️"
            color="#3b82f6"
          />
          <div className="number-grid">
            {topCold.map((item) => (
              <NumberBadge
                key={`cold-${item.number}`}
                number={item.number}
                count={item.count}
                percentage={item.percentage}
                backgroundColor={getColdColor(item.count, minColdCount, coldRange)}
                onClick={onNumberClick ? (): void => onNumberClick(item.number) : undefined}
              />
            ))}
          </div>
          <div className="gradient-legend">
            <span>Lighter = More Frequent</span>
            <div className="gradient-bar cold-gradient"></div>
            <span>Darker = Less Frequent</span>
          </div>
        </div>
      </div>

      {onNumberClick && (
        <div className="grid-hint">
          💡 Tip: Click any number to toggle its exclusion from generation
        </div>
      )}
    </div>
  );
}
