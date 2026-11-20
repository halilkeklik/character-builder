import React, { useState, useEffect } from 'react';
import type { 
  CharacterSheetState, 
  WizardStep, 
  AbilityKey, 
  FeatChoiceData, 
  ClassChoices, 
  BackgroundChoices, 
  InventoryState,
  SavedCharacterRecord
} from './types/character';
import { getBackgroundAllowedAbilities } from './utils/dataLoader';
import { 
  loadAllCharacters, 
  getActiveCharacterId, 
  setActiveCharacterId, 
  saveCharacter, 
  deleteCharacter, 
  duplicateCharacter, 
  createNewCharacter, 
  exportAllCharactersJSON, 
  importCharactersJSON,
  DEFAULT_BLANK_STATE 
} from './utils/characterStorage';
import { getInitialInventory } from './utils/equipmentHelper';
import { Navbar } from './components/Navbar';
import { CharacterRosterModal } from './components/CharacterRosterModal';
import { StepConcept } from './components/StepConcept';
import { StepClass } from './components/StepClass';
import { StepSpecies } from './components/StepSpecies';
import { StepBackground } from './components/StepBackground';
import { StepAbilities } from './components/StepAbilities';
import { StepEquipment } from './components/StepEquipment';
import { StepSpells } from './components/StepSpells';
import { CharacterSheet } from './components/CharacterSheet';

