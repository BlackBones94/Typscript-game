export interface Stats {
  health: number;
  attack: number;
  defense: number;
}

export interface Potion {
  name: string;
  effect: (stats: Stats) => Stats;
  description: string;
}

export interface Key {
  name: string;
  description: string;
}

export type Item = Potion | Key;

export enum CharacterClass {
  Warrior = 'Warrior',
  Thief = 'Thief',
  Mage = 'Mage',
}

export const characterStats: Record<CharacterClass, Stats> = {
  [CharacterClass.Warrior]: { health: 150, attack: 15, defense: 10 },
  [CharacterClass.Thief]: { health: 100, attack: 10, defense: 5 },
  [CharacterClass.Mage]: { health: 80, attack: 20, defense: 3 },
};
