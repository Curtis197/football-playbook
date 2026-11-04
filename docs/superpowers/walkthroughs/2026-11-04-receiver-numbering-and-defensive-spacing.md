# Walkthrough: Receiver Numbering and Defensive Spacing

**Date:** 2026-11-04
**Status:** Completed & verified with scripted arithmetic checks (no in-app run)

## Why
The #1/#2/#3 receiver numbering was computed by two functions that disagreed (the defense/Inspector counter dropped attached TEs and counted backs by label; the route counter counted TEs and used stored positions). They differed on every preset play. Route mapping also stacked several routes on one receiver when the new formation had fewer receivers. A full defense-package sweep then showed 166 defender overlaps.

## What changed
1. **One counter** - `analyzeOffense` takes `allReceiversLeft/Right` and `number1..3` from `categorizeOffensivePlayers`. Attached TEs count; backs never do.
2. **Route mapping** - `concept_numbered` is one-to-one by outside-in rank on the same side. A rank the new formation lacks keeps its route where it is (no nearest-player guess, no jump to the other side). Backs map by their own rank.
3. **Apex / nickel** - play off the first receiver outside the attached TE (the TE is already their edge reference). Without an outside receiver the synthetic slot is at least 60 px outside the edge.
4. **Spacing rules** (constants in `defensiveAlignment.ts`)
   - 10 stack sits at least 34 px from the 00 stack (A-gap midpoint was 30; nodes are 32 wide).
   - 9-tech with no TE is 58 px off the tackle (was 45; 20 px from the 5-tech).
   - Press corner: outside leverage (10 px) when #1 is within 70 px of the edge (bunch); 62 px outside when #1 is the TE itself.

## Checks
- `npm run check:receivers` - defense counter equals route counter on every alignment; route-mapping sweep over every alignment pair.
- `npm run check:defense` - every package against every alignment: techniques recognized, defenders on the board, `Off CB` exactly 12 px inside #1, no two defenders closer than 32 px.
- Results: counters differ on 0 of 45 alignments (was 8 of 8 on the preset plays); defender overlaps 166 -> 0 over 315 combinations.

## Behaviour changes to be aware of
- Plays already saved keep their stored defender positions until a front or formation is re-applied.
- The Inspector "#2/#3 Slot" references now include an attached TE.
- A route whose rank does not exist in the new formation stays drawn in place and keeps its old player id.

## Not done
- One stacked route remains when two preset plays reuse the same player id (X/Y/Z).
- Corner rules for bunch and TE-only sides come from the geometry, not from a coaching reference.
