import React, { useState } from 'react';
import type { CharacterSheetState } from '../types/character';
import { ALL_CLASSES, ALL_SUBCLASSES, getWeaponMasteriesForClass } from '../utils/dataLoader';
import { Shield, Sparkles, Sword, Heart, Zap, Check, ChevronRight } from 'lucide-react';

interface StepClassProps {
  state: CharacterSheetState;
  onSelectClass: (cls: any) => void;
  onSelectSubclass: (sc: any) => void;
  onToggleSkill: (skill: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepClass: React.FC<StepClassProps> = ({
  state,
  onSelectClass,
  onSelectSubclass,
  onToggleSkill,
  onNext,
  onBack,
}) => {
  const [subclassSourceFilter, setSubclassSourceFilter] = useState<string>('ALL');
  const selectedClass = state.selectedClass;
  const level = state.concept.level;
  
  // Available modern subclasses for the selected class
  const availableSubclasses = selectedClass
    ? ALL_SUBCLASSES.filter(sc => sc.className.toLowerCase() === selectedClass.name.toLowerCase())
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

  // Skill choices for starting class
  const classSkillsConfig = selectedClass?.startingProficiencies?.skills?.[0]?.choose;
  const allowedSkills: string[] = classSkillsConfig?.from || [];
  const maxSkillsAllowed: number = classSkillsConfig?.count || 2;

  // Selected skills that belong to the class options
  const selectedClassSkills = state.selectedSkills.filter(s => allowedSkills.includes(s));

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-500" />
          Choose Your Class ({ALL_CLASSES.length} Modern Classes)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          12 Revised 2024 Core Classes (XPHB) plus the <strong>Artificer (TCE)</strong>, with 110 modern subclasses (Legacy 2014 content excluded).
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

      {/* Selected Class Details & Subclass / Skills */}
      {selectedClass && (
        <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">Class Customization</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">{selectedClass.name} Details</h3>
            </div>
            {level >= 3 && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                Level {level}: {availableSubclasses.length} Modern Subclasses
              </span>
            )}
          </div>

          {/* Subclass Selection (Unlocked at Level 3) */}
          {level >= 3 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Select Subclass ({filteredSubclasses.length} shown)
                </label>

                {/* Subclass Source Filter Tabs (Legacy excluded) */}
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

          {/* Skill Proficiency Choices */}
          {allowedSkills.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-200">
                  Select {maxSkillsAllowed} Class Skills
                </label>
                <span className={`text-xs font-medium ${selectedClassSkills.length === maxSkillsAllowed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedClassSkills.length} / {maxSkillsAllowed} selected
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {allowedSkills.map((sk) => {
                  const isChecked = state.selectedSkills.includes(sk);
                  const isFull = selectedClassSkills.length >= maxSkillsAllowed && !isChecked;

                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={isFull}
                      onClick={() => onToggleSkill(sk)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-600/30 border-amber-500 text-amber-100 font-bold'
                          : isFull
                          ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{sk}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-amber-400" />}
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
