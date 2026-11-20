import React, { useState } from 'react';
import type { CharacterSheetState, ClassChoices } from '../types/character';
import { 
  ALL_CLASSES, 
  ALL_SUBCLASSES, 
  getWeaponMasteriesForClass,
  FIGHTING_STYLES,
  WARLOCK_INVOCATIONS_LVL1 
} from '../utils/dataLoader';
import { MUSICAL_INSTRUMENTS, ARTISAN_TOOLS } from './FeatCustomizer';
import { SKILL_ABILITY_MAP } from '../utils/dndRules';
import { 
  Shield, 
  Sparkles, 
  Sword, 
  Heart, 
  Zap, 
  Check, 
  ChevronRight, 
  Award, 
  Wand2, 
  Flame 
} from 'lucide-react';

interface StepClassProps {
  state: CharacterSheetState;
  onSelectClass: (cls: any) => void;
  onSelectSubclass: (sc: any) => void;
  onToggleSkill: (skill: string) => void;
  onUpdateClassChoices: (choices: Partial<ClassChoices>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepClass: React.FC<StepClassProps> = ({
  state,
  onSelectClass,
  onSelectSubclass,
  onToggleSkill,
  onUpdateClassChoices,
  onNext,
  onBack,
}) => {
  const [subclassSourceFilter, setSubclassSourceFilter] = useState<string>('ALL');
  const selectedClass = state.selectedClass;
  const level = state.concept.level;
  const classChoices = state.classChoices || {};
  const className = selectedClass?.name || '';
  
  // Available modern subclasses for the selected class
  const availableSubclasses = selectedClass
    ? ALL_SUBCLASSES.filter(sc => sc.className.toLowerCase() === className.toLowerCase())
    : [];

  // Filter subclasses by selected book source
  const filteredSubclasses = availableSubclasses.filter(sc => {
    if (subclassSourceFilter === 'ALL') return true;
    if (subclassSourceFilter === 'XPHB') return sc.source === 'XPHB';
    if (subclassSourceFilter === 'TCE') return sc.source === 'TCE';
    if (subclassSourceFilter === 'XGE') return sc.source === 'XGE';
    if (subclassSourceFilter === 'OTHER') return !['XPHB', 'TCE', 'XGE'].includes(sc.source);
    return true;
  });

  // Dynamic Skill choices calculation (handles both `{ choose: ... }` and Bard's `{ any: 3 }`)
  const rawSkillsConfig = selectedClass?.startingProficiencies?.skills?.[0];
  let allowedSkills: string[] = [];
  let maxSkillsAllowed: number = 2;

  if (rawSkillsConfig?.any) {
    allowedSkills = Object.keys(SKILL_ABILITY_MAP);
    maxSkillsAllowed = rawSkillsConfig.any;
  } else if (rawSkillsConfig?.choose) {
    allowedSkills = rawSkillsConfig.choose.from || [];
    maxSkillsAllowed = rawSkillsConfig.choose.count || 2;
  }

  // Selected skills that belong to the class options
  const selectedClassSkills = state.selectedSkills.filter(s => allowedSkills.includes(s));

  // Skills already proficient from background, species, or feats
  const bgSkills = (
    state.backgroundChoices?.skills && state.backgroundChoices.skills.length > 0
      ? state.backgroundChoices.skills
      : (state.selectedBackground?.skillProficiencies?.[0]
          ? Object.keys(state.selectedBackground.skillProficiencies[0])
          : [])
  ).map(s => s.toLowerCase());
  const humanSkill = state.speciesChoices?.humanSkill ? [state.speciesChoices.humanSkill.toLowerCase()] : [];
  const skilledSkills = [
    ...(state.speciesChoices?.humanFeatChoices?.skills || []),
    ...(state.backgroundFeatChoices?.skills || [])
  ].map(s => s.toLowerCase());
  const alreadyKnownOutsideClass = [...bgSkills, ...humanSkill, ...skilledSkills];

  // Instrument toggle for Bard
  const handleToggleInstrument = (inst: string) => {
    const current = classChoices.instruments || [];
    const exists = current.includes(inst);
    let next: string[];
    if (exists) {
      next = current.filter(i => i !== inst);
    } else {
      if (current.length >= 3) return;
      next = [...current, inst];
    }
    onUpdateClassChoices({ instruments: next });
  };

  // Expertise toggle for Rogue
  const handleToggleExpertise = (skill: string) => {
    const current = classChoices.expertise || [];
    const exists = current.includes(skill);
    let next: string[];
    if (exists) {
      next = current.filter(s => s !== skill);
    } else {
      if (current.length >= 2) return;
      next = [...current, skill];
    }
    onUpdateClassChoices({ expertise: next });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          Choose Your Class ({ALL_CLASSES.length} Modern Classes)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select your class, configure its unique features (Fighting Style, Divine Order, Invocations, etc.), and choose your skills.
        </p>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ALL_CLASSES.map((cls) => {
          const isSelected = selectedClass?.name === cls.name;
          const hitDie = cls.hd?.faces || 8;
          const primaryStat = cls.primaryAbility 
            ? Object.keys(cls.primaryAbility[0] || {})[0]?.toUpperCase() 
            : (cls.spellcastingAbility?.toUpperCase() || 'INT');
          const saves = (cls.proficiency || []).map((s: string) => s.toUpperCase()).join(', ');
          const masteriesCount = getWeaponMasteriesForClass(cls.name);
          const isArtificer = cls.name === 'Artificer';

          return (
            <div
              key={cls.name}
              onClick={() => onSelectClass(cls)}
              className={`relative rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-900/30 ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-serif font-bold text-lg text-slate-100">{cls.name}</h3>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>

                {/* Source Badge */}
                <div className="mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isArtificer 
                      ? 'bg-purple-950/60 border-purple-800/40 text-purple-300' 
                      : 'bg-amber-950/60 border-amber-800/40 text-amber-300'
                  }`}>
                    {isArtificer ? "Tasha's Cauldron (TCE)" : "2024 Revised (XPHB)"}
                  </span>
                </div>

                {/* Key badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                    <Heart className="w-3 h-3" /> d{hitDie} HP
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
                    <Zap className="w-3 h-3" /> {primaryStat}
                  </span>
                  {masteriesCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      <Sword className="w-3 h-3" /> {masteriesCount} Masteries
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-500">Saving Throws:</span> <span className="font-medium text-slate-300">{saves}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Armor:</span>{' '}
                    <span className="font-medium text-slate-300">
                      {cls.startingProficiencies?.armor?.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-amber-400">
                <span>{isSelected ? 'Selected' : 'Select'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Details & In-Depth Choices */}
      {selectedClass && (
        <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">Class Customization</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">{selectedClass.name} Features & Choices</h3>
            </div>
            {level >= 3 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                Level {level}: {availableSubclasses.length} Subclasses Available
              </span>
            )}
          </div>

          {/* 1. CLASS-SPECIFIC FEATURE CHOICES */}
          <div className="space-y-4">
            {/* FIGHTER: Fighting Style */}
            {className === 'Fighter' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sword className="w-4 h-4 text-amber-400" /> Fighting Style Feat (Level 1)
                  </label>
                  {classChoices.fightingStyle && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      Selected: {classChoices.fightingStyle}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Fighters adopt a martial fighting style as a 1st-level feat.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {FIGHTING_STYLES.map((fs) => {
                    const isFsSelected = classChoices.fightingStyle === fs.name;
                    return (
                      <div
                        key={fs.id}
                        onClick={() => onUpdateClassChoices({ fightingStyle: fs.name })}
                        className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                          isFsSelected
                            ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs mb-1">
                            <span>{fs.name}</span>
                            {isFsSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {fs.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BARD: 3 Musical Instruments */}
            {className === 'Bard' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Musical Instrument Training (Choose 3)
                  </label>
                  <span className={`text-[11px] font-bold ${(classChoices.instruments || []).length === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(classChoices.instruments || []).length} / 3 Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bards gain proficiency with three musical instruments of their choice to channel their magic.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MUSICAL_INSTRUMENTS.map((inst) => {
                    const isChecked = (classChoices.instruments || []).includes(inst);
                    const isFull = (classChoices.instruments || []).length >= 3 && !isChecked;

                    return (
                      <button
                        key={inst}
                        type="button"
                        disabled={isFull}
                        onClick={() => handleToggleInstrument(inst)}
                        className={`px-2.5 py-1.5 rounded text-xs text-left truncate border transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                            : isFull
                            ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{inst}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CLERIC: Divine Order */}
            {className === 'Cleric' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Divine Order (Level 1 2024 Rule)
                  </label>
                  {classChoices.divineOrder && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      Chosen: {classChoices.divineOrder}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  You dedicate yourself to one of the following sacred roles:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => onUpdateClassChoices({ divineOrder: 'Protector' })}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      classChoices.divineOrder === 'Protector'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>Protector</span>
                      {classChoices.divineOrder === 'Protector' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Trained for martial combat. You gain proficiency with <strong>Martial Weapons</strong> and <strong>Heavy Armor</strong>.
                    </p>
                  </div>

                  <div
                    onClick={() => onUpdateClassChoices({ divineOrder: 'Thaumaturge' })}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      classChoices.divineOrder === 'Thaumaturge'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>Thaumaturge</span>
                      {classChoices.divineOrder === 'Thaumaturge' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Attuned to magical lore. You learn one extra Cleric cantrip, and add your <strong>Wisdom modifier</strong> to Arcana and Religion checks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DRUID: Primal Order */}
            {className === 'Druid' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" /> Primal Order (Level 1 2024 Rule)
                  </label>
                  {classChoices.primalOrder && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      Chosen: {classChoices.primalOrder}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  You dedicate yourself to one of the following primal vocations:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => onUpdateClassChoices({ primalOrder: 'Magician' })}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      classChoices.primalOrder === 'Magician'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>Magician</span>
                      {classChoices.primalOrder === 'Magician' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Focused on ancient spells. You learn one extra Druid cantrip, and add your <strong>Wisdom modifier</strong> to Arcana and Nature checks.
                    </p>
                  </div>

                  <div
                    onClick={() => onUpdateClassChoices({ primalOrder: 'Warden' })}
                    className={`p-3.5 rounded-lg border cursor-pointer transition ${
                      classChoices.primalOrder === 'Warden'
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs mb-1">
                      <span>Warden</span>
                      {classChoices.primalOrder === 'Warden' && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Armed to defend nature. You gain proficiency with <strong>Martial Weapons</strong> and <strong>Medium Armor</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ROGUE: Expertise (Choose 2 skills) */}
            {className === 'Rogue' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Rogue Expertise (Choose 2 Proficiencies)
                  </label>
                  <span className={`text-[11px] font-bold ${(classChoices.expertise || []).length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(classChoices.expertise || []).length} / 2 Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Choose two of your skill proficiencies (or Thieves' Tools). Your proficiency bonus is <strong>doubled</strong> for any ability check that uses them.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {state.selectedSkills.map((sk) => {
                    const isChecked = (classChoices.expertise || []).includes(sk);
                    const isFull = (classChoices.expertise || []).length >= 2 && !isChecked;

                    return (
                      <button
                        key={sk}
                        type="button"
                        disabled={isFull}
                        onClick={() => handleToggleExpertise(sk)}
                        className={`px-2.5 py-1.5 rounded text-xs text-left capitalize border transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                            : isFull
                            ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{sk}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WARLOCK: Level 1 Eldritch Invocation */}
            {className === 'Warlock' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-amber-400" /> Eldritch Invocation (Level 1 2024 Rule)
                  </label>
                  {classChoices.eldritchInvocation && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      Selected: {classChoices.eldritchInvocation}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  In D&D 2024, Warlocks gain their first Eldritch Invocation at Level 1 (including Pact of the Blade, Tome, or Chain).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {WARLOCK_INVOCATIONS_LVL1.map((inv) => {
                    const isInvSelected = classChoices.eldritchInvocation === inv.name;
                    return (
                      <div
                        key={inv.id}
                        onClick={() => onUpdateClassChoices({ eldritchInvocation: inv.name })}
                        className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                          isInvSelected
                            ? 'bg-amber-950/50 border-amber-500 text-amber-100 ring-1 ring-amber-500'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between font-bold text-xs mb-1">
                            <span>{inv.name}</span>
                            {isInvSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {inv.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ARTIFICER: 1 Artisan Tool */}
            {className === 'Artificer' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Artisan's Tool Proficiency (Choose 1)
                </label>
                <p className="text-[11px] text-slate-400">
                  Artificers start with Thieves' Tools, Tinker's Tools, plus one additional Artisan's Tool of their choice.
                </p>
                <select
                  value={classChoices.artisanTool || ''}
                  onChange={(e) => onUpdateClassChoices({ artisanTool: e.target.value })}
                  className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                >
                  <option value="">Select an Artisan Tool</option>
                  {ARTISAN_TOOLS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* MONK: 1 Artisan Tool or Musical Instrument */}
            {className === 'Monk' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Tool Training (Choose 1)
                </label>
                <p className="text-[11px] text-slate-400">
                  Monks gain proficiency with one type of Artisan's Tools or Musical Instrument of their choice.
                </p>
                <select
                  value={classChoices.monkTool || ''}
                  onChange={(e) => onUpdateClassChoices({ monkTool: e.target.value })}
                  className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                >
                  <option value="">Select an Artisan Tool or Instrument</option>
                  <optgroup label="Artisan's Tools">
                    {ARTISAN_TOOLS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Musical Instruments">
                    {MUSICAL_INSTRUMENTS.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>

          {/* 2. SUBCLASS SELECTION (Unlocked at Level 3 for all classes) */}
          {level >= 3 ? (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Select Subclass ({filteredSubclasses.length} available)
                </label>

                {/* Subclass Source Filter Tabs */}
                <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setSubclassSourceFilter('ALL')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${subclassSourceFilter === 'ALL' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    All Modern ({availableSubclasses.length})
                  </button>
                  <button
                    onClick={() => setSubclassSourceFilter('XPHB')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${subclassSourceFilter === 'XPHB' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    2024 Core (XPHB)
                  </button>
                  <button
                    onClick={() => setSubclassSourceFilter('TCE')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${subclassSourceFilter === 'TCE' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Tasha's (TCE)
                  </button>
                  <button
                    onClick={() => setSubclassSourceFilter('XGE')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${subclassSourceFilter === 'XGE' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Xanathar's (XGE)
                  </button>
                  <button
                    onClick={() => setSubclassSourceFilter('OTHER')}
                    className={`px-2.5 py-1 rounded transition cursor-pointer ${subclassSourceFilter === 'OTHER' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Setting Books
                  </button>
                </div>
              </div>

              {/* Subclasses Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-2">
                {filteredSubclasses.map((sc, idx) => {
                  const isScSelected = state.selectedSubclass?.name === sc.name && state.selectedSubclass?.source === sc.source;
                  const sourceLabel = sc.source || '5e';

                  return (
                    <div
                      key={`${sc.name}-${sc.source}-${idx}`}
                      onClick={() => onSelectSubclass(sc)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                        isScSelected
                          ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-xs mb-1.5">
                        <span className="truncate">{sc.name}</span>
                        {isScSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400/90 font-mono font-bold">
                          {sourceLabel}
                        </span>
                        <span className="truncate max-w-[120px] text-right">
                          {sc.sourceFull || sc.source}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>In D&D 2024, all subclasses unlock at <strong>Level 3</strong>. (Current Level: {level})</span>
            </div>
          )}

          {/* 3. CLASS SKILL PROFICIENCIES */}
          {allowedSkills.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Select {maxSkillsAllowed} Class Skills ({className})
                </label>
                <span className={`text-xs font-medium ${selectedClassSkills.length === maxSkillsAllowed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedClassSkills.length} / {maxSkillsAllowed} selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {allowedSkills.map((sk) => {
                  const isKnownOutside = alreadyKnownOutsideClass.includes(sk.toLowerCase());
                  const isChecked = state.selectedSkills.includes(sk);
                  const isFull = selectedClassSkills.length >= maxSkillsAllowed && !isChecked;
                  const isDisabled = isFull || isKnownOutside;

                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isKnownOutside && onToggleSkill(sk)}
                      title={isKnownOutside ? 'Already proficient from background, species or feat' : undefined}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                          : isKnownOutside
                          ? 'bg-slate-950/60 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
                          : isFull
                          ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <span className="truncate">{sk}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                      {isKnownOutside && <span className="text-[9px] text-slate-500 font-normal shrink-0 ml-1">(Known)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedClass}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition cursor-pointer ${
            selectedClass
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-600/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Next: Select Species</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
