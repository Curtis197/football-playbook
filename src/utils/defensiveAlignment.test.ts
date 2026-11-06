import { describe, expect, it } from 'vitest';
import {
  COVERAGES,
  DEFENSIVE_PACKAGES,
  applyCoverage,
  coverageFitsPackage,
  analyzeOffense,
  inferDefenderTechnique,
  loadDefensivePackage,
  realignAllDefenders,
  setCoverageOnPlayers,
  shiftDefensiveFront
} from './defensiveAlignment';
import { DEFAULT_FORMATIONS } from '../data/presets';
import type { Player } from '../types/playbook';
import { WISHBONE_ID, clone, player, preset, template } from '../test/helpers';

// The numbers behind each alignment are tuned by hand and change on purpose, so these tests check what must
// stay true however they are tuned: nobody is lost or duplicated, everyone stays on the field, the offense is
// never touched, and re-running an operation does not drift.

const wishbone = preset(WISHBONE_ID);
const offenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'offense');
const defense = wishbone.players.filter(p => p.side === 'defense');
const onField = (p: Player) => p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= 700 && Number.isFinite(p.x) && Number.isFinite(p.y);
const DIRECTIONS = ['left', 'right', 'over', 'under', 'pinch', 'fan'] as const;

describe('analyzeOffense', () => {
  it('finds the line of scrimmage from the centre', () => {
    const structure = analyzeOffense(wishbone.players);
    expect(structure.center.label).toBe('C');
    expect(structure.losY).toBe(structure.center.y);
  });

  it('reports a strength side and some gaps', () => {
    const structure = analyzeOffense(wishbone.players);
    expect(['left', 'right']).toContain(structure.strength);
    expect(structure.gaps.length).toBeGreaterThan(0);
  });

  it.each(offenseTemplates.map(f => [f.name, f] as const))('%s: analysis is complete and sane', (_name, formation) => {
    const structure = analyzeOffense(formation.players);
    expect(structure.center).toBeDefined();
    expect(Number.isFinite(structure.losY)).toBe(true);
    expect(['left', 'right']).toContain(structure.strength);
    expect(structure.gaps.every(g => Number.isFinite(g.x))).toBe(true);
  });

  it('copes with a roster that has no centre', () => {
    expect(() => analyzeOffense([player({ id: 'q', label: 'QB', side: 'offense', x: 480, y: 460 })])).not.toThrow();
    expect(() => analyzeOffense([])).not.toThrow();
  });
});

describe('inferDefenderTechnique', () => {
  const structure = analyzeOffense(wishbone.players);

  it('never overrides a technique the coach set', () => {
    expect(inferDefenderTechnique(player({ id: 'd', label: 'NT', side: 'defense', technique: 'My Custom Tech' }), structure)).toBe('My Custom Tech');
  });

  it('always returns something for any label', () => {
    for (const label of ['NT', 'DT', 'DE', 'W', 'M', 'S', 'CB', 'FS', 'SS', 'NK', 'OLB', 'ILB', '??']) {
      expect(inferDefenderTechnique(player({ id: label, label, side: 'defense' }), structure).trim().length).toBeGreaterThan(0);
    }
  });
});

describe('realignAllDefenders', () => {
  const structure = analyzeOffense(wishbone.players);

  it('keeps every defender, in order, and gives each a technique', () => {
    const result = realignAllDefenders(defense, structure);
    expect(result.map(p => p.id)).toEqual(defense.map(p => p.id));
    expect(result.every(p => p.technique && p.technique.trim().length > 0)).toBe(true);
  });

  it('keeps every defender on the field', () => {
    expect(realignAllDefenders(defense, structure).every(onField)).toBe(true);
  });

  it('leaves non-defenders exactly as they are', () => {
    const mixed = [...wishbone.players.filter(p => p.side === 'offense'), ...defense];
    const result = realignAllDefenders(mixed, structure);
    const offense = result.filter(p => p.side === 'offense');
    expect(offense).toEqual(wishbone.players.filter(p => p.side === 'offense'));
    offense.forEach((p, i) => expect(p).toBe(mixed[i]));
  });

  it('is stable: aligning an already aligned front changes nothing', () => {
    const once = realignAllDefenders(defense, structure);
    expect(realignAllDefenders(once, structure)).toEqual(once);
  });

  it('does not mutate its input', () => {
    const frozen = JSON.stringify(defense);
    realignAllDefenders(defense, structure);
    expect(JSON.stringify(defense)).toBe(frozen);
  });

  it.each(offenseTemplates.map(f => [f.name, f] as const))('%s: any front can be aligned against it without losing or stacking players', (_name, formation) => {
    const result = realignAllDefenders(defense, analyzeOffense(formation.players));
    expect(result).toHaveLength(defense.length);
    expect(result.every(onField)).toBe(true);
    expect(result.every(p => p.side === 'defense')).toBe(true);
  });
});

