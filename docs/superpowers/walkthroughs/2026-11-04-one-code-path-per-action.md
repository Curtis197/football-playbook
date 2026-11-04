# Walkthrough: One Code Path per Action

**Date:** 2026-11-04
**Status:** Completed & verified with scripted checks (no in-app run)

## Why
An audit found the same action implemented in several places that behaved differently: two formation lists that drifted apart, three ways to apply a formation, five copies of the player colour logic, and save messages that did not match what happened.

## What changed
1. **Formation list** - `useFormationLibrary` owns it. `App.tsx` and `FormationSwitcherModal.tsx` no longer call Firestore for formations; the drawer receives the list and actions as props.
2. **Apply** - `applyFormationToPlay` (pure) replaces `handleApplyFormation`, `handleSelectOffenseFormation` and `handleSelectDefenseFront`. Checked against the old picker logic for all 45 offense templates and all 7 fronts: identical results.
3. **Capture/save** - `captureFormationPlayers` and `buildFormationFromPlay` replace four hand-built copies.
4. **Persistence honesty** - device-only formations are stored in `localStorage` and validated on load; outcomes are reported per save.
5. **Colours** - `resolvePlayerColors(player, surface)`; `field` equals the old canvas logic for 912 player/combination cases, `light` equals the old Inspector logic, `dark` differs only for unset letters on bare text (1.2 -> 17.3 contrast).
6. **Cloud save** - one function, honest per-target messages; formation saves no longer report a play save.

## Behaviour changes to be aware of
- Applying an offense formation from the drawer now re-aligns the defense and links the play (the on-canvas picker already did).
- Updating a template no longer overwrites an explicit defender technique.
- A formation whose cloud save fails stays on this device and reappears after reload.

## Not done
- Play selector (3 places), Build/View toggle (3 places) and the four front entry points are still duplicated controls; that is a layout decision for the next step.
- Defense *packages* (`DefenseFrontModal`) are a separate catalogue from defensive formations; merging them needs a data decision.
- Dead code (`RouteDrawer`, `.js` duplicates, `PLAYER_COLOR_SWATCHES`, `philosophySummary`) is untouched.
