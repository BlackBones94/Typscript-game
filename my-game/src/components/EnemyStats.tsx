import React from 'react';
import { Stats } from './types';

interface EnemyStatsProps {
  stats: Stats;
}

const EnemyStats: React.FC<EnemyStatsProps> = ({ stats }) => {
  return (
    <div className="enemy-stats">
      <h3>Enemy Stats</h3>
      <p>Health: {stats.health}</p>
      <p>Attack: {stats.attack}</p>
      <p>Defense: {stats.defense}</p>
    </div>
  );
};

export default EnemyStats;
