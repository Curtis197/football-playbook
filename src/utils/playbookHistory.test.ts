import { describe, expect, it } from 'vitest';
import {
  COALESCE_MS,
  HISTORY_LIMIT,
  applyEdit,
  createHistory,
  mergeCloudPlays,
  redoHistory,
  replacePresent,
  stampEditedPlays,
  undoHistory
} from './playbookHistory';
import { INITIAL_PLAYBOOK } from '../data/presets';
import type { PlaybookFile } from '../types/playbook';
import { clone, preset } from '../test/helpers';

const T0 = Date.parse('2026-11-04T10:00:00.000Z');
const renameFirstPlay = (name: string) => (book: PlaybookFile): PlaybookFile => ({
  ...book,
  plays: book.plays.map((p, i) => (i === 0 ? { ...p, name } : p))
});

describe('applyEdit', () => {
  it('returns the very same history when the update changes nothing', () => {
    const history = createHistory(INITIAL_PLAYBOOK);
    expect(applyEdit(history, book => book, T0)).toBe(history);
    expect(applyEdit(history, INITIAL_PLAYBOOK, T0)).toBe(history);
  });

  it('starts a new undo step for an edit after the coalescing window', () => {
    const first = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    const second = applyEdit(first, renameFirstPlay('B'), T0 + COALESCE_MS);
    expect(first.past).toHaveLength(1);
    expect(second.past).toHaveLength(2);
    expect(second.present.plays[0].name).toBe('B');
  });

  it('merges rapid edits (a drag, typing) into one undo step', () => {
    let history = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    for (let i = 1; i <= 20; i++) history = applyEdit(history, renameFirstPlay(`A${i}`), T0 + i * 20);
    expect(history.past).toHaveLength(1);
    expect(history.present.plays[0].name).toBe('A20');
    // one undo goes all the way back to before the drag started
    expect(undoHistory(history).present).toBe(INITIAL_PLAYBOOK);
  });

  it('measures the window from the latest edit, so a long continuous drag stays one step', () => {
    let history = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('0'), T0);
    for (let i = 1; i <= 100; i++) history = applyEdit(history, renameFirstPlay(String(i)), T0 + i * (COALESCE_MS - 1));
    expect(history.past).toHaveLength(1);
  });

  it('clears the redo stack when a new edit follows an undo', () => {
    const edited = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    const undone = undoHistory(edited);
    expect(undone.future).toHaveLength(1);
    const forked = applyEdit(undone, renameFirstPlay('B'), T0 + 5000);
    expect(forked.future).toHaveLength(0);
  });

  it('keeps at most HISTORY_LIMIT steps and drops the oldest first', () => {
    let history = createHistory(INITIAL_PLAYBOOK);
    for (let i = 0; i < HISTORY_LIMIT + 25; i++) history = applyEdit(history, renameFirstPlay(`v${i}`), T0 + i * COALESCE_MS * 2);
    expect(history.past).toHaveLength(HISTORY_LIMIT);
    expect(history.past[0].plays[0].name).toBe('v24');
  });

  it('accepts a whole playbook as well as an updater function', () => {
    const next = renameFirstPlay('Whole')(INITIAL_PLAYBOOK);
    expect(applyEdit(createHistory(INITIAL_PLAYBOOK), next, T0).present.plays[0].name).toBe('Whole');
  });
});

describe('edit stamping', () => {
  const editedAt = new Date(T0).toISOString();

  it('stamps only the plays that changed and leaves the others untouched (same object)', () => {
    const history = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('Stamped'), T0);
    expect(history.present.plays[0].updatedAt).toBe(editedAt);
    history.present.plays.slice(1).forEach((p, i) => expect(p).toBe(INITIAL_PLAYBOOK.plays[i + 1]));
  });

  it('stamps a newly added play', () => {
    const added = { ...clone(preset('play-pro-i-veer-option')), id: 'new-one', name: 'New' };
    const after = applyEdit(createHistory(INITIAL_PLAYBOOK), book => ({ ...book, plays: [...book.plays, added] }), T0);
    expect(after.present.plays.at(-1)?.updatedAt).toBe(editedAt);
  });

  it('returns the same playbook object when nothing changed', () => {
    expect(stampEditedPlays(INITIAL_PLAYBOOK, INITIAL_PLAYBOOK, editedAt)).toBe(INITIAL_PLAYBOOK);
  });

  it('does not mutate the playbook it was given', () => {
    const before = JSON.stringify(INITIAL_PLAYBOOK);
    applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('X'), T0);
    expect(JSON.stringify(INITIAL_PLAYBOOK)).toBe(before);
  });
});

