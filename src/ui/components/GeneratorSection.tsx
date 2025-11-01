import React, { useState } from 'react';
import { GameSelector } from './GameSelector';
import { ConfigurationPanel } from './ConfigurationPanel';
import { NumberDisplay } from './NumberDisplay';
import { GenerateButton } from './GenerateButton';
import { ExportButton } from './ExportButton';
import { GeneratedHistory } from './GeneratedHistory';
import type { ExportMetadata } from '../../core/melate.export';

interface GeneratorSectionProps {
  state: {
    selectedGame: 'sixFourtyNine' | 'lottoMax' | 'bcSixFourtyNine';
    config: {
      excludeTop: number;
      excludeBottom: number;
      numberOfDraws: number;
      threshold: number;
      warmUpIterations: number;
      warmUpOnce: boolean;
    };
    generatedNumbers: number[][];
    history: {
      id: string;
      numbers: number[];
      timestamp: Date;
      gameName: string;
    }[];
    isGenerating: boolean;
    error: string | null;
  };
  currentGameName: string;
  onGameChange: (game: 'sixFourtyNine' | 'lottoMax' | 'bcSixFourtyNine') => void;
  onConfigChange: (config: Partial<{
    excludeTop: number;
    excludeBottom: number;
    numberOfDraws: number;
    threshold: number;
    warmUpIterations: number;
    warmUpOnce: boolean;
  }>) => void;
  onGenerate: () => void;
  onClearHistory: () => void;
  exportMetadata: ExportMetadata;
}

export function GeneratorSection({
  state,
  currentGameName,
  onGameChange,
  onConfigChange,
  onGenerate,
  onClearHistory,
  exportMetadata,
}: GeneratorSectionProps): React.ReactElement {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <div className="section-panel">
        <h2>🎲 Generate Numbers</h2>
        <GameSelector 
          selectedGame={state.selectedGame}
          onGameChange={onGameChange}
        />
        
        <div className="config-group" style={{ marginTop: '1rem' }}>
          <label htmlFor="num-draws" className="config-label">
            Number of Draws
          </label>
          <input
            id="num-draws"
            type="number"
            min="1"
            max="10"
            value={state.config.numberOfDraws}
            onChange={(e): void => onConfigChange({ numberOfDraws: Number(e.target.value) })}
            className="config-input"
          />
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <button
            className="advanced-toggle-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </button>
          
          {showAdvanced && (
            <div style={{ marginTop: '1rem' }}>
              <ConfigurationPanel
                config={state.config}
                onConfigChange={onConfigChange}
              />
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <GenerateButton
            onClick={onGenerate}
            isGenerating={state.isGenerating}
          />
          
          <ExportButton
            draws={state.generatedNumbers}
            metadata={exportMetadata}
            disabled={state.generatedNumbers.length === 0}
          />
        </div>
      </div>

      <div className="section-panel">
        <NumberDisplay 
          numbers={state.generatedNumbers}
          gameName={currentGameName}
        />
        
        {state.error && (
          <div className="error-message">
            ⚠️ {state.error}
          </div>
        )}
      </div>

      <GeneratedHistory
        history={state.history}
        onClear={onClearHistory}
      />
    </>
  );
}
