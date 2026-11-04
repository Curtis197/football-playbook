import type { PlaySide, Player, RunCall } from '../types/playbook';
import { getOffenseReference, resolveOffensePosition } from './playMigrations';

/** Distance between neighbouring line bodies; also the spacing of the virtual bodies past the end of the line. */
const SPACING = 60;
/** A tight end farther than this from the tackle is split out and is not part of the line. */
const ATTACHED_MAX = 90;
/** How many holes lie on each side of the center (1/2 A, 3/4 B, 5/6 C, 7/8 D). */
const HOLES_PER_SIDE = 4;

export type GapLetter = 'A' | 'B' | 'C' | 'D';
export interface GapId {
  hole: number;
  gap: GapLetter;
  side: PlaySide | 'center';
}

/** Odd holes run right, even holes left. Hole 0 has no side of its own: the coach chooses (right if unspecified). */
export function callPlaySide(call: RunCall): PlaySide {
  if (call.hole === 0) return call.side ?? 'right';
  return call.hole % 2 === 1 ? 'right' : 'left';
}

export function isValidCall(call: RunCall): boolean {
  const { hole, runner, side } = call;
  if (!Number.isInteger(hole) || hole < 0 || hole > 8) return false;
  if (!Number.isInteger(runner) || runner < 1 || runner > 4) return false;
  if (hole === 0 && side !== 'left' && side !== 'right') return false;
  return true;
}

/**
 * x of the centre, then the line bodies outward on one side: linemen, an attached tight end, then virtual
 * bodies 60 apart so every side has four holes whatever the formation.
 */
function bodiesOnSide(players: Player[], side: PlaySide): number[] {
  const offense = players.filter(p => p.side === 'offense');
  const reference = getOffenseReference(offense);
  const centerX = reference.centerX;
  const sign = side === 'right' ? 1 : -1;
  const outward = (p: Player) => sign * (p.x - centerX);

  const linemen = offense.filter(p => resolveOffensePosition(p, reference) === 'OL' && outward(p) > 0);
  const bodies = linemen.map(outward).sort((a, b) => a - b);

  const edge = bodies.length > 0 ? bodies[bodies.length - 1] : 0;
  const tightEnd = offense
    .filter(p => resolveOffensePosition(p, reference) === 'TE' && outward(p) > edge && outward(p) - edge <= ATTACHED_MAX)
    .sort((a, b) => outward(a) - outward(b))[0];
  if (tightEnd) bodies.push(outward(tightEnd));

  while (bodies.length < HOLES_PER_SIDE) bodies.push((bodies.length > 0 ? bodies[bodies.length - 1] : 0) + SPACING);
  return [0, ...bodies].map(offset => centerX + sign * offset);
}

/** x of a hole: the midpoint of the two line bodies it sits between. Hole 0 is the centre's own x. */
export function holeX(players: Player[], hole: number): number {
  const reference = getOffenseReference(players.filter(p => p.side === 'offense'));
  if (hole === 0) return reference.centerX;
  const side: PlaySide = hole % 2 === 1 ? 'right' : 'left';
  const bodies = bodiesOnSide(players, side);
  const k = Math.ceil(hole / 2);
  return (bodies[k - 1] + bodies[k]) / 2;
}

const FULLBACK_LABELS = new Set(['FB', 'F']);
const TAILBACK_LABELS = new Set(['TB', 'HB', 'RB', 'B']);

function backsOf(players: Player[]): { qb: Player | undefined; backs: Player[] } {
  const offense = players.filter(p => p.side === 'offense');
  const reference = getOffenseReference(offense);
  const qb = offense.find(p => resolveOffensePosition(p, reference) === 'QB');
  const backs = offense.filter(p => resolveOffensePosition(p, reference) === 'RB');
  const distanceToQb = (p: Player) => (qb ? Math.hypot(p.x - qb.x, p.y - qb.y) : -p.y);
  return { qb, backs: backs.sort((a, b) => distanceToQb(a) - distanceToQb(b)) };
}

const labelOf = (p: Player) => p.label.trim().toUpperCase();

/** 1 QB, 2 fullback, 3 tailback, 4 the remaining back. Undefined when the formation has no such player. */
export function runnerPlayer(players: Player[], runner: number): Player | undefined {
  const { qb, backs } = backsOf(players);
  if (runner === 1) return qb;
  const fullback = backs.find(p => FULLBACK_LABELS.has(labelOf(p))) ?? backs[0];
  const tailback = backs.find(p => TAILBACK_LABELS.has(labelOf(p))) ?? backs[backs.length - 1];
  if (runner === 2) return fullback;
  if (runner === 3) return tailback;
  if (runner === 4) {
    const labelledFb = backs.find(p => FULLBACK_LABELS.has(labelOf(p)));
    const labelledTb = backs.find(p => TAILBACK_LABELS.has(labelOf(p)));
    return backs.find(p => p !== labelledFb && p !== labelledTb);
  }
  return undefined;
}

/** The back who blocks for the runner: any back that is not the runner, nearest the QB first. */
export function leadBack(players: Player[], runner: number): Player | undefined {
  const { backs } = backsOf(players);
  const carrier = runnerPlayer(players, runner);
  return backs.find(p => p !== carrier);
}

const GAP_LETTERS: GapLetter[] = ['A', 'B', 'C', 'D'];

/** A defender's gap: the nearest hole to his x (ties go to the lower hole number). */
export function gapIdOf(defender: Player, players: Player[]): GapId {
  let best = 0;
  let bestDistance = Infinity;
  for (let hole = 0; hole <= 8; hole++) {
    const distance = Math.abs(defender.x - holeX(players, hole));
    if (distance < bestDistance) {
      best = hole;
      bestDistance = distance;
    }
  }
  if (best === 0) return { hole: 0, gap: 'A', side: 'center' };
  return { hole: best, gap: GAP_LETTERS[Math.ceil(best / 2) - 1], side: best % 2 === 1 ? 'right' : 'left' };
}

export function gapLabel(id: GapId): string {
  return `${id.gap} gap, ${id.side}`;
}
