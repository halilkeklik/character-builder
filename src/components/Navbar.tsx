import React from 'react';
import type { WizardStep } from '../types/character';
import { 
  User, 
  Shield, 
  Dna, 
  BookOpen, 
  Activity, 
  Briefcase, 
  Sparkles, 
  FileText,
  RotateCcw,
  Download,
  Upload,
  Users,
  Plus
} from 'lucide-react';

interface NavbarProps {
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;
  activeCharacterName?: string;
  activeCharacterClass?: string;
  activeCharacterLevel?: number;
  totalCharactersCount?: number;
  onOpenRoster: () => void;
  onNewCharacter: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const STEPS: { id: WizardStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'concept', label: 'Concept', icon: User },
  { id: 'class', label: 'Class', icon: Shield },
  { id: 'species', label: 'Species', icon: Dna },
  { id: 'background', label: 'Background', icon: BookOpen },
  { id: 'abilities', label: 'Abilities', icon: Activity },
  { id: 'equipment', label: 'Equipment & Mastery', icon: Briefcase },
  { id: 'spells', label: 'Spells', icon: Sparkles },
  { id: 'sheet', label: 'Character Sheet', icon: FileText },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  setStep,
  activeCharacterName,
  activeCharacterClass,
  activeCharacterLevel,
  totalCharactersCount = 1,
  onOpenRoster,
  onNewCharacter,
  onReset,
  onExport,
  onImport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-amber-900/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setStep('concept')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center shadow-md border border-amber-400/40">
            <span className="font-serif font-black text-white text-xl tracking-wider">5.5</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-amber-100 tracking-wide leading-none">
              D&D 2024 Character Builder
            </h1>
            <p className="text-xs text-amber-400/70">Revision / 5e.tools Data Core</p>
          </div>
        </div>

        {/* Character Roster Trigger / Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRoster}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-400 shadow-sm transition group cursor-pointer"
            title="Open Character Roster & Switch Characters"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div className="text-left flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs text-amber-100 group-hover:text-amber-200 truncate max-w-[130px] sm:max-w-[180px]">
                  {activeCharacterName || 'Unnamed Hero'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/30">
                  Lvl {activeCharacterLevel || 1} {activeCharacterClass || 'Hero'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-amber-400/80 group-hover:text-amber-300 font-semibold px-1">
              ({totalCharactersCount}) ▾
            </span>
          </button>

          <button
            onClick={onNewCharacter}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition cursor-pointer"
            title="Create a new blank character"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Load JSON</span>
            <span className="sm:hidden">Load</span>
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition"
            title="Save character to JSON file"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save JSON</span>
            <span className="sm:hidden">Save</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 cursor-pointer transition"
            title="Reset Character Choices"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Steps Navigation */}
      <div className="overflow-x-auto bg-slate-950/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1.5 min-w-max">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-amber-50 shadow-sm border border-amber-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-slate-500'}`} />
                <span>
                  {idx + 1}. {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
