import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearStoredPlaybook,
  downloadStoredPlaybookBackup,
  loadPlaybookFromStorage,
  parseAndValidateImport,
  savePlaybookToStorage,
  takeStorageLoadNotice
} from './storage';
import { PLAYBOOK_VERSION, playsEqual } from './playValidation';
import { INITIAL_PLAYBOOK } from '../data/presets';
import { WISHBONE_ID, clone, memoryStorage, preset } from '../test/helpers';

const KEY = 'antigravity_football_playbook_v1';
const UNREADABLE_BACKUP = `${KEY}_unreadable_backup`;
const PRE_UPGRADE_BACKUP = `${KEY}_schema_1_0_0_backup`;

let store: Map<string, string>;

beforeEach(() => {
  const memory = memoryStorage();
  store = memory.store;
  vi.stubGlobal('localStorage', memory.storage);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  takeStorageLoadNotice();
});

afterEach(() => {
  takeStorageLoadNotice();
});

const sameContent = (a: typeof INITIAL_PLAYBOOK, b: typeof INITIAL_PLAYBOOK) =>
  a.plays.length === b.plays.length && a.plays.every((p, i) => playsEqual(p, b.plays[i]));

describe('loadPlaybookFromStorage', () => {
  it('returns the built-in playbook when nothing is stored, without any notice', () => {
    expect(loadPlaybookFromStorage()).toBe(INITIAL_PLAYBOOK);
    expect(takeStorageLoadNotice()).toBeNull();
  });

  it('round-trips a saved playbook untouched, with no notice and no backup keys', () => {
    savePlaybookToStorage(INITIAL_PLAYBOOK);
    const loaded = loadPlaybookFromStorage();
    expect(sameContent(loaded, INITIAL_PLAYBOOK)).toBe(true);
    expect(takeStorageLoadNotice()).toBeNull();
    expect(store.size).toBe(1);
  });

  it('falls back to the built-in playbook on corrupt JSON, keeps the original text, and tells the user', () => {
    store.set(KEY, '{not json');
    expect(loadPlaybookFromStorage()).toBe(INITIAL_PLAYBOOK);
    expect(store.get(UNREADABLE_BACKUP)).toBe('{not json');
    expect(takeStorageLoadNotice()).toMatch(/could not be read/i);
  });

  it('rejects an unknown future version without losing the data', () => {
    const future = JSON.stringify({ version: '9.0.0', plays: INITIAL_PLAYBOOK.plays });
    store.set(KEY, future);
    expect(loadPlaybookFromStorage()).toBe(INITIAL_PLAYBOOK);
    expect(store.get(UNREADABLE_BACKUP)).toBe(future);
  });

  it('drops one bad play, keeps the rest, keeps the original, and tells the user', () => {
    const damaged = clone(INITIAL_PLAYBOOK);
    (damaged.plays[1].players[0] as { x: unknown }).x = 'oops';
    store.set(KEY, JSON.stringify(damaged));

    const loaded = loadPlaybookFromStorage();
    expect(loaded.plays).toHaveLength(INITIAL_PLAYBOOK.plays.length - 1);
    expect(store.get(UNREADABLE_BACKUP)).toBe(JSON.stringify(damaged));
    expect(takeStorageLoadNotice()).toMatch(/repaired or skipped/i);
  });

  it('gives a stored play that lost its notes safe defaults instead of crashing later', () => {
    const damaged = clone(INITIAL_PLAYBOOK);
    delete (damaged.plays[2] as { notes?: unknown }).notes;
    store.set(KEY, JSON.stringify(damaged));
    expect(loadPlaybookFromStorage().plays[2].notes.qbRead).toBe('');
  });

  it('survives a storage that throws on read', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => {},
      removeItem: () => {}
    });
    expect(loadPlaybookFromStorage()).toBe(INITIAL_PLAYBOOK);
  });
});

describe('schema upgrade on load', () => {
  const oldSave = () => {
    const old = clone(INITIAL_PLAYBOOK) as unknown as { version: string; plays: Record<string, unknown>[] };
    old.version = '1.0.0';
    for (const play of old.plays) {
      delete play.formationOffenseId;
      delete play.frontDefenseId;
      delete play.updatedAt;
      play.targetFront = 'Some Front';
      (play.players as Record<string, unknown>[]).forEach(p => { delete p.position; });
    }
    return old;
  };

  it('upgrades a 1.0.0 save: current version, links and roles restored, legacy field gone', () => {
    store.set(KEY, JSON.stringify(oldSave()));
    const loaded = loadPlaybookFromStorage();
    expect(loaded.version).toBe(PLAYBOOK_VERSION);
    expect(loaded.plays.every(p => p.formationOffenseId && p.frontDefenseId && !('targetFront' in p))).toBe(true);
    expect(sameContent(loaded, INITIAL_PLAYBOOK)).toBe(true);
  });

  it('keeps the old file once, and never overwrites that copy', () => {
    const text = JSON.stringify(oldSave());
    store.set(KEY, text);
    loadPlaybookFromStorage();
    expect(store.get(PRE_UPGRADE_BACKUP)).toBe(text);

    store.set(KEY, JSON.stringify({ ...oldSave(), title: 'changed later' }));
    loadPlaybookFromStorage();
    expect(store.get(PRE_UPGRADE_BACKUP)).toBe(text);
  });

  it('does not announce a clean upgrade as a problem', () => {
    store.set(KEY, JSON.stringify(oldSave()));
    loadPlaybookFromStorage();
    expect(takeStorageLoadNotice()).toBeNull();
  });
});

