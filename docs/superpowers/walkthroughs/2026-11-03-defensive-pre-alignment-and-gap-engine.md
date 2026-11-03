# Walkthrough: Defensive Pre-Alignment, Dynamic Gap Snapping, Load Fronts, and Front Shifting Engine

## Summary
Implemented a comprehensive American football defensive alignment and gap engine that automatically determines offensive line positions, gaps, and formation strength, allowing defensive players to pre-align automatically to designated technique parameters, load popular defensive fronts (3-4 Over, 4-2-5 Nickel, 3-5 Odd, 4-3 Under, Mint, Bear), and dynamically shift gap leverage across the entire defense.

---

## Changes Implemented

### 1. Offensive Structure & Gap Delineation (`src/utils/defensiveAlignment.ts`)
- **`analyzeOffense`**: Analyzes the offensive players currently on the field:
  - Dynamically locates the Center (`C`), Left Guard (`LG`), Right Guard (`RG`), Left Tackle (`LT`), Right Tackle (`RT`), inline and wing Tight Ends (`TE`/`Y`), slot receivers, and perimeter wide receivers.
  - Computes the Line of Scrimmage (LOS) $Y$ coordinate (default $Y = 380$).
  - Establishes all 8 standard football offensive gaps with exact field $X$ coordinates: Left D, Left C, Left B, Left A, Right A, Right B, Right C, Right D.
  - Automatically identifies formation strength (`strength: 'left' | 'right'`) based on Tight End alignment and receiver distribution.
- **`calculateDefensiveAlignmentPosition`**: Maps any football defensive alignment or technique string directly into exact $(X, Y)$ field coordinates:
  - **1st Level (Down Linemen & Edge Rushers)** ($Y \approx \text{LOS} - 32$):
    - `0-Tech` (Head-up Center)
    - `1-Tech Weak / Strong` (A-gap shade)
    - `2i-Tech` / `2-Tech` (Inside shade / Head-up Guard)
    - `3-Tech Weak / Strong` (Outside shade Guard into B-gap)
    - `4i-Tech Weak / Strong` (Inside eye Tackle into B-gap)
    - `4-Tech` (Head-up Tackle)
    - `5-Tech Weak / Strong` (Outside shade Tackle into C-gap)
    - `7-Tech / 6i` (Inside eye Tight End / ghost edge)
    - `6-Tech` (Head-up Tight End)
    - `9-Tech / Wide-9` (Outside shade Tight End / wide rush edge)
  - **2nd Level (Box Linebackers & Overhangs)** ($Y \approx \text{LOS} - 85$):
    - `00 Stack` (Mike over Center)
    - `10 Stack Weak / Strong` (A-gap stack)
    - `20 Stack` (Guard stack)
    - `30 Stack Weak / Strong` (B-gap / Will / Sam stack)
    - `40 Stack` (Tackle stack)
    - `50 Stack` (C-gap stack)
    - `Apex Weak / Strong` ($Y \approx \text{LOS} - 60$, overhang splitting tackle/TE and slot receiver)
  - **3rd Level (Secondary & Defensive Backs)**:
    - `Press CB Left / Right` ($Y \approx \text{LOS} - 45$)
    - `Off CB Left / Right` ($Y \approx \text{LOS} - 105$, 7-8 yard cushion)
    - `Nickel / Slot Defender`
    - `Single-High FS` ($Y \approx \text{LOS} - 225$, deep middle third)
    - `2-High Safety Left / Right` ($Y \approx \text{LOS} - 185$, cover 2/4 deep half)
    - `Robber Weak / Strong` ($Y \approx \text{LOS} - 145$, intermediate hole defender)
- **Defensive Preset Front Packages**:
  - `3-4 Over Front`
  - `4-2-5 Nickel Over Front`
  - `3-5 Odd Front (3-3-5 Stack)`
  - `4-3 Under Front`
  - `Mint / Tite Front (3-4 Mint)`
  - `Bear / 46 Front`
- **Dynamic Front Shifting Functions**:
  - `shiftDefensiveFront(direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan')`: Dynamically shifts the gap alignment of defensive linemen and linebackers.
  - `realignAllDefenders`: Re-evaluates every defender's declared technique parameter against the current offensive positions and snaps them into position.

---

### 2. Inspector Panel Defensive Parameter Controller (`src/components/InspectorPanel.tsx`)
- When a defensive player is selected, replaces the generic technique input with an interactive **Pre-Align to Offense** controller:
  - **Active Alignment Status Pill**: Shows current technique, resolved football description (e.g. *"Outside shade on Guard into strong B-gap"*), and exact $(X, Y)$ coordinates.
  - **Single-Defender Gap Shifting**: Quick buttons `◀ Shift Gap Left`, `↺ Re-Snap`, and `Shift Gap Right ▶` to nudge that defender into adjacent gaps.
  - **Categorized Technique Chips**: Tabs for `1st Level (DL)`, `2nd Level (LB)`, and `3rd Level (DB)` with 1-click chips.
  - **Automatic Snapping**: Clicking any technique chip immediately updates the player's parameter **and automatically positions them on the chalkboard**.
  - **Custom Input & Snap**: Typing any technique string and pressing Enter or clicking "Snap" computes and snaps the player's coordinates.

---

### 3. Chalkboard Canvas Gap Overlay & HUD Controls (`src/components/ChalkboardCanvas.tsx`)
- **Offensive Gaps on the Field**:
  - Rendered along the Line of Scrimmage when `showGaps` is enabled:
    - Vertical tick lines at each gap center.
    - Clean SVG gap badges: `[ D ] [ C ] [ B ] [ A ] (C) [ A ] [ B ] [ C ] [ D ]`.
    - Strongside gaps highlighted in amber; weakside in cyan.
    - Directional strength banner (`STRONG ➜` or `⬅ STRONG`).
  - Alignment guidelines: Connecting a selected defender to their assigned gap on the LOS.
- **On-Canvas Defensive HUD Overlay Bar**:
  - `Gaps: ON/OFF` toggle button.
  - `Load Defense` button triggering the front packages modal.
  - `◀ Left` and `Right ▶` quick shift buttons.
  - `Over` and `Under` front buttons.
  - `↺ Re-align` button.

---

### 4. Defense Fronts & Shifts Modal (`src/components/DefenseFrontModal.tsx`)
- Triggerable from top Toolbar (`Defense Fronts` button) and Chalkboard HUD (`Load Defense` button):
  - Offense analysis banner displaying detected strength, LOS $Y$, Center $X$, and Tight End presence.
  - 1-click loading of preset front packages (3-4 Over, 4-2-5 Nickel, 3-5 Odd, 4-3 Under, Mint, Bear).
  - Roster preview table displaying Pos, Technique, Assignment, and pre-aligned $(X, Y)$ coordinates.
  - Offensive gap distribution grid showing all 8 gap coordinates.
  - Shift controls for Left, Right, Over, Under, Pinch, Fan, and Re-Align.

---

## Verification & Testing Results

1. **TypeScript Compilation**:
   - `npx tsc -b` exited with code 0 without any errors.
2. **Production Build**:
   - `npm run build` completed successfully, producing client bundles without issues.
3. **Linter & Code Health**:
   - `npm run lint` ran clean with 0 errors across all 24 source files.
4. **Feature Integrity Check**:
   - `npm run check:integrity` passed cleanly with `docs/FEATURE_INVENTORY.md` in order.
5. **Deletion Audit**:
   - `git diff --diff-filter=D` confirmed zero accidental deletions.
