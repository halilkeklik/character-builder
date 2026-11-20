import React from 'react';
import type { CharacterSheetState } from '../types/character';
import { ALL_ITEMS, ALL_MASTERIES, getWeaponMasteriesForClass } from '../utils/dataLoader';
import { extractEntriesText } from '../utils/tagParser';
import { Briefcase, Sword, Coins, ShieldCheck, ChevronRight, Check } from 'lucide-react';

interface StepEquipmentProps {
  state: CharacterSheetState;
  onSelectOption: (opt: 'A' | 'B') => void;
  onToggleMastery: (weaponName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepEquipment: React.FC<StepEquipmentProps> = ({
  state,
  onSelectOption,
  onToggleMastery,
  onNext,
  onBack,
}) => {
  const selectedClass = state.selectedClass;
  const maxMasteries = selectedClass ? getWeaponMasteriesForClass(selectedClass.name) : 0;
  
  // Weapons with mastery property from items.json
  const weaponsWithMastery = ALL_ITEMS.filter((it: any) => it.mastery);

  // Class starting equipment descriptions
  const classEquipmentEntries = selectedClass?.startingEquipment?.entries || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-amber-500" />
          Starting Equipment & Weapon Mastery
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Select your starting gear bundle or starting wealth, and pick your martial Weapon Masteries.
        </p>
      </div>

      {/* Equipment Package Choice: Option A vs Option B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A: Equipment Bundle */}
        <div
          onClick={() => onSelectOption('A')}
          className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
            state.equipmentOption === 'A'
              ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Option A: Class & Background Gear
              </span>
              {state.equipmentOption === 'A' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Standard thematic adventuring package suited for your class and background.
            </p>
            <div className="text-xs text-slate-300 space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <div className="font-semibold text-amber-400/90">Class Gear:</div>
              {classEquipmentEntries.length > 0 ? (
                classEquipmentEntries.map((entry: any, i: number) => (
                  <p key={i} className="text-xs text-slate-300">{extractEntriesText(entry)}</p>
                ))
              ) : (
                <p className="text-xs text-slate-400">Class starting bundle with weapons, armor, and pack.</p>
              )}
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-amber-400">
            {state.equipmentOption === 'A' ? '✓ Selected' : 'Choose Option A'}
          </div>
        </div>

        {/* Option B: Starting Gold */}
        <div
          onClick={() => onSelectOption('B')}
          className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
            state.equipmentOption === 'B'
              ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-serif font-bold text-base text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" /> Option B: Starting Wealth (Gold Buy)
              </span>
              {state.equipmentOption === 'B' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Purchase your own custom gear and equipment freely using your starting gold.
            </p>
            <div className="text-xs text-slate-300 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-amber-400">Gold Buy Option:</span> Receive full starting class gold to purchase equipment individually.
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-amber-400">
            {state.equipmentOption === 'B' ? '✓ Selected' : 'Choose Option B'}
          </div>
        </div>
      </div>

      {/* 2024 Weapon Mastery Selection */}
      {maxMasteries > 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sword className="w-4 h-4" /> 2024 Weapon Mastery
              </span>
              <h3 className="text-lg font-serif font-bold text-slate-100">
                Choose {maxMasteries} Weapon Masteries ({selectedClass?.name})
              </h3>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
              state.selectedWeaponMasteries.length === maxMasteries
                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
            }`}>
              {state.selectedWeaponMasteries.length} / {maxMasteries} Selected
            </span>
          </div>

          {/* Masteries Cards (Reference) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_MASTERIES.map((m: any) => (
              <div key={m.name} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block">{m.name}</span>
                <span className="text-[11px] text-slate-400 line-clamp-2">
                  {extractEntriesText(m.entries)}
                </span>
              </div>
            ))}
          </div>

          {/* Weapons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-2">
            {weaponsWithMastery.map((w: any) => {
              const isChecked = state.selectedWeaponMasteries.includes(w.name);
              const isFull = state.selectedWeaponMasteries.length >= maxMasteries && !isChecked;
              const masteryProperty = typeof w.mastery === 'string' ? w.mastery : w.mastery?.[0] || 'Mastery';

              return (
                <button
                  key={w.name}
                  type="button"
                  disabled={isFull}
                  onClick={() => onToggleMastery(w.name)}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    isChecked
                      ? 'bg-amber-950/50 border-amber-500 text-amber-100 shadow-sm'
                      : isFull
                      ? 'bg-slate-950/40 border-slate-850 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs truncate">{w.name}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400/80 font-medium inline-block">
                    {masteryProperty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Sword className="w-4 h-4 text-slate-500" />
          <span>Your class does not have the Weapon Mastery feature at Level 1.</span>
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
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <span>Next: Spells & Magic</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
