import { describe, expect, it } from 'vitest';
import {
  getOffenseReference,
  inferDefensePosition,
  inferOffensePosition,
  newerCopy,
  resolveFormation,
  resolveOffensePosition,
  upgradeFormation,
  upgradePlay,
  upgradePlayers
} from './playMigrations';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from '../data/presets';
import type { Play, Player } from '../types/playbook';
import { WISHBONE_ID, clone, player, preset, template } from '../test/helpers';

const REF = { centerX: 480, losY: 380 };

describe('inferOffensePosition', () => {
  it.each([
    ['QB', 480, 460, 'QB'],
    ['C', 480, 380, 'OL'],
    ['LG', 420, 380, 'OL'],
    ['RT', 600, 380, 'OL'],
    ['RB', 480, 530, 'RB'],
    ['FB', 480, 465, 'RB'],
    ['TE', 660, 380, 'TE']
  ])('classifies %s by label', (label, x, y, expected) => {
    expect(inferOffensePosition(player({ id: label, label, side: 'offense', x, y }), REF)).toBe(expected);
  });

  it('decides ambiguous skill labels (X, Y, Z, H, F) from where the player stands', () => {
    const at = (label: string, x: number, y: number) => inferOffensePosition(player({ id: label, label, side: 'offense', x, y }), REF);
    expect(at('Y', 660, 380)).toBe('TE');   // attached to the line, within 180 of the centre
    expect(at('X', 120, 380)).toBe('WR');   // split wide
    expect(at('H', 410, 530)).toBe('RB');   // deep in the backfield near the centre
    expect(at('F', 740, 420)).toBe('WR');   // wing, far from the centre
  });

  it('never classes a label that names a back as a lineman, however close to the line it stands', () => {
    expect(inferOffensePosition(player({ id: 'rb', label: 'RB', side: 'offense', x: 500, y: 385 }), REF)).toBe('RB');
  });
});

describe('inferDefensePosition', () => {
  it.each([
    ['NT', 'DL'], ['DT', 'DL'], ['DE', 'DL'],
    ['W', 'LB'], ['M', 'LB'], ['ILB', 'LB'],
    ['CB', 'DB'], ['FS', 'DB'], ['SS', 'DB'], ['NK', 'DB']
  ])('%s is %s', (label, expected) => {
    expect(inferDefensePosition(player({ id: label, label, side: 'defense' }))).toBe(expected);
  });

  it('leaves "S" blank: it is Sam (linebacker) in some schemes and a safety in others', () => {
    expect(inferDefensePosition(player({ id: 's', label: 'S', side: 'defense' }))).toBeUndefined();
  });
});

describe('positions on a whole roster', () => {
  it('getOffenseReference uses the centre when there is one, otherwise a sensible fallback', () => {
    expect(getOffenseReference([player({ id: 'c', label: 'C', side: 'offense', x: 500, y: 390 })])).toEqual({ centerX: 500, losY: 390 });
    expect(getOffenseReference([])).toEqual({ centerX: 480, losY: 380 });
  });

  it('upgradePlayers never overwrites an explicit position and never mutates its input', () => {
    const input: Player[] = [player({ id: 'y', label: 'Y', side: 'offense', x: 660, y: 380, position: 'WR' })];
    const frozen = JSON.stringify(input);
    expect(upgradePlayers(input)[0].position).toBe('WR');
    expect(JSON.stringify(input)).toBe(frozen);
  });

  it('resolveOffensePosition prefers the stored value', () => {
    expect(resolveOffensePosition(player({ id: 'y', label: 'Y', side: 'offense', x: 660, y: 380, position: 'WR' }), REF)).toBe('WR');
    expect(resolveOffensePosition(player({ id: 'y', label: 'Y', side: 'offense', x: 660, y: 380 }), REF)).toBe('TE');
  });

  it('the wishbone preset gets sensible roles', () => {
    const roles = Object.fromEntries(preset(WISHBONE_ID).players.filter(p => p.side === 'offense').map(p => [p.label, p.position]));
    expect(roles).toMatchObject({ QB: 'QB', C: 'OL', H: 'RB', Z: 'RB', Y: 'TE', X: 'WR', F: 'WR' });
  });
});

describe('resolveFormation', () => {
  const spread = template('formation-spread-2x2');

  it('finds a template by id, or by exact name ignoring case', () => {
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', spread.id, undefined)).toBe(spread);
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', undefined, spread.name.toUpperCase())).toBe(spread);
  });

  it('does not guess from a partial name', () => {
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', undefined, 'Spread 2x2 Open')).toBeUndefined();
  });

  it('prefers the id over a conflicting name', () => {
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', 'formation-pro-i-21', spread.name)?.id).toBe('formation-pro-i-21');
  });

  it('never returns a template of the other side', () => {
    expect(resolveFormation(DEFAULT_FORMATIONS, 'defense', spread.id, undefined)).toBeUndefined();
    expect(resolveFormation(DEFAULT_FORMATIONS, 'defense', undefined, spread.name)).toBeUndefined();
  });

  it('returns nothing when neither id nor name is given', () => {
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', undefined, undefined)).toBeUndefined();
    expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', '', '')).toBeUndefined();
  });
});

