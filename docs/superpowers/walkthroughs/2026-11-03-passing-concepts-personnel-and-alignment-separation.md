# Walkthrough: Passing Concepts Library Separated by Personnel & Receiver Alignment

## 1. Overview
This task delivered the core passing concepts suite—**Stick**, **Snag (Y-Corner)**, **Mesh**, and **Shallow Cross (Drive)**—with multi-dimensional categorization and filtering separated by:
1. **Passing Concept Family**: Stick, Snag, Mesh, Shallow Cross.
2. **Backfield Personnel**: 11 Personnel (1 RB, 1 TE, 3 WRs), 12 Personnel (1 RB, 2 TEs, 2 WRs), 20 Personnel (2 RBs, 0 TEs, 3 WRs), 21 Personnel (2 RBs, 1 TE, 2 WRs), 22 Personnel (2 RBs, 2 TEs, 1 WR).
3. **Receiver Alignment**: 3x1 Trips Open, 2x2 Doubles / Ace Wing, 2x1 Pro-Set, Bunch, Empty.

These concept plays are integrated with the **#1 / #2 / #3 Outside Concept** route adaptation engine, enabling seamless transfer of the triangle, rub, and high-low geometries across any offensive formation or receiver alignment.

---

## 2. Key Changes & Architecture

### Types & Data Model (`src/types/playbook.ts`)
- Added `'pass_dropback'` to `PlayCategory` (`'run' | 'pass_action' | 'pass_dropback' | 'rpo' | 'screen' | 'blitz_pickup'`).
- Introduced `PassingConcept`: `'stick' | 'snag' | 'mesh' | 'shallow_cross' | 'smash' | 'flood' | 'dagger' | 'drive' | string`.
- Added `primaryPassConcept?: PassingConcept`, `personnel?: string`, and `receiverAlignment?: ReceiverAlignment` to the `Play` interface.

### Foundational Concept Plays (`src/data/passingConcepts.ts`)
Created 4 meticulously diagrammed passing schemes with 11 offensive players, 11 defensive players (with gap techniques and assignments), precise Catmull-Rom routes, sharp break cuts, pass protection, and coaching notes:
1. **Gun 11P Trips - Y-Stick vs 4-3 Over**:
   - 11 Personnel, 3x1 Trips Open.
   - 3-man triangle read: #1 Outside MOR Go, #2 5-Yard Stick (plant outside foot, sit in void), #3 Speed Flat/Arrow to pull Apex defender. Weakside check & release flat, backside single-high alert slant.
2. **Pro-Set 21P - Snag / Y-Corner vs 3-4 Over**:
   - 21 Personnel, 2x1 Pro-Set.
   - 3-level perimeter flood: #1 Snag/Mini-Curl (sit at 5-6 yards in curl window), Corner route (stem 8-10 yards, 45° break to pylon), Arrow/Speed Flat from backfield.
3. **Single-Back 12P - Mesh vs 4-2-5 Nickel**:
   - 12 Personnel, 2x2 Ace Wing.
   - Rub concept crossing routes at 4-5 yards depth: Under shallow crosser (setting the mesh) and Over shallow crosser (rubbing underneath trailing defenders), with twin Post-Corner and Wheel/Overhang perimeter options.
4. **Pistol 20P - Shallow Cross vs 3-5 Odd**:
   - 20 Personnel, 2x2 Diamond.
   - High-low conflict on middle linebacker: #1 Shallow Drag under Mike LB at 3 yards depth, paired with Dig / Hunt route digging into vacated window at 10 yards depth behind flowing Mike.

### Preset Playbook Integration (`src/data/presets.ts`)
- Integrated `BASIC_PASSING_CONCEPTS_PLAYS` into `INITIAL_PLAYBOOK.plays`.
- Exported individual plays for modular testing and seeding.

### Multi-Dimensional Filter Bar & Badges (`src/components/PlayLibraryModal.tsx`)
- Added multi-dimensional filter bar with one-click pills:
  - **Concept Family Filter**: `All`, `Stick`, `Snag`, `Mesh`, `Shallow`.
  - **Personnel Filter**: `All`, `11P`, `12P`, `20P`, `21P`, `22P`.
  - **Receiver Alignment Filter**: `All`, `3x1`, `2x2`, `2x1`, `Bunch`, `Empty`.
  - **Category Pills**: Added `Pass` (`pass_dropback`).
- Dynamic Badges on Play Cards:
  - Passing Concept (Indigo `#6366f1` with Target icon).
  - Personnel Grouping (Blue `#3b82f6` with Users icon).
  - Receiver Alignment (Emerald `#10b981` with Layers icon).
- 1-Click "Reset All Filters" whenever any multi-dimensional filter or tag is active.

### Concept-Organized Play Selector on Chalkboard Canvas (`src/components/ChalkboardCanvas.tsx`)
- Updated HUD Play dropdown with hierarchical optgroups:
  - `Plays for this Formation`
  - `Passing Concepts (Stick, Snag, Mesh, Shallow)`
  - `Run & Option Schemes`
  - `RPO & Play-Action`
  - `Other Playbook Plays`

### Category Selector in Main Toolbar (`src/components/Toolbar.tsx`)
- Added `Dropback Pass` option with indigo styling (`bg-indigo-900/60 text-indigo-300 border-indigo-500/50`).

---

## 3. Verification & Testing

- **TypeScript Compilation & Production Build**:
  - `npm run build` -> Passed with 0 errors (`vite v8.3.5 built in 3.94s`).
- **Code Linter**:
  - `npm run lint` (`oxlint`) -> 0 warnings and 0 errors across 31 files.
- **Feature Inventory Integrity Check**:
  - `npm run check:integrity` -> Passed (`FEATURE_INVENTORY.md is in order`).
- **Anti-Deletion Audit**:
  - `git diff --diff-filter=D` -> Clean (0 files deleted).
