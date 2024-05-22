import React from 'react';
import { CharacterClass, characterStats } from './types';

interface EpilogueProps {
  onClassSelect: (characterClass: CharacterClass) => void;
}

const Epilogue: React.FC<EpilogueProps> = ({ onClassSelect }) => {
  return (
    <div className="epilogue">
      <h1>Welcome to the Dungeon!</h1>
      <p>In this game, you will embark on a journey through a treacherous dungeon filled with enemies and obstacles. Choose your character class to begin:</p>
      <div className="class-selection">
        <button onClick={() => onClassSelect(CharacterClass.Warrior)}>
          Warrior - {characterStats[CharacterClass.Warrior].health} Health, {characterStats[CharacterClass.Warrior].attack} Attack, {characterStats[CharacterClass.Warrior].defense} Defense
        </button>
        <button onClick={() => onClassSelect(CharacterClass.Thief)}>
          Thief - {characterStats[CharacterClass.Thief].health} Health, {characterStats[CharacterClass.Thief].attack} Attack, {characterStats[CharacterClass.Thief].defense} Defense
        </button>
        <button onClick={() => onClassSelect(CharacterClass.Mage)}>
          Mage - {characterStats[CharacterClass.Mage].health} Health, {characterStats[CharacterClass.Mage].attack} Attack, {characterStats[CharacterClass.Mage].defense} Defense
        </button>
      </div>
    </div>
  );
};

export default Epilogue;
