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

export interface CharacterSheetState {
  concept: CharacterConcept;
  selectedClass?: any;
  selectedSubclass?: any;
  selectedSpecies?: any;
  selectedBackground?: any;
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
    aasimarRevelation?: string;
  };
  selectedWeaponMasteries: string[];
  selectedSpells: string[];
  equipmentOption: 'A' | 'B';
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
