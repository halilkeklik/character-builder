import React, { useState, useEffect } from 'react';
import type { CharacterSheetState, InventoryState, EquipmentItem } from '../types/character';
import { ALL_ITEMS, ALL_MASTERIES, getWeaponMasteriesForClass } from '../utils/dataLoader';
import { 
  getInitialInventory, 
  calculateEquippedAC, 
  COMMON_SHOP_ITEMS 
} from '../utils/equipmentHelper';
import { extractEntriesText } from '../utils/tagParser';
import { 
  Briefcase, 
  Sword, 
  Coins, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Shield, 
  Package, 
  Sparkles,
  Layers,
  Wrench
} from 'lucide-react';

interface StepEquipmentProps {
  state: CharacterSheetState;
  onSelectOption: (opt: 'A' | 'B') => void;
  onUpdateInventory: (inv: Partial<InventoryState>) => void;
  onToggleMastery: (weaponName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepEquipment: React.FC<StepEquipmentProps> = ({
  state,
  onSelectOption,
  onUpdateInventory,
  onToggleMastery,
  onNext,
  onBack,
}) => {
  const selectedClass = state.selectedClass;
  const selectedBg = state.selectedBackground;
  const maxMasteries = selectedClass ? getWeaponMasteriesForClass(selectedClass.name) : 0;
  const weaponsWithMastery = ALL_ITEMS.filter((it: any) => it.mastery);

  // Initialize inventory if not yet set
  useEffect(() => {
    if (!state.inventory) {
      const initial = getInitialInventory(selectedClass, selectedBg, 'A', 'A');
      onUpdateInventory(initial);
    }
  }, [selectedClass, selectedBg]);

  const inventory: InventoryState = state.inventory || getInitialInventory(selectedClass, selectedBg, 'A', 'A');

  // Local state for UI
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [shopSearch, setShopSearch] = useState<string>('');
  const [selectedShopCategory, setSelectedShopCategory] = useState<string>('all');

  // Ability modifiers for live AC calculation
  const dexMod = Math.floor(((state.abilityScores.dex + (state.backgroundBonus.first === 'dex' ? (state.backgroundBonus.mode === '+2/+1' ? 2 : 1) : 0)) - 10) / 2);
  const conMod = Math.floor(((state.abilityScores.con + (state.backgroundBonus.first === 'con' ? (state.backgroundBonus.mode === '+2/+1' ? 2 : 1) : 0)) - 10) / 2);
  const wisMod = Math.floor(((state.abilityScores.wis + (state.backgroundBonus.first === 'wis' ? (state.backgroundBonus.mode === '+2/+1' ? 2 : 1) : 0)) - 10) / 2);

  const fightingStyle = state.classChoices?.fightingStyle;
  const hasArmorOfShadows = state.classChoices?.eldritchInvocation === 'Armor of Shadows';

  // Live AC calculation
  const acInfo = calculateEquippedAC(
    dexMod,
    conMod,
    wisMod,
    selectedClass?.name,
    inventory.items,
    fightingStyle,
    hasArmorOfShadows
  );

  // Handlers for equipment packages
  const handleSelectClassPackage = (pkg: string) => {
    const updated = getInitialInventory(selectedClass, selectedBg, pkg, inventory.backgroundPackage);
    onUpdateInventory(updated);
    onSelectOption(pkg === 'A' ? 'A' : 'B');
  };

  const handleSelectBgPackage = (pkg: string) => {
    const updated = getInitialInventory(selectedClass, selectedBg, inventory.classPackage, pkg);
    onUpdateInventory(updated);
  };

  // Inventory manipulation handlers
  const handleToggleEquip = (itemId: string) => {
    const target = inventory.items.find(i => i.id === itemId);
    if (!target) return;

    const nextItems = inventory.items.map(it => {
      if (it.id === itemId) {
        return { ...it, equipped: !it.equipped };
      }
      // If equipping armor, unequip any other armor
      if (target.category === 'armor' && !target.equipped && it.category === 'armor') {
        return { ...it, equipped: false };
      }
      return it;
    });

    onUpdateInventory({ items: nextItems });
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const nextItems = inventory.items
      .map(it => {
        if (it.id === itemId) {
          const nextQty = it.quantity + delta;
          return nextQty > 0 ? { ...it, quantity: nextQty } : null;
        }
        return it;
      })
      .filter(Boolean) as EquipmentItem[];

    onUpdateInventory({ items: nextItems });
  };

  const handleRemoveItem = (itemId: string) => {
    const nextItems = inventory.items.filter(it => it.id !== itemId);
    onUpdateInventory({ items: nextItems });
  };

  const handleAddItemFromShop = (shopItem: { name: string; category: EquipmentItem['category']; cost: string }) => {
    const existing = inventory.items.find(i => i.name.toLowerCase() === shopItem.name.toLowerCase());
    if (existing) {
      handleQuantityChange(existing.id, 1);
    } else {
      const newItem: EquipmentItem = {
        id: `custom-${shopItem.name}-${Math.random().toString(36).slice(2, 7)}`,
        name: shopItem.name,
        quantity: 1,
        category: shopItem.category,
        cost: shopItem.cost,
        equipped: false,
      };
      onUpdateInventory({ items: [...inventory.items, newItem] });
    }
  };

  const handleCurrencyChange = (type: 'gp' | 'sp' | 'cp', value: number) => {
    onUpdateInventory({
      currency: {
        ...inventory.currency,
        [type]: Math.max(0, value),
      },
    });
  };

  // Filtered items
  const filteredItems = inventory.items.filter(it => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'weapon') return it.category === 'weapon';
    if (activeCategoryFilter === 'armor') return it.category === 'armor' || it.category === 'shield';
    if (activeCategoryFilter === 'gear') return it.category === 'gear' || it.category === 'pack' || it.category === 'ammunition';
    if (activeCategoryFilter === 'tool') return it.category === 'tool';
    return true;
  });

