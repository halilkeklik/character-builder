# 🐉 D&D 2024 Character Builder (5.5e / Revised 5e)

A modern, fast, and feature-rich digital character creator built for **D&D 2024 (Revised 5e / 5.5e)**. Sourced with structured data from the **5e.tools** open-source data ecosystem.

![D&D 2024 Character Builder](https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

- **2024 Core Ruleset & Mechanics:**
  - **Origin Backgrounds:** Ability score increases (+2/+1 or +1/+1/+1) tied to Backgrounds rather than species.
  - **Origin Feats:** Automatic origin feats granted at 1st level (Alert, Tough, Magic Initiate, etc.).
  - **Weapon Mastery:** 2024 tactical mastery system (Cleave, Graze, Nick, Push, Sap, Slow, Topple, Vex) with 40+ compatible weapons.
  - **Level 3 Subclasses:** All 12 core classes unlock their archetype/subclass at Level 3.
- **Classes & Subclasses:**
  - **13 Classes:** All 12 revised 2024 Player's Handbook (`XPHB`) classes plus the **Artificer (`TCE`)**.
  - **110 Modern Subclasses:** Comprehensive, curated subclass library from `XPHB`, `TCE` (Tasha's), `XGE` (Xanathar's), and campaign settings. (Legacy 2014 content excluded).
- **Species (Races):**
  - 10 official species (Human, Elf, Dwarf, Halfling, Dragonborn, Goliath, Orc, Tiefling, Gnome, Aasimar) with racial traits, speeds, and sizes.
- **Ability Scores Generation:**
  - Interactive **Point Buy** (27 points calculator).
  - **Standard Array** (15, 14, 13, 12, 10, 8).
  - **Roll 4d6 Drop Lowest** with live dice simulation.
- **Interactive Character Sheet:**
  - Real-time combat vitals: AC, HP, Initiative, Speed, Hit Dice, Passive Perception.
  - 18 Skills & Saving Throws with proficiency badges and modifier calculations.
  - Attack & Damage calculations with weapon masteries.
  - Spellcasting DC and attack bonuses with full spell previews.
  - **Save & Load JSON:** Export character files or import saved characters anytime.
  - **Print / PDF Sheet:** Clean, high-contrast print-friendly layout.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Or simply double-click `start.bat` on Windows!

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Effects:** Canvas-Confetti
- **Data Source:** 5e.tools JSON core data repository

---

## 📜 License

This project is created for personal, educational, and tabletop gaming use under the OGL / Creative Commons SRD 5.2.
