import urllib.request
import json
import os
import sys

BASE_URLS = [
    "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data",
    "https://raw.githubusercontent.com/5etools-mirror-2/5etools-mirror-2.github.io/master/data",
    "https://raw.githubusercontent.com/TheGiddyLimit/5etools-mirror-2/master/data",
]

# Non-legacy modern official sources
OFFICIAL_SOURCES = {
    'XPHB': "2024 Player's Handbook",
    'TCE': "Tasha's Cauldron of Everything",
    'XGE': "Xanathar's Guide to Everything",
    'SCAG': "Sword Coast Adventurer's Guide",
    'ERLW': "Eberron: Rising from the Last War",
    'EGtW': "Explorer's Guide to Wildemount",
    'VRGtR': "Van Richten's Guide to Ravenloft",
    'FToD': "Fizban's Treasury of Dragons",
    'BGG': "Bigby Presents: Glory of the Giants",
    'DSotDQ': "Dragonlance: Shadow of the Dragon Queen",
    'SCC': "Strixhaven: A Curriculum of Chaos",
    'AAG': "Astral Adventurer's Guide",
    'AI': "Acquisitions Incorporated",
    'MOT': "Mythic Odysseys of Theros",
    'GGR': "Guildmasters' Guide to Ravnica"
}

def fetch_json(path):
    for base in BASE_URLS:
        url = f"{base}/{path}"
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    data = response.read().decode('utf-8')
                    return json.loads(data)
        except Exception as e:
            continue
    print(f"Failed to fetch {path} from all sources")
    return None

def main():
    out_dir = os.path.join(os.path.dirname(__file__), "..", "src", "data")
    os.makedirs(out_dir, exist_ok=True)

    print("Fetching Classes and Modern Non-Legacy Subclasses...")
    classes = [
        "artificer", "barbarian", "bard", "cleric", "druid", "fighter", 
        "monk", "paladin", "ranger", "rogue", "sorcerer", 
        "warlock", "wizard"
    ]
    
    all_classes = []
    raw_subclasses = []

    for c in classes:
        c_data = fetch_json(f"class/class-{c}.json")
        if c_data:
            cls_list = c_data.get("class", [])
            # Prefer XPHB (2024), else TCE (for Artificer)
            xphb_cls = [x for x in cls_list if x.get("source") == "XPHB"]
            if xphb_cls:
                all_classes.append(xphb_cls[0])
            else:
                tce_cls = [x for x in cls_list if x.get("source") == "TCE"]
                if tce_cls:
                    all_classes.append(tce_cls[0])
                elif cls_list:
                    all_classes.append(cls_list[0])

            # Collect non-legacy subclasses (strictly NO PHB 2014, NO DMG)
            for sc in c_data.get("subclass", []):
                src = sc.get("source")
                if src in OFFICIAL_SOURCES and src not in ['PHB', 'DMG']:
                    sc["sourceFull"] = OFFICIAL_SOURCES.get(src, src)
                    raw_subclasses.append(sc)

    # Clean and deduplicate:
    # 1. First add all XPHB (2024) subclasses
    # 2. Then add non-XPHB only if they were NOT reprinted in XPHB
    clean_subclasses = []
    seen = set()
    xphb_subclass_names = set(s.get("name", "").lower() for s in raw_subclasses if s.get("source") == "XPHB")

    # Add 2024 XPHB subclasses
    for sc in raw_subclasses:
        if sc.get("source") == "XPHB":
            key = (sc.get("className", "").lower(), sc.get("name", "").lower())
            if key not in seen:
                seen.add(key)
                clean_subclasses.append(sc)

    # Add modern expansion subclasses (TCE, XGE, etc.) that don't duplicate XPHB
    for sc in raw_subclasses:
        if sc.get("source") != "XPHB":
            name_lower = sc.get("name", "").lower()
            key = (sc.get("className", "").lower(), name_lower)
            if key not in seen and name_lower not in xphb_subclass_names:
                seen.add(key)
                clean_subclasses.append(sc)

    # Sort subclasses: XPHB first, then TCE, XGE, others, alphabetically by name
    def sort_key(s):
        priority = 0 if s.get("source") == "XPHB" else (1 if s.get("source") == "TCE" else (2 if s.get("source") == "XGE" else 3))
        return (s.get("className", ""), priority, s.get("name", ""))

    clean_subclasses.sort(key=sort_key)

    print(f"Total Modern Classes: {len(all_classes)}")
    print(f"Total Clean Non-Legacy Subclasses: {len(clean_subclasses)}")

    with open(os.path.join(out_dir, "classes.json"), "w", encoding="utf-8") as f:
        json.dump({"classes": all_classes, "subclasses": clean_subclasses}, f, ensure_ascii=False, indent=2)

    # Spells: 2024 XPHB + TCE (for Artificer/TCE exclusive spells like Booming Blade, Green-Flame Blade, etc.)
    print("Fetching 2024 Core and Modern Spells...")
    sources_data = fetch_json("spells/sources.json")
    spells_xphb = fetch_json("spells/spells-xphb.json")
    spells_tce = fetch_json("spells/spells-tce.json")

    all_spells_dict = {}

    def ingest_spells(spell_list):
        if not spell_list: return
        for s in spell_list.get("spell", []):
            name = s.get("name")
            if name not in all_spells_dict or s.get("source") == "XPHB":
                all_spells_dict[name] = s

    ingest_spells(spells_tce)
    ingest_spells(spells_xphb) # 2024 takes precedence

    if sources_data:
        for src_key, spell_map in sources_data.items():
            for sp_name, sp_meta in spell_map.items():
                if sp_name in all_spells_dict and "class" in sp_meta:
                    if "classes" not in all_spells_dict[sp_name]:
                        all_spells_dict[sp_name]["classes"] = {}
                    all_spells_dict[sp_name]["classes"]["fromClassList"] = sp_meta["class"]

    final_spells = list(all_spells_dict.values())
    print(f"Total non-legacy spells: {len(final_spells)}")

    with open(os.path.join(out_dir, "spells.json"), "w", encoding="utf-8") as f:
        json.dump(final_spells, f, ensure_ascii=False, indent=2)

    print("Legacy removed completely! Clean 2024 + Modern data saved.")

if __name__ == "__main__":
    main()
