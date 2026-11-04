import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RunTemplate } from '../types/playbook';
import { loadStoredRunTemplates, saveStoredRunTemplates, mergeRunTemplateSources, normalizeRunTemplate } from './runTemplateStorage';

const tpl = (id: string, name = id): RunTemplate => ({ id, name, scheme: 'zone', reviewed: true, rules: { c: { kind: 'zone' } } });

afterEach(() => vi.unstubAllGlobals());

describe('mergeRunTemplateSources', () => {
  it('prefers device over cloud over built-in for the same id and lists custom templates first', () => {
    const merged = mergeRunTemplateSources(
      [{ ...tpl('a', 'built-in a'), builtIn: true }, { ...tpl('b'), builtIn: true }],
      [tpl('a', 'cloud a'), tpl('c', 'cloud c')],
      [tpl('a', 'device a')]
    );
    expect(merged.map(t => `${t.id}:${t.name}`)).toEqual(['c:cloud c', 'a:device a', 'b:b']);
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
  it('rejects unknown rule kinds and slots but keeps the rest', () => {
    const normalized = normalizeRunTemplate({ ...tpl('t'), rules: { c: { kind: 'zone' }, bogus: { kind: 'zone' }, og_ps: { kind: 'nope' } } });
    expect(normalized?.rules).toEqual({ c: { kind: 'zone' } });
  });

  it('drops malformed overrides', () => {
    const normalized = normalizeRunTemplate({ ...tpl('t'), overrides: [{ slot: 'c', pulls: true }, { slot: 'zzz' }, 4] });
    expect(normalized?.overrides).toEqual([{ slot: 'c', pulls: true }]);
  });
});
