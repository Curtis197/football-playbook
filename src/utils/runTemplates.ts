import type {
  BlockAssignment, BlockKind, BlockPlan, BlockSlot, BlockTarget, PlaySide, Player, RunCall, RunTemplate, TemplateOverride
} from '../types/playbook';
import { assignBlockSlots, firstLevelDefenders, resolveStrongSide, secondLevelDefenders } from './blockSlots';
import { callPlaySide, gapIdOf, holeX, leadBack } from './runHoles';

/** How far behind a blocker a defender may be and still count as "on him" (about half a gap). */
const TOL = 30;
/** A defender within this distance of the hole's x is "in the hole"; a kickout goes outside it, a trap inside. */
const HOLE_TOL = 15;

const SLOT_ORDER: BlockSlot[] = ['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs', 'fb'];
const KNOWN_KINDS: readonly BlockKind[] = ['zone', 'down', 'kickout', 'trap', 'wrap', 'seal', 'lead'];

const defenderTarget = (player: Player): BlockTarget => ({ type: 'defender', playerId: player.id });
const nearestTo = (x: number, list: Player[]): Player | undefined =>
  [...list].sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];

interface Blocker {
  slot: BlockSlot;
  kind: BlockKind;
  player: Player;
}

interface Context {
  players: Player[];
  playSide: PlaySide;
  dir: 1 | -1;                 // +1 when the play side is to the right
  holeX: number;
  firstLevel: Player[];        // Defenders on the line
  secondLevel: Player[];
  pulled: Set<string>;         // On-the-line defenders a pulling lineman already has; nobody else blocks them
  taken: Set<string>;          // Second-level defenders already given to a climb, Wrap or Lead
}

/** The second-level defender nearest x that nobody has yet; the nearest anyway once all are taken. */
function pickSecondLevel(x: number, ctx: Context): BlockTarget {
  const free = ctx.secondLevel.filter(d => !ctx.taken.has(d.id));
  const pick = nearestTo(x, free.length > 0 ? free : ctx.secondLevel);
  if (!pick) return { type: 'none' };
  ctx.taken.add(pick.id);
  return defenderTarget(pick);
}

/** Kickout goes to the first defender outside the hole; Trap to the first on the line inside it. */
function pullTarget(blocker: Blocker, ctx: Context): Player | undefined {
  const open = ctx.firstLevel.filter(d => !ctx.pulled.has(d.id));
  const outside = (d: Player) => ctx.dir * (d.x - ctx.holeX) > HOLE_TOL;
  return nearestTo(ctx.holeX, open.filter(d => (blocker.kind === 'kickout' ? outside(d) : !outside(d))));
}

/** Zone and Seal look toward the play side, Down looks away from it. */
function primaryTarget(blocker: Blocker, ctx: Context): Player | undefined {
  const open = ctx.firstLevel.filter(d => !ctx.pulled.has(d.id));
  const reach = (d: Player) => ctx.dir * (d.x - blocker.player.x);
  return nearestTo(blocker.player.x, open.filter(d => (blocker.kind === 'down' ? reach(d) <= TOL : reach(d) >= -TOL)));
}

/**
 * Zone, Down and Seal, in two passes. Pass 1 gives every blocker his primary defender (play side outward; a
 * defender can be chosen by several blockers, which is a double team). Pass 2 handles blockers with no defender:
 * Zone and Down combo with the nearest blocker away from the play side who has one, then climb; Seal, or a blocker
 * with no partner, climbs straight to the second level.
 */
function resolveGroup(blockers: Blocker[], ctx: Context): BlockAssignment[] {
  const ordered = [...blockers].sort((a, b) => ctx.dir * (b.player.x - a.player.x));
  const primary = new Map<string, Player | undefined>(ordered.map(b => [b.player.id, primaryTarget(b, ctx)]));
  const assignments: BlockAssignment[] = [];

  for (const blocker of ordered) {
    const { player, slot, kind } = blocker;
    const base = { id: `${player.id}-block`, playerId: player.id, slot, kind };
    const own = primary.get(player.id);
    if (own) {
      assignments.push({ ...base, target: defenderTarget(own) });
      continue;
    }

    const partner = kind === 'seal'
      ? undefined
      : ordered
        .filter(other => other !== blocker && primary.get(other.player.id) && ctx.dir * (other.player.x - player.x) < 0)
        .sort((a, b) => Math.abs(a.player.x - player.x) - Math.abs(b.player.x - player.x))[0];

    if (partner) {
      assignments.push({
        ...base,
        target: defenderTarget(primary.get(partner.player.id)!),
        comboWith: partner.player.id,
        climbTo: pickSecondLevel(player.x, ctx)
      });
    } else {
      assignments.push({ ...base, target: pickSecondLevel(player.x, ctx) });
    }
  }
  return assignments;
}

const opposite = (side: PlaySide): PlaySide => (side === 'right' ? 'left' : 'right');

/**
 * "3-Tech Strong" names a side of the formation, but a saved override is read against the play side.
 * Stored as "3-Tech Playside" / "3-Tech Backside" so the same edit means the right defender on either play side.
 * Techniques that do not end in Strong or Weak (Left, Right, Head-up) are returned unchanged.
 */
export function relativeTechnique(technique: string, strongSide: PlaySide, playSide: PlaySide): string {
  const match = /(Strong|Weak)$/.exec(technique);
  if (!match) return technique;
  const side = match[1] === 'Strong' ? strongSide : opposite(strongSide);
  return technique.replace(/(Strong|Weak)$/, side === playSide ? 'Playside' : 'Backside');
}

