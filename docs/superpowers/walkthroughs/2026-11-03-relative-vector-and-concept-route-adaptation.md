# Walkthrough: Relative Vector & Concept-Based (#1/#2/#3 Outside) Route Adaptation Engine

**Date**: 2026-11-03  
**Status**: Verified & Passing (TypeScript, Vite Build, Oxlint, Feature Integrity)

---

## 1. Problem & Root Cause

Previously, when changing the offensive formation, only the initial starting point (`points[0]`) of an action was moved to the new player position:
```ts
// Previous buggy behavior
const updatedPoints = [
  { ...action.points[0], x: player.x, y: player.y },
  ...action.points.slice(1) // <-- stuck at old canvas coordinates!
];
```
This caused vector routes and block tracks to "stick" to their old absolute canvas coordinates, causing distorted angles, stretched routes, and broken stems whenever a player's split or alignment changed.

Furthermore, coaches needed the ability to optionally choose between:
1. **Player-Relative Adaptation**: Translating the complete vector relative to each specific player.
2. **Concept-Based Adaptation**: Mapping routes to outside-in receiver numbering (#1 outside receiver, #2 slot receiver, #3 inner/wing receiver) so concepts (like Smash, Flood, Mesh, Dagger) adapt naturally across different offensive personnel packages.

---

## 2. Solution & Architectural Implementation

### A. Dedicated Route Adaptation Module (`src/utils/routeAdaptation.ts`)
- **`categorizeOffensivePlayers(players)`**:
  - Automatically identifies Center, Offensive Linemen, QB, and Backfield.
  - Sorts left-side receivers by X ascending:
    - Index 0 $\to$ **Left #1 (Outermost Outside Receiver)**
    - Index 1 $\to$ **Left #2 (Slot Receiver)**
    - Index 2 $\to$ **Left #3 (Inner Slot / Wing)**
  - Sorts right-side receivers by X descending:
    - Index 0 $\to$ **Right #1 (Outermost Outside Receiver)**
    - Index 1 $\to$ **Right #2 (Slot Receiver)**
    - Index 2 $\to$ **Right #3 (Inner Slot / Wing)**
- **`translateActionPoints(points, dx, dy)`**:
  - Translates every waypoint $i$ in a vector by $(\Delta x, \Delta y)$ with field clamping ($0 \le x \le 1000, 0 \le y \le 700$):
    $$p_i' = \{ x: p_i.x + \Delta x, y: p_i.y + \Delta y, \text{isSharp}: p_i.\text{isSharp} \}$$
  - Preserves cut breaks ($C^0$ sharp points) and spline arcs ($C^1$ smooth points).
- **`adaptRoutesToNewFormation(currentActions, oldPlayers, newOffensePlayers, mode)`**:
  - **`player_relative`**: Translates each player's route vectors (and any child combo blocks) relative to their delta movement between the two formations.
  - **`concept_numbered`**: Maps passing routes to the corresponding outside-in receiver rank (#1 $\to$ #1, #2 $\to$ #2, #3 $\to$ #3) in the new formation, translating the vector to the newly assigned player. Linemen and backfield players maintain player-relative positional translation.

### B. Live Dragging Relative Translation (`src/components/ChalkboardCanvas.tsx`)
- When dragging a player in select/build mode, the player's vector routes and block tracks now dynamically translate along with the drag movement:
  $$\Delta x = \text{clamped.x} - \text{currentPlayer.x}, \quad \Delta y = \text{clamped.y} - \text{currentPlayer.y}$$
- Adjusting a receiver's split or a tackle's alignment moves their entire route or block vector with them, eliminating distortion during manual adjustments.

### C. Coach-Controlled Adaptation Mode Switcher
- **Chalkboard HUD Toggle**:
  - Added 1-click toggle button directly adjacent to the Offensive Formation dropdown:
    `[🎯 Player-Rel]` $\longleftrightarrow$ `[🔢 #123 Concept]`
  - Real-time notification updates coach on the active adaptation mode.
- **Enhanced Formation Switcher Modal (`FormationSwitcherModal.tsx`)**:
  - When applying a new formation template over existing routes, coaches are prompted with:
    - `🎯 Keep: Relative to Player`: Translates each player's route vector relative to their new alignment.
    - `🔢 Keep: Concept (#1/#2/#3 Outside)`: Maps routes to #1, #2, #3 receivers from outside in.
    - `Clear All Routes`: Clears routes to start fresh.

---

## 3. Verification & Testing

- **Build Check**: `npm run build` executed `tsc -b && vite build` successfully with 0 errors.
- **Linter Check**: `npm run lint` checked 30 files with 116 rules: 0 warnings, 0 errors.
- **Feature Integrity Audit**: `npm run check:integrity` confirmed all inventory entries are valid.
- **Deletion Audit**: `git diff --diff-filter=D` confirmed 0 files were removed.

---

## 4. Modified Files

- `src/types/playbook.ts`: Added `RouteAdaptationMode` type (`'player_relative' | 'concept_numbered'`).
- `src/utils/routeAdaptation.ts`: Created route adaptation engine with receiver distribution analysis and vector translation.
- `src/components/ChalkboardCanvas.tsx`: Added HUD mode toggle, wired player dragging relative vector translation, and connected adaptation props.
- `src/components/FormationSwitcherModal.tsx`: Updated apply confirmation overlay to allow choosing between Player-Relative and Concept (#1/#2/#3) adaptation.
- `src/App.tsx`: Replaced partial point replacement with `adaptRoutesToNewFormation` across both dropdown and modal formation applications.
- `docs/FEATURE_INVENTORY.md`: Documented new Route Adaptation & Vector Relative Translation capabilities.
