import { useLotteryGenerator } from './hooks/useLotteryGenerator';
import { GameSelector } from './components/GameSelector';
import { NumberDisplay } from './components/NumberDisplay';
import { GenerateButton } from './components/GenerateButton';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { GeneratedHistory } from './components/GeneratedHistory';

function App(): React.JSX.Element {
  const {
    state,
    setSelectedGame,
    updateConfig,
    generateNumbers,
    clearHistory,
    getCurrentGame,
  } = useLotteryGenerator();

  const currentGame = getCurrentGame();

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
