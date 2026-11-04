import { describe, expect, it } from 'vitest';
import { adaptRoutesToNewFormation, categorizeOffensivePlayers, translateActionPoints } from './routeAdaptation';
import { DEFAULT_FORMATIONS } from '../data/presets';
import type { PathAction, Player } from '../types/playbook';
import { WISHBONE_ID, clone, player, preset, template } from '../test/helpers';

const offenseFormations = DEFAULT_FORMATIONS.filter(f => f.side === 'offense');
const LINE_LABELS = new Set(['C', 'OC', 'LG', 'RG', 'LT', 'RT']);
const wishbone = preset(WISHBONE_ID);
const wishboneOffense = wishbone.players.filter(p => p.side === 'offense');

describe('categorizeOffensivePlayers', () => {
  it.each(offenseFormations.map(f => [f.name, f] as const))('%s: every player lands in exactly one group', (_name, formation) => {
    const d = categorizeOffensivePlayers(formation.players);
    const groups = [d.linemen, d.backfield, d.leftReceivers, d.rightReceivers, d.qb ? [d.qb] : []];
    const all = groups.flat().map(p => p.id);
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(formation.players.filter(p => p.side === 'offense').map(p => p.id).sort());
  });

  it.each(offenseFormations.map(f => [f.name, f] as const))('%s: only the five linemen are linemen, and there is a QB', (_name, formation) => {
    const d = categorizeOffensivePlayers(formation.players);
    expect(d.linemen).toHaveLength(5);
    expect(d.linemen.every(p => LINE_LABELS.has(p.label))).toBe(true);
    expect(d.qb).not.toBeNull();
  });

  it('counts an attached tight end as a receiver (it used to be classed as a lineman)', () => {
    const d = categorizeOffensivePlayers(wishboneOffense);
    const receivers = [...d.leftReceivers, ...d.rightReceivers].map(p => p.label);
    expect(receivers).toContain('Y');
    expect(d.linemen.map(p => p.label)).not.toContain('Y');
  });

  it('orders receivers from the outside in on each side', () => {
    const d = categorizeOffensivePlayers(template('formation-spread-trips-3x1').players);
    const lefts = d.leftReceivers.map(p => p.x);
    const rights = d.rightReceivers.map(p => p.x);
    expect(lefts).toEqual([...lefts].sort((a, b) => a - b));
    expect(rights).toEqual([...rights].sort((a, b) => b - a));
    expect(d.rightReceivers.length).toBeGreaterThanOrEqual(3);
  });

  it('puts running backs in the backfield', () => {
    expect(categorizeOffensivePlayers(wishboneOffense).backfield.map(p => p.label).sort()).toEqual(['H', 'Z']);
  });

  it('uses a stored position over the guess from label and alignment', () => {
    const roster: Player[] = [
      player({ id: 'c', label: 'C', side: 'offense', x: 480, y: 380 }),
      player({ id: 'y', label: 'Y', side: 'offense', x: 560, y: 380, position: 'WR' })
    ];
    const d = categorizeOffensivePlayers(roster);
    expect([...d.leftReceivers, ...d.rightReceivers].map(p => p.id)).toEqual(['y']);
  });

  it('ignores defenders and copes with an empty roster', () => {
    const d = categorizeOffensivePlayers([player({ id: 'd', label: 'CB', side: 'defense' })]);
    expect([d.linemen, d.backfield, d.leftReceivers, d.rightReceivers]).toEqual([[], [], [], []]);
    expect(d.qb).toBeNull();
    expect(() => categorizeOffensivePlayers([])).not.toThrow();
  });
});

describe('translateActionPoints', () => {
  it('moves and rounds every point, and keeps the sharp-cut flags', () => {
    const moved = translateActionPoints([{ x: 100, y: 100 }, { x: 150.4, y: 120, isSharp: true }], 10.6, -5);
    expect(moved).toEqual([{ x: 111, y: 95 }, { x: 161, y: 115, isSharp: true }]);
  });

  it('keeps points inside the field', () => {
    const moved = translateActionPoints([{ x: 30, y: 30 }, { x: 970, y: 670 }], -500, 500);
    expect(moved.every(p => p.x >= 20 && p.x <= 980 && p.y >= 20 && p.y <= 680)).toBe(true);
  });

  it('does not mutate its input', () => {
    const points = [{ x: 100, y: 100 }];
    translateActionPoints(points, 5, 5);
    expect(points).toEqual([{ x: 100, y: 100 }]);
  });
});

