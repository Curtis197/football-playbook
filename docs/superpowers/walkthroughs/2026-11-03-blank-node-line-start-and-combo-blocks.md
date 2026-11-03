# Walkthrough: Blank Node Line Start Offset & Combo/Option Block Restarts

**Date**: 2026-11-03  
**Task**: 
1. When players have no node shape (`shape === 'none'`), lines must start from the perimeter of the blank node rather than cutting directly through the letter label.
2. Enable blocks to restart from another block for Double Team combo climbing and Option read blocks.

---

## 1. Blank Node Vector Line Start Offset

### Problem
When a player has no node shape (`shape: 'none'`), vector lines (routes, blocks, motion) originated directly at `(player.x, player.y)`. Because the position letter is centered at `(player.x, player.y)`, vector lines cut directly through the letter glyph, degrading visual clarity and schematic professionalism.

### Solution
1. **Perimeter Ray-Tracing (`getBlankNodeOffsetPoint`)**:
   - Added `getBlankNodeOffsetPoint(p0, p1, offsetDistance = 18)` in `src/utils/geometry.ts`.
   - Calculates the angle $\theta = \operatorname{atan2}(p1.y - p0.y, p1.x - p0.x)$ along the trajectory towards the first waypoint.
   - Offsets the starting coordinate by $18\text{px}$ along this vector:
     $$\tilde{x}_0 = x_0 + 18 \cdot \cos\theta, \quad \tilde{y}_0 = y_0 + 18 \cdot \sin\theta$$
   - `generatePathString` accepts `startOffset: number = 0` to seamlessly substitute the visual start point without mutating the underlying coordinate data.
2. **Text Clearance Buffer**:
   - In `ChalkboardCanvas.tsx`, players with `shape === 'none'` now render a circular clearance background buffer (`r="15"`) with theme-adaptive fill (`#ffffff` in light mode, `#1a1f26` in dark mode) behind the text.
   - Field hash marks and crossing vector paths never cut through player labels.
3. **Live Drawing Preview Synchronization**:
   - When drawing in `draw_route`, `draw_block`, or `draw_motion` from a blank node player, the live Catmull-Rom preview starts dynamically from the $18\text{px}$ offset perimeter boundary.

---

## 2. Block Continuation & Restart Engine (Double Teams & Option Blocks)

### Problem
Football blocking schemes heavily rely on continuation blocks:
- **Combo Blocks**: An offensive lineman double-teams a defensive lineman, then climbs or releases to block a second-level linebacker (e.g. Inside Zone combo with Center & Guard climbing to Mike).
- **Option Blocks**: An offensive tackle arcs to seal the perimeter after reading an unblocked defensive end or option defender.

Previously, blocks could only originate from a player node, making second-level combo climbs and option branch blocks impossible to represent naturally.

### Solution
1. **Playbook Schema Extensions**:
   - Extended `PathAction` with optional `parentActionId?: string` and `branchType?: 'combo' | 'option'` in `src/types/playbook.ts`.
2. **Multiple Ergonomic Restart Workflows**:
   - **Click on Block Track**: In `draw_block` mode, hovering over any existing block highlights the line with `cursor-copy`. Clicking anywhere along the block immediately initiates a continuation block originating at that exact point.
   - **On-Canvas `+COMBO` Badge**: Selecting any block reveals an interactive `+COMBO` button badge at its terminal T-Bar waypoint. Clicking it switches to block drawing mode and anchors the new block's origin at the terminal point.
   - **Inspector Panel Card**: Selecting any block in the Inspector Panel displays a dedicated "Combo & Option Block" section with a "+ Restart Block from Terminal T-Bar" action button.
3. **Visual Combo Junction**:
   - Restarted combo blocks display a golden junction marker (`<circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />`) at their point of origin, clearly linking the continuation vector to its parent block.

---

## 3. Verification & Quality Assurance

- **Linter & Type Check**:
  - `npm run lint` (`oxlint`): 0 errors, 0 warnings.
  - `npm run build` (`tsc -b && vite build`): Build completed successfully with 0 type errors.
- **Feature Inventory**:
  - `npm run check:integrity`: PASSED with all features synced.
- **Deletions Audit**:
  - `git diff --diff-filter=D`: Zero deletions.
