export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface CharacterConcept {
  name: string;
  alignment: string;
  level: number;
  gender: string;
  notes: string;
  avatarUrl?: string;
}

export interface FeatChoiceData {
  skills?: string[];
  spellClass?: 'Cleric' | 'Druid' | 'Wizard';
  ability?: 'int' | 'wis' | 'cha';
  cantrips?: string[];
  spell1?: string;
  tools?: string[];
}

export interface ClassChoices {
  fightingStyle?: string;
  divineOrder?: 'Protector' | 'Thaumaturge';
  primalOrder?: 'Magician' | 'Warden';
  expertise?: string[];
  eldritchInvocation?: string;
  instruments?: string[];
  artisanTool?: string;
  monkTool?: string;
}

export interface BackgroundChoices {
  skills?: string[];
  tool?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  category: 'armor' | 'shield' | 'weapon' | 'ammunition' | 'gear' | 'tool' | 'pack';
  equipped?: boolean;
  cost?: string;
}

export interface InventoryState {
  classPackage: string; // 'A' | 'B' | 'C'
  backgroundPackage: string; // 'A' | 'B'
  items: EquipmentItem[];
  currency: {
    gp: number;
    sp: number;
    cp: number;
  };
}

export interface CharacterSheetState {
  concept: CharacterConcept;
  selectedClass?: any;
  selectedSubclass?: any;
  classChoices?: ClassChoices;
  selectedSpecies?: any;
  selectedBackground?: any;
  backgroundChoices?: BackgroundChoices;
  abilityScores: AbilityScores;
  backgroundBonus: {
    first?: AbilityKey;
    second?: AbilityKey;
    third?: AbilityKey;
    mode: '+2/+1' | '+1/+1/+1';
  };
  selectedSkills: string[];
  speciesChoices?: {
    lineage?: string;
    humanSkill?: string;
    humanOriginFeat?: string;
    humanFeatChoices?: FeatChoiceData;
    aasimarRevelation?: string;
  };
  backgroundFeatChoices?: FeatChoiceData;
  selectedWeaponMasteries: string[];
  selectedSpells: string[];
  equipmentOption: 'A' | 'B';
  inventory?: InventoryState;
}

export type WizardStep = 
  | 'concept' 
  | 'class' 
  | 'species' 
  | 'background' 
  | 'abilities' 
  | 'equipment' 
  | 'spells' 
  | 'sheet';
