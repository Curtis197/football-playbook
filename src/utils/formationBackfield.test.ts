import { describe, expect, it } from 'vitest';
import { detectCurrentQBPosition, morphBackfieldAlignment, type SnapAlignment } from './formationBackfield';
import { DEFAULT_FORMATIONS } from '../data/presets';
import type { Player } from '../types/playbook';
import { player, preset, template } from '../test/helpers';

const ALIGNMENTS: SnapAlignment[] = ['down_center', 'pistol', 'shotgun'];
const offenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'offense');
const qbOf = (players: Player[]) => players.find(p => p.label === 'QB') as Player;

describe('detectCurrentQBPosition', () => {
  const at = (y: number) => detectCurrentQBPosition([player({ id: 'qb', label: 'QB', side: 'offense', x: 480, y })]);

  it('reads the alignment from how deep the QB stands', () => {
    expect(at(415)).toBe('down_center');
    expect(at(440)).toBe('pistol');
    expect(at(465)).toBe('shotgun');
  });

  it('draws the lines at 425 and 450 (inclusive on the shallower side)', () => {
    expect([at(425), at(426), at(450), at(451)]).toEqual(['down_center', 'pistol', 'pistol', 'shotgun']);
  });

  it('defaults to shotgun when there is no QB', () => {
    expect(detectCurrentQBPosition([])).toBe('shotgun');
    expect(detectCurrentQBPosition([player({ id: 'x', label: 'X', side: 'offense' })])).toBe('shotgun');
  });

  it('agrees with the alignment stored on every built-in offense template', () => {
    for (const formation of offenseTemplates) {
      expect(detectCurrentQBPosition(formation.players), formation.name).toBe(formation.qbPosition);
    }
  });
});

