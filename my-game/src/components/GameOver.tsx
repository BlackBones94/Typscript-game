import React from 'react';

interface GameOverProps {
  enemiesDefeated: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ enemiesDefeated, onRestart }) => {
  return (
    <div className="game-over-screen">
      <h1>Game Over</h1>
      <p>You defeated {enemiesDefeated} enemies.</p>
      <button onClick={onRestart}>Restart Game</button>
    </div>
  );
};

export default GameOver;
