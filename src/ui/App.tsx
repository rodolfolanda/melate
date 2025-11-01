import { useState } from 'react';
import { useLotteryGenerator } from './hooks/useLotteryGenerator';
import { GameSelector } from './components/GameSelector';
import { NumberDisplay } from './components/NumberDisplay';
import { GenerateButton } from './components/GenerateButton';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { GeneratedHistory } from './components/GeneratedHistory';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { ExportButton } from './components/ExportButton';
import { ValidationPanel } from './components/ValidationPanel';
import { ValidationResults } from './components/ValidationResults';
import { validateDraws, type DrawRecord, type ValidationResult, type ExportMetadata } from '../core/melate.export';
import type { DateFilterPreset, DateRange } from './components/DateFilterPanel';
import type { LotteryDraw } from '../core/melate.history.browser';

/**
 * Statistics section component
 */
function StatisticsSection({
  historicalData,
  maxNumber,
  excludedNumbers,
  showStatistics,
  onToggle,
  onNumberToggle,
  dateFilterPreset,
  customDateRange,
  onDateFilterPresetChange,
  onCustomDateRangeChange,
  minDate,
  maxDate,
  manuallyExcludedNumbers,
  filteredDraws,
}: {
  historicalData: number[][];
  maxNumber: number;
  excludedNumbers: number[];
  showStatistics: boolean;
  onToggle: () => void;
  onNumberToggle: (number: number) => void;
  dateFilterPreset: DateFilterPreset;
  customDateRange: DateRange;
  onDateFilterPresetChange: (preset: DateFilterPreset) => void;
  onCustomDateRangeChange: (range: DateRange) => void;
  minDate: Date | null;
  maxDate: Date | null;
  manuallyExcludedNumbers?: number[];
  filteredDraws: LotteryDraw[];
}): React.JSX.Element | null {
  if (historicalData.length === 0) {
    return null;
  }

  return (
    <div className="statistics-section">
      <div className="statistics-header">
        <h3>📊 Data Insights</h3>
        <button 
          className="statistics-toggle-btn"
          onClick={onToggle}
        >
          {showStatistics ? '📉 Hide Statistics' : '📈 Show Statistics'}
        </button>
      </div>
      
      {showStatistics && (
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
      )}
    </div>
  );
}

function App(): React.JSX.Element {
  const [showStatistics, setShowStatistics] = useState(false);
  const [importedDraws, setImportedDraws] = useState<DrawRecord[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  
  const {
    state,
    setSelectedGame,
    updateConfig,
    generateNumbers,
    clearHistory,
    getCurrentGame,
    setDateFilterPreset,
    setCustomDateRange,
    toggleManualExclusion,
  } = useLotteryGenerator();

  const currentGame = getCurrentGame();

  // Toggle excluded number
  const handleNumberToggle = (number: number): void => {
    toggleManualExclusion(number);
  };

  // Handle imported draws
  const handleImportDraws = (draws: DrawRecord[]): void => {
    setImportedDraws(draws);
    setValidationResults([]); // Clear previous results
  };

  // Handle validation
  const handleValidate = (actualNumbers: number[]): void => {
    const generatedDraws = importedDraws.map(draw => draw.numbers);
    const results = validateDraws(generatedDraws, actualNumbers);
    setValidationResults(results);
  };

  // Prepare export metadata
  const exportMetadata: ExportMetadata = {
    game: currentGame.gameType ?? 'Unknown',
    generatedDate: new Date(),
    totalDraws: state.generatedNumbers.length,
    configuration: {
      excludeTop: state.config.excludeTop,
      excludeBottom: state.config.excludeBottom,
      threshold: state.config.threshold,
      warmUpIterations: state.config.warmUpIterations,
      warmUpOnce: state.config.warmUpOnce,
    },
    dateFilter: {
      preset: state.dateFilterPreset,
      customRange: {
        start: state.customDateRange.from,
        end: state.customDateRange.to,
      },
    },
    generatorVersion: '1.0.0',
    excludedNumbers: state.excludedNumbers,
  };

  return (
    <div className="app">
      <ThemeToggle />
      
      <header className="app-header">
        <h1>🎰 Lottery Number Generator</h1>
        <p>AI-Powered Smart Number Generation</p>
      </header>
      
      <main className="app-main">
        <div className="app-layout">
          <aside className="app-sidebar">
            <GameSelector 
              selectedGame={state.selectedGame}
              onGameChange={setSelectedGame}
            />
            
            <ConfigurationPanel
              config={state.config}
              onConfigChange={updateConfig}
            />
          </aside>

          <div className="app-content">
            <div className="generation-section">
              <NumberDisplay 
                numbers={state.generatedNumbers}
                gameName={currentGame.gameType ?? 'Unknown'}
              />
              
              {state.error && (
                <div className="error-message">
                  ⚠️ {state.error}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <GenerateButton
                  onClick={(): void => {
                    void generateNumbers();
                  }}
                  isGenerating={state.isGenerating}
                />
                
                <ExportButton
                  draws={state.generatedNumbers}
                  metadata={exportMetadata}
                  disabled={state.generatedNumbers.length === 0}
                />
              </div>
            </div>

            <GeneratedHistory
              history={state.history}
              onClear={clearHistory}
            />

            <StatisticsSection
              historicalData={state.historicalData}
              maxNumber={currentGame.max}
              excludedNumbers={state.excludedNumbers}
              showStatistics={showStatistics}
              onToggle={(): void => setShowStatistics(!showStatistics)}
              onNumberToggle={handleNumberToggle}
              dateFilterPreset={state.dateFilterPreset}
              customDateRange={state.customDateRange}
              onDateFilterPresetChange={setDateFilterPreset}
              onCustomDateRangeChange={setCustomDateRange}
              minDate={state.minDate}
              maxDate={state.maxDate}
              manuallyExcludedNumbers={state.manuallyExcludedNumbers}
              filteredDraws={state.filteredDraws}
            />

            {/* Validation Section */}
            <div className="validation-section-container">
              <ValidationPanel
                onImportDraws={handleImportDraws}
                onValidate={handleValidate}
                hasImportedDraws={importedDraws.length > 0}
              />
              
              {validationResults.length > 0 && (
                <ValidationResults
                  results={validationResults}
                  actualNumbers={validationResults[0]?.actual ?? []}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Powered by AI & TypeScript ✨</p>
      </footer>
    </div>
  );
}

export default App;
