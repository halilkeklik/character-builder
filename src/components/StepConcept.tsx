import React from 'react';
import type { CharacterSheetState } from '../types/character';
import { User, Shield, Compass } from 'lucide-react';

interface StepConceptProps {
  state: CharacterSheetState;
  updateConcept: (concept: Partial<CharacterSheetState['concept']>) => void;
  onNext: () => void;
}

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
];

const AVATARS = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
];

export const StepConcept: React.FC<StepConceptProps> = ({ state, updateConcept, onNext }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-500" />
          Character Concept & Identity
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Give life to your hero. Choose a name, starting level, alignment, and appearance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center">
          <div className="relative group w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950 mb-4">
            <img
              src={state.concept.avatarUrl || AVATARS[0]}
              alt="Character Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xs text-slate-400 mb-2">Preset Avatars</span>
          <div className="flex gap-2 justify-center mb-4">
            {AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => updateConcept({ avatarUrl: url })}
                className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                  state.concept.avatarUrl === url ? 'border-amber-400 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="w-full text-left">
            <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={state.concept.avatarUrl || ''}
              onChange={(e) => updateConcept({ avatarUrl: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Right Columns: Main Fields */}
        <div className="md:col-span-2 space-y-5 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                Character Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={state.concept.name}
                onChange={(e) => updateConcept({ name: e.target.value })}
                placeholder="e.g. Valerius the Bold"
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-medium focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                Starting Level
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={state.concept.level}
                  onChange={(e) => updateConcept({ level: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) })}
                  className="w-24 px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-bold text-center focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400">
                  {state.concept.level === 1 ? 'Tier 1 (Local Heroes)' : state.concept.level < 5 ? 'Tier 1' : state.concept.level < 11 ? 'Tier 2 (Heroes of the Realm)' : 'High Tier'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                Alignment
              </label>
              <select
                value={state.concept.alignment}
                onChange={(e) => updateConcept({ alignment: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 transition"
              >
                {ALIGNMENTS.map((al) => (
                  <option key={al} value={al}>{al}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                Gender / Pronouns
              </label>
              <input
                type="text"
                value={state.concept.gender}
                onChange={(e) => updateConcept({ gender: e.target.value })}
                placeholder="e.g. She/Her, He/Him, They/Them"
                className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5">
              Character Backstory & Notes
            </label>
            <textarea
              rows={3}
              value={state.concept.notes}
              onChange={(e) => updateConcept({ notes: e.target.value })}
              placeholder="What motivates your character? Where are they from?"
              className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <span>Next: Select Class</span>
          <Shield className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
