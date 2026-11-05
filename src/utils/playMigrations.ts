import type { Formation, Play, Player, PlayerPosition, Side } from '../types/playbook';

/**
 * Schema upgrades for plays and formations. Everything here is pure and idempotent, so it can run on
 * every read (localStorage, imports, Firestore) without ever changing already-upgraded data.
 *
 * 1.0.0 -> 1.1.0
 *  - Player.position is stored instead of being guessed from labels at every use.
 *  - Play.formationOffenseId / frontDefenseId link to Formation templates (names stay as display labels).
 *  - Play.targetFront is folded into Play.frontDefense (they described the same thing).
 */

const OFFENSE_LINE_LABELS = new Set(['C', 'OC', 'LG', 'RG', 'LT', 'RT', 'G', 'T', 'OL']);
const BACK_LABELS = new Set(['RB', 'HB', 'TB', 'FB', 'B']);
const DEFENSE_LINE_LABELS = new Set(['NT', 'DT', 'DE', 'E', 'DL']);
const LINEBACKER_LABELS = new Set(['W', 'M', 'MIKE', 'WILL', 'MLB', 'OLB', 'ILB', 'WLB', 'SLB']);
// "S" is deliberately absent: it is Sam (linebacker) in some schemes and Safety in others.
const DEFENSIVE_BACK_LABELS = new Set(['CB', 'FS', 'SS', 'NB', 'NK', 'DB', 'SAF']);

// Same thresholds the route classifier always used, now applied once instead of on every call.
const BACKFIELD_MIN_DEPTH = 40;
const BACKFIELD_MAX_OFFSET = 120;
const ATTACHED_MAX_DEPTH = 30;
const ATTACHED_MAX_OFFSET = 180;

export interface OffenseReference {
  centerX: number;
  losY: number;
}

export function getOffenseReference(players: Player[]): OffenseReference {
  const offense = players.filter(p => p.side === 'offense');
  let center = offense.find(p => p.label.trim().toUpperCase() === 'C');
  if (!center) {
    const onLine = offense.filter(p => p.y >= 350 && p.y <= 420);
    center = onLine.length > 0
      ? onLine.reduce((prev, curr) => (Math.abs(curr.x - 480) < Math.abs(prev.x - 480) ? curr : prev))
      : offense[0];
  }
  return { centerX: center ? center.x : 480, losY: center ? center.y : 380 };
}

export function inferOffensePosition(player: Player, ref: OffenseReference): PlayerPosition {
  const label = player.label.trim().toUpperCase();
  if (label === 'QB') return 'QB';
  if (OFFENSE_LINE_LABELS.has(label)) return 'OL';
  if (BACK_LABELS.has(label)) return 'RB';
  if (label === 'TE') return 'TE';

  // Skill labels such as X, Y, Z, H, F mean different things per scheme, so use where the player stands.
  const depth = player.y - ref.losY;
  const offset = Math.abs(player.x - ref.centerX);
  if (depth > BACKFIELD_MIN_DEPTH && offset <= BACKFIELD_MAX_OFFSET) return 'RB';
  if (Math.abs(depth) <= ATTACHED_MAX_DEPTH && offset <= ATTACHED_MAX_OFFSET) return 'TE';
  return 'WR';
}

export function inferDefensePosition(player: Player): PlayerPosition | undefined {
  const label = player.label.trim().toUpperCase();
  if (DEFENSE_LINE_LABELS.has(label)) return 'DL';
  if (LINEBACKER_LABELS.has(label)) return 'LB';
  if (DEFENSIVE_BACK_LABELS.has(label)) return 'DB';
  // Labels such as S (Sam or safety), BD (Bandit), JK (Jack) and ST (Stud) mean different things per scheme,
  // so where he lines up decides: the technique names the level.
  return positionFromTechnique(player.technique);
}

/** DB techniques first (a "Single-High FS" is never a stack), then stand-up linebacker techniques, then lineman techniques. */
function positionFromTechnique(technique: string | undefined): PlayerPosition | undefined {
  if (!technique) return undefined;
  if (/(CB|Safety|Single-High|Robber|Nickel|Slot)/i.test(technique)) return 'DB';
  if (/(Stack|Apex)/i.test(technique)) return 'LB';
  if (/^\d+i?-Tech/i.test(technique)) return 'DL';
  return undefined;
}

/** The stored position when there is one, otherwise the inferred one. */
export function resolveOffensePosition(player: Player, ref: OffenseReference): PlayerPosition {
  return player.position ?? inferOffensePosition(player, ref);
}

export function upgradePlayers(players: Player[]): Player[] {
  const ref = getOffenseReference(players);
  return players.map(player => {
    if (player.position) return player;
    const position = player.side === 'offense' ? inferOffensePosition(player, ref) : inferDefensePosition(player);
    return position ? { ...player, position } : player;
  });
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
const onSide = (formation: Formation, side: Side) => formation.side === side || formation.side === 'both';

/** Id first, then exact (case-insensitive) name. No fuzzy matching: a wrong guess is worse than no link. */
export function resolveFormation(
  formations: Formation[],
  side: Side,
  id: string | undefined,
  name: string | undefined
): Formation | undefined {
  const candidates = formations.filter(f => onSide(f, side));
  if (id) {
    const byId = candidates.find(f => f.id === id);
    if (byId) return byId;
  }
  if (name) return candidates.find(f => sameName(f.name, name));
  return undefined;
}

// Migration-only: reproduces the old "contains either way" picker so existing plays keep the template they showed.
function findLegacyFormation(formations: Formation[], side: Side, name: string): Formation | undefined {
  const exact = resolveFormation(formations, side, undefined, name);
  if (exact) return exact;
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return formations.filter(f => onSide(f, side)).find(f => {
    const candidate = f.name.toLowerCase();
    return candidate.includes(needle) || needle.includes(candidate);
  });
}

export function upgradePlay(play: Play, formations: Formation[]): Play {
  const legacy = play as Play & { targetFront?: string };
  const { targetFront, ...rest } = legacy;
  const upgraded: Play = { ...rest, players: upgradePlayers(play.players) };

  if (!upgraded.frontDefense && targetFront) upgraded.frontDefense = targetFront;

  if (!upgraded.formationOffenseId && upgraded.formationOffense) {
    const match = findLegacyFormation(formations, 'offense', upgraded.formationOffense);
    if (match) upgraded.formationOffenseId = match.id;
  }
  if (!upgraded.frontDefenseId && upgraded.frontDefense) {
    const match = findLegacyFormation(formations, 'defense', upgraded.frontDefense);
    if (match) upgraded.frontDefenseId = match.id;
  }
  return upgraded;
}

export function upgradeFormation(formation: Formation): Formation {
  return { ...formation, players: upgradePlayers(formation.players) };
}

/** Which copy of a play is newer, when both carry an edit time. */
export function newerCopy(local: Play, remote: Play): 'local' | 'remote' | 'unknown' {
  const localTime = local.updatedAt ? Date.parse(local.updatedAt) : NaN;
  const remoteTime = remote.updatedAt ? Date.parse(remote.updatedAt) : NaN;
  if (Number.isNaN(localTime) || Number.isNaN(remoteTime) || localTime === remoteTime) return 'unknown';
  return localTime > remoteTime ? 'local' : 'remote';
}
