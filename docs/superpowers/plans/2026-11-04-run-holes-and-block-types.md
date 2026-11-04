# Run Holes and Block Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the coach chose native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A run is called by a runner number and a hole number; the play side comes from the hole; every blocker gets a predetermined block type whose rule is the same against any defense; defenders in saved edits are identified by gap.

**Architecture:** New pure `runHoles.ts` (hole x, play side, runner, lead back, defender gap id). `runTemplates.ts` is rewritten around seven block types with a two-pass pick (primary targets, then combo fallbacks) and pools. `BlockPlan` gains `hole` and `runner`. The picker swaps play-side buttons for Hole and Runner selectors. Everything already built on `main` (drawing, re-aim, hand edits, save/update, storage) is kept and re-plumbed.

**Tech Stack:** Vite 8, React 19, TypeScript 7, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-04-run-play-templates-design.md` — read **Revision 2** and its "Calls made" list; they replace the first design where they differ.

## Global Constraints

- New branch `feat/run-holes-and-block-types` (cut from `main`). Never stage `src/utils/defensiveAlignment.ts` or `src/utils/routeAdaptation.ts` edits that are not yours; stage files by name.
- Positions are board x-coordinates 0–1000; LOS `y≈380`; line spacing 60; `TOL = 30`; attached TE ≤ 90 from the tackle; "on the line" = position `DL`, or `LB` within 45 of the LOS.
- Hole `1/2` A gap, `3/4` B, `5/6` C, `7/8` D, `0` over the center; odd right, even left; **hole 0 needs a Left/Right choice from the coach**.
- Runner `1` QB, `2` fullback, `3` tailback, `4` remaining back. The runner's path is **not** drawn.
- Block rules are identical against every defense. Technique text is never used in a rule; it is only a fallback for saved edits on defenders that are not on the line.
- Pull targets (Kickout, Trap) leave the pool first. Zone, Down and Seal picks never deplete the pool. A climb, Wrap or Lead takes the nearest second-level defender not already taken by another climb, Wrap or Lead (nearest anyway if all are taken).
- Combo partner = the nearest blocker **away from the play side** that has a primary target (so the resolver runs two passes). The blocker without a defender climbs. No partner: climb directly.
- Zone, Down and Seal use only the side, never `H`; `H` is used by Kickout, Trap, Wrap and Lead.
- Schema stays `1.2.0` (the earlier build is unreleased as a schema, plans with `playSide` but no `hole` read as hole 3/4 by side, runner 3). Keep `npm test`, `npm run build`, `npm run lint`, `npm run check:integrity` green. Commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Per the owner's standing rules: verify new colours by WCAG arithmetic and new widths by layout arithmetic (state the numbers); no browser or screenshot tooling.

## Review Focus

- No tight end, unattached TE, or fewer than five OL: holes 1–8 still exist (virtual bodies 60 apart), nothing crashes (Task 1).
- Runner 4 with only two backs, or runner 1 (QB) with one back: no lead line, no crash (Task 1).
- Hole 0 without a chosen side: the picker blocks Apply; the resolver falls back to `right` only for legacy plans (Tasks 3, 4).
- Playing the same template to hole 3 then hole 4 on a mirrored formation: saved gap edits mirror correctly (Task 3).
- Saved edit whose gap letter has no on-the-line defender on the new front: base rule is used, no throw (Task 3).
- Legacy plan (`playSide`, no `hole`) re-aims without losing hand edits (Task 3).

## File Structure

- Create `src/utils/runHoles.ts` (+ test) — hole geometry, play side, runner, lead back, gap ids.
- Rewrite `src/utils/runTemplates.ts` — block-type resolver; keep `relativeTechnique`/`absoluteTechnique` exports.
- Modify `src/utils/blockSlots.ts` (`fb` dynamic), `src/utils/blockPlanApply.ts` (call plumbing, gap-id captures; drop `resolvePlaySide`), `src/data/runConcepts.ts`, `src/utils/runTemplateStorage.ts`, `src/types/playbook.ts`, `src/utils/playValidation.ts`.
- Modify `src/components/RunTemplateModal.tsx`, `src/components/InspectorPanel.tsx`, `src/App.tsx`.
- Update every existing test that calls `resolveBlockPlan` / `applyRunTemplate` with a play side.

---

### Task 1: Holes, runner and gap ids

**Files:**
- Create: `src/utils/runHoles.ts`, `src/utils/runHoles.test.ts`
- Modify: `src/types/playbook.ts`, `src/utils/playValidation.ts`, `src/test/fixtures.ts`

**Interfaces:**
- Produces in `playbook.ts`: `interface RunCall { hole: number; runner: number; side?: PlaySide }` (`side` is required when `hole === 0`); `BlockPlan.hole?: number; BlockPlan.runner?: number` (optional only for legacy plans); `RunTemplate.defaultHole?: number`; `TargetRule` gap form unchanged (`{ by:'gap'; gap:'A'|'B'|'C'|'D'; relativeSide:'playside'|'backside' }`).
- Produces in `runHoles.ts`:
  - `callPlaySide(call: RunCall): PlaySide` — odd right, even left; hole 0 → `call.side ?? 'right'`.
  - `isValidCall(call: RunCall): boolean` — hole 0–8 integer, runner 1–4 integer, hole 0 requires `side`.
  - `holeX(players: Player[], hole: number): number`
  - `runnerPlayer(players: Player[], runner: number): Player | undefined`
  - `leadBack(players: Player[], runner: number): Player | undefined`
  - `gapIdOf(defender: Player, players: Player[]): { hole: number; gap: 'A'|'B'|'C'|'D'; side: PlaySide | 'center' }` — the nearest hole 0–8 to the defender's x (ties go to the lower hole number).
  - `gapLabel(id: ReturnType<typeof gapIdOf>): string` — e.g. `"B gap, right"`, `"A gap, center"`.
- `fixtures.ts` adds `FB` helper values: `export const FULLBACK = offensePlayer('FB','FB','RB',480,470)`.

- [ ] **Step 1: Write failing tests (`runHoles.test.ts`)** on `OFFENSE_TE_RIGHT` + `FOUR_THREE_OVER`:
  - `holeX` for holes 0–8 = `480, 510, 450, 570, 390, 630, 330, 690, 270`.
  - The same values with the TE removed, and with the TE moved to x=720 (not attached, so ignored).
  - `holeX` on a formation with four OL still returns 8 values (virtual bodies).
  - `callPlaySide({hole:3,runner:3})` → `right`, hole 4 → `left`, `{hole:0,runner:3,side:'left'}` → `left`, `{hole:0,runner:3}` → `right`.
  - `isValidCall` rejects hole 9, runner 5, non-integers, and hole 0 without `side`.
  - `runnerPlayer`: runner 1 → QB; runner 3 → `RB` (label RB); with `FULLBACK` added, runner 2 → `FB`, runner 3 → `RB`; runner 4 with only two backs → `undefined`.
  - `leadBack`: runner 3 with FB present → `FB`; runner 2 → `RB`; runner 3 with only `RB` → `undefined`; runner 1 with one back → that back.
  - `gapIdOf`: `DT_R` (x570) → `{hole:3, gap:'B', side:'right'}`; `DT_L` (450) → hole 2 A left; `DE_L` (330) → hole 6 C left; `DE_R` (660, tie between 5 and 7) → hole 5.
  - `gapLabel(gapIdOf(DT_R))` → `"B gap, right"`.
  Run `npm test -- runHoles` → FAIL (module missing).
- [ ] **Step 2: Implement** the types, `runHoles.ts`, and the validation of `BlockPlan.hole`/`runner` (integers in range, else dropped) in `playValidation.ts`. Body list: linemen plus TEs within 90 of the outermost tackle, per side sorted outward; pad with virtual bodies 60 apart. Run tests → PASS; `npm run build`.
- [ ] **Step 3: Commit** `feat(run): hole geometry, runner and gap ids`.

---

### Task 2: Block-type resolver

**Files:**
- Rewrite: `src/utils/runTemplates.ts`; Modify: `src/utils/blockSlots.ts`, `src/data/runConcepts.ts`, `src/utils/runTemplates.test.ts`, `src/test/fixtures.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces: `resolveBlockPlan(template: RunTemplate, players: Player[], call: RunCall): BlockPlan` — returns a plan with `playSide = callPlaySide(call)`, `hole`, `runner`. `assignBlockSlots(players, playSide)` no longer fills `fb`; the lead back comes from `leadBack(players, call.runner)` and is filled into the plan under slot `fb` only when the template has an `fb` rule. Built-in templates (`BUILT_IN_RUN_TEMPLATES`): `run-inside-zone` (`defaultHole: 3`) and `run-outside-zone` (`defaultHole: 5`) use `zone` on the seven line slots and **no `fb` rule**; `run-power` (`defaultHole: 3`), `run-counter` (`defaultHole: 3`), `run-trap` (`defaultHole: 1`) keep their slot maps and stay `reviewed: false`.

