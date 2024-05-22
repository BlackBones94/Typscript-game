import React, { useEffect, useRef, useState, useCallback } from 'react';
import Combat from './Combat';
import PlayerStats from './PlayerStats';
import EnemyStats from './EnemyStats';
import GameOver from './GameOver';
import Epilogue from './Epilogue';
import '../styles/Game.css';
import { Stats, Item, Potion, Key, CharacterClass, characterStats } from './types';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  stats: Stats;
  isBoss: boolean;
}

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPosition, setPlayerPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [playerStats, setPlayerStats] = useState<Stats | null>(null);
  const [inventory, setInventory] = useState<Item[]>([
    {
      name: 'Health Potion',
      effect: (stats: Stats) => ({ ...stats, health: Math.min(stats.health + 20, 100) }),
      description: 'Restores 20 health points.'
    } as Potion,
  ]);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState<number>(0);
  const [bossDefeated, setBossDefeated] = useState<boolean>(false);
  const [dungeonCompleted, setDungeonCompleted] = useState<boolean>(false);
  const [exitPosition, setExitPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);

  const canvasWidth = 1200; // Augmenter la largeur du canvas
  const canvasHeight = 800; // Augmenter la hauteur du canvas
  const gridSize = 60; // Augmenter la taille de la grille

  const toggleStats = () => setIsStatsOpen(!isStatsOpen);
  const toggleInventory = () => setIsInventoryOpen(!isInventoryOpen);

  const generateDungeon = () => {
    const gridWidth = Math.floor(canvasWidth / gridSize);
    const gridHeight = Math.floor(canvasHeight / gridSize);
    const dungeon = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(1));

    const rooms: { x: number, y: number, width: number, height: number }[] = [];

    // Place rooms
    for (let i = 0; i < 5; i++) {
      const roomWidth = Math.floor(Math.random() * 3) + 3;
      const roomHeight = Math.floor(Math.random() * 3) + 3;
      const roomX = Math.floor(Math.random() * (gridWidth - roomWidth - 1)) + 1;
      const roomY = Math.floor(Math.random() * (gridHeight - roomHeight - 1)) + 1;

      rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });

      // Fill room area with 0 (walkable)
      for (let x = roomX; x < roomX + roomWidth; x++) {
        for (let y = roomY; y < roomY + roomHeight; y++) {
          dungeon[y][x] = 0;
        }
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const prevRoom = rooms[i - 1];
      const currRoom = rooms[i];

      // Horizontal corridor
      const startX = prevRoom.x + Math.floor(prevRoom.width / 2);
      const endX = currRoom.x + Math.floor(currRoom.width / 2);
      const corridorY = prevRoom.y + Math.floor(prevRoom.height / 2);

      for (let x = Math.min(startX, endX); x <= Math.max(startX, endX); x++) {
        dungeon[corridorY][x] = 0;
      }

      // Vertical corridor
      const startY = prevRoom.y + Math.floor(prevRoom.height / 2);
      const endY = currRoom.y + Math.floor(currRoom.height / 2);
      const corridorX = currRoom.x + Math.floor(currRoom.width / 2);

      for (let y = Math.min(startY, endY); y <= Math.max(startY, endY); y++) {
        dungeon[y][corridorX] = 0;
      }
    }

    // Convert grid to obstacles
    const newObstacles: Obstacle[] = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (dungeon[y][x] === 1) {
          newObstacles.push({
            x: x * gridSize,
            y: y * gridSize,
            width: gridSize,
            height: gridSize,
          });
        }
      }
    }

    setObstacles(newObstacles);
    return { dungeon, rooms };
  };

  const generateEnemies = (dungeon: number[][]) => {
    const newEnemies: Enemy[] = [];
    const gridWidth = dungeon[0].length;
    const gridHeight = dungeon.length;

    for (let i = 0; i < 5; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * gridWidth);
        y = Math.floor(Math.random() * gridHeight);
      } while (dungeon[y][x] !== 0); // Ensure enemy is placed in walkable area

      const stats: Stats = { health: 50, attack: 8, defense: 3 };
      newEnemies.push({ id: i, x: x * gridSize, y: y * gridSize, width: gridSize, height: gridSize, stats, isBoss: false });
    }

    // Place boss in a random walkable area
    let bossX, bossY;
    do {
      bossX = Math.floor(Math.random() * gridWidth);
      bossY = Math.floor(Math.random() * gridHeight);
    } while (dungeon[bossY][bossX] !== 0); // Ensure boss is placed in walkable area

    const bossStats: Stats = { health: 200, attack: 15, defense: 10 };
    newEnemies.push({ id: 5, x: bossX * gridSize, y: bossY * gridSize, width: gridSize, height: gridSize, stats: bossStats, isBoss: true });

    setEnemies(newEnemies);
  };

  const placePlayerAndExit = (rooms: { x: number, y: number, width: number, height: number }[]) => {
    const startRoom = rooms[Math.floor(Math.random() * rooms.length)];
    let exitRoom;
    do {
      exitRoom = rooms[Math.floor(Math.random() * rooms.length)];
    } while (exitRoom === startRoom);

    const playerX = startRoom.x * gridSize + (Math.floor(Math.random() * startRoom.width) * gridSize);
    const playerY = startRoom.y * gridSize + (Math.floor(Math.random() * startRoom.height) * gridSize);
    setPlayerPosition({ x: playerX, y: playerY });

    const exitX = exitRoom.x * gridSize + (Math.floor(Math.random() * exitRoom.width) * gridSize);
    const exitY = exitRoom.y * gridSize + (Math.floor(Math.random() * exitRoom.height) * gridSize);
    setExitPosition({ x: exitX, y: exitY });
  };

  const isCollision = (x: number, y: number): boolean => {
    for (let obstacle of obstacles) {
      if (
        x < obstacle.x + obstacle.width &&
        x + gridSize > obstacle.x &&
        y < obstacle.y + obstacle.height &&
        y + gridSize > obstacle.y
      ) {
        return true;
      }
    }
    return false;
  };

  const checkEnemyCollision = (x: number, y: number): Enemy | null => {
    for (let enemy of enemies) {
      if (
        x < enemy.x + enemy.width &&
        x + gridSize > enemy.x &&
        y < enemy.y + enemy.height &&
        y + gridSize > enemy.y
      ) {
        return enemy;
      }
    }
    return null;
  };

  const checkExitCollision = (x: number, y: number, exit: { x: number, y: number }) => {
    return (
      x < exit.x + gridSize &&
      x + gridSize > exit.x &&
      y < exit.y + gridSize &&
      y + gridSize > exit.y
    );
  };

  const hasKey = () => {
    return inventory.some(item => item.name === 'Key');
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setPlayerPosition((prev) => {
      const newPos = { ...prev };
      switch (event.key) {
        case 'ArrowUp':
          newPos.y -= gridSize / 5;
          break;
        case 'ArrowDown':
          newPos.y += gridSize / 5;
          break;
        case 'ArrowLeft':
          newPos.x -= gridSize / 5;
          break;
        case 'ArrowRight':
          newPos.x += gridSize / 5;
          break;
      }
      if (isCollision(newPos.x, newPos.y)) {
        return prev;
      }
      const collidedEnemy = checkEnemyCollision(newPos.x, newPos.y);
      if (collidedEnemy) {
        setCurrentEnemy(collidedEnemy);
        setInCombat(true);
        return prev;
      }
      if (bossDefeated && hasKey() && checkExitCollision(newPos.x, newPos.y, exitPosition)) {
        setDungeonCompleted(true);
      }
      return newPos;
    });
  }, [obstacles, enemies, bossDefeated, exitPosition, inventory]);

  useEffect(() => {
    if (characterClass !== null) {
      const { dungeon, rooms } = generateDungeon();
      generateEnemies(dungeon);
      placePlayerAndExit(rooms);
    }
  }, [characterClass]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'green';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = 'brown';
        obstacles.forEach((obstacle) => {
          context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        enemies.forEach((enemy) => {
          const img = new Image();
          img.src = enemy.isBoss ? '/assets/boss.png' : '/assets/enemy.png';
          img.onload = () => {
            context.drawImage(img, enemy.x, enemy.y, enemy.width, enemy.height);
          };
        });

        const playerImg = new Image();
        switch (characterClass) {
          case CharacterClass.Warrior:
            playerImg.src = '/assets/warrior.png';
            break;
          case CharacterClass.Thief:
            playerImg.src = '/assets/thief.png';
            break;
          case CharacterClass.Mage:
            playerImg.src = '/assets/mage.png';
            break;
        }
        playerImg.onload = () => {
          context.drawImage(playerImg, playerPosition.x, playerPosition.y, gridSize, gridSize);
        };

        // Draw exit
        context.fillStyle = 'yellow';
        context.fillRect(exitPosition.x, exitPosition.y, gridSize, gridSize);
      }
    }
  }, [playerPosition, obstacles, enemies, exitPosition, characterClass]);

  const handleEndCombat = () => {
    setInCombat(false);
    setCurrentEnemy(null);
  };

  const handleEnemyDefeat = () => {
    if (currentEnemy) {
      if (currentEnemy.isBoss) {
        setBossDefeated(true);
        setInventory((prevInventory) => [
          ...prevInventory,
          {
            name: 'Key',
            description: 'A key that allows you to exit the dungeon.',
          } as Key,
        ]);
        alert('You received a Key!');
      }
      setEnemies((prevEnemies) =>
        prevEnemies.filter((enemy) => enemy.id !== currentEnemy.id)
      );
      setEnemiesDefeated((prevCount) => prevCount + 1);

      if (Math.random() < 0.2) {
        setInventory((prevInventory) => [
          ...prevInventory,
          {
            name: 'Health Potion',
            effect: (stats: Stats) => ({ ...stats, health: Math.min(stats.health + 20, 100) }),
            description: 'Restores 20 health points.',
          } as Potion,
        ]);
        alert('You received a Health Potion!');
      }
    }
    handleEndCombat();
  };

  const handleFlee = () => {
    handleEndCombat();
  };

  const handleGameOver = () => {
    setGameOver(true);
  };

  const handleUseItem = (item: Item) => {
    if ('effect' in item && playerStats!.health < 100) {
      setPlayerStats(prevStats => prevStats ? item.effect!(prevStats) : prevStats);
      setInventory((prevInventory) =>
        prevInventory.filter((invItem) => invItem !== item)
      );
    } else if (item.name !== 'Key') {
      alert("Your health is already at maximum!");
    }
  };

  const handleRestart = () => {
    setPlayerPosition({ x: gridSize, y: gridSize });
    setPlayerStats(null);
    setInventory([
      {
        name: 'Health Potion',
        effect: (stats: Stats) => ({ ...stats, health: Math.min(stats.health + 20, 100) }),
        description: 'Restores 20 health points.',
      } as Potion,
    ]);
    setEnemies([]);
    setEnemiesDefeated(0);
    setGameOver(false);
    setDungeonCompleted(false);
    setBossDefeated(false);
    setCharacterClass(null);
  };

  const handleClassSelect = (selectedClass: CharacterClass) => {
    setCharacterClass(selectedClass);
    setPlayerStats(characterStats[selectedClass]);
  };

  if (!characterClass) {
    return <Epilogue onClassSelect={handleClassSelect} />;
  }

  if (gameOver) {
    return (
      <GameOver enemiesDefeated={enemiesDefeated} onRestart={handleRestart} />
    );
  }

  if (dungeonCompleted) {
    return (
      <div className="dungeon-completed-screen">
        <h1>Dungeon Completed!</h1>
        <p>You defeated {enemiesDefeated} enemies.</p>
        <button onClick={handleRestart}>Restart Game</button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight}></canvas>
      <button className="toggle-button" onClick={toggleStats}>
        {isStatsOpen ? 'Close Stats' : 'Open Stats'}
      </button>
      <button className="toggle-button" onClick={toggleInventory}>
        {isInventoryOpen ? 'Close Inventory' : 'Open Inventory'}
      </button>
      {isStatsOpen && playerStats && <div className="player-stats"><PlayerStats stats={playerStats} /></div>}
      {isInventoryOpen && (
        <div className="inventory">
          <h3>Inventory</h3>
          {inventory.map((item, index) => (
            <button key={index} onClick={() => handleUseItem(item)}>
              {item.name} - {item.description}
            </button>
          ))}
        </div>
      )}
      {inCombat && currentEnemy && (
        <div className="combat-screen">
          <Combat 
            onEndCombat={handleEnemyDefeat}
            onFlee={handleFlee}
            onGameOver={handleGameOver}
            playerStats={playerStats!}
            enemyStats={currentEnemy.stats}
            updatePlayerStats={setPlayerStats}
            updateEnemyStats={(stats) => setCurrentEnemy((prev) => prev ? { ...prev, stats } : null)}
            inventory={inventory}
            onUseItem={handleUseItem}
          />
        </div>
      )}
      {inCombat && currentEnemy && <div className="enemy-stats"><EnemyStats stats={currentEnemy.stats} /></div>}
    </div>
  );
};

export default Game;
