import type { Player, PathAction } from '../types/playbook';
import { categorizeOffensivePlayers, translateActionPoints } from './routeAdaptation';

export type SnapAlignment = 'down_center' | 'shotgun' | 'pistol';

/**
 * Detect the current QB snap alignment based on QB Y-coordinate
 */
export function detectCurrentQBPosition(players: Player[]): SnapAlignment {
  const offense = players.filter(p => p.side === 'offense');
  const qb = offense.find(p => p.label.trim().toUpperCase() === 'QB');
  if (!qb) return 'shotgun';

  if (qb.y <= 425) {
    return 'down_center';
  } else if (qb.y <= 450) {
    return 'pistol';
  } else {
    return 'shotgun';
  }
}

export interface MorphBackfieldResult {
  players: Player[];
  actions: PathAction[];
  previousAlignment: SnapAlignment;
  newAlignment: SnapAlignment;
}

/**
 * Morphs the backfield alignment (QB & running backs) of an offensive formation
 * between Down Center, Pistol, and Shotgun while preserving the 5 offensive linemen
 * and all perimeter receiver alignments (X, Z, Y, H, slots, wings, bunch clusters).
 */
export function morphBackfieldAlignment(
  currentPlayers: Player[],
  currentActions: PathAction[],
  targetAlignment: SnapAlignment,
  sidecarSide: 'right' | 'left' = 'right'
): MorphBackfieldResult {
  const previousAlignment = detectCurrentQBPosition(currentPlayers);
  if (previousAlignment === targetAlignment) {
    return {
      players: currentPlayers,
      actions: currentActions,
      previousAlignment,
      newAlignment: targetAlignment
    };
  }

  const distribution = categorizeOffensivePlayers(currentPlayers);
  const qb = distribution.qb;
  const backs = distribution.backfield;

  if (!qb) {
    return {
      players: currentPlayers,
      actions: currentActions,
      previousAlignment,
      newAlignment: targetAlignment
    };
  }

  // Find Center midline
  const center = currentPlayers.find(p => p.side === 'offense' && p.label.trim().toUpperCase() === 'C');
  const centerX = center ? center.x : 480;
  const losY = center ? center.y : 380;

  // Track position deltas per player for action translation
  const playerDeltas = new Map<string, { dx: number; dy: number }>();

  // Helper to record new player position
  const updatedCoords = new Map<string, { x: number; y: number }>();
  const movePlayer = (player: Player, newX: number, newY: number) => {
    playerDeltas.set(player.id, { dx: newX - player.x, dy: newY - player.y });
    updatedCoords.set(player.id, { x: newX, y: newY });
  };

  // 1. Calculate Target QB Coordinates
  let targetQBY = losY + 85; // Default shotgun (y=465)
  if (targetAlignment === 'down_center') {
    targetQBY = losY + 35; // y=415
  } else if (targetAlignment === 'pistol') {
    targetQBY = losY + 60; // y=440
  }
  movePlayer(qb, centerX, targetQBY);

  // 2. Calculate Target Running Back(s) Coordinates
  if (backs.length === 1) {
    // ----------------------------------------------------
    // Single-Back (Ace, Deuce, 11/10 Spread, etc.)
    // ----------------------------------------------------
    const rb = backs[0];
    if (targetAlignment === 'down_center') {
      // Under center: Singleback directly behind QB at 6-7 yards depth
      movePlayer(rb, centerX, losY + 120); // y=500
    } else if (targetAlignment === 'pistol') {
      // Pistol: Directly stacked behind QB at 7 yards depth
      movePlayer(rb, centerX, losY + 140); // y=520
    } else {
      // Shotgun: Sidecar flanking QB
      const offsetDirection = sidecarSide === 'left' ? -60 : 55;
      movePlayer(rb, centerX + offsetDirection, losY + 85); // y=465
    }
  } else if (backs.length === 2) {
    // ----------------------------------------------------
    // Two-Back (Pro-I, Split Backs, 21 / 20 / 22 Personnel)
    // ----------------------------------------------------
    // Sort backs by initial Y to identify FB (closer) and TB/HB (deeper)
    const sortedBacks = [...backs].sort((a, b) => a.y - b.y);
    const fb = sortedBacks[0];
    const tb = sortedBacks[1];

    if (targetAlignment === 'down_center') {
      // Under center: FB at 4-5 yards, TB at 7-8 yards
      const fbXOffset = Math.abs(fb.x - centerX) > 20 ? fb.x : centerX;
      movePlayer(fb, fbXOffset, losY + 85); // y=465
      movePlayer(tb, centerX, losY + 145);  // y=525
    } else if (targetAlignment === 'pistol') {
      // Pistol: FB offset or stacked at 4.5 yards, TB deep at 7.5 yards
      const fbXOffset = Math.abs(fb.x - centerX) > 20 ? fb.x : centerX;
      movePlayer(fb, fbXOffset, losY + 105); // y=485
      movePlayer(tb, centerX, losY + 165);  // y=545
    } else {
      // Shotgun: Dual split sidecars flanking the QB
      movePlayer(fb, centerX - 60, losY + 85); // Left sidecar
      movePlayer(tb, centerX + 60, losY + 85); // Right sidecar
    }
  } else if (backs.length >= 3) {
    // ----------------------------------------------------
    // Three-Back / Full House / Wishbone / Diamond
    // ----------------------------------------------------
    // Shift all backs by the vertical delta of the QB
    const dy = targetQBY - qb.y;
    backs.forEach(b => {
      movePlayer(b, b.x, b.y + dy);
    });
  }

  // 3. Update Players Array
  const updatedPlayers = currentPlayers.map(p => {
    const coords = updatedCoords.get(p.id);
    if (!coords) return p;
    return {
      ...p,
      x: coords.x,
      y: coords.y
    };
  });

  // 4. Translate Associated Vector Actions (Routes, Blocks, Motion)
  const updatedActions = currentActions.map(action => {
    const delta = playerDeltas.get(action.playerId);
    if (!delta || (delta.dx === 0 && delta.dy === 0)) {
      return action;
    }
    return {
      ...action,
      points: translateActionPoints(action.points, delta.dx, delta.dy)
    };
  });

  return {
    players: updatedPlayers,
    actions: updatedActions,
    previousAlignment,
    newAlignment: targetAlignment
  };
}
