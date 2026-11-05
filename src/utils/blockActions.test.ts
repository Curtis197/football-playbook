import { describe, it, expect } from 'vitest';
import type { BlockAssignment, BlockPlan, PathAction } from '../types/playbook';
import { buildBlockActions } from './blockActions';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER } from '../test/fixtures';

const players = [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER];
const planOf = (...assignments: BlockAssignment[]): BlockPlan => ({ templateId: 't', playSide: 'right', assignments });
const zone = (extra: Partial<BlockAssignment>): BlockAssignment => ({
  id: 'RG-block', playerId: 'RG', slot: 'og_ps', kind: 'zone', target: { type: 'defender', playerId: 'DT_R' }, ...extra
});

describe('buildBlockActions', () => {
  it('draws a single run_block from the blocker to the defender with a T-bar', () => {
    const [action] = buildBlockActions(planOf(zone({})), players);
    expect(action).toMatchObject({ playerId: 'RG', type: 'run_block', endMarker: 'tbar', assignmentId: 'RG-block' });
    expect(action.points).toEqual([{ x: 540, y: 380 }, { x: 570, y: 340 }]);
  });

  it('links a combo climb to its parent action', () => {
    const actions = buildBlockActions(planOf(zone({ comboWith: 'RT', climbTo: { type: 'defender', playerId: 'M' } })), players);
    expect(actions).toHaveLength(2);
    expect(actions[1]).toMatchObject({ parentActionId: actions[0].id, branchType: 'combo', assignmentId: 'RG-block', playerId: 'RG' });
    expect(actions[1].points[0]).toEqual({ x: 570, y: 340 });
    expect(actions[1].points.at(-1)).toEqual({ x: 490, y: 300 });
  });

  it('omits the climb leg when there is nothing to climb to', () => {
    const actions = buildBlockActions(planOf(zone({ comboWith: 'RT', climbTo: { type: 'none' } })), players);
    expect(actions).toHaveLength(1);
  });

  it('draws a pull as pull_block that dips behind the line first', () => {
    const [action] = buildBlockActions(
      planOf({ id: 'LG-block', playerId: 'LG', slot: 'og_bs', kind: 'kickout', pulls: true, target: { type: 'defender', playerId: 'DE_R' } }),
      players
    );
    expect(action.type).toBe('pull_block');
    expect(action.points).toHaveLength(3);
    expect(action.points[1].y).toBeGreaterThan(380);
    expect(action.points[1].x).toBeGreaterThan(420);
    expect(action.points[2]).toEqual({ x: 660, y: 340 });
  });

  it('draws nothing for a none target', () => {
    expect(buildBlockActions(planOf(zone({ target: { type: 'none' } })), players)).toEqual([]);
  });

  it('aims a level target at the nearest linebacker', () => {
    const [action] = buildBlockActions(planOf(zone({ target: { type: 'level', level: 'second' } })), players);
    expect(action.points.at(-1)).toEqual({ x: 490, y: 300 });
  });

  it('draws a stale assignment grey and labelled, reusing its old line', () => {
    const previous: PathAction = {
      id: 'old', playerId: 'RG', type: 'run_block', endMarker: 'tbar', assignmentId: 'RG-block',
      points: [{ x: 540, y: 380 }, { x: 570, y: 340 }]
    };
    const [action] = buildBlockActions(planOf(zone({ override: true, stale: true, target: { type: 'defender', playerId: 'GONE' } })), players, [previous]);
    expect(action).toMatchObject({ color: '#6b7280', label: 'target gone', assignmentId: 'RG-block' });
    expect(action.points).toEqual(previous.points);
  });

  it('gives a stale assignment with no earlier line a short stub toward the play side', () => {
    const [action] = buildBlockActions(planOf(zone({ stale: true, override: true, target: { type: 'defender', playerId: 'GONE' } })), players);
    expect(action).toMatchObject({ color: '#6b7280', label: 'target gone' });
    expect(action.points[1].x).toBeGreaterThan(540);
  });

  it('tags generated lines, including the combo leg, with the block type of their assignment', () => {
    const actions = buildBlockActions(planOf(zone({ comboWith: 'RT', climbTo: { type: 'defender', playerId: 'M' } })), players);
    expect(actions.map(a => a.blockType)).toEqual(['zone', 'zone']);
    const [pull] = buildBlockActions(
      planOf({ id: 'LG-block', playerId: 'LG', slot: 'og_bs', kind: 'kickout', pulls: true, target: { type: 'defender', playerId: 'DE_R' } }),
      players
    );
    expect(pull.blockType).toBe('kickout');
  });
});
