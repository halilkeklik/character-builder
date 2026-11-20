import type { EquipmentItem, InventoryState } from '../types/character';
import { getItemByName } from './dataLoader';

export function resolveItemCategory(name: string): EquipmentItem['category'] {
  const lower = name.toLowerCase();
  if (lower === 'shield') return 'shield';
  if (
    lower.includes('armor') || 
    lower.includes('mail') || 
    lower.includes('leather') || 
    lower.includes('shirt') || 
    lower.includes('breastplate') ||
    lower.includes('plate') ||
    lower.includes('robe')
  ) {
    return 'armor';
  }
  if (
    lower.includes('arrow') || 
    lower.includes('bolt') || 
    lower.includes('bullet') || 
    lower.includes('needle')
  ) {
    return 'ammunition';
  }
  if (lower.includes('pack')) {
    return 'pack';
  }
  if (
    lower.includes('kit') || 
    lower.includes('supplies') || 
    lower.includes('tools') || 
    lower.includes('set') ||
    lower.includes('flute') ||
    lower.includes('lute') ||
    lower.includes('drum') ||
    lower.includes('instrument')
  ) {
    return 'tool';
  }
  // Check if weapon in ALL_ITEMS
  const it = getItemByName(name);
  if (it?.dmg1 || it?.type === 'M' || it?.type === 'R') {
    return 'weapon';
  }
  if (
    lower.includes('sword') || 
    lower.includes('axe') || 
    lower.includes('dagger') || 
    lower.includes('bow') || 
    lower.includes('spear') || 
    lower.includes('mace') || 
    lower.includes('javelin') || 
    lower.includes('flail') || 
    lower.includes('quarterstaff') || 
    lower.includes('scimitar') || 
    lower.includes('sickle') || 
    lower.includes('halberd') || 
    lower.includes('glaive') || 
    lower.includes('rapier') || 
    lower.includes('club')
  ) {
    return 'weapon';
  }
  return 'gear';
}

