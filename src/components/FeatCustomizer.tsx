import React from 'react';
import type { FeatChoiceData } from '../types/character';
import { ALL_SPELLS } from '../utils/dataLoader';
import { SKILL_ABILITY_MAP } from '../utils/dndRules';
import { Sparkles, Wand2, Award, Wrench, Check } from 'lucide-react';

export const ARTISAN_TOOLS = [
  "Alchemist's Supplies",
  "Brewer's Supplies",
  "Calligrapher's Supplies",
  "Carpenter's Tools",
  "Cartographer's Tools",
  "Cobbler's Tools",
  "Cook's Utensils",
  "Glassblower's Tools",
  "Jeweler's Tools",
  "Leatherworker's Tools",
  "Mason's Tools",
  "Painter's Supplies",
  "Potter's Tools",
  "Smith's Tools",
  "Tinker's Tools",
  "Weaver's Tools",
  "Woodcarver's Tools",
];

export const MUSICAL_INSTRUMENTS = [
  "Bagpipes",
  "Drum",
  "Dulcimer",
  "Flute",
  "Horn",
  "Lute",
  "Lyre",
  "Pan Flute",
  "Shawm",
  "Viol",
];

interface FeatCustomizerProps {
  featName: string;
  data: FeatChoiceData;
  onChange: (updated: FeatChoiceData) => void;
  titlePrefix?: string;
  disabledSkills?: string[];
}

