# Walkthrough: Automated Tests & CI

**Date:** 2026-11-04
**Status:** Completed. Tests, type check, lint and build verified locally; the GitHub Actions workflow itself has not run yet.

## Why
Four rounds of restructuring (data safety, schema 1.1.0, one code path per action, a simplified screen) were verified with throwaway scripts that were thrown away. Nothing stopped the same bugs coming back.

## What was added
1. **Vitest 5.1** (supports Vite 8 and Node 22.12+/24), `vitest.config.ts`, scripts `test`, `test:watch`, `typecheck`, `verify`. Tests are type-checked and linted with the app.
2. **13 test files, 1,107 checks + 4 expected failures**, next to the code they cover (see the inventory entry for the list).
3. **`src/utils/playbookHistory.ts`**: undo/redo, edit stamping and cloud merge moved out of `App.tsx` unchanged so they can be tested. `App.tsx` now calls it.
4. **`initialTab` prop on `InspectorPanel`** so tests can render each tab (the Philosophy and Reads tabs were otherwise unreachable without a browser).
5. **CI workflow** and a Development section in the README.

## How well do the tests catch bugs?
Fifteen behaviours were broken on purpose, one at a time, and the suite was run each time. The first pass caught 14; the survivor (breaking the read-only guard on the Reads tab) exposed that tests only saw one Inspector tab. After adding `initialTab` and tests for every tab and the vector form, all 15 are caught.

## Findings
- **Four built-in offensive formations have twelve players**: Double Wing 22, Pro-I Condensed Bunch 21, Gun 20 Trips, Gun 10 Quads Bunch. Choosing one puts twelve offensive players on the board. Which player to remove is a football decision (the personnel code and the labelled alignment disagree), so they are recorded as expected failures and will start failing loudly once fixed.
- Several defensive shifts correctly do nothing when a front is already in the requested state (for example "Over" on an Over front); the tests now assert that no shift is dead across the built-in fronts instead of assuming every shift moves every front.

## Not covered
- The React components' behaviour on click/keyboard (menus opening, the Matchup toggle, drag and draw gestures): that needs a DOM or browser, which this project deliberately avoids. The pure logic behind them is covered.
- Firestore reads/writes (`playbookDb.ts`, `useFormationLibrary`): they need the Firebase SDK or a fake of it.
- Visual layout and contrast: verified by arithmetic during the work, not by tests.
