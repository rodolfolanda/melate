import React from 'react';

interface LotteryBallProps {
  number: number;
  index?: number;
}

export function LotteryBall({ number, index = 0 }: LotteryBallProps): React.JSX.Element {
  return (
    <div 
      className="lottery-ball"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <span className="lottery-ball-number">{number}</span>
    </div>
  );
}