  // Shop filter
  const filteredShopItems = COMMON_SHOP_ITEMS.filter(it => {
    const matchesSearch = it.name.toLowerCase().includes(shopSearch.toLowerCase());
    const matchesCategory = selectedShopCategory === 'all' || it.category === selectedShopCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-serif font-bold text-amber-300 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-amber-500" />
          Starting Equipment, Inventory & Weapon Mastery
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Customize your starting gear bundles, equip armor and weapons, track wealth, and configure 2024 Weapon Masteries.
        </p>
      </div>

      {/* Live AC & Wealth Preview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Armor Class</span>
            <span className="text-lg font-black text-amber-300 font-mono">
              {acInfo.totalAC} AC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipped Armor</span>
            <span className="text-xs font-bold text-slate-200 truncate block max-w-[140px]" title={acInfo.armorName}>
              {acInfo.armorName} {acInfo.hasShield && '+ Shield'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gold in Purse</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {inventory.currency.gp} GP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Carried Items</span>
            <span className="text-sm font-bold text-slate-200">
              {inventory.items.length} Distinct Items
            </span>
          </div>
        </div>
      </div>

      {/* 1. STARTING EQUIPMENT BUNDLE CHOICES */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" /> 1. Choose Starting Equipment Packages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Class Package Selector */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Class Starting Package ({selectedClass?.name})
              </span>
              <span className="text-[11px] font-bold text-amber-400">
                Active: Package {inventory.classPackage}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectClassPackage('A')}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  inventory.classPackage === 'A'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Option A</span>
                  {inventory.classPackage === 'A' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Class Gear & Weapons</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectClassPackage('B')}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  inventory.classPackage === 'B'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Option B</span>
                  {inventory.classPackage === 'B' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  {selectedClass?.name === 'Fighter' ? 'Finesse / Archery Gear' : 'Starting Gold Buy'}
                </span>
              </button>

              {selectedClass?.name === 'Fighter' && (
                <button
                  type="button"
                  onClick={() => handleSelectClassPackage('C')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                    inventory.classPackage === 'C'
                      ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>Option C</span>
                    {inventory.classPackage === 'C' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">155 GP (Gold Buy)</span>
                </button>
              )}
            </div>
          </div>

          {/* Background Package Selector */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Background Gear ({selectedBg?.name || 'Background'})
              </span>
              <span className="text-[11px] font-bold text-amber-400">
                Active: Option {inventory.backgroundPackage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectBgPackage('A')}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  inventory.backgroundPackage === 'A'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Option A</span>
                  {inventory.backgroundPackage === 'A' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Background Thematic Gear</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectBgPackage('B')}
                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                  inventory.backgroundPackage === 'B'
                    ? 'bg-amber-950/50 border-amber-500 text-amber-100 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Option B</span>
                  {inventory.backgroundPackage === 'B' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-normal">50 GP Starting Wealth</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE INVENTORY MANAGER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Inventory
            </span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'weapon', label: 'Weapons' },
              { id: 'armor', label: 'Armor & Shield' },
              { id: 'gear', label: 'Gear & Packs' },
              { id: 'tool', label: 'Tools' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeCategoryFilter === tab.id
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>
        </div>

        {/* Currency Adjustment Row */}
        <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" /> Coin Purse:
          </span>
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">GP:</label>
            <input
              type="number"
              min="0"
              value={inventory.currency.gp}
              onChange={(e) => handleCurrencyChange('gp', parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold text-center"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">SP:</label>
            <input
              type="number"
              min="0"
              value={inventory.currency.sp}
              onChange={(e) => handleCurrencyChange('sp', parseInt(e.target.value) || 0)}
              className="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-center"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">CP:</label>
            <input
              type="number"
              min="0"
              value={inventory.currency.cp}
              onChange={(e) => handleCurrencyChange('cp', parseInt(e.target.value) || 0)}
              className="w-14 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-amber-700 text-center"
            />
          </div>
          <span className="text-[11px] text-slate-500 italic ml-auto">
            Edit wealth directly if your DM granted extra gold or starting funds changed.
          </span>
        </div>

        {/* Inventory Item Rows */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map(it => {
              const isEquippable = it.category === 'armor' || it.category === 'shield';

              return (
                <div
                  key={it.id}
                  className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition ${
                    it.equipped
                      ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {it.category === 'weapon' && <Sword className="w-4 h-4 text-amber-400" />}
                      {it.category === 'armor' && <Shield className="w-4 h-4 text-blue-400" />}
                      {it.category === 'shield' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {it.category === 'pack' && <Package className="w-4 h-4 text-purple-400" />}
                      {it.category === 'tool' && <Wrench className="w-4 h-4 text-amber-500" />}
                      {it.category === 'gear' && <Briefcase className="w-4 h-4 text-slate-400" />}
                      {it.category === 'ammunition' && <Sparkles className="w-4 h-4 text-red-400" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-100">{it.name}</span>
                        {it.equipped && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                            Equipped
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">
                        Category: {it.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Equip Toggle, Quantity, Remove */}
                  <div className="flex items-center gap-3">
                    {isEquippable && (
                      <button
                        type="button"
                        onClick={() => handleToggleEquip(it.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          it.equipped
                            ? 'bg-amber-600 border-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {it.equipped ? '✓ Equipped' : 'Equip'}
                      </button>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(it.id, -1)}
                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-bold text-slate-200 px-1">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(it.id, 1)}
                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                      title="Remove from inventory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">No items in this category.</p>
          )}
        </div>
      </div>

      {/* 3. 2024 WEAPON MASTERY SELECTION */}
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

      {/* ADD ITEM SHOP MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" /> Equipment Catalog
                </h3>
                <p className="text-xs text-slate-400">Select any standard item to add to your backpack.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                  placeholder="Search weapons, armor, gear..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedShopCategory}
                onChange={(e) => setSelectedShopCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 capitalize"
              >
                <option value="all">All Categories</option>
                <option value="weapon">Weapons</option>
                <option value="armor">Armor</option>
                <option value="shield">Shields</option>
                <option value="ammunition">Ammunition</option>
                <option value="pack">Packs</option>
                <option value="gear">Gear & Potions</option>
                <option value="tool">Tools</option>
              </select>
            </div>

            {/* Item List */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {filteredShopItems.map((shopItem) => (
                <div
                  key={shopItem.name}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-100 block">{shopItem.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {shopItem.category} • Cost: {shopItem.cost}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleAddItemFromShop(shopItem);
                      setShowAddModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
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
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-600/20 transition cursor-pointer"
        >
          <span>Next: Spells & Magic</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
