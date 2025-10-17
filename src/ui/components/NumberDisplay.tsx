import React from 'react';
import { LotteryBall } from './LotteryBall';

interface NumberDisplayProps {
  numbers: number[][];
  gameName: string;
}

export function NumberDisplay({ numbers, gameName }: NumberDisplayProps): React.JSX.Element {
  if (numbers.length === 0) {
    return (
      <div className="number-display number-display-empty">
        <p className="empty-message">
          <span className="empty-icon">🎰</span>
          <span>No numbers generated yet</span>
          <span className="empty-hint">Click "Generate Numbers" to get started!</span>
        </p>
      </div>
    );
  }

  return (
    <div className="number-display">
      <h2 className="number-display-title">
        Generated Numbers for {gameName}
      </h2>
      <div className="number-display-sets">
        {numbers.map((set, setIndex) => (
          <div key={`set-${setIndex}`} className="number-set">
            <div className="number-set-label">Set {setIndex + 1}</div>
            <div className="number-set-balls">
              {set.map((number, numberIndex) => (
                <LotteryBall 
                  key={`${setIndex}-${number}`} 
                  number={number}
                  index={numberIndex}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
