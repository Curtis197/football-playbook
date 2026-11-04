import { describe, it, expect } from 'vitest';
import { callPlaySide, isValidCall, holeX, holeName, runnerPlayer, leadBack, gapIdOf, gapLabel } from './runHoles';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, FULLBACK, offensePlayer } from '../test/fixtures';

const holes = (players = OFFENSE_TE_RIGHT) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map(h => holeX(players, h));
const EXPECTED = [480, 510, 450, 570, 390, 630, 330, 690, 270];

describe('holeX', () => {
  it('puts each hole between its two line bodies', () => {
    expect(holes()).toEqual(EXPECTED);
  });

  it('gives the same holes with no tight end (virtual bodies 60 apart)', () => {
    expect(holes(OFFENSE_TE_RIGHT.filter(p => p.id !== 'TE'))).toEqual(EXPECTED);
  });

  it('ignores a tight end that is not attached (more than 90 from the tackle)', () => {
    const flex = OFFENSE_TE_RIGHT.map(p => (p.id === 'TE' ? { ...p, x: 720 } : p));
    expect(holes(flex)).toEqual(EXPECTED);
  });

  it('still has eight holes with only four linemen', () => {
    const fourOl = OFFENSE_TE_RIGHT.filter(p => p.id !== 'TE' && p.id !== 'LT');
    expect(holes(fourOl)).toHaveLength(9);
    expect(holes(fourOl).every(Number.isFinite)).toBe(true);
  });
});

describe('call', () => {
  it('takes the play side from the hole parity', () => {
    expect(callPlaySide({ hole: 3, runner: 3 })).toBe('right');
    expect(callPlaySide({ hole: 4, runner: 3 })).toBe('left');
    expect(callPlaySide({ hole: 0, runner: 3, side: 'left' })).toBe('left');
    expect(callPlaySide({ hole: 0, runner: 3 })).toBe('right');
  });

  it('validates hole, runner and the hole-0 side', () => {
    expect(isValidCall({ hole: 3, runner: 3 })).toBe(true);
    expect(isValidCall({ hole: 0, runner: 2, side: 'left' })).toBe(true);
    expect(isValidCall({ hole: 0, runner: 2 })).toBe(false);
    expect(isValidCall({ hole: 9, runner: 3 })).toBe(false);
    expect(isValidCall({ hole: 3, runner: 5 })).toBe(false);
    expect(isValidCall({ hole: 2.5, runner: 3 })).toBe(false);
  });
});

describe('runner and lead back', () => {
  const withFb = [...OFFENSE_TE_RIGHT, FULLBACK];

  it('maps runner numbers to players', () => {
    expect(runnerPlayer(OFFENSE_TE_RIGHT, 1)?.id).toBe('QB');
    expect(runnerPlayer(OFFENSE_TE_RIGHT, 3)?.id).toBe('RB');
    expect(runnerPlayer(withFb, 2)?.id).toBe('FB');
    expect(runnerPlayer(withFb, 3)?.id).toBe('RB');
    expect(runnerPlayer(OFFENSE_TE_RIGHT, 4)).toBeUndefined();
  });

  it('picks the lead back that is not the runner', () => {
    expect(leadBack(withFb, 3)?.id).toBe('FB');
    expect(leadBack(withFb, 2)?.id).toBe('RB');
    expect(leadBack(OFFENSE_TE_RIGHT, 3)).toBeUndefined();
    expect(leadBack(OFFENSE_TE_RIGHT, 1)?.id).toBe('RB');
  });

  it('fills runner 4 with a third back', () => {
    const third = offensePlayer('WB', 'WB', 'RB', 540, 460);
    expect(runnerPlayer([...withFb, third], 4)?.id).toBe('WB');
  });
});

describe('gap ids', () => {
  const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];
  const idOf = (id: string) => gapIdOf(players.find(p => p.id === id)!, players);

  it('names a defender by the nearest hole', () => {
    expect(idOf('DT_R')).toEqual({ hole: 3, gap: 'B', side: 'right' });
    expect(idOf('DT_L')).toEqual({ hole: 2, gap: 'A', side: 'left' });
    expect(idOf('DE_L')).toEqual({ hole: 6, gap: 'C', side: 'left' });
    expect(idOf('DE_R').hole).toBe(5);
  });

  it('calls hole 0 the center', () => {
    const nose = { ...FOUR_THREE_OVER[0], id: 'NT', x: 480 };
    expect(gapIdOf(nose, [...OFFENSE_TE_RIGHT, nose])).toEqual({ hole: 0, gap: 'A', side: 'center' });
  });

  it('labels a gap for the coach', () => {
    expect(gapLabel(idOf('DT_R'))).toBe('B gap, right');
    expect(gapLabel({ hole: 0, gap: 'A', side: 'center' })).toBe('A gap, center');
  });
});

describe('holeName', () => {
  it('says where a hole is in words', () => {
    expect(holeName(0)).toBe('over the center');
    expect(holeName(1)).toBe('A gap, right');
    expect(holeName(4)).toBe('B gap, left');
    expect(holeName(7)).toBe('D gap, right');
  });
});
