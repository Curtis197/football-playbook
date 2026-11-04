import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadStoredFormations, mergeFormationSources, saveStoredFormations } from './formationStorage';
import { DEFAULT_FORMATIONS } from '../data/presets';
import type { Formation } from '../types/playbook';
import { clone, memoryStorage, template } from '../test/helpers';

const KEY = 'antigravity_football_formations_v1';
const spread = template('formation-spread-2x2');
const custom = (id: string): Formation => ({ ...clone(spread), id, name: `Custom ${id}` });

describe('mergeFormationSources', () => {
  it('returns the built-ins unchanged when there is nothing else', () => {
    expect(mergeFormationSources(DEFAULT_FORMATIONS, [], [])).toEqual(DEFAULT_FORMATIONS);
  });

  it('the cloud copy replaces the built-in of the same id', () => {
    const edited = { ...spread, name: 'Cloud-edited' };
    expect(mergeFormationSources(DEFAULT_FORMATIONS, [edited], []).find(f => f.id === spread.id)?.name).toBe('Cloud-edited');
  });

  it('this device\'s unsynced edit beats the cloud copy', () => {
    const cloud = { ...spread, name: 'Cloud-edited' };
    const device = { ...spread, name: 'Device-edited' };
    expect(mergeFormationSources(DEFAULT_FORMATIONS, [cloud], [device]).find(f => f.id === spread.id)?.name).toBe('Device-edited');
  });

  it('never duplicates an id and never loses a formation', () => {
    const merged = mergeFormationSources(DEFAULT_FORMATIONS, [custom('a'), { ...spread }], [custom('b'), custom('a')]);
    expect(new Set(merged.map(f => f.id)).size).toBe(merged.length);
    expect(merged).toHaveLength(DEFAULT_FORMATIONS.length + 2);
  });

  it('lists custom formations before the built-in ones', () => {
    const merged = mergeFormationSources(DEFAULT_FORMATIONS, [custom('a')], [custom('b')]);
    expect(merged.slice(0, 2).map(f => f.id).sort()).toEqual(['a', 'b']);
    expect(merged.slice(2).every(f => DEFAULT_FORMATIONS.some(d => d.id === f.id))).toBe(true);
  });

  it('does not mutate its inputs', () => {
    const remote = [custom('a')];
    const frozen = JSON.stringify([DEFAULT_FORMATIONS, remote]);
    mergeFormationSources(DEFAULT_FORMATIONS, remote, []);
    expect(JSON.stringify([DEFAULT_FORMATIONS, remote])).toBe(frozen);
  });
});

describe('device storage of formations', () => {
  let store: Map<string, string>;

  beforeEach(() => {
    const memory = memoryStorage();
    store = memory.store;
    vi.stubGlobal('localStorage', memory.storage);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('is empty by default', () => {
    expect(loadStoredFormations()).toEqual([]);
  });

  it('round-trips formations', () => {
    saveStoredFormations([custom('a')]);
    const loaded = loadStoredFormations();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe('a');
    expect(loaded[0].players).toHaveLength(spread.players.length);
  });

  it('storing an empty list clears the key instead of keeping "[]"', () => {
    saveStoredFormations([custom('a')]);
    saveStoredFormations([]);
    expect(store.has(KEY)).toBe(false);
  });

  it('skips unreadable entries and keeps the valid ones', () => {
    const brokenPlayer = { ...custom('b'), players: [{ id: 'q', label: 'QB', side: 'offense', x: 'oops', y: 1 }] };
    store.set(KEY, JSON.stringify([custom('a'), { id: 'bad', name: 'Bad', side: 'sideways', players: [] }, 'junk', brokenPlayer]));
    expect(loadStoredFormations().map(f => f.id)).toEqual(['a']);
  });

  it('treats corrupt JSON or a non-list as empty without throwing', () => {
    store.set(KEY, '{broken');
    expect(loadStoredFormations()).toEqual([]);
    store.set(KEY, '{"not":"a list"}');
    expect(loadStoredFormations()).toEqual([]);
  });

  it('survives a storage that refuses to write', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {} });
    expect(() => saveStoredFormations([custom('a')])).not.toThrow();
  });
});
