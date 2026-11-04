import type { Formation, Play, Player } from '../types/playbook';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from '../data/presets';

export const WISHBONE_ID = 'play-wishbone-zone-glance';

export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** A built-in play by id. Throws, so a renamed preset fails loudly instead of silently skipping a test. */
export function preset(id: string): Play {
  const play = INITIAL_PLAYBOOK.plays.find(p => p.id === id);
  if (!play) throw new Error(`Preset play "${id}" not found`);
  return play;
}

export function template(id: string): Formation {
  const formation = DEFAULT_FORMATIONS.find(f => f.id === id);
  if (!formation) throw new Error(`Formation template "${id}" not found`);
  return formation;
}

export function player(partial: Pick<Player, 'id' | 'label' | 'side'> & Partial<Player>): Player {
  return { x: 480, y: 380, assignmentTitle: '', assignmentNotes: '', ...partial };
}

/** A minimal in-memory stand-in for window.localStorage. */
export function memoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  const storage = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key)
  };
  return { store, storage };
}
