import React, { useState } from 'react';
import type { CharacterSheetState, AbilityKey } from '../types/character';
import { 
  ABILITY_LABELS, 
  POINT_BUY_COST, 
  STANDARD_ARRAY, 
  formatModifier, 
  getAbilityModifier,
  calculateTotalScores 
} from '../utils/dndRules';
import { getBackgroundAllowedAbilities } from '../utils/dataLoader';
import { Activity, Dices, ChevronRight, Plus, Minus } from 'lucide-react';

interface StepAbilitiesProps {
  state: CharacterSheetState;
  updateAbilities: (scores: CharacterSheetState['abilityScores']) => void;
  updateBonus: (bonus: Partial<CharacterSheetState['backgroundBonus']>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Method = 'standard' | 'pointbuy' | 'roll';

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const StepAbilities: React.FC<StepAbilitiesProps> = ({
  state,
  updateAbilities,
  updateBonus,
  onNext,
  onBack,
}) => {
  const [method, setMethod] = useState<Method>('standard');
  const allowedBackgroundStats = getBackgroundAllowedAbilities(state.selectedBackground) as AbilityKey[];

  // Point Buy Calculation
  const totalPointsSpent = ABILITY_KEYS.reduce((acc, key) => {
    const val = state.abilityScores[key] || 8;
    return acc + (POINT_BUY_COST[val] ?? 0);
  }, 0);
  const remainingPoints = 27 - totalPointsSpent;

  // Handle Point Buy change
  const handlePointBuyChange = (key: AbilityKey, delta: number) => {
    const current = state.abilityScores[key] || 8;
    const target = current + delta;
    if (target < 8 || target > 15) return;

    const currentCost = POINT_BUY_COST[current];
    const targetCost = POINT_BUY_COST[target];
    const diff = targetCost - currentCost;

    if (remainingPoints >= diff) {
      updateAbilities({
        ...state.abilityScores,
        [key]: target,
      });
    }
  };

  // Roll 4d6 drop lowest for all 6 stats
  const handleRollAll = () => {
    const newScores: Record<AbilityKey, number> = {} as any;
    ABILITY_KEYS.forEach((key) => {
      const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => a - b);
      const sum = rolls.slice(1).reduce((a, b) => a + b, 0);
      newScores[key] = sum;
    });
    updateAbilities(newScores);
  };

  // Set Standard Array default
  const handleSetStandardDefault = () => {
    updateAbilities({
      str: 15,
      dex: 14,
      con: 13,
      int: 12,
      wis: 10,
      cha: 8,
    });
  };

  const finalScores = calculateTotalScores(state.abilityScores, state.backgroundBonus);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-500" />
          Determine Ability Scores
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Distribute your 6 core abilities, then apply your Background bonus (+2/+1 or +1/+1/+1).
        </p>
      </div>

      {/* Method Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => { setMethod('standard'); handleSetStandardDefault(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              method === 'standard'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Standard Array (15, 14, 13, 12, 10, 8)
          </button>
          <button
            onClick={() => setMethod('pointbuy')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              method === 'pointbuy'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Point Buy (27 pts)
          </button>
          <button
            onClick={() => { setMethod('roll'); handleRollAll(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              method === 'roll'
                ? 'bg-amber-600 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            Roll 4d6 Drop Lowest
          </button>
        </div>

        {method === 'pointbuy' && (
          <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Points Remaining:</span>
            <span className={`text-sm ${remainingPoints === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {remainingPoints} / 27
            </span>
          </div>
        )}

        {method === 'roll' && (
          <button
            onClick={handleRollAll}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-900/60 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" /> Re-roll All
          </button>
        )}
      </div>

      {/* Ability Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ABILITY_KEYS.map((key) => {
          const base = state.abilityScores[key] || 8;
          const finalScore = finalScores[key] || 8;
          const mod = getAbilityModifier(finalScore);
          const isAllowedBg = allowedBackgroundStats.includes(key);

          return (
            <div
              key={key}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center relative"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {ABILITY_LABELS[key].short}
              </span>
              <span className="text-[11px] text-slate-500 mb-2 truncate max-w-full">
                {ABILITY_LABELS[key].name}
              </span>

              {/* Big Final Score & Modifier */}
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center mb-3 shadow-inner">
                <span className="text-2xl font-black text-amber-100 font-serif leading-none">
                  {finalScore}
                </span>
                <span className="text-xs font-bold text-amber-400 mt-0.5">
                  {formatModifier(mod)}
                </span>
              </div>

              {/* Base Score Controls */}
              {method === 'pointbuy' ? (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    disabled={base <= 8}
                    onClick={() => handlePointBuyChange(key, -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center justify-center text-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-semibold text-slate-300 w-6">{base}</span>
                  <button
                    disabled={base >= 15 || remainingPoints < ((POINT_BUY_COST[base + 1] || 0) - (POINT_BUY_COST[base] || 0))}
                    onClick={() => handlePointBuyChange(key, 1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs flex items-center justify-center text-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : method === 'standard' ? (
                <select
                  value={base}
                  onChange={(e) => updateAbilities({ ...state.abilityScores, [key]: parseInt(e.target.value) })}
                  className="w-20 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 text-center mb-2"
                >
                  {STANDARD_ARRAY.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={base}
                  onChange={(e) => updateAbilities({ ...state.abilityScores, [key]: parseInt(e.target.value) || 10 })}
                  className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-slate-200 text-center mb-2"
                />
              )}

              {/* Background Allowed Indicator */}
              {isAllowedBg && (
                <span className="text-[10px] text-amber-500/80 font-medium">
                  Background Option
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 2024 Background Bonus Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
              Background Ability Score Increase (2024 Rules)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your bonuses from your background's allowed abilities ({allowedBackgroundStats.map(s => s.toUpperCase()).join(', ')}).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateBonus({ mode: '+2/+1' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                state.backgroundBonus.mode === '+2/+1'
                  ? 'bg-amber-600 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              +2 / +1
            </button>
            <button
              onClick={() => updateBonus({ mode: '+1/+1/+1' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                state.backgroundBonus.mode === '+1/+1/+1'
                  ? 'bg-amber-600 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              +1 / +1 / +1
            </button>
          </div>
        </div>

        {state.backgroundBonus.mode === '+2/+1' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                +2 Bonus:
              </label>
              <select
                value={state.backgroundBonus.first || ''}
                onChange={(e) => updateBonus({ first: e.target.value as AbilityKey })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 uppercase font-semibold focus:border-amber-500"
              >
                <option value="">Select Ability</option>
                {allowedBackgroundStats.map((st) => (
                  <option key={st} value={st}>{ABILITY_LABELS[st].name} ({st.toUpperCase()})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                +1 Bonus:
              </label>
              <select
                value={state.backgroundBonus.second || ''}
                onChange={(e) => updateBonus({ second: e.target.value as AbilityKey })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 uppercase font-semibold focus:border-amber-500"
              >
                <option value="">Select Ability</option>
                {allowedBackgroundStats
                  .filter((st) => st !== state.backgroundBonus.first)
                  .map((st) => (
                    <option key={st} value={st}>{ABILITY_LABELS[st].name} ({st.toUpperCase()})</option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">+1 Bonus (Stat 1):</label>
              <select
                value={state.backgroundBonus.first || ''}
                onChange={(e) => updateBonus({ first: e.target.value as AbilityKey })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 uppercase font-semibold"
              >
                <option value="">Select</option>
                {allowedBackgroundStats.map((st) => (
                  <option key={st} value={st}>{st.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">+1 Bonus (Stat 2):</label>
              <select
                value={state.backgroundBonus.second || ''}
                onChange={(e) => updateBonus({ second: e.target.value as AbilityKey })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 uppercase font-semibold"
              >
                <option value="">Select</option>
                {allowedBackgroundStats.filter(st => st !== state.backgroundBonus.first).map((st) => (
                  <option key={st} value={st}>{st.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">+1 Bonus (Stat 3):</label>
              <select
                value={state.backgroundBonus.third || ''}
                onChange={(e) => updateBonus({ third: e.target.value as AbilityKey })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 uppercase font-semibold"
              >
                <option value="">Select</option>
                {allowedBackgroundStats.filter(st => st !== state.backgroundBonus.first && st !== state.backgroundBonus.second).map((st) => (
                  <option key={st} value={st}>{st.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}
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
          <span>Next: Equipment & Mastery</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