describe('undo / redo', () => {
  it('are no-ops (same object) when there is nothing to undo or redo', () => {
    const history = createHistory(INITIAL_PLAYBOOK);
    expect(undoHistory(history)).toBe(history);
    expect(redoHistory(history)).toBe(history);
  });

  it('undo then redo returns exactly to the edited state', () => {
    const edited = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    const roundTrip = redoHistory(undoHistory(edited));
    expect(roundTrip.present).toBe(edited.present);
    expect(roundTrip.past).toHaveLength(edited.past.length);
    expect(roundTrip.future).toHaveLength(0);
  });

  it('walks back through several steps in order', () => {
    let history = createHistory(INITIAL_PLAYBOOK);
    ['A', 'B', 'C'].forEach((name, i) => {
      history = applyEdit(history, renameFirstPlay(name), T0 + i * 10_000);
    });
    expect(undoHistory(history).present.plays[0].name).toBe('B');
    expect(undoHistory(undoHistory(history)).present.plays[0].name).toBe('A');
    expect(undoHistory(undoHistory(undoHistory(history))).present).toBe(INITIAL_PLAYBOOK);
  });

  it('undo restores the earlier edit stamp rather than inventing a new one', () => {
    const edited = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    expect(undoHistory(edited).present.plays[0].updatedAt).toBe(INITIAL_PLAYBOOK.plays[0].updatedAt);
  });

  it('resets the coalescing clock so the next edit after an undo is its own step', () => {
    const edited = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    const undone = undoHistory(edited);
    expect(undone.lastEditAt).toBe(0);
    const next = applyEdit(undone, renameFirstPlay('B'), T0 + 1);
    expect(next.past).toHaveLength(1);
  });
});

describe('replacePresent (background sync)', () => {
  it('changes the playbook without adding an undo step or stamping edit times', () => {
    const history = applyEdit(createHistory(INITIAL_PLAYBOOK), renameFirstPlay('A'), T0);
    const synced = replacePresent(history, { ...history.present, title: 'From the cloud' });
    expect(synced.present.title).toBe('From the cloud');
    expect(synced.past).toBe(history.past);
    expect(synced.future).toBe(history.future);
    expect(synced.lastEditAt).toBe(history.lastEditAt);
  });
});

describe('mergeCloudPlays', () => {
  const remoteOnly = { ...clone(preset('play-pro-i-veer-option')), id: 'cloud-only', name: 'Only in the cloud' };

  it('keeps the local copy when both sides have the play (local edits always win)', () => {
    const local = renameFirstPlay('My local edit')(INITIAL_PLAYBOOK);
    const cloudCopy = { ...clone(INITIAL_PLAYBOOK.plays[0]), name: 'Cloud version' };
    const merged = mergeCloudPlays(local, [cloudCopy]);
    expect(merged.plays.find(p => p.id === cloudCopy.id)?.name).toBe('My local edit');
  });

  it('adds plays that exist only in the cloud', () => {
    const merged = mergeCloudPlays(INITIAL_PLAYBOOK, [remoteOnly]);
    expect(merged.plays.some(p => p.id === 'cloud-only')).toBe(true);
    expect(merged.plays).toHaveLength(INITIAL_PLAYBOOK.plays.length + 1);
  });

  it('never duplicates a play id', () => {
    const merged = mergeCloudPlays(INITIAL_PLAYBOOK, [remoteOnly, remoteOnly, ...INITIAL_PLAYBOOK.plays]);
    expect(new Set(merged.plays.map(p => p.id)).size).toBe(merged.plays.length);
  });

  it('puts local plays before cloud-only ones', () => {
    const merged = mergeCloudPlays(INITIAL_PLAYBOOK, [remoteOnly]);
    expect(merged.plays.at(-1)?.id).toBe('cloud-only');
  });

  it('does not mutate its inputs', () => {
    const before = JSON.stringify(INITIAL_PLAYBOOK);
    mergeCloudPlays(INITIAL_PLAYBOOK, [remoteOnly]);
    expect(JSON.stringify(INITIAL_PLAYBOOK)).toBe(before);
  });
});
