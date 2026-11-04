import type { BlockSlot, PlaySide, Player } from '../types/playbook';
import { analyzeOffense } from './defensiveAlignment';
import { getOffenseReference, resolveOffensePosition } from './playMigrations';

/** A defender this close to the line of scrimmage (in field units) is on the first level. */
const FIRST_LEVEL_DEPTH = 45;

type Slots = Partial<Record<BlockSlot, Player>>;

/**
 * Names each blocker by where he stands relative to the play side: the guard on the play side is `og_ps`,
 * the tackle on the other side is `ot_bs`, and so on. Players who are not on the field leave their slot out.
 * `fb` is the running back nearest the quarterback.
 */
export function assignBlockSlots(players: Player[], playSide: PlaySide): Slots {
  const offense = players.filter(p => p.side === 'offense');
  const reference = getOffenseReference(offense);
  const positionOf = (p: Player) => resolveOffensePosition(p, reference);

  const linemen = offense.filter(p => positionOf(p) === 'OL');
  const center = linemen.length > 0
    ? linemen.reduce((best, p) => (Math.abs(p.x - reference.centerX) < Math.abs(best.x - reference.centerX) ? p : best))
    : undefined;
  const rest = linemen.filter(p => p !== center);
  // Nearest the centre first, so index 0 is the guard and index 1 the tackle
  const rightOl = rest.filter(p => p.x >= (center?.x ?? reference.centerX)).sort((a, b) => a.x - b.x);
  const leftOl = rest.filter(p => p.x < (center?.x ?? reference.centerX)).sort((a, b) => b.x - a.x);

  const tightEnds = offense.filter(p => positionOf(p) === 'TE');
  const edge = (side: PlaySide): Player | undefined => {
    const outsideLine = side === 'right' ? rightOl[1] ?? rightOl[0] : leftOl[1] ?? leftOl[0];
    const onSide = tightEnds.filter(p => (side === 'right' ? p.x > reference.centerX : p.x < reference.centerX));
    // The TE who is attached to the line: the one closest to the end of it
    return onSide.sort((a, b) => Math.abs(a.x - (outsideLine?.x ?? reference.centerX)) - Math.abs(b.x - (outsideLine?.x ?? reference.centerX)))[0];
  };

  const playSideOl = playSide === 'right' ? rightOl : leftOl;
  const backSideOl = playSide === 'right' ? leftOl : rightOl;
  const qb = offense.find(p => positionOf(p) === 'QB');
  const backs = offense.filter(p => positionOf(p) === 'RB');
  const fb = qb
    ? backs.sort((a, b) => Math.hypot(a.x - qb.x, a.y - qb.y) - Math.hypot(b.x - qb.x, b.y - qb.y))[0]
    : backs[0];
  const otherSide: PlaySide = playSide === 'right' ? 'left' : 'right';

  const slots: Slots = {
    te_ps: edge(playSide),
    ot_ps: playSideOl[1],
    og_ps: playSideOl[0],
    c: center,
    og_bs: backSideOl[0],
    ot_bs: backSideOl[1],
    te_bs: edge(otherSide),
    fb
  };
  return Object.fromEntries(Object.entries(slots).filter(([, p]) => p !== undefined)) as Slots;
}

/** Eligible receivers (TE and WR) on each side of centre differ in number, so "strong" means something. */
export function hasClearStrength(players: Player[]): boolean {
  const offense = players.filter(p => p.side === 'offense');
  const reference = getOffenseReference(offense);
  const eligible = offense.filter(p => {
    const position = resolveOffensePosition(p, reference);
    return position === 'TE' || position === 'WR';
  });
  const left = eligible.filter(p => p.x < reference.centerX).length;
  const right = eligible.filter(p => p.x > reference.centerX).length;
  return left !== right;
}

export function resolveStrongSide(players: Player[]): PlaySide {
  return analyzeOffense(players).strength;
}

export function firstLevelDefenders(players: Player[]): Player[] {
  const losY = getOffenseReference(players.filter(p => p.side === 'offense')).losY;
  return players.filter(p =>
    p.side === 'defense' && (p.position === 'DL' || (p.position === 'LB' && losY - p.y <= FIRST_LEVEL_DEPTH))
  );
}

export function secondLevelDefenders(players: Player[]): Player[] {
  const first = new Set(firstLevelDefenders(players).map(p => p.id));
  return players.filter(p => p.side === 'defense' && p.position === 'LB' && !first.has(p.id));
}
