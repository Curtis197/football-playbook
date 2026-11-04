# Walkthrough: Runs called by hole and runner, block types as fixed rules

**Date:** 2026-11-04
**Status:** Built and verified with automated tests, build and lint (no in-app run). Power, Counter and Trap stay disabled until the coach signs off their rules.

## Why
The first run-template build chose the play side with buttons and found defenders by distance, with loose "kinds" of block. Coaches call runs as a runner and a hole, and want each block type to be one fixed rule that reads the same against any defense.

## What changed
1. **Holes and runner** - `src/utils/runHoles.ts`: hole x from the line (midpoints between bodies, virtual bodies 60 apart, split-out tight ends ignored), play side from hole parity (hole 0 takes a coach-chosen side), runner 1-4 and the lead back, and a gap id for every defender (nearest hole).
2. **Block types** - `src/utils/runTemplates.ts` rewritten: Zone, Down, Seal, Kickout, Trap, Wrap, Lead as in the spec table, in two passes (primary targets, then combo fallbacks) with pull and second-level pools. Zone/Down/Seal use only the side; the hole is used by the pulling types and the lead.
3. **Calls everywhere** - `BlockPlan.hole` and `.runner`; `applyRunTemplate` takes a `RunCall`; re-aim reads the plan's call (a plan saved before this change is read as hole 3 or 4, runner 3); Strong/Weak is gone.
4. **Saved edits by gap** - an edit on a defender on the line is saved as a gap letter and a side relative to the play side, so a template applied at the mirrored hole mirrors correctly; linebackers keep the technique form.
5. **Picker** - Hole (0-8) and Runner (1-4) selectors replace the play-side buttons; Left/Right shows only for hole 0; choosing a template preselects its default hole; the picker opens on the play's own call. The Inspector lists defenders by gap.
6. **Correction** - an uncovered lineman now combos with the nearest blocker *away* from the play side (the first build used the play-side neighbour).

## Verification
- `npm test`: 1266 tests pass (1 expected fail already on `main`); this work adds the hole, runner (including numbered labels such as FB1/FB2/RB1/H1), block-type, call-plumbing, gap-edit, picker-hole and validation tests.
- `npm run build`, `npm run lint`, `npm run check:integrity` clean.
- Contrast: no new colour pairs; the Hole and Runner selects reuse the Inspector selects (text 17.85 light / 16.30 dark, borders 4.76 / 3.98) and the existing picker buttons (white on sky-700 5.93).
- Layout (arithmetic): picker content is 256px at a 320px viewport and 544px from 640px. A select is 256px then 268px wide, minus its own padding (16px) and arrow (about 20px): 220px and 232px of text. The longest runner label is "4 · Other back (none)", about 21 characters at 12px x 0.5 = 126px (43% and 46% headroom); the longest hole label "0 · over the center" is about 114px. The hole-0 buttons need about 126px. (An earlier draft of these figures forgot the select padding and arrow.)

## Not done (deliberately)
- Coach sign-off of the Power, Counter and Trap rules (templates stay `reviewed: false`).
- The runner's own path is not drawn.
- Two blockers on one defender are a double team with no climb; a climb happens only for a lineman with nobody on the line (the coach's wording).
- Firebase Auth / per-owner scoping of `runTemplates` (the app is personal-use).
