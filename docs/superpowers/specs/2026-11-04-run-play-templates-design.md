# Run Play Templates with Adaptive Block Assignments — Design

Date: 2026-11-04 · Status: approved · App use: strictly personal (single user, no sharing/permissions/conflict handling needed)

## Intent and why

Coaches already know blocking basics. The app should do the drawing so they can lay out a run play fast and think about football, not line-drawing. A coach picks a run template (e.g. Inside Zone), a play side, and every offensive player receives a block assignment that adapts to the offensive formation and the defensive front. Blocking lines appear on the chalkboard automatically. The coach can hand-adjust, and can save the result as their own template.

## Goals

- Built-in run templates for **zone** schemes (inside zone, outside zone) and **gap** schemes (power, counter, trap) — gap schemes involve pulling linemen.
- Assignments are **rules**, not fixed lines: re-resolved against the defense when the formation, front, or play side changes.
- A **modal picker** ("Choose a run", grid of templates + a "My templates" section, play-side selector, Apply button), modelled on the existing formation switcher. "Save as template" lives in the play's menu.
- **Hand adjustments are remembered**: if the coach tweaks a block and saves/updates a template, the template keeps that tweak as part of its rules. Updating an existing user template also keeps them.
- Generated blocks reuse the existing renderer (`run_block`, `pull_block`, T-bar, combo chains via `parentActionId`/`branchType: 'combo'`).

## Non-goals

- Pass-protection / blitz-pickup templates (run plays only for v1).
- New rendering code; new block line styles.
- Multi-user concerns: sharing, permissions, merge conflicts.
- Run reads/option logic for the QB or RB paths (ball carrier paths are not generated in v1 unless trivially part of a template — see "Left to the builder").

## Anti-goals (failure even if it technically works)

- Blocks that silently overwrite a coach's hand edits when the formation or front changes.
- Assignments stored on `Player` (they are overwritten when a formation is applied — known limitation of schema 1.1.0).
- Lines that point at nothing sensible (e.g. a lineman blocking air with no explanation).

## Zone rule (as specified by the coach)

For each lineman, in order:
1. Block the **first defender toward the play side** (the defender on him, or the next one over toward the play side).
2. If **no defensive lineman** is there, **combo** with a teammate **away from the play side** on a defensive lineman, then
3. **Climb to the second level** (linebacker) after the combo.

Gap schemes (power, counter, trap): the exact rules are defined per template (e.g. backside guard pulls and kicks out the end defender; playside tackle and tight end down-block, etc.). Rules for each are written in the builder's plan and reviewed with the coach before shipping (see below).

## Data structure (proposed, schema 1.2.0) — the builder's call on exact naming

Current model facts that constrain the design (from the codebase):
- `Play.actions: PathAction[]` has `run_block`/`pull_block`, with `parentActionId` + `branchType: 'combo'` for combo climbs. There is **no structured link from a block to a defender, gap or level**; targets only exist in text labels.
- Defenders are placed from `Player.technique` strings; `analyzeOffense()` gives gaps A/B/C/D, strength; `calculateDefensiveAlignmentPosition()` gives defender x/y.
- Applying a formation replaces `Player` objects (assignment text lost), so block plans must not live on `Player`.
- Any new field must be added to `playValidation.ts` whitelists/defaults and to `playMigrations.ts` (idempotent), or it is dropped on import.

Proposed shapes:

- **RunTemplate** `{ id, name, scheme: 'zone'|'gap', builtIn: boolean, steps per position group (OL/TE/RB), overrides? }` — a rule list per position group; each step: target selector (`first-defender-toward-playside`, `gap`, `technique`, `level`), fallback step, combo rule, climb rule, pull spec for gap schemes.
- **Play.blockPlan** `{ templateId, playSide: 'left'|'right'|'strong'|'weak', assignments: [{ playerPosition/id, step used, target (defender id | gap | level), comboPartner?, override?: boolean }] }`.
- Generated `PathAction`s carry a marker linking them to their assignment (e.g. `assignmentId`) so re-resolving replaces generated lines and leaves hand-drawn ones alone.
- **Overrides:** an assignment edited by the coach has `override: true`. Re-resolution (new formation/front/play side) skips overridden assignments unless the target no longer exists, in which case the assignment is flagged for the coach rather than silently changed.
- **Saved template** = the rule set plus the coach's override rules, expressed as rules relative to position/technique/gap (not to specific defender ids), so they apply to other formations and fronts.
- Storage: user templates saved next to formations (local storage + Firestore when cloud is on); built-ins in code, e.g. `src/data/runConcepts.ts`.

