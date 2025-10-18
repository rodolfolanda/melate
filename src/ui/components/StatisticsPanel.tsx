import React, { useState } from 'react';
import { FrequencyBarChart, HotColdGrid, OddEvenPieChart, RangeDistributionChart } from './charts';
import { useChartData } from '../hooks/useChartData';

interface StatisticsPanelProps {
  historicalData: number[][];
  maxNumber: number;
  excludedNumbers: number[];
  onNumberToggle?: (number: number) => void;
}

type ChartTab = 'frequency' | 'hotcold' | 'oddeven' | 'ranges';

interface TabConfig {
  id: ChartTab;
  label: string;
  icon: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: 'frequency',
    label: 'Frequency',
    icon: '📊',
    description: 'View how often each number appears',
  },
  {
    id: 'hotcold',
    label: 'Hot & Cold',
    icon: '🔥',
    description: 'See most and least frequent numbers',
  },
  {
    id: 'oddeven',
    label: 'Odd vs Even',
    icon: '🎲',
    description: 'Analyze odd and even distribution',
  },
  {
    id: 'ranges',
    label: 'Ranges',
    icon: '📈',
    description: 'Number distribution across ranges',
  },
];

/**
 * Panel header component
 */
function PanelHeader({ 
  drawCount, 
  maxNumber, 
  isExpanded, 
  onToggle, 
}: { 
  drawCount: number; 
  maxNumber: number; 
  isExpanded: boolean; 
  onToggle: () => void; 
}): React.ReactElement {
  return (
    <div className="statistics-panel__header">
      <div className="statistics-panel__title-section">
        <h2 className="statistics-panel__title">📊 Historical Statistics</h2>
        <p className="statistics-panel__subtitle">
          Analyzing {drawCount} draws with {maxNumber} numbers
        </p>
      </div>
      <button 
        className="statistics-panel__toggle"
        onClick={onToggle}
        aria-label={isExpanded ? 'Collapse statistics' : 'Expand statistics'}
      >
        {isExpanded ? '▼' : '▶'}
      </button>
    </div>
  );
}

/**
 * Tab navigation component
 */
function TabNavigation({ 
  activeTab, 
  onTabChange, 
}: { 
  activeTab: ChartTab; 
  onTabChange: (tab: ChartTab) => void; 
}): React.ReactElement {
  return (
    <div className="statistics-panel__tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`statistics-tab ${activeTab === tab.id ? 'statistics-tab--active' : ''}`}
          onClick={(): void => onTabChange(tab.id)}
          title={tab.description}
        >
          <span className="statistics-tab__icon">{tab.icon}</span>
          <span className="statistics-tab__label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Chart content renderer
 */
function ChartContent({
  activeTab,
  frequencyData,
  hotNumbers,
  coldNumbers,
  oddEvenStats,
  rangeDistribution,
  maxNumber,
  onNumberClick,
}: {
  activeTab: ChartTab;
  frequencyData: { number: number; count: number; percentage: number; isExcluded?: boolean }[];
  hotNumbers: { number: number; count: number; percentage: number }[];
  coldNumbers: { number: number; count: number; percentage: number }[];
  oddEvenStats: { odd: number; even: number; oddPercentage: number; evenPercentage: number };
  rangeDistribution: { range: string; count: number; percentage: number }[];
  maxNumber: number;
  onNumberClick?: (number: number) => void;
}): React.ReactElement {
  return (
    <div className="statistics-panel__content">
      {activeTab === 'frequency' && (
        <FrequencyBarChart data={frequencyData} maxNumber={maxNumber} />
      )}

      {activeTab === 'hotcold' && (
        <HotColdGrid 
          hotNumbers={hotNumbers}
          coldNumbers={coldNumbers}
          onNumberClick={onNumberClick}
        />
      )}

      {activeTab === 'oddeven' && (
        <OddEvenPieChart 
          stats={oddEvenStats}
          title="Odd vs Even Distribution"
        />
      )}

      {activeTab === 'ranges' && (
        <RangeDistributionChart 
          data={rangeDistribution}
          maxNumber={maxNumber}
        />
      )}
    </div>
  );
}

/**
 * Panel info footer
 */
function PanelInfo({ 
  activeTab, 
  excludedCount, 
}: { 
  activeTab: ChartTab; 
  excludedCount: number; 
}): React.ReactElement {
  return (
    <div className="statistics-panel__info">
      <div className="info-item">
        <span className="info-item__icon">ℹ️</span>
        <span className="info-item__text">
          {TABS.find(tab => tab.id === activeTab)?.description}
        </span>
      </div>
      {excludedCount > 0 && (
        <div className="info-item info-item--highlight">
          <span className="info-item__icon">🚫</span>
          <span className="info-item__text">
            {excludedCount} number{excludedCount !== 1 ? 's' : ''} excluded
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * StatisticsPanel Component
 * 
 * Container component that organizes and displays all chart components
 * with a tabbed interface for easy navigation.
 */
export function StatisticsPanel({
  historicalData,
  maxNumber,
  excludedNumbers,
  onNumberToggle,
}: StatisticsPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ChartTab>('frequency');
  const [isExpanded, setIsExpanded] = useState(true);

  // Load and process chart data
  const { 
    frequencyData, 
    hotNumbers, 
    coldNumbers, 
    oddEvenStats, 
    rangeDistribution,
    isLoading,
    error,
  } = useChartData(historicalData, maxNumber, excludedNumbers);

  return (
    <div className="statistics-panel">
      <PanelHeader 
        drawCount={historicalData.length}
        maxNumber={maxNumber}
        isExpanded={isExpanded}
        onToggle={(): void => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <>
          {isLoading && (
            <div className="statistics-panel__loading">
              <div className="loading-spinner" />
              <p>Processing historical data...</p>
            </div>
          )}

          {error && (
            <div className="statistics-panel__error">
              <span className="error-icon">⚠️</span>
              <div>
                <h3>Error Loading Statistics</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <ChartContent
                activeTab={activeTab}
                frequencyData={frequencyData}
                hotNumbers={hotNumbers}
                coldNumbers={coldNumbers}
                oddEvenStats={oddEvenStats}
                rangeDistribution={rangeDistribution}
                maxNumber={maxNumber}
                onNumberClick={onNumberToggle}
              />
              <PanelInfo activeTab={activeTab} excludedCount={excludedNumbers.length} />
            </>
          )}
        </>
      )}
    </div>
  );
}