describe('morphBackfieldAlignment', () => {
  const spreadPlayers = template('formation-spread-2x2').players;      // single back, shotgun
  const wishbone = preset('play-wishbone-zone-glance');
  const centerOf = (players: Player[]) => players.find(p => p.label === 'C') as Player;

  it('does nothing, and returns the same objects, when the alignment is already right', () => {
    const result = morphBackfieldAlignment(spreadPlayers, [], 'shotgun');
    expect(result.players).toBe(spreadPlayers);
    expect(result.previousAlignment).toBe(result.newAlignment);
  });

  // the spread template is already in shotgun, so to reach shotgun it first goes somewhere else
  const sourceFor = (alignment: SnapAlignment) =>
    alignment === detectCurrentQBPosition(spreadPlayers) ? morphBackfieldAlignment(spreadPlayers, [], 'down_center').players : spreadPlayers;

  it.each(ALIGNMENTS)('puts the QB in the %s spot, behind the centre', alignment => {
    const result = morphBackfieldAlignment(sourceFor(alignment), [], alignment);
    const centre = centerOf(result.players);
    const expectedDepth = { down_center: 35, pistol: 60, shotgun: 85 }[alignment];
    expect(qbOf(result.players).x).toBe(centre.x);
    expect(qbOf(result.players).y).toBe(centre.y + expectedDepth);
    expect(result.newAlignment).toBe(alignment);
    expect(detectCurrentQBPosition(result.players)).toBe(alignment);
  });

  it.each(ALIGNMENTS)('to %s leaves the line and every receiver exactly where they were', alignment => {
    const result = morphBackfieldAlignment(spreadPlayers, [], alignment);
    const untouched = (p: Player) => !['QB', 'RB'].includes(p.label);
    expect(result.players.filter(untouched)).toEqual(spreadPlayers.filter(untouched));
  });

  it('keeps the same players, in the same order', () => {
    const result = morphBackfieldAlignment(spreadPlayers, [], 'down_center');
    expect(result.players.map(p => p.id)).toEqual(spreadPlayers.map(p => p.id));
  });

  it('a single back sits behind the QB under center and in the pistol, and beside the QB in the gun', () => {
    const under = morphBackfieldAlignment(spreadPlayers, [], 'down_center').players;
    const pistol = morphBackfieldAlignment(spreadPlayers, [], 'pistol').players;
    const gun = morphBackfieldAlignment(spreadPlayers, [], 'shotgun').players;
    const back = (players: Player[]) => players.find(p => p.label === 'RB') as Player;
    expect(back(under).y).toBeGreaterThan(qbOf(under).y);
    expect(back(under).x).toBe(qbOf(under).x);
    expect(back(pistol).y).toBeGreaterThan(qbOf(pistol).y);
    expect(back(pistol).x).toBe(qbOf(pistol).x);
    expect(back(gun).y).toBe(qbOf(gun).y);
    expect(Math.abs(back(gun).x - qbOf(gun).x)).toBeGreaterThan(40);
  });

  it('carries each moved player\'s routes along by exactly the distance the player moved', () => {
    const qb = qbOf(spreadPlayers);
    const route = { id: 'qb-route', playerId: qb.id, type: 'motion' as const, endMarker: 'arrow' as const, points: [{ x: qb.x, y: qb.y }, { x: qb.x + 60, y: qb.y + 40 }] };
    const result = morphBackfieldAlignment(spreadPlayers, [route], 'down_center');
    const moved = qbOf(result.players);
    expect(result.actions[0].points[0]).toMatchObject({ x: qb.x + (moved.x - qb.x), y: qb.y + (moved.y - qb.y) });
    expect(result.actions[0].points[1].x - result.actions[0].points[0].x).toBe(60);
    expect(result.actions[0].points[1].y - result.actions[0].points[0].y).toBe(40);
  });

  it('leaves routes of players who did not move alone', () => {
    const other = spreadPlayers.find(p => p.label === 'X') as Player;
    const route = { id: 'x-route', playerId: other.id, type: 'pass_route' as const, endMarker: 'arrow' as const, points: [{ x: other.x, y: other.y }, { x: other.x, y: other.y - 100 }] };
    expect(morphBackfieldAlignment(spreadPlayers, [route], 'pistol').actions[0]).toEqual(route);
  });

  it('keeps the formation valid for a two-back set (Pro-I) in every alignment', () => {
    const proI = template('formation-pro-i-21').players;
    for (const alignment of ALIGNMENTS) {
      const result = morphBackfieldAlignment(proI, [], alignment);
      expect(result.players, alignment).toHaveLength(proI.length);
      expect(detectCurrentQBPosition(result.players), alignment).toBe(alignment);
      expect(new Set(result.players.map(p => `${p.x},${p.y}`)).size, `${alignment}: nobody stacked on the same spot`).toBe(result.players.length);
    }
  });

  it('treats the wishbone preset as a two-back set: the back closer to the line is the fullback, the other stacks behind the centre', () => {
    const wishboneOffense = wishbone.players.filter(p => p.side === 'offense');
    const result = morphBackfieldAlignment(wishboneOffense, [], 'down_center').players;
    const centre = centerOf(result);
    const backs = result.filter(p => ['H', 'Z'].includes(p.label));
    const deeper = backs.reduce((a, b) => (a.y > b.y ? a : b));
    const shallower = backs.reduce((a, b) => (a.y > b.y ? b : a));
    expect(deeper.x).toBe(centre.x);
    expect(deeper.y).toBeGreaterThan(shallower.y);
    expect(shallower.y).toBeGreaterThan(qbOf(result).y);
  });

  it('moves three or more backs as a unit, so their spacing is kept', () => {
    const backs: Player[] = [
      player({ id: 'hb', label: 'HB', side: 'offense', x: 400, y: 500 }),
      player({ id: 'fb', label: 'FB', side: 'offense', x: 480, y: 520 }),
      player({ id: 'tb', label: 'TB', side: 'offense', x: 560, y: 500 })
    ];
    const roster = [...spreadPlayers.filter(p => p.label !== 'RB'), ...backs];
    const result = morphBackfieldAlignment(roster, [], 'down_center').players;
    const before = backs.map(b => b);
    const after = ['hb', 'fb', 'tb'].map(id => result.find(p => p.id === id) as Player);
    const shift = after[0].y - before[0].y;
    expect(shift).not.toBe(0);
    after.forEach((b, i) => {
      expect(b.x).toBe(before[i].x);
      expect(b.y - before[i].y).toBe(shift);
    });
  });

  it('does not mutate its input', () => {
    const frozen = JSON.stringify(spreadPlayers);
    morphBackfieldAlignment(spreadPlayers, [], 'down_center');
    expect(JSON.stringify(spreadPlayers)).toBe(frozen);
  });

  it('returns the roster unchanged when there is no QB to morph around', () => {
    const noQb = spreadPlayers.filter(p => p.label !== 'QB');
    expect(morphBackfieldAlignment(noQb, [], 'down_center').players).toBe(noQb);
  });
});
