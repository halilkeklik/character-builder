import React, { useEffect, useState } from 'react';
import type { CharacterSheetState, AbilityKey } from '../types/character';
import { 
  ABILITY_LABELS, 
  calculateTotalScores, 
  getAbilityModifier, 
  formatModifier, 
  getProficiencyBonus, 
  calculateHP, 
  SKILL_ABILITY_MAP 
} from '../utils/dndRules';
import { 
  getFeatByName, 
  getSpellByName, 
  getItemByName, 
  getMasteryByName,
  SPELL_SCHOOLS,
  formatSpellTime,
  formatSpellRange,
  formatSpellDuration,
  formatSpellComponents,
  FIGHTING_STYLES, 
  WARLOCK_INVOCATIONS_LVL1 
} from '../utils/dataLoader';
import { calculateEquippedAC } from '../utils/equipmentHelper';
import { extractEntriesText } from '../utils/tagParser';
import { PrintableCharacterSheet } from './PrintableCharacterSheet';
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
  Wrench,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Crosshair,
  Clock,
  Target,
  Layers,
  Coins,
  Package,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface CharacterSheetProps {
  state: CharacterSheetState;
  onEditStep: (step: any) => void;
  onExport: () => void;
}

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const SCHOOL_COLORS: Record<string, string> = {
  Evocation: 'text-red-400 bg-red-950/40 border-red-800/50',
  Abjuration: 'text-blue-400 bg-blue-950/40 border-blue-800/50',
  Conjuration: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
  Divination: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
  Enchantment: 'text-pink-400 bg-pink-950/40 border-pink-800/50',
  Illusion: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/50',
  Necromancy: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
  Transmutation: 'text-teal-400 bg-teal-950/40 border-teal-800/50',
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  state,
  onEditStep,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'combat' | 'spells' | 'inventory' | 'features' | 'printPreview'>('all');
  const [expandedSpells, setExpandedSpells] = useState<Record<string, boolean>>({});
  const [expandedMasteries, setExpandedMasteries] = useState<Record<string, boolean>>({});
  const [spellSearch, setSpellSearch] = useState('');
  const [allSpellsExpanded, setAllSpellsExpanded] = useState(true);

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
  const hasArmorOfShadows = state.classChoices?.eldritchInvocation === 'Armor of Shadows';
  
  const acCalculation = calculateEquippedAC(
    dexMod,
    conMod,
    wisMod,
    className,
    state.inventory?.items || [],
    fightingStyle,
    hasArmorOfShadows
  );
  const ac = acCalculation.totalAC;

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

  // Spellcasting Attributes
  const primaryStatKey = (state.selectedClass?.primaryAbility ? Object.keys(state.selectedClass.primaryAbility[0] || {})[0]?.toLowerCase() : 'int') as AbilityKey;
  const spellcastingMod = mods[primaryStatKey] || 0;
  const spellSaveDC = 8 + profBonus + spellcastingMod;
  const spellAttackBonus = profBonus + spellcastingMod;

  const originFeatObj = getFeatByName(featName);

  // Weapon Attacks & Masteries calculation
  const weaponAttacks = state.selectedWeaponMasteries.map((wpName) => {
    const item = getItemByName(wpName);
    const masteryRaw = item?.mastery 
      ? (typeof item.mastery === 'string' ? item.mastery.split('|')[0] : item.mastery[0].split('|')[0])
      : '';
    const masteryObj = getMasteryByName(masteryRaw);
    
    const rawProperties: string[] = (item?.property || []);
    const properties: string[] = rawProperties.map((p: string) => {
      switch (p) {
        case 'F': return 'Finesse';
        case 'L': return 'Light';
        case 'T': return 'Thrown';
        case 'V': return 'Versatile';
        case 'H': return 'Heavy';
        case '2H': return 'Two-Handed';
        case 'R': return 'Reach';
        case 'A': return 'Ammunition';
        case 'LD': return 'Loading';
        default: return p;
      }
    });

    const isFinesse = properties.includes('Finesse');
    const isRanged = properties.includes('Ammunition') || item?.type === 'R';
    
    let bestMod = strMod;
    let statUsed = 'STR';
    if (isFinesse) {
      if (dexMod >= strMod) {
        bestMod = dexMod;
        statUsed = 'DEX';
      } else {
        bestMod = strMod;
        statUsed = 'STR';
      }
    } else if (isRanged) {
      bestMod = dexMod;
      statUsed = 'DEX';
    }

    const isArchery = fightingStyle === 'Archery' && isRanged;
    const isDueling = fightingStyle === 'Dueling' && !properties.includes('Two-Handed') && !isRanged;
    
    const attackBonus = profBonus + bestMod + (isArchery ? 2 : 0);
    const damageBonus = bestMod + (isDueling ? 2 : 0);
    
    const baseDmgDie = item?.dmg1 || '1d6';
    const dmgTypeFull = item?.dmgType === 'S' ? 'Slashing' : item?.dmgType === 'P' ? 'Piercing' : item?.dmgType === 'B' ? 'Bludgeoning' : item?.dmgType || '';
    
    const damageString = `${baseDmgDie} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${dmgTypeFull}`.trim();
    const rangeStr = item?.range ? `${item.range} ft` : (properties.includes('Reach') ? '10 ft reach' : '5 ft reach');

    return {
      name: wpName,
      item,
      masteryName: masteryRaw,
      masteryDescription: masteryObj ? extractEntriesText(masteryObj.entries) : '',
      properties,
      attackBonus,
      damageString,
      statUsed,
      rangeStr,
      dmgTypeFull,
      isVersatile: properties.includes('Versatile'),
      versatileDmg: item?.dmg2 || ''
    };
  });

  // Formatted Spell Objects
  const formattedSpells = allDisplaySpells.map((spName) => {
    const spellObj = getSpellByName(spName);
    const lvl = spellObj?.level ?? 1;
    const schoolCode = spellObj?.school || 'V';
    const schoolName = SPELL_SCHOOLS[schoolCode] || 'Evocation';
    const timeStr = formatSpellTime(spellObj?.time, spellObj?.meta?.ritual);
    const rangeStr = formatSpellRange(spellObj?.range);
    const durStr = formatSpellDuration(spellObj?.duration);
    const compStr = formatSpellComponents(spellObj?.components);
    const desc = spellObj ? extractEntriesText(spellObj.entries) : 'Spell details from 5e rules.';

    return {
      name: spName,
      level: lvl,
      levelLabel: lvl === 0 ? 'Cantrip' : `Level ${lvl}`,
      schoolName,
      schoolCode,
      time: timeStr,
      range: rangeStr,
      duration: durStr,
      components: compStr,
      description: desc,
      isConcentration: durStr.includes('Conc.'),
      isRitual: !!spellObj?.meta?.ritual,
      damageTypes: spellObj?.damageInflict || [],
      savingThrow: spellObj?.savingThrow || [],
    };
  });

  const filteredSpells = formattedSpells.filter(sp => 
    sp.name.toLowerCase().includes(spellSearch.toLowerCase()) ||
    sp.schoolName.toLowerCase().includes(spellSearch.toLowerCase())
  );

  const cantrips = filteredSpells.filter(s => s.level === 0);
  const leveledSpells = filteredSpells.filter(s => s.level > 0);

  const toggleSpellExpand = (name: string) => {
    setExpandedSpells(prev => ({ ...prev, [name]: prev[name] === undefined ? !allSpellsExpanded : !prev[name] }));
  };

  const toggleMasteryExpand = (name: string) => {
    setExpandedMasteries(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleToggleAllSpells = () => {
    const nextState = !allSpellsExpanded;
    setAllSpellsExpanded(nextState);
    const bulk: Record<string, boolean> = {};
    formattedSpells.forEach(s => { bulk[s.name] = nextState; });
    setExpandedSpells(bulk);
  };

  const isSpellExpanded = (name: string) => {
    return expandedSpells[name] !== undefined ? expandedSpells[name] : allSpellsExpanded;
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6 py-6 dnd-screen-sheet print:hidden">
        {/* Top Action Bar (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
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

        {/* View Filter Pill Bar (Interactive On-Screen Navigation) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800 print:hidden">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Full Sheet
            </button>
            <button
              onClick={() => setActiveTab('combat')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'combat'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sword className="w-3.5 h-3.5" /> Attacks & Weapons ({weaponAttacks.length})
            </button>
            {formattedSpells.length > 0 && (
              <button
                onClick={() => setActiveTab('spells')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'spells'
                    ? 'bg-amber-600 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Spellbook ({formattedSpells.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'features'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Features & Lore
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" /> Inventory & Wealth ({state.inventory?.items?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('printPreview')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'printPreview'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Print Sheet Preview
            </button>
          </div>

          {allDisplaySpells.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                Spell DC: {spellSaveDC}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-amber-300 font-bold">
                Spell Attack: {formatModifier(spellAttackBonus)}
              </span>
            </div>
          )}
        </div>

        {/* Print Preview Mode */}
        {activeTab === 'printPreview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-amber-500/40 shadow-lg">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-amber-200">Printable Character Sheet Preview</h3>
                  <p className="text-xs text-slate-400">High-contrast, A4/Letter paper format with all stats and equipment</p>
                </div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
            
            <div className="bg-neutral-800 p-4 sm:p-6 rounded-2xl overflow-x-auto shadow-2xl flex justify-center border border-slate-800">
              <div className="shadow-2xl rounded-lg overflow-hidden max-w-full">
                <PrintableCharacterSheet
                  state={state}
                  totalScores={totalScores}
                  mods={mods}
                  profBonus={profBonus}
                  ac={ac}
                  acCalculation={acCalculation}
                  maxHP={maxHP}
                  speed={speed}
                  hitDieFaces={hitDieFaces}
                  passivePerception={passivePerception}
                  classSaveProficiencies={classSaveProficiencies}
                  allProficientSkills={allProficientSkills}
                  weaponAttacks={weaponAttacks}
                  allDisplayTools={allDisplayTools}
                  formattedSpells={formattedSpells}
                  spellSaveDC={spellSaveDC}
                  spellAttackBonus={spellAttackBonus}
                  primaryStatKey={primaryStatKey}
                  featName={featName}
                />
              </div>
            </div>
          </div>
        )}

        {/* 1. ABILITY SCORES, SAVES & SKILLS */}
        {(activeTab === 'all' || activeTab === 'combat') && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column 1: Abilities & Saving Throws (5 cols) */}
            <div className="md:col-span-5 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Ability Scores & Saving Throws
              </h3>
              <div className="grid grid-cols-2 gap-2">
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
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                          {ABILITY_LABELS[k].name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Score: {score}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block">Save</span>
                          <span className={`text-xs font-bold ${isSaveProf ? 'text-amber-400 print:text-amber-700' : 'text-slate-400'}`}>
                            {formatModifier(saveBonus)} {isSaveProf && '★'}
                          </span>
                        </div>
                        <div className="w-10 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-sm font-black text-amber-200 font-serif print:bg-white print:border-slate-400 print:text-black">
                          {formatModifier(mod)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Skills List (7 cols) */}
            <div className="md:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Skills & Proficiencies
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  ★ Expertise (Double PB) • ✓ Proficient
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                      <div className="flex items-center gap-1.5 capitalize truncate">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                          isExpertise
                            ? 'bg-amber-400 border-amber-300 text-slate-950'
                            : isProf
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'border-slate-700 text-transparent'
                        }`}>
                          {isExpertise ? '★' : isProf ? '✓' : ''}
                        </span>
                        <span className="truncate">{skill}</span>
                        {isExpertise && (
                          <span className="text-[8px] uppercase font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                            Exp
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-normal uppercase shrink-0">({statKey})</span>
                      </div>
                      <span className="font-mono font-bold shrink-0">{formatModifier(totalSkillMod)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. WEAPON ATTACKS & WEAPON MASTERIES (Full Detailed Section) */}
        {(activeTab === 'all' || activeTab === 'combat') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 print:bg-slate-50 print:border-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Sword className="w-4 h-4 text-amber-500" />
                  Weapons & 2024 Weapon Masteries
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed attack statistics, damage calculations, and martial mastery rule explanations.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                {weaponAttacks.length} Masteries Active
              </span>
            </div>

            {weaponAttacks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {weaponAttacks.map((wp) => {
                  const isExp = expandedMasteries[wp.name] ?? true;

                  return (
                    <div
                      key={wp.name}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition shadow-sm space-y-3"
                    >
                      <div>
                        {/* Weapon Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-850 pb-2">
                          <div>
                            <h4 className="font-serif font-bold text-base text-slate-100 flex items-center gap-1.5">
                              <Sword className="w-4 h-4 text-amber-400 shrink-0" /> {wp.name}
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {wp.rangeStr} • {wp.statUsed} Based
                            </span>
                          </div>

                          {wp.masteryName && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider">
                              {wp.masteryName}
                            </span>
                          )}
                        </div>

                        {/* Combat Numbers (To-Hit & Damage) */}
                        <div className="grid grid-cols-2 gap-2 my-3 text-center">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Attack Roll</span>
                            <span className="text-lg font-black text-amber-300 font-mono">
                              {formatModifier(wp.attackBonus)}
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Damage</span>
                            <span className="text-xs font-bold text-slate-100 mt-1 block">
                              {wp.damageString}
                            </span>
                          </div>
                        </div>

                        {/* Weapon Properties */}
                        {wp.properties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {wp.properties.map((prop: string) => (
                              <span key={prop} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                {prop}
                              </span>
                            ))}
                            {wp.isVersatile && wp.versatileDmg && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                                2H: {wp.versatileDmg}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Weapon Mastery Property Card with Rule Description */}
                        {wp.masteryName && (
                          <div className="pt-2 border-t border-slate-850">
                            <button
                              type="button"
                              onClick={() => toggleMasteryExpand(wp.name)}
                              className="w-full flex items-center justify-between text-left text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Mastery: {wp.masteryName}
                              </span>
                              {isExp ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                            </button>

                            {isExp && (
                              <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5 p-2 rounded bg-slate-900/60 border border-slate-850">
                                {wp.masteryDescription || `Grants the ${wp.masteryName} mastery benefit on hit.`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No weapon masteries active for this character level.</p>
            )}
          </div>
        )}

        {/* 3. DEDICATED GRIMOIRE / SPELLBOOK SECTION */}
        {(activeTab === 'all' || activeTab === 'spells') && allDisplaySpells.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 print:bg-slate-50 print:border-slate-300">
            {/* Header with Search and Expand Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Spellbook & Known Magic ({formattedSpells.length} Spells)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full rules, casting times, ranges, components, and magical descriptions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={spellSearch}
                    onChange={(e) => setSpellSearch(e.target.value)}
                    placeholder="Search spells..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none w-44"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleToggleAllSpells}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition cursor-pointer"
                >
                  {allSpellsExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {/* Cantrips (Level 0) */}
            {cantrips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Cantrips (At-Will • Level 0)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cantrips.map((sp) => {
                    const expanded = isSpellExpanded(sp.name);
                    const colorClass = SCHOOL_COLORS[sp.schoolName] || 'text-slate-300 bg-slate-900 border-slate-800';

                    return (
                      <div
                        key={sp.name}
                        className="rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-sm"
                      >
                        <div
                          onClick={() => toggleSpellExpand(sp.name)}
                          className="p-3.5 flex items-center justify-between cursor-pointer bg-slate-950/80 hover:bg-slate-900/60 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-serif font-bold text-sm text-slate-100">{sp.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
                              {sp.schoolName}
                            </span>
                            {sp.isRitual && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/50 text-amber-300 border border-amber-800/40">
                                Ritual
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">{sp.time} • {sp.range}</span>
                            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {expanded && (
                          <div className="p-3.5 pt-0 space-y-2.5 text-xs border-t border-slate-850">
                            {/* Meta pills */}
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-2.5">
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Clock className="w-3 h-3 text-amber-400" /> {sp.time}
                              </span>
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Crosshair className="w-3 h-3 text-blue-400" /> {sp.range}
                              </span>
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Sparkles className="w-3 h-3 text-purple-400" /> {sp.duration}
                              </span>
                              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400">
                                {sp.components}
                              </span>
                            </div>

                            {/* Full Description */}
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-850 text-slate-200 leading-relaxed text-[11px] whitespace-pre-line">
                              {sp.description}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1st-Level Spells */}
            {leveledSpells.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-850">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  1st-Level Spells (Spell Slots)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {leveledSpells.map((sp) => {
                    const expanded = isSpellExpanded(sp.name);
                    const colorClass = SCHOOL_COLORS[sp.schoolName] || 'text-slate-300 bg-slate-900 border-slate-800';

                    return (
                      <div
                        key={sp.name}
                        className="rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition overflow-hidden shadow-sm"
                      >
                        <div
                          onClick={() => toggleSpellExpand(sp.name)}
                          className="p-3.5 flex items-center justify-between cursor-pointer bg-slate-950/80 hover:bg-slate-900/60 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-serif font-bold text-sm text-slate-100">{sp.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
                              {sp.schoolName}
                            </span>
                            {sp.isConcentration && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/50 text-amber-300 border border-amber-800/40">
                                Conc.
                              </span>
                            )}
                            {sp.isRitual && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/50 text-purple-300 border border-purple-800/40">
                                Ritual
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">{sp.time} • {sp.range}</span>
                            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>

                        {expanded && (
                          <div className="p-3.5 pt-0 space-y-2.5 text-xs border-t border-slate-850">
                            {/* Meta pills */}
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 pt-2.5">
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Clock className="w-3 h-3 text-amber-400" /> {sp.time}
                              </span>
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Crosshair className="w-3 h-3 text-blue-400" /> {sp.range}
                              </span>
                              <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                <Sparkles className="w-3 h-3 text-purple-400" /> {sp.duration}
                              </span>
                              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400">
                                {sp.components}
                              </span>
                            </div>

                            {/* Full Description */}
                            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-850 text-slate-200 leading-relaxed text-[11px] whitespace-pre-line">
                              {sp.description}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. FEATURES, FEATS, ANCESTRY & TOOLS */}
        {(activeTab === 'all' || activeTab === 'features') && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Features, Feats & Heritage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fighter Fighting Style */}
              {fightingStyle && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5" /> Fighting Style: {fightingStyle}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {FIGHTING_STYLES.find(f => f.name === fightingStyle)?.description || 'Martial combat technique.'}
                  </p>
                </div>
              )}

              {/* Cleric Divine Order */}
              {state.classChoices?.divineOrder && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Divine Order: {state.classChoices.divineOrder}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {state.classChoices.divineOrder === 'Protector'
                      ? 'Trained for martial combat. You gain proficiency with Martial weapons and Heavy armor.'
                      : 'Attuned to sacred lore. You gain one extra Cleric cantrip and add your Wisdom modifier to Arcana and Religion checks.'}
                  </p>
                </div>
              )}

              {/* Druid Primal Order */}
              {state.classChoices?.primalOrder && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Primal Order: {state.classChoices.primalOrder}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {state.classChoices.primalOrder === 'Magician'
                      ? 'Deeply attuned to nature magic. You gain one extra Druid cantrip and add your Wisdom modifier to Arcana and Nature checks.'
                      : 'Guardian of the wilds. You gain proficiency with Martial weapons and Medium armor.'}
                  </p>
                </div>
              )}

              {/* Warlock Eldritch Invocation */}
              {state.classChoices?.eldritchInvocation && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" /> Eldritch Invocation: {state.classChoices.eldritchInvocation}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {WARLOCK_INVOCATIONS_LVL1.find(i => i.name === state.classChoices?.eldritchInvocation)?.description || 'Forbidden knowledge granting supernatural power.'}
                  </p>
                </div>
              )}

              {/* Species Lineage & Ancestry Feature */}
              {lineageName && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Ancestry: {lineageName}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Innate supernatural traits and benefits granted by your {speciesName} heritage ({lineageName}).
                  </p>
                </div>
              )}

              {/* Origin Feat */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Origin Feat: {featName}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                  {originFeatObj ? extractEntriesText(originFeatObj.entries) : 'Granted by your background.'}
                </p>
                {state.backgroundFeatChoices && (
                  <div className="text-xs text-amber-300 font-semibold space-y-0.5 pt-2 border-t border-slate-850">
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
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Human Feat: {humanOriginFeatName}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    {(() => {
                      const extraFeat = getFeatByName(humanOriginFeatName);
                      return extraFeat ? extractEntriesText(extraFeat.entries) : 'Granted by Human Versatility.';
                    })()}
                  </p>
                  {state.speciesChoices?.humanFeatChoices && (
                    <div className="text-xs text-amber-300 font-semibold space-y-0.5 pt-2 border-t border-slate-850">
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
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-300">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" /> Tool & Instrument Proficiencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {allDisplayTools.map((t) => (
                      <span key={t} className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200 capitalize">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. INVENTORY & EQUIPMENT SECTION */}
        {(activeTab === 'all' || activeTab === 'inventory') && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 print:bg-slate-50 print:border-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  Equipment, Inventory & Coin Purse
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Carried adventuring gear, equipped armor, weapons, and wealth.
                </p>
              </div>

              {/* Coin Purse Badges */}
              <div className="flex items-center gap-2 text-xs font-bold font-mono">
                <span className="px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {state.inventory?.currency?.gp ?? 15} GP
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  {state.inventory?.currency?.sp ?? 0} SP
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-700">
                  {state.inventory?.currency?.cp ?? 0} CP
                </span>
              </div>
            </div>

            {/* Equipped Armor & Shield Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Armor</span>
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  {acCalculation.armorName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Shield</span>
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {acCalculation.hasShield ? 'Shield (+2 AC Equipped)' : 'None Equipped'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total AC Breakdown</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  Base: {acCalculation.baseAC} {acCalculation.hasShield && '+ Shield (2)'} {acCalculation.defenseBonus > 0 && '+ Defense (1)'} = {acCalculation.totalAC} AC
                </span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
              {(state.inventory?.items && state.inventory.items.length > 0) ? (
                state.inventory.items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      it.equipped
                        ? 'bg-amber-950/20 border-amber-500/50 text-amber-100'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-semibold block truncate">{it.name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {it.category} {it.equipped && '• Equipped'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] font-bold shrink-0">
                      x{it.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2 col-span-full">No equipment recorded yet. Visit the Equipment step to configure starting packages.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Dedicated Printable Sheet (Rendered during window.print()) */}
    <div className="hidden print:block dnd-print-sheet">
      <PrintableCharacterSheet
        state={state}
        totalScores={totalScores}
        mods={mods}
        profBonus={profBonus}
        ac={ac}
        acCalculation={acCalculation}
        maxHP={maxHP}
        speed={speed}
        hitDieFaces={hitDieFaces}
        passivePerception={passivePerception}
        classSaveProficiencies={classSaveProficiencies}
        allProficientSkills={allProficientSkills}
        weaponAttacks={weaponAttacks}
        allDisplayTools={allDisplayTools}
        formattedSpells={formattedSpells}
        spellSaveDC={spellSaveDC}
        spellAttackBonus={spellAttackBonus}
        primaryStatKey={primaryStatKey}
        featName={featName}
      />
    </div>
  </>
);
};
