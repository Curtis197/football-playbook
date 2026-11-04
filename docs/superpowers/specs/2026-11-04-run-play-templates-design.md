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
