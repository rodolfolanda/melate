import { useState } from 'react';
import { useLotteryGenerator } from './hooks/useLotteryGenerator';
import { ThemeToggle } from './components/ThemeToggle';
import { validateDraws, type DrawRecord, type ValidationResult, type ExportMetadata } from '../core/melate.export';
import { Sidebar, type SidebarSection } from './components/Sidebar';
import { GeneratorSection } from './components/GeneratorSection';
import { StatisticsSection } from './components/StatisticsSection';
import { ValidationSection } from './components/ValidationSection';

// Helper function to create export metadata
function createExportMetadata(state: {
  generatedNumbers: number[][];
  config: {
    excludeTop: number;
    excludeBottom: number;
    threshold: number;
    warmUpIterations: number;
    warmUpOnce: boolean;
  };
  dateFilterPreset: string;
  customDateRange: { from: Date | null; to: Date | null };
  excludedNumbers: number[];
}, gameType: string): ExportMetadata {
  return {
    game: gameType,
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
        start: state.customDateRange.from ?? new Date(),
        end: state.customDateRange.to ?? new Date(),
      },
    },
    generatorVersion: '1.0.0',
    excludedNumbers: state.excludedNumbers,
  };
}

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

  const handleNumberToggle = (number: number): void => {
    toggleManualExclusion(number);
  };

  const handleImportDraws = (draws: DrawRecord[]): void => {
    setImportedDraws(draws);
    setValidationResults([]);
    setActualNumbers([]);
  };

  const handleValidate = (numbers: number[]): void => {
    const generatedDraws = importedDraws.map(draw => draw.numbers);
    const results = validateDraws(generatedDraws, numbers);
    setValidationResults(results);
    setActualNumbers(numbers);
  };

  const exportMetadata = createExportMetadata(state, currentGame.gameType ?? 'Unknown');

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
            <StatisticsSection
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
          )}

          {/* Validation Section */}
          {activeSection === 'validation' && (
            <ValidationSection
              importedDraws={importedDraws}
              validationResults={validationResults}
              actualNumbers={actualNumbers}
              onImportDraws={handleImportDraws}
              onValidate={handleValidate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