describe('shiftDefensiveFront', () => {
  const structure = analyzeOffense(wishbone.players);
  const aligned = realignAllDefenders(defense, structure);

  it.each(DIRECTIONS)('%s: keeps every player, in order, on the field', direction => {
    const shifted = shiftDefensiveFront(aligned, structure, direction);
    expect(shifted.map(p => p.id)).toEqual(aligned.map(p => p.id));
    expect(shifted.every(onField)).toBe(true);
  });

  it.each(DIRECTIONS)('%s: never changes who is on which side', direction => {
    const shifted = shiftDefensiveFront(aligned, structure, direction);
    expect(shifted.every((p, i) => p.side === aligned[i].side)).toBe(true);
  });

  // A shift that asks for a state a front is already in ("Over" on an Over front) correctly moves nobody, so
  // the useful check is that no shift is dead across the built-in fronts.
  it.each(DIRECTIONS)('%s: actually moves defenders on at least one built-in front', direction => {
    const fronts = DEFAULT_FORMATIONS.filter(f => f.side === 'defense');
    const movesSomebody = fronts.some(front => {
      const start = realignAllDefenders(front.players, structure);
      return shiftDefensiveFront(start, structure, direction).some((p, i) => p.x !== start[i].x || p.y !== start[i].y);
    });
    expect(movesSomebody).toBe(true);
  });

  it.each(['over', 'under'] as const)('%s sets a state, so doing it twice is the same as once', direction => {
    for (const front of DEFAULT_FORMATIONS.filter(f => f.side === 'defense')) {
      const start = realignAllDefenders(front.players, structure);
      const once = shiftDefensiveFront(start, structure, direction);
      expect(shiftDefensiveFront(once, structure, direction), front.name).toEqual(once);
    }
  });

  it('left and right move the front in opposite directions', () => {
    const left = shiftDefensiveFront(aligned, structure, 'left');
    const right = shiftDefensiveFront(aligned, structure, 'right');
    const dx = (shifted: Player[]) => shifted.reduce((sum, p, i) => sum + (p.x - aligned[i].x), 0);
    expect(Math.sign(dx(left))).toBe(-Math.sign(dx(right)));
    expect(dx(left)).not.toBe(0);
  });

  it('does not mutate its input', () => {
    const frozen = JSON.stringify(aligned);
    shiftDefensiveFront(aligned, structure, 'pinch');
    expect(JSON.stringify(aligned)).toBe(frozen);
  });

  it('shifting a single player works the way the Inspector uses it', () => {
    const [one] = shiftDefensiveFront([clone(aligned[0])], structure, 'right');
    expect(one.id).toBe(aligned[0].id);
    expect(onField(one)).toBe(true);
  });
});

describe('defensive packages', () => {
  it('there are packages, each with an id, a name and eleven-or-fewer defenders', () => {
    expect(DEFENSIVE_PACKAGES.length).toBeGreaterThan(0);
    const ids = DEFENSIVE_PACKAGES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    DEFENSIVE_PACKAGES.forEach(pkg => expect(pkg.name.trim().length, pkg.id).toBeGreaterThan(0));
  });

  const structure = analyzeOffense(wishbone.players);

  it.each(DEFENSIVE_PACKAGES.map(p => [p.name, p] as const))('%s loads against a real offense: one defender per slot, on the field, with its own assignment', (_name, pkg) => {
    const loaded = loadDefensivePackage(pkg, defense, structure);
    expect(loaded).toHaveLength(pkg.defenders.length);
    expect(loaded.length).toBeLessThanOrEqual(11);
    expect(loaded.every(p => p.side === 'defense')).toBe(true);
    expect(loaded.every(onField)).toBe(true);
    expect(new Set(loaded.map(p => p.id)).size).toBe(loaded.length);
    loaded.forEach((p, i) => {
      expect(p.label).toBe(pkg.defenders[i].label);
      expect(p.technique).toBe(pkg.defenders[i].technique);
      expect(p.assignmentTitle).toBe(pkg.defenders[i].assignmentTitle);
    });
  });

  it('reuses the current defenders\' ids and look so the board does not flicker', () => {
    const pkg = DEFENSIVE_PACKAGES[0];
    const loaded = loadDefensivePackage(pkg, defense, structure);
    loaded.slice(0, Math.min(loaded.length, defense.length)).forEach((p, i) => {
      expect(p.id).toBe(defense[i].id);
      expect(p.shape).toBe(defense[i].shape ?? 'none');
    });
  });
});

