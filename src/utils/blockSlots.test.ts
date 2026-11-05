import { describe, it, expect } from 'vitest';
import { assignBlockSlots, hasClearStrength, firstLevelDefenders, secondLevelDefenders, resolveStrongSide } from './blockSlots';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, defensePlayer } from '../test/fixtures';

const idsOf = (slots: ReturnType<typeof assignBlockSlots>) =>
  Object.fromEntries(Object.entries(slots).map(([slot, p]) => [slot, p?.id]));

describe('assignBlockSlots', () => {
  it('maps slots relative to a right play side', () => {
    expect(idsOf(assignBlockSlots(OFFENSE_TE_RIGHT, 'right'))).toEqual({
      te_ps: 'TE', ot_ps: 'RT', og_ps: 'RG', c: 'C', og_bs: 'LG', ot_bs: 'LT'
    });
  });

  it('mirrors for a left play side, so the right TE becomes the backside TE', () => {
    expect(idsOf(assignBlockSlots(OFFENSE_TE_RIGHT, 'left'))).toEqual({
      te_bs: 'TE', ot_ps: 'LT', og_ps: 'LG', c: 'C', og_bs: 'RG', ot_bs: 'RT'
    });
  });

  it('leaves slots absent when players are missing (no TE, four OL)', () => {
    const noTeFourOl = OFFENSE_TE_RIGHT.filter(p => p.id !== 'TE' && p.id !== 'LT');
    const slots = idsOf(assignBlockSlots(noTeFourOl, 'right'));
    expect(slots.te_ps).toBeUndefined();
    expect(slots.te_bs).toBeUndefined();
    expect(slots.ot_bs).toBeUndefined();
    expect(slots.ot_ps).toBe('RT');
  });
});

describe('strength and levels', () => {
  it('has a clear strength with a TE on one side only', () => {
    expect(hasClearStrength(OFFENSE_TE_RIGHT)).toBe(true);
    expect(resolveStrongSide(OFFENSE_TE_RIGHT)).toBe('right');
  });

  it('has no clear strength once the TE is removed', () => {
    expect(hasClearStrength(OFFENSE_TE_RIGHT.filter(p => p.id !== 'TE'))).toBe(false);
  });

  it('splits defenders into first and second level', () => {
    const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];
    expect(firstLevelDefenders(players).map(p => p.id)).toEqual(['DE_L', 'DT_L', 'DT_R', 'DE_R']);
    expect(secondLevelDefenders(players).map(p => p.id)).toEqual(['W', 'M', 'S']);
  });
});

describe('stand-up edge defenders', () => {
  it('counts a 9-tech outside backer 55 off the line as first level, and an inside backer 80 off as second level', () => {
    const edge = defensePlayer('OLB', 'OLB', 'LB', 688, 325, '9-Tech Strong');
    const inside = defensePlayer('ILB', 'ILB', 'LB', 540, 300);
    const players = [...OFFENSE_TE_RIGHT, edge, inside];
    expect(firstLevelDefenders(players).map(p => p.id)).toEqual(['OLB']);
    expect(secondLevelDefenders(players).map(p => p.id)).toEqual(['ILB']);
  });
});
