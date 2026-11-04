import type { Formation } from '../types/playbook';
import { normalizeFormation } from './playValidation';

const STORAGE_KEY = 'antigravity_football_formations_v1';

/**
 * Formations that exist only on this device: ones saved or edited while the cloud was unreachable.
 * Anything the cloud accepted is removed from this list, so it never holds stale copies.
 */
export function loadStoredFormations(): Formation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    const formations: Formation[] = [];
    data.forEach((item, i) => {
      const result = normalizeFormation(item);
      if (result.ok) formations.push(result.value);
      else console.warn(`Skipped unreadable stored formation [${i}]: ${result.error}`);
    });
    return formations;
  } catch (err) {
    console.warn('Could not read stored formations:', err);
    return [];
  }
}

/**
 * The one formation list the app shows. Precedence for the same id: this device's unsynced edits,
 * then the cloud copy, then the built-in template. Custom formations are listed before the built-ins.
 */
export function mergeFormationSources(defaults: Formation[], remote: Formation[], deviceOnly: Formation[]): Formation[] {
  const merged = new Map<string, Formation>();
  defaults.forEach(f => merged.set(f.id, f));
  remote.forEach(f => merged.set(f.id, f));
  deviceOnly.forEach(f => merged.set(f.id, f));
  const builtInIds = new Set(defaults.map(f => f.id));
  const all = Array.from(merged.values());
  return [...all.filter(f => !builtInIds.has(f.id)), ...all.filter(f => builtInIds.has(f.id))];
}

export function saveStoredFormations(formations: Formation[]): void {
  try {
    if (formations.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(formations));
  } catch (err) {
    console.error('Could not store formations on this device:', err);
  }
}
