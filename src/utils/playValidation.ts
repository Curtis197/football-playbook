import type {
  ActionType,
  PathAction,
  Play,
  PlayCategory,
  PlaybookFile,
  Player,
  PlayerShape,
  Point,
  Side
} from '../types/playbook';

export const PLAYBOOK_VERSION = '1.0.0';

const SIDES: readonly Side[] = ['offense', 'defense'];
const SHAPES: readonly PlayerShape[] = ['round', 'square', 'rounded_square', 'none'];
const ACTION_TYPES: readonly ActionType[] = ['pass_route', 'run_block', 'motion', 'pull_block'];
const END_MARKERS: readonly PathAction['endMarker'][] = ['arrow', 'tbar', 'dot', 'none'];
const BRANCH_TYPES = ['combo', 'option'];
const CATEGORIES: readonly PlayCategory[] = ['run', 'pass_action', 'pass_dropback', 'rpo', 'screen', 'blitz_pickup'];

const PLAYER_TEXT_FIELDS = ['color', 'letterColor', 'nodeColor', 'fillColor', 'hoverColor', 'technique'];
const PLAY_TEXT_FIELDS = ['primaryRunConcept', 'primaryPassConcept', 'personnel', 'receiverAlignment', 'counterAction', 'targetFront'];

export type ValidationResult<T> =
  | { ok: true; value: T; warnings: string[] }
  | { ok: false; error: string };

class ValidationError extends Error {}

const fail = (message: string): never => {
  throw new ValidationError(message);
};

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isNum = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isStr = (value: unknown): value is string => typeof value === 'string';

function requiredText(raw: Raw, key: string, where: string): string {
  const value = raw[key];
  return isStr(value) && value.length > 0 ? value : fail(`${where}: "${key}" must be non-empty text`);
}

const textOr = (raw: Raw, key: string, fallback: string): string => (isStr(raw[key]) ? raw[key] : fallback);

function dropUnlessText(target: Raw, keys: readonly string[]): void {
  for (const key of keys) {
    if (target[key] !== undefined && !isStr(target[key])) delete target[key];
  }
}

function normalizePoint(raw: unknown, where: string): Point {
  if (!isRecord(raw) || !isNum(raw.x) || !isNum(raw.y)) {
    return fail(`${where} needs numeric x and y`);
  }
  const point: Point = { x: raw.x, y: raw.y };
  if (typeof raw.isSharp === 'boolean') point.isSharp = raw.isSharp;
  return point;
}

function normalizePlayer(raw: unknown, where: string): Player {
  if (!isRecord(raw)) return fail(`${where} must be an object`);
  if (!isNum(raw.x) || !isNum(raw.y)) return fail(`${where} needs numeric x and y`);
  if (!isStr(raw.label)) return fail(`${where}: "label" must be text`);
  if (!SIDES.includes(raw.side as Side)) return fail(`${where}: "side" must be offense or defense`);

  const player: Raw = {
    ...raw,
    id: requiredText(raw, 'id', where),
    assignmentTitle: textOr(raw, 'assignmentTitle', ''),
    assignmentNotes: textOr(raw, 'assignmentNotes', '')
  };
  if (player.shape !== undefined && !SHAPES.includes(player.shape as PlayerShape)) delete player.shape;
  dropUnlessText(player, PLAYER_TEXT_FIELDS);
  if (player.coachingKeys !== undefined) {
    if (Array.isArray(player.coachingKeys)) player.coachingKeys = player.coachingKeys.filter(isStr);
    else delete player.coachingKeys;
  }
  return player as unknown as Player;
}

function normalizeAction(raw: unknown, where: string): PathAction {
  if (!isRecord(raw)) return fail(`${where} must be an object`);
  if (!ACTION_TYPES.includes(raw.type as ActionType)) return fail(`${where}: unknown action type`);
  if (!Array.isArray(raw.points) || raw.points.length < 2) return fail(`${where} needs at least 2 points`);

  const type = raw.type as ActionType;
  const action: Raw = {
    ...raw,
    id: requiredText(raw, 'id', where),
    playerId: requiredText(raw, 'playerId', where),
    points: raw.points.map((point, i) => normalizePoint(point, `${where}.points[${i}]`)),
    endMarker: END_MARKERS.includes(raw.endMarker as PathAction['endMarker'])
      ? raw.endMarker
      : type === 'pass_route' || type === 'motion' ? 'arrow' : 'tbar'
  };
  if (action.isCurved !== undefined && typeof action.isCurved !== 'boolean') delete action.isCurved;
  dropUnlessText(action, ['label', 'color', 'parentActionId']);
  if (action.branchType !== undefined && !BRANCH_TYPES.includes(action.branchType as string)) delete action.branchType;
  return action as unknown as PathAction;
}

