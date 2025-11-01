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

  const shouldAnimate = numbers.length >= 1 && numbers.length <= 3;
  const setAnimationDelay = 0.1;
  const ballAnimationDelay = 0.05;

  return (
    <div className="number-display">
      <h2 className="number-display-title">
        Generated Numbers for {gameName}
      </h2>
      <div className="number-display-sets">
        {numbers.map((set, setIndex) => (
          <div 
            key={`set-${setIndex}`} 
            className={`number-set ${shouldAnimate ? 'number-set-animated' : ''}`}
            style={shouldAnimate ? { animationDelay: `${setIndex * setAnimationDelay}s` } : undefined}
          >
            <div className="number-set-label">Set {setIndex + 1}</div>
            <div className="number-set-balls">
              {set.map((number, numberIndex) => (
                <LotteryBall 
                  key={`${setIndex}-${number}`} 
                  number={number}
                  index={numberIndex}
                  animate={shouldAnimate}
                  delay={setIndex * setAnimationDelay + numberIndex * ballAnimationDelay}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