function cleanItemName(raw: string): string {
  if (!raw) return '';
  const first = raw.split('|')[0].trim();
  // Capitalize words
  return first
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getInitialInventory(
  classObj: any,
  bgObj: any,
  classPackage: string = 'A',
  bgPackage: string = 'A'
): InventoryState {
  const items: EquipmentItem[] = [];
  let totalGold = 0;

  // 1. Process Class Starting Equipment
  const classEq = classObj?.startingEquipment;
  const classDD = classEq?.defaultData || [];

  let foundClassOpt: any[] | null = null;
  for (const optMap of classDD) {
    if (optMap[classPackage]) {
      foundClassOpt = optMap[classPackage];
      break;
    }
  }

  if (foundClassOpt && Array.isArray(foundClassOpt)) {
    for (const entry of foundClassOpt) {
      if (entry.value !== undefined) {
        totalGold += Math.floor(entry.value / 100);
      } else if (entry.item) {
        const name = cleanItemName(entry.item);
        const qty = entry.quantity || 1;
        const cat = resolveItemCategory(name);
        items.push({
          id: `class-${name}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          quantity: qty,
          category: cat,
          equipped: cat === 'armor' || cat === 'shield',
        });
      } else if (entry.special) {
        items.push({
          id: `class-${entry.special}-${Math.random().toString(36).slice(2, 7)}`,
          name: entry.special,
          quantity: 1,
          category: 'gear',
        });
      }
    }
  } else if (classObj?.name === 'Artificer') {
    if (classPackage === 'A') {
      items.push(
        { id: 'art-1', name: 'Light Crossbow', quantity: 1, category: 'weapon' },
        { id: 'art-2', name: 'Crossbow Bolts (20)', quantity: 1, category: 'ammunition' },
        { id: 'art-3', name: 'Scale Mail', quantity: 1, category: 'armor', equipped: true },
        { id: 'art-4', name: "Thieves' Tools", quantity: 1, category: 'tool' },
        { id: 'art-5', name: "Dungeoneer's Pack", quantity: 1, category: 'pack' },
        { id: 'art-6', name: 'Dagger', quantity: 2, category: 'weapon' }
      );
      totalGold += 10;
    } else {
      totalGold += 125;
    }
  } else {
    // Default fallback if class had no A package
    totalGold += 10;
  }

  // 2. Process Background Starting Equipment
  const bgEq = bgObj?.startingEquipment;
  const bgDD = Array.isArray(bgEq) ? bgEq : [];

  let foundBgOpt: any[] | null = null;
  for (const optMap of bgDD) {
    if (optMap[bgPackage]) {
      foundBgOpt = optMap[bgPackage];
      break;
    }
  }

  if (foundBgOpt && Array.isArray(foundBgOpt)) {
    for (const entry of foundBgOpt) {
      if (entry.value !== undefined) {
        totalGold += Math.floor(entry.value / 100);
      } else if (entry.item) {
        const name = cleanItemName(entry.item);
        const qty = entry.quantity || 1;
        const cat = resolveItemCategory(name);
        // Only auto-equip if character doesn't already have armor/shield equipped
        const hasEquippedArmor = items.some(i => i.category === 'armor' && i.equipped);
        const hasEquippedShield = items.some(i => i.category === 'shield' && i.equipped);
        items.push({
          id: `bg-${name}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          quantity: qty,
          category: cat,
          equipped: (cat === 'armor' && !hasEquippedArmor) || (cat === 'shield' && !hasEquippedShield),
        });
      }
    }
  } else if (bgPackage === 'B') {
    totalGold += 50;
  } else {
    totalGold += 15;
  }

  // Ensure only one armor is equipped
  let armorFound = false;
  items.forEach(it => {
    if (it.category === 'armor') {
      if (it.equipped && !armorFound) {
        armorFound = true;
      } else {
        it.equipped = false;
      }
    }
  });

  return {
    classPackage,
    backgroundPackage: bgPackage,
    items,
    currency: {
      gp: totalGold,
      sp: 0,
      cp: 0,
    },
  };
}

export function calculateEquippedAC(
  dexMod: number,
  conMod: number,
  wisMod: number,
  className?: string,
  items: EquipmentItem[] = [],
  fightingStyle?: string,
  hasArmorOfShadows: boolean = false
): { totalAC: number; baseAC: number; armorName: string; hasShield: boolean; defenseBonus: number } {
  const equippedArmor = items.find(i => i.category === 'armor' && i.equipped);
  const hasShield = items.some(i => i.category === 'shield' && i.equipped);
  const isDefenseStyle = fightingStyle === 'Defense' && !!equippedArmor;
  const defenseBonus = isDefenseStyle ? 1 : 0;
  const shieldBonus = hasShield ? 2 : 0;

  if (equippedArmor) {
    const armorItem = getItemByName(equippedArmor.name);
    const rawType = armorItem?.type || '';
    const isLight = rawType.startsWith('LA') || equippedArmor.name.toLowerCase().includes('leather') || equippedArmor.name.toLowerCase().includes('padded');
    const isMedium = rawType.startsWith('MA') || equippedArmor.name.toLowerCase().includes('shirt') || equippedArmor.name.toLowerCase().includes('scale') || equippedArmor.name.toLowerCase().includes('hide') || equippedArmor.name.toLowerCase().includes('breastplate') || equippedArmor.name.toLowerCase().includes('half plate');
    const isHeavy = rawType.startsWith('HA') || equippedArmor.name.toLowerCase().includes('chain mail') || equippedArmor.name.toLowerCase().includes('splint') || equippedArmor.name.toLowerCase().includes('plate') || equippedArmor.name.toLowerCase().includes('ring mail');

    let baseArmor = armorItem?.ac || 11;
    if (equippedArmor.name.toLowerCase().includes('chain mail')) baseArmor = 16;
    if (equippedArmor.name.toLowerCase().includes('scale mail')) baseArmor = 14;
    if (equippedArmor.name.toLowerCase().includes('chain shirt')) baseArmor = 13;
    if (equippedArmor.name.toLowerCase().includes('studded leather')) baseArmor = 12;
    if (equippedArmor.name.toLowerCase().includes('leather armor')) baseArmor = 11;

    let dexContrib = 0;
    if (isLight) {
      dexContrib = dexMod;
    } else if (isMedium) {
      dexContrib = Math.min(dexMod, 2);
    } else if (isHeavy) {
      dexContrib = 0;
    } else {
      dexContrib = Math.min(dexMod, 2);
    }

    const baseAC = baseArmor + dexContrib;
    const totalAC = baseAC + shieldBonus + defenseBonus;
    return {
      totalAC,
      baseAC,
      armorName: equippedArmor.name,
      hasShield,
      defenseBonus
    };
  }

  // Unarmored
  let unarmoredBase = 10 + dexMod;
  let armorName = 'Unarmored';

  if (hasArmorOfShadows) {
    unarmoredBase = Math.max(unarmoredBase, 13 + dexMod);
    armorName = 'Mage Armor (Armor of Shadows)';
  } else if (className === 'Barbarian') {
    unarmoredBase = 10 + dexMod + conMod;
    armorName = 'Unarmored Defense (Barbarian)';
  } else if (className === 'Monk') {
    unarmoredBase = 10 + dexMod + wisMod;
    armorName = 'Unarmored Defense (Monk)';
  }

  // Shields do not work with Monk unarmored defense
  const effectiveShieldBonus = className === 'Monk' ? 0 : shieldBonus;
  const totalAC = unarmoredBase + effectiveShieldBonus;

  return {
    totalAC,
    baseAC: unarmoredBase,
    armorName,
    hasShield: effectiveShieldBonus > 0,
    defenseBonus: 0
  };
}

export const COMMON_SHOP_ITEMS: { name: string; category: EquipmentItem['category']; cost: string }[] = [
  // Weapons
  { name: 'Dagger', category: 'weapon', cost: '2 GP' },
  { name: 'Shortsword', category: 'weapon', cost: '10 GP' },
  { name: 'Longsword', category: 'weapon', cost: '15 GP' },
  { name: 'Greatsword', category: 'weapon', cost: '50 GP' },
  { name: 'Rapier', category: 'weapon', cost: '25 GP' },
  { name: 'Scimitar', category: 'weapon', cost: '25 GP' },
  { name: 'Handaxe', category: 'weapon', cost: '5 GP' },
  { name: 'Battleaxe', category: 'weapon', cost: '10 GP' },
  { name: 'Greataxe', category: 'weapon', cost: '30 GP' },
  { name: 'Spear', category: 'weapon', cost: '1 GP' },
  { name: 'Quarterstaff', category: 'weapon', cost: '2 SP' },
  { name: 'Javelin', category: 'weapon', cost: '5 SP' },
  { name: 'Mace', category: 'weapon', cost: '5 GP' },
  { name: 'Flail', category: 'weapon', cost: '10 GP' },
  { name: 'Halberd', category: 'weapon', cost: '20 GP' },
  { name: 'Shortbow', category: 'weapon', cost: '25 GP' },
  { name: 'Longbow', category: 'weapon', cost: '50 GP' },
  { name: 'Light Crossbow', category: 'weapon', cost: '25 GP' },
  { name: 'Heavy Crossbow', category: 'weapon', cost: '50 GP' },

  // Armor & Shield
  { name: 'Shield', category: 'shield', cost: '10 GP' },
  { name: 'Padded Armor', category: 'armor', cost: '5 GP' },
  { name: 'Leather Armor', category: 'armor', cost: '10 GP' },
  { name: 'Studded Leather Armor', category: 'armor', cost: '45 GP' },
  { name: 'Hide Armor', category: 'armor', cost: '10 GP' },
  { name: 'Chain Shirt', category: 'armor', cost: '50 GP' },
  { name: 'Scale Mail', category: 'armor', cost: '50 GP' },
  { name: 'Breastplate', category: 'armor', cost: '400 GP' },
  { name: 'Half Plate Armor', category: 'armor', cost: '750 GP' },
  { name: 'Ring Mail', category: 'armor', cost: '30 GP' },
  { name: 'Chain Mail', category: 'armor', cost: '75 GP' },
  { name: 'Splint Armor', category: 'armor', cost: '200 GP' },
  { name: 'Plate Armor', category: 'armor', cost: '1,500 GP' },

  // Ammunition
  { name: 'Arrows (20)', category: 'ammunition', cost: '1 GP' },
  { name: 'Crossbow Bolts (20)', category: 'ammunition', cost: '1 GP' },
  { name: 'Sling Bullets (20)', category: 'ammunition', cost: '4 CP' },

  // Packs
  { name: "Burglar's Pack", category: 'pack', cost: '16 GP' },
  { name: "Dungeoneer's Pack", category: 'pack', cost: '12 GP' },
  { name: "Entertainer's Pack", category: 'pack', cost: '40 GP' },
  { name: "Explorer's Pack", category: 'pack', cost: '10 GP' },
  { name: "Priest's Pack", category: 'pack', cost: '19 GP' },
  { name: "Scholar's Pack", category: 'pack', cost: '40 GP' },

  // Gear & Tools
  { name: "Thieves' Tools", category: 'tool', cost: '25 GP' },
  { name: 'Healer\'s Kit', category: 'gear', cost: '5 GP' },
  { name: 'Holy Symbol', category: 'gear', cost: '5 GP' },
  { name: 'Arcane Focus (Orb)', category: 'gear', cost: '20 GP' },
  { name: 'Arcane Focus (Wand)', category: 'gear', cost: '10 GP' },
  { name: 'Component Pouch', category: 'gear', cost: '25 GP' },
  { name: 'Potion of Healing', category: 'gear', cost: '50 GP' },
  { name: 'Rope, Hempen (50 feet)', category: 'gear', cost: '1 GP' },
  { name: 'Torch (10)', category: 'gear', cost: '1 SP' },
  { name: 'Rations (10 days)', category: 'gear', cost: '5 GP' },
  { name: 'Waterskin', category: 'gear', cost: '2 SP' },
  { name: 'Bedroll', category: 'gear', cost: '1 GP' },
  { name: 'Crowbar', category: 'gear', cost: '2 GP' },
  { name: 'Grappling Hook', category: 'gear', cost: '2 GP' },
];