Algorithm (all rules in the Global Constraints; this restates the order): pulls (Kickout, Trap) resolve first and leave the pool; then Zone/Down/Seal primary targets for every such blocker (pass 1, play side outward); then combo fallbacks for blockers with no primary target (pass 2); then Wrap and Lead in slot order, each taking an untaken second-level defender. Kickout: nearest on-the-line defender with `dir·(d−H) > 15` by |d−H|, else nearest second-level to H. Trap: nearest on-the-line with `dir·(d−H) ≤ 15`, else second level. Zone/Seal: `dir·(d−B) ≥ −TOL`; Down: `dir·(d−B) ≤ +TOL`; nearest by |d−B|.

- [ ] **Step 1: Rewrite the tests (`runTemplates.test.ts`)** on `OFFENSE_TE_RIGHT` + `FOUR_THREE_OVER` + `FULLBACK` (fixture players above; `byPlayer` helper as in the file today):
  - Inside zone `{hole:3, runner:3}`: TE→DE_R; RT→DT_R; RG→DT_R; C→DT_L; LG→DT_L; LT→DE_L; **no** combo or climb on any of them; RB (the runner) and FB get no assignment.
  - Same call on a mirrored fixture with `hole:4` gives the mirrored result; `{hole:3}` and `{hole:1}` give identical zone assignments (hole only sets the side).
  - Fallback: offense + only `DT_L` (450) and `M` (490) as defenders, zone hole 3: `C`→DT_L, `LG`→DT_L, `LT`→DT_L with no combo; `RG`, `RT`, `TE` → `{target: DT_L, comboWith: 'C', climbTo: M}`.
  - Fallback with no partner: offense only plus linebacker `M`, zone hole 3: every line blocker `target {type:'level', level:'second'}`.
  - Down hole 3 (a one-slot test template built in the test): TE→DE_R, RT→DT_R, RG→DT_R, C→DT_L.
  - Power `{hole:3, runner:3}`: LG kickout `pulls` → DE_R; LT seal → DE_L; TE, RT, RG down → DT_R, DT_R, DT_R; C down → DT_L; FB `kind:'lead'` → S; RB none. With `runner:2` the lead is RB instead of FB.
  - Counter hole 3: LG kickout → DE_R; LT wrap `pulls` → S; FB lead → M (S already taken).
  - Trap `{hole:1, runner:3}`: LG trap `pulls` → DT_L; TE seal → DE_R; RT seal → DT_R; RG down → DT_R; C down → DE_L (DT_L left the pool); LT seal → DE_L; FB lead → M.
  - Review Focus: no TE (no TE assignment, no throw); four OL; no defenders (every target `{type:'none'}`, plan returned); runner 1 with one back (no lead assignment); unknown kind still throws a clear error; `hole:0` with `side:'left'` resolves a left play.
  Run → FAIL.
