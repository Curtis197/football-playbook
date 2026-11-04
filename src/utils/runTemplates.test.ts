import { describe, it, expect } from 'vitest';
import type { BlockAssignment, BlockKind, BlockSlot, Player, RunCall, RunTemplate } from '../types/playbook';
import { resolveBlockPlan } from './runTemplates';
import { BUILT_IN_RUN_TEMPLATES } from '../data/runConcepts';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, FULLBACK, offensePlayer } from '../test/fixtures';

const template = (id: string): RunTemplate => {
  const found = BUILT_IN_RUN_TEMPLATES.find(t => t.id === id);
  if (!found) throw new Error(`missing built-in ${id}`);
  return found;
};
const byPlayer = (assignments: BlockAssignment[], id: string) => assignments.find(a => a.playerId === id);
const defender = (id: string) => ({ type: 'defender', playerId: id });
const mirror = (players: Player[]): Player[] => players.map(p => ({ ...p, x: 960 - p.x }));
const only = (...ids: string[]) => FOUR_THREE_OVER.filter(p => ids.includes(p.id));
const call = (hole: number, runner = 3, side?: 'left' | 'right'): RunCall => ({ hole, runner, side });

/** A throwaway template that gives every line slot one block type. */
const allSlots = (kind: BlockKind): RunTemplate => ({
  id: `test-${kind}`, name: kind, scheme: 'zone', reviewed: true,
  rules: Object.fromEntries((['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs'] as BlockSlot[]).map(s => [s, { kind }]))
});

describe('inside zone', () => {
  const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];

  it('resolves the 4-3 Over fixture to hole 3 with the runner and lead excluded', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), players, call(3));
    expect(byPlayer(assignments, 'TE')?.target).toEqual(defender('DE_R'));
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'RG')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'C')?.target).toEqual(defender('DT_L'));
    expect(byPlayer(assignments, 'LG')?.target).toEqual(defender('DT_L'));
    expect(byPlayer(assignments, 'LT')?.target).toEqual(defender('DE_L'));
    for (const a of assignments) {
      expect(a.comboWith).toBeUndefined();
      expect(a.climbTo).toBeUndefined();
    }
    expect(byPlayer(assignments, 'RB')).toBeUndefined();
    expect(byPlayer(assignments, 'QB')).toBeUndefined();
  });

  it('records the call and slots on the plan', () => {
    const plan = resolveBlockPlan(template('run-inside-zone'), players, call(3, 2));
    expect(plan).toMatchObject({ templateId: 'run-inside-zone', playSide: 'right', hole: 3, runner: 2 });
    expect(byPlayer(plan.assignments, 'RG')).toMatchObject({ slot: 'og_ps', kind: 'zone', id: 'RG-block' });
  });

  it('mirrors to hole 4 on a mirrored fixture', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), mirror(players), call(4));
    expect(byPlayer(assignments, 'TE')?.target).toEqual(defender('DE_R'));
    expect(byPlayer(assignments, 'RG')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'LG')?.target).toEqual(defender('DT_L'));
  });

  it('draws the same zone blocks for any odd hole (the hole sets the side only)', () => {
    const at = (hole: number) => resolveBlockPlan(template('run-inside-zone'), players, call(hole)).assignments;
    expect(at(1)).toEqual(at(3));
    expect(at(5)).toEqual(at(7));
  });

  it('hole 0 uses the side the coach chose', () => {
    const left = resolveBlockPlan(template('run-inside-zone'), players, call(0, 3, 'left'));
    expect(left.playSide).toBe('left');
    expect(left.hole).toBe(0);
  });

  it('combos with the nearest blocker away from the play side, then climbs, when nobody is on the line toward the play side', () => {
    const thin = [...OFFENSE_TE_RIGHT, ...only('DT_L', 'M')];
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), thin, call(3));
    for (const id of ['C', 'LG', 'LT']) expect(byPlayer(assignments, id)).toMatchObject({ target: defender('DT_L') });
    expect(byPlayer(assignments, 'C')?.comboWith).toBeUndefined();
    for (const id of ['RG', 'RT', 'TE']) {
      expect(byPlayer(assignments, id)).toMatchObject({ target: defender('DT_L'), comboWith: 'C', climbTo: defender('M') });
    }
  });

  it('climbs straight to the second level when there is no partner either', () => {
    const lbOnly = [...OFFENSE_TE_RIGHT, ...only('M')];
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), lbOnly, call(3));
    expect(assignments.length).toBe(6);
    for (const a of assignments) {
      expect(a.target).toEqual(defender('M'));
      expect(a.comboWith).toBeUndefined();
    }
  });

  it('skips missing slots without throwing (no TE, four OL)', () => {
    const fewer = players.filter(p => p.id !== 'TE' && p.id !== 'LT');
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), fewer, call(3));
    expect(byPlayer(assignments, 'TE')).toBeUndefined();
    expect(byPlayer(assignments, 'LT')).toBeUndefined();
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
  });

  it('gives no slot to a split-out tight end', () => {
    const flex = players.map(p => (p.id === 'TE' ? { ...p, x: 760 } : p));
    expect(byPlayer(resolveBlockPlan(template('run-inside-zone'), flex, call(3)).assignments, 'TE')).toBeUndefined();
  });

  it('handles a tight end on each side', () => {
    const twoTes = [...players, offensePlayer('TE2', 'H', 'TE', 300, 380)];
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), twoTes, call(3));
    expect(byPlayer(assignments, 'TE2')).toMatchObject({ slot: 'te_bs' });
    expect(byPlayer(assignments, 'TE2')?.target).toBeDefined();
  });

  it('stores a plan with no targets when there are no defenders', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), OFFENSE_TE_RIGHT, call(3));
    expect(assignments.length).toBeGreaterThan(0);
    for (const a of assignments) expect(a.target).toEqual({ type: 'none' });
  });

  it('throws a clear error for a rule kind it does not know', () => {
    const broken = { ...template('run-inside-zone'), rules: { c: { kind: 'bogus' } } } as unknown as RunTemplate;
    expect(() => resolveBlockPlan(broken, players, call(3))).toThrow(/bogus/);
  });
});

