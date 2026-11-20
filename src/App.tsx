import React, { useState, useEffect } from 'react';
import type { CharacterSheetState, WizardStep, AbilityKey, FeatChoiceData, ClassChoices, BackgroundChoices } from './types/character';
import { ALL_CLASSES, ALL_SPECIES, ALL_BACKGROUNDS, getBackgroundAllowedAbilities } from './utils/dataLoader';
import { Navbar } from './components/Navbar';
import { StepConcept } from './components/StepConcept';
import { StepClass } from './components/StepClass';
import { StepSpecies } from './components/StepSpecies';
import { StepBackground } from './components/StepBackground';
import { StepAbilities } from './components/StepAbilities';
import { StepEquipment } from './components/StepEquipment';
import { StepSpells } from './components/StepSpells';
import { CharacterSheet } from './components/CharacterSheet';

const STORAGE_KEY = 'dnd_2024_character_builder_data';

const DEFAULT_STATE: CharacterSheetState = {
  concept: {
    name: 'Valerius the Bold',
    alignment: 'Neutral Good',
    level: 1,
    gender: 'He/Him',
    notes: 'A veteran guardian seeking ancient relics across the forgotten realms.',
    avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
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

export const App: React.FC = () => {
  const [currentStep, setStep] = useState<WizardStep>('concept');
  const [state, setState] = useState<CharacterSheetState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_STATE;
  });

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }, [state]);

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

  // Reset Character
  const handleReset = () => {
    if (window.confirm('Reset all character choices back to default?')) {
      setState(DEFAULT_STATE);
      setStep('concept');
    }
  };

  // Export JSON
  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${state.concept.name.replace(/\s+/g, '_') || 'character'}_2024.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.abilityScores && parsed.concept) {
            setState(parsed);
            setStep('sheet');
          } else {
            alert('Invalid character JSON file format.');
          }
        } catch (err) {
          alert('Failed to read character JSON.');
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentStep={currentStep}
        setStep={setStep}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
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
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  );
};

export default App;