describe('legacy wishbone migration', () => {
  it('replaces a wishbone saved with the outdated cramped nose tackle, keeps the original and says so', () => {
    const saved = clone(INITIAL_PLAYBOOK);
    const wishbone = saved.plays.find(p => p.id === WISHBONE_ID);
    const nose = wishbone?.players.find(p => p.id === 'def_nt');
    expect(nose).toBeDefined();
    if (nose) nose.y = 350;
    store.set(KEY, JSON.stringify(saved));

    const loaded = loadPlaybookFromStorage();
    const restored = loaded.plays.find(p => p.id === WISHBONE_ID);
    expect(restored?.players.find(p => p.id === 'def_nt')?.y).toBe(preset(WISHBONE_ID).players.find(p => p.id === 'def_nt')?.y);
    expect(store.get(UNREADABLE_BACKUP)).toBe(JSON.stringify(saved));
    expect(takeStorageLoadNotice()).toMatch(/outdated defender positions/i);
  });

  it('leaves a wishbone with the current nose tackle position alone', () => {
    store.set(KEY, JSON.stringify(INITIAL_PLAYBOOK));
    loadPlaybookFromStorage();
    expect(store.has(UNREADABLE_BACKUP)).toBe(false);
  });
});

describe('parseAndValidateImport', () => {
  it('rejects text that is not JSON, and JSON that is not an object', () => {
    expect(parseAndValidateImport('nope').error).toMatch(/invalid json/i);
    expect(parseAndValidateImport('5').error).toBeTruthy();
    expect(parseAndValidateImport('null').error).toBeTruthy();
  });

  it('rejects an object that is neither a play nor a playbook', () => {
    expect(parseAndValidateImport('{"hello":1}').error).toMatch(/does not conform/i);
  });

  it('accepts a whole playbook and a single play', () => {
    expect(parseAndValidateImport(JSON.stringify(INITIAL_PLAYBOOK)).playbook?.plays).toHaveLength(INITIAL_PLAYBOOK.plays.length);
    expect(parseAndValidateImport(JSON.stringify(preset(WISHBONE_ID))).play?.id).toBe(WISHBONE_ID);
  });

  it('accepts a play that is missing optional fields by filling them in', () => {
    const lean = clone(preset(WISHBONE_ID)) as unknown as Record<string, unknown>;
    delete lean.notes;
    expect(parseAndValidateImport(JSON.stringify(lean)).play?.notes.qbRead).toBe('');
  });

  it('explains a playbook with no version', () => {
    expect(parseAndValidateImport(JSON.stringify({ plays: INITIAL_PLAYBOOK.plays })).error).toMatch(/version/i);
  });

  it('upgrades an old export', () => {
    const old = { ...clone(INITIAL_PLAYBOOK), version: '1.0.0' };
    expect(parseAndValidateImport(JSON.stringify(old)).playbook?.version).toBe(PLAYBOOK_VERSION);
  });

  it('reports why a single bad play is rejected', () => {
    const bad = clone(preset(WISHBONE_ID)) as unknown as { players: { x: unknown }[] };
    bad.players[0].x = 'x';
    expect(parseAndValidateImport(JSON.stringify(bad)).error).toMatch(/players\[0\]/);
  });
});

describe('backup and reset helpers', () => {
  it('reports "empty" when there is nothing to back up', () => {
    expect(downloadStoredPlaybookBackup()).toBe('empty');
  });

  it('reports "failed" when storage cannot be read', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => {}, removeItem: () => {} });
    expect(downloadStoredPlaybookBackup()).toBe('failed');
  });

  it('clearStoredPlaybook removes the saved playbook and nothing else', () => {
    store.set(KEY, 'x');
    store.set('football_theme', 'light');
    clearStoredPlaybook();
    expect(store.has(KEY)).toBe(false);
    expect(store.get('football_theme')).toBe('light');
  });
});
