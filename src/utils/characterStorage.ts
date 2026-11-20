import type { CharacterSheetState, SavedCharacterRecord } from '../types/character';
import { ALL_CLASSES, ALL_SPECIES, ALL_BACKGROUNDS } from './dataLoader';
import { getInitialInventory } from './equipmentHelper';

const STORAGE_KEY = 'dnd_2024_saved_characters_v2';
const ACTIVE_ID_KEY = 'dnd_2024_active_char_id_v2';

export const DEFAULT_BLANK_STATE: CharacterSheetState = {
  concept: {
    name: 'New Hero',
    alignment: 'Neutral Good',
    level: 1,
    gender: 'They/Them',
    notes: 'An aspiring adventurer setting out to make their mark on the realm.',
    avatarUrl: '',
  },
  selectedClass: ALL_CLASSES[0] || undefined, // Barbarian
  selectedSubclass: undefined,
  selectedSpecies: ALL_SPECIES.find((s: any) => s.name === 'Human') || ALL_SPECIES[0],
  selectedBackground: ALL_BACKGROUNDS.find((b: any) => b.name === 'Soldier') || ALL_BACKGROUNDS[0],
  abilityScores: {
    str: 15,
    dex: 14,
    con: 13,
    int: 12,
    wis: 10,
    cha: 8,
  },
  backgroundBonus: {
    mode: '+2/+1',
    first: 'str',
    second: 'con',
  },
  selectedSkills: ['athletics', 'survival'],
  speciesChoices: {
    humanSkill: 'perception',
    humanOriginFeat: 'Skilled',
  },
  selectedWeaponMasteries: ['Greataxe', 'Handaxe'],
  selectedSpells: [],
  equipmentOption: 'A',
};

function extractRecordMeta(id: string, data: CharacterSheetState): SavedCharacterRecord {
  const className = data.selectedClass?.name || 'Adventurer';
  const subclassName = data.selectedSubclass?.name || undefined;
  const speciesName = data.selectedSpecies?.name || 'Human';
  const backgroundName = data.selectedBackground?.name || 'Custom';
  const name = data.concept?.name?.trim() || 'Unnamed Character';
  const level = data.concept?.level || 1;
  const avatarUrl = data.concept?.avatarUrl || '';

  return {
    id,
    name,
    className,
    subclassName,
    speciesName,
    level,
    backgroundName,
    avatarUrl,
    updatedAt: Date.now(),
    data: {
      ...data,
      characterId: id,
    },
  };
}

export function loadAllCharacters(): SavedCharacterRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved characters from localStorage', e);
  }

  // Seed with default initial character if storage is empty
  const defaultId = 'char-default-hero';
  const initialRecord = extractRecordMeta(defaultId, {
    ...DEFAULT_BLANK_STATE,
    concept: {
      ...DEFAULT_BLANK_STATE.concept,
      name: 'Valerius the Bold',
      notes: 'A veteran guardian seeking ancient relics across the forgotten realms.',
      avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
    },
  });

  const list = [initialRecord];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    localStorage.setItem(ACTIVE_ID_KEY, defaultId);
  } catch (e) {
    // ignore
  }

  return list;
}

export function getActiveCharacterId(): string {
  try {
    const active = localStorage.getItem(ACTIVE_ID_KEY);
    if (active) return active;
  } catch (e) {
    // ignore
  }
  const chars = loadAllCharacters();
  return chars[0]?.id || 'char-default-hero';
}

export function setActiveCharacterId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch (e) {
    // ignore
  }
}

