import type { Play, Player, PlayerPosition } from '../types/playbook';

export function offensePlayer(id: string, label: string, position: PlayerPosition, x: number, y: number): Player {
  return { id, label, side: 'offense', position, x, y, assignmentTitle: '', assignmentNotes: '' };
}

export function defensePlayer(
  id: string, label: string, position: PlayerPosition, x: number, y: number, technique?: string
): Player {
  return { id, label, side: 'defense', position, x, y, assignmentTitle: '', assignmentNotes: '', technique };
}

/** Strong side right: five linemen at 60px spacing, a TE on the right, QB and one RB behind. */
export const OFFENSE_TE_RIGHT: Player[] = [
  offensePlayer('LT', 'LT', 'OL', 360, 380),
  offensePlayer('LG', 'LG', 'OL', 420, 380),
  offensePlayer('C', 'C', 'OL', 480, 380),
  offensePlayer('RG', 'RG', 'OL', 540, 380),
  offensePlayer('RT', 'RT', 'OL', 600, 380),
  offensePlayer('TE', 'Y', 'TE', 660, 380),
  offensePlayer('QB', 'QB', 'QB', 480, 440),
  offensePlayer('RB', 'RB', 'RB', 480, 480)
];

/** 4-3 Over: four down linemen on the LOS-side (y 340) and three linebackers at y 300. */
export const FOUR_THREE_OVER: Player[] = [
  defensePlayer('DE_L', 'DE', 'DL', 330, 340, '5-Tech Weak'),
  defensePlayer('DT_L', 'DT', 'DL', 450, 340, '1-Tech Weak'),
  defensePlayer('DT_R', 'DT', 'DL', 570, 340, '3-Tech Strong'),
  defensePlayer('DE_R', 'DE', 'DL', 660, 340, '6-Tech Strong'),
  defensePlayer('W', 'W', 'LB', 390, 300),
  defensePlayer('M', 'M', 'LB', 490, 300),
  defensePlayer('S', 'S', 'LB', 600, 300)
];

export function makePlay(overrides: Partial<Play> = {}): Play {
  return {
    id: 'p1', name: 'Test play', formationOffense: '', frontDefense: '', category: 'run',
    tags: [], situation: [],
    players: [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER], actions: [],
    notes: { qbRead: '', lineBlocking: '', philosophyReason: '' },
    ...overrides
  };
}
