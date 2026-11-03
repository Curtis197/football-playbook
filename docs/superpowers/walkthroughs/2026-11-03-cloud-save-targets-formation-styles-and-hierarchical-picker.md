# Walkthrough: Multi-Target Cloud Save, Formation Style Classification & Hierarchical Game-Planning Concept Flow

**Date**: 2026-11-03  
**Status**: Verified & Passing (TypeScript, Vite Build, Oxlint, Feature Integrity)

---

## 1. Overview & Objectives

Coaches requested three interconnected capabilities to enhance offensive and defensive game-planning:
1. **Multi-Target Cloud Persistence**: In addition to saving the active play, provide options in the cloud save menu to save the current **Offensive Formation**, save the **Defensive Front** (with alignment techniques), or save the entire **Playbook**.
2. **Formation Style Categorization & Sorting**: Categorize formations into recognizable styles:
   - **Offense**: `Pro Style`, `Spread`, `Old School`
   - **Defense**: `Even Front (4-Down)`, `Odd Front (3-Down)`, `Heavy / Bear`
   Provide optgroup grouping in dropdowns and filter tabs in the formation switcher modal.
3. **Hierarchical Game-Planning Pick Flow**:
   Seamlessly navigate from:
   $$\text{Offensive Formation (e.g. Pro-I)} \longrightarrow \text{Play / Concept (e.g. Veer Option)} \longrightarrow \text{Defensive Front (e.g. 3-5 Odd)}$$
   allowing coaches to switch defensive fronts on the fly to observe how the play and offensive blocking schemes adapt.

---

## 2. Changes Implemented

### A. Multi-Target Cloud Save (`src/components/Toolbar.tsx` & `src/App.tsx`)
- Extended `ToolbarProps` with `onSaveToCloudOption?: (target: CloudSaveTarget) => void` where `CloudSaveTarget = 'play' | 'offense' | 'defense' | 'playbook'`.
- Built a split-button dropdown in `Toolbar.tsx`:
  - **Quick Click**: Saves the active play with visual sync indicator (`saving`, `saved`, `error`, `idle`).
  - **Dropdown Menu**:
    - 🏈 **Save Active Play**: Saves current play concept, vector actions, notes, and player positions to Firestore `plays`.
    - ⚡ **Save Offensive Formation**: Extracts the 11 offensive players from the canvas, sets style/labels, and saves to Firestore `formations`.
    - 🛡️ **Save Defensive Front**: Extracts the 11 defensive players from the canvas, ensures valid gap techniques with `inferDefenderTechnique`, and saves to Firestore `formations`.
    - 📚 **Save Entire Playbook**: Batch syncs all plays in the playbook to Firestore.
- Added click-outside listener to auto-dismiss the menu.

### B. Formation Style Categorization & Labeling (`src/types/playbook.ts` & `src/data/presets.ts`)
- Added `FormationStyle` type (`'pro_style' | 'spread' | 'old_school' | 'even_front' | 'odd_front' | 'heavy_front' | 'hybrid' | string`) and `labels?: string[]` to the `Formation` interface.
- Categorized all 8 basic offensive formations:
  - `pro_style`: Pro-I Formation, Single-Back Ace (12 Personnel)
  - `spread`: Spread 2x2 Open (Doubles), Spread 3x1 Trips Open, Shotgun Bunch Right, Empty 3x2 Quads
  - `old_school`: Shotgun Wishbone 21 Pers, Pistol Diamond 20 Personnel
- Categorized all 7 basic defensive fronts:
  - `even_front`: 4-3 Over Front, 4-3 Under Front, 4-2-5 Nickel Over
  - `odd_front`: 3-4 Over Front, 3-5 Odd Front (3-3-5 Stack), Mint / Tite Front
  - `heavy_front`: Bear / 46 Front
- Synced enriched formations to Firestore using `scripts/update-formations-and-presets.mjs`.

### C. Hierarchical Game-Planning HUD on Canvas (`src/components/ChalkboardCanvas.tsx`)
- Updated `ChalkboardCanvasProps` to accept `allPlays?: Play[]`, `activePlayId?: string`, and `onSelectPlay?: (playId: string) => void`.
- Structured the top HUD bar into a 3-step game planning progression:
  1. **Offense Formation**: Grouped by `<optgroup label="Pro Style (Under Center & Heavy)">`, `<optgroup label="Spread (10 & 11 Personnel)">`, `<optgroup label="Old School (Option & Multi-Back)">`. Includes 1-click `💾 Update` button.
  2. **Play / Concept Picker**: Grouped into `<optgroup label="Plays for this Formation (N)">` and `<optgroup label="Other Playbook Plays (M)">`. Allows switching directly between concepts for the chosen formation or exploring other plays.
  3. **Defense Front**: Grouped by `<optgroup label="Even Fronts (4-Down Linemen)">`, `<optgroup label="Odd Fronts (3-Down Linemen)">`, `<optgroup label="Heavy / Bear Fronts">`. Includes 1-click `💾 Update` button.
- When changing defense front against an active play, defenders automatically snap to their assigned techniques based on the current offensive gap structure.

### D. Enhanced Formation Switcher Modal (`src/components/FormationSwitcherModal.tsx`)
- Added **Side Tabs** (`All`, `Offense`, `Defense`) with real-time count badges.
- Added **Style Filter Pills**:
  - Offense: `All Styles`, `Pro Style`, `Spread`, `Old School`
  - Defense: `All Fronts`, `Even (4-Down)`, `Odd (3-Down)`, `Heavy / Bear`
- Added colored style badges and label tags to each formation card in the left list.
- Expanded the "Save Chalkboard Alignment as New Formation Template" form with a **Style Category** dropdown and **Labels** input.

---

## 3. Verification & Testing

- **TypeScript Compilation & Production Build**:
  - `npm run build` executed `tsc -b && vite build` successfully with 0 errors.
- **OxLint Check**:
  - `npm run lint` checked 27 files with 116 rules: 0 warnings, 0 errors.
- **Feature Integrity Audit**:
  - `npm run check:integrity` confirmed all core capabilities and feature entries are intact.
- **Deletion Audit**:
  - `git diff --diff-filter=D` confirmed 0 files or routes were removed.

---

## 4. Summary of Modified Files

- `src/types/playbook.ts`: Added `FormationStyle` type and `style`, `labels`, `updatedAt` to `Formation`.
- `src/components/Toolbar.tsx`: Added multi-target cloud save split dropdown menu and state handlers.
- `src/App.tsx`: Implemented `handleSaveToCloud` supporting `'play'`, `'offense'`, `'defense'`, and `'playbook'` targets; connected props to `ChalkboardCanvas` and `Toolbar`.
- `src/components/ChalkboardCanvas.tsx`: Added hierarchical Play/Concept picker on the HUD, grouped offense and defense `<select>` options by style with `<optgroup>`, and wired `onSelectPlay`.
- `src/components/FormationSwitcherModal.tsx`: Added scope and style filter pills, card badges, label tags, and style selection in the new formation form.
- `src/data/presets.ts`: Added `PRO_I_VEER_OPTION_PLAY` and enriched all 15 base formations with styles and labels.
- `scripts/update-formations-and-presets.mjs`: Utility script for batch-syncing styled formations to Firestore.
- `docs/FEATURE_INVENTORY.md`: Updated with full documentation for cloud targets, formation styles, and hierarchical concept picker.