describe('block types on their own', () => {
  const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];

  it('down looks away from the play side', () => {
    const { assignments } = resolveBlockPlan(allSlots('down'), players, call(3));
    expect(byPlayer(assignments, 'TE')?.target).toEqual(defender('DE_R'));
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'RG')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'C')?.target).toEqual(defender('DT_L'));
  });

  it('down climbs straight to the second level when nobody is at or inside him', () => {
    const lone = [...OFFENSE_TE_RIGHT, ...only('DT_R', 'S')];
    const { assignments } = resolveBlockPlan(allSlots('down'), lone, call(3));
    // DT_R (570) is inside the TE, tackle and guard, but beyond reach (+30) of C (480), LG and LT
    for (const id of ['TE', 'RT', 'RG']) expect(byPlayer(assignments, id)?.target).toEqual(defender('DT_R'));
    for (const id of ['C', 'LG', 'LT']) {
      expect(byPlayer(assignments, id)?.target).toEqual(defender('S'));
      expect(byPlayer(assignments, id)?.comboWith).toBeUndefined();
    }
  });

  it('seal never combos: with nobody on the line it climbs straight to the second level', () => {
    const lbOnly = [...OFFENSE_TE_RIGHT, ...only('DT_L', 'M')];
    const { assignments } = resolveBlockPlan(allSlots('seal'), lbOnly, call(3));
    expect(byPlayer(assignments, 'RT')?.comboWith).toBeUndefined();
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('M'));
  });
});