describe('upgradePlay (schema 1.0.0 -> 1.1.0)', () => {
  const legacy = (): Play & { targetFront?: string } => ({
    id: 'old', name: 'Old', formationOffense: 'Spread 2x2 Open', frontDefense: '', targetFront: '4-2-5 Nickel',
    category: 'run', tags: [], situation: [], actions: [],
    notes: { qbRead: '', lineBlocking: '', philosophyReason: '' },
    players: [
      player({ id: 'C', label: 'C', side: 'offense', x: 480, y: 380 }),
      player({ id: 'Y', label: 'Y', side: 'offense', x: 660, y: 380 }),
      player({ id: 'S', label: 'S', side: 'defense', x: 600, y: 300 })
    ]
  });

  it('links a partial formation name to its template (the one place fuzzy matching is still used)', () => {
    expect(upgradePlay(legacy(), DEFAULT_FORMATIONS).formationOffenseId).toBe('formation-spread-2x2');
  });

  it('folds targetFront into an empty frontDefense, links it, and removes the old field', () => {
    const upgraded = upgradePlay(legacy(), DEFAULT_FORMATIONS);
    expect(upgraded.frontDefense).toBe('4-2-5 Nickel');
    expect(upgraded.frontDefenseId).toBeTruthy();
    expect('targetFront' in upgraded).toBe(false);
  });

  it('keeps frontDefense when both exist, and leaves a custom name unlinked', () => {
    const both: Play & { targetFront?: string } = { ...legacy(), frontDefense: 'My Own Front', targetFront: 'Other' };
    const upgraded = upgradePlay(both, DEFAULT_FORMATIONS);
    expect(upgraded.frontDefense).toBe('My Own Front');
    expect(upgraded.frontDefenseId).toBeUndefined();
  });

  it('infers positions', () => {
    const roles = upgradePlay(legacy(), DEFAULT_FORMATIONS).players.map(p => p.position);
    expect(roles).toEqual(['OL', 'TE', undefined]);
  });

  it('is idempotent', () => {
    const once = upgradePlay(legacy(), DEFAULT_FORMATIONS);
    expect(upgradePlay(clone(once), DEFAULT_FORMATIONS)).toEqual(once);
  });

  it('never overwrites an existing link', () => {
    const linked = upgradePlay({ ...legacy(), formationOffenseId: 'formation-pro-i-21' }, DEFAULT_FORMATIONS);
    expect(linked.formationOffenseId).toBe('formation-pro-i-21');
  });

  it('does not mutate its input', () => {
    const input = legacy();
    const frozen = JSON.stringify(input);
    upgradePlay(input, DEFAULT_FORMATIONS);
    expect(JSON.stringify(input)).toBe(frozen);
  });
});

describe('upgradeFormation', () => {
  it('adds positions to a template without changing anything else', () => {
    const raw = { id: 'f', name: 'F', side: 'offense' as const, players: [player({ id: 'q', label: 'QB', side: 'offense', x: 480, y: 460 })] };
    const upgraded = upgradeFormation(raw);
    expect(upgraded.players[0].position).toBe('QB');
    expect(upgraded.name).toBe('F');
  });
});

describe('newerCopy', () => {
  const older = { updatedAt: '2026-11-04T10:00:00Z' } as Play;
  const newer = { updatedAt: '2026-11-04T11:00:00Z' } as Play;

  it('says which copy is newer', () => {
    expect(newerCopy(newer, older)).toBe('local');
    expect(newerCopy(older, newer)).toBe('remote');
  });

  it('says unknown when a time is missing, unreadable, or equal', () => {
    expect(newerCopy({} as Play, newer)).toBe('unknown');
    expect(newerCopy(older, { updatedAt: 'yesterday-ish' } as Play)).toBe('unknown');
    expect(newerCopy(older, older)).toBe('unknown');
  });
});

describe('built-in data is on the current schema', () => {
  it('has no legacy fields, and every play and template player carries a role', () => {
    for (const play of INITIAL_PLAYBOOK.plays) {
      expect('targetFront' in play, play.id).toBe(false);
      expect(play.players.filter(p => p.side === 'offense').every(p => p.position), play.id).toBe(true);
    }
    for (const formation of DEFAULT_FORMATIONS.filter(f => f.side === 'offense')) {
      expect(formation.players.filter(p => p.side === 'offense').every(p => p.position), formation.id).toBe(true);
    }
  });
});
