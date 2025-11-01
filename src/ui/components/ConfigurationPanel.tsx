import React, { useState } from 'react';

interface ConfigurationPanelProps {
  config: {
    excludeTop: number;
    excludeBottom: number;
    numberOfDraws: number;
    threshold: number;
    warmUpIterations: number;
    warmUpOnce: boolean;
  };
  onConfigChange: (config: Partial<ConfigurationPanelProps['config']>) => void;
}

// eslint-disable-next-line max-lines-per-function
export function ConfigurationPanel({ 
  config, 
  onConfigChange,
}: ConfigurationPanelProps): React.JSX.Element {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="config-panel">
      <h3 className="config-panel-title">Configuration</h3>
      
      <div className="config-group">
        <label htmlFor="exclude-top" className="config-label">
          Exclude Top {config.excludeTop} Most Frequent
        </label>
        <input
          id="exclude-top"
          type="range"
          min="0"
          max="10"
          value={config.excludeTop}
          onChange={(e): void => onConfigChange({ excludeTop: Number(e.target.value) })}
          className="config-slider"
        />
        <span className="config-value">{config.excludeTop}</span>
      </div>

      <div className="config-group">
        <label htmlFor="exclude-bottom" className="config-label">
          Exclude Bottom {config.excludeBottom} Least Frequent
        </label>
        <input
          id="exclude-bottom"
          type="range"
          min="0"
          max="10"
          value={config.excludeBottom}
          onChange={(e): void => onConfigChange({ excludeBottom: Number(e.target.value) })}
          className="config-slider"
        />
        <span className="config-value">{config.excludeBottom}</span>
      </div>

      <button
        className="config-advanced-toggle"
        onClick={(): void => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? '▼' : '▶'} Expert Settings
      </button>

      {showAdvanced && (
        <div className="config-advanced">
          <div className="config-group">
            <label htmlFor="threshold" className="config-label">
              Uniqueness Threshold
            </label>
            <input
              id="threshold"
              type="range"
              min="0"
              max="5"
              value={config.threshold}
              onChange={(e): void => onConfigChange({ threshold: Number(e.target.value) })}
              className="config-slider"
            />
            <span className="config-value">{config.threshold}</span>
            <p className="config-hint">
              How many numbers can match historical draws
            </p>
          </div>

          <div className="config-group">
            <label htmlFor="warmup" className="config-label">
              Warm-up Iterations
            </label>
            <input
              id="warmup"
              type="number"
              min="10"
              max="5000"
              step="10"
              value={config.warmUpIterations}
              onChange={(e): void => onConfigChange({ warmUpIterations: Number(e.target.value) })}
              className="config-input"
            />
            <p className="config-hint">
              Number of randomization cycles (max 5000 for performance)
            </p>
          </div>

          <div className="config-group">
            <label className="config-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.warmUpOnce}
                onChange={(e): void => onConfigChange({ warmUpOnce: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span>Warm up once for all draws (faster)</span>
            </label>
            <p className="config-hint" style={{ marginLeft: '28px' }}>
              {config.warmUpOnce 
                ? '✓ Best performance: warm-up runs once, then generates all draws quickly'
                : `⚠️ Slower: each draw gets independent warm-up (×${config.numberOfDraws} iterations)`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