function buildPlay(raw: unknown, warnings: string[]): Play {
  if (!isRecord(raw)) return fail('Play must be an object');
  const id = requiredText(raw, 'id', 'Play');
  const name = requiredText(raw, 'name', 'Play');
  const label = `Play "${name}"`;

  const rawPlayers = raw.players;
  const rawActions = raw.actions;
  if (!Array.isArray(rawPlayers)) return fail(`${label}: "players" must be a list`);
  if (!Array.isArray(rawActions)) return fail(`${label}: "actions" must be a list`);

  const players = rawPlayers.map((player, i) => normalizePlayer(player, `${label}: players[${i}]`));
  const playerIds = new Set<string>();
  for (const player of players) {
    if (playerIds.has(player.id)) return fail(`${label}: duplicate player id "${player.id}"`);
    playerIds.add(player.id);
  }

  const actions: PathAction[] = [];
  rawActions.forEach((rawAction, i) => {
    const action = normalizeAction(rawAction, `${label}: actions[${i}]`);
    if (!playerIds.has(action.playerId)) {
      warnings.push(`${label}: dropped action "${action.id}" because player "${action.playerId}" does not exist`);
      return;
    }
    actions.push(action);
  });

  let category = raw.category;
  if (!CATEGORIES.includes(category as PlayCategory)) {
    warnings.push(`${label}: unknown category, set to "run"`);
    category = 'run';
  }

  const rawNotes = isRecord(raw.notes) ? raw.notes : {};
  const notes: Raw = {
    ...rawNotes,
    qbRead: textOr(rawNotes, 'qbRead', ''),
    lineBlocking: textOr(rawNotes, 'lineBlocking', ''),
    philosophyReason: textOr(rawNotes, 'philosophyReason', '')
  };
  dropUnlessText(notes, ['hotRoute', 'coachingCue']);

  const play: Raw = {
    ...raw,
    id,
    name,
    formationOffense: textOr(raw, 'formationOffense', ''),
    frontDefense: textOr(raw, 'frontDefense', ''),
    category,
    tags: Array.isArray(raw.tags) ? raw.tags.filter(isStr) : [],
    situation: Array.isArray(raw.situation) ? raw.situation.filter(isStr) : [],
    players,
    actions,
    notes
  };
  dropUnlessText(play, PLAY_TEXT_FIELDS);
  return play as unknown as Play;
}

function attempt<T>(build: (warnings: string[]) => T): ValidationResult<T> {
  const warnings: string[] = [];
  try {
    return { ok: true, value: build(warnings), warnings };
  } catch (err) {
    if (err instanceof ValidationError) return { ok: false, error: err.message };
    throw err;
  }
}

/**
 * Checks an untrusted play (import file, Firestore document, localStorage) and fills in
 * defaults for optional text/list fields so the UI never reads `undefined.length`.
 */
export function normalizePlay(raw: unknown): ValidationResult<Play> {
  return attempt(warnings => buildPlay(raw, warnings));
}

/**
 * strict: the first bad play rejects the whole file (imports).
 * lenient: bad plays are dropped and reported as warnings (data already on this device).
 */
export function normalizePlaybook(raw: unknown, mode: 'strict' | 'lenient' = 'strict'): ValidationResult<PlaybookFile> {
  return attempt(warnings => {
    if (!isRecord(raw)) return fail('Playbook must be an object');
    const book = raw;
    if (book.version !== PLAYBOOK_VERSION) {
      return fail(`Unsupported playbook version ${JSON.stringify(book.version)} (this app reads ${PLAYBOOK_VERSION})`);
    }
    const rawPlays = book.plays;
    if (!Array.isArray(rawPlays)) return fail('Playbook "plays" must be a list');

    const plays: Play[] = [];
    const seen = new Set<string>();
    rawPlays.forEach((rawPlay, i) => {
      const result = normalizePlay(rawPlay);
      if (!result.ok) {
        if (mode === 'strict') fail(`plays[${i}]: ${result.error}`);
        warnings.push(`Dropped plays[${i}]: ${result.error}`);
        return;
      }
      if (seen.has(result.value.id)) {
        if (mode === 'strict') fail(`Duplicate play id "${result.value.id}"`);
        warnings.push(`Dropped plays[${i}]: duplicate play id "${result.value.id}"`);
        return;
      }
      seen.add(result.value.id);
      plays.push(result.value);
      warnings.push(...result.warnings);
    });
    if (plays.length === 0) return fail('Playbook has no usable plays');

    return {
      ...book,
      version: PLAYBOOK_VERSION,
      title: textOr(book, 'title', 'Imported Playbook'),
      philosophySummary: textOr(book, 'philosophySummary', ''),
      plays
    } as unknown as PlaybookFile;
  });
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter(key => key !== 'updatedAt' && value[key] !== undefined)
        .map(key => [key, canonical(value[key])])
    );
  }
  return value;
}

/** Content comparison that ignores key order and the `updatedAt` stamp Firestore adds. */
export function playsEqual(a: Play, b: Play): boolean {
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
}
