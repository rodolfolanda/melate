import { useState } from 'react';
import { useLotteryGenerator } from './hooks/useLotteryGenerator';
import { GameSelector } from './components/GameSelector';
import { NumberDisplay } from './components/NumberDisplay';
import { GenerateButton } from './components/GenerateButton';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { GeneratedHistory } from './components/GeneratedHistory';
import { StatisticsPanel } from './components/StatisticsPanel';

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
}: {
  historicalData: number[][];
  maxNumber: number;
  excludedNumbers: number[];
  showStatistics: boolean;
  onToggle: () => void;
  onNumberToggle: (number: number) => void;
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
        />
      )}
    </div>
  );
}

function App(): React.JSX.Element {
  const [showStatistics, setShowStatistics] = useState(false);
  
  const {
    state,
    setSelectedGame,
    updateConfig,
    generateNumbers,
    clearHistory,
    getCurrentGame,
  } = useLotteryGenerator();

  const currentGame = getCurrentGame();

  // Toggle excluded number
  const handleNumberToggle = (number: number): void => {
    // This would need to be implemented in the hook to allow manual exclusion
    // For now, we'll just log it
    console.log('Toggle number:', number);
  };

  return (
    <div className="app">
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
              
              <GenerateButton
                onClick={(): void => {
                  void generateNumbers();
                }}
                isGenerating={state.isGenerating}
              />
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
            />
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
