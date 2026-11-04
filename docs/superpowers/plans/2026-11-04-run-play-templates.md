# Run Play Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A coach picks a run template (zone or gap scheme) and a play side, and every OL/TE (and the fullback in gap schemes) gets a block assignment that is drawn on the board and re-aims when the formation, front or play side changes; the result can be saved as the coach's own template, hand adjustments included.

**Architecture:** Templates are rule sets keyed by *blocker slot* (play-side tackle, backside guard, ...). A pure resolver turns template + players + play side into a `BlockPlan` (assignments targeting defenders, gaps or "second level"); a pure generator turns assignments into `run_block`/`pull_block` `PathAction`s that carry an `assignmentId`. Hand edits set `override` on an assignment and survive re-aiming. `Play.blockPlan` is new in schema 1.2.0; nothing is stored on `Player` (formation changes overwrite players).

**Tech Stack:** Vite 8, React 19, TypeScript 7, Tailwind 4, Firebase (optional), Vitest (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-11-04-run-play-templates-design.md` (read it first; it holds the decisions this plan relies on).

## Global Constraints

- Personal-use app: no sharing, permissions or conflict handling.
- Field coordinates are 0–1000 (x) by 0–700 (y); default LOS `y≈380`; OL spacing 60; defense has smaller `y`.
- Schema becomes `"1.2.0"`; 1.0.0 and 1.1.0 files must still load (lazy, idempotent migration; no cloud pass).
- Anything stored on `Play`/`PathAction` must be added to `playValidation.ts`, or it is dropped on import/load.
- Nothing is stored on `Player` for blocks. Reuse the renderer: no new line styles except a grey colour for stale blocks.
- Picker is a modal like `FormationSwitcherModal`; "Save as template" is in the play's menu; "Clear blocks" exists.
- Play side is stored as `'left' | 'right'`; strong/weak are converted at apply time; disabled when `hasClearStrength` is false.
- Hand edit = retarget, add/remove combo, change who pulls. Geometry-only nudges are cosmetic: never saved into templates.
- Applying a template replaces **all** existing `run_block`/`pull_block` actions on the play (routes and motions untouched), in a single undo step.
- Gap templates ship with `reviewed: false` and are disabled in the picker until the coach signs off their rules (Task 3 checkpoint).
- Keep `npm run build`, `npm run lint`, `npm run check:integrity` green; commit style `feat(scope): ...`; commits end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Update `docs/FEATURE_INVENTORY.md` (keep its `# Feature Inventory` heading) and add a walkthrough in `docs/superpowers/walkthroughs/`.

## Review Focus

- Formation with no TE, two TEs, or fewer than five OL: missing slots are skipped, nothing crashes (Task 2).
- Play with no defenders: plan is stored, no lines are drawn, no crash (Task 2).
- Play already has hand-drawn blocks: applying replaces them in one undo step (Task 7).
- Balanced formation: strong/weak disabled; a stored `playSide` stays absolute when the formation changes (Tasks 2, 7).
- Overridden assignment whose defender disappears after a front change: line stays, grey and flagged, never silently retargeted; stale overrides are not saved into templates (Tasks 5, 6).
- Loading a 1.1.0 play (no `blockPlan`) leaves it unchanged (Task 1).

## File Structure

- Modify `src/types/playbook.ts` — block types, `Play.blockPlan`, `PathAction.assignmentId`, version `1.2.0`.
- Modify `src/utils/playValidation.ts`, `src/utils/playMigrations.ts` — whitelist/defaults, version bump.
- Create `src/utils/blockSlots.ts` — blocker slots and defender levels from players (pure).
- Create `src/utils/runTemplates.ts` — `resolveBlockPlan` (pure).
- Create `src/utils/blockActions.ts` — assignments to `PathAction`s (pure).
- Create `src/utils/blockPlanApply.ts` — apply / re-aim / clear / edit / capture on a `Play` (pure).
- Create `src/data/runConcepts.ts` — built-in templates.
- Create `src/utils/runTemplateStorage.ts`, `src/hooks/useRunTemplateLibrary.ts`; modify `src/services/playbookDb.ts` — user templates (local + Firestore).
- Create `src/components/RunTemplateModal.tsx`; modify `src/App.tsx`, `src/components/InspectorPanel.tsx`, `src/components/Toolbar.tsx`.
- Create `src/test/fixtures.ts` and `*.test.ts` beside each util.

---

### Task 1: Test runner and schema 1.2.0

**Files:**
- Modify: `package.json`, `src/types/playbook.ts`, `src/utils/playValidation.ts`, `src/utils/playMigrations.ts`
- Create: `src/test/fixtures.ts`, `src/utils/playValidation.test.ts`

**Interfaces:**
- Produces (all in `src/types/playbook.ts`):
  - `type PlaySide = 'left' | 'right'`
  - `type BlockSlot = 'te_ps' | 'ot_ps' | 'og_ps' | 'c' | 'og_bs' | 'ot_bs' | 'te_bs' | 'fb'`
  - `type BlockKind = 'zone' | 'down' | 'kickout' | 'wrap' | 'seal' | 'lead'`
  - `type BlockTarget = { type: 'defender'; playerId: string } | { type: 'level'; level: 'second' } | { type: 'gap'; gap: 'A'|'B'|'C'|'D'; side: PlaySide } | { type: 'none' }`
  - `interface BlockAssignment { id: string; playerId: string; slot: BlockSlot; kind: BlockKind; target: BlockTarget; comboWith?: string; climbTo?: BlockTarget; pulls?: boolean; override?: boolean; stale?: boolean }` (`comboWith` = playerId of the combo partner)
  - `interface BlockPlan { templateId: string; playSide: PlaySide; assignments: BlockAssignment[] }`
  - `Play.blockPlan?: BlockPlan`, `PathAction.assignmentId?: string`, `PlaybookFile.version: "1.2.0"`
  - `interface BlockRule { kind: BlockKind }`
  - `type TargetRule = { by: 'technique'; technique: string } | { by: 'level' } | { by: 'gap'; gap: 'A'|'B'|'C'|'D'; relativeSide: 'playside' | 'backside' }`
  - `interface TemplateOverride { slot: BlockSlot; target?: TargetRule; comboWithSlot?: BlockSlot; pulls?: boolean }`
  - `interface RunTemplate { id: string; name: string; scheme: 'zone' | 'gap'; builtIn?: boolean; reviewed: boolean; rules: Partial<Record<BlockSlot, BlockRule>>; overrides?: TemplateOverride[]; updatedAt?: string }`
  - `PLAYBOOK_VERSION = '1.2.0'` in `playValidation.ts`; `READABLE_VERSIONS` includes `'1.0.0'`, `'1.1.0'`.
  - `src/test/fixtures.ts`: `offensePlayer(id, label, position, x, y): Player`, `defensePlayer(id, label, position, x, y, technique?): Player`, and `FOUR_THREE_OVER` / `OFFENSE_TE_RIGHT` as exported `Player[]` fixtures (values below).

- [ ] **Step 1: Add Vitest.** `npm i -D vitest`, add script `"test": "vitest run"`. Add a trivial passing test to confirm `npm test` runs. Expected: 1 passed.
- [ ] **Step 2: Create `src/test/fixtures.ts`.** `OFFENSE_TE_RIGHT`: LT(360), LG(420), C(480), RG(540), RT(600), TE(660), all `y=380`, position `OL` except TE `TE`; QB (480,440) `QB`; RB (480,480) `RB`. `FOUR_THREE_OVER` (defense): DE_L x330 y340 tech "5-Tech Weak"; DT_L x450 y340 "1-Tech Weak"; DT_R x570 y340 "3-Tech Strong"; DE_R x660 y340 "6-Tech Strong"; all `DL`. LBs `LB`, y300: W x390, M x490, S x600.
- [ ] **Step 3: Write failing tests in `playValidation.test.ts`:** `normalizePlay` keeps `blockPlan` (templateId, playSide, assignments with `override`) and `assignmentId` on actions; drops a `blockPlan` with an invalid `playSide`; a 1.1.0 play without `blockPlan` normalizes unchanged (`playsEqual` true); `normalizePlaybook` accepts versions `1.0.0`, `1.1.0`, `1.2.0` and rejects `9.9.9`. Run: `npm test` → FAIL.
- [ ] **Step 4: Implement** the types, whitelists (`blockPlan`: validate `playSide`, drop malformed assignments with a warning; `assignmentId`: text field), version bump, and `READABLE_VERSIONS`. `upgradePlay` needs no migration beyond leaving `blockPlan` untouched. Run `npm test` → PASS; `npm run build` → success.
- [ ] **Step 5: Commit** `feat(data-model): schema 1.2.0 with block plans`.

---

### Task 2: Zone resolver

**Files:**
- Create: `src/utils/blockSlots.ts`, `src/utils/runTemplates.ts`, `src/utils/blockSlots.test.ts`, `src/utils/runTemplates.test.ts`
- Create: `src/data/runConcepts.ts` (zone templates only in this task)

**Interfaces:**
- Consumes: Task 1 types and fixtures.
- Produces:
  - `blockSlots.ts`: `assignBlockSlots(players: Player[], playSide: PlaySide): Partial<Record<BlockSlot, Player>>` — OL/TE sorted by x; slot names are relative to `playSide` (`og_ps` is the guard on the play side). Missing players leave the slot absent. `fb` is the `RB`-position player nearest the QB (the fixture's single RB). `hasClearStrength(players: Player[]): boolean` — true when eligible TE+slot count differs between left and right of centre. `firstLevelDefenders(players): Player[]` — defenders with position `DL`, or position `LB` within 45 of the LOS `y`. `secondLevelDefenders(players): Player[]` — remaining `LB`s. `resolveStrongSide(players): PlaySide` — `analyzeOffense(players).strength`.
  - `runTemplates.ts`: `resolveBlockPlan(template: RunTemplate, players: Player[], playSide: PlaySide): BlockPlan`.
  - `runConcepts.ts`: `BUILT_IN_RUN_TEMPLATES: RunTemplate[]`; zone entries `run-inside-zone`, `run-outside-zone` (both `reviewed: true`, every present slot `{kind:'zone'}`, `te_ps` through `ot_bs`).

**Zone algorithm** (this is the coach's rule; steps run per blocker, outermost-first toward the play side; tolerance `TOL = 30`):
1. *Claim:* the blocker's candidate is the nearest first-level defender at or toward the play side of the blocker (`x` within `TOL` behind the blocker counts as "at").
2. *No candidate:* the candidate is the target of the nearest blocker toward the play side that has one. If none exists, the blocker goes straight to the second level.
3. *Shared defender:* the blocker nearest the play side keeps the defender; every other claimant on that defender becomes a combo (`comboWith` = the keeper's `playerId`), then climbs.
4. *Climb:* a climbing blocker's `climbTo` is the second-level defender nearest by `|dx|`; none → `{type:'none'}`.
Outside zone and inside zone use the same resolver in this version (differences are the aiming point and are left to the builder only if a test can pin them; otherwise ship identical rules and say so in the template description).

- [ ] **Step 1: Write failing tests (`blockSlots.test.ts`):** with `OFFENSE_TE_RIGHT` and `'right'`, `te_ps` is the TE, `ot_ps` RT, `og_ps` RG, `c` C, `og_bs` LG, `ot_bs` LT. With `'left'` the mapping mirrors (`te_ps` absent because TE is right: `te_bs` is the TE). `hasClearStrength` true for the fixture, false for the fixture with the TE removed. `firstLevelDefenders` returns the 4 DL; `secondLevelDefenders` the 3 LB.
- [ ] **Step 2: Write failing tests (`runTemplates.test.ts`)** for inside zone, `'right'`, `OFFENSE_TE_RIGHT` + `FOUR_THREE_OVER`, asserting assignment by `playerId`: TE→DE_R; RT→DT_R; RG→DT_R with `comboWith` RT and `climbTo` M; C→DT_L; LG→DT_L with `comboWith` C and `climbTo` W; LT→DE_L. Mirror test for `'left'` (swap ids by symmetry on a mirrored fixture built in the test). Tests for the Review Focus cases: no TE (no `te_*` assignment, no throw); two TEs; four OL only; no defenders (every target `{type:'none'}`, plan still returned); no clear candidate for TE with the outside DE removed (TE has `target` `none`/`level` per rule 2, no throw).
- [ ] **Step 3: Run tests, expect FAIL.**
- [ ] **Step 4: Implement `assignBlockSlots`, `hasClearStrength`, `firstLevelDefenders`, `secondLevelDefenders`, `resolveStrongSide`, `resolveBlockPlan`** (zone kind only; unknown kinds throw a clear error until Task 3). Assignment ids: `${playerId}-block`. Run tests → PASS.
- [ ] **Step 5: Checkpoint with the coach.** Print the fixture result as a table (blocker → target / combo / climb) and ask the coach to confirm it matches their zone rule. Do not continue past Task 3 on a "no".
- [ ] **Step 6: Commit** `feat(run): zone block resolver and built-in zone templates`.

---

### Task 3: Gap-scheme rules (power, counter, trap)

**Files:**
- Modify: `src/utils/runTemplates.ts`, `src/data/runConcepts.ts`
- Test: `src/utils/runTemplates.test.ts`

**Interfaces:**
- Consumes: Task 2 resolver.
- Produces: resolver support for kinds `down`, `kickout`, `wrap`, `seal`, `lead`; built-ins `run-power`, `run-counter`, `run-trap` with `reviewed: false`.

Kind semantics (pin in tests; defender = first-level unless stated):
- `down`: blocks the first first-level defender **inside** (toward the centre) of the blocker's gap, `target` that defender.
- `kickout`: pulls (`pulls: true`), `target` = the first first-level defender outside the play-side-most blocker with a `down`/`zone` assignment (the "end man on the line of scrimmage").
- `wrap`: pulls, then `climbTo` the second-level defender nearest the point of attack.
- `seal`: blocks the nearest first-level defender toward the play side of the blocker, from the backside (cut-off).
- `lead`: the fullback/RB slot `fb`, `target` = the nearest second-level defender to the point of attack (the hole).
Draft rule tables from standard conventions, in the template data, and keep them readable (one line of intent per slot in the template `description`-style comment is fine):
- Power: `te_ps` down, `ot_ps` down, `og_ps` down, `c` down (back), `og_bs` kickout, `ot_bs` seal, `fb` lead.
- Counter: `te_ps`/`ot_ps` down, `og_ps` down, `c` seal, `og_bs` kickout, `ot_bs` wrap, `fb` lead.
- Trap: `ot_ps` down, `og_ps` down, `c` seal, `og_bs` kickout (pulls and traps the first DL past the play-side guard), `ot_bs` seal.

- [ ] **Step 1: Write failing tests** for power, `'right'`, `OFFENSE_TE_RIGHT` (its RB fills the `fb` slot) vs `FOUR_THREE_OVER`: LG (`og_bs`) `pulls` and targets the first-level defender outside the play-side-most down-blocker (DE_R); LT (`ot_bs`) `kind` `seal`; FB targets a second-level defender. Same shape of tests for counter and trap (at least one distinguishing assertion each, e.g. counter's LT `wrap` has `pulls` and a `climbTo`). A test that a template with an unknown kind throws.
- [ ] **Step 2: Run, expect FAIL.** **Step 3: Implement.** **Step 4: Run, expect PASS.**
- [ ] **Step 5: Checkpoint with the coach.** Show the three rule tables in plain football language (e.g. "Power: backside guard pulls and kicks out the end man; backside tackle seals; ...") and wait for corrections. Only after sign-off set `reviewed: true` on the approved templates.
- [ ] **Step 6: Commit** `feat(run): gap-scheme block rules (power, counter, trap)`.

---

### Task 4: Draw assignments as blocks

**Files:**
- Create: `src/utils/blockActions.ts`, `src/utils/blockActions.test.ts`
- Modify: `src/types/playbook.ts` only if a field is missing (none expected)

**Interfaces:**
- Consumes: `BlockAssignment`, `PathAction`, `Player`.
- Produces: `buildBlockActions(plan: BlockPlan, players: Player[]): PathAction[]`.

Rules: each assignment yields one action for its blocker, `assignmentId` set, `type` `pull_block` when `pulls` else `run_block`, `endMarker: 'tbar'`, `points` from the blocker's position to the target defender's position (`gap` target → the gap's `x,y` from `analyzeOffense(players).gaps`; `level` → nearest second-level defender; `none` → no action). A `pull_block` goes behind the line: first point down the line (toward the play side, 20 px behind LOS in y), then to the target. A combo yields the first leg to the shared defender plus a second action with `parentActionId` = the first action's id, `branchType: 'combo'`, from the target to `climbTo` (omit the second leg when `climbTo` is `none`). `stale` assignments draw their old target position in `color: '#6b7280'` with `label: 'target gone'` and no climb.

- [ ] **Step 1: Write failing tests:** a zone assignment with combo yields two actions linked by `parentActionId`/`branchType: 'combo'`; endpoints equal the defender coordinates; `pulls` yields `pull_block` with an intermediate point behind the LOS (`y` greater than LOS); target `none` yields zero actions; a `stale` assignment yields a grey action labelled `target gone`.
- [ ] **Step 2: Run, expect FAIL. Step 3: Implement. Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(run): generate block lines from assignments`.

---

### Task 5: Apply, re-aim, clear and hand edits

**Files:**
- Create: `src/utils/blockPlanApply.ts`, `src/utils/blockPlanApply.test.ts`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces (all pure `Play → Play`):
  - `applyRunTemplate(play: Play, template: RunTemplate, playSide: PlaySide): Play` — sets `blockPlan`, replaces every `run_block`/`pull_block` action with `buildBlockActions` output, sets `primaryRunConcept` to the template name.
  - `reaimBlocks(play: Play, templates: RunTemplate[]): Play` — returns `play` unchanged when it has no `blockPlan` or its template is not in `templates`; otherwise re-resolves, keeps `override` assignments whose target defender still exists (copying the old assignment), marks overrides whose defender is gone `stale: true`, and regenerates generated actions only.
  - `clearBlocks(play: Play): Play` — removes `blockPlan` and every action with an `assignmentId`.
  - `editAssignment(play: Play, assignmentId: string, change: { target?: BlockTarget; comboWith?: string | null; pulls?: boolean }): Play` — sets `override: true`, clears `stale`, regenerates that assignment's actions.
  - `resolvePlaySide(requested: 'left' | 'right' | 'strong' | 'weak', players: Player[]): PlaySide | null` — `null` when strong/weak is requested and `hasClearStrength` is false.

- [ ] **Step 1: Write failing tests:** apply replaces pre-existing hand-drawn `run_block`s and leaves `pass_route`/`motion` untouched; re-aim after swapping the defense to a different front retargets non-override assignments; an overridden assignment whose defender id still exists is kept; one whose defender is gone becomes `stale` and its action is grey (Review Focus); a play without `blockPlan` is returned referentially unchanged; `clearBlocks` removes only generated actions; `resolvePlaySide('strong', balancedPlayers)` is `null`, `'strong'` with the fixture is `'right'`; the stored `playSide` does not change when `reaimBlocks` runs after the formation flips strength.
- [ ] **Step 2: Run, expect FAIL. Step 3: Implement. Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(run): apply, re-aim, clear and edit block plans`.

---

### Task 6: Save and update user templates

**Files:**
- Modify: `src/utils/blockPlanApply.ts`, `src/utils/runTemplates.ts`, `src/services/playbookDb.ts`
- Create: `src/utils/runTemplateStorage.ts`, `src/hooks/useRunTemplateLibrary.ts`, `src/utils/runTemplateStorage.test.ts`; extend the two existing test files

**Interfaces:**
- Consumes: Task 5; `StorageOutcome` from `src/hooks/useFormationLibrary.ts`.
- Produces:
  - `captureRunTemplate(play: Play, base: RunTemplate, name: string, existingId?: string): RunTemplate` — copies `base.rules`, converts each non-stale `override` assignment into a `TemplateOverride` (`target`: defender → `{by:'technique', technique}` using the defender's `technique`, falling back to `{by:'level'}` when it has none; `comboWith` → `comboWithSlot` via the partner's slot; `pulls`); geometry is not captured. `reviewed: true`, `builtIn` false, `updatedAt` stamped.
  - `resolveBlockPlan` honours `template.overrides`: for the override's slot, a defender whose `technique` equals the rule's technique replaces the base target; no match → base rule is used (no throw).
  - `runTemplateStorage.ts`: `loadStoredRunTemplates(): RunTemplate[]`, `saveStoredRunTemplates(list: RunTemplate[]): void` (key `antigravity_football_run_templates_v1`, same try/catch style as `formationStorage.ts`), `mergeRunTemplateSources(builtIn, remote, deviceOnly): RunTemplate[]`.
  - `playbookDb.ts`: `saveRunTemplate`, `fetchRunTemplates`, `deleteRunTemplate` (collection `runTemplates`, mirroring the formation functions).
  - `useRunTemplateLibrary(): { templates: RunTemplate[]; upsert(t: RunTemplate): Promise<StorageOutcome>; remove(id: string): Promise<StorageOutcome>; refresh(): Promise<void> }` — same local/cloud behaviour as `useFormationLibrary`.

- [ ] **Step 1: Write failing tests:** capture from a play with one retargeted override yields exactly one `TemplateOverride` with the technique target; a stale override is not captured (Review Focus); geometry-only changes (moved action points, no `override`) produce zero overrides; applying the captured template to a *different* front resolves the overridden slot to the defender with that technique; no technique match falls back to the base rule; `mergeRunTemplateSources` precedence is device > cloud > built-in; stored templates with malformed JSON load as `[]`.
- [ ] **Step 2: Run, expect FAIL. Step 3: Implement. Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** `feat(run): save and update user run templates`.

---

### Task 7: Picker modal, play menu, inspector and wiring

**Files:**
- Create: `src/components/RunTemplateModal.tsx`
- Modify: `src/App.tsx`, `src/components/Toolbar.tsx` (open button, next to "Formations"), `src/components/InspectorPanel.tsx` (block section near the existing block panel), plus the play menu where "Save as template" lives (find where formations' "Save/Update" actions sit in `PlayBar.tsx`/`Toolbar.tsx` and follow it)

**Interfaces:**
- Consumes: Tasks 2–6.
- Produces:
  - `RunTemplateModal` props: `isOpen: boolean; onClose(): void; templates: RunTemplate[]; players: Player[]; currentTemplateId?: string; onApply(template: RunTemplate, playSide: 'left'|'right'|'strong'|'weak'): void; onDeleteTemplate(id: string): void`. Grid of built-in templates, then a "My templates" section; templates with `reviewed: false` are disabled with the text "Rules awaiting coach check"; play-side buttons Left / Right / Strong / Weak, the last two disabled when `hasClearStrength(players)` is false.
  - Play menu: "Save as template" (name prompt); when `play.blockPlan` points at a user template, also "Update template" (overwrites that template's overrides); built-ins only offer "Save as new". "Clear blocks".
  - Inspector (when the selected action has `assignmentId`): target select (defenders on the play, "Second level"), "Combo with" select (other blockers or none), "Pulls" toggle; each change calls `editAssignment`. Stale assignments show "Target gone — pick another or clear".
  - `App.tsx`: after every handler that changes alignment — `applyFormation`, `handleShiftDefense`, `handleRealignDefense`, `handleApplyDefenders`, `handleMorphBackfield` — pass the result through `reaimBlocks(play, templates)` inside the same `updateCurrentPlay` call (one history step). Opening a play never re-aims.

- [ ] **Step 1: Build `RunTemplateModal`** following `FormationSwitcherModal.tsx` styling; apply calls `resolvePlaySide` and, on `null`, shows an error notification instead of applying.
- [ ] **Step 2: Wire `App.tsx`:** state `isRunModalOpen`; `handleApplyRunTemplate` → `updateCurrentPlay(p => applyRunTemplate(p, template, side))` plus a notification stating how many existing blocking lines were replaced; `handleClearBlocks`; `handleSaveRunTemplate` / `handleUpdateRunTemplate` using `captureRunTemplate` and the `useRunTemplateLibrary` hook (notify cloud vs device outcome exactly as `handleUpdateFormation` does).
- [ ] **Step 3: Add the re-aim call** to the five alignment handlers listed above.
- [ ] **Step 4: Inspector section** for assignment edits as described.
- [ ] **Step 5: Verify:** `npm test` (all pass), `npm run build` (success), `npm run lint` (no new errors). Per the user's standing rule, do **not** launch a browser to check layout; for the modal and inspector widths, state the arithmetic (available width vs content width at each existing breakpoint) when reporting.
- [ ] **Step 6: Commit** `feat(run): run template picker, save/update and block editing`.

---

### Task 8: Docs and final verification

**Files:**
- Modify: `docs/FEATURE_INVENTORY.md`
- Create: `docs/superpowers/walkthroughs/2026-11-04-run-play-templates.md`

- [ ] **Step 1:** Add a "Run Play Templates" section to the inventory (picker, play side, zone and gap schemes, re-aim, overrides, save/update, clear blocks) and a walkthrough in the existing style (title, Date, Status, summary, verification section listing the exact commands run and their results).
- [ ] **Step 2:** Run `npm test`, `npm run build`, `npm run lint`, `npm run check:integrity`; paste the pass counts into the walkthrough.
- [ ] **Step 3: Commit** `docs(run): feature inventory and walkthrough for run play templates`.
