import React, { useEffect } from 'react';
import type { CharacterSheetState, AbilityKey } from '../types/character';
import { 
  ABILITY_LABELS, 
  calculateTotalScores, 
  getAbilityModifier, 
  formatModifier, 
  getProficiencyBonus, 
  calculateHP, 
  calculateAC, 
  SKILL_ABILITY_MAP 
} from '../utils/dndRules';
import { getFeatByName, FIGHTING_STYLES, WARLOCK_INVOCATIONS_LVL1 } from '../utils/dataLoader';
import { extractEntriesText } from '../utils/tagParser';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Heart, 
  Zap, 
  Footprints, 
  Eye, 
  Sparkles, 
  Sword, 
  Printer, 
  Download, 
  Edit3,
  Award,
  Wand2,
  Flame,
  Wrench
} from 'lucide-react';

interface CharacterSheetProps {
  state: CharacterSheetState;
  onEditStep: (step: any) => void;
  onExport: () => void;
}

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  state,
  onEditStep,
  onExport,
}) => {
  useEffect(() => {
    // Confetti celebration when reaching character sheet
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const level = state.concept.level || 1;
  const profBonus = getProficiencyBonus(level);
  const totalScores = calculateTotalScores(state.abilityScores, state.backgroundBonus);

  const strMod = getAbilityModifier(totalScores.str);
  const dexMod = getAbilityModifier(totalScores.dex);
  const conMod = getAbilityModifier(totalScores.con);
  const intMod = getAbilityModifier(totalScores.int);
  const wisMod = getAbilityModifier(totalScores.wis);
  const chaMod = getAbilityModifier(totalScores.cha);

  const mods: Record<AbilityKey, number> = {
    str: strMod,
    dex: dexMod,
    con: conMod,
    int: intMod,
    wis: wisMod,
    cha: chaMod,
  };

  const hitDieFaces = state.selectedClass?.hd?.faces || 8;
  const className = state.selectedClass?.name || 'Adventurer';
  const speciesName = state.selectedSpecies?.name || 'Human';
  const backgroundName = state.selectedBackground?.name || 'Custom';

  const lineageName = state.speciesChoices?.lineage;
  const humanOriginFeatName = state.speciesChoices?.humanOriginFeat;
  const humanSkill = state.speciesChoices?.humanSkill;
  const isDwarf = speciesName.toLowerCase() === 'dwarf';
  const isWoodElf = lineageName?.toLowerCase().includes('wood elf');

  // Origin Feat Check for Tough (grants +2 HP per level)
  const featRaw = state.selectedBackground?.feats?.[0] ? Object.keys(state.selectedBackground.feats[0])[0] : '';
  const featName = featRaw.split(';')[0].split('|')[0];
  const isTough = featName.toLowerCase() === 'tough' || humanOriginFeatName?.toLowerCase() === 'tough';

  const fightingStyle = state.classChoices?.fightingStyle;
  const isDefenseStyle = fightingStyle === 'Defense';
  const hasArmorOfShadows = state.classChoices?.eldritchInvocation === 'Armor of Shadows';
  
  let baseAC = calculateAC(dexMod, conMod, wisMod, className);
  if (hasArmorOfShadows) {
    baseAC = Math.max(baseAC, 13 + dexMod);
  }
  const ac = baseAC + (isDefenseStyle ? 1 : 0);

  const baseHP = calculateHP(level, hitDieFaces, conMod, isTough);
  const maxHP = baseHP + (isDwarf ? level : 0);
  
  const baseSpeed = typeof state.selectedSpecies?.speed === 'object' ? state.selectedSpecies.speed.walk : state.selectedSpecies?.speed || 30;
  const speed = isWoodElf ? 35 : baseSpeed;

  // Saving Throw Proficiencies
  const classSaveProficiencies: string[] = (state.selectedClass?.proficiency || []).map((s: string) => s.toLowerCase());

  // Background Skill Proficiencies
  const bgSkillProficiencies: string[] = (
    state.backgroundChoices?.skills && state.backgroundChoices.skills.length > 0
      ? state.backgroundChoices.skills
      : (state.selectedBackground?.skillProficiencies?.[0]
          ? Object.keys(state.selectedBackground.skillProficiencies[0])
          : [])
  ).map(s => s.toLowerCase());

  const extraHumanSkills = (speciesName === 'Human' && humanSkill) ? [humanSkill.toLowerCase()] : [];
  const skilledFromHuman = (state.speciesChoices?.humanFeatChoices?.skills || []).map(s => s.toLowerCase());
  const skilledFromBg = (state.backgroundFeatChoices?.skills || []).map(s => s.toLowerCase());

  const allProficientSkills = Array.from(new Set([
    ...state.selectedSkills.map(s => s.toLowerCase()), 
    ...bgSkillProficiencies,
    ...extraHumanSkills,
    ...skilledFromHuman,
    ...skilledFromBg
  ]));

  // Magic Initiate Spells (from Background or Human)
  const bgInitiateSpells = [
    ...(state.backgroundFeatChoices?.cantrips || []),
    ...(state.backgroundFeatChoices?.spell1 ? [state.backgroundFeatChoices.spell1] : [])
  ];
  const humanInitiateSpells = [
    ...(state.speciesChoices?.humanFeatChoices?.cantrips || []),
    ...(state.speciesChoices?.humanFeatChoices?.spell1 ? [state.speciesChoices.humanFeatChoices.spell1] : [])
  ];
  const allDisplaySpells = Array.from(new Set([
    ...state.selectedSpells,
    ...bgInitiateSpells,
    ...humanInitiateSpells
  ]));

  // Tools & Instruments (from Class, Background, and Feats)
  const bgTools = state.backgroundFeatChoices?.tools || [];
  const humanTools = state.speciesChoices?.humanFeatChoices?.tools || [];
  const classTools: string[] = [];
  if (className === 'Artificer') {
    classTools.push("Thieves' Tools", "Tinker's Tools");
    if (state.classChoices?.artisanTool) classTools.push(state.classChoices.artisanTool);
  }
  if (className === 'Rogue') classTools.push("Thieves' Tools");
  if (className === 'Druid') classTools.push("Herbalism Kit");
  if (className === 'Bard' && state.classChoices?.instruments) {
    classTools.push(...state.classChoices.instruments);
  }
  if (className === 'Monk' && state.classChoices?.monkTool) {
    classTools.push(state.classChoices.monkTool);
  }
  const bgCustomTool = state.backgroundChoices?.tool ? [state.backgroundChoices.tool] : [];
  const bgFixedTools = state.selectedBackground?.toolProficiencies?.[0]
    ? Object.keys(state.selectedBackground.toolProficiencies[0]).filter(t => !t.startsWith('any'))
    : [];
  const effectiveBgTools = bgCustomTool.length > 0 ? bgCustomTool : bgFixedTools;

  const allDisplayTools = Array.from(new Set([...classTools, ...effectiveBgTools, ...bgTools, ...humanTools]));

  // Passive Senses
  const isPerceptionProf = allProficientSkills.includes('perception');
  const passivePerception = 10 + wisMod + (isPerceptionProf ? profBonus : 0);

  // Spellcasting
  const primaryStatKey = (state.selectedClass?.primaryAbility ? Object.keys(state.selectedClass.primaryAbility[0] || {})[0]?.toLowerCase() : 'int') as AbilityKey;
  const spellcastingMod = mods[primaryStatKey] || 0;
  const spellSaveDC = 8 + profBonus + spellcastingMod;
  const spellAttackBonus = profBonus + spellcastingMod;

  const originFeatObj = getFeatByName(featName);

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 print:py-0 print:max-w-full">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 print:hidden">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Character Complete</span>
          <h2 className="text-xl font-serif font-bold text-slate-100">{state.concept.name || 'Unnamed Character'}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditStep('concept')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" /> Print / PDF
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Save JSON
          </button>
        </div>
      </div>

      {/* Main Printable Character Sheet Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header Block */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-slate-800 pb-6 print:border-black/20">
          <div className="md:col-span-2 flex items-center gap-4">
            {state.concept.avatarUrl && (
              <img
                src={state.concept.avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-xl object-cover border-2 border-amber-500/40 shadow-md print:hidden"
              />
            )}
            <div>
              <h1 className="text-3xl font-serif font-black text-amber-100 print:text-black tracking-wide">
                {state.concept.name || 'Hero of the Realm'}
              </h1>
              <p className="text-xs text-amber-400 font-semibold mt-1 print:text-amber-800">
                {speciesName}{lineageName ? ` (${lineageName})` : ''} • {className} (Level {level}) {state.selectedSubclass ? `• ${state.selectedSubclass.name}` : ''}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Background</span>
              <span className="font-semibold text-slate-200 print:text-black">{backgroundName}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Alignment</span>
              <span className="font-semibold text-slate-200 print:text-black">{state.concept.alignment}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proficiency</span>
              <span className="font-bold text-amber-400 print:text-amber-700">+{profBonus}</span>
            </div>
          </div>
        </div>

        {/* Combat Vitals Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Shield className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{ac}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Armor Class</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Heart className="w-5 h-5 text-red-500 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{maxHP}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Max HP</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Zap className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{formatModifier(dexMod)}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Initiative</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Footprints className="w-5 h-5 text-blue-400 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{speed} ft</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Speed</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Sparkles className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{level}d{hitDieFaces}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Hit Dice</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center print:bg-slate-100 print:border-slate-300">
            <Eye className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-2xl font-black text-slate-100 font-serif print:text-black">{passivePerception}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Passive Percep.</span>
          </div>
        </div>

        {/* 3-Column Layout: Stats & Saves | Skills | Features & Weapons */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: Abilities & Saving Throws (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            {/* Ability Blocks */}
            <div className="space-y-2">
              {ABILITY_KEYS.map((k) => {
                const score = totalScores[k];
                const mod = mods[k];
                const isSaveProf = classSaveProficiencies.includes(k);
                const saveBonus = mod + (isSaveProf ? profBonus : 0);

                return (
                  <div
                    key={k}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between print:bg-slate-100 print:border-slate-300"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        {ABILITY_LABELS[k].name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Score: {score}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Save</span>
                        <span className={`text-xs font-bold ${isSaveProf ? 'text-amber-400 print:text-amber-700' : 'text-slate-400'}`}>
                          {formatModifier(saveBonus)} {isSaveProf && '★'}
                        </span>
                      </div>
                      <div className="w-12 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-base font-black text-amber-200 font-serif print:bg-white print:border-slate-400 print:text-black">
                        {formatModifier(mod)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Skills List (4 cols) */}
          <div className="md:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
              Skills & Proficiencies
            </h3>
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {Object.entries(SKILL_ABILITY_MAP).map(([skill, statKey]) => {
                const isProf = allProficientSkills.includes(skill);
                const isExpertise = (state.classChoices?.expertise || []).map(s => s.toLowerCase()).includes(skill);
                const statMod = mods[statKey];
                const totalSkillMod = statMod + (isExpertise ? profBonus * 2 : (isProf ? profBonus : 0));

                return (
                  <div
                    key={skill}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                      isExpertise
                        ? 'bg-amber-900/40 border border-amber-500/60 text-amber-100 font-bold print:bg-amber-200 print:text-amber-950'
                        : isProf
                        ? 'bg-amber-950/30 border border-amber-900/40 text-amber-200 font-semibold print:bg-amber-100 print:text-amber-950'
                        : 'text-slate-400 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 capitalize">
                      <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold border ${
                        isExpertise
                          ? 'bg-amber-400 border-amber-300 text-slate-950'
                          : isProf
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'border-slate-700 text-transparent'
                      }`}>
                        {isExpertise ? '★' : isProf ? '✓' : ''}
                      </span>
                      <span>{skill}</span>
                      {isExpertise && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Expertise
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-normal uppercase">({statKey})</span>
                    </div>
                    <span className="font-mono font-bold">{formatModifier(totalSkillMod)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Weapons, Traits & Spells (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Weapon Mastery & Attacks */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sword className="w-3.5 h-3.5" /> 2024 Weapon Masteries
              </h3>
              {state.selectedWeaponMasteries.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {state.selectedWeaponMasteries.map((wp) => (
                    <span
                      key={wp}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-xs font-medium text-amber-200 flex items-center gap-1.5"
                    >
                      <Sword className="w-3 h-3 text-amber-400" /> {wp}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No active weapon masteries at this level.</p>
              )}
            </div>

            {/* Fighter Fighting Style */}
            {fightingStyle && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sword className="w-3.5 h-3.5" /> Fighting Style: {fightingStyle}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {FIGHTING_STYLES.find(f => f.name === fightingStyle)?.description || 'Martial combat technique.'}
                </p>
              </div>
            )}

            {/* Cleric Divine Order */}
            {state.classChoices?.divineOrder && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Divine Order: {state.classChoices.divineOrder}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {state.classChoices.divineOrder === 'Protector'
                    ? 'Trained for martial combat. You gain proficiency with Martial weapons and Heavy armor.'
                    : 'Attuned to sacred lore. You gain one extra Cleric cantrip and add your Wisdom modifier to Arcana and Religion checks.'}
                </p>
              </div>
            )}

            {/* Druid Primal Order */}
            {state.classChoices?.primalOrder && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Primal Order: {state.classChoices.primalOrder}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {state.classChoices.primalOrder === 'Magician'
                    ? 'Deeply attuned to nature magic. You gain one extra Druid cantrip and add your Wisdom modifier to Arcana and Nature checks.'
                    : 'Guardian of the wilds. You gain proficiency with Martial weapons and Medium armor.'}
                </p>
              </div>
            )}

            {/* Warlock Eldritch Invocation */}
            {state.classChoices?.eldritchInvocation && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Eldritch Invocation: {state.classChoices.eldritchInvocation}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {WARLOCK_INVOCATIONS_LVL1.find(i => i.name === state.classChoices?.eldritchInvocation)?.description || 'Forbidden knowledge granting supernatural power.'}
                </p>
              </div>
            )}

            {/* Species Lineage & Ancestry Feature */}
            {lineageName && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Ancestry / Lineage: {lineageName}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Innate supernatural traits and benefits granted by your {speciesName} heritage ({lineageName}).
                </p>
              </div>
            )}

            {/* Origin Feat */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Origin Feat: {featName}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1 line-clamp-3">
                {originFeatObj ? extractEntriesText(originFeatObj.entries) : 'Granted by your background.'}
              </p>
              {state.backgroundFeatChoices && (
                <div className="mt-2 text-xs text-amber-300 font-semibold space-y-0.5 pt-2 border-t border-slate-850">
                  {state.backgroundFeatChoices.skills && state.backgroundFeatChoices.skills.length > 0 && (
                    <div>Chosen Skills: <span className="text-slate-200 capitalize">{state.backgroundFeatChoices.skills.join(', ')}</span></div>
                  )}
                  {state.backgroundFeatChoices.cantrips && state.backgroundFeatChoices.cantrips.length > 0 && (
                    <div>Cantrips: <span className="text-slate-200">{state.backgroundFeatChoices.cantrips.join(', ')}</span></div>
                  )}
                  {state.backgroundFeatChoices.spell1 && (
                    <div>Level 1 Spell: <span className="text-slate-200">{state.backgroundFeatChoices.spell1}</span></div>
                  )}
                  {state.backgroundFeatChoices.tools && state.backgroundFeatChoices.tools.length > 0 && (
                    <div>Tools: <span className="text-slate-200">{state.backgroundFeatChoices.tools.join(', ')}</span></div>
                  )}
                </div>
              )}
            </div>

            {/* Human Versatile Feat (if selected) */}
            {speciesName === 'Human' && humanOriginFeatName && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Human Versatile Feat: {humanOriginFeatName}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 line-clamp-3">
                  {(() => {
                    const extraFeat = getFeatByName(humanOriginFeatName);
                    return extraFeat ? extractEntriesText(extraFeat.entries) : 'Granted by Human Versatility.';
                  })()}
                </p>
                {state.speciesChoices?.humanFeatChoices && (
                  <div className="mt-2 text-xs text-amber-300 font-semibold space-y-0.5 pt-2 border-t border-slate-850">
                    {state.speciesChoices.humanFeatChoices.skills && state.speciesChoices.humanFeatChoices.skills.length > 0 && (
                      <div>Chosen Skills: <span className="text-slate-200 capitalize">{state.speciesChoices.humanFeatChoices.skills.join(', ')}</span></div>
                    )}
                    {state.speciesChoices.humanFeatChoices.cantrips && state.speciesChoices.humanFeatChoices.cantrips.length > 0 && (
                      <div>Cantrips: <span className="text-slate-200">{state.speciesChoices.humanFeatChoices.cantrips.join(', ')}</span></div>
                    )}
                    {state.speciesChoices.humanFeatChoices.spell1 && (
                      <div>Level 1 Spell: <span className="text-slate-200">{state.speciesChoices.humanFeatChoices.spell1}</span></div>
                    )}
                    {state.speciesChoices.humanFeatChoices.tools && state.speciesChoices.humanFeatChoices.tools.length > 0 && (
                      <div>Tools: <span className="text-slate-200">{state.speciesChoices.humanFeatChoices.tools.join(', ')}</span></div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tool & Instrument Proficiencies */}
            {allDisplayTools.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" /> Tool & Instrument Proficiencies
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {allDisplayTools.map((t) => (
                    <span key={t} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 capitalize">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Spellcasting Summary (if applicable) */}
            {allDisplaySpells.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Spellcasting {state.selectedClass ? `(${className})` : ''}
                  </h3>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                      DC {spellSaveDC}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                      Attack {formatModifier(spellAttackBonus)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {allDisplaySpells.map((sp) => (
                    <span
                      key={sp}
                      className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
