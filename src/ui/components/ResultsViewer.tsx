import React, { useState, useEffect } from 'react';
import { processCsvFileBrowserWithDates, type LotteryDraw } from '../../core/melate.history.browser';
import { LotteryBall } from './LotteryBall';

type GameKey = 'sixFourtyNine' | 'lottoMax' | 'bcSixFourtyNine';

interface ResultsViewerProps {
  selectedGame: GameKey;
  onGameChange: (game: GameKey) => void;
}

const RESULT_LIMIT_5 = 5;
const RESULT_LIMIT_10 = 10;
const RESULT_LIMIT_50 = 50;
const RESULT_LIMIT_100 = 100;

type ResultLimit = typeof RESULT_LIMIT_5 | typeof RESULT_LIMIT_10 | typeof RESULT_LIMIT_50 | typeof RESULT_LIMIT_100 | 'all';

const GAME_FILE_MAP: Record<GameKey, string> = {
  sixFourtyNine: 'data/649.csv',
  lottoMax: 'data/LOTTOMAX.csv',
  bcSixFourtyNine: 'data/BC49.csv',
};

const GAME_DISPLAY_NAMES: Record<GameKey, string> = {
  sixFourtyNine: 'Lotto 6/49',
  lottoMax: 'Lotto Max',
  bcSixFourtyNine: 'BC/49',
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface ResultsControlsProps {
  selectedGame: GameKey;
  onGameChange: (game: GameKey) => void;
  limit: ResultLimit;
  onLimitChange: (limit: ResultLimit) => void;
  totalDraws: number;
}

const ResultsControls: React.FC<ResultsControlsProps> = ({
  selectedGame,
  onGameChange,
  limit,
  onLimitChange,
  totalDraws,
}) => {
  return (
    <div className="results-controls">
      <div className="control-group">
        <label htmlFor="results-game-select">Game:</label>
        <select
          id="results-game-select"
          value={selectedGame}
          onChange={(e) => { onGameChange(e.target.value as GameKey); }}
          className="game-select"
        >
          <option value="sixFourtyNine">Lotto 6/49</option>
          <option value="lottoMax">Lotto Max</option>
          <option value="bcSixFourtyNine">BC/49</option>
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="results-limit-select">Show:</label>
        <select
          id="results-limit-select"
          value={limit}
          onChange={(e) => {
            const value = e.target.value;
            onLimitChange(value === 'all' ? 'all' : Number(value) as ResultLimit);
          }}
          className="limit-select"
        >
          <option value={RESULT_LIMIT_5}>Last 5 draws</option>
          <option value={RESULT_LIMIT_10}>Last 10 draws</option>
          <option value={RESULT_LIMIT_50}>Last 50 draws</option>
          <option value={RESULT_LIMIT_100}>Last 100 draws</option>
          <option value="all">All draws ({totalDraws})</option>
        </select>
      </div>
    </div>
  );
};

interface ResultsTableProps {
  draws: LotteryDraw[];
  limit: ResultLimit;
  totalDraws: number;
  onShowAll: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ draws, limit, totalDraws, onShowAll }) => {
  return (
    <div className="results-container">
      <div className="results-info">
        Showing <strong>{draws.length}</strong> of <strong>{totalDraws}</strong> draws
      </div>

      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="col-date">Draw Date</th>
              <th className="col-numbers">Winning Numbers</th>
            </tr>
          </thead>
          <tbody>
            {draws.map((draw, index) => (
              <tr key={`${draw.date.toISOString()}-${index}`} className="result-row">
                <td className="col-date">{formatDate(draw.date)}</td>
                <td className="col-numbers">
                  <div className="number-display-inline">
                    {draw.numbers.map((num: number, idx: number) => (
                      <LotteryBall key={idx} number={num} index={idx} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {limit !== 'all' && draws.length < totalDraws && (
        <div className="results-footer">
          <button
            onClick={onShowAll}
            className="show-all-button"
          >
            Show all {totalDraws} draws
          </button>
        </div>
      )}
    </div>
  );
};

const ResultsViewer: React.FC<ResultsViewerProps> = ({ selectedGame, onGameChange }) => {
  const [draws, setDraws] = useState<LotteryDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<ResultLimit>(RESULT_LIMIT_10);

  useEffect(() => {
    const loadResults = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const filePath = GAME_FILE_MAP[selectedGame];
        const data = await processCsvFileBrowserWithDates(filePath);
        // Sort by date descending (newest first)
        const sortedData = [...data].sort((a, b) => 
          b.date.getTime() - a.date.getTime(),
        );
        setDraws(sortedData);
      } catch (err) {
        setError(`Failed to load results: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, [selectedGame]);

  const displayedDraws = limit === 'all' ? draws : draws.slice(0, limit);

  return (
    <div className="results-viewer">
      <div className="results-header">
        <h2>📊 Latest Results</h2>
        <p className="results-subtitle">View historical draw results</p>
      </div>

      <ResultsControls
        selectedGame={selectedGame}
        onGameChange={onGameChange}
        limit={limit}
        onLimitChange={setLimit}
        totalDraws={draws.length}
      />

      {loading && (
        <div className="results-loading">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      )}

      {error && (
        <div className="results-error">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && draws.length === 0 && (
        <div className="results-empty">
          <p>No results available for {GAME_DISPLAY_NAMES[selectedGame]}</p>
        </div>
      )}

      {!loading && !error && displayedDraws.length > 0 && (
        <ResultsTable
          draws={displayedDraws}
          limit={limit}
          totalDraws={draws.length}
          onShowAll={() => { setLimit('all'); }}
        />
      )}
    </div>
  );
};

export default ResultsViewer;


