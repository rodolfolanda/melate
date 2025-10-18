import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { RangeDistribution } from '../../../core/analytics';

// Constants
const CHART_HEIGHT = 350;
const BAR_RADIUS = 8;
const ANIMATION_DURATION = 800;

// Colors
const RANGE_COLORS = [
  '#ef4444', // red-500 (1-10)
  '#f97316', // orange-500 (11-20)
  '#f59e0b', // amber-500 (21-30)
  '#eab308', // yellow-500 (31-40)
  '#22c55e', // green-500 (41-50)
  '#3b82f6', // blue-500 (51-60)
  '#8b5cf6', // violet-500 (61-70)
];

interface RangeDistributionChartProps {
  data: RangeDistribution[];
  maxNumber: number;
  title?: string;
}

interface ChartData {
  range: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

interface TooltipPayload {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Custom tooltip component
 */
function CustomTooltip({ 
  active, 
  payload, 
}: { 
  active?: boolean; 
  payload?: { payload: TooltipPayload }[]; 
}): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="range-tooltip">
      <div className="range-tooltip__header">
        <div 
          className="range-tooltip__color-indicator" 
          style={{ backgroundColor: data.color }}
        />
        <span className="range-tooltip__range">{data.range}</span>
      </div>
      <div className="range-tooltip__content">
        <div className="range-tooltip__stat">
          <span className="range-tooltip__label">Count:</span>
          <span className="range-tooltip__value">{data.count}</span>
        </div>
        <div className="range-tooltip__stat">
          <span className="range-tooltip__label">Percentage:</span>
          <span className="range-tooltip__value">{data.percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Statistics summary component
 */
function StatsSummary({ data }: { data: ChartData[] }): React.ReactElement {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const average = total / data.length;
  const max = Math.max(...data.map(item => item.count));
  const min = Math.min(...data.map(item => item.count));
  
  const mostCommonRange = data.find(item => item.count === max);
  const leastCommonRange = data.find(item => item.count === min);

  return (
    <div className="range-distribution-chart__stats">
      <div className="range-stat-card">
        <div className="range-stat-card__label">Most Common Range</div>
        <div className="range-stat-card__value" style={{ color: mostCommonRange?.color }}>
          {mostCommonRange?.range ?? 'N/A'}
        </div>
        <div className="range-stat-card__detail">
          {mostCommonRange?.count ?? 0} draws ({mostCommonRange?.percentage.toFixed(1) ?? 0}%)
        </div>
      </div>

      <div className="range-stat-card">
        <div className="range-stat-card__label">Least Common Range</div>
        <div className="range-stat-card__value" style={{ color: leastCommonRange?.color }}>
          {leastCommonRange?.range ?? 'N/A'}
        </div>
        <div className="range-stat-card__detail">
          {leastCommonRange?.count ?? 0} draws ({leastCommonRange?.percentage.toFixed(1) ?? 0}%)
        </div>
      </div>

      <div className="range-stat-card">
        <div className="range-stat-card__label">Average per Range</div>
        <div className="range-stat-card__value">{average.toFixed(1)}</div>
        <div className="range-stat-card__detail">
          Total: {total} numbers
        </div>
      </div>

      <div className="range-stat-card">
        <div className="range-stat-card__label">Distribution Spread</div>
        <div className="range-stat-card__value">{max - min}</div>
        <div className="range-stat-card__detail">
          Max: {max} | Min: {min}
        </div>
      </div>
    </div>
  );
}

/**
 * RangeDistributionChart Component
 * 
 * Displays a bar chart showing the distribution of numbers across different ranges.
 * Helps identify which number ranges are most/least common in lottery draws.
 */
export function RangeDistributionChart({ 
  data, 
  maxNumber,
  title = 'Number Range Distribution', 
}: RangeDistributionChartProps): React.ReactElement {
  // Transform data for Recharts
  const chartData: ChartData[] = data.map((item, index) => ({
    range: item.range,
    count: item.count,
    percentage: item.percentage,
    color: RANGE_COLORS[index % RANGE_COLORS.length],
  }));

  return (
    <div className="range-distribution-chart">
      <div className="range-distribution-chart__header">
        <h3 className="range-distribution-chart__title">{title}</h3>
        <p className="range-distribution-chart__subtitle">
          Distribution of numbers across ranges (1-{maxNumber})
        </p>
      </div>

      <div className="range-distribution-chart__chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="range" 
              stroke="rgba(255, 255, 255, 0.6)"
              tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
            />
            <YAxis 
              stroke="rgba(255, 255, 255, 0.6)"
              tick={{ fill: 'rgba(255, 255, 255, 0.8)' }}
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                fill: 'rgba(255, 255, 255, 0.6)', 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(): string => 'Number Count'}
            />
            <Bar 
              dataKey="count" 
              radius={[BAR_RADIUS, BAR_RADIUS, 0, 0]}
              animationDuration={ANIMATION_DURATION}
              label={{ 
                position: 'top', 
                fill: 'rgba(255, 255, 255, 0.8)',
                fontSize: 12, 
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <StatsSummary data={chartData} />

      <div className="range-distribution-chart__insight">
        <p>
          💡 <strong>Insight:</strong> {
            chartData.length > 0
              ? `The ${chartData[0].range} range appears most frequently, suggesting numbers in this range are drawn more often.`
              : 'No data available for analysis.'
          }
        </p>
      </div>
    </div>
  );
}
