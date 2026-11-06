# Run block rules of record

Date: 2026-11-05 · Status: rules confirmed by the coach in conversation and checked on the Pistol 12 Wing against the 3-4 Over (and other fronts). **Not yet in the app's resolver**: `src/utils/runTemplates.ts` still implements the earlier nearest-defender zone and the first Power draft. This file is the target for the rewrite; it supersedes the block-type table in *Revision 2* of `2026-11-04-run-play-templates-design.md` wherever they differ.

## Conventions (all rules use these)

- **Coordinates:** board x from 0 to 1000, line of scrimmage `y = 380`, line spacing 60.
- **The line (bodies):** linemen, an attached tight end (within 90 of the end of the line), and an attached **wing** such as U (within 90 of the end of the line and no more than 45 behind it). A wing is in the line.
- **Holes:** 1/2 A, 3/4 B, 5/6 C, 7/8 D gap, 0 over the center. Odd goes right, even goes left; hole 0 needs a coach-chosen side. A hole's x is the midpoint of the two bodies it sits between; a missing body counts as one 60 further out.
- **Runner:** 1 QB, 2 fullback, 3 tailback, 4 the remaining back (a single back is runner 2 and 3).
- **Defenders:** *on the line* = a DL, or an LB within 60 of the line (stand-up edge players such as a 9-tech OLB). *Second level* = every other LB. Defensive backs are ignored. Ambiguous labels (S, BD, JK, ST) are classified by technique.
- **A defender's gap:** the nearest hole to his x. **The 0-tech counts in the 1 gap.** Ties go to the lower hole.
- **Playside gap of a lineman:** the hole between him and the next body toward the play side.
- **Climb:** to the nearest linebacker on the lineman's playside. If there is none on that side, he blocks the **force defender**: the defensive back on his side of the formation who is **closest to the line of scrimmage** (by depth; a tie goes to the one nearest the climber). That is the **safety if he crashes** and the **corner if he presses**; with the off corner and the 2-high safeties of the 3-4 Over it is the corner. A nickel back counts as a defensive back (*assumption to confirm*). Only if the formation has no defensive back on that side does he go to the nearest linebacker anywhere. In the Wing 12, U (outside the wide 9) blocks the force defender.
- **Combo partner:** the lineman **next to me on the backside, and only him**. If he has no defender to double, I do not combo: I climb directly. **No triple team:** if the lineman next to me already has a double team on his man, I do not combo either; I climb directly.
- **A pure double team never climbs.** Only a combo does.

## Zone (the lineman's own words)

"I am responsible for a gap. Is there a defensive lineman on my playside gap? If yes, I reach block him. If no, I combo block the backside, then climb to my playside gap second-level player."

- Defensive lineman in my playside gap (on the line, by the gap rule above): **reach block him**.
- None: **combo with the adjacent backside lineman** on his defender, then **climb**.
- Every line player runs a zone block. Basic check, Wing 12 vs 3-4 Over, hole 2 (going left): LT reaches the weak OLB, LG the 4i, RG the nose (0-tech counts in the 1 gap), C combos with RG and climbs to Will, Y reaches the 5-tech, RT combos with Y and climbs to the Mike, U reaches the strong OLB.

## Power

- **Kickout target:** the **end of the defensive line**: the outermost on-the-line defender on the play side.
- **Who kicks out (first rule):** if there is a **backfield blocker** (an FB, H-back or Y-back: not the QB, not the runner, more than 45 behind the line), he kicks out; with several, the one nearest the hole. If there is none, the **end of the offensive line that has the target outside him** kicks out. A wing outside the target cannot: in the Wing 12 U is usually outside the wide 9, so **Y kicks out and U climbs directly**.
- **Backside guard:** pulls to the assigned gap (the hole) and **wraps** to the second-level player nearest the hole.
- **Everyone else on the line: down block.** A down block takes the nearest on-the-line defender between the next lineman away from the play side (excluded) and my outside shade (+30), with the kickout target out of the pool. Nobody there: combo with the adjacent backside lineman if he has a defender, then climb; otherwise climb directly.
- Check, Wing 12 vs 3-4 Over, 25 Power (runner 2, hole 5): Y kicks out the 9-tech OLB, RT down blocks the 5-tech, C the nose, RG combos with C and climbs to the Mike, LT down blocks the 4i, LG pulls and wraps to the Mike, U climbs directly to the Mike.

## Counter Trey

- **Backside guard:** pulls and kicks out the **end of the defensive line on the play side** (the outermost on-the-line defender on the play side).
- **Backside tackle:** pulls and **wraps** (second-level player nearest the hole).
- **Backfield blocker** (not the QB, not the runner, more than 45 behind the line), if there is one: blocks the **backside end of the defensive line** (the outermost on-the-line defender on the backside). With none, nobody blocks the backside end.
- **Center:** the pull empties the backside B and C gaps, so the defensive lineman in those gaps is the primary threat to the backfield, and the center blocks him (the 3-tech where the front has one; in a 3-4 Over, the 4i). *Reading to confirm: the nearest on-the-line defender on the backside of the center whose gap is B or C.*
- **Rest of the line:** down block, same Down rule as Power. The play-side end, the backside end when a back has him, and the center's man are out of the pool. The nose, no longer the center's, goes to the nearest down-blocker (RG in the Wing 12).
- **U** (nobody to block, no partner to double): climbs directly (see Climb).
- Check, Wing 12 vs 3-4 Over, 25 Counter Trey: LG kicks out the strong 9-tech OLB, LT wraps to the Mike, C blocks the weak 4i, RG the nose, RT and Y the strong 5-tech, U climbs.

## Still to define

Counter F, Iso and Buck Sweep. The zone rule above also still needs its re-check with "combo partner = adjacent backside lineman only", "no triple team" and the new climb on every front.

## To build once the rules are settled

Rewrite the resolver around gaps and these conventions; keep the picker, hand edits and saved templates as they are; add tests with the checks above as fixtures (Wing 12 vs 3-4 Over for zone and Power, the Wishbone for the backfield-blocker rule, the Wing 12 on the template board vs 4-3 Over for the end-of-line rule).
