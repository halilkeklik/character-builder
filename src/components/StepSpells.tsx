import React, { useState } from 'react';
import type { CharacterSheetState } from '../types/character';
import { ALL_SPELLS } from '../utils/dataLoader';
import { extractEntriesText } from '../utils/tagParser';
import { Sparkles, Wand2, Search, Check, ChevronRight, BookOpen } from 'lucide-react';

interface StepSpellsProps {
  state: CharacterSheetState;
  onToggleSpell: (spellName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SPELLCASTING_CLASSES = [
  'wizard', 'cleric', 'druid', 'bard', 'sorcerer', 'warlock', 'paladin', 'ranger', 'artificer'
];

export const StepSpells: React.FC<StepSpellsProps> = ({
  state,
  onToggleSpell,
  onNext,
  onBack,
}) => {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | '0' | '1'>('all');
  const [selectedSpellDetail, setSelectedSpellDetail] = useState<any | null>(null);

  const className = state.selectedClass?.name?.toLowerCase() || '';
  const isSpellcaster = SPELLCASTING_CLASSES.includes(className);

  // Filter spells available for this class
  const classSpells = ALL_SPELLS.filter((sp: any) => {
    // Spells that list this class in classes.fromClassList
    const classList = sp.classes?.fromClassList || [];
    const matchesClass = classList.some((c: any) => c.name?.toLowerCase() === className);
    return matchesClass;
  });

  const filteredSpells = classSpells.filter((sp: any) => {
    if (levelFilter === '0' && sp.level !== 0) return false;
    if (levelFilter === '1' && sp.level !== 1) return false;
    if (search && !sp.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!isSpellcaster) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-500">
          <Wand2 className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-100">Martial Prowess</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Your class (<strong>{state.selectedClass?.name || 'Current Class'}</strong>) relies on martial discipline, physical endurance, and steel rather than spells at this level.
          </p>
        </div>

        <div className="flex justify-between max-w-md mx-auto pt-6">
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
          >
            <span>View Character Sheet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Spellcasting ({state.selectedClass?.name})
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select your known or prepared Cantrips and 1st-level spells.
        </p>
      </div>

      {/* Search & Level Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search spells..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setLevelFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              levelFilter === 'all' ? 'bg-amber-600 text-slate-950' : 'bg-slate-950 text-slate-400'
            }`}
          >
            All Spells
          </button>
          <button
            onClick={() => setLevelFilter('0')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              levelFilter === '0' ? 'bg-amber-600 text-slate-950' : 'bg-slate-950 text-slate-400'
            }`}
          >
            Cantrips (0)
          </button>
          <button
            onClick={() => setLevelFilter('1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              levelFilter === '1' ? 'bg-amber-600 text-slate-950' : 'bg-slate-950 text-slate-400'
            }`}
          >
            1st Level
          </button>
        </div>

        <div className="text-xs font-bold text-amber-400">
          {state.selectedSpells.length} Spells Selected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spells List */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
          {filteredSpells.map((sp: any) => {
            const isChecked = state.selectedSpells.includes(sp.name);
            const levelLabel = sp.level === 0 ? 'Cantrip' : `Level ${sp.level}`;

            return (
              <div
                key={sp.name}
                onClick={() => setSelectedSpellDetail(sp)}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                  selectedSpellDetail?.name === sp.name
                    ? 'border-amber-500 bg-amber-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-semibold text-sm text-slate-100">{sp.name}</h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSpell(sp.name);
                      }}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition ${
                        isChecked
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-950 border-slate-700 text-transparent hover:border-slate-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-medium">
                      {levelLabel}
                    </span>
                    <span>{sp.school || 'Magic'}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Range: {typeof sp.range === 'object' ? sp.range.type : sp.range || 'Self'}</span>
                  <span className="text-amber-500/80 hover:text-amber-400 font-medium">Details →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Spell Detail Inspector */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          {selectedSpellDetail ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {selectedSpellDetail.level === 0 ? 'Cantrip' : `Level ${selectedSpellDetail.level} Spell`}
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-100 mt-0.5">
                  {selectedSpellDetail.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block">Casting Time:</span>
                  <span className="font-medium text-slate-200">
                    {selectedSpellDetail.time?.[0] ? `${selectedSpellDetail.time[0].number} ${selectedSpellDetail.time[0].unit}` : 'Action'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Range:</span>
                  <span className="font-medium text-slate-200">
                    {typeof selectedSpellDetail.range === 'object' ? `${selectedSpellDetail.range.distance?.amount || ''} ${selectedSpellDetail.range.type}` : selectedSpellDetail.range || 'Self'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Duration:</span>
                  <span className="font-medium text-slate-200">
                    {selectedSpellDetail.duration?.[0] ? (selectedSpellDetail.duration[0].type === 'instant' ? 'Instantaneous' : `${selectedSpellDetail.duration[0].duration?.amount || 1} ${selectedSpellDetail.duration[0].duration?.type || 'minute'}`) : 'Instant'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Components:</span>
                  <span className="font-medium text-slate-200">
                    {selectedSpellDetail.components ? Object.keys(selectedSpellDetail.components).join(', ').toUpperCase() : 'V, S'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed max-h-56 overflow-y-auto pr-1 whitespace-pre-line">
                {extractEntriesText(selectedSpellDetail.entries)}
              </div>

              <button
                type="button"
                onClick={() => onToggleSpell(selectedSpellDetail.name)}
                className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  state.selectedSpells.includes(selectedSpellDetail.name)
                    ? 'bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/60'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                }`}
              >
                {state.selectedSpells.includes(selectedSpellDetail.name) ? 'Remove from Prepared' : '+ Prepare Spell'}
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <BookOpen className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Click any spell from the list to preview its casting rules and full description.</p>
            </div>
          )}
        </div>
      </div>

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
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <span>View Final Character Sheet</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
