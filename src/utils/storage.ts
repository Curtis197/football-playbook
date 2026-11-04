import type { Play, PlaybookFile } from '../types/playbook';
import { INITIAL_PLAYBOOK } from '../data/presets';
import { normalizePlay, normalizePlaybook } from './playValidation';

const STORAGE_KEY = 'antigravity_football_playbook_v1';
const UNREADABLE_BACKUP_KEY = `${STORAGE_KEY}_unreadable_backup`;
const PRE_UPGRADE_BACKUP_KEY = `${STORAGE_KEY}_schema_1_0_0_backup`;
const WISHBONE_PLAY_ID = 'play-wishbone-zone-glance';

// Schema upgrades rewrite stored data on the next autosave, so keep the old file once.
function keepPreUpgradeCopy(raw: string): void {
  try {
    if (localStorage.getItem(PRE_UPGRADE_BACKUP_KEY) === null) localStorage.setItem(PRE_UPGRADE_BACKUP_KEY, raw);
  } catch (err) {
    console.warn('Could not keep a pre-upgrade copy of the playbook:', err);
  }
}

let loadNotice: string | null = null;

/** Message about data the last load had to repair or set aside; returns it once. */
export function takeStorageLoadNotice(): string | null {
  const notice = loadNotice;
  loadNotice = null;
  return notice;
}

// Keeps the original text so the next autosave cannot overwrite data we failed to read or replaced.
function setAsideOriginal(raw: string, notice: string): void {
  loadNotice = notice;
  try {
    localStorage.setItem(UNREADABLE_BACKUP_KEY, raw);
  } catch (err) {
    console.warn('Could not keep a copy of the original playbook:', err);
  }
}

const UNREADABLE_NOTICE = 'Saved plays could not be read, so the default playbook was loaded. The original is kept in browser storage.';

export function loadPlaybookFromStorage(): PlaybookFile {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PLAYBOOK;
    const data: unknown = JSON.parse(raw);
    if (typeof data === 'object' && data !== null && (data as { version?: unknown }).version === '1.0.0') {
      keepPreUpgradeCopy(raw);
    }
    const result = normalizePlaybook(data, 'lenient');
    if (!result.ok) {
      console.warn('Stored playbook is unusable, using presets:', result.error);
      setAsideOriginal(raw, UNREADABLE_NOTICE);
      return INITIAL_PLAYBOOK;
    }

    const parsed = result.value;
    if (result.warnings.length > 0) {
      console.warn('Repaired stored playbook:', result.warnings);
      setAsideOriginal(raw, `Some saved plays were repaired or skipped (${result.warnings.length}). The original is kept in browser storage.`);
    }

    // Auto-migrate legacy cramped defensive coordinates if present in default wishbone play
    let migrated = false;
    const currentWishbone = INITIAL_PLAYBOOK.plays.find(play => play.id === WISHBONE_PLAY_ID);
    parsed.plays = parsed.plays.map(play => {
      if (currentWishbone && play.id === WISHBONE_PLAY_ID) {
        const nt = play.players.find(p => p.id === 'def_nt' && p.side === 'defense');
        if (nt && nt.y >= 345) {
          migrated = true;
          return currentWishbone;
        }
      }
      return play;
    });
    if (migrated) {
      setAsideOriginal(raw, 'The Wishbone play used outdated defender positions and was replaced with the updated default. The original is kept in browser storage.');
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load playbook from localStorage, using presets:', err);
    if (raw) setAsideOriginal(raw, UNREADABLE_NOTICE);
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

export type BackupOutcome = 'saved' | 'empty' | 'failed';

/** Downloads exactly what is stored on this device, without re-parsing it. */
export function downloadStoredPlaybookBackup(): BackupOutcome {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'empty';
    triggerDownload(new Blob([raw], { type: 'application/json' }), 'playbook_local_backup.json');
    return 'saved';
  } catch (err) {
    console.error('Could not back up the stored playbook:', err);
    return 'failed';
  }
}

export function clearStoredPlaybook(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Could not clear the stored playbook:', err);
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download an object as a named JSON file
 */
export function downloadJsonFile(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
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
  triggerDownload(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

/**
 * Validates an imported file as a Play or a PlaybookFile and fills in safe defaults,
 * so a malformed file is rejected with a reason instead of crashing the editor later.
 */
export function parseAndValidateImport(
  jsonString: string
): { play?: Play; playbook?: PlaybookFile; error?: string; warnings?: string[] } {
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    return { error: err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON string' };
  }
  if (typeof data !== 'object' || data === null) {
    return { error: 'JSON must be a play or a playbook object.' };
  }

  const candidate = data as Record<string, unknown>;
  if (Array.isArray(candidate.plays)) {
    const result = normalizePlaybook(data, 'strict');
    return result.ok ? { playbook: result.value, warnings: result.warnings } : { error: result.error };
  }
  if (Array.isArray(candidate.players) && Array.isArray(candidate.actions)) {
    const result = normalizePlay(data);
    return result.ok ? { play: result.value, warnings: result.warnings } : { error: result.error };
  }
  return { error: 'JSON does not conform to Play or PlaybookFile schema.' };
}
