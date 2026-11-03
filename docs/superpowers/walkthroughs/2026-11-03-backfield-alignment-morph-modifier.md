# Walkthrough: Dynamic Backfield Alignment Modifier (Under Center, Pistol, Shotgun)

**Date:** 2026-11-03  
**Status:** Completed & Verified  

---

## 1. Overview & Problem Solved

In football scheme design, core offensive formations like **Ace** (12 Personnel balanced), **Deuce** (12 Personnel paired tight ends), **Trips** (3x1), **Doubles** (2x2), and **Bunch** define the perimeter surface and receiver distribution. However, the quarterback and running back alignment is an orthogonal backfield modifier:
- **Under Center (`down_center`)**: Direct snap at 1 yard depth, RB downhill at 6-7 yards.
- **Pistol (`pistol`)**: QB at 3.5 yards depth, RB stacked directly behind at 7 yards.
- **Shotgun (`shotgun`)**: QB at 5-6 yards depth, RB offset as a sidecar.

Coaches needed a seamless way to switch any formation (e.g., Ace or Deuce) between Pistol, Shotgun, and Down Center without disturbing the 5 offensive linemen or perimeter receiver positions.

---

## 2. Key Changes & Architecture

### A. Backfield Alignment Morph Engine (`src/utils/formationBackfield.ts`)
- **`detectCurrentQBPosition(players: Player[]): SnapAlignment`**:
  - Automatically identifies whether the active formation is `down_center` (QB y <= 425), `pistol` (QB y 426-450), or `shotgun` (QB y > 450).
- **`morphBackfieldAlignment(players, actions, targetAlignment, sidecarSide)`**:
  - **Singleback Formations (Ace, Deuce, Spread 11/10)**:
    - Down Center: QB -> `(480, 415)`, RB -> `(480, 500)`.
    - Pistol: QB -> `(480, 440)`, RB -> `(480, 520)`.
    - Shotgun: QB -> `(480, 465)`, RB -> `(540, 465)` (right sidecar) or `(420, 465)` (left sidecar).
  - **Two-Back Formations (Pro-I, Split Backs, 21P, 22P)**:
    - Down Center: FB at `y=465`, TB at `y=525`.
    - Pistol: FB at `y=485`, TB at `y=545`.
    - Shotgun: Dual split sidecars flanking the QB at `(420, 465)` and `(540, 465)`.
  - **Relative Vector Action Translation**:
    - Calculates $(\Delta x, \Delta y)$ for QB and RB so any drawn routes, pass protections, or mesh paths smoothly translate with the player.

### B. On-Canvas Chalkboard Top HUD Segmented Modifier (`src/components/ChalkboardCanvas.tsx`)
- Added a 3-segment toggle directly beside the Offensive Formation dropdown:
  `[ 🏈 Center | 🎯 Pistol | ⚡ Gun ]`
- Displays the live active snap alignment with instant 1-click morphing.
- Retains full compatibility with the existing Route Adaptation toggle and Save/Update actions.

### C. Formation Switcher Modal Live Variant Selector (`src/components/FormationSwitcherModal.tsx`)
- Added an interactive **"Backfield Snap: [ Under Center | Pistol | Shotgun ]"** selector in the Right Preview panel.
- Selecting any pill instantly updates the player coordinates in the live preview and roster grid.
- Clicking "Apply Template to Canvas" applies the formation in the chosen backfield variation.

### D. Library Presets (`src/data/offensiveFormationsMatrix.ts`)
- Added explicit `Deuce / Twin-TE (12 Personnel)` formation (`formation-deuce-12`) alongside `Single-Back Ace (12 Personnel)` (`formation-single-back-ace`).

---

## 3. Verification & Testing

- **TypeScript Compilation & Build:**
  - `npm run build` (`tsc -b && vite build`) passed with **exit code 0** and zero errors.
- **Linter:**
  - `npm run lint` (`oxlint`) passed with **0 warnings and 0 errors** across 31 files.
- **Feature Inventory Integrity:**
  - `npm run check:integrity` passed.
- **Anti-Deletion Audit:**
  - `git diff --diff-filter=D --name-status` confirmed **0 deleted files**.

---

## 4. How to Use

1. **On the Chalkboard Canvas:**
   - Select any offensive formation (e.g. Single-Back Ace, Deuce, Spread 2x2, Trips).
   - In the top HUD bar, click `[ 🏈 Center ]`, `[ 🎯 Pistol ]`, or `[ ⚡ Gun ]`.
   - The QB and RB(s) immediately slide into their proper depths and alignments while your receivers and OL stay locked in position.
2. **In the Formation Switcher Modal:**
   - Open the Formation Templates modal and select **Ace** or **Deuce**.
   - In the preview panel, select your desired **Backfield Snap** (`Under Center`, `Pistol`, or `Shotgun`).
   - Click **Apply Template to Canvas**.