/** The inverse of relativeTechnique for a particular formation and play side. */
export function absoluteTechnique(technique: string, strongSide: PlaySide, playSide: PlaySide): string {
  const match = /(Playside|Backside)$/.exec(technique);
  if (!match) return technique;
  const side = match[1] === 'Playside' ? playSide : opposite(playSide);
  return technique.replace(/(Playside|Backside)$/, side === strongSide ? 'Strong' : 'Weak');
}

/**
 * A saved hand adjustment. A technique that no defender has leaves the base rule's answer in place,
 * so a template never fails on a front it was not made for.
 */
function applyOverride(
  assignment: BlockAssignment,
  override: TemplateOverride,
  ctx: Context,
  slots: Partial<Record<BlockSlot, Player>>
): BlockAssignment {
  const result: BlockAssignment = { ...assignment };
  const rule = override.target;
  if (rule?.by === 'technique') {
    const wanted = absoluteTechnique(rule.technique, resolveStrongSide(ctx.players), ctx.playSide);
    const match = ctx.players.find(p => p.side === 'defense' && p.technique === wanted);
    if (match) result.target = defenderTarget(match);
  } else if (rule?.by === 'none') {
    result.target = { type: 'none' };
  } else if (rule?.by === 'level') {
    result.target = { type: 'level', level: 'second' };
  } else if (rule?.by === 'gap') {
    // The on-the-line defender in that gap on that side of the play (the center counts as the A gap on both sides)
    const wanted: PlaySide = rule.relativeSide === 'playside' ? ctx.playSide : opposite(ctx.playSide);
    const blocker = ctx.players.find(p => p.id === assignment.playerId);
    const inGap = ctx.firstLevel.filter(d => {
      const id = gapIdOf(d, ctx.players);
      return id.gap === rule.gap && (id.side === wanted || id.side === 'center');
    });
    const match = nearestTo(blocker?.x ?? ctx.holeX, inGap);
    if (match) result.target = defenderTarget(match);
  }

  if (override.comboWithSlot === null) {
    delete result.comboWith;
    delete result.climbTo;
  }
  const partner = override.comboWithSlot ? slots[override.comboWithSlot] : undefined;
  if (partner && partner.id !== assignment.playerId) {
    result.comboWith = partner.id;
    result.climbTo ??= { type: 'level', level: 'second' };
  }
  if (override.pulls === true) result.pulls = true;
  if (override.pulls === false) delete result.pulls;
  return result;
}

/**
 * Turns a template and a call (runner + hole) into concrete assignments for the players on the board.
 * Pure: the same players, template and call always give the same plan. The rules never read a technique name.
 */
export function resolveBlockPlan(template: RunTemplate, players: Player[], call: RunCall): BlockPlan {
  for (const rule of Object.values(template.rules)) {
    if (rule && !KNOWN_KINDS.includes(rule.kind)) throw new Error(`Unknown block rule kind "${String(rule.kind)}"`);
  }

  const playSide = callPlaySide(call);
  const slots = assignBlockSlots(players, playSide);
  const blockers: Blocker[] = SLOT_ORDER
    .filter(slot => slot !== 'fb' && template.rules[slot] && slots[slot])
    .map(slot => ({ slot, kind: template.rules[slot]!.kind, player: slots[slot]! }));

  // The back slot is never a line position: it is whoever is not carrying the ball
  const lead = template.rules.fb ? leadBack(players, call.runner) : undefined;
  if (lead && template.rules.fb) blockers.push({ slot: 'fb', kind: template.rules.fb.kind, player: lead });

  const ctx: Context = {
    players,
    playSide,
    dir: playSide === 'right' ? 1 : -1,
    holeX: holeX(players, call.hole),
    firstLevel: firstLevelDefenders(players),
    secondLevel: secondLevelDefenders(players),
    pulled: new Set(),
    taken: new Set()
  };
  const assignments: BlockAssignment[] = [];
  const base = (b: Blocker) => ({ id: `${b.player.id}-block`, playerId: b.player.id, slot: b.slot, kind: b.kind });

  // Pulls first: their targets leave the pool
  for (const blocker of blockers.filter(b => b.kind === 'kickout' || b.kind === 'trap')) {
    const target = pullTarget(blocker, ctx);
    if (target) {
      ctx.pulled.add(target.id);
      assignments.push({ ...base(blocker), pulls: true, target: defenderTarget(target) });
    } else {
      assignments.push({ ...base(blocker), pulls: true, target: pickSecondLevel(ctx.holeX, ctx) });
    }
  }

  assignments.push(...resolveGroup(blockers.filter(b => b.kind === 'zone' || b.kind === 'down' || b.kind === 'seal'), ctx));

  for (const blocker of blockers.filter(b => b.kind === 'wrap' || b.kind === 'lead')) {
    let target = pickSecondLevel(ctx.holeX, ctx);
    if (target.type === 'none' && blocker.kind === 'lead') {
      const online = nearestTo(ctx.holeX, ctx.firstLevel);
      if (online) target = defenderTarget(online);
    }
    assignments.push({ ...base(blocker), ...(blocker.kind === 'wrap' ? { pulls: true } : {}), target });
  }

  for (const override of template.overrides ?? []) {
    const index = assignments.findIndex(a => a.slot === override.slot);
    if (index >= 0) assignments[index] = applyOverride(assignments[index], override, ctx, slots);
  }

  assignments.sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  return { templateId: template.id, playSide, hole: call.hole, runner: call.runner, assignments };
}
