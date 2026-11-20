import React, { useState } from 'react';
import type { SavedCharacterRecord } from '../types/character';
import { 
  Users, 
  Plus, 
  Play, 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  Search, 
  Sparkles, 
  Clock, 
  Shield, 
  Check,
  AlertCircle
} from 'lucide-react';

interface CharacterRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SavedCharacterRecord[];
  activeId: string;
  onSelectCharacter: (id: string) => void;
  onCreateNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onExportSingle: (record: SavedCharacterRecord) => void;
  onExportAll: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CharacterRosterModal: React.FC<CharacterRosterModalProps> = ({
  isOpen,
  onClose,
  records,
  activeId,
  onSelectCharacter,
  onCreateNew,
  onDuplicate,
  onDelete,
  onExportSingle,
  onExportAll,
  onImportJSON,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRecords = records.filter(rec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rec.name.toLowerCase().includes(q) ||
      rec.className.toLowerCase().includes(q) ||
      rec.speciesName.toLowerCase().includes(q) ||
      rec.backgroundName.toLowerCase().includes(q) ||
      (rec.subclassName && rec.subclassName.toLowerCase().includes(q))
    );
  });

  const formatDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-amber-900/50 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-xl text-amber-100 tracking-wide">
                  Character Roster
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {records.length} {records.length === 1 ? 'Hero' : 'Heroes'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage, switch, clone, and export your D&D 2024 adventurers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/10 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Hero</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close Roster"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, class, species, or background..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Characters Grid / List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-300 mb-1">
                {searchQuery ? 'No matching characters found' : 'No characters saved'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No character matches "${searchQuery}". Try a different search term or clear the filter.`
                  : 'Get started by creating your very first D&D 2024 adventurer!'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 text-xs text-amber-400 hover:underline"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={onCreateNew}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  + Create First Hero
                </button>
              )}
            </div>
          ) : (
            filteredRecords.map((rec) => {
              const isActive = rec.id === activeId;
              const isConfirmingDelete = deleteConfirmId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      {rec.avatarUrl ? (
                        <img
                          src={rec.avatarUrl}
                          alt={rec.name}
                          className="w-14 h-14 rounded-xl object-cover border border-amber-500/30 shadow-md"
                          onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-md">
                          <Shield className="w-7 h-7 opacity-75" />
                        </div>
                      )}
                      {isActive && (
                        <div 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md border-2 border-slate-900" 
                          title="Currently Active"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-serif font-bold text-base text-slate-100 truncate group-hover:text-amber-200 transition">
                          {rec.name}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          Lvl {rec.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="text-amber-300 font-medium">{rec.className}</span>
                        {rec.subclassName && <span className="text-slate-500">({rec.subclassName})</span>}
                        <span className="text-slate-600">•</span>
                        <span>{rec.speciesName}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{rec.backgroundName}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Updated {formatDate(rec.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-2 bg-red-950/60 border border-red-800/60 rounded-xl p-1.5">
                        <span className="text-xs text-red-300 font-medium px-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          Delete permanently?
                        </span>
                        <button
                          onClick={() => {
                            onDelete(rec.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {!isActive ? (
                          <button
                            onClick={() => onSelectCharacter(rec.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-500 transition cursor-pointer"
                            title="Load & Play this Character"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Select</span>
                          </button>
                        ) : (
                          <button
                            onClick={onClose}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Continue</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDuplicate(rec.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 transition cursor-pointer"
                          title="Clone / Duplicate Character"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onExportSingle(rec)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 transition cursor-pointer"
                          title="Export JSON (This Hero)"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(rec.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-200 bg-red-950/20 hover:bg-red-900/40 border border-red-900/40 transition cursor-pointer"
                          title="Delete Character"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Bulk Import & Export */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Import Characters JSON</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={onImportJSON} 
                className="hidden" 
              />
            </label>

            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
              title="Download entire roster backup file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backup All ({records.length})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Characters automatically persist to your browser's local storage.
          </div>
        </div>
      </div>
    </div>
  );
};
