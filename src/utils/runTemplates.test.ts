import { describe, it, expect } from 'vitest';
import type { BlockAssignment, Player, RunTemplate } from '../types/playbook';
import { resolveBlockPlan } from './runTemplates';
import { BUILT_IN_RUN_TEMPLATES } from '../data/runConcepts';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, offensePlayer } from '../test/fixtures';

const template = (id: string): RunTemplate => {
  const found = BUILT_IN_RUN_TEMPLATES.find(t => t.id === id);
  if (!found) throw new Error(`missing built-in ${id}`);
  return found;
};
const byPlayer = (assignments: BlockAssignment[], id: string) => assignments.find(a => a.playerId === id);
const defender = (id: string) => ({ type: 'defender', playerId: id });

const mirror = (players: Player[]): Player[] => players.map(p => ({ ...p, x: 960 - p.x }));

describe('inside zone', () => {
  const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];

  it('resolves the 4-3 Over fixture to the right', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), players, 'right');
    expect(byPlayer(assignments, 'TE')?.target).toEqual(defender('DE_R'));
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
    expect(byPlayer(assignments, 'RG')).toMatchObject({ target: defender('DT_R'), comboWith: 'RT', climbTo: defender('M') });
    expect(byPlayer(assignments, 'C')?.target).toEqual(defender('DT_L'));
    expect(byPlayer(assignments, 'LG')).toMatchObject({ target: defender('DT_L'), comboWith: 'C', climbTo: defender('W') });
    expect(byPlayer(assignments, 'LT')?.target).toEqual(defender('DE_L'));
    expect(byPlayer(assignments, 'TE')?.comboWith).toBeUndefined();
    expect(byPlayer(assignments, 'RB')).toBeUndefined();
  });

  it('records template id, play side and slot per assignment', () => {
    const plan = resolveBlockPlan(template('run-inside-zone'), players, 'right');
    expect(plan.templateId).toBe('run-inside-zone');
    expect(plan.playSide).toBe('right');
    expect(byPlayer(plan.assignments, 'RG')).toMatchObject({ slot: 'og_ps', kind: 'zone', id: 'RG-block' });
  });

  it('mirrors for a left play side on a mirrored fixture', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), mirror(players), 'left');
    expect(byPlayer(assignments, 'TE')?.target).toEqual(defender('DE_R'));
    expect(byPlayer(assignments, 'RG')).toMatchObject({ target: defender('DT_R'), comboWith: 'RT', climbTo: defender('M') });
    expect(byPlayer(assignments, 'LG')).toMatchObject({ target: defender('DT_L'), comboWith: 'C', climbTo: defender('W') });
  });

  it('skips missing slots without throwing (no TE, four OL)', () => {
    const fewer = players.filter(p => p.id !== 'TE' && p.id !== 'LT');
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), fewer, 'right');
    expect(byPlayer(assignments, 'TE')).toBeUndefined();
    expect(byPlayer(assignments, 'LT')).toBeUndefined();
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
  });

  it('handles a tight end on each side', () => {
    const twoTes = [...players, offensePlayer('TE2', 'H', 'TE', 300, 380)];
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), twoTes, 'right');
    expect(byPlayer(assignments, 'TE2')).toMatchObject({ slot: 'te_bs' });
    expect(byPlayer(assignments, 'TE2')?.target).toBeDefined();
  });

  it('stores a plan with no targets when there are no defenders', () => {
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), OFFENSE_TE_RIGHT, 'right');
    expect(assignments.length).toBeGreaterThan(0);
    for (const a of assignments) expect(a.target).toEqual({ type: 'none' });
  });

  it('sends a blocker with nobody toward the play side straight to the second level', () => {
    const noEdge = players.filter(p => p.id !== 'DE_R');
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), noEdge, 'right');
    expect(byPlayer(assignments, 'TE')?.target).toEqual({ type: 'level', level: 'second' });
    expect(byPlayer(assignments, 'RT')?.target).toEqual(defender('DT_R'));
  });

  it('shares the first defender with the neighbour when a blocker is uncovered', () => {
    // Only two down linemen: both interior blockers on the right share the one defender
    const thin = [...OFFENSE_TE_RIGHT, FOUR_THREE_OVER.find(p => p.id === 'DT_R')!, FOUR_THREE_OVER.find(p => p.id === 'M')!];
    const { assignments } = resolveBlockPlan(template('run-inside-zone'), thin, 'right');
    expect(byPlayer(assignments, 'RG')).toMatchObject({ target: defender('DT_R'), comboWith: 'RT' });
  });

  it('throws a clear error for a rule kind it does not know', () => {
    const broken = { ...template('run-inside-zone'), rules: { c: { kind: 'bogus' } } } as unknown as RunTemplate;
    expect(() => resolveBlockPlan(broken, players, 'right')).toThrow(/bogus/);
  });
});