- [ ] **Step 2: Implement** the resolver, the `fb` handling, and the template data (including `defaultHole`). Delete the old zone-sharing logic. Run `npm test` → this file PASSES; list the other failing files (plumbing fixed in Task 3).
- [ ] **Step 3: Commit** `feat(run): block-type resolver (zone, down, seal, kickout, trap, wrap, lead)` — only if the build still compiles; otherwise keep Task 2 and Task 3 in one commit.

---

### Task 3: Calls through apply, re-aim, edit and capture; gap-id edits

**Files:**
- Modify: `src/utils/blockPlanApply.ts`, `src/utils/runTemplateStorage.ts`, and their tests (`blockPlanApply.test.ts`, `finalFixes.test.ts`, `runTemplateStorage.test.ts`, `blockActions.test.ts` as needed)

**Interfaces:**
- Consumes: Tasks 1–2.
- Produces: `applyRunTemplate(play: Play, template: RunTemplate, call: RunCall): Play` (also writes `blockPlan.hole`, `.runner`, `.playSide`); `reaimBlocks(play, templates)` reads `hole`/`runner`/`playSide` from the plan (legacy plan without `hole`: hole 3 if `playSide==='right'` else 4, runner 3); `captureRunTemplate(play, base, name, existingId?)` unchanged signature; `editAssignment`, `clearBlocks`, `templateMissing` unchanged. **Removed:** `resolvePlaySide` and every `hasClearStrength` use. `normalizeRunTemplate` also keeps `defaultHole` (integer 0–8).
- Saved edits: an on-the-line defender target is captured as `{ by:'gap', gap, relativeSide }` where `gap` comes from `gapIdOf` (center → `'A'`) and `relativeSide` is `'playside'` when the defender's gap side equals the play side, else `'backside'` (center → `'playside'`); non-line defenders keep `{by:'technique'}` via `relativeTechnique`. On apply, the override picks the on-the-line defender whose gap letter and side (resolved against the call's play side) match, nearest to the blocker's x; none → the base rule's result.