describe('coverage on a front', () => {
  const structure = analyzeOffense(wishbone.players);
  const fourThree = DEFENSIVE_PACKAGES.find(p => p.id === 'pkg-4-3-over')!;
  const secondary = (pkg: typeof fourThree) => pkg.defenders.filter(d => ['CB', 'FS', 'SS'].includes(d.label));
  const front = (pkg: typeof fourThree) => pkg.defenders.filter(d => !['CB', 'FS', 'SS'].includes(d.label));

  it('only the corners and safeties change', () => {
    for (const c of COVERAGES) {
      expect(front(applyCoverage(fourThree, c.id)), c.id).toEqual(front(fourThree));
    }
  });

  it('Cover 3 is three deep: off corners and one middle safety, with the other safety down', () => {
    const sec = secondary(applyCoverage(fourThree, 'cover-3')).map(d => d.technique);
    expect(sec.filter(t => t.startsWith('Off CB'))).toHaveLength(2);
    expect(sec.filter(t => t === 'Single-High FS')).toHaveLength(1);
    expect(sec).toContain('Robber Strong');
  });

  it('Cover 1 presses the corners with one deep safety', () => {
    const sec = secondary(applyCoverage(fourThree, 'cover-1')).map(d => d.technique);
    expect(sec.filter(t => t.startsWith('Press CB'))).toHaveLength(2);
    expect(sec.filter(t => t === 'Single-High FS')).toHaveLength(1);
  });

  it.each(['cover-2', 'two-man'] as const)('%s splits the field with two deep halves, left and right', id => {
    const sec = secondary(applyCoverage(fourThree, id)).map(d => d.technique);
    expect(sec).toContain('2-High Safety Left');
    expect(sec).toContain('2-High Safety Right');
    expect(sec.filter(t => t === 'Single-High FS' || t.startsWith('Robber'))).toHaveLength(0);
  });

  it('2-Man presses the corners, Cover 2 presses and squats', () => {
    expect(secondary(applyCoverage(fourThree, 'two-man')).filter(d => d.technique.startsWith('Press CB'))).toHaveLength(2);
    expect(secondary(applyCoverage(fourThree, 'cover-2')).filter(d => d.technique.startsWith('Press CB'))).toHaveLength(2);
  });

  it('keeps each corner on his own side', () => {
    const cbs = secondary(applyCoverage(fourThree, 'cover-3')).filter(d => d.label === 'CB').map(d => d.technique);
    expect(cbs).toEqual(['Off CB Left', 'Off CB Right']);
  });

  it('a one-safety front cannot play a two-high coverage', () => {
    const bear = DEFENSIVE_PACKAGES.find(p => p.id === 'pkg-bear-46')!;
    expect(coverageFitsPackage(COVERAGES.find(c => c.id === 'cover-2')!, bear)).toBe(false);
    expect(coverageFitsPackage(COVERAGES.find(c => c.id === 'cover-3')!, bear)).toBe(true);
  });

  it.each(DEFENSIVE_PACKAGES.flatMap(p => COVERAGES.filter(c => coverageFitsPackage(c, p)).map(c => [p.name, c.id, p, c] as const)))(
    '%s in %s loads on the field',
    (_n, _id, pkg, c) => {
      const loaded = loadDefensivePackage(applyCoverage(pkg, c.id), defense, structure);
      expect(loaded).toHaveLength(pkg.defenders.length);
      expect(loaded.every(onField)).toBe(true);
    }
  );
});

describe('coverage on the defense already on the field', () => {
  const structure = analyzeOffense(wishbone.players);
  const loaded = loadDefensivePackage(DEFENSIVE_PACKAGES.find(p => p.id === 'pkg-4-3-over')!, defense, structure);
  const field = [...wishbone.players.filter(p => p.side === 'offense'), ...loaded];

  it.each(COVERAGES.map(c => [c.id] as const))('%s keeps everyone, on the field, and leaves the front alone', id => {
    const out = setCoverageOnPlayers(field, id, structure);
    expect(out.map(p => p.id)).toEqual(loaded.map(p => p.id));
    expect(out.every(onField)).toBe(true);
    out.filter(p => !['CB', 'FS', 'SS'].includes(p.label)).forEach(p => {
      const before = loaded.find(l => l.id === p.id)!;
      expect([p.x, p.y, p.technique]).toEqual([before.x, before.y, before.technique]);
    });
  });

  it('Cover 2 puts the left-most safety on the left half', () => {
    const out = setCoverageOnPlayers(field, 'cover-2', structure).filter(p => p.label === 'FS' || p.label === 'SS');
    const left = out.find(p => p.technique === '2-High Safety Left')!;
    const right = out.find(p => p.technique === '2-High Safety Right')!;
    expect(left.x).toBeLessThan(right.x);
  });

  it('does nothing to a defense without two safeties when asked for two-high', () => {
    const oneSafety = field.filter(p => p.id !== loaded.find(l => l.label === 'SS')!.id);
    const out = setCoverageOnPlayers(oneSafety, 'cover-2', structure);
    expect(out.map(p => p.technique)).toEqual(oneSafety.filter(p => p.side === 'defense').map(p => p.technique));
  });
});

describe('a template front applied against the spread offense', () => {
  it('lines up on the field for every built-in front', () => {
    const spreadOffense = template('formation-spread-2x2').players;
    for (const front of DEFAULT_FORMATIONS.filter(f => f.side === 'defense')) {
      const aligned = realignAllDefenders(front.players, analyzeOffense(spreadOffense));
      expect(aligned.every(onField), front.name).toBe(true);
    }
  });
});
