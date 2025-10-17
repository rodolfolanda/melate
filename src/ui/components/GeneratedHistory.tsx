import React from 'react';

interface GeneratedSet {
  id: string;
  numbers: number[];
  timestamp: Date;
  gameName: string;
}

interface GeneratedHistoryProps {
  history: GeneratedSet[];
  onClear: () => void;
}

export function GeneratedHistory({ history, onClear }: GeneratedHistoryProps): React.JSX.Element {
  const copyToClipboard = (numbers: number[]): void => {
    const text = numbers.join(', ');
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      console.error('Failed to copy');
    });
  };

  if (history.length === 0) {
    return (
      <div className="history-panel history-panel-empty">
        <h3 className="history-title">Generation History</h3>
        <p className="history-empty-message">No history yet</p>
      </div>
    );
  }

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3 className="history-title">Generation History ({history.length})</h3>
        <button className="history-clear-btn" onClick={onClear}>
          Clear All
        </button>
      </div>
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-entry">
            <div className="history-entry-header">
              <span className="history-entry-game">{entry.gameName}</span>
              <span className="history-entry-time">
                {entry.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="history-entry-numbers">
              {entry.numbers.join(', ')}
            </div>
            <button
              className="history-entry-copy"
              onClick={(): void => copyToClipboard(entry.numbers)}
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
