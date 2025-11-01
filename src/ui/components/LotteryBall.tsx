import React from 'react';

interface LotteryBallProps {
  number: number;
  index?: number;
  animate?: boolean;
  delay?: number;
}

export function LotteryBall({ 
  number, 
  index = 0, 
  animate = false,
  delay = 0,
}: LotteryBallProps): React.JSX.Element {
  return (
    <div 
      className={`lottery-ball ${animate ? 'lottery-ball-bounce' : ''}`}
      style={{
        animationDelay: animate ? `${delay}s` : `${index * 100}ms`,
      }}
    >
      <span className="lottery-ball-number">{number}</span>
    </div>
  );
}