describe('gap schemes (draft rules, awaiting coach sign-off)', () => {
  const withFb = [...OFFENSE_TE_RIGHT, FULLBACK, ...FOUR_THREE_OVER];

  it('ships gap templates unreviewed so the picker keeps them disabled', () => {
    for (const id of ['run-power', 'run-counter', 'run-trap']) {
      expect(template(id)).toMatchObject({ scheme: 'gap', reviewed: false, builtIn: true });
    }
  });

  it('power to hole 3: backside guard kicks out the first defender outside the hole, the other back leads', () => {
    const { assignments } = resolveBlockPlan(template('run-power'), withFb, call(3, 3));
    expect(byPlayer(assignments, 'LG')).toMatchObject({ kind: 'kickout', pulls: true, target: defender('DE_R') });
    expect(byPlayer(assignments, 'LT')).toMatchObject({ kind: 'seal', target: defender('DE_L') });
    for (const id of ['TE', 'RT', 'RG']) expect(byPlayer(assignments, id)).toMatchObject({ kind: 'down', target: defender('DT_R') });
    expect(byPlayer(assignments, 'C')).toMatchObject({ kind: 'down', target: defender('DT_L') });
    expect(byPlayer(assignments, 'FB')).toMatchObject({ kind: 'lead', target: defender('S') });
    expect(byPlayer(assignments, 'RB')).toBeUndefined();
  });

  it('power with runner 2 hands the lead to the other back', () => {
    const { assignments } = resolveBlockPlan(template('run-power'), withFb, call(3, 2));
    expect(byPlayer(assignments, 'RB')).toMatchObject({ kind: 'lead' });
    expect(byPlayer(assignments, 'FB')).toBeUndefined();
  });

  it('a pulled defender leaves the pool: nobody else blocks the kickout target', () => {
    const { assignments } = resolveBlockPlan(template('run-power'), withFb, call(3, 3));
    const targets = assignments.filter(a => a.slot !== 'og_bs').map(a => (a.target.type === 'defender' ? a.target.playerId : ''));
    expect(targets).not.toContain('DE_R');
  });

  it('counter to hole 3: backside tackle wraps to the linebacker nearest the hole and the lead takes the next one', () => {
    const { assignments } = resolveBlockPlan(template('run-counter'), withFb, call(3, 3));
    expect(byPlayer(assignments, 'LG')).toMatchObject({ kind: 'kickout', pulls: true, target: defender('DE_R') });
    expect(byPlayer(assignments, 'LT')).toMatchObject({ kind: 'wrap', pulls: true, target: defender('S') });
    expect(byPlayer(assignments, 'FB')).toMatchObject({ kind: 'lead', target: defender('M') });
  });

  it('trap to hole 1: backside guard traps the first defender on the line inside the hole', () => {
    const { assignments } = resolveBlockPlan(template('run-trap'), withFb, call(1, 3));
    expect(byPlayer(assignments, 'LG')).toMatchObject({ kind: 'trap', pulls: true, target: defender('DT_L') });
    expect(byPlayer(assignments, 'TE')).toMatchObject({ kind: 'seal', target: defender('DE_R') });
    expect(byPlayer(assignments, 'RT')).toMatchObject({ kind: 'seal', target: defender('DT_R') });
    expect(byPlayer(assignments, 'RG')).toMatchObject({ kind: 'down', target: defender('DT_R') });
    expect(byPlayer(assignments, 'C')).toMatchObject({ kind: 'down', target: defender('DE_L') });
    expect(byPlayer(assignments, 'FB')).toMatchObject({ kind: 'lead', target: defender('M') });
  });

  it('mirrors power to hole 4 (ids stay with the mirrored players, so the puller is still LG)', () => {
    const { assignments } = resolveBlockPlan(template('run-power'), mirror(withFb), call(4, 3));
    expect(byPlayer(assignments, 'LG')).toMatchObject({ kind: 'kickout', pulls: true, target: defender('DE_R') });
    expect(byPlayer(assignments, 'FB')).toMatchObject({ kind: 'lead', target: defender('S') });
  });

  it('skips the pull when the puller is not on the field, and draws nothing without defenders', () => {
    const noGuard = withFb.filter(p => p.id !== 'LG');
    expect(byPlayer(resolveBlockPlan(template('run-power'), noGuard, call(3)).assignments, 'LG')).toBeUndefined();
    const { assignments } = resolveBlockPlan(template('run-counter'), [...OFFENSE_TE_RIGHT, FULLBACK], call(3));
    for (const a of assignments) expect(a.target).toEqual({ type: 'none' });
  });

  it('draws no lead when the only back is the runner, or when the QB runs it with no spare back', () => {
    const power = template('run-power');
    const oneBack = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];
    expect(byPlayer(resolveBlockPlan(power, oneBack, call(3, 3)).assignments, 'RB')).toBeUndefined();
    expect(byPlayer(resolveBlockPlan(power, oneBack, call(3, 1)).assignments, 'RB')).toMatchObject({ kind: 'lead' });
    const noBacks = oneBack.filter(p => p.id !== 'RB');
    expect(resolveBlockPlan(power, noBacks, call(3, 1)).assignments.some(a => a.kind === 'lead')).toBe(false);
  });
});
