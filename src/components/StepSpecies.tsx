import React from 'react';
import type { CharacterSheetState } from '../types/character';
import { ALL_SPECIES, ORIGIN_FEATS, SPECIES_CUSTOMIZATIONS } from '../utils/dataLoader';
import { extractEntriesText } from '../utils/tagParser';
import { SKILL_ABILITY_MAP } from '../utils/dndRules';
import { Dna, Eye, FastForward, Maximize2, ChevronRight, Check, Sparkles, Award } from 'lucide-react';

interface StepSpeciesProps {
  state: CharacterSheetState;
  onSelectSpecies: (sp: any) => void;
  onUpdateSpeciesChoices: (choices: Partial<NonNullable<CharacterSheetState['speciesChoices']>>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepSpecies: React.FC<StepSpeciesProps> = ({
  state,
  onSelectSpecies,
  onUpdateSpeciesChoices,
  onNext,
  onBack,
}) => {
  const selectedSpecies = state.selectedSpecies;
  const speciesName = selectedSpecies?.name || '';
  const customization = SPECIES_CUSTOMIZATIONS[speciesName];
  const choices = state.speciesChoices || {};
  const level = state.concept.level || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Dna className="w-6 h-6 text-amber-500" />
          Choose Your Species & Lineage
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Pick your ancestry, then customize your lineage, ancestral breath, giant boon, or human bonus feat.
        </p>
      </div>

      {/* Grid of 10 Species */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_SPECIES.map((sp) => {
          const isSelected = selectedSpecies?.name === sp.name;
          const size = Array.isArray(sp.size) ? sp.size.join(' or ') : sp.size || 'M';
          const speed = typeof sp.speed === 'object' ? sp.speed.walk : sp.speed || 30;

          return (
            <div
              key={sp.name}
              onClick={() => onSelectSpecies(sp)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-bold text-slate-100">{sp.name}</h3>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    Size: {size}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {speed} ft
                  </span>
                </div>
              </div>

              {sp.darkvision && (
                <div className="mt-3 text-[11px] text-amber-400/80 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Darkvision {sp.darkvision} ft
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Species Trait Choices (Lineage / Ancestry / Human Feat & Skill) */}
      {selectedSpecies && customization && (
        <div className="bg-slate-900/60 border-2 border-amber-500/50 rounded-xl p-6 space-y-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Species Customization Choice
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-100 mt-0.5">
                {customization.title} ({speciesName})
              </h3>
            </div>
            {choices.lineage && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                Selected: {choices.lineage}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">{customization.description}</p>

          {/* Lineage Radio Options (Elf, Gnome, Goliath, Tiefling, Dragonborn) */}
          {customization.type === 'lineage' && customization.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {customization.options.map((opt) => {
                const isOptSelected = choices.lineage === opt.name || choices.lineage === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => onUpdateSpeciesChoices({ lineage: opt.name })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isOptSelected
                        ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-sm ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold text-xs mb-1">
                        <span>{opt.name}</span>
                        {isOptSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-850 text-[10px] text-amber-400 font-semibold">
                      {isOptSelected ? '✓ Chosen Lineage' : 'Select'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Human Choices (Skillful & Versatile) */}
          {customization.type === 'human' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Extra Skill */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> 1. Skillful Trait (1 Extra Skill)
                </label>
                <p className="text-[11px] text-slate-400">
                  Humans gain proficiency in one additional skill of their choice.
                </p>
                <select
                  value={choices.humanSkill || ''}
                  onChange={(e) => onUpdateSpeciesChoices({ humanSkill: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 capitalize font-semibold focus:border-amber-500"
                >
                  <option value="">Select an Extra Skill</option>
                  {Object.keys(SKILL_ABILITY_MAP).map((skill) => (
                    <option key={skill} value={skill}>
                      {skill} ({SKILL_ABILITY_MAP[skill].toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Extra Origin Feat */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 2. Versatile Trait (1 Extra Origin Feat)
                </label>
                <p className="text-[11px] text-slate-400">
                  Humans gain an extra Origin Feat at 1st level.
                </p>
                <select
                  value={choices.humanOriginFeat || ''}
                  onChange={(e) => onUpdateSpeciesChoices({ humanOriginFeat: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold focus:border-amber-500"
                >
                  <option value="">Select an Extra Origin Feat</option>
                  {ORIGIN_FEATS.map((feat: any) => (
                    <option key={feat.name} value={feat.name}>
                      {feat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Aasimar Celestial Revelation (Level 3+) */}
          {customization.type === 'revelation' && (
            <div>
              {level >= 3 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {customization.options?.map((opt) => {
                    const isOptSelected = choices.aasimarRevelation === opt.name;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => onUpdateSpeciesChoices({ aasimarRevelation: opt.name })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          isOptSelected
                            ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-sm ring-1 ring-amber-500'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs mb-1">
                          <span>{opt.name}</span>
                          {isOptSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400">
                  Celestial Revelation unlocks when your character reaches <strong>Level 3</strong>. (Current Level: {level})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Species Traits Details */}
      {selectedSpecies && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">All Species Traits</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">{selectedSpecies.name}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                Size: {Array.isArray(selectedSpecies.size) ? selectedSpecies.size.join('/') : selectedSpecies.size}
              </span>
              <span className="flex items-center gap-1">
                <FastForward className="w-3.5 h-3.5 text-slate-400" />
                Speed: {typeof selectedSpecies.speed === 'object' ? selectedSpecies.speed.walk : selectedSpecies.speed} ft
              </span>
            </div>
          </div>

          {/* Traits list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
            {(selectedSpecies.entries || []).map((entry: any, i: number) => {
              if (typeof entry === 'string') {
                return (
                  <p key={i} className="text-xs text-slate-300 col-span-2 leading-relaxed">
                    {extractEntriesText(entry)}
                  </p>
                );
              }
              return (
                <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <h4 className="font-semibold text-xs text-amber-300 mb-1">{entry.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                    {extractEntriesText(entry.entries)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedSpecies}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition cursor-pointer ${
            selectedSpecies
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-600/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Next: Select Background</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
