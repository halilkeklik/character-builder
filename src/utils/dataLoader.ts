import speciesData from '../data/species.json';
import backgroundsData from '../data/backgrounds.json';
import classesData from '../data/classes.json';
import featsData from '../data/feats.json';
import spellsData from '../data/spells.json';
import itemsData from '../data/items.json';

export const ALL_SPECIES = speciesData as any[];
export const ALL_BACKGROUNDS = backgroundsData as any[];
export const ALL_CLASSES = (classesData as any).classes as any[];
export const ALL_SUBCLASSES = (classesData as any).subclasses as any[];
export const ALL_FEATS = featsData as any[];
export const ALL_SPELLS = spellsData as any[];
export const ALL_ITEMS = (itemsData as any).items as any[];
export const ALL_MASTERIES = (itemsData as any).masteries as any[];
export const ORIGIN_FEATS = ALL_FEATS.filter(f => f.category === 'O');

export interface SpeciesOption {
  id: string;
  name: string;
  description: string;
  benefit?: string;
}

export const SPECIES_CUSTOMIZATIONS: Record<string, {
  title: string;
  description: string;
  type: 'lineage' | 'human' | 'revelation';
  options?: SpeciesOption[];
}> = {
  'Elf': {
    title: 'Elven Lineage',
    description: 'Select your supernatural Elven ancestry.',
    type: 'lineage',
    options: [
      { id: 'Drow', name: 'Drow', description: 'Darkvision 120 ft. Dancing Lights cantrip. Faerie Fire (Level 3), Darkness (Level 5).' },
      { id: 'High Elf', name: 'High Elf', description: 'Prestidigitation cantrip (or any Wizard cantrip). Detect Magic (Level 3), Misty Step (Level 5).' },
      { id: 'Wood Elf', name: 'Wood Elf', description: 'Speed increases to 35 ft. Druidcraft cantrip. Longstrider (Level 3), Pass Without Trace (Level 5).' },
    ]
  },
  'Gnome': {
    title: 'Gnomish Lineage',
    description: 'Select your Gnomish ancestry.',
    type: 'lineage',
    options: [
      { id: 'Forest Gnome', name: 'Forest Gnome', description: 'Minor Illusion cantrip, and you can cast Speak with Animals.' },
      { id: 'Rock Gnome', name: 'Rock Gnome', description: 'Mending and Prestidigitation cantrips, and the Tinker magical device ability.' },
    ]
  },
  'Goliath': {
    title: 'Giant Ancestry',
    description: 'Choose the supernatural giant boon of your heritage (PB uses per Long Rest).',
    type: 'lineage',
    options: [
      { id: "Cloud Giant", name: "Cloud's Jaunt (Cloud Giant)", description: "Bonus action: magically teleport up to 30 feet to an unoccupied space you can see." },
      { id: "Fire Giant", name: "Fire's Burn (Fire Giant)", description: "Deal an extra 1d10 Fire damage when you hit a target with an attack." },
      { id: "Frost Giant", name: "Frost's Chill (Frost Giant)", description: "Deal an extra 1d6 Cold damage and reduce target speed by 10 feet until the start of your next turn." },
      { id: "Hill Giant", name: "Hill's Tumble (Hill Giant)", description: "Knock a Large or smaller creature Prone on hit with an attack." },
      { id: "Stone Giant", name: "Stone's Endurance (Stone Giant)", description: "Reaction when taking damage: reduce damage by 1d12 + Con modifier." },
      { id: "Storm Giant", name: "Storm's Thunder (Storm Giant)", description: "Reaction when taking damage: deal 1d8 Thunder damage to the attacker within 60 ft." },
    ]
  },
  'Tiefling': {
    title: 'Fiendish Legacy',
    description: 'Select the planar source of your fiendish supernatural powers.',
    type: 'lineage',
    options: [
      { id: 'Abyssal', name: 'Abyssal (Chaotic Evil Fiends)', description: 'Poison Resistance. Poison Spray cantrip. Ray of Sickness (Level 3), Hold Person (Level 5).' },
      { id: 'Chthonic', name: 'Chthonic (Neutral Evil Fiends)', description: 'Necrotic Resistance. Chill Touch cantrip. False Life (Level 3), Ray of Enfeeblement (Level 5).' },
      { id: 'Infernal', name: 'Infernal (Lawful Evil Devils)', description: 'Fire Resistance. Fire Bolt cantrip. Hellish Rebuke (Level 3), Darkness (Level 5).' },
    ]
  },
  'Dragonborn': {
    title: 'Draconic Ancestry',
    description: 'Choose your dragon progenitor to determine breath weapon shape and damage resistance.',
    type: 'lineage',
    options: [
      { id: 'Black Dragon', name: 'Black Dragon (Acid)', description: 'Acid Resistance. 5 by 30 ft Line (Dex save).' },
      { id: 'Blue Dragon', name: 'Blue Dragon (Lightning)', description: 'Lightning Resistance. 5 by 30 ft Line (Dex save).' },
      { id: 'Brass Dragon', name: 'Brass Dragon (Fire)', description: 'Fire Resistance. 5 by 30 ft Line (Dex save).' },
      { id: 'Bronze Dragon', name: 'Bronze Dragon (Lightning)', description: 'Lightning Resistance. 5 by 30 ft Line (Dex save).' },
      { id: 'Copper Dragon', name: 'Copper Dragon (Acid)', description: 'Acid Resistance. 5 by 30 ft Line (Dex save).' },
      { id: 'Gold Dragon', name: 'Gold Dragon (Fire)', description: 'Fire Resistance. 15 ft Cone (Dex save).' },
      { id: 'Green Dragon', name: 'Green Dragon (Poison)', description: 'Poison Resistance. 15 ft Cone (Con save).' },
      { id: 'Red Dragon', name: 'Red Dragon (Fire)', description: 'Fire Resistance. 15 ft Cone (Dex save).' },
      { id: 'Silver Dragon', name: 'Silver Dragon (Cold)', description: 'Cold Resistance. 15 ft Cone (Con save).' },
      { id: 'White Dragon', name: 'White Dragon (Cold)', description: 'Cold Resistance. 15 ft Cone (Con save).' },
    ]
  },
  'Human': {
    title: 'Human Versatility & Skill',
    description: 'Humans in 2024 gain an extra Skill Proficiency (Skillful) and an extra Origin Feat (Versatile).',
    type: 'human',
  },
  'Aasimar': {
    title: 'Celestial Revelation',
    description: 'Supernatural celestial transformation (available at Level 3+).',
    type: 'revelation',
    options: [
      { id: 'Heavenly Wings', name: 'Heavenly Wings', description: 'Sprout luminous wings: Fly speed equal to your Speed for 1 minute.' },
      { id: 'Inner Radiance', name: 'Inner Radiance', description: 'Searing light: shed light and deal Radiant damage equal to your PB to foes within 10 ft.' },
      { id: 'Necrotic Shroud', name: 'Necrotic Shroud', description: 'Terrifying gaze: foes within 10 ft must succeed on Cha save or be Frightened, deal extra Necrotic damage.' },
    ]
  }
};

export function getBackgroundAllowedAbilities(bg: any): string[] {
  if (!bg || !bg.ability) return ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const firstChoice = bg.ability[0]?.choose?.weighted?.from;
  if (Array.isArray(firstChoice)) {
    return firstChoice;
  }
  return ['str', 'dex', 'con', 'int', 'wis', 'cha'];
}

export function getFeatByName(name: string): any | undefined {
  if (!name) return undefined;
  const cleanName = name.split('|')[0].split(';')[0].trim().toLowerCase();
  return ALL_FEATS.find(f => f.name.toLowerCase() === cleanName);
}

export function getWeaponMasteriesForClass(className: string): number {
  switch (className?.toLowerCase()) {
    case 'fighter': return 3;
    case 'barbarian': return 2;
    case 'paladin': return 2;
    case 'ranger': return 2;
    case 'rogue': return 2;
    default: return 0;
  }
}