export const FeatCustomizer: React.FC<FeatCustomizerProps> = ({
  featName,
  data,
  onChange,
  titlePrefix = 'Feat Customization',
  disabledSkills = [],
}) => {
  const cleanName = (featName || '').split(';')[0].split('|')[0].trim().toLowerCase();
  const normalizedDisabled = disabledSkills.map(s => s.toLowerCase());

  // 1. SKILLED FEAT (Choose 3 skills)
  if (cleanName === 'skilled') {
    const selectedSkills = data.skills || [];
    const handleToggleSkill = (skill: string) => {
      if (normalizedDisabled.includes(skill.toLowerCase())) return;
      const exists = selectedSkills.includes(skill);
      let next: string[];
      if (exists) {
        next = selectedSkills.filter(s => s !== skill);
      } else {
        if (selectedSkills.length >= 3) return;
        next = [...selectedSkills, skill];
      }
      onChange({ ...data, skills: next });
    };

    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            {titlePrefix}: Skilled (Choose 3 Skills)
          </label>
          <span className={`text-[11px] font-bold ${selectedSkills.length === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {selectedSkills.length} / 3 Selected
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          The Skilled feat grants proficiency in any three skills of your choice (already proficient skills cannot be selected).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(SKILL_ABILITY_MAP).map((skill) => {
            const isAlreadyProf = normalizedDisabled.includes(skill.toLowerCase());
            const isChecked = selectedSkills.includes(skill);
            const isFull = selectedSkills.length >= 3 && !isChecked;
            const isDisabled = isAlreadyProf || isFull;

            return (
              <button
                key={skill}
                type="button"
                disabled={isDisabled}
                onClick={() => handleToggleSkill(skill)}
                title={isAlreadyProf ? 'Already proficient from another feature' : undefined}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize border transition flex items-center justify-between ${
                  isChecked
                    ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                    : isAlreadyProf
                    ? 'bg-slate-950/60 border-slate-900 text-slate-500 cursor-not-allowed opacity-50'
                    : isFull
                    ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <span className="truncate">{skill}</span>
                {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                {isAlreadyProf && <span className="text-[9px] text-slate-500 font-normal shrink-0 ml-1">(Known)</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. MAGIC INITIATE FEAT (Choose class, 2 cantrips, 1 1st-level spell, ability)
  if (cleanName === 'magic initiate') {
    const spellClass = data.spellClass || 'Wizard';
    const spellAbility = data.ability || (spellClass === 'Cleric' || spellClass === 'Druid' ? 'wis' : 'int');
    const selectedCantrips = data.cantrips || [];
    const selectedSpell1 = data.spell1 || '';

    // Filter available spells for this class
    const classSpells = ALL_SPELLS.filter((sp: any) => {
      const classList = sp.classes?.fromClassList || [];
      return classList.some((c: any) => c.name?.toLowerCase() === spellClass.toLowerCase());
    });

    const cantrips = classSpells.filter((sp: any) => sp.level === 0);
    const level1Spells = classSpells.filter((sp: any) => sp.level === 1);

    const handleToggleCantrip = (spName: string) => {
      const exists = selectedCantrips.includes(spName);
      let next: string[];
      if (exists) {
        next = selectedCantrips.filter(s => s !== spName);
      } else {
        if (selectedCantrips.length >= 2) return;
        next = [...selectedCantrips, spName];
      }
      onChange({ ...data, cantrips: next });
    };

    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-4 shadow-inner">
        <div>
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-amber-400" />
            {titlePrefix}: Magic Initiate Setup
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Choose a spell list (Cleric, Druid, or Wizard), your spellcasting ability, two cantrips, and one 1st-level spell.
          </p>
        </div>

        {/* Class and Ability Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Spell List Class:</label>
            <select
              value={spellClass}
              onChange={(e) => {
                const newCls = e.target.value as 'Cleric' | 'Druid' | 'Wizard';
                onChange({
                  ...data,
                  spellClass: newCls,
                  cantrips: [],
                  spell1: '',
                  ability: newCls === 'Wizard' ? 'int' : 'wis',
                });
              }}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
            >
              <option value="Cleric">Cleric</option>
              <option value="Druid">Druid</option>
              <option value="Wizard">Wizard</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Spellcasting Ability:</label>
            <select
              value={spellAbility}
              onChange={(e) => onChange({ ...data, ability: e.target.value as 'int' | 'wis' | 'cha' })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 uppercase font-semibold focus:border-amber-500"
            >
              <option value="int">Intelligence (INT)</option>
              <option value="wis">Wisdom (WIS)</option>
              <option value="cha">Charisma (CHA)</option>
            </select>
          </div>
        </div>

        {/* 2 Cantrips Picker */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-300">Choose 2 Cantrips ({spellClass}):</span>
            <span className={`text-[10px] font-bold ${selectedCantrips.length === 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedCantrips.length} / 2 Selected
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {cantrips.map((sp: any) => {
              const isChecked = selectedCantrips.includes(sp.name);
              const isFull = selectedCantrips.length >= 2 && !isChecked;

              return (
                <button
                  key={sp.name}
                  type="button"
                  disabled={isFull}
                  onClick={() => handleToggleCantrip(sp.name)}
                  className={`px-2 py-1 rounded text-[11px] text-left truncate border transition flex items-center justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                      : isFull
                      ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate">{sp.name}</span>
                  {isChecked && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1 Level 1 Spell Picker */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 mb-1">
            Choose 1 Level 1 Spell ({spellClass}):
          </label>
          <select
            value={selectedSpell1}
            onChange={(e) => onChange({ ...data, spell1: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
          >
            <option value="">Select a Level 1 Spell</option>
            {level1Spells.map((sp: any) => (
              <option key={sp.name} value={sp.name}>
                {sp.name} ({sp.school || 'Spell'})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // 3. CRAFTER FEAT (Choose 3 Artisan Tools)
  if (cleanName === 'crafter') {
    const selectedTools = data.tools || [];
    const handleToggleTool = (tool: string) => {
      const exists = selectedTools.includes(tool);
      let next: string[];
      if (exists) {
        next = selectedTools.filter(t => t !== tool);
      } else {
        if (selectedTools.length >= 3) return;
        next = [...selectedTools, tool];
      }
      onChange({ ...data, tools: next });
    };

    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-amber-400" />
            {titlePrefix}: Crafter (Choose 3 Artisan Tools)
          </label>
          <span className={`text-[11px] font-bold ${selectedTools.length === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {selectedTools.length} / 3 Selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
          {ARTISAN_TOOLS.map((tool) => {
            const isChecked = selectedTools.includes(tool);
            const isFull = selectedTools.length >= 3 && !isChecked;

            return (
              <button
                key={tool}
                type="button"
                disabled={isFull}
                onClick={() => handleToggleTool(tool)}
                className={`px-2 py-1.5 rounded text-[11px] text-left truncate border transition flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                    : isFull
                    ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="truncate">{tool}</span>
                {isChecked && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. MUSICIAN FEAT (Choose 3 Musical Instruments)
  if (cleanName === 'musician') {
    const selectedTools = data.tools || [];
    const handleToggleTool = (inst: string) => {
      const exists = selectedTools.includes(inst);
      let next: string[];
      if (exists) {
        next = selectedTools.filter(t => t !== inst);
      } else {
        if (selectedTools.length >= 3) return;
        next = [...selectedTools, inst];
      }
      onChange({ ...data, tools: next });
    };

    return (
      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {titlePrefix}: Musician (Choose 3 Instruments)
          </label>
          <span className={`text-[11px] font-bold ${selectedTools.length === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {selectedTools.length} / 3 Selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MUSICAL_INSTRUMENTS.map((inst) => {
            const isChecked = selectedTools.includes(inst);
            const isFull = selectedTools.length >= 3 && !isChecked;

            return (
              <button
                key={inst}
                type="button"
                disabled={isFull}
                onClick={() => handleToggleTool(inst)}
                className={`px-2 py-1.5 rounded text-[11px] text-left truncate border transition flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                    : isFull
                    ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="truncate">{inst}</span>
                {isChecked && <Check className="w-3 h-3 text-amber-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Feats with no sub-choices (Alert, Tough, Lucky, etc.)
  return null;
};
