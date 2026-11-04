import type { BlockAssignment, BlockKind, BlockPlan, BlockSlot, BlockTarget, PlaySide, Player, RunTemplate } from '../types/playbook';
import { assignBlockSlots, firstLevelDefenders, secondLevelDefenders } from './blockSlots';

/** How far behind a blocker a defender may be and still count as "on him" (about half a gap). */
const TOL = 30;

const SLOT_ORDER: BlockSlot[] = ['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs', 'fb'];
const KNOWN_KINDS: readonly BlockKind[] = ['zone', 'down', 'kickout', 'wrap', 'seal', 'lead'];

const defenderTarget = (player: Player): BlockTarget => ({ type: 'defender', playerId: player.id });

function nearestSecondLevel(blocker: Player, players: Player[]): BlockTarget {
  const nearest = secondLevelDefenders(players)
    .sort((a, b) => Math.abs(a.x - blocker.x) - Math.abs(b.x - blocker.x))[0];
  return nearest ? defenderTarget(nearest) : { type: 'none' };
}

interface Blocker {
  slot: BlockSlot;
  player: Player;
}

/**
 * Zone rule, applied outermost-first toward the play side:
 * 1. take the nearest first-level defender at or toward the play side;
 * 2. if there is none, help the nearest blocker toward the play side who has one, then climb;
 * 3. if that defender is already taken, the blocker nearest the play side keeps him and the rest combo, then climb.
 */
function resolveZone(blockers: Blocker[], players: Player[], playSide: PlaySide): BlockAssignment[] {
  const dir = playSide === 'right' ? 1 : -1;
  const ordered = [...blockers].sort((a, b) => dir * (b.player.x - a.player.x));
  const defenders = firstLevelDefenders(players);
  const keeperOf = new Map<string, Blocker>();
  const assignments: BlockAssignment[] = [];
  let lastWithDefender: { blocker: Blocker; defender: Player } | undefined;

  for (const blocker of ordered) {
    const { player, slot } = blocker;
    const candidate = defenders
      .filter(d => dir * (d.x - player.x) >= -TOL)
      .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];

    let defender = candidate;
    let helps: Blocker | undefined;
    if (!defender && lastWithDefender) {
      defender = lastWithDefender.defender;
    }

    const keeper = defender ? keeperOf.get(defender.id) : undefined;
    if (defender && keeper) helps = keeper;
    else if (defender) keeperOf.set(defender.id, blocker);

    const base = { id: `${player.id}-block`, playerId: player.id, slot, kind: 'zone' as const };
    if (!defender) {
      const level = secondLevelDefenders(players).length > 0 && defenders.length > 0;
      assignments.push({ ...base, target: level ? { type: 'level', level: 'second' } : { type: 'none' } });
      continue;
    }
    if (helps) {
      assignments.push({
        ...base,
        target: defenderTarget(defender),
        comboWith: helps.player.id,
        climbTo: nearestSecondLevel(player, players)
      });
    } else {
      assignments.push({ ...base, target: defenderTarget(defender) });
    }
    lastWithDefender = { blocker: keeper ?? blocker, defender };
  }
  return assignments;
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
  const present = SLOT_ORDER.filter(slot => template.rules[slot] && slots[slot]);

  const zoneBlockers: Blocker[] = [];
  for (const slot of present) {
    const rule = template.rules[slot]!;
    if (rule.kind === 'zone') zoneBlockers.push({ slot, player: slots[slot]! });
    else throw new Error(`Block rule kind "${rule.kind}" is not supported yet`);
  }

  const assignments = resolveZone(zoneBlockers, players, playSide);
  assignments.sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
  return { templateId: template.id, playSide, assignments };
}
