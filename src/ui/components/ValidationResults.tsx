import React from 'react';
import type { ValidationResult } from '../../core/melate.export';
import { LotteryBall } from './LotteryBall';

interface ValidationResultsProps {
  results: ValidationResult[];
  actualNumbers: number[];
}

interface PrizeStats {
  jackpots: number;
  secondPrize: number;
  thirdPrize: number;
  fourthPrize: number;
  freePlays: number;
  total: number;
}

function calculatePrizeStats(results: ValidationResult[]): PrizeStats {
  const stats: PrizeStats = {
    jackpots: 0,
    secondPrize: 0,
    thirdPrize: 0,
    fourthPrize: 0,
    freePlays: 0,
    total: 0,
  };

  for (const result of results) {
    if (result.prize) {
      stats.total++;
      if (result.prize === 'JACKPOT') stats.jackpots++;
      else if (result.prize === 'Second Prize') stats.secondPrize++;
      else if (result.prize === 'Third Prize') stats.thirdPrize++;
      else if (result.prize === 'Fourth Prize') stats.fourthPrize++;
      else if (result.prize === 'Free Play') stats.freePlays++;
    }
  }

  return stats;
}

interface StatCardProps {
  label: string;
  value: number;
  className?: string;
}

function StatCard({ label, value, className = '' }: StatCardProps): React.ReactElement {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

interface ResultsTableProps {
  results: ValidationResult[];
}

function ResultsTable({ results }: ResultsTableProps): React.ReactElement {
  return (
    <div className="results-table-container">
      <h3>Detailed Results</h3>
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th>Draw #</th>
              <th>Your Numbers</th>
              <th>Matches</th>
              <th>Matched Numbers</th>
              <th>Prize</th>
            </tr>
          </thead>
          <tbody>
            {results
              .sort((a, b) => b.matchCount - a.matchCount)
              .map((result) => (
                <tr key={result.drawNumber} className={result.prize ? 'has-prize' : ''}>
                  <td className="draw-number">{result.drawNumber}</td>
                  <td className="numbers-cell">
                    <div className="mini-balls">
                      {result.generated.map((num, idx) => (
                        <span 
                          key={idx} 
                          className={`mini-ball ${result.matches.includes(num) ? 'matched' : ''}`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="match-count">
                    <span className={`match-badge match-${result.matchCount}`}>
                      {result.matchCount}
                    </span>
                  </td>
                  <td className="matched-numbers">
                    {result.matches.length > 0 ? (
                      <div className="mini-balls">
                        {result.matches.map((num, idx) => (
                          <span key={idx} className="mini-ball matched">
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-match">—</span>
                    )}
                  </td>
                  <td className="prize-cell">
                    {result.prize ? (
                      <span className={`prize-badge prize-${result.prize.toLowerCase().replace(/\s+/g, '-')}`}>
                        {result.prize}
                      </span>
                    ) : (
                      <span className="no-prize">—</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BestDrawHighlightProps {
  bestDraw: ValidationResult;
}

function BestDrawHighlight({ bestDraw }: BestDrawHighlightProps): React.ReactElement | null {
  if (bestDraw.matchCount < 3) return null;

  return (
    <div className="best-draw-highlight">
      <h3>🌟 Your Best Draw</h3>
      <p>Draw #{bestDraw.drawNumber} matched {bestDraw.matchCount} numbers!</p>
      <div className="lottery-balls-container">
        {bestDraw.generated.map((num, idx) => (
          <div 
            key={idx}
            className={`lottery-ball ${bestDraw.matches.includes(num) ? 'highlighted-match' : ''}`}
          >
            <span className="lottery-ball-number">{num}</span>
          </div>
        ))}
      </div>
      {bestDraw.prize && <p className="best-draw-prize">Prize: {bestDraw.prize}</p>}
    </div>
  );
}

export function ValidationResults({ results, actualNumbers }: ValidationResultsProps): React.ReactElement {
  // Guard against empty results
  if (results.length === 0) {
    return (
      <div className="validation-results">
        <h2>📊 Validation Results</h2>
        <p className="help-text">No results to display.</p>
      </div>
    );
  }

  const stats = calculatePrizeStats(results);
  const bestDraw = results.reduce((best, current) => 
    current.matchCount > best.matchCount ? current : best
  , results[0]);

  return (
    <div className="validation-results">
      <h2>📊 Validation Results</h2>

      {/* Actual Numbers Section */}
      <div className="actual-numbers-section">
        <h3>Winning Numbers</h3>
        <div className="lottery-balls-container">
          {actualNumbers.map((num, idx) => (
            <LotteryBall key={idx} number={num} />
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="stats-grid">
        <StatCard label="Total Draws" value={results.length} className="stat-total" />
        <StatCard label="Winning Draws" value={stats.total} className="stat-wins" />
        <StatCard label="Best Match" value={bestDraw.matchCount} className="stat-best" />
        <StatCard label="Win Rate" value={Math.round((stats.total / results.length) * 100)} className="stat-rate" />
      </div>

      {/* Prize Breakdown */}
      {stats.total > 0 && (
        <div className="prize-breakdown">
          <h3>Prize Breakdown</h3>
          <div className="prize-grid">
            {stats.jackpots > 0 && <StatCard label="🏆 Jackpots" value={stats.jackpots} className="prize-jackpot" />}
            {stats.secondPrize > 0 && <StatCard label="🥈 Second Prize" value={stats.secondPrize} className="prize-second" />}
            {stats.thirdPrize > 0 && <StatCard label="🥉 Third Prize" value={stats.thirdPrize} className="prize-third" />}
            {stats.fourthPrize > 0 && <StatCard label="🎖️ Fourth Prize" value={stats.fourthPrize} className="prize-fourth" />}
            {stats.freePlays > 0 && <StatCard label="🎫 Free Plays" value={stats.freePlays} className="prize-free" />}
          </div>
        </div>
      )}

      <ResultsTable results={results} />
      <BestDrawHighlight bestDraw={bestDraw} />
    </div>
  );
}
