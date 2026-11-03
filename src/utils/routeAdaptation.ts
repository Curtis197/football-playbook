import type { Player, PathAction, Point, RouteAdaptationMode } from '../types/playbook';
import { clampFieldCoordinates } from './geometry';

/**
 * Categorize offensive skill receivers by side and distance from sideline:
 * - Left side of Center: sorted by X ascending (lowest X is #1 Outermost, #2 Slot, #3 Inner)
 * - Right side of Center: sorted by X descending (highest X is #1 Outermost, #2 Slot, #3 Inner)
 */
export interface ReceiverDistribution {
  leftReceivers: Player[];   // [ #1 Outside, #2 Slot, #3 Inner, ... ]
  rightReceivers: Player[];  // [ #1 Outside, #2 Slot, #3 Inner, ... ]
  backfield: Player[];       // Running backs (RB, FB, HB)
  linemen: Player[];         // Offensive line (C, LG, RG, LT, RT)
  qb: Player | null;         // Quarterback
}

export function categorizeOffensivePlayers(players: Player[]): ReceiverDistribution {
  const offense = players.filter(p => p.side === 'offense');

  // Identify Center or midline reference
  let center = offense.find(p => p.label.trim().toUpperCase() === 'C');
  if (!center) {
    const onLine = offense.filter(p => p.y >= 350 && p.y <= 420);
    if (onLine.length > 0) {
      center = onLine.reduce((prev, curr) => 
        Math.abs(curr.x - 480) < Math.abs(prev.x - 480) ? curr : prev
      );
    } else {
      center = offense[0];
    }
  }
  const centerX = center ? center.x : 480;
  const losY = center ? center.y : 380;

  // Linemen: within 35 units of LOS and near center
  const linemenLabels = new Set(['C', 'OC', 'LG', 'RG', 'LT', 'RT']);
  const linemen = offense.filter(p => 
    linemenLabels.has(p.label.trim().toUpperCase()) ||
    (Math.abs(p.y - losY) <= 30 && Math.abs(p.x - centerX) <= 180)
  );
  const linemenIds = new Set(linemen.map(l => l.id));

  // QB
  const qb = offense.find(p => p.label.trim().toUpperCase() === 'QB') || null;

  // Backfield (RB, FB, HB, TB) - behind LOS not including QB
  const backfieldLabels = new Set(['RB', 'FB', 'HB', 'TB', 'B']);
  const backfield = offense.filter(p => 
    !linemenIds.has(p.id) &&
    p.id !== qb?.id &&
    (backfieldLabels.has(p.label.trim().toUpperCase()) || (p.y > losY + 40 && Math.abs(p.x - centerX) <= 120))
  );
  const backfieldIds = new Set(backfield.map(b => b.id));

  // Eligible receivers (WR, TE, Slot, Flanker, Wing)
  const receivers = offense.filter(p => 
    !linemenIds.has(p.id) &&
    p.id !== qb?.id &&
    !backfieldIds.has(p.id)
  );

  // Left receivers: sorted by X ascending (smallest X = furthest left / #1 Outside)
  const leftReceivers = receivers
    .filter(p => p.x < centerX)
    .sort((a, b) => a.x - b.x);

  // Right receivers: sorted by X descending (largest X = furthest right / #1 Outside)
  const rightReceivers = receivers
    .filter(p => p.x >= centerX)
    .sort((a, b) => b.x - a.x);

  return {
    leftReceivers,
    rightReceivers,
    backfield,
    linemen,
    qb
  };
}

/**
 * Helper to translate all points in an action by (dx, dy)
 */
export function translateActionPoints(points: Point[], dx: number, dy: number): Point[] {
  return points.map(pt => {
    const clamped = clampFieldCoordinates({
      x: Math.round(pt.x + dx),
      y: Math.round(pt.y + dy)
    });
    return {
      ...pt,
      x: clamped.x,
      y: clamped.y
    };
  });
}

/**
 * Adapts all vector routes, blocks, and motions to a newly selected offensive formation.
 * 
 * Supports two distinct modes:
 * 1. 'player_relative':
 *    Tracks the specific player (X -> X, Z -> Z, Y -> Y, etc.).
 *    Translates every waypoint in the vector by the delta (dx, dy) between the old and new player positions.
 *    The route shape, cut breaks, and stem depth remain 100% intact relative to the player.
 * 
 * 2. 'concept_numbered':
 *    Routes are mapped by receiver alignment count from outside in:
 *    - Left #1 outside receiver gets Left #1 route
 *    - Left #2 slot gets Left #2 route
 *    - Right #1 outside receiver gets Right #1 route
 *    - Right #2 slot gets Right #2 route
 *    - Right #3 inner/bunch gets Right #3 route
 *    - Linemen & backfield retain player-relative translation
 */
