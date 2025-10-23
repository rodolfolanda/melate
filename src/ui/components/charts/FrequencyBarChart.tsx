import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { NumberFrequency } from '../../../core/analytics';

interface FrequencyDataWithExclusion extends NumberFrequency {
  isExcluded?: boolean;
  isManuallyExcluded?: boolean;
}

interface FrequencyBarChartProps {
  data: FrequencyDataWithExclusion[];
  maxNumber: number;
  onNumberClick?: (number: number) => void;
  manuallyExcludedNumbers?: number[];
}

// Constants
const HOT_THRESHOLD_MULTIPLIER = 0.3;
const COLD_THRESHOLD_MULTIPLIER = 0.3;
const CHART_HEIGHT = 400;
const INTERVAL_THRESHOLD = 50;
const INTERVAL_STEP = 4;
const BORDER_RADIUS = 4;

// Color constants
const COLOR_EXCLUDED = '#9ca3af'; // gray-400
const COLOR_MANUALLY_EXCLUDED = '#f97316'; // orange-500
const COLOR_HOT = '#ef4444'; // red-500
const COLOR_COLD = '#3b82f6'; // blue-500
const COLOR_NEUTRAL = '#8b5cf6'; // purple-500

interface TooltipPayload {
  payload: FrequencyDataWithExclusion;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

/**
 * Calculate statistics from frequency data
 */
function calculateStats(data: FrequencyDataWithExclusion[]): {
  avgCount: number;
  maxCount: number;
  minCount: number;
  hotThreshold: number;
  coldThreshold: number;
} {
  const counts = data.map(d => d.count);
  const avgCount = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  
  const hotThreshold = avgCount + (maxCount - avgCount) * HOT_THRESHOLD_MULTIPLIER;
  const coldThreshold = avgCount - (avgCount - minCount) * COLD_THRESHOLD_MULTIPLIER;

  return { avgCount, maxCount, minCount, hotThreshold, coldThreshold };
}

/**
 * Determine bar color based on frequency and exclusion status
 */
function getBarColor(
  item: FrequencyDataWithExclusion,
  hotThreshold: number,
  coldThreshold: number,
): string {
  // Manual exclusions have priority and distinct color
  if (item.isManuallyExcluded) {
    return COLOR_MANUALLY_EXCLUDED;
  }
  
  if (item.isExcluded) {
    return COLOR_EXCLUDED;
  }
  
  if (item.count >= hotThreshold) {
    return COLOR_HOT;
  }
  
  if (item.count <= coldThreshold) {
    return COLOR_COLD;
  }
  
  return COLOR_NEUTRAL;
}

/**
 * Get status label for a number
 */
function getStatus(
  data: FrequencyDataWithExclusion,
  hotThreshold: number,
  coldThreshold: number,
): string {
  if (data.isManuallyExcluded) {
    return 'Manually Excluded';
  }
  if (data.isExcluded) {
    return 'Auto Excluded';
  }
  if (data.count >= hotThreshold) {
    return 'Hot';
  }
  if (data.count <= coldThreshold) {
    return 'Cold';
  }
  return 'Neutral';
}

/**
 * Custom tooltip to show detailed information
 */
function CustomTooltip({ active, payload }: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const stats = calculateStats([data]); // Simple way to get thresholds
  const status = getStatus(data, stats.hotThreshold, stats.coldThreshold);
  
  return (
    <div className="chart-tooltip">
      <p className="tooltip-number">Number: <strong>{data.number}</strong></p>
      <p className="tooltip-count">Draws: <strong>{data.count}</strong></p>
      <p className="tooltip-percentage">Frequency: <strong>{data.percentage.toFixed(2)}%</strong></p>
      <p className={`tooltip-status status-${status.toLowerCase()}`}>{status}</p>
    </div>
  );
}

/**
 * Chart legend component
 */
function ChartLegend(): React.ReactElement {
  return (
    <div className="chart-legend">
      <span className="legend-item">
        <span className="legend-color" style={{ backgroundColor: COLOR_HOT }}></span>
        Hot Numbers
      </span>
      <span className="legend-item">
        <span className="legend-color" style={{ backgroundColor: COLOR_NEUTRAL }}></span>
        Neutral
      </span>
      <span className="legend-item">
        <span className="legend-color" style={{ backgroundColor: COLOR_COLD }}></span>
        Cold Numbers
      </span>
      <span className="legend-item">
        <span className="legend-color" style={{ backgroundColor: COLOR_EXCLUDED }}></span>
        Auto Excluded
      </span>
      <span className="legend-item">
        <span className="legend-color" style={{ backgroundColor: COLOR_MANUALLY_EXCLUDED }}></span>
        Manual
      </span>
    </div>
  );
}

/**
 * Chart summary component
 */
function ChartSummary({ stats, maxNumber }: {
  stats: ReturnType<typeof calculateStats>;
  maxNumber: number;
}): React.ReactElement {
  return (
    <div className="chart-summary">
      <div className="summary-item">
        <span className="summary-label">Total Numbers:</span>
        <span className="summary-value">{maxNumber}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Average Draws:</span>
        <span className="summary-value">{stats.avgCount.toFixed(1)}</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Most Drawn:</span>
        <span className="summary-value">{stats.maxCount} times</span>
      </div>
      <div className="summary-item">
        <span className="summary-label">Least Drawn:</span>
        <span className="summary-value">{stats.minCount} times</span>
      </div>
    </div>
  );
}

/**
 * Bar chart displaying frequency distribution of lottery numbers
 * Color-coded to show hot (frequent), neutral, and cold (infrequent) numbers
 * Bars are clickable for manual exclusion
 */
export function FrequencyBarChart({ 
  data, 
  maxNumber, 
  onNumberClick,
  manuallyExcludedNumbers = [],
}: FrequencyBarChartProps): React.ReactElement {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No data available for visualization</p>
      </div>
    );
  }

  const stats = calculateStats(data);

  // Enhance data with manual exclusion info
  const enhancedData = data.map(item => ({
    ...item,
    isManuallyExcluded: manuallyExcludedNumbers.includes(item.number),
  }));

  const handleBarClick = (data: unknown): void => {
    if (onNumberClick && data && typeof data === 'object' && 'number' in data) {
      const entry = data as FrequencyDataWithExclusion;
      onNumberClick(entry.number);
    }
  };

  return (
    <div className="frequency-bar-chart">
      <div className="chart-header">
        <h3>Number Frequency Distribution</h3>
        <p className="chart-hint">💡 Click on any bar to manually exclude/include that number</p>
        <ChartLegend />
      </div>
      
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={enhancedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="number" 
            label={{ value: 'Number', position: 'insideBottom', offset: -10 }}
            tick={{ fontSize: 12 }}
            interval={maxNumber > INTERVAL_THRESHOLD ? INTERVAL_STEP : 0}
          />
          <YAxis 
            label={{ value: 'Draw Count', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            radius={[BORDER_RADIUS, BORDER_RADIUS, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry, stats.hotThreshold, stats.coldThreshold)}
                className="frequency-bar"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <ChartSummary stats={stats} maxNumber={maxNumber} />
    </div>
  );
}
