import React from 'react';

interface LotteryBallProps {
  number: number;
  index?: number;
  animate?: boolean;
  delay?: number;
}

// Assign color class based on number ranges
function getColorClass(num: number): string {
  const range1 = 10;
  const range2 = 20;
  const range3 = 30;
  const range4 = 40;
  const range5 = 50;
  
  if (num <= range1) return 'ball-color-1';
  if (num <= range2) return 'ball-color-2';
  if (num <= range3) return 'ball-color-3';
  if (num <= range4) return 'ball-color-4';
  if (num <= range5) return 'ball-color-5';
  return 'ball-color-6';
}

export function LotteryBall({ 
  number, 
  index = 0, 
  animate = false,
  delay = 0,
}: LotteryBallProps): React.JSX.Element {
  const colorClass = getColorClass(number);
  
  return (
    <div 
      className={`lottery-ball ${colorClass} ${animate ? 'lottery-ball-bounce' : ''}`}
      style={{
        animationDelay: animate ? `${delay}s` : `${index * 100}ms`,
      }}
    >
      <span className="lottery-ball-number">{number}</span>
    </div>
  );
}
