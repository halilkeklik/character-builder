import React from 'react';
import type { CharacterSheetState, AbilityKey, AbilityScores } from '../types/character';
import { ABILITY_LABELS, formatModifier, SKILL_ABILITY_MAP } from '../utils/dndRules';

interface PrintableCharacterSheetProps {
  state: CharacterSheetState;
  totalScores: AbilityScores;
  mods: Record<AbilityKey, number>;
  profBonus: number;
  ac: number;
  acCalculation: any;
  maxHP: number;
  speed: number;
  hitDieFaces: number;
  passivePerception: number;
  classSaveProficiencies: string[];
  allProficientSkills: string[];
  weaponAttacks: any[];
  allDisplayTools: string[];
  formattedSpells: any[];
  spellSaveDC: number;
  spellAttackBonus: number;
  primaryStatKey: AbilityKey;
  featName: string;
}

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const PrintableCharacterSheet: React.FC<PrintableCharacterSheetProps> = ({
  state,
  totalScores,
  mods,
  profBonus,
  ac,
  acCalculation,
  maxHP,
  speed,
  hitDieFaces,
  passivePerception,
  classSaveProficiencies,
  allProficientSkills,
  weaponAttacks,
  allDisplayTools,
  formattedSpells,
  spellSaveDC,
  spellAttackBonus,
  primaryStatKey,
  featName,
}) => {
  const level = state.concept.level || 1;
  const className = state.selectedClass?.name || 'Hero';
  const subclassName = state.selectedSubclass?.name;
  const speciesName = state.selectedSpecies?.name || 'Human';
  const lineageName = state.speciesChoices?.lineage;
  const backgroundName = state.selectedBackground?.name || 'Adventurer';

  // Sort skills alphabetically
  const skillEntries = Object.entries(SKILL_ABILITY_MAP).sort(([a], [b]) => a.localeCompare(b));

  const cantrips = formattedSpells.filter(s => s.level === 0);
  const leveledSpells = formattedSpells.filter(s => s.level > 0);
  const hasSpells = formattedSpells.length > 0;

  const equippedItems = (state.inventory?.items || []).filter(i => i.equipped);
  const otherItems = (state.inventory?.items || []).filter(i => !i.equipped);
  const currency = state.inventory?.currency || { gp: 10, sp: 0, cp: 0 };

  return (
    <div className="text-black bg-white font-sans text-xs leading-tight w-full max-w-[210mm] mx-auto p-2">
      {/* ================= PAGE 1 ================= */}
      <div className="print-page border-2 border-black rounded-lg p-3 space-y-3 bg-white">
        {/* Top Header Banner */}
        <div className="border-2 border-black rounded-md p-2 grid grid-cols-12 gap-2 items-center bg-gray-50">
          {/* Character Name Box */}
          <div className="col-span-5 border-r border-black pr-2">
            <div className="text-xl font-serif font-black tracking-wide truncate">
              {state.concept.name || 'Hero of the Realm'}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600 mt-0.5">
              Character Name
            </div>
          </div>

          {/* Character Meta Fields */}
          <div className="col-span-7 grid grid-cols-3 gap-x-2 gap-y-1 text-[11px]">
            <div>
              <div className="font-bold truncate">
                {className} {level} {subclassName ? `(${subclassName})` : ''}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Class & Level</div>
            </div>
            <div>
              <div className="font-bold truncate">{backgroundName}</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Background</div>
            </div>
            <div>
              <div className="font-bold truncate">Player</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Player Name</div>
            </div>
            <div>
              <div className="font-bold truncate">
                {speciesName} {lineageName ? `(${lineageName})` : ''}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Species / Lineage</div>
            </div>
            <div>
              <div className="font-bold truncate">{state.concept.alignment || 'Neutral'}</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Alignment</div>
            </div>
            <div>
              <div className="font-bold truncate">0 XP (Level 1)</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-gray-600">Experience Points</div>
            </div>
          </div>
        </div>

        {/* 3-Column Core Sheet Layout */}
        <div className="grid grid-cols-12 gap-2.5 items-start">
          {/* ----------------- COLUMN 1: Stats, Saves, Skills (4 cols) ----------------- */}
          <div className="col-span-4 space-y-2">
            {/* Inspiration & Proficiency Bonus */}
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="border border-black rounded p-1 flex items-center justify-center gap-1.5 bg-gray-50">
                <span className="w-3.5 h-3.5 rounded-full border border-black inline-block" />
                <span className="text-[9px] font-bold uppercase">Inspiration</span>
              </div>
              <div className="border border-black rounded p-1 flex items-center justify-center gap-1.5 bg-gray-50">
                <span className="text-sm font-black font-serif">+{profBonus}</span>
                <span className="text-[9px] font-bold uppercase">Proficiency</span>
              </div>
            </div>

            {/* 6 Ability Scores & Saving Throws Row/Grid */}
            <div className="border border-black rounded p-1.5 space-y-1">
              <div className="text-[9px] font-serif font-black uppercase text-center border-b border-black pb-0.5 tracking-wider">
                Ability Scores & Saving Throws
              </div>
              <div className="grid grid-cols-3 gap-1">
                {ABILITY_KEYS.map((k) => {
                  const score = totalScores[k];
                  const mod = mods[k];
                  const isSaveProf = classSaveProficiencies.includes(k);
                  const saveVal = mod + (isSaveProf ? profBonus : 0);

                  return (
                    <div key={k} className="border border-black rounded p-1 text-center bg-gray-50/50">
                      <div className="text-[8px] font-bold uppercase tracking-wider text-gray-700">
                        {ABILITY_LABELS[k].short}
                      </div>
                      <div className="text-base font-serif font-black">
                        {formatModifier(mod)}
                      </div>
                      <div className="text-[9px] font-bold border-t border-gray-300 pt-0.5 text-gray-600">
                        {score}
                      </div>
                      <div className="text-[8px] font-semibold flex items-center justify-center gap-0.5 mt-0.5 text-black">
                        <span className={`w-2 h-2 rounded-full border border-black inline-block ${isSaveProf ? 'bg-black' : 'bg-white'}`} />
                        <span>Save {formatModifier(saveVal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 18 Skills Box */}
            <div className="border border-black rounded p-1.5 space-y-0.5">
              <div className="text-[9px] font-serif font-black uppercase text-center border-b border-black pb-0.5 tracking-wider">
                Skills
              </div>
              <div className="space-y-0.5 text-[10px] pt-0.5">
                {skillEntries.map(([skillName, statKey]) => {
                  const isProf = allProficientSkills.includes(skillName.toLowerCase());
                  const mod = mods[statKey] + (isProf ? profBonus : 0);
                  const statLabel = ABILITY_LABELS[statKey].short;

                  return (
                    <div key={skillName} className="flex items-center justify-between px-0.5 leading-none py-0.5">
                      <div className="flex items-center gap-1 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full border border-black inline-block flex-shrink-0 ${isProf ? 'bg-black' : 'bg-white'}`} />
                        <span className="font-serif font-bold w-5 text-right flex-shrink-0">
                          {formatModifier(mod)}
                        </span>
                        <span className="capitalize truncate">{skillName}</span>
                      </div>
                      <span className="text-[8px] text-gray-500 uppercase flex-shrink-0">
                        ({statLabel})
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[7px] text-center text-gray-500 pt-0.5 border-t border-gray-200">
                ● = Proficient with skill
              </div>
            </div>

            {/* Passive Senses */}
            <div className="border border-black rounded p-1.5 flex items-center justify-between bg-gray-50 text-[10px]">
              <span className="text-[9px] font-bold uppercase tracking-wider">Passive Perception</span>
              <span className="text-sm font-black font-serif px-2 py-0.5 border border-black rounded bg-white">
                {passivePerception}
              </span>
            </div>

            {/* Other Proficiencies & Languages */}
            <div className="border border-black rounded p-1.5 space-y-1 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider">
                Proficiencies & Tools
              </div>
              <div>
                <span className="font-bold">Armor: </span>
                <span>{state.selectedClass?.armorProficiencies ? Object.keys(state.selectedClass.armorProficiencies[0] || {}).join(', ') : 'None'}</span>
              </div>
              <div>
                <span className="font-bold">Weapons: </span>
                <span>Simple, Martial Weapons</span>
              </div>
              <div>
                <span className="font-bold">Tools & Kits: </span>
                <span>{allDisplayTools.length > 0 ? allDisplayTools.join(', ') : 'None'}</span>
              </div>
              <div>
                <span className="font-bold">Languages: </span>
                <span>Common, Plus Heritage Language</span>
              </div>
            </div>
          </div>

          {/* ----------------- COLUMN 2: Combat Vitals, Attacks, Gear (4.5 cols) ----------------- */}
          <div className="col-span-4 space-y-2">
            {/* Armor Class, Initiative, Speed */}
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="border-2 border-black rounded-lg p-1 bg-gray-50">
                <div className="text-[8px] font-bold uppercase tracking-wider text-gray-700">Armor Class</div>
                <div className="text-xl font-serif font-black leading-tight">{ac}</div>
                <div className="text-[8px] text-gray-600 truncate">{acCalculation.baseName}</div>
              </div>
              <div className="border border-black rounded-lg p-1 bg-gray-50">
                <div className="text-[8px] font-bold uppercase tracking-wider text-gray-700">Initiative</div>
                <div className="text-xl font-serif font-black leading-tight">{formatModifier(mods.dex)}</div>
                <div className="text-[8px] text-gray-600">DEX Mod</div>
              </div>
              <div className="border border-black rounded-lg p-1 bg-gray-50">
                <div className="text-[8px] font-bold uppercase tracking-wider text-gray-700">Speed</div>
                <div className="text-xl font-serif font-black leading-tight">{speed} ft</div>
                <div className="text-[8px] text-gray-600">Base Walk</div>
              </div>
            </div>

            {/* Hit Points Box */}
            <div className="border-2 border-black rounded-lg p-1.5 space-y-1 bg-white">
              <div className="flex items-center justify-between text-[9px] border-b border-black pb-0.5">
                <span className="font-bold uppercase tracking-wider text-gray-700">Hit Point Maximum</span>
                <span className="font-serif font-black text-sm">{maxHP}</span>
              </div>
              <div className="py-2 text-center text-gray-300 text-xs italic font-serif">
                Current Hit Points [ _____ / {maxHP} ]
              </div>
              <div className="border-t border-gray-300 pt-1 text-[8px] text-gray-600 flex justify-between">
                <span>Temporary HP: [ ____________ ]</span>
                <span>Die: d{hitDieFaces}</span>
              </div>
            </div>

            {/* Hit Dice & Death Saves */}
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div className="border border-black rounded p-1 space-y-0.5">
                <div className="font-bold uppercase tracking-wider text-gray-700">Hit Dice</div>
                <div className="text-xs font-serif font-black">{level}d{hitDieFaces}</div>
                <div className="text-[8px] text-gray-500">Remaining: [ ___ ]</div>
              </div>
              <div className="border border-black rounded p-1 space-y-0.5">
                <div className="font-bold uppercase tracking-wider text-gray-700">Death Saves</div>
                <div className="text-[8px] flex items-center justify-between">
                  <span>Success:</span>
                  <span>○ ○ ○</span>
                </div>
                <div className="text-[8px] flex items-center justify-between">
                  <span>Failure:</span>
                  <span>○ ○ ○</span>
                </div>
              </div>
            </div>

            {/* Attacks & Weapon Mastery Box */}
            <div className="border-2 border-black rounded-lg p-1.5 space-y-1">
              <div className="font-serif font-black uppercase text-[9px] border-b border-black pb-0.5 tracking-wider flex justify-between items-center">
                <span>Attacks & Weapon Mastery</span>
                <span className="text-[8px] font-sans text-gray-600">PB +{profBonus}</span>
              </div>
              
              <table className="w-full text-[9px] border-collapse">
                <thead>
                  <tr className="border-b border-black text-gray-600 text-left text-[8px]">
                    <th className="py-0.5 font-bold">NAME</th>
                    <th className="py-0.5 font-bold text-center">ATK</th>
                    <th className="py-0.5 font-bold">DAMAGE/TYPE</th>
                    <th className="py-0.5 font-bold">MASTERY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {weaponAttacks.map((wp) => (
                    <tr key={wp.name} className="leading-tight">
                      <td className="py-0.5 font-bold truncate max-w-[70px]">{wp.name}</td>
                      <td className="py-0.5 text-center font-serif font-black text-[10px]">
                        {formatModifier(wp.attackBonus)}
                      </td>
                      <td className="py-0.5 font-medium">{wp.damageString}</td>
                      <td className="py-0.5 font-bold text-black">{wp.masteryName || '—'}</td>
                    </tr>
                  ))}
                  <tr className="leading-tight text-gray-600">
                    <td className="py-0.5 font-bold">Unarmed</td>
                    <td className="py-0.5 text-center font-serif font-black text-[10px]">
                      {formatModifier(profBonus + mods.str)}
                    </td>
                    <td className="py-0.5">1 + {mods.str} Bludgeoning</td>
                    <td className="py-0.5">Push/Slow</td>
                  </tr>
                </tbody>
              </table>

              {/* Weapon Mastery Notes Brief */}
              <div className="border-t border-gray-300 pt-1 space-y-0.5 text-[8px] text-gray-700">
                {weaponAttacks.filter(w => w.masteryName).map(w => (
                  <div key={w.name} className="truncate">
                    <span className="font-bold text-black">{w.masteryName}:</span> {w.masteryDescription}
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment & Currency Purse */}
            <div className="border border-black rounded p-1.5 space-y-1 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider flex justify-between">
                <span>Equipment & Wealth</span>
                <span className="font-sans font-bold">GP: {currency.gp} | SP: {currency.sp} | CP: {currency.cp}</span>
              </div>
              <div className="space-y-0.5 text-[8.5px] max-h-28 overflow-hidden">
                {equippedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-black font-semibold">
                    <span className="truncate">✦ {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                    <span className="text-[7.5px] uppercase text-gray-600 font-bold ml-1">{item.category}</span>
                  </div>
                ))}
                {otherItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-gray-700">
                    <span className="truncate">• {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                  </div>
                ))}
                {otherItems.length > 6 && (
                  <div className="text-[8px] italic text-gray-500">
                    + {otherItems.length - 6} more adventuring items (see Page 2)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ----------------- COLUMN 3: Features & Lore (3.5 cols) ----------------- */}
          <div className="col-span-4 space-y-2">
            {/* Personality & Character Concept */}
            <div className="border border-black rounded p-1.5 space-y-0.5 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider">
                Character Concept & Notes
              </div>
              <div className="text-gray-700 text-[8.5px] italic line-clamp-3">
                "{state.concept.notes || 'A brave adventurer forging their legend in the realm.'}"
              </div>
            </div>

            {/* Class Features Box */}
            <div className="border border-black rounded p-1.5 space-y-1 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider">
                Class Features (Level {level})
              </div>
              <div className="space-y-1 text-[8.5px] leading-snug">
                {state.classChoices?.fightingStyle && (
                  <div>
                    <span className="font-bold text-black">Fighting Style: {state.classChoices.fightingStyle}. </span>
                    <span className="text-gray-700">Specialized martial combat expertise.</span>
                  </div>
                )}
                {state.classChoices?.divineOrder && (
                  <div>
                    <span className="font-bold text-black">Divine Order: {state.classChoices.divineOrder}. </span>
                    <span className="text-gray-700">
                      {state.classChoices.divineOrder === 'Protector' ? 'Martial weapons and Heavy armor proficiency.' : 'Bonus sacred cantrip and Wisdom bonus to Arcana/Religion.'}
                    </span>
                  </div>
                )}
                {state.classChoices?.primalOrder && (
                  <div>
                    <span className="font-bold text-black">Primal Order: {state.classChoices.primalOrder}. </span>
                    <span className="text-gray-700">
                      {state.classChoices.primalOrder === 'Magician' ? 'Bonus primal cantrip and Wisdom bonus to Arcana/Nature.' : 'Medium armor and Martial weapon proficiency.'}
                    </span>
                  </div>
                )}
                {state.classChoices?.eldritchInvocation && (
                  <div>
                    <span className="font-bold text-black">Invocation: {state.classChoices.eldritchInvocation}. </span>
                    <span className="text-gray-700">Forbidden eldritch knowledge from your patron.</span>
                  </div>
                )}
                {state.selectedWeaponMasteries.length > 0 && (
                  <div>
                    <span className="font-bold text-black">Weapon Mastery: </span>
                    <span className="text-gray-700">{state.selectedWeaponMasteries.join(', ')}.</span>
                  </div>
                )}
                {className === 'Barbarian' && (
                  <div>
                    <span className="font-bold text-black">Rage & Unarmored Defense: </span>
                    <span className="text-gray-700">2 rages per long rest (+2 dmg, adv on STR checks). AC = 10 + DEX + CON.</span>
                  </div>
                )}
                {className === 'Rogue' && (
                  <div>
                    <span className="font-bold text-black">Sneak Attack (1d6) & Expertise: </span>
                    <span className="text-gray-700">Extra damage with finesse/ranged weapons; doubled proficiency in chosen skills.</span>
                  </div>
                )}
                {className === 'Paladin' && (
                  <div>
                    <span className="font-bold text-black">Lay on Hands & Spellcasting: </span>
                    <span className="text-gray-700">Healing pool equal to 5x Paladin level.</span>
                  </div>
                )}
                {className === 'Fighter' && (
                  <div>
                    <span className="font-bold text-black">Second Wind: </span>
                    <span className="text-gray-700">Regain 1d10 + Fighter level HP as a Bonus Action (2 uses).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Species Traits Box */}
            <div className="border border-black rounded p-1.5 space-y-1 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider">
                Species Traits ({speciesName})
              </div>
              <div className="space-y-0.5 text-[8.5px] leading-snug text-gray-700">
                {speciesName === 'Human' && (
                  <div>
                    <span className="font-bold text-black">Resourceful & Skillful: </span>
                    <span>Gain Heroic Inspiration after a Long Rest, plus extra skill proficiency.</span>
                  </div>
                )}
                {speciesName.toLowerCase().includes('dwarf') && (
                  <div>
                    <span className="font-bold text-black">Dwarven Resilience & Toughness: </span>
                    <span>Poison resistance, +1 HP per level, Darkvision 120 ft.</span>
                  </div>
                )}
                {speciesName.toLowerCase().includes('elf') && (
                  <div>
                    <span className="font-bold text-black">Keen Senses & Fey Ancestry: </span>
                    <span>Advantage against Charmed condition, Trance rest, Darkvision 60 ft.</span>
                  </div>
                )}
                {lineageName && (
                  <div>
                    <span className="font-bold text-black">Lineage: </span>
                    <span>{lineageName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Feats Box */}
            <div className="border border-black rounded p-1.5 space-y-1 text-[9px]">
              <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider">
                Feats & Special Training
              </div>
              <div className="space-y-1 text-[8.5px] leading-snug">
                <div>
                  <span className="font-bold text-black">Origin Feat: {featName}. </span>
                  <span className="text-gray-700">Granted by your {backgroundName} background.</span>
                </div>
                {state.speciesChoices?.humanOriginFeat && (
                  <div>
                    <span className="font-bold text-black">Human Versatility Feat: {state.speciesChoices.humanOriginFeat}. </span>
                    <span className="text-gray-700">Extra origin feat chosen at character creation.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 1 Notice */}
        <div className="border-t border-gray-300 pt-1 flex justify-between items-center text-[8px] text-gray-500">
          <span>D&D 2024 Character Builder • Printable Record Sheet</span>
          <span>Page 1 of {hasSpells || otherItems.length > 6 ? '2' : '1'}</span>
        </div>
      </div>

      {/* ================= PAGE 2: SPELLS & EXTENDED INVENTORY ================= */}
      {(hasSpells || otherItems.length > 6) && (
        <div className="print-page border-2 border-black rounded-lg p-3 space-y-3 bg-white mt-4">
          {/* Header Page 2 */}
          <div className="border-2 border-black rounded-md p-2 flex justify-between items-center bg-gray-50">
            <div>
              <div className="text-lg font-serif font-black tracking-wide">
                {state.concept.name || 'Hero'} — Spellbook & Inventory Manifest
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                {className} {level} • {speciesName} • {backgroundName}
              </div>
            </div>
            {hasSpells && (
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center px-2 py-0.5 border border-black rounded bg-white">
                  <span className="text-[8px] uppercase block font-bold text-gray-600">Ability</span>
                  <span className="font-serif font-black">{primaryStatKey.toUpperCase()}</span>
                </div>
                <div className="text-center px-2 py-0.5 border border-black rounded bg-white">
                  <span className="text-[8px] uppercase block font-bold text-gray-600">Save DC</span>
                  <span className="font-serif font-black">{spellSaveDC}</span>
                </div>
                <div className="text-center px-2 py-0.5 border border-black rounded bg-white">
                  <span className="text-[8px] uppercase block font-bold text-gray-600">Attack</span>
                  <span className="font-serif font-black">{formatModifier(spellAttackBonus)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Spellcasting Tables (if character has spells) */}
          {hasSpells && (
            <div className="space-y-3">
              {/* Cantrips */}
              {cantrips.length > 0 && (
                <div className="border border-black rounded p-2 space-y-1">
                  <div className="font-serif font-black uppercase text-[10px] border-b border-black pb-0.5 tracking-wider flex justify-between">
                    <span>Cantrips (0-Level Spells)</span>
                    <span className="text-[8px] font-sans text-gray-600">{cantrips.length} Known</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    {cantrips.map((sp) => (
                      <div key={sp.name} className="border border-gray-200 rounded p-1.5 bg-gray-50/50 space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-black font-serif text-[10px]">{sp.name}</span>
                          <span className="text-[8px] text-gray-500 uppercase">{sp.schoolName}</span>
                        </div>
                        <div className="text-[8px] text-gray-600 flex gap-2">
                          <span>⏱ {sp.time}</span>
                          <span>🎯 {sp.range}</span>
                          <span>📜 {sp.components}</span>
                        </div>
                        <div className="text-[8px] text-gray-700 line-clamp-2 leading-tight">
                          {sp.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1st-Level Spells */}
              {leveledSpells.length > 0 && (
                <div className="border border-black rounded p-2 space-y-1">
                  <div className="font-serif font-black uppercase text-[10px] border-b border-black pb-0.5 tracking-wider flex justify-between">
                    <span>Level 1 Spells (Spell Slots: Total 2 | Expended: ○ ○)</span>
                    <span className="text-[8px] font-sans text-gray-600">{leveledSpells.length} Prepared</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    {leveledSpells.map((sp) => (
                      <div key={sp.name} className="border border-gray-200 rounded p-1.5 bg-gray-50/50 space-y-0.5">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-black font-serif text-[10px]">☐ {sp.name}</span>
                          <span className="text-[8px] text-gray-500 uppercase">{sp.schoolName}</span>
                        </div>
                        <div className="text-[8px] text-gray-600 flex gap-2">
                          <span>⏱ {sp.time}</span>
                          <span>🎯 {sp.range}</span>
                          <span>⏳ {sp.duration}</span>
                        </div>
                        <div className="text-[8px] text-gray-700 line-clamp-3 leading-tight">
                          {sp.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete Inventory Breakdown */}
          <div className="border border-black rounded p-2 space-y-1.5 text-[9px]">
            <div className="font-serif font-black uppercase border-b border-black pb-0.5 tracking-wider flex justify-between items-center">
              <span>Complete Inventory & Equipment Manifest</span>
              <span className="font-sans text-[8px] font-bold">Total Items: {(state.inventory?.items || []).length}</span>
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-[8.5px]">
              {(state.inventory?.items || []).map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 py-0.5">
                  <span className={`truncate ${item.equipped ? 'font-bold text-black' : 'text-gray-700'}`}>
                    {item.equipped ? '✦ ' : '• '}{item.name}
                  </span>
                  <span className="text-[8px] text-gray-500 font-semibold ml-1">
                    x{item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Page 2 Notice */}
          <div className="border-t border-gray-300 pt-1 flex justify-between items-center text-[8px] text-gray-500">
            <span>D&D 2024 Character Builder • Printable Record Sheet</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      )}
    </div>
  );
};
