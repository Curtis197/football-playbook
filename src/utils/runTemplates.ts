import type { BlockAssignment, BlockKind, BlockPlan, BlockSlot, BlockTarget, PlaySide, Player, RunTemplate, TemplateOverride } from '../types/playbook';
import { assignBlockSlots, firstLevelDefenders, resolveStrongSide, secondLevelDefenders } from './blockSlots';

/** How far behind a blocker a defender may be and still count as "on him" (about half a gap). */
const TOL = 30;

const SLOT_ORDER: BlockSlot[] = ['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs', 'fb'];
const KNOWN_KINDS: readonly BlockKind[] = ['zone', 'down', 'kickout', 'trap', 'wrap', 'seal', 'lead'];
const PULL_KINDS: readonly BlockKind[] = ['kickout', 'trap', 'wrap'];

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
  dir: 1 | -1;                // +1 when the play side is to the right
  firstLevel: Player[];
  /** Defenders a pulling lineman is already assigned to; nobody else blocks them. */
  pulled: Set<string>;
}

function climbFor(player: Player, ctx: Context): BlockTarget {
  const nearest = nearestTo(player.x, secondLevelDefenders(ctx.players));
  return nearest ? defenderTarget(nearest) : { type: 'none' };
}

/**
 * Zone, down and seal blocks, applied outermost-first toward the play side:
 * 1. take the nearest candidate defender (zone/seal: at or toward the play side; down: strictly inside);
 * 2. with no candidate, help the nearest blocker toward the play side who has a defender, then climb;
 * 3. a defender already taken stays with the blocker nearest the play side; the rest combo, then climb.
 */
function resolveGroup(blockers: Blocker[], ctx: Context): BlockAssignment[] {
  const { dir } = ctx;
  const ordered = [...blockers].sort((a, b) => dir * (b.player.x - a.player.x));
  const open = ctx.firstLevel.filter(d => !ctx.pulled.has(d.id));
  const keeperOf = new Map<string, Blocker>();
  const assignments: BlockAssignment[] = [];
  let lastDefender: Player | undefined;

  for (const blocker of ordered) {
    const { player, slot, kind } = blocker;
    const eligible = kind === 'down'
      ? open.filter(d => dir * (d.x - player.x) < 0)
      : open.filter(d => dir * (d.x - player.x) >= -TOL);
    const defender = nearestTo(player.x, eligible) ?? lastDefender;

    const base = { id: `${player.id}-block`, playerId: player.id, slot, kind };
    if (!defender) {
      const hasLevels = open.length > 0 && secondLevelDefenders(ctx.players).length > 0;
      assignments.push({ ...base, target: hasLevels ? { type: 'level', level: 'second' } : { type: 'none' } });
      continue;
    }
    const keeper = keeperOf.get(defender.id);
    if (keeper) {
      assignments.push({ ...base, target: defenderTarget(defender), comboWith: keeper.player.id, climbTo: climbFor(player, ctx) });
    } else {
      keeperOf.set(defender.id, blocker);
      assignments.push({ ...base, target: defenderTarget(defender) });
    }
    lastDefender = defender;
  }
  return assignments;
}

/** Kickout hits the outermost man on the line toward the play side; trap hits the first lineman beyond the play-side guard. */
function resolvePull(blocker: Blocker, ctx: Context, slots: Partial<Record<BlockSlot, Player>>): Player | undefined {
  const { dir, firstLevel } = ctx;
  if (blocker.kind === 'kickout') {
    return [...firstLevel].sort((a, b) => dir * (b.x - a.x))[0];
  }
  const anchor = slots.og_ps ?? slots.c;
  if (!anchor) return undefined;
  return [...firstLevel]
    .filter(d => dir * (d.x - anchor.x) > 0)
    .sort((a, b) => dir * (a.x - b.x))[0];
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
    const away: PlaySide = ctx.playSide === 'right' ? 'left' : 'right';
    result.target = { type: 'gap', gap: rule.gap, side: rule.relativeSide === 'playside' ? ctx.playSide : away };
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
 * Turns a template into concrete assignments for the players on the board.
 * Pure: the same players, template and play side always give the same plan.
 */
export function resolveBlockPlan(template: RunTemplate, players: Player[], playSide: PlaySide): BlockPlan {
  for (const rule of Object.values(template.rules)) {
    if (rule && !KNOWN_KINDS.includes(rule.kind)) throw new Error(`Unknown block rule kind "${String(rule.kind)}"`);
  }

  const slots = assignBlockSlots(players, playSide);
  const blockers: Blocker[] = SLOT_ORDER
    .filter(slot => template.rules[slot] && slots[slot])
    .map(slot => ({ slot, kind: template.rules[slot]!.kind, player: slots[slot]! }));

  const ctx: Context = {
    players,
    playSide,
    dir: playSide === 'right' ? 1 : -1,
    firstLevel: firstLevelDefenders(players),
    pulled: new Set()
  };
  const assignments: BlockAssignment[] = [];
  const base = (b: Blocker) => ({ id: `${b.player.id}-block`, playerId: b.player.id, slot: b.slot, kind: b.kind });

  // Pulls first: their targets are off limits to everyone else
  let pointOfAttackX: number | undefined;
  for (const blocker of blockers.filter(b => b.kind === 'kickout' || b.kind === 'trap')) {
    const target = resolvePull(blocker, ctx, slots);
    if (target) {
      ctx.pulled.add(target.id);
      pointOfAttackX ??= target.x;
    }
    assignments.push({ ...base(blocker), pulls: true, target: target ? defenderTarget(target) : { type: 'none' } });
  }

  const groupBlockers = blockers.filter(b => b.kind === 'zone' || b.kind === 'down' || b.kind === 'seal');
  assignments.push(...resolveGroup(groupBlockers, ctx));
  pointOfAttackX ??= groupBlockers.sort((a, b) => ctx.dir * (b.player.x - a.player.x))[0]?.player.x;

  for (const blocker of blockers.filter(b => b.kind === 'wrap' || b.kind === 'lead')) {
    const linebacker = pointOfAttackX === undefined ? undefined : nearestTo(pointOfAttackX, secondLevelDefenders(players));
    assignments.push({
      ...base(blocker),
      ...(PULL_KINDS.includes(blocker.kind) ? { pulls: true } : {}),
      target: linebacker ? defenderTarget(linebacker) : { type: 'none' }
    });
  }

  for (const override of template.overrides ?? []) {
    const index = assignments.findIndex(a => a.slot === override.slot);
    if (index >= 0) assignments[index] = applyOverride(assignments[index], override, ctx, slots);
  }

  assignments.sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  return { templateId: template.id, playSide, assignments };
}