Integration points: `handleSelectOffenseFormation`, `handleSelectDefenseFront`, `handleApplyFormation`, `handleShiftDefense` in `App.tsx`, and `adaptRoutesToNewFormation` in `routeAdaptation.ts` (currently only translates lines; does not re-target). The resolver is a pure util (e.g. `src/utils/runTemplates.ts`).

## Constraints

- Stack: Vite 8, React 19, TypeScript, Tailwind 4, Firebase optional. Coordinates 0–1000 × 0–700; LOS y≈380; OL spacing 60.
- No test runner exists. Add a minimal one (or runnable script) for the resolver; keep `npm run build`, `lint`, `check:integrity` green.
- Update `docs/FEATURE_INVENTORY.md` (keep its `# Feature Inventory` heading) and add a walkthrough in `docs/superpowers/walkthroughs/`.
- Commit style: `feat(scope): ...`.

## Decided by the coach

- v1 covers zone and gap schemes.
- Picker is a modal (option B), "Save as template" in the play menu.
- Saved/updated templates remember hand adjustments.
- Personal use only.

## Calls made by the designer (approved by the coach on 2026-11-04)

- **Gap templates in v1:** power, counter and trap (all three named in Goals). Rules are drafted from standard football conventions and shown to the coach for a check before the gap templates ship (a gate before they are enabled, not before the zone templates).
- **What counts as a hand edit (`override: true`):** retargeting a block, adding/removing a combo, changing who pulls. Pure geometry nudges (same target, moved endpoint) are cosmetic: kept on that play only, never saved into templates.
- **Target gone after a front/formation change:** an overridden assignment whose target no longer exists keeps its old line drawn, greyed out and flagged. Nothing changes silently.
- **Play side:** stored as `left`/`right`. `strong`/`weak` are converted to left/right when applied. With no clear strong side, strong/weak are disabled and the coach chooses left/right.
- **Non-OL players:** TE follows the OL rules. RB carries the ball and gets no block, except a fullback lead block in gap schemes. QB and WRs get no assignment in v1.
- **Re-resolution:** changing formation, front or play side re-aims non-overridden blocks with no prompt. Opening an existing play does not re-resolve. A "Clear blocks" action removes generated lines and detaches the template.
- **Saving:** if the play came from a user template, offer "Update template" or "Save as new"; built-in templates only "Save as new".
- **Migration:** lazy, on load, idempotent. No one-off pass over cloud data (personal use).
- **User templates** reuse the formation-library storage path (local + Firestore).

## Left to the builder

- Exact type names and file layout; how many built-in gap templates ship first; whether ball-carrier (QB/RB) paths are part of templates in v1; exact visual treatment for flagged/unresolved assignments; test approach.

---

# Revision 2 (2026-11-04): runs are called by hole and runner, rules are defense-independent

Approved in conversation by the coach before build. Revision 2 **replaces** the Left/Right/Strong/Weak play-side choice, the "kinds" semantics in the first resolver, and the way defenders are identified. Everything else in this document (picker as a modal, save/update/clear, hand edits are remembered, personal use, schema 1.2.0, tests) stands. The branch `feat/run-play-templates` has not been merged; revision 2 is built on it before merge.

## Intent
Coaches call a run the way they speak it: **a runner number and a hole number**. The rules for each block type are the same against every defense; only *which defender* a rule lands on changes with the defense.

## The call
- **Hole** (0–8): odd = right, even = left. 1/2 A gap, 3/4 B gap, 5/6 C gap, 7/8 D gap, 0 over the center. **Hole 0 has no side: the coach chooses Left or Right** when making the call.
- **Runner** (1–4): 1 QB, 2 fullback, 3 tailback, 4 the remaining back. The runner carries the ball; the lead blocker is a back who is not the runner.
- The picker's play-side buttons (Left/Right/Strong/Weak) are replaced by a Hole selector (0–8) and a Runner selector (1–4). A Left/Right choice appears only when hole 0 is selected.

