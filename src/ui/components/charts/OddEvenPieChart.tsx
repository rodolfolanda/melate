import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { OddEvenStats } from '../../../core/analytics';

interface OddEvenPieChartProps {
  stats: OddEvenStats;
  title?: string;
}

// Constants
const CHART_HEIGHT = 350;
const INNER_RADIUS = 60;
const OUTER_RADIUS = 100;
const PIE_PADDING_ANGLE = 2;

// Colors
const COLOR_ODD = '#f59e0b'; // amber-500
const COLOR_EVEN = '#10b981'; // emerald-500

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

interface TooltipPayload {
  name: string;
  value: number;
  percentage: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: TooltipPayload }[];
}

/**
 * Custom tooltip for pie chart
 */
function CustomTooltip({ active, payload }: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label"><strong>{data.name}</strong></p>
      <p className="tooltip-value">Count: <strong>{data.value}</strong></p>
      <p className="tooltip-percentage">Percentage: <strong>{data.percentage.toFixed(1)}%</strong></p>
    </div>
  );
}



/**
 * Statistics summary component
 */
function StatsSummary({ stats }: { stats: OddEvenStats }): React.ReactElement {
  const total = stats.odd + stats.even;
  const oddRatio = total > 0 ? stats.odd / total : 0;
  const evenRatio = total > 0 ? stats.even / total : 0;

  return (
    <div className="pie-chart-summary">
      <div className="summary-section odd-section">
        <div className="summary-header">
          <span className="summary-icon" style={{ color: COLOR_ODD }}>●</span>
          <h4>Odd Numbers</h4>
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Count:</span>
            <span className="stat-value">{stats.odd}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percentage:</span>
            <span className="stat-value">{stats.oddPercentage.toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ratio:</span>
            <span className="stat-value">{oddRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="summary-section even-section">
        <div className="summary-header">
          <span className="summary-icon" style={{ color: COLOR_EVEN }}>●</span>
          <h4>Even Numbers</h4>
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Count:</span>
            <span className="stat-value">{stats.even}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Percentage:</span>
            <span className="stat-value">{stats.evenPercentage.toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Ratio:</span>
            <span className="stat-value">{evenRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pie chart displaying odd vs even number distribution
 */
export function OddEvenPieChart({ 
  stats, 
  title = 'Odd vs Even Distribution',
}: OddEvenPieChartProps): React.ReactElement {
  if (!stats || (stats.odd === 0 && stats.even === 0)) {
    return (
      <div className="chart-empty-state">
        <p>No data available for odd/even analysis</p>
      </div>
    );
  }

  const chartData: ChartData[] = [
    {
      name: 'Odd Numbers',
      value: stats.odd,
      percentage: stats.oddPercentage,
      color: COLOR_ODD,
    },
    {
      name: 'Even Numbers',
      value: stats.even,
      percentage: stats.evenPercentage,
      color: COLOR_EVEN,
    },
  ];

  return (
    <div className="odd-even-pie-chart">
      <div className="chart-header">
        <h3>{title}</h3>
        <p className="chart-subtitle">
          Distribution of odd and even numbers in historical draws
        </p>
      </div>

      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label
            outerRadius={OUTER_RADIUS}
            innerRadius={INNER_RADIUS}
            paddingAngle={PIE_PADDING_ANGLE}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      <StatsSummary stats={stats} />

      <div className="chart-insight">
        <span className="insight-icon">💡</span>
        <p>
          {stats.oddPercentage > stats.evenPercentage 
            ? `Odd numbers appear ${(stats.oddPercentage - stats.evenPercentage).toFixed(1)}% more frequently`
            : stats.evenPercentage > stats.oddPercentage
              ? `Even numbers appear ${(stats.evenPercentage - stats.oddPercentage).toFixed(1)}% more frequently`
              : 'Odd and even numbers appear equally often'
          }
        </p>
      </div>
    </div>
  );
}
