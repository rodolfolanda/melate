import React from 'react';
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
  return (
    <>
      <div className="section-panel">
        <h2>🎲 Generate Numbers</h2>
        <GameSelector 
          selectedGame={state.selectedGame}
          onGameChange={onGameChange}
        />
        
        <ConfigurationPanel
          config={state.config}
          onConfigChange={onConfigChange}
        />
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
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
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

      <GeneratedHistory
        history={state.history}
        onClear={onClearHistory}
      />
    </>
  );
}
