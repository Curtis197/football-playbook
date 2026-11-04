import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RunTemplate } from '../types/playbook';
import { loadStoredRunTemplates, saveStoredRunTemplates, mergeRunTemplateSources, normalizeRunTemplate } from './runTemplateStorage';

const tpl = (id: string, name = id): RunTemplate => ({ id, name, scheme: 'zone', reviewed: true, rules: { c: { kind: 'zone' } } });

afterEach(() => vi.unstubAllGlobals());

describe('mergeRunTemplateSources', () => {
  it('prefers device over cloud for the same custom id and lists custom templates first', () => {
    const merged = mergeRunTemplateSources(
      [{ ...tpl('a', 'built-in a'), builtIn: true }, { ...tpl('b'), builtIn: true }],
      [tpl('c', 'cloud c'), tpl('d', 'cloud d')],
      [tpl('c', 'device c')]
    );
    expect(merged.map(t => `${t.id}:${t.name}`)).toEqual(['c:device c', 'd:cloud d', 'a:built-in a', 'b:b']);
  });

  it('never lets a stored template shadow or replace a built-in id', () => {
    const merged = mergeRunTemplateSources(
      [{ ...tpl('a', 'built-in a'), builtIn: true }],
      [tpl('a', 'cloud a')],
      [tpl('a', 'device a')]
    );
    expect(merged.map(t => `${t.id}:${t.name}`)).toEqual(['a:built-in a']);
  });
});

describe('stored run templates', () => {
  it('loads malformed JSON as an empty list', () => {
    vi.stubGlobal('localStorage', { getItem: () => '{not json', setItem: () => {}, removeItem: () => {} });
    expect(loadStoredRunTemplates()).toEqual([]);
  });

  it('skips unreadable entries and keeps valid ones', () => {
    const stored = JSON.stringify([tpl('good'), { id: 'bad' }, 'junk']);
    vi.stubGlobal('localStorage', { getItem: () => stored, setItem: () => {}, removeItem: () => {} });
    expect(loadStoredRunTemplates().map(t => t.id)).toEqual(['good']);
  });

  it('round-trips through save and load', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k)
    });
    saveStoredRunTemplates([tpl('x')]);
    expect(loadStoredRunTemplates()).toEqual([tpl('x')]);
    saveStoredRunTemplates([]);
    expect(loadStoredRunTemplates()).toEqual([]);
  });
});

describe('normalizeRunTemplate', () => {
  it('fails closed: a template is unreviewed unless it says reviewed: true', () => {
    const { reviewed: _dropped, ...withoutFlag } = tpl('t');
    expect(normalizeRunTemplate(withoutFlag)?.reviewed).toBe(false);
    expect(normalizeRunTemplate({ ...tpl('t'), reviewed: 'yes' })?.reviewed).toBe(false);
    expect(normalizeRunTemplate({ ...tpl('t'), reviewed: true })?.reviewed).toBe(true);
  });

  it('ignores a stored builtIn flag', () => {
    expect(normalizeRunTemplate({ ...tpl('t'), builtIn: true })?.builtIn).toBeUndefined();
  });

  it('rejects unknown rule kinds and slots but keeps the rest', () => {
    const normalized = normalizeRunTemplate({ ...tpl('t'), rules: { c: { kind: 'zone' }, bogus: { kind: 'zone' }, og_ps: { kind: 'nope' } } });
    expect(normalized?.rules).toEqual({ c: { kind: 'zone' } });
  });

  it('drops malformed overrides', () => {
    const normalized = normalizeRunTemplate({ ...tpl('t'), overrides: [{ slot: 'c', pulls: true }, { slot: 'zzz' }, 4] });
    expect(normalized?.overrides).toEqual([{ slot: 'c', pulls: true }]);
  });
});

describe('default hole', () => {
  it('keeps a default hole from 0 to 8 and drops anything else', () => {
    expect(normalizeRunTemplate({ ...tpl('t'), defaultHole: 5 })?.defaultHole).toBe(5);
    expect(normalizeRunTemplate({ ...tpl('t'), defaultHole: 0 })?.defaultHole).toBe(0);
    expect(normalizeRunTemplate({ ...tpl('t'), defaultHole: 9 })?.defaultHole).toBeUndefined();
    expect(normalizeRunTemplate({ ...tpl('t'), defaultHole: 2.5 })?.defaultHole).toBeUndefined();
    expect(normalizeRunTemplate({ ...tpl('t') })?.defaultHole).toBeUndefined();
  });
});
