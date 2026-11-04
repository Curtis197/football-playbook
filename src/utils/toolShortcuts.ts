import type { CanvasMode } from '../types/playbook';

/** One-key shortcuts for the drawing tools, shown on the left rail. Keys are matched case-insensitively. */
export const TOOL_SHORTCUTS: Record<CanvasMode, string> = {
  select: 'V',
  draw_route: 'R',
  draw_block: 'B',
  draw_motion: 'M',
  add_offense: 'O',
  add_defense: 'D'
};

const TOOL_BY_KEY = new Map<string, CanvasMode>(
  (Object.entries(TOOL_SHORTCUTS) as [CanvasMode, string][]).map(([tool, key]) => [key.toLowerCase(), tool])
);

/** The tool a pressed key selects, or null when the key is not a tool shortcut. */
export function toolForKey(key: string): CanvasMode | null {
  return TOOL_BY_KEY.get(key.toLowerCase()) ?? null;
}
