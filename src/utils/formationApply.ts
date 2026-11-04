import type { Formation, Play, Player, RouteAdaptationMode, Side } from '../types/playbook';
import { analyzeOffense, inferDefenderTechnique, realignAllDefenders } from './defensiveAlignment';
import { adaptRoutesToNewFormation } from './routeAdaptation';
import { detectCurrentQBPosition } from './formationBackfield';

/**
 * Everything that puts a formation on a play, or captures a play's alignment as a formation, lives here.
 * Pure functions: the pickers, the formations drawer and the cloud menu all call these.
 */

export interface ApplyFormationOptions {
  routeMode: RouteAdaptationMode;
  /** Carry the play's routes onto the new alignment (true) or clear them (false). Only used when offense changes. */
  keepRoutes: boolean;
}

// A formation flagged with one side contributes all its players to that side, even a mislabelled one.
function playersOnSide(formation: Formation, side: Side): Player[] {
  return formation.players.filter(p => formation.side === side || p.side === side);
}

/** False when the formation has nothing for the side(s) it covers, so applying it would only clear the board. */
export function formationHasPlayers(formation: Formation): boolean {
  if (formation.side === 'offense') return playersOnSide(formation, 'offense').length > 0;
  if (formation.side === 'defense') return playersOnSide(formation, 'defense').length > 0;
  return formation.players.length > 0;
}

/**
 * Applies a template to a play:
 * - offense: new offense, routes adapted (or cleared), existing defenders re-aligned to the new structure
 * - defense: new defenders pre-aligned to the play's current offense; routes untouched
 * - both: players replaced as stored, routes adapted (or cleared)
 * The play is linked to the template it came from.
 */
export function applyFormationToPlay(play: Play, formation: Formation, options: ApplyFormationOptions): Play {
  if (!formationHasPlayers(formation)) return play;

  if (formation.side === 'defense') {
    const defenders = playersOnSide(formation, 'defense');
    const offense = play.players.filter(p => p.side !== 'defense');
    const aligned = realignAllDefenders(defenders, analyzeOffense(play.players));
    return {
      ...play,
      frontDefense: formation.name,
      frontDefenseId: formation.id,
      players: [...offense, ...aligned]
    };
  }

  const newOffense = playersOnSide(formation, 'offense');
  const actions = options.keepRoutes
    ? adaptRoutesToNewFormation(play.actions, play.players, newOffense, options.routeMode)
    : [];

  if (formation.side === 'both') {
    return {
      ...play,
      formationOffense: formation.name,
      formationOffenseId: formation.id,
      frontDefense: formation.name,
      frontDefenseId: formation.id,
      players: [...newOffense, ...playersOnSide(formation, 'defense')],
      actions
    };
  }

  const currentDefenders = play.players.filter(p => p.side === 'defense');
  const aligned = realignAllDefenders(currentDefenders, analyzeOffense(newOffense));
  return {
    ...play,
    formationOffense: formation.name,
    formationOffenseId: formation.id,
    players: [...newOffense, ...aligned],
    actions
  };
}

/**
 * The players a template should store for a side. Defenders always carry a technique so the front can be
 * re-aligned to a different offense later; an explicit technique is never overwritten.
 */
export function captureFormationPlayers(players: Player[], side: Side | 'both'): Player[] {
  if (side === 'both') return players;
  const onSide = players.filter(p => p.side === side);
  if (side === 'offense') return onSide;
  // Capture keeps every defender exactly where the coach placed them; only the technique is filled in
  const structure = analyzeOffense(players);
  return onSide.map(p => ({ ...p, technique: inferDefenderTechnique(p, structure) }));
}

/**
 * Builds the template record for "save this play's offense / front as a formation".
 * An existing template keeps every field it already had (QB alignment, receiver sets, tags, ...);
 * only the players, QB alignment and edit time are refreshed.
 */
export function buildFormationFromPlay(play: Play, side: 'offense' | 'defense', existing: Formation | undefined): Formation {
  const isOffense = side === 'offense';
  const players = captureFormationPlayers(play.players, side);
  const label = isOffense ? play.formationOffense : play.frontDefense;
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const defensiveLinemen = players.filter(p => p.position === 'DL').length;

  return {
    personnel: isOffense ? '11 Personnel' : 'Base Defense',
    labels: isOffense ? ['Offense', 'Custom'] : ['Defense Front', 'Custom'],
    ...existing,
    id: existing?.id ?? `${isOffense ? 'formation' : 'front'}-${slug}-${Date.now().toString().slice(-4)}`,
    name: label || (isOffense ? 'Custom Offensive Formation' : 'Custom Defensive Front'),
    side,
    description: existing?.description
      || `${isOffense ? 'Offensive formation' : 'Defensive front'} saved from play "${play.name}"`,
    style: existing?.style
      || (isOffense
        ? (play.tags?.includes('spread') ? 'spread' : play.tags?.includes('old_school') ? 'old_school' : 'pro_style')
        : (defensiveLinemen >= 4 ? 'even_front' : 'odd_front')),
    qbPosition: isOffense ? detectCurrentQBPosition(players) : existing?.qbPosition,
    players,
    updatedAt: new Date().toISOString()
  };
}
