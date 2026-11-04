import type { Play, PlaybookFile } from '../types/playbook';

/**
 * Undo/redo keeps whole-playbook snapshots. Edits that arrive within COALESCE_MS of each other
 * (a drag, typing in a field) share one undo step. Everything here is pure so it can be tested directly.
 */
export interface PlaybookHistory {
  present: PlaybookFile;
  past: PlaybookFile[];
  future: PlaybookFile[];
  lastEditAt: number;
}

export const HISTORY_LIMIT = 100;
export const COALESCE_MS = 600;

export function createHistory(present: PlaybookFile): PlaybookHistory {
  return { present, past: [], future: [], lastEditAt: 0 };
}

/** Stamps every play that was added or changed by an edit, so each play knows when it was last edited here. */
export function stampEditedPlays(before: PlaybookFile, after: PlaybookFile, editedAt: string): PlaybookFile {
  const previous = new Map(before.plays.map(p => [p.id, p]));
  let changed = false;
  const plays = after.plays.map(p => {
    if (previous.get(p.id) === p) return p;
    changed = true;
    return { ...p, updatedAt: editedAt };
  });
  return changed ? { ...after, plays } : after;
}

/** A user edit: stamps changed plays, and either starts a new undo step or joins the one still open. */
export function applyEdit(
  history: PlaybookHistory,
  update: PlaybookFile | ((prev: PlaybookFile) => PlaybookFile),
  now: number
): PlaybookHistory {
  const updated = typeof update === 'function' ? update(history.present) : update;
  if (updated === history.present) return history;
  const next = stampEditedPlays(history.present, updated, new Date(now).toISOString());
  const joinsLastStep = now - history.lastEditAt < COALESCE_MS;
  return {
    present: next,
    past: joinsLastStep ? history.past : [...history.past, history.present].slice(-HISTORY_LIMIT),
    future: [],
    lastEditAt: now
  };
}

export function undoHistory(history: PlaybookHistory): PlaybookHistory {
  if (history.past.length === 0) return history;
  return {
    present: history.past[history.past.length - 1],
    past: history.past.slice(0, -1),
    future: [history.present, ...history.future],
    lastEditAt: 0
  };
}

export function redoHistory(history: PlaybookHistory): PlaybookHistory {
  if (history.future.length === 0) return history;
  return {
    present: history.future[0],
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    future: history.future.slice(1),
    lastEditAt: 0
  };
}

/** A change that is not the user's edit (a background cloud sync): no undo step, no edit stamp. */
export function replacePresent(history: PlaybookHistory, present: PlaybookFile): PlaybookHistory {
  return { ...history, present };
}

/**
 * Local edits always win; the cloud only contributes plays this device does not have. The built-in plays are
 * not re-added here: they arrive with a fresh install, and a built-in play the user deleted must stay deleted.
 */
export function mergeCloudPlays(local: PlaybookFile, remote: Play[]): PlaybookFile {
  const merged = new Map<string, Play>();
  local.plays.forEach(p => merged.set(p.id, p));
  const localIds = new Set(local.plays.map(p => p.id));
  remote.forEach(p => {
    if (!localIds.has(p.id)) merged.set(p.id, p);
  });
  return { ...local, plays: Array.from(merged.values()) };
}