- [ ] **Step 1: Update existing tests** to pass a `RunCall` (`{hole:3, runner:3}`); delete the `resolvePlaySide` tests and the strong/weak override-flip test; keep the other review-fix tests by adapting them.
- [ ] **Step 2: Write new failing tests:**
  - `applyRunTemplate(..., {hole:3,runner:3})` stores `blockPlan` with `hole:3, runner:3, playSide:'right'`.
  - Legacy plan (`{templateId, playSide:'left', assignments}` with no `hole`) re-aims as hole 4, runner 3, and keeps its hand edits.
  - A retarget of RG to `DT_L` on a right play is saved as `{by:'gap', gap:'A', relativeSide:'backside'}`; applying that template to a **mirrored formation at hole 4** makes the (mirrored) play-side guard block the A-gap defender on the backside (right side), not the left one.
  - A saved gap edit whose gap letter has no on-the-line defender on the new front leaves the base rule's target (no throw).
  - Capturing an edit on a defender with no `position:'DL'` (a linebacker) falls back to the technique/level form.
- [ ] **Step 3: Run → FAIL. Step 4: Implement. Step 5: `npm test` (all pass), `npm run build`, `npm run lint`.**
- [ ] **Step 6: Commit** `feat(run): calls by hole and runner through apply, re-aim and saved edits`.

---

### Task 4: Picker, Inspector and wiring

**Files:**
- Modify: `src/components/RunTemplateModal.tsx`, `src/components/InspectorPanel.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: Task 3.
- Produces: `RunTemplateModal` props `onApply(template: RunTemplate, call: RunCall): void` (replaces the play-side argument); Hole selector 0–8 (labels like `3 · B gap right`, `4 · B gap left`, `0 · center`), Runner selector 1–4 (`1 QB`, `2 FB`, `3 TB`, `4 other back`); the Left/Right choice appears only when hole 0 is selected and Apply is disabled until one is chosen; choosing a template preselects its `defaultHole`; the modal starts on the play's current call when the play has a `blockPlan`. Strong/Weak buttons and the `hasClearStrength` import are gone. Inspector: defender options in "Blocks" show their gap label (`gapLabel(gapIdOf(d, players))`) instead of the technique text; a stale option keeps its "(gone)" text.
- [ ] **Step 1:** Update `handleApplyRunTemplate` in `App.tsx` to build the `RunCall`, validate with `isValidCall` (error notification otherwise), and pass it to `applyRunTemplate`; the notification names the hole and runner (`Applied "Power" to hole 3 (B gap right), runner 3.`).
- [ ] **Step 2:** Implement the modal and Inspector changes above.
- [ ] **Step 3: Verify:** `npm test`, `npm run build`, `npm run lint`, `npm run check:integrity` all green. Per the owner's rules, report contrast ratios for every new or changed foreground/background pair in both themes (use the contrast skill's calculator; pass lines 4.8 text / 3.2 non-text; fix any near-miss) and layout arithmetic for the modal at 320px and 640px+ (Hole select, Runner select, footer buttons).
- [ ] **Step 4: Commit** `feat(run): hole and runner picker with gap labels`.

---

### Task 5: Docs and final verification

**Files:**
- Modify: `docs/FEATURE_INVENTORY.md` (replace the play-side/Strong-Weak lines of the Run Play Templates entry with the hole/runner/block-type description), add `docs/superpowers/walkthroughs/2026-11-04-run-holes-and-block-types.md` (title, Date, Status, summary, verification with test counts, contrast and layout numbers, Not done).
- [ ] **Step 1:** Write both docs. **Step 2:** run all four commands; paste results into the walkthrough. **Step 3: Commit** `docs(run): hole and runner calls in the feature inventory and walkthrough`.
- [ ] **Step 4: Coach checkpoint (do not enable gap templates before it):** print the zone table, the down-block table, and the power / counter / trap result tables from the Task 2 tests in plain football language; the gap templates stay `reviewed: false` until the coach approves them.
