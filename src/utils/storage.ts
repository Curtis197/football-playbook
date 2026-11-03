import type { Play, PlaybookFile } from '../types/playbook';
import { INITIAL_PLAYBOOK } from '../data/presets';

const STORAGE_KEY = 'antigravity_football_playbook_v1';

export function loadPlaybookFromStorage(): PlaybookFile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PLAYBOOK;
    const parsed = JSON.parse(raw) as PlaybookFile;
    if (parsed && Array.isArray(parsed.plays) && parsed.plays.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load playbook from localStorage, using presets:', err);
  }
  return INITIAL_PLAYBOOK;
}

export function savePlaybookToStorage(playbook: PlaybookFile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playbook, null, 2));
  } catch (err) {
    console.error('Failed to save playbook to localStorage:', err);
  }
}

/**
 * Download an object as a named JSON file
 */
export function downloadJsonFile(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download SVG element markup as a high-resolution SVG file
 */
export function downloadSvgFile(svgElement: SVGSVGElement, filename: string): void {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces if missing
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates whether an imported object matches the Play or PlaybookFile schema
 */
export function parseAndValidateImport(jsonString: string): { play?: Play; playbook?: PlaybookFile; error?: string } {
  try {
    const data = JSON.parse(jsonString);

    if (data.version && Array.isArray(data.plays)) {
      // It's a PlaybookFile
      return { playbook: data as PlaybookFile };
    }

    if (data.id && data.name && Array.isArray(data.players) && Array.isArray(data.actions)) {
      // It's an individual Play
      return { play: data as Play };
    }

    return { error: 'JSON does not conform to Play or PlaybookFile schema.' };
  } catch (err: unknown) {
    return { error: (err as Error).message || 'Invalid JSON string' };
  }
}
