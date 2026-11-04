import { describe, expect, it } from 'vitest';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from './presets';
import { PLAYBOOK_VERSION, normalizeFormation, normalizePlay } from '../utils/playValidation';
import { resolveFormation } from '../utils/playMigrations';
import { detectCurrentQBPosition } from '../utils/formationBackfield';
import type { Player, Point } from '../types/playbook';

// These guard the built-in data: a typo in a preset (a route to a player that does not exist, a player off the
// field, two templates with the same name) otherwise only shows up as odd behaviour in the app.

const plays = INITIAL_PLAYBOOK.plays;
const offenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'offense');
const defenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'defense');
const inField = (p: Point | Player) => p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= 700;
const LINE_LABELS = ['C', 'LG', 'RG', 'LT', 'RT'];
const TWELVE_PLAYER_TEMPLATES = new Set([
  'formation-double-wing-22',
  'formation-pro-i-condensed-bunch-21',
  'formation-shotgun-20-trips',
  'formation-shotgun-10-quads-bunch'
]);

describe('built-in plays', () => {
  it('there are plays, with unique ids and names', () => {
    expect(plays.length).toBeGreaterThanOrEqual(8);
    expect(new Set(plays.map(p => p.id)).size).toBe(plays.length);
    expect(new Set(plays.map(p => p.name.toLowerCase())).size).toBe(plays.length);
  });

  it('the playbook is on the current schema', () => {
    expect(INITIAL_PLAYBOOK.version).toBe(PLAYBOOK_VERSION);
  });

  describe.each(plays.map(p => [p.id, p] as const))('%s', (_id, play) => {
    it('passes the same validation that imports go through, with no warnings', () => {
      const result = normalizePlay(JSON.parse(JSON.stringify(play)));
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.warnings).toEqual([]);
    });

    it('has unique player ids', () => {
      expect(new Set(play.players.map(p => p.id)).size).toBe(play.players.length);
    });

    it('has eleven players a side', () => {
      expect(play.players.filter(p => p.side === 'offense')).toHaveLength(11);
      expect(play.players.filter(p => p.side === 'defense')).toHaveLength(11);
    });

    it('keeps every player on the field', () => {
      expect(play.players.filter(p => !inField(p)).map(p => p.id)).toEqual([]);
    });

    it('has unique action ids, each pointing at a real player', () => {
      const ids = new Set(play.players.map(p => p.id));
      expect(new Set(play.actions.map(a => a.id)).size).toBe(play.actions.length);
      expect(play.actions.filter(a => !ids.has(a.playerId)).map(a => a.id)).toEqual([]);
    });

    it('draws every route from at least two points, all on the field', () => {
      for (const action of play.actions) {
        expect(action.points.length, action.id).toBeGreaterThanOrEqual(2);
        expect(action.points.every(inField), action.id).toBe(true);
      }
    });

    it('starts every route where its player stands', () => {
      for (const action of play.actions.filter(a => !a.parentActionId)) {
        const owner = play.players.find(p => p.id === action.playerId);
        expect([action.points[0].x, action.points[0].y], action.id).toEqual([owner?.x, owner?.y]);
      }
    });

    it('links to a real offensive template and a real defensive front', () => {
      expect(resolveFormation(DEFAULT_FORMATIONS, 'offense', play.formationOffenseId, undefined), 'offense').toBeDefined();
      expect(resolveFormation(DEFAULT_FORMATIONS, 'defense', play.frontDefenseId, undefined), 'defense').toBeDefined();
    });

    it('has the coaching notes the Inspector displays', () => {
      expect(play.notes.qbRead.trim().length).toBeGreaterThan(0);
      expect(play.notes.lineBlocking.trim().length).toBeGreaterThan(0);
      expect(play.notes.philosophyReason.trim().length).toBeGreaterThan(0);
    });

    it('gives every player an assignment', () => {
      expect(play.players.filter(p => !p.assignmentTitle.trim()).map(p => p.id)).toEqual([]);
    });
  });
});

describe('built-in formation templates', () => {
  it('there are offensive templates and defensive fronts, with unique ids', () => {
    expect(offenseTemplates.length).toBeGreaterThan(10);
    expect(defenseTemplates.length).toBeGreaterThan(3);
    expect(new Set(DEFAULT_FORMATIONS.map(f => f.id)).size).toBe(DEFAULT_FORMATIONS.length);
  });

  it('no two templates on the same side share a name (names are how typed text links to a template)', () => {
    for (const side of [offenseTemplates, defenseTemplates]) {
      const names = side.map(f => f.name.trim().toLowerCase());
      expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
    }
  });

  it('the known twelve-player list only names templates that still exist (and still have twelve)', () => {
    for (const id of TWELVE_PLAYER_TEMPLATES) {
      expect(DEFAULT_FORMATIONS.find(f => f.id === id)?.players.length, id).toBe(12);
    }
  });

  describe.each(DEFAULT_FORMATIONS.map(f => [f.name, f] as const))('%s', (_name, formation) => {
    it('passes validation unchanged', () => {
      const result = normalizeFormation(JSON.parse(JSON.stringify(formation)));
      expect(result.ok).toBe(true);
    });

    it('has unique player ids, all on the field', () => {
      expect(new Set(formation.players.map(p => p.id)).size).toBe(formation.players.length);
      expect(formation.players.filter(p => !inField(p)).map(p => p.id)).toEqual([]);
    });

    it('has a description', () => {
      expect((formation.description ?? '').trim().length).toBeGreaterThan(0);
    });
  });

  describe.each(offenseTemplates.map(f => [f.name, f] as const))('offense: %s', (_name, formation) => {
    // KNOWN DATA ERROR: these four templates were authored with a twelfth player. Which player to remove is a
    // football decision, so they are recorded as expected failures. When one is fixed this test starts failing
    // with "expected to fail", which is the cue to delete its id from TWELVE_PLAYER_TEMPLATES.
    const hasElevenPlayers = TWELVE_PLAYER_TEMPLATES.has(formation.id) ? it.fails : it;
    hasElevenPlayers('has eleven players', () => {
      expect(formation.players).toHaveLength(11);
    });

    it('has five linemen and one QB', () => {
      expect(formation.players.filter(p => LINE_LABELS.includes(p.label)).map(p => p.label).sort()).toEqual([...LINE_LABELS].sort());
      expect(formation.players.filter(p => p.label === 'QB')).toHaveLength(1);
    });

    it('all of its players are offensive', () => {
      expect(formation.players.every(p => p.side === 'offense')).toBe(true);
    });

    it('has a personnel code made of two digits', () => {
      expect(formation.personnel).toMatch(/^\d{2}$/);
    });

    it('states the QB alignment its players actually show', () => {
      expect(formation.qbPosition).toBe(detectCurrentQBPosition(formation.players));
    });

    it('lines the linemen up on one line of scrimmage', () => {
      const lineYs = new Set(formation.players.filter(p => LINE_LABELS.includes(p.label)).map(p => p.y));
      expect(lineYs.size).toBe(1);
    });
  });

  describe.each(defenseTemplates.map(f => [f.name, f] as const))('defense: %s', (_name, formation) => {
    it('has eleven defenders, all on the defensive side', () => {
      expect(formation.players).toHaveLength(11);
      expect(formation.players.every(p => p.side === 'defense')).toBe(true);
    });

    it('belongs to a known front family', () => {
      expect(['even_front', 'odd_front', 'heavy_front']).toContain(formation.style);
    });
  });
});
