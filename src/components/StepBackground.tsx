import React from 'react';
import type { CharacterSheetState, FeatChoiceData } from '../types/character';
import { ALL_BACKGROUNDS, getBackgroundAllowedAbilities, getFeatByName } from '../utils/dataLoader';
import { extractEntriesText } from '../utils/tagParser';
import { FeatCustomizer } from './FeatCustomizer';
import { BookOpen, Sparkles, Award, Wrench, ChevronRight, Check } from 'lucide-react';

interface StepBackgroundProps {
  state: CharacterSheetState;
  onSelectBackground: (bg: any) => void;
  onUpdateBgFeatChoices: (choices: FeatChoiceData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepBackground: React.FC<StepBackgroundProps> = ({
  state,
  onSelectBackground,
  onUpdateBgFeatChoices,
  onNext,
  onBack,
}) => {
  const selectedBg = state.selectedBackground;
  const featRaw = selectedBg?.feats?.[0] ? Object.keys(selectedBg.feats[0])[0] : '';
  const featName = featRaw.split(';')[0].split('|')[0];

  // Disable skills that are already proficient from other features
  const classSkills = state.selectedSkills.map(s => s.toLowerCase());
  const bgFixedSkills = selectedBg?.skillProficiencies?.[0]
    ? Object.keys(selectedBg.skillProficiencies[0]).map(s => s.toLowerCase())
    : [];
  const humanSkill = state.speciesChoices?.humanSkill ? [state.speciesChoices.humanSkill.toLowerCase()] : [];
  const humanSkilledFeat = (state.speciesChoices?.humanFeatChoices?.skills || []).map(s => s.toLowerCase());
  const disabledForBgFeat = [...classSkills, ...bgFixedSkills, ...humanSkill, ...humanSkilledFeat];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          Choose Your Background (2024 Core)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          In D&D 2024, backgrounds provide your <strong>Ability Score Increases</strong>, an <strong>Origin Feat</strong>, skills, and tools.
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

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
                Skills: {bg.skillProficiencies?.[0] ? Object.keys(bg.skillProficiencies[0]).join(', ') : 'None'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Background Details */}
      {selectedBg && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Background Perks</span>
              <h3 className="text-xl font-serif font-bold text-slate-100">{selectedBg.name}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Proficiencies & Tools */}
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                <Wrench className="w-4 h-4" /> Proficiencies
              </span>
              <div className="text-xs space-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-500">Skills: </span>
                  <span className="font-medium capitalize">
                    {selectedBg.skillProficiencies?.[0] ? Object.keys(selectedBg.skillProficiencies[0]).join(', ') : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Tools: </span>
                  <span className="font-medium capitalize">
                    {selectedBg.toolProficiencies?.[0] ? Object.keys(selectedBg.toolProficiencies[0]).join(', ') : 'None'}
                  </span>
                </div>
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
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedBg}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold shadow-lg transition cursor-pointer ${
            selectedBg
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-600/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Next: Ability Scores</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
