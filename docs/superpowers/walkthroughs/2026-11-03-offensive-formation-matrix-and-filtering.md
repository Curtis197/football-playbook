# Walkthrough: Offensive Formation Matrix & Multi-Facet Formation Picker

**Date:** 2026-11-03  
**Status:** Completed & Verified  

---

## 1. Overview & Goals

The goal of this task was to systematically categorize American football offensive formations across four fundamental dimensions:
1. **Backfield Personnel Number** (`21`, `31`, `30`, `20`, `22`, `12`, `11`, `10`, `01`, `00`).
2. **QB Position / Alignment** (`Shotgun`, `Pistol`, `Down Center` / Under Center).
3. **Receiver Alignment & Distribution** (`2x2`, `3x1`, `2x1`, `3x2` Empty, `4x1` Quads, `1x1` Tight, and Bunch clusters).
4. **Offensive Style Family** (`Pro Style`, `Spread`, `Old School`).

Once mapped, integrate these formations into the app and Firebase Firestore (`formations` collection), and upgrade the **Base Formation Templates Picker** (`FormationSwitcherModal.tsx`) with real-time multi-facet filtering, text search, active filter count, and 1-click Firebase synchronization.

---

## 2. Key Changes & Architecture

### A. Extended Formation Schema (`src/types/playbook.ts`)
- Added `QBPosition`: `'shotgun' | 'pistol' | 'down_center' | string`.
- Added `ReceiverAlignment`: `'1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '1x3' | '3x2' | '2x3' | '4x1' | '1x4' | 'bunch' | string`.
- Extended `Formation` with:
  - `personnel?: string`
  - `qbPosition?: QBPosition`
  - `receiverAlignment?: ReceiverAlignment`
  - `isBunch?: boolean`
  - `tags?: string[]`

### B. Matrix Formations Catalog (`src/data/offensiveFormationsMatrix.ts` & `src/data/presets.ts`)
- Preserved all existing formations and 7 defensive fronts without any deletions.
- Built normalized 0-1000 x 700 coordinate alignments for all 11 players across:
  - **31 Personnel**: Classic Wishbone 31, Delaware Wing-T 31, Maryland I 31, Power-T 31, Pistol Full House 31.
  - **30 Personnel**: Wishbone Open 30, Shotgun Diamond 30.
  - **22 Personnel**: Power-I Tank 22, Double Wing 22, Pistol Heavy 22.
  - **21 Personnel**: Pro-I Classic 21, Strong-I 21, Weak-I 21, Split Backs Pro 21, Shotgun Split 21, Pistol I-Form 21, Pro-I Condensed Bunch 21, Shotgun 21 Wing Bunch.
  - **20 Personnel**: Gun 20 Split (Pony), Gun 20 Trips, Gun 20 Pony Bunch, Pistol Diamond 20.
  - **12 Personnel**: Single-Back Ace 12, Gun 12 Doubles (Y-Off), Gun 12 Trey Bunch, Pistol 12 Wing, Under Center 12 Wing Bunch.
  - **11 Personnel**: Spread 2x2, Spread Trips 3x1, Gun 11 Bunch, Gun 11 Snug Bunch, Pistol 11 Bunch, Under Center 11 Condensed Bunch, Under Center 11 Slot, Pistol 11 Doubles.
  - **10 Personnel**: Gun 10 Doubles (4-Wide), Gun 10 Trips Open, Gun 10 Bunch Open, Gun 10 Quads Bunch.
  - **Empty Sets (01/00)**: Empty 3x2, Gun Empty 01 Bunch, Gun Empty 00 5-Wide, Gun Empty 00 Double Bunch.

### C. Formation Picker Multi-Facet Filtering UI (`src/components/FormationSwitcherModal.tsx`)
- **Real-Time Text Search**: Quick search input with instant matching across name, personnel, description, tags, and labels.
- **Backfield Personnel Pills**: Quick toggle for `All`, `31`, `30`, `22`, `21`, `20`, `12`, `11`, `10`, `00/01`.
- **QB Position Pills**: Quick toggle for `All`, `Gun`, `Pistol`, `Center`.
- **Receiver Alignment Pills**: Quick toggle for `All`, `2x2`, `3x1`, `2x1`, `3x2`, `4x1`, `1x1`.
- **Dedicated Bunch Toggle**: 1-click filter for `⚡ Bunch Only`.
- **Style Category Pills**: Quick toggle for `Spread`, `Pro Style`, `Old School` (or `Even`, `Odd`, `Heavy` when viewing defense).
- **Active Filter Counter & Reset**: Displays matching count vs. active filters, with a 1-click "Reset Filters" action.
- **Card Badges**: Visual badges on each formation card for Personnel (`21P`), QB (`Gun`/`Pistol`/`Center`), Alignment (`3x1`), Bunch, and Style.
- **1-Click Firebase Sync**: Modal header button (`Sync to Firebase`) calling `seedAllFormations` to batch-persist all formations to Firestore.

### D. Firebase Service Layer (`src/services/playbookDb.ts`)
- Added `seedAllFormations(formationsList?: Formation[]): Promise<{ count: number }>` for syncing all mapped formations into Firestore with sanitization and timestamping.

---

## 3. Verification & Testing

- **TypeScript Compilation & Build:**
  - Ran `npm run build` (`tsc -b && vite build`) -> **Exit code 0**, zero errors.
- **Linter Check:**
  - Ran `npm run lint` (`oxlint`) -> **0 warnings, 0 errors** across 29 files.
- **Feature Inventory Integrity:**
  - Ran `npm run check:integrity` -> **Passed**, `docs/FEATURE_INVENTORY.md` updated with full feature descriptions.
- **Anti-Deletion & Diff Audit:**
  - Ran `git diff --diff-filter=D --name-status` -> **0 files deleted**.

---

## 4. Next Steps & Summary

Coaches and users can now:
1. Open the Base Formation Templates modal from the canvas or toolbar.
2. Filter instantly by Personnel, QB Alignment (Shotgun, Pistol, Under Center), Receiver Distribution (2x2, 3x1, Bunch, Empty), and Style.
3. Sync all templates directly to Firebase Firestore with one click.
