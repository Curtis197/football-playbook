import { describe, expect, it } from 'vitest';
import { PLAYBOOK_VERSION, normalizeFormation, normalizePlay, normalizePlaybook, playsEqual } from './playValidation';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from '../data/presets';
import { WISHBONE_ID, clone, preset } from '../test/helpers';

const base = () => clone(preset(WISHBONE_ID));
const withEdit = (edit: (play: ReturnType<typeof base>) => void) => {
  const play = base();
  edit(play);
  return play;
};
const book = (plays: unknown[], version: unknown = PLAYBOOK_VERSION) => ({ version, title: 't', philosophySummary: '', plays });

describe('built-in data survives validation unchanged', () => {
  it('every preset play validates with no warnings and is not altered', () => {
    for (const play of INITIAL_PLAYBOOK.plays) {
      const result = normalizePlay(clone(play));
      expect(result.ok, play.id).toBe(true);
      if (result.ok) {
        expect(result.warnings, play.id).toEqual([]);
        expect(playsEqual(play, result.value), play.id).toBe(true);
      }
    }
  });

  it('every built-in formation validates and is not altered', () => {
    for (const formation of DEFAULT_FORMATIONS) {
      const result = normalizeFormation(clone(formation));
      expect(result.ok, formation.id).toBe(true);
      if (result.ok) expect(result.value, formation.id).toEqual(formation);
    }
  });

  it('the whole built-in playbook validates strictly', () => {
    const result = normalizePlaybook(clone(INITIAL_PLAYBOOK), 'strict');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings).toEqual([]);
  });
});

describe('normalizePlay: missing optional data gets safe defaults (these used to crash the editor)', () => {
  it('fills in missing notes', () => {
    const result = normalizePlay(withEdit(p => { delete (p as { notes?: unknown }).notes; }));
    expect(result.ok && result.value.notes).toMatchObject({ qbRead: '', lineBlocking: '', philosophyReason: '' });
  });

  it('fills in missing tag and situation lists', () => {
    const result = normalizePlay(withEdit(p => { delete (p as { tags?: unknown }).tags; delete (p as { situation?: unknown }).situation; }));
    expect(result.ok && result.value.tags).toEqual([]);
    expect(result.ok && result.value.situation).toEqual([]);
  });

  it('keeps only text entries in tag lists', () => {
    const result = normalizePlay(withEdit(p => { (p as { tags: unknown }).tags = ['ok', 5, null, 'also-ok']; }));
    expect(result.ok && result.value.tags).toEqual(['ok', 'also-ok']);
  });

  it('drops unknown shapes and positions rather than rejecting the player', () => {
    const result = normalizePlay(withEdit(p => {
      (p.players[0] as { shape: unknown }).shape = 'hexagon';
      (p.players[1] as { position: unknown }).position = 'KICKER';
    }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.players[0].shape).toBeUndefined();
      expect(result.value.players[1].position).toBeDefined();
      expect(result.value.players[1].position).not.toBe('KICKER');
    }
  });
});

describe('normalizePlay: structurally broken plays are rejected with a reason', () => {
  const rejected = (edit: (play: ReturnType<typeof base>) => void) => normalizePlay(withEdit(edit));

  it.each([
    ['player x as text', (p: ReturnType<typeof base>) => { (p.players[0] as { x: unknown }).x = '12'; }],
    ['player y null', (p: ReturnType<typeof base>) => { (p.players[0] as { y: unknown }).y = null; }],
    ['player x NaN', (p: ReturnType<typeof base>) => { p.players[0].x = Number.NaN; }],
    ['unknown side', (p: ReturnType<typeof base>) => { (p.players[0] as { side: unknown }).side = 'special'; }],
    ['duplicate player ids', (p: ReturnType<typeof base>) => { p.players[1].id = p.players[0].id; }],
    ['an action with one point', (p: ReturnType<typeof base>) => { p.actions[0].points = [p.actions[0].points[0]]; }],
    ['an unknown action type', (p: ReturnType<typeof base>) => { (p.actions[0] as { type: unknown }).type = 'zigzag'; }],
    ['a waypoint without coordinates', (p: ReturnType<typeof base>) => { (p.actions[0].points[1] as { x: unknown }).x = undefined; }]
  ])('rejects %s', (_label, edit) => {
    expect(rejected(edit).ok).toBe(false);
  });

  it('rejects things that are not plays at all', () => {
    for (const junk of ['x', null, undefined, 5, [], {}, { id: 'a' }]) expect(normalizePlay(junk).ok).toBe(false);
  });

  it('names the play and the exact field in the error', () => {
    const result = rejected(p => { (p.players[2] as { x: unknown }).x = 'a'; });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(base().name);
      expect(result.error).toContain('players[2]');
    }
  });
});

