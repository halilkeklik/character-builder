import React, { useState } from 'react';
import type { CharacterSheetState, FeatChoiceData, BackgroundChoices } from '../types/character';
import { 
  ALL_BACKGROUNDS, 
  getBackgroundAllowedAbilities, 
  getFeatByName,
  GAMING_SETS,
  ARTISAN_TOOLS,
  MUSICAL_INSTRUMENTS,
  ALL_TOOLS
} from '../utils/dataLoader';
import { SKILL_ABILITY_MAP } from '../utils/dndRules';
import { extractEntriesText } from '../utils/tagParser';
import { FeatCustomizer } from './FeatCustomizer';
import { BookOpen, Sparkles, Award, Wrench, ChevronRight, Check, AlertTriangle, RotateCcw } from 'lucide-react';

interface StepBackgroundProps {
  state: CharacterSheetState;
  onSelectBackground: (bg: any) => void;
  onUpdateBackgroundChoices: (choices: Partial<BackgroundChoices>) => void;
  onUpdateBgFeatChoices: (choices: FeatChoiceData) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALL_18_SKILLS = Object.keys(SKILL_ABILITY_MAP);

export const StepBackground: React.FC<StepBackgroundProps> = ({
  state,
  onSelectBackground,
  onUpdateBackgroundChoices,
  onUpdateBgFeatChoices,
  onNext,
  onBack,
}) => {
  const [customizingSkill0, setCustomizingSkill0] = useState(false);
  const [customizingSkill1, setCustomizingSkill1] = useState(false);
  const [customizingTool, setCustomizingTool] = useState(false);

  const selectedBg = state.selectedBackground;
  const featRaw = selectedBg?.feats?.[0] ? Object.keys(selectedBg.feats[0])[0] : '';
  const featName = featRaw.split(';')[0].split('|')[0];

  // Skills already proficient from class, species, or previous feat choices
  const classSkills = state.selectedSkills.map(s => s.toLowerCase());
  const humanSkill = state.speciesChoices?.humanSkill ? [state.speciesChoices.humanSkill.toLowerCase()] : [];
  const humanSkilledFeat = (state.speciesChoices?.humanFeatChoices?.skills || []).map(s => s.toLowerCase());
  const knownOutsideBg = Array.from(new Set([...classSkills, ...humanSkill, ...humanSkilledFeat]));

  // Default skills from selected background
  const defaultSkills: string[] = selectedBg?.skillProficiencies?.[0]
    ? Object.keys(selectedBg.skillProficiencies[0])
    : [];
  const defaultSkill0 = defaultSkills[0] || '';
  const defaultSkill1 = defaultSkills[1] || '';

  // Currently active background skills (from state or default)
  const currentSkills = state.backgroundChoices?.skills || defaultSkills;
  const activeSkill0 = currentSkills[0] || defaultSkill0;
  const activeSkill1 = currentSkills[1] || defaultSkill1;

  // Check for skill overlaps with class / species
  const isSkill0Overlapping = !!activeSkill0 && knownOutsideBg.includes(activeSkill0.toLowerCase());
  const isSkill1Overlapping = !!activeSkill1 && knownOutsideBg.includes(activeSkill1.toLowerCase());
  const isDuplicateBetweenSlots = !!activeSkill0 && !!activeSkill1 && activeSkill0.toLowerCase() === activeSkill1.toLowerCase();
  const hasSkillOverlap = isSkill0Overlapping || isSkill1Overlapping || isDuplicateBetweenSlots;

  // Tools already proficient from class
  const className = state.selectedClass?.name;
  const classTools: string[] = [];
  if (className === 'Artificer') {
    classTools.push("thieves' tools", "tinker's tools");
    if (state.classChoices?.artisanTool) classTools.push(state.classChoices.artisanTool.toLowerCase());
  }
  if (className === 'Rogue') classTools.push("thieves' tools");
  if (className === 'Druid') classTools.push("herbalism kit");
  if (className === 'Bard' && state.classChoices?.instruments) {
    classTools.push(...state.classChoices.instruments.map(i => i.toLowerCase()));
  }
  if (className === 'Monk' && state.classChoices?.monkTool) {
    classTools.push(state.classChoices.monkTool.toLowerCase());
  }

  // Tool requirement analysis
  const rawToolObj = selectedBg?.toolProficiencies?.[0] || {};
  const rawToolKey = Object.keys(rawToolObj)[0] || '';
  const isAnyGaming = rawToolKey === 'anyGamingSet';
  const isAnyArtisan = rawToolKey === 'anyArtisansTool';
  const isAnyInstrument = rawToolKey === 'anyMusicalInstrument';
  const isFixedToolOverlapping = !rawToolKey.startsWith('any') && classTools.includes(rawToolKey.toLowerCase());

  const activeTool = state.backgroundChoices?.tool || (
    isAnyGaming ? 'Dice Set' :
    isAnyArtisan ? "Alchemist's Supplies" :
    isAnyInstrument ? 'Lute' :
    rawToolKey
  );

  const handleSkillChange = (slotIndex: 0 | 1, newSkill: string) => {
    const updated = [...currentSkills];
    updated[slotIndex] = newSkill;
    onUpdateBackgroundChoices({ skills: updated });
  };

  const handleResetSkill = (slotIndex: 0 | 1) => {
    const defaultForSlot = defaultSkills[slotIndex];
    if (defaultForSlot) {
      handleSkillChange(slotIndex, defaultForSlot);
    }
  };

  // Disabled skills for background origin feat customizer (e.g. Skilled feat)
  const currentBgSkillsLower = currentSkills.map(s => s.toLowerCase());
  const disabledForBgFeat = Array.from(new Set([...knownOutsideBg, ...currentBgSkillsLower]));

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          Choose Your Background (2024 Core)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          In D&D 2024, backgrounds provide your <strong>Ability Score Increases</strong>, an <strong>Origin Feat</strong>, 2 skill proficiencies, and 1 tool proficiency.
        </p>
      </div>

      {/* Grid of 16 Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {ALL_BACKGROUNDS.map((bg) => {
          const isSelected = selectedBg?.name === bg.name;
          const allowedStats = getBackgroundAllowedAbilities(bg).map(s => s.toUpperCase()).join(', ');
          
          const rawF = bg.feats?.[0] ? Object.keys(bg.feats[0])[0] : '';
          const fName = rawF.split(';')[0].split('|')[0];

          return (
            <div
              key={bg.name}
              onClick={() => onSelectBackground(bg)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-serif font-bold text-slate-100">{bg.name}</h3>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="text-[11px] text-amber-400/90 font-medium mb-2">
                  Stats: {allowedStats}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 text-slate-300 font-medium">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Feat: {fName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 capitalize">
                Skills: {bg.skillProficiencies?.[0] ? Object.keys(bg.skillProficiencies[0]).join(', ') : 'None'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Background Details */}
      {selectedBg && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Background Perks</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">{selectedBg.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ability Scores */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4" /> Allowed Ability Scores
              </span>
              <p className="text-xs text-slate-300 mb-2">
                Choose +2 / +1 or +1 / +1 / +1 among:
              </p>
              <div className="flex gap-2">
                {getBackgroundAllowedAbilities(selectedBg).map((stat) => (
                  <span
                    key={stat}
                    className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-xs font-bold uppercase"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>

            {/* Origin Feat */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4" /> Origin Feat Granted
              </span>
              {(() => {
                const featObj = getFeatByName(featName);
                return (
                  <div>
                    <h5 className="text-sm font-semibold text-slate-100">{featName}</h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3">
                      {featObj ? extractEntriesText(featObj.entries) : 'Granted by background.'}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* D&D Rule / Proficiency Overlap Section */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
            <div className="border-b border-slate-850 pb-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Background Skill & Tool Proficiencies
                </h4>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  D&D 5e / 2024 Overlap Rule
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                If your background grants a skill or tool proficiency you already gained from your Class or Species, 
                you can choose a <strong>different proficiency of the same kind</strong> so no proficiency is wasted (PHB p. 125).
              </p>
            </div>

            {/* 1. SKILL PROFICIENCIES */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Skill Proficiencies (2 Skills)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Slot 0 */}
                <div className={`p-4 rounded-xl border transition ${
                  isSkill0Overlapping || isDuplicateBetweenSlots
                    ? 'bg-amber-950/30 border-amber-500/70'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Skill 1: <strong className="text-amber-300 capitalize">{activeSkill0 || 'None'}</strong>
                    </span>
                    {activeSkill0 !== defaultSkill0 && (
                      <button
                        type="button"
                        onClick={() => handleResetSkill(0)}
                        title="Reset to default background skill"
                        className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>

                  {isSkill0Overlapping ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-1.5 text-xs text-amber-300 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>{activeSkill0}</strong> is already proficient from your Class/Species! Choose a replacement skill:
                        </span>
                      </div>
                      <select
                        value={activeSkill0}
                        onChange={(e) => handleSkillChange(0, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500 text-xs text-amber-100 font-bold focus:ring-1 focus:ring-amber-500 capitalize"
                      >
                        <option value="">Select Replacement Skill...</option>
                        {ALL_18_SKILLS.map((sk) => {
                          const isTaken = knownOutsideBg.includes(sk.toLowerCase()) || activeSkill1.toLowerCase() === sk.toLowerCase();
                          return (
                            <option key={sk} value={sk} disabled={isTaken}>
                              {sk} {isTaken ? '(Already Taken)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Default from {selectedBg.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomizingSkill0(!customizingSkill0)}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          {customizingSkill0 ? 'Close' : 'Change Skill'}
                        </button>
                      </div>

                      {customizingSkill0 && (
                        <div className="pt-2 border-t border-slate-800">
                          <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Choose custom skill:
                          </label>
                          <select
                            value={activeSkill0}
                            onChange={(e) => {
                              handleSkillChange(0, e.target.value);
                              setCustomizingSkill0(false);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 capitalize"
                          >
                            {ALL_18_SKILLS.map((sk) => {
                              const isTaken = (knownOutsideBg.includes(sk.toLowerCase()) || activeSkill1.toLowerCase() === sk.toLowerCase()) && sk.toLowerCase() !== activeSkill0.toLowerCase();
                              return (
                                <option key={sk} value={sk} disabled={isTaken}>
                                  {sk} {isTaken ? '(Already Taken)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Slot 1 */}
                <div className={`p-4 rounded-xl border transition ${
                  isSkill1Overlapping || isDuplicateBetweenSlots
                    ? 'bg-amber-950/30 border-amber-500/70'
                    : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Skill 2: <strong className="text-amber-300 capitalize">{activeSkill1 || 'None'}</strong>
                    </span>
                    {activeSkill1 !== defaultSkill1 && (
                      <button
                        type="button"
                        onClick={() => handleResetSkill(1)}
                        title="Reset to default background skill"
                        className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </button>
                    )}
                  </div>

                  {isSkill1Overlapping ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-1.5 text-xs text-amber-300 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>{activeSkill1}</strong> is already proficient from your Class/Species! Choose a replacement skill:
                        </span>
                      </div>
                      <select
                        value={activeSkill1}
                        onChange={(e) => handleSkillChange(1, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-500 text-xs text-amber-100 font-bold focus:ring-1 focus:ring-amber-500 capitalize"
                      >
                        <option value="">Select Replacement Skill...</option>
                        {ALL_18_SKILLS.map((sk) => {
                          const isTaken = knownOutsideBg.includes(sk.toLowerCase()) || activeSkill0.toLowerCase() === sk.toLowerCase();
                          return (
                            <option key={sk} value={sk} disabled={isTaken}>
                              {sk} {isTaken ? '(Already Taken)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Default from {selectedBg.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomizingSkill1(!customizingSkill1)}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          {customizingSkill1 ? 'Close' : 'Change Skill'}
                        </button>
                      </div>

                      {customizingSkill1 && (
                        <div className="pt-2 border-t border-slate-800">
                          <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Choose custom skill:
                          </label>
                          <select
                            value={activeSkill1}
                            onChange={(e) => {
                              handleSkillChange(1, e.target.value);
                              setCustomizingSkill1(false);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 capitalize"
                          >
                            {ALL_18_SKILLS.map((sk) => {
                              const isTaken = (knownOutsideBg.includes(sk.toLowerCase()) || activeSkill0.toLowerCase() === sk.toLowerCase()) && sk.toLowerCase() !== activeSkill1.toLowerCase();
                              return (
                                <option key={sk} value={sk} disabled={isTaken}>
                                  {sk} {isTaken ? '(Already Taken)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isDuplicateBetweenSlots && (
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Both background skill slots have selected the same skill. Please choose two distinct skills.
                </p>
              )}
            </div>

            {/* 2. TOOL PROFICIENCY */}
            <div className="space-y-3 pt-3 border-t border-slate-850">
              <label className="text-xs font-bold text-slate-300 block">
                Tool Proficiency (1 Tool)
              </label>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Selected Tool: <strong className="text-amber-300 capitalize">{activeTool}</strong>
                  </span>
                  {!isAnyGaming && !isAnyArtisan && !isAnyInstrument && !isFixedToolOverlapping && (
                    <button
                      type="button"
                      onClick={() => setCustomizingTool(!customizingTool)}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                    >
                      {customizingTool ? 'Keep Default' : 'Change Tool'}
                    </button>
                  )}
                </div>

                {isAnyGaming && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-400">
                      {selectedBg.name} grants proficiency with one Gaming Set of your choice:
                    </p>
                    <select
                      value={activeTool}
                      onChange={(e) => onUpdateBackgroundChoices({ tool: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                    >
                      {GAMING_SETS.map((gs) => (
                        <option key={gs} value={gs}>{gs}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isAnyArtisan && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-400">
                      {selectedBg.name} grants proficiency with one Artisan's Tool of your choice:
                    </p>
                    <select
                      value={activeTool}
                      onChange={(e) => onUpdateBackgroundChoices({ tool: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                    >
                      {ARTISAN_TOOLS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isAnyInstrument && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-400">
                      {selectedBg.name} grants proficiency with one Musical Instrument of your choice:
                    </p>
                    <select
                      value={activeTool}
                      onChange={(e) => onUpdateBackgroundChoices({ tool: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                    >
                      {MUSICAL_INSTRUMENTS.map((inst) => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>
                )}

                {isFixedToolOverlapping && (
                  <div className="space-y-2 bg-amber-950/30 p-3 rounded-lg border border-amber-500/50">
                    <div className="flex items-start gap-1.5 text-xs text-amber-300 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>{rawToolKey}</strong> is already gained from your Class ({className}). Choose a replacement tool:
                      </span>
                    </div>
                    <select
                      value={activeTool}
                      onChange={(e) => onUpdateBackgroundChoices({ tool: e.target.value })}
                      className="w-full sm:w-80 px-3 py-2 rounded-lg bg-slate-950 border border-amber-500 text-xs text-amber-100 font-bold focus:ring-1 focus:ring-amber-500 capitalize"
                    >
                      {ALL_TOOLS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {customizingTool && !isAnyGaming && !isAnyArtisan && !isAnyInstrument && !isFixedToolOverlapping && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Choose custom tool:
                    </label>
                    <select
                      value={activeTool}
                      onChange={(e) => {
                        onUpdateBackgroundChoices({ tool: e.target.value });
                        setCustomizingTool(false);
                      }}
                      className="w-full sm:w-80 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 capitalize"
                    >
                      {ALL_TOOLS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-choices for Background Origin Feat (e.g. Magic Initiate, Skilled, Crafter, Musician) */}
          {featName && (
            <FeatCustomizer
              featName={featName}
              data={state.backgroundFeatChoices || {}}
              onChange={onUpdateBgFeatChoices}
              titlePrefix="Background Origin Feat"
              disabledSkills={disabledForBgFeat}
            />
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
        >
          Back
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {hasSkillOverlap && (
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Resolve overlapping skills to continue
            </span>
          )}
          <button
            onClick={onNext}
            disabled={!selectedBg || hasSkillOverlap}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition cursor-pointer w-full sm:w-auto ${
              selectedBg && !hasSkillOverlap
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Next: Ability Scores</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
