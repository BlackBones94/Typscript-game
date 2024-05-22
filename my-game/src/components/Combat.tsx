import React, { useState, useEffect } from 'react';
import { Stats, Item } from './types';

interface CombatProps {
  onEndCombat: () => void;
  onFlee: () => void;
  onGameOver: () => void;
  playerStats: Stats;
  enemyStats: Stats;
  updatePlayerStats: (stats: Stats) => void;
  updateEnemyStats: (stats: Stats) => void;
  inventory: Item[];
  onUseItem: (item: Item) => void;
}

const rollDice = (sides: number) => {
  return Math.floor(Math.random() * sides) + 1;
};

const Combat: React.FC<CombatProps> = ({
  onEndCombat,
  onFlee,
  onGameOver,
  playerStats,
  enemyStats,
  updatePlayerStats,
  updateEnemyStats,
  inventory,
  onUseItem,
}) => {
  const [currentEnemyStats, setCurrentEnemyStats] = useState<Stats>(enemyStats);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  useEffect(() => {
    updateEnemyStats(currentEnemyStats);
  }, [currentEnemyStats, updateEnemyStats]);

  const calculateDamage = (attack: number, defense: number) => {
    const attackRoll = rollDice(20) + attack;
    const defenseRoll = rollDice(20) + defense;
    return Math.max(attackRoll - defenseRoll, 0);
  };

  const attackEnemy = () => {
    const damage = calculateDamage(playerStats.attack, currentEnemyStats.defense);
    setCurrentEnemyStats((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
    setCombatLog((prev) => [...prev, `Player dealt ${damage} damage to Enemy`]);
    if (currentEnemyStats.health - damage <= 0) {
      setCombatLog((prev) => [...prev, `Enemy defeated!`]);
      onEndCombat();
    }
  };

  const enemyAttack = () => {
    const damage = calculateDamage(currentEnemyStats.attack, playerStats.defense);
    updatePlayerStats({ ...playerStats, health: Math.max(playerStats.health - damage, 0) });
    setCombatLog((prev) => [...prev, `Enemy dealt ${damage} damage to Player`]);
    if (playerStats.health - damage <= 0) {
      onGameOver();
    }
  };

  const handleAttack = () => {
    attackEnemy();
    setTimeout(enemyAttack, 500);
  };

  const handleFlee = () => {
    const fleeSuccess = rollDice(2) === 1;
    if (fleeSuccess) {
      setCombatLog((prev) => [...prev, 'Player successfully fled!']);
      onFlee();
    } else {
      setCombatLog((prev) => [...prev, 'Player failed to flee!']);
      setTimeout(enemyAttack, 500);
    }
  };

  const handleUseItem = (item: Item) => {
    if (playerStats.health < 100) {
      onUseItem(item);
      setCombatLog((prev) => [...prev, `Player used ${item.name} and ${item.description}`]);
    } else {
      setCombatLog((prev) => [...prev, `Player's health is already at maximum!`]);
    }
  };

  return (
    <div className="combat-screen">
      <h2>Combat Mode</h2>
      <div className="combat-status">
        <p>Player Health: {playerStats.health}</p>
        <p>Enemy Health: {currentEnemyStats.health}</p>
      </div>
      <div className="combat-actions">
        <button onClick={handleAttack}>Attack</button>
        <button onClick={handleFlee}>Flee</button>
        {inventory.map((item, index) => (
          <button key={index} onClick={() => handleUseItem(item)}>
            Use {item.name}
          </button>
        ))}
      </div>
      <div className="combat-log">
        {combatLog.map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default Combat;
