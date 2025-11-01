import { useState } from 'react';
import { useLotteryGenerator } from './hooks/useLotteryGenerator';
import { StatisticsPanel } from './components/StatisticsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { ValidationPanel } from './components/ValidationPanel';
import { ValidationResults } from './components/ValidationResults';
import { validateDraws, type DrawRecord, type ValidationResult, type ExportMetadata } from '../core/melate.export';
import { Sidebar, type SidebarSection } from './components/Sidebar';
import { GeneratorSection } from './components/GeneratorSection';




function App(): React.JSX.Element {
  const [activeSection, setActiveSection] = useState<SidebarSection>('generator');
  const [importedDraws, setImportedDraws] = useState<DrawRecord[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [actualNumbers, setActualNumbers] = useState<number[]>([]);
  
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
    setActualNumbers([]); // Clear actual numbers when clearing/importing new draws
  };

  // Handle validation
  const handleValidate = (numbers: number[]): void => {
    const generatedDraws = importedDraws.map(draw => draw.numbers);
    const results = validateDraws(generatedDraws, numbers);
    setValidationResults(results);
    setActualNumbers(numbers); // Store actual numbers separately
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
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        hasHistoricalData={state.historicalData.length > 0}
      />
      
      <div className="app-main-content">
        <ThemeToggle />
        
        <div className="app-content-wrapper">
          {/* Generator Section */}
          {activeSection === 'generator' && (
            <GeneratorSection
              state={state}
              currentGameName={currentGame.gameType ?? 'Unknown'}
              onGameChange={setSelectedGame}
              onConfigChange={updateConfig}
              onGenerate={(): void => {
                void generateNumbers();
              }}
              onClearHistory={clearHistory}
              exportMetadata={exportMetadata}
            />
          )}

          {/* Statistics Section */}
          {activeSection === 'statistics' && (
            <div className="section-panel">
              <h2>📊 Statistics</h2>
              {state.historicalData.length > 0 ? (
                <StatisticsPanel
                  historicalData={state.historicalData}
                  maxNumber={currentGame.max}
                  excludedNumbers={state.excludedNumbers}
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
              ) : (
                <p className="help-text">Load a game first to view statistics</p>
              )}
            </div>
          )}

          {/* Validation Section */}
          {activeSection === 'validation' && (
            <>
              <div className="section-panel">
                <ValidationPanel
                  onImportDraws={handleImportDraws}
                  onValidate={handleValidate}
                  hasImportedDraws={importedDraws.length > 0}
                />
              </div>
              
              {validationResults.length > 0 && actualNumbers.length > 0 && (
                <div className="section-panel">
                  <ValidationResults
                    results={validationResults}
                    actualNumbers={actualNumbers}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