export function saveCharacter(data: CharacterSheetState, existingId?: string): { id: string; records: SavedCharacterRecord[] } {
  const currentList = loadAllCharacters();
  const id = existingId || data.characterId || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const record = extractRecordMeta(id, data);

  const idx = currentList.findIndex(c => c.id === id);
  let nextList: SavedCharacterRecord[];
  if (idx >= 0) {
    nextList = [...currentList];
    nextList[idx] = record;
  } else {
    nextList = [record, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch (e) {
    console.error('Failed to save character to localStorage', e);
  }

  return { id, records: nextList };
}

export function deleteCharacter(id: string): { activeId: string; records: SavedCharacterRecord[] } {
  const currentList = loadAllCharacters();
  const nextList = currentList.filter(c => c.id !== id);

  if (nextList.length === 0) {
    // If deleted the only character, create a fresh one
    const fresh = createNewCharacter();
    return { activeId: fresh.newRecord.id, records: fresh.records };
  }

  let activeId = getActiveCharacterId();
  if (activeId === id) {
    activeId = nextList[0].id;
    setActiveCharacterId(activeId);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
  } catch (e) {
    // ignore
  }

  return { activeId, records: nextList };
}

export function duplicateCharacter(id: string): { newRecord: SavedCharacterRecord; records: SavedCharacterRecord[] } {
  const currentList = loadAllCharacters();
  const source = currentList.find(c => c.id === id);
  const newId = `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const baseData = source ? source.data : DEFAULT_BLANK_STATE;
  const copyData: CharacterSheetState = {
    ...JSON.parse(JSON.stringify(baseData)),
    characterId: newId,
    concept: {
      ...baseData.concept,
      name: `${baseData.concept.name || 'Hero'} (Copy)`,
    },
  };

  const newRecord = extractRecordMeta(newId, copyData);
  const nextList = [newRecord, ...currentList];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    setActiveCharacterId(newId);
  } catch (e) {
    // ignore
  }

  return { newRecord, records: nextList };
}

export function createNewCharacter(customName?: string): { newRecord: SavedCharacterRecord; records: SavedCharacterRecord[] } {
  const currentList = loadAllCharacters();
  const newId = `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const newClass = ALL_CLASSES[0];
  const newBg = ALL_BACKGROUNDS[0];

  const freshState: CharacterSheetState = {
    ...JSON.parse(JSON.stringify(DEFAULT_BLANK_STATE)),
    characterId: newId,
    concept: {
      ...DEFAULT_BLANK_STATE.concept,
      name: customName || `Hero ${currentList.length + 1}`,
      notes: '',
      avatarUrl: '',
    },
    selectedClass: newClass,
    selectedBackground: newBg,
    inventory: getInitialInventory(newClass, newBg, 'A', 'A'),
  };

  const newRecord = extractRecordMeta(newId, freshState);
  const nextList = [newRecord, ...currentList];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    setActiveCharacterId(newId);
  } catch (e) {
    // ignore
  }

  return { newRecord, records: nextList };
}

export function exportAllCharactersJSON(): string {
  const list = loadAllCharacters();
  return JSON.stringify(list, null, 2);
}

export function importCharactersJSON(jsonStr: string): { activeId: string; records: SavedCharacterRecord[] } {
  const currentList = loadAllCharacters();
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON content.');
  }

  let importedRecords: SavedCharacterRecord[] = [];

  if (Array.isArray(parsed)) {
    // Multi-character list format
    importedRecords = parsed.map(item => {
      const id = item.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const data = item.data || item;
      return extractRecordMeta(id, data);
    });
  } else if (parsed && typeof parsed === 'object') {
    // Single character format
    const id = parsed.characterId || parsed.id || `char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const data = parsed.data || parsed;
    importedRecords = [extractRecordMeta(id, data)];
  }

  if (importedRecords.length === 0) {
    throw new Error('No valid characters found in JSON.');
  }

  // Merge with existing list (replace if matching ID, prepend otherwise)
  const mergedMap = new Map<string, SavedCharacterRecord>();
  importedRecords.forEach(r => mergedMap.set(r.id, r));
  currentList.forEach(r => {
    if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
  });

  const nextList = Array.from(mergedMap.values());
  const activeId = importedRecords[0].id;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    setActiveCharacterId(activeId);
  } catch (e) {
    // ignore
  }

  return { activeId, records: nextList };
}