describe('adaptRoutesToNewFormation', () => {
  const spread = template('formation-spread-2x2').players;

  it('returns the same array when there is nothing to adapt', () => {
    expect(adaptRoutesToNewFormation([], wishbone.players, spread)).toEqual([]);
    expect(adaptRoutesToNewFormation(wishbone.actions, wishbone.players, [])).toBe(wishbone.actions);
  });

  it('player-relative: each route starts at its player\'s new spot and keeps its shape', () => {
    const adapted = adaptRoutesToNewFormation(wishbone.actions, wishbone.players, spread, 'player_relative');
    expect(adapted).toHaveLength(wishbone.actions.length);

    adapted.forEach((route, i) => {
      const original = wishbone.actions[i];
      const owner = spread.find(p => p.label === wishbone.players.find(w => w.id === original.playerId)?.label);
      if (!owner) return;
      expect(route.playerId, original.id).toBe(owner.id);
      expect(route.points[0], original.id).toMatchObject({ x: owner.x, y: owner.y });

      // the shape is the same unless a point was pushed back inside the field edge
      const dx = route.points[0].x - original.points[0].x;
      const dy = route.points[0].y - original.points[0].y;
      const unclamped = original.points.every(p => p.x + dx > 20 && p.x + dx < 980 && p.y + dy > 20 && p.y + dy < 680);
      if (unclamped) original.points.forEach((p, n) => expect(route.points[n], `${original.id}[${n}]`).toMatchObject({ x: p.x + dx, y: p.y + dy }));
    });
  });

  it('player-relative: sharp-cut flags survive', () => {
    const adapted = adaptRoutesToNewFormation(wishbone.actions, wishbone.players, spread, 'player_relative');
    adapted.forEach((route, i) => route.points.forEach((p, n) => expect(Boolean(p.isSharp)).toBe(Boolean(wishbone.actions[i].points[n].isSharp))));
  });

  it('#1/#2/#3 mode: the outermost left receiver\'s route goes to the new outermost left receiver', () => {
    const glanceRoute = wishbone.actions.find(a => a.playerId === 'X');
    expect(glanceRoute).toBeDefined();
    if (!glanceRoute) return;
    const newLeftOne = categorizeOffensivePlayers(spread).leftReceivers[0];
    const adapted = adaptRoutesToNewFormation([glanceRoute], wishbone.players, spread, 'concept_numbered');
    expect(adapted[0].playerId).toBe(newLeftOne.id);
    expect(adapted[0].points[0]).toMatchObject({ x: newLeftOne.x, y: newLeftOne.y });
  });

  it('a combo block moves by the same amount as the block it grew from', () => {
    const parent = clone(wishbone.actions.find(a => a.playerId === 'LT') as PathAction);
    const child: PathAction = {
      ...clone(parent), id: 'combo-child', parentActionId: parent.id, branchType: 'combo',
      points: parent.points.map(p => ({ ...p, x: p.x + 5, y: p.y - 40 }))
    };
    const adapted = adaptRoutesToNewFormation([parent, child], wishbone.players, spread, 'player_relative');
    const parentShift = { x: adapted[0].points[0].x - parent.points[0].x, y: adapted[0].points[0].y - parent.points[0].y };
    expect(adapted[1].points[0]).toMatchObject({ x: child.points[0].x + parentShift.x, y: child.points[0].y + parentShift.y });
  });

  it('a route whose player no longer exists falls back to the nearest player instead of disappearing', () => {
    const orphan: PathAction = { ...clone(wishbone.actions[0]), id: 'orphan', playerId: 'ghost' };
    const adapted = adaptRoutesToNewFormation([orphan], wishbone.players, spread, 'player_relative');
    expect(adapted).toHaveLength(1);
    expect(spread.some(p => p.id === adapted[0].playerId)).toBe(true);
  });

  it.each(offenseFormations.map(f => [f.name, f] as const))('%s: player_relative attaches every route to a real player', (_name, formation) => {
    const adapted = adaptRoutesToNewFormation(wishbone.actions, wishbone.players, formation.players, 'player_relative');
    const ids = new Set(formation.players.map(p => p.id));
    expect(adapted.every(a => ids.has(a.playerId))).toBe(true);
  });

  it.each(offenseFormations.map(f => [f.name, f] as const))('%s: concept_numbered maps one-to-one without stacking', (_name, formation) => {
    const adapted = adaptRoutesToNewFormation(wishbone.actions, wishbone.players, formation.players, 'concept_numbered');
    const mappedToNew = adapted.filter(a => formation.players.some(p => p.id === a.playerId)).map(a => a.playerId);
    expect(new Set(mappedToNew).size).toBe(mappedToNew.length);
  });

  it('does not mutate the routes it was given', () => {
    const frozen = JSON.stringify(wishbone.actions);
    adaptRoutesToNewFormation(wishbone.actions, wishbone.players, spread, 'concept_numbered');
    expect(JSON.stringify(wishbone.actions)).toBe(frozen);
  });
});
