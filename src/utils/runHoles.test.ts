import { describe, it, expect } from 'vitest';
import { callPlaySide, isValidCall, holeX, holeName, holeAfterPicking, runnerPlayer, leadBack, gapIdOf, gapLabel } from './runHoles';
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

describe('runner numbers with the labels real formations use', () => {
  const back = (id: string, label: string, y: number) => offensePlayer(id, label, 'RB', 480, y);
  const line = OFFENSE_TE_RIGHT.filter(p => p.position !== 'RB');
  const ids = (players: ReturnType<typeof back>[]) =>
    [1, 2, 3, 4].map(n => runnerPlayer([...line, ...players], n)?.id);

  it('maryland I (FB1, FB2, TB): all three backs are reachable', () => {
    expect(ids([back('FB1', 'FB1', 460), back('FB2', 'FB2', 470), back('TB', 'TB', 520)])).toEqual(['QB', 'FB1', 'TB', 'FB2']);
  });

  it('full house with unlabelled halfbacks (H1, H2, TB)', () => {
    expect(ids([back('H1', 'H1', 470), back('H2', 'H2', 480), back('TB', 'TB', 520)])).toEqual(['QB', 'H1', 'TB', 'H2']);
  });

  it('two numbered backs (RB1, RB2): runner 4 does not repeat runner 2', () => {
    const result = ids([back('RB1', 'RB1', 470), back('RB2', 'RB2', 500)]);
    expect(result).toEqual(['QB', 'RB1', 'RB2', undefined]);
  });

  it('one back: he is runner 2 and 3, and there is no runner 4', () => {
    expect(ids([back('RB1', 'RB1', 470)])).toEqual(['QB', 'RB1', 'RB1', undefined]);
  });

  it('draws no lead when the runner does not exist', () => {
    expect(leadBack([...OFFENSE_TE_RIGHT, FULLBACK], 4)).toBeUndefined();
    expect(leadBack([...line, back('RB1', 'RB1', 470)], 3)).toBeUndefined();
  });
});

describe('choosing a template in the picker', () => {
  const zone = { id: 'run-inside-zone', defaultHole: 3 };
  const outside = { id: 'run-outside-zone', defaultHole: 5 };

  it('takes the template default hole when it is a different template', () => {
    expect(holeAfterPicking(outside, 'run-inside-zone', 1)).toBe(5);
    expect(holeAfterPicking(outside, undefined, 1)).toBe(5);
  });

  it('keeps the play hole when the template is the one already on the play', () => {
    expect(holeAfterPicking(zone, 'run-inside-zone', 1)).toBe(1);
  });

  it('keeps the hole when the template has no default', () => {
    expect(holeAfterPicking({ id: 'mine' }, undefined, 6)).toBe(6);
  });
});
