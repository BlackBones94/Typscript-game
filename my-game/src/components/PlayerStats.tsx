import React from 'react';
import { Stats } from './types';

interface PlayerStatsProps {
  stats: Stats;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats }) => {
  return (
    <div className="player-stats">
      <h3>Player Stats</h3>
      <p>Health: {stats.health}</p>
      <p>Attack: {stats.attack}</p>
      <p>Defense: {stats.defense}</p>
    </div>
  );
};

export default PlayerStats;
