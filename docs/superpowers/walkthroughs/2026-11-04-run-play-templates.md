# Walkthrough: Run Play Templates (adaptive block assignments)

**Date:** 2026-11-04
**Status:** Built and verified with automated tests, build and lint (no in-app run). Gap templates are disabled until the coach signs off their rules.

## Why
Coaches know the blocking basics; the app should draw them. Pick a run, pick a play side, and every blocker gets an assignment that adapts to the formation and the front.

## What changed
1. **Schema 1.2.0** - `Play.blockPlan`, `PathAction.assignmentId`, `RunTemplate` types; older files still load (`src/types/playbook.ts`, `src/utils/playValidation.ts`).
2. **Resolver** - `blockSlots.ts` names blockers relative to the play side; `runTemplates.ts` turns a template into assignments (zone, down, seal, kickout, trap, wrap, lead) and applies saved hand edits.
3. **Drawing** - `blockActions.ts` turns assignments into the existing block lines (pulls dip behind the line, combos link to a climb).
4. **Apply / re-aim / edit / capture** - `blockPlanApply.ts`; every alignment handler in `App.tsx` re-aims in the same undo step.
5. **UI** - `RunTemplateModal.tsx`, Run group in `PlayBar.tsx`, "Template assignment" section in `InspectorPanel.tsx`.
6. **Storage** - `runTemplateStorage.ts`, `useRunTemplateLibrary.ts`, Firestore `runTemplates` in `playbookDb.ts`. Stored data fails closed: only an explicit `reviewed: true` counts, `builtIn` is never read from storage, and stored templates cannot shadow built-ins.

## Verification
- `npm test`: 70 tests pass (schema, slots, zone and gap resolution, mirror, missing players, no defenders, stale overrides, capture/apply round-trip, storage).
- `npm run build`, `npm run lint`, `npm run check:integrity` clean at the final commit.
- Contrast (WCAG arithmetic, light / dark): body text 10.35-17.85 / 12.02-17.27; muted text 9.71-10.35 / 9.35-12.75; card and button edges slate-500 4.76 / 3.98; white on sky-700 5.93; Inspector labels 14.63 / 16.36. Three pairs failed first (card borders 2.56 and 2.50, white on dark sky-600 4.10) and were fixed.
- Layout (arithmetic): modal content width 256px at 320px viewport, 544px from 640px; side buttons estimate 251px and wrap; footer buttons 190px (26% headroom); the Run group on the play bar wraps on its own so the existing controls keep their width.

## Not done (deliberately)
- Coach sign-off of the power / counter / trap rules (templates stay `reviewed: false`).
- Firebase Auth / per-owner scoping of `runTemplates` (the app is strictly personal, like the existing collections).
- Outside zone aiming point (same rules as inside zone for now).
- Ball-carrier paths are not generated.
