import { describe, expect, it } from 'vitest';
import { TOOL_SHORTCUTS, toolForKey } from './toolShortcuts';
import type { CanvasMode } from '../types/playbook';

const TOOLS: CanvasMode[] = ['select', 'draw_route', 'draw_block', 'draw_motion', 'add_offense', 'add_defense'];

describe('tool shortcuts', () => {
  it('every tool has exactly one single-letter key', () => {
    expect(Object.keys(TOOL_SHORTCUTS).sort()).toEqual([...TOOLS].sort());
    for (const key of Object.values(TOOL_SHORTCUTS)) expect(key).toMatch(/^[A-Z]$/);
  });

  it('no two tools share a key', () => {
    const keys = Object.values(TOOL_SHORTCUTS);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each([
    ['v', 'select'], ['r', 'draw_route'], ['b', 'draw_block'], ['m', 'draw_motion'], ['o', 'add_offense'], ['d', 'add_defense']
  ] as const)('%s selects %s', (key, tool) => {
    expect(toolForKey(key)).toBe(tool);
  });

  it('ignores case, so Caps Lock does not break it', () => {
    expect(toolForKey('R')).toBe('draw_route');
    expect(toolForKey('d')).toBe(toolForKey('D'));
  });

  it('ignores everything that is not a tool key', () => {
    for (const key of ['a', 'z', '1', 'Escape', 'Enter', 'Shift', ' ', '', 'Backspace', 'ArrowLeft']) expect(toolForKey(key), key).toBeNull();
  });

  it('keeps clear of the undo/redo shortcuts (Z and Y) and of Escape/Enter used while drawing', () => {
    const keys = Object.values(TOOL_SHORTCUTS);
    for (const reserved of ['Z', 'Y']) expect(keys).not.toContain(reserved);
  });
});
