# Walkthrough: Spacious Defensive Alignment Depth Calibration for Blocking Schemes

**Date**: 2026-11-03  
**Task**: Push the default defensive alignment further off the Line of Scrimmage (LOS) to allow comfortable, unobstructed drawing of blocking schemes, pull tracks, combo releases, and terminal T-bar markers.

---

## 1. Problem
- In earlier builds, down linemen (DL) were positioned only $32\text{px}$ off the Line of Scrimmage (`dlY = losY - 32`), and linebackers (LB) were $85\text{px}$ off LOS (`lbY = losY - 85`).
- When combined with the $18\text{px}$ blank node perimeter start offset for players with no node shape (`shape === 'none'`), the visible line length from an offensive lineman to a defensive lineman was merely $14\text{px}$ ($32 - 18$).
- At $14\text{px}$, terminal perpendicular T-bar markers overlapped offensive linemen, reach/scoop angles could not be legibly depicted, and drawing multi-point combo climb releases to second-level linebackers was cramped.

---

## 2. Implementation & Calibration

### Mathematical Depth Calibration (`src/utils/defensiveAlignment.ts`)
Updated `calculateDefensiveAlignmentPosition` with calibrated depth levels:

| Level | Role | Old Offset | New Offset | Y on Field ($losY = 380$) | Functional Clearance |
|---|---|---|---|---|---|
| **1st Level** | Down Linemen (NT, DT, DE) | $losY - 32$ ($348$) | **$losY - 55$ ($325$)** | $325$ | **$37\text{px}$ visible line** from $18\text{px}$ blank node boundary; T-bar terminates cleanly without overlapping OL |
| **1st Level Edge** | Press CB / Edge Stand-up | $losY - 45$ ($335$) | **$losY - 65$ ($315$)** | $315$ | Clean separation from split receivers and tight ends |
| **Alley / Overhang** | Apex / Nickel (NK, Sam) | $losY - 60$ ($320$) | **$losY - 80$ ($300$)** | $300$ | Distinct alley separation between tackle box and perimeter |
| **2nd Level** | Linebackers (Mike, Will, Sam) | $losY - 85$ ($295$) | **$losY - 115$ ($265$)** | $265$ | **$60\text{px}$ running lane behind DL** for combo climb releases and scrape paths |
| **3rd Level** | Off Cornerbacks (CB) | $losY - 105$ ($275$) | **$losY - 140$ ($240$)** | $240$ | Authentic 7-8 yard cushion off boundary receivers |
| **3rd Level** | Robber / Down Safety (SS) | $losY - 145$ ($235$) | **$losY - 185$ ($195$)** | $195$ | Intermediate alley robber |
| **3rd Level** | 2-High Quarters Safety | $losY - 185$ ($195$) | **$losY - 235$ ($145$)** | $145$ | Deep half/quarter coverage |
| **3rd Level** | Single-High Free Safety (FS) | $losY - 225$ ($155$) | **$losY - 275$ ($105$)** | $105$ | Deep middle 1/3 with 55px top margin on canvas |

---

## 3. Presets & Storage Synchronization
1. **Default Preset Plays (`src/data/presets.ts`)**:
   - `DEFAULT_WISHBONE_PLAY`: Updated 11 defensive players and offensive line block actions (`a_lt`, `a_lg`, `a_c`, `a_rg`, `a_rt`, `a_h`) to reach cleanly to $y = 330$ and $y = 285$.
   - `PRO_I_VEER_OPTION_PLAY`: Updated 11 defensive players and veer release blocks.
   - `GUN_TREY_BOOT_PLAY`: Updated 3-4 Over defenders.
   - `PISTOL_COUNTER_TREY_PLAY`: Updated 4-2-5 Nickel defenders and pulling blocks (`c_lg`, `c_rg`, `c_lt`, `c_y`).
2. **Passing Concepts (`src/data/passingConcepts.ts`)**:
   - Updated defenders across all 4 passing concept plays (`STICK_TRIPS_11P_PLAY`, `SNAG_PRO_SET_21P_PLAY`, `MESH_ACE_12P_PLAY`, `SHALLOW_CROSS_PISTOL_20P_PLAY`).
3. **Local Storage Migration (`src/utils/storage.ts`)**:
   - In `loadPlaybookFromStorage()`, automatically detects legacy cramped wishbone coordinates (`nt.y >= 345`) and refreshes to the new spacious preset.
4. **Seed Script (`scripts/seed-defensive-fronts.mjs`)**:
   - Synchronized all 10 defensive front packages to the new depth coordinates.

---

## 4. Verification & QA
- **Linter**: `npm run lint` (`oxlint`) passed with **0 errors, 0 warnings**.
- **Build**: `npm run build` (`tsc -b && vite build`) passed with **0 errors** in 1.55s.
- **Integrity**: `npm run check:integrity` passed.
- **Deletions Audit**: Verified zero unintended deletions via `git diff --diff-filter=D`.
