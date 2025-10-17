import React from 'react';

type GameKey = 'sixFourtyNine' | 'lottoMax' | 'bcSixFourtyNine';

interface GameInfo {
  key: GameKey;
  name: string;
  description: string;
  range: string;
  count: number;
}

const GAMES: GameInfo[] = [
  {
    key: 'sixFourtyNine',
    name: '6/49',
    description: 'Canadian 6/49',
    range: '1-49',
    count: 6,
  },
  {
    key: 'lottoMax',
    name: 'Lotto Max',
    description: 'Lotto Max',
    range: '1-50',
    count: 7,
  },
  {
    key: 'bcSixFourtyNine',
    name: 'BC 49',
    description: 'BC 49',
    range: '1-49',
    count: 6,
  },
];

interface GameSelectorProps {
  selectedGame: GameKey;
  onGameChange: (game: GameKey) => void;
}

export function GameSelector({ selectedGame, onGameChange }: GameSelectorProps): React.JSX.Element {
  const currentGame = GAMES.find(g => g.key === selectedGame) ?? GAMES[0];

  return (
    <div className="game-selector">
      <label htmlFor="game-select" className="game-selector-label">
        Select Lottery Game
      </label>
      <select
        id="game-select"
        className="game-selector-select"
        value={selectedGame}
        onChange={(e): void => onGameChange(e.target.value as GameKey)}
      >
        {GAMES.map(game => (
          <option key={game.key} value={game.key}>
            {game.name} - {game.description}
          </option>
        ))}
      </select>
      <div className="game-selector-info">
        <span className="game-info-badge">
          Pick {currentGame.count} numbers from {currentGame.range}
        </span>
      </div>
    </div>
  );
}