export function adaptRoutesToNewFormation(
  currentActions: PathAction[],
  oldPlayers: Player[],
  newOffensePlayers: Player[],
  mode: RouteAdaptationMode = 'player_relative'
): PathAction[] {
  if (currentActions.length === 0 || newOffensePlayers.length === 0) {
    return currentActions;
  }

  const oldOffense = oldPlayers.filter(p => p.side === 'offense');
  const oldDist = categorizeOffensivePlayers(oldOffense);
  const newDist = categorizeOffensivePlayers(newOffensePlayers);

  // Track parent action translation vectors so child combo blocks shift consistently
  const actionDeltaMap = new Map<string, { dx: number; dy: number }>();

  // Helper to find old player associated with an action
  const findOldPlayer = (action: PathAction): Player | null => {
    const byId = oldOffense.find(p => p.id === action.playerId);
    if (byId) return byId;

    const byLabel = oldOffense.find(p => p.label.trim().toUpperCase() === action.playerId.trim().toUpperCase());
    if (byLabel) return byLabel;

    if (action.points.length > 0) {
      const p0 = action.points[0];
      let closest: Player | null = null;
      let minDistance = Infinity;
      for (const p of oldOffense) {
        const d = Math.hypot(p.x - p0.x, p.y - p0.y);
        if (d < minDistance) {
          minDistance = d;
          closest = p;
        }
      }
      return closest;
    }
    return null;
  };

  // Process actions
  return currentActions.map(action => {
    // If this is a child combo block whose parent already moved, apply the same delta
    if (action.parentActionId && actionDeltaMap.has(action.parentActionId)) {
      const parentDelta = actionDeltaMap.get(action.parentActionId)!;
      const updatedPoints = translateActionPoints(action.points, parentDelta.dx, parentDelta.dy);
      return {
        ...action,
        points: updatedPoints
      };
    }

    const oldPlayer = findOldPlayer(action);
    let targetNewPlayer: Player | null = null;

    if (mode === 'concept_numbered' && oldPlayer) {
      // Check if old player is a receiver (Left #1/#2/#3 or Right #1/#2/#3)
      const leftIdx = oldDist.leftReceivers.findIndex(p => p.id === oldPlayer.id || p.label === oldPlayer.label);
      const rightIdx = oldDist.rightReceivers.findIndex(p => p.id === oldPlayer.id || p.label === oldPlayer.label);

      if (leftIdx !== -1) {
        // Map to same outside-in rank on the new left side
        if (newDist.leftReceivers.length > 0) {
          const clampedIdx = Math.min(leftIdx, newDist.leftReceivers.length - 1);
          targetNewPlayer = newDist.leftReceivers[clampedIdx];
        } else if (newDist.rightReceivers.length > 0) {
          // If no left receivers, wrap to opposite side
          targetNewPlayer = newDist.rightReceivers[0];
        }
      } else if (rightIdx !== -1) {
        // Map to same outside-in rank on the new right side
        if (newDist.rightReceivers.length > 0) {
          const clampedIdx = Math.min(rightIdx, newDist.rightReceivers.length - 1);
          targetNewPlayer = newDist.rightReceivers[clampedIdx];
        } else if (newDist.leftReceivers.length > 0) {
          targetNewPlayer = newDist.leftReceivers[0];
        }
      } else if (oldDist.backfield.some(p => p.id === oldPlayer.id || p.label === oldPlayer.label)) {
        // Backfield running back
        targetNewPlayer = newDist.backfield[0] || null;
      }
    }

    // Fallback to Player-Relative matching (by label or id)
    if (!targetNewPlayer && oldPlayer) {
      targetNewPlayer = 
        newOffensePlayers.find(p => p.id === oldPlayer.id) ||
        newOffensePlayers.find(p => p.label.trim().toUpperCase() === oldPlayer.label.trim().toUpperCase()) ||
        null;
    }

    // Direct fallback by action.playerId
    if (!targetNewPlayer) {
      targetNewPlayer = 
        newOffensePlayers.find(p => p.id === action.playerId) ||
        newOffensePlayers.find(p => p.label.trim().toUpperCase() === action.playerId.trim().toUpperCase()) ||
        null;
    }

    // If still not matched, find closest new offensive player to initial point
    if (!targetNewPlayer && action.points.length > 0) {
      const p0 = action.points[0];
      let closest: Player = newOffensePlayers[0];
      let minD = Infinity;
      for (const np of newOffensePlayers) {
        const d = Math.hypot(np.x - p0.x, np.y - p0.y);
        if (d < minD) {
          minD = d;
          closest = np;
        }
      }
      targetNewPlayer = closest;
    }

    if (!targetNewPlayer || action.points.length === 0) {
      return action;
    }

    // Calculate translation vector (dx, dy)
    // Anchored from the action's current origin (points[0]) to the new player's coordinate
    const dx = targetNewPlayer.x - action.points[0].x;
    const dy = targetNewPlayer.y - action.points[0].y;

    actionDeltaMap.set(action.id, { dx, dy });

    const updatedPoints = translateActionPoints(action.points, dx, dy);

    return {
      ...action,
      playerId: targetNewPlayer.id,
      points: updatedPoints
    };
  });
}
