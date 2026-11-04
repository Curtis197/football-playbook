import { describe, expect, it } from 'vitest';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from './data/presets';

// Reads repository files through Vite's raw imports (the app's TypeScript config has no Node types).
const sources = import.meta.glob(['./**/*.{ts,tsx,js}', '!./**/*.test.*'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const rules = (import.meta.glob('../firestore.rules', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)['../firestore.rules'];
const firebaseJson = (import.meta.glob('../firebase.json', { query: '?raw', import: 'default', eager: true }) as Record<string, string>)['../firebase.json'];

describe('no file shadows another', () => {
  it('there is no .js file next to a .ts/.tsx module of the same name', () => {
    const paths = Object.keys(sources);
    const clashes = paths.filter(p => p.endsWith('.js') && (paths.includes(p.replace(/\.js$/, '.ts')) || paths.includes(p.replace(/\.js$/, '.tsx'))));
    expect(clashes).toEqual([]);
  });
});

describe('firestore.rules', () => {
  it('is wired up in firebase.json', () => {
    expect(JSON.parse(firebaseJson).firestore.rules).toBe('firestore.rules');
  });

  it('opens exactly the collections the app uses', () => {
    const db = sources['./services/playbookDb.ts'];
    const used = [...db.matchAll(/_COLLECTION = '([A-Za-z]+)'/g)].map(m => m[1]).sort();
    const ruled = [...rules.matchAll(/^ {4}match \/([A-Za-z]+)\/\{/gm)].map(m => m[1]).sort();
    expect(used.length).toBeGreaterThan(0);
    expect(ruled).toEqual(used);
  });

  it('closes everything else', () => {
    expect(rules).toMatch(/match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
  });

  const limit = (pattern: RegExp) => Number(rules.match(pattern)?.[1]);

  it('limits are not smaller than the largest built-in documents', () => {
    const plays = INITIAL_PLAYBOOK.plays;
    expect(limit(/data\.keys\(\)\.size\(\) <= (\d+)\s*\n\s*&& data\.id == playId/)).toBeGreaterThanOrEqual(Math.max(...plays.map(p => Object.keys(p).length)));
    expect(limit(/isShortList\(data\.players, (\d+)\)\s*\n\s*&& isShortList\(data\.actions/)).toBeGreaterThanOrEqual(Math.max(...plays.map(p => p.players.length)));
    expect(limit(/isShortList\(data\.actions, (\d+)\)/)).toBeGreaterThanOrEqual(Math.max(...plays.map(p => p.actions.length)));
    expect(limit(/isText\(data\.name, (\d+)\)/)).toBeGreaterThanOrEqual(Math.max(...plays.map(p => p.name.length), ...DEFAULT_FORMATIONS.map(f => f.name.length)));
    expect(limit(/data\.keys\(\)\.size\(\) <= (\d+)\s*\n\s*&& data\.id == formationId/)).toBeGreaterThanOrEqual(Math.max(...DEFAULT_FORMATIONS.map(f => Object.keys(f).length)));
  });

  it('formation sides allowed by the rules cover every side the data uses', () => {
    for (const f of DEFAULT_FORMATIONS) expect(rules).toContain(`'${f.side}'`);
  });
});