export const App: React.FC = () => {
  const [currentStep, setStep] = useState<WizardStep>('concept');
  const [records, setRecords] = useState<SavedCharacterRecord[]>(() => loadAllCharacters());
  const [activeId, setActiveId] = useState<string>(() => getActiveCharacterId());
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  const [state, setState] = useState<CharacterSheetState>(() => {
    const initialRecords = loadAllCharacters();
    const initialActiveId = getActiveCharacterId();
    const activeChar = initialRecords.find(c => c.id === initialActiveId) || initialRecords[0];
    if (activeChar) {
      return {
        ...activeChar.data,
        characterId: activeChar.id,
      };
    }
    return {
      ...DEFAULT_BLANK_STATE,
      characterId: initialActiveId,
      inventory: getInitialInventory(DEFAULT_BLANK_STATE.selectedClass, DEFAULT_BLANK_STATE.selectedBackground, 'A', 'A'),
    };
  });

  // Auto-save whenever state changes
  useEffect(() => {
    if (state && activeId) {
      const charId = state.characterId || activeId;
      const { records: updatedRecords } = saveCharacter({ ...state, characterId: charId }, charId);
      setRecords(updatedRecords);
    }
  }, [state, activeId]);

  // Concept updates
  const updateConcept = (patch: Partial<CharacterSheetState['concept']>) => {
    setState((prev) => ({
      ...prev,
      concept: { ...prev.concept, ...patch },
    }));
  };

  // Class selection
  const handleSelectClass = (cls: any) => {
    setState((prev) => ({
      ...prev,
      selectedClass: cls,
      selectedSubclass: undefined,
      classChoices: {},
      selectedSkills: [],
      selectedWeaponMasteries: [],
    }));
  };

  // Class choices updates
  const handleUpdateClassChoices = (choicesPatch: Partial<ClassChoices>) => {
    setState((prev) => ({
      ...prev,
      classChoices: { ...prev.classChoices, ...choicesPatch },
    }));
  };

  // Subclass selection
  const handleSelectSubclass = (sc: any) => {
    setState((prev) => ({
      ...prev,
      selectedSubclass: sc,
    }));
  };

  // Species selection
  const handleSelectSpecies = (sp: any) => {
    setState((prev) => ({
      ...prev,
      selectedSpecies: sp,
      speciesChoices: {},
    }));
  };

  // Species choices updates
  const handleUpdateSpeciesChoices = (choicesPatch: Partial<NonNullable<CharacterSheetState['speciesChoices']>>) => {
    setState((prev) => ({
      ...prev,
      speciesChoices: { ...prev.speciesChoices, ...choicesPatch },
    }));
  };

  // Background selection (also aligns default background bonuses, skills, and tools)
  const handleSelectBackground = (bg: any) => {
    const allowed = getBackgroundAllowedAbilities(bg) as AbilityKey[];
    const defaultSkills: string[] = bg.skillProficiencies?.[0] ? Object.keys(bg.skillProficiencies[0]) : [];
    let defaultTool = '';
    if (bg.toolProficiencies?.[0]) {
      const toolKey = Object.keys(bg.toolProficiencies[0])[0];
      if (toolKey === 'anyGamingSet') defaultTool = 'Dice Set';
      else if (toolKey === 'anyArtisansTool') defaultTool = "Alchemist's Supplies";
      else if (toolKey === 'anyMusicalInstrument') defaultTool = 'Lute';
      else defaultTool = toolKey;
    }

    setState((prev) => ({
      ...prev,
      selectedBackground: bg,
      backgroundChoices: {
        skills: defaultSkills,
        tool: defaultTool,
      },
      backgroundFeatChoices: {},
      backgroundBonus: {
        ...prev.backgroundBonus,
        first: allowed[0] || 'str',
        second: allowed[1] || 'con',
        third: allowed[2] || 'dex',
      },
    }));
  };

  // Background choices updates (skills replacements, tools)
  const handleUpdateBackgroundChoices = (choicesPatch: Partial<BackgroundChoices>) => {
    setState((prev) => ({
      ...prev,
      backgroundChoices: { ...prev.backgroundChoices, ...choicesPatch },
    }));
  };

  // Background feat choices updates
  const handleUpdateBgFeatChoices = (choices: FeatChoiceData) => {
    setState((prev) => ({
      ...prev,
      backgroundFeatChoices: choices,
    }));
  };

  // Toggle skills
  const handleToggleSkill = (skill: string) => {
    setState((prev) => {
      const exists = prev.selectedSkills.includes(skill);
      return {
        ...prev,
        selectedSkills: exists
          ? prev.selectedSkills.filter((s) => s !== skill)
          : [...prev.selectedSkills, skill],
      };
    });
  };

  // Ability updates
  const updateAbilities = (scores: CharacterSheetState['abilityScores']) => {
    setState((prev) => ({
      ...prev,
      abilityScores: scores,
    }));
  };

  // Background bonus updates
  const updateBonus = (bonusPatch: Partial<CharacterSheetState['backgroundBonus']>) => {
    setState((prev) => ({
      ...prev,
      backgroundBonus: { ...prev.backgroundBonus, ...bonusPatch },
    }));
  };

  // Weapon mastery toggle
  const handleToggleMastery = (weaponName: string) => {
    setState((prev) => {
      const exists = prev.selectedWeaponMasteries.includes(weaponName);
      return {
        ...prev,
        selectedWeaponMasteries: exists
          ? prev.selectedWeaponMasteries.filter((w) => w !== weaponName)
          : [...prev.selectedWeaponMasteries, weaponName],
      };
    });
  };

  // Spell toggle
  const handleToggleSpell = (spellName: string) => {
    setState((prev) => {
      const exists = prev.selectedSpells.includes(spellName);
      return {
        ...prev,
        selectedSpells: exists
          ? prev.selectedSpells.filter((s) => s !== spellName)
          : [...prev.selectedSpells, spellName],
      };
    });
  };

  // Inventory updates
  const handleUpdateInventory = (invPatch: Partial<InventoryState>) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory ? { ...prev.inventory, ...invPatch } : (invPatch as InventoryState),
    }));
  };

  // --- Multi-Character Actions ---

  const handleSelectCharacter = (id: string) => {
    const target = records.find(c => c.id === id);
    if (target) {
      setActiveCharacterId(id);
      setActiveId(id);
      setState({
        ...target.data,
        characterId: id,
      });
      setIsRosterOpen(false);
    }
  };

  const handleCreateNew = () => {
    const { newRecord, records: updatedRecords } = createNewCharacter();
    setRecords(updatedRecords);
    setActiveId(newRecord.id);
    setState({
      ...newRecord.data,
      characterId: newRecord.id,
    });
    setStep('concept');
    setIsRosterOpen(false);
  };

  const handleDuplicate = (id: string) => {
    const { newRecord, records: updatedRecords } = duplicateCharacter(id);
    setRecords(updatedRecords);
    setActiveId(newRecord.id);
    setState({
      ...newRecord.data,
      characterId: newRecord.id,
    });
  };

  const handleDelete = (id: string) => {
    const { activeId: nextActiveId, records: updatedRecords } = deleteCharacter(id);
    setRecords(updatedRecords);
    if (id === activeId) {
      setActiveId(nextActiveId);
      const nextChar = updatedRecords.find(c => c.id === nextActiveId) || updatedRecords[0];
      if (nextChar) {
        setState({
          ...nextChar.data,
          characterId: nextChar.id,
        });
      }
    }
  };

  const handleExportSingle = (record: SavedCharacterRecord) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${record.name.replace(/\s+/g, '_') || 'character'}_2024.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCurrent = () => {
    const charName = state.concept?.name?.trim() || 'character';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${charName.replace(/\s+/g, '_')}_2024.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportAll = () => {
    const jsonStr = exportAllCharactersJSON();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dnd_2024_roster_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const { activeId: importedActiveId, records: nextRecords } = importCharactersJSON(text);
          setRecords(nextRecords);
          setActiveId(importedActiveId);
          const importedChar = nextRecords.find(c => c.id === importedActiveId);
          if (importedChar) {
            setState({
              ...importedChar.data,
              characterId: importedChar.id,
            });
            setStep('sheet');
          }
          setIsRosterOpen(false);
        } catch (err: any) {
          alert(err?.message || 'Failed to import character JSON.');
        }
      };
    }
  };

  // Reset Character choices (retaining current character ID)
  const handleReset = () => {
    if (window.confirm('Reset this character’s choices back to default?')) {
      const resetData: CharacterSheetState = {
        ...DEFAULT_BLANK_STATE,
        characterId: activeId,
        concept: {
          ...DEFAULT_BLANK_STATE.concept,
          name: state.concept.name || 'New Hero',
        },
        inventory: getInitialInventory(DEFAULT_BLANK_STATE.selectedClass, DEFAULT_BLANK_STATE.selectedBackground, 'A', 'A'),
      };
      setState(resetData);
      setStep('concept');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentStep={currentStep}
        setStep={setStep}
        activeCharacterName={state.concept?.name}
        activeCharacterClass={state.selectedClass?.name}
        activeCharacterLevel={state.concept?.level || 1}
        totalCharactersCount={records.length}
        onOpenRoster={() => setIsRosterOpen(true)}
        onNewCharacter={handleCreateNew}
        onReset={handleReset}
        onExport={handleExportCurrent}
        onImport={handleImportJSON}
      />

      <CharacterRosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        records={records}
        activeId={activeId}
        onSelectCharacter={handleSelectCharacter}
        onCreateNew={handleCreateNew}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onExportSingle={handleExportSingle}
        onExportAll={handleExportAll}
        onImportJSON={handleImportJSON}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        {currentStep === 'concept' && (
          <StepConcept
            state={state}
            updateConcept={updateConcept}
            onNext={() => setStep('class')}
          />
        )}

        {currentStep === 'class' && (
          <StepClass
            state={state}
            onSelectClass={handleSelectClass}
            onSelectSubclass={handleSelectSubclass}
            onToggleSkill={handleToggleSkill}
            onUpdateClassChoices={handleUpdateClassChoices}
            onNext={() => setStep('species')}
            onBack={() => setStep('concept')}
          />
        )}

        {currentStep === 'species' && (
          <StepSpecies
            state={state}
            onSelectSpecies={handleSelectSpecies}
            onUpdateSpeciesChoices={handleUpdateSpeciesChoices}
            onNext={() => setStep('background')}
            onBack={() => setStep('class')}
          />
        )}

        {currentStep === 'background' && (
          <StepBackground
            state={state}
            onSelectBackground={handleSelectBackground}
            onUpdateBackgroundChoices={handleUpdateBackgroundChoices}
            onUpdateBgFeatChoices={handleUpdateBgFeatChoices}
            onNext={() => setStep('abilities')}
            onBack={() => setStep('species')}
          />
        )}

        {currentStep === 'abilities' && (
          <StepAbilities
            state={state}
            updateAbilities={updateAbilities}
            updateBonus={updateBonus}
            onNext={() => setStep('equipment')}
            onBack={() => setStep('background')}
          />
        )}

        {currentStep === 'equipment' && (
          <StepEquipment
            state={state}
            onSelectOption={(opt) => setState((p) => ({ ...p, equipmentOption: opt }))}
            onUpdateInventory={handleUpdateInventory}
            onToggleMastery={handleToggleMastery}
            onNext={() => setStep('spells')}
            onBack={() => setStep('abilities')}
          />
        )}

        {currentStep === 'spells' && (
          <StepSpells
            state={state}
            onToggleSpell={handleToggleSpell}
            onNext={() => setStep('sheet')}
            onBack={() => setStep('equipment')}
          />
        )}

        {currentStep === 'sheet' && (
          <CharacterSheet
            state={state}
            onEditStep={(st) => setStep(st)}
            onExport={handleExportCurrent}
          />
        )}
      </main>
    </div>
  );
};

export default App;