describe('normalizePlay: repairable problems are repaired and reported', () => {
  it('drops an action whose player does not exist, and says so', () => {
    const result = normalizePlay(withEdit(p => { p.actions[0].playerId = 'ghost'; }));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.actions).toHaveLength(base().actions.length - 1);
      expect(result.warnings).toHaveLength(1);
    }
  });

  it('resets an unknown category and says so', () => {
    const result = normalizePlay(withEdit(p => { (p as { category: unknown }).category = 'nonsense'; }));
    expect(result.ok && result.value.category).toBe('run');
    expect(result.ok && result.warnings).toHaveLength(1);
  });

  it('gives an action a sensible end marker when its own is invalid', () => {
    const result = normalizePlay(withEdit(p => {
      (p.actions[0] as { endMarker: unknown }).endMarker = 'sparkle';
    }));
    expect(result.ok && ['arrow', 'tbar']).toContain(result.ok && result.value.actions[0].endMarker);
  });
});

describe('normalizePlaybook', () => {
  it('rejects a missing, unknown or non-text version with a reason that mentions the version', () => {
    const withoutVersion = { title: 't', philosophySummary: '', plays: [base()] };
    const candidates = [withoutVersion, book([base()], '9.9.9'), book([base()], 2), book([base()], null)];
    for (const candidate of candidates) {
      const result = normalizePlaybook(candidate);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/version/i);
    }
  });

  it('reads both schema versions and always writes the current one', () => {
    for (const version of ['1.0.0', '1.1.0', PLAYBOOK_VERSION]) {
      const result = normalizePlaybook(book([base()], version));
      expect(result.ok && result.value.version).toBe(PLAYBOOK_VERSION);
    }
  });

  it('rejects an empty playbook', () => {
    expect(normalizePlaybook(book([])).ok).toBe(false);
  });

  it('strict mode: one bad play rejects the whole file', () => {
    expect(normalizePlaybook(book([base(), { id: 'x' }]), 'strict').ok).toBe(false);
  });

  it('lenient mode: the bad play is dropped and reported, the rest is kept', () => {
    const result = normalizePlaybook(book([base(), { id: 'x' }]), 'lenient');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.plays).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
    }
  });

  it('rejects duplicate play ids in strict mode and drops them in lenient mode', () => {
    expect(normalizePlaybook(book([base(), base()]), 'strict').ok).toBe(false);
    const lenient = normalizePlaybook(book([base(), base()]), 'lenient');
    expect(lenient.ok && lenient.value.plays).toHaveLength(1);
  });

  it('rejects things that are not playbooks', () => {
    for (const junk of [null, 'text', 5, [], undefined]) expect(normalizePlaybook(junk).ok).toBe(false);
  });
});

describe('normalizeFormation', () => {
  const valid = () => ({ id: 'f', name: 'F', side: 'offense', players: [{ id: 'c', label: 'C', side: 'offense', x: 480, y: 380 }] });

  it('accepts a formation and upgrades its players with positions', () => {
    const result = normalizeFormation(valid());
    expect(result.ok && result.value.players[0].position).toBe('OL');
  });

  it.each([
    ['an unknown side', { ...valid(), side: 'sideways' }],
    ['no players list', { ...valid(), players: 'none' }],
    ['a player with bad coordinates', { ...valid(), players: [{ id: 'c', label: 'C', side: 'offense', x: 'a', y: 1 }] }],
    ['no name', { ...valid(), name: '' }],
    ['duplicate player ids', { ...valid(), players: [valid().players[0], valid().players[0]] }]
  ])('rejects %s', (_label, input) => {
    expect(normalizeFormation(input).ok).toBe(false);
  });

  it('drops tag and label entries that are not text', () => {
    const result = normalizeFormation({ ...valid(), tags: ['a', 1], labels: [true, 'b'] });
    expect(result.ok && result.value.tags).toEqual(['a']);
    expect(result.ok && result.value.labels).toEqual(['b']);
  });
});

describe('playsEqual', () => {
  it('ignores key order and the updatedAt stamp', () => {
    const a = base();
    const b = { updatedAt: '2030-01-01T00:00:00.000Z', ...Object.fromEntries(Object.entries(a).reverse()) } as typeof a;
    expect(playsEqual(a, b)).toBe(true);
  });

  it('notices a moved player, a changed note and a changed route', () => {
    const moved = withEdit(p => { p.players[0].x += 1; });
    const noted = withEdit(p => { p.notes.qbRead += '!'; });
    const rerouted = withEdit(p => { p.actions[0].points[1].x += 1; });
    for (const changed of [moved, noted, rerouted]) expect(playsEqual(base(), changed)).toBe(false);
  });

  it('treats a missing optional field and an undefined one as equal', () => {
    const a = base();
    const b = { ...base(), primaryPassConcept: undefined };
    expect(playsEqual(a, b)).toBe(true);
  });
});
