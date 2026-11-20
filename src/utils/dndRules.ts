import type { AbilityKey, AbilityScores } from '../types/character';

export const ABILITY_LABELS: Record<AbilityKey, { name: string; short: string }> = {
  str: { name: 'Strength', short: 'STR' },
  dex: { name: 'Dexterity', short: 'DEX' },
  con: { name: 'Constitution', short: 'CON' },
  int: { name: 'Intelligence', short: 'INT' },
  wis: { name: 'Wisdom', short: 'WIS' },
  cha: { name: 'Charisma', short: 'CHA' },
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number = 1): number {
  return Math.floor((level - 1) / 4) + 2;
}

export function calculateTotalScores(
  base: AbilityScores,
  bonuses: {
    first?: AbilityKey;
    second?: AbilityKey;
    third?: AbilityKey;
    mode: '+2/+1' | '+1/+1/+1';
  }
): AbilityScores {
  const total = { ...base };

  if (bonuses.mode === '+2/+1') {
    if (bonuses.first) total[bonuses.first] += 2;
    if (bonuses.second) total[bonuses.second] += 1;
  } else {
    if (bonuses.first) total[bonuses.first] += 1;
    if (bonuses.second) total[bonuses.second] += 1;
    if (bonuses.third) total[bonuses.third] += 1;
  }

  return total;
}

export function calculateHP(level: number, hitDieFaces: number, conMod: number, isTough: boolean = false): number {
  const base = hitDieFaces + conMod;
  const perLevel = Math.floor(hitDieFaces / 2) + 1 + conMod;
  const toughBonus = isTough ? level * 2 : 0;
  return Math.max(1, base + (level - 1) * perLevel + toughBonus);
}

export function calculateAC(
  dexMod: number, 
  conMod: number, 
  wisMod: number, 
  className?: string
): number {
  if (className === 'Barbarian') {
    return 10 + dexMod + conMod;
  }
  if (className === 'Monk') {
    return 10 + dexMod + wisMod;
  }
  return 10 + dexMod;
}

export const SKILL_ABILITY_MAP: Record<string, AbilityKey> = {
  'athletics': 'str',
  'acrobatics': 'dex',
  'sleight of hand': 'dex',
  'stealth': 'dex',
  'arcana': 'int',
  'history': 'int',
  'investigation': 'int',
  'nature': 'int',
  'religion': 'int',
  'animal handling': 'wis',
  'insight': 'wis',
  'medicine': 'wis',
  'perception': 'wis',
  'survival': 'wis',
  'deception': 'cha',
  'intimidation': 'cha',
  'performance': 'cha',
  'persuasion': 'cha',
};
