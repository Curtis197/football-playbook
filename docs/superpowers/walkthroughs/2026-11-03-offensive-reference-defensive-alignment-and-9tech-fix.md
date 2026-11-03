# Walkthrough: Offensive Receiver Reference Alignment for DBs & 9-Technique Edge Fix

## Overview
This task resolves two critical defensive alignment challenges requested by coaches:
1. **Dynamic Offensive Player References for Defensive Backs (CB & NB)**: Enables cornerbacks and slot defenders to anchor directly to offensive receiver positions (`#1 Outside WR`, `#2 Slot`, `#3 Inner Slot`, or specific offensive players) with customized coverage leverage (`Off Cushion`, `Press`, `Inside Shade`, `Outside Shade`, `Head-Up`, `Apex Overhang`).
2. **9-Technique / Wide-9 Edge Rusher Fix**: Corrects a bug where perimeter wide receivers (e.g., `Z` at $x=860$) were misclassified as Tight Ends, throwing the 9-technique defensive end off into the sideline ($x=895$). Strict inline TE proximity ($\le 85\text{px}$) and receiver exclusion ensure edge rushers anchor strictly 45px outside the Offensive Tackle or 28px outside an attached inline TE.

---

## Changes Implemented

### 1. Data Schema Extension (`src/types/playbook.ts`)
- Added `AlignmentLeverage` type: `'head_up' | 'inside_shade' | 'outside_shade' | 'press' | 'off_cushion' | 'apex'`.
- Extended `Player` schema with:
  - `alignReferenceTarget?: string;` (e.g. `'#1_wr_left'`, `'#1_wr_right'`, `'#2_slot_left'`, `'#2_slot_right'`, `'#3_slot_left'`, `'#3_slot_right'`, or an offensive player ID/label).
  - `alignLeverage?: AlignmentLeverage;` (coverage cushion depth and horizontal shade).

### 2. Defensive Alignment & Tight End Engine (`src/utils/defensiveAlignment.ts`)
- **Tight End Proximity Guard**:
  - Enforced inline proximity: only offensive players within $85\text{px}$ horizontally of the Offensive Tackle and $\le 45\text{px}$ from the LOS qualify as Tight End candidates.
  - Added explicit exclusion list: `X`, `Z`, `WR`, `QB`, `RB`, `FB` can never be classified as Tight Ends.
- **Numbered Receiver Hierarchy Analysis**:
  - `analyzeOffense` sorts eligible perimeter receivers from sideline inward into `number1Left`, `number2Left`, `number3Left`, `number1Right`, `number2Right`, `number3Right`.
  - Added `allPlayers: Player[]` to `OffensiveStructure` for direct ID and label target matching.
- **Reference-Target Calculation**:
  - In `calculateDefensiveAlignmentPosition(tech, structure, player?)`, prioritized explicit `player.alignReferenceTarget` and `player.alignLeverage`.
  - Calculates authentic coordinates:
    - Press Coverage: $2.5\text{ yds}$ depth (`pressY`), aligned head-up or with $8\text{px}$ inside shade.
    - Off Cushion: $7\text{ yds}$ depth (`offCbY`), aligned with $12\text{px}$ inside shade.
    - Apex Overhang: midpoint between slot receiver and offensive tackle at $y = \text{losY} - 80$.
- **9-Technique / Wide-9 Edge Calculation**:
  - When no attached TE is present, anchors exactly $45\text{px}$ outside the Offensive Tackle (`ltX - 45` or `rtX + 45`).
  - When an attached inline TE is present, anchors $28\text{px}$ outside the TE (`lteX - 28` or `rteX + 28`).
  - Completely eliminates 9-tech DEs straying past perimeter receivers into the sideline.

### 3. Inspector Panel Reference Controls (`src/components/InspectorPanel.tsx`)
- Added **"Offensive Reference (CB / NB)"** configuration card within the Pre-Align section:
  - **Target Player Dropdown**: Auto (from technique), Numbered Receivers (`#1 WR Left`, `#1 WR Right`, `#2 Slot Left`, `#2 Slot Right`, etc.), or specific offensive players with on-field coordinates.
  - **Leverage / Depth Dropdown**: `Off Cushion (7 yds)`, `Press (2.5 yds)`, `Inside Shade`, `Outside Shade`, `Head-Up`, `Apex Overhang`.
  - **Status Indicator**: Displays an `Anchored` badge when a defender is locked onto an offensive player.
  - Updates position immediately on selection using `calculateDefensiveAlignmentPosition`.
- Updated `handleApplyDefensiveTechnique`, `handleSnapPlayerToAlignment`, and status pill to pass `selectedPlayer` into alignment calculation.

### 4. Canvas & Formation Integration (`src/App.tsx` & `src/components/ChalkboardCanvas.tsx`)
- Passed `selectedPlayer` / `p` into `calculateDefensiveAlignmentPosition` calls during defensive front loading and canvas selection.
- Maintained automatic realignment when offensive formations switch: anchored defenders seamlessly track their designated receiver targets.

---

## Verification & Testing

### 1. Linter Audit (`npm run lint`)
- Ran `oxlint` across 33 project files.
- **Result**: 0 errors, 0 warnings.

### 2. TypeScript & Production Build (`npm run build`)
- Executed `tsc -b && vite build`.
- **Result**: All 2086 modules compiled and bundled cleanly into production assets without error.

### 3. Feature Integrity & Anti-Deletion Audit
- Ran `npm run check:integrity`: PASSED (`docs/FEATURE_INVENTORY.md` updated and in order).
- Ran `git diff --diff-filter=D`: PASSED (0 files deleted).
