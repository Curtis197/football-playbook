# Walkthrough: Simplified Screen

**Date:** 2026-11-04
**Status:** Completed & verified (type check, lint, build, server-render and layout/contrast arithmetic; not exercised in a browser)

## Why
An audit found the same control in up to three places (Build/View x3, play selector x3, defense fronts x4), a View mode that still edited the play, an overlay bar that covered the top of the field and a status bar that covered the bottom, and a top bar that needed ~1570px (wrapping to two rows below that).

## What changed
1. **PlayBar** (new): one home for play-level and matchup controls, in normal flow above the board.
2. **Top bar**: app-level actions only, a single Build/View toggle, a real File menu.
3. **Read-only View**: bar, Inspector (disabled fieldsets), canvas handles, delete, undo/redo, import.
4. **Board sizing**: fits the smaller of width and height; status line is a fixed-height row below it.
5. **Rail / Inspector widths**: rail icon-only until 2xl, Inspector 320px until 1800px.
6. Contrast fixes on everything touched (rail descriptions were 3.6, light-theme icons ~2, status coordinates 3.75, Game Plan button 4.1).

## Layout arithmetic (estimates +/-15%; heights assume the viewport minus ~120px of browser chrome)

| Viewport | Board column | Top bar (need / avail) | Bar line 1 (need / avail) | Matchup rows | Board, matchup open | Board, matchup hidden | Before: visible, uncovered |
|---|---|---|---|---|---|---|---|
| 1024x648 | 640 | 1126 / 1024 -> 2 rows | 787 / 624 -> wraps | 3 | 451x316 | 597x418 | 114 of 280 px high |
| 1280x600 | 896 | 1126 / 1280 (12.0% spare) | 787 / 880 (10.6% spare) | 2 | 543x380 | 640x448 | 293 of 459 |
| 1366x648 | 982 | 17.6% spare | 18.5% spare | 2 | 611x428 | 709x496 | 387 of 519 |
| 1440x780 | 1056 | 21.8% spare | 24.3% spare | 2 | 800x560 | 897x628 | 439 of 571 |
| 1536x744 | 992 | 26.7% spare | 19.4% spare | 2 | 749x524 | 846x592 | 499 of 638 |
| 1920x960 | 1312 | 41.4% spare | 39.3% spare | 2 | 1057x740 | 1100x770 | 638 of 770 |

At 1280 the top bar and bar line 1 are close to the 10% floor; both wrap rather than overflow, so the failure mode is one extra row, not clipping. At 1024 the layout is usable but not comfortable (this app has never targeted narrower than a small laptop).

## Not done
- Dark-theme chalkboard labels stored as black (the earlier "default black" decision) are still hard to read on the dark board; that is a design call.
- Keyboard shortcuts V/R/B/M/O/D are still declared but not wired.
- `RouteDrawer`, the `.js` duplicates and unused swatches are listed as spec deliverables in this inventory, so they were left alone.