## Arithmetic (positions are board x-coordinates, 0–1000)
- **Line bodies:** linemen plus an attached tight end (a TE within 90 of the tackle), sorted by x outward from the center on each side: b1 guard, b2 tackle, b3 tight end. A missing body is replaced by a virtual one 60 further out, so every side always has holes 1–8.
- **Hole x (H):** hole 1/2 = midpoint(C, b1); 3/4 = midpoint(b1, b2); 5/6 = midpoint(b2, b3); 7/8 = midpoint(b3, b4); 0 = the center's x. Side from parity (odd right, even left); `dir = +1` right, `−1` left.
- **Runner → player:** 1 the QB; 2 the RB labelled FB, otherwise the RB nearest the QB; 3 the RB labelled TB/HB/RB/B, otherwise the RB farthest from the QB; 4 the remaining RB. Lead blocker: the back who is not the runner, nearest the QB first.
- **Defenders:** *on the line* = position DL, or a linebacker within 45 of the LOS; *second level* = every other linebacker. Tolerance `TOL = 30`. "Nearest" means smallest |dx| from the reference x.
- **Defender gap id (new, replaces naming defenders by technique string in saved edits):** each on-the-line defender's gap id is the hole number nearest his x (0–8); displayed in the Inspector (for example "B gap, right"). Saved hand edits refer to defenders by gap letter and side relative to the play side (`{by:'gap'}`), not by technique text. Technique remains only a fallback for defenders that are not on the line.

## Block types (the same rule against every defense)
`B` = the blocker's x, `H` = hole x. All targets are chosen from defenders still in the pool.

| Type | Primary target | Fallback |
|---|---|---|
| Zone | nearest on-the-line defender with `dir·(d−B) ≥ −TOL` (toward the play side) | combo, then climb |
| Down | nearest on-the-line defender with `dir·(d−B) ≤ +TOL` (away from the play side) | combo, then climb |
| Seal | same target as Zone | climb straight to the second level, no combo |
| Kickout (pulls) | nearest on-the-line defender with `dir·(d−H) > 15` (outside the hole) | second-level defender nearest H |
| Trap (pulls) | nearest on-the-line defender with `dir·(d−H) ≤ 15` (inside the hole) | second-level defender nearest H |
| Wrap (pulls) | second-level defender nearest H | none |
| Lead | second-level defender nearest H | on-the-line defender nearest H |

- **Combo (Zone and Down):** the blocker doubles the target of the **nearest blocker away from the play side that has one**. The blocker with no defender of his own climbs to the second-level defender nearest his x. If no partner exists he climbs directly.
- **Pulled targets** (Kickout, Trap) are removed from the pool before the other blockers choose.
- **Correction to the first build:** the first resolver sent an uncovered lineman to the neighbour *toward* the play side; the rule is *away from* the play side.
- Pulls dip behind the line then go to the target (unchanged).

## Templates
A template is a map **blocker slot → block type** (slots stay `te_ps, ot_ps, og_ps, c, og_bs, ot_bs, te_bs, fb`, now measured against the hole's play side). A call is *template + runner + hole (+ side for hole 0)*. Built-in zone templates use Zone on every slot (outside zone differs from inside zone only in its default hole, which is left to the builder). Power, Counter and Trap are re-expressed with the table above and stay disabled until the coach approves them.

## Data
`BlockPlan` gains `hole: number` (0–8) and `runner: number` (1–4); `playSide` stays and is derived from the hole (chosen for hole 0). Plans without `hole` (from the first build, never released) are read as before. Saved template overrides prefer `{by:'gap'}` targets; the existing technique form is kept for non-line defenders.

## Anti-goals (added)
- A rule whose result depends on a technique name or a particular front: the same rule must run unchanged against any defense.
- Hole numbers that point at the wrong gap when the formation has no tight end or an unbalanced line.

## Left to the builder
Exact module layout; the default hole for outside zone; how the lead blocker is chosen when the runner is the only back; labels in the Inspector for gap ids.
