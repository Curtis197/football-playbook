# Walkthrough: Block Vector Decomposition

**Date:** 2026-11-03  
**Status:** Completed & Verified  

## Summary of Changes

Upgraded the blocking vector engine so that **block vectors can be decomposed into multi-segment waypoints identical to pass routes**:

1. **Multi-Point Block Drawing**:
   - Removed the previous 2-point restriction (`newPts.length >= 2` auto-finish) on `Draw Block` mode.
   - Coaches can now click as many intermediate waypoints as needed to diagram complex blocking schemes:
     - **Pull Blocks & Traps**: Guard skip-pull step $\to$ flat track behind center $\to$ turn up into gap $\to$ kick-out target.
     - **Combo Climbs**: Lineman combos defensive tackle $\to$ climbs to second level Mike linebacker.
     - **Fold Blocks & Reach Tracks**: Lateral reach track $\to$ seal block.
   - Finished via **Double-Click** or **Enter**, just like pass routes.
   - Preserves Catmull-Rom spline curves ($C^1$) and sharp cuts ($C^0$, Shift+Click) with terminal T-Bar alignment (`#tbar` and `#pull-tbar`).

2. **In-Canvas Interactive Decomposition**:
   - Implemented `insertPointIntoAction` in `src/utils/geometry.ts`.
   - When any block vector or route is selected on the chalkboard canvas, clicking anywhere along the line calculates the closest segment and splits/decomposes it with a new interactive waypoint at the clicked point.
   - Enables coaches to take existing 2-point blocks and instantly decompose them on the field without redrawing.

3. **Waypoint Manipulation & Handles**:
   - Block waypoint handles display for all points ($P_0, P_1, P_2, \dots$):
     - Circular handles for smooth curve sweeps.
     - Diamond handles labeled `CUT` for sharp cut breaks.
     - Click handle to toggle between sharp cut and smooth arc.
     - Drag handle to reposition waypoints in real time.

4. **Inspector Panel Waypoint & Track Manager**:
   - In `src/components/InspectorPanel.tsx`, added a `+ Decompose Path / Add Waypoint` button to subdivide the vector path.
   - Added individual waypoint deletion controls (`Trash2`) for paths with more than 2 points.
   - Individual smooth vs. sharp cut toggles per waypoint for fine-tuning blocking geometry.

---

## Verification & Testing Completed

1. **TypeScript & Production Build**:
   - Executed `npm run build` (`tsc -b && vite build`) — succeeded with 0 errors.
2. **Code Linting**:
   - Executed `npm run lint` (`oxlint`) — passed with 0 warnings and 0 errors across 21 files.
3. **Feature Inventory Check**:
   - Executed `npm run check:integrity` (`node scripts/check-feature-integrity.mjs`) — passed.
4. **Zero Accidental Deletion Audit**:
   - Executed `git diff --diff-filter=D` — verified 0 files deleted.
