import { describe, it, expect } from 'vitest';
import type { PathAction, Play } from '../types/playbook';
import { applyRunTemplate, captureRunTemplate, reaimBlocks, clearBlocks, editAssignment, resolvePlaySide } from './blockPlanApply';
import { BUILT_IN_RUN_TEMPLATES } from '../data/runConcepts';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, makePlay } from '../test/fixtures';

const zoneTemplate = BUILT_IN_RUN_TEMPLATES.find(t => t.id === 'run-inside-zone')!;
const handBlock: PathAction = { id: 'hand', playerId: 'C', type: 'run_block', endMarker: 'tbar', points: [{ x: 480, y: 380 }, { x: 480, y: 350 }] };
const handPull: PathAction = { id: 'handpull', playerId: 'LG', type: 'pull_block', endMarker: 'tbar', points: [{ x: 420, y: 380 }, { x: 500, y: 380 }] };
const route: PathAction = { id: 'route', playerId: 'TE', type: 'pass_route', endMarker: 'arrow', points: [{ x: 660, y: 380 }, { x: 660, y: 300 }] };
const motion: PathAction = { id: 'motion', playerId: 'RB', type: 'motion', endMarker: 'arrow', points: [{ x: 480, y: 480 }, { x: 560, y: 480 }] };

const generated = (play: Play) => play.actions.filter(a => a.assignmentId);
const without = (play: Play, ...ids: string[]): Play => ({ ...play, players: play.players.filter(p => !ids.includes(p.id)) });
const assignment = (play: Play, playerId: string) => play.blockPlan!.assignments.find(a => a.playerId === playerId)!;

describe('applyRunTemplate', () => {
  it('replaces hand-drawn blocks and pulls but leaves routes and motions alone', () => {
    const play = makePlay({ actions: [handBlock, handPull, route, motion] });
    const applied = applyRunTemplate(play, zoneTemplate, 'right');
    expect(applied.actions.find(a => a.id === 'hand')).toBeUndefined();
    expect(applied.actions.find(a => a.id === 'handpull')).toBeUndefined();
    expect(applied.actions).toContainEqual(route);
    expect(applied.actions).toContainEqual(motion);
    expect(generated(applied).length).toBeGreaterThan(0);
    expect(applied.blockPlan).toMatchObject({ templateId: 'run-inside-zone', playSide: 'right' });
    expect(applied.primaryRunConcept).toBe('Inside Zone');
  });
});

describe('reaimBlocks', () => {
  const applied = applyRunTemplate(makePlay(), zoneTemplate, 'right');

  it('returns a play without a block plan unchanged (same reference)', () => {
    const plain = makePlay();
    expect(reaimBlocks(plain, BUILT_IN_RUN_TEMPLATES)).toBe(plain);
  });

  it('returns the play unchanged when its template is unknown', () => {
    expect(reaimBlocks(applied, [])).toBe(applied);
  });

  it('retargets blocks that were not edited when the front changes', () => {
    const reaimed = reaimBlocks(without(applied, 'DT_R'), BUILT_IN_RUN_TEMPLATES);
    expect(assignment(reaimed, 'RT').target).toEqual({ type: 'defender', playerId: 'DE_R' });
    const line = generated(reaimed).find(a => a.assignmentId === 'RT-block' && !a.branchType)!;
    expect(line.points.at(-1)).toEqual({ x: 660, y: 340 });
  });

  it('keeps hand-drawn lines when re-aiming', () => {
    const withHand: Play = { ...applied, actions: [...applied.actions, handBlock] };
    expect(reaimBlocks(withHand, BUILT_IN_RUN_TEMPLATES).actions).toContainEqual(handBlock);
  });

  it('keeps an overridden assignment whose defender still exists', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const reaimed = reaimBlocks(without(edited, 'DT_R'), BUILT_IN_RUN_TEMPLATES);
    expect(assignment(reaimed, 'RG')).toMatchObject({ override: true, target: { type: 'defender', playerId: 'DE_L' } });
    expect(assignment(reaimed, 'RG').stale).toBeUndefined();
  });

  it('marks an overridden assignment stale and draws it grey when its defender is gone', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const reaimed = reaimBlocks(without(edited, 'DE_L'), BUILT_IN_RUN_TEMPLATES);
    expect(assignment(reaimed, 'RG')).toMatchObject({ override: true, stale: true, target: { type: 'defender', playerId: 'DE_L' } });
    const line = generated(reaimed).find(a => a.assignmentId === 'RG-block')!;
    expect(line).toMatchObject({ color: '#6b7280', label: 'target gone' });
  });

  it('clears the stale flag when the defender comes back', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const stale = reaimBlocks(without(edited, 'DE_L'), BUILT_IN_RUN_TEMPLATES);
    const back: Play = { ...stale, players: [...stale.players, FOUR_THREE_OVER.find(p => p.id === 'DE_L')!] };
    expect(assignment(reaimBlocks(back, BUILT_IN_RUN_TEMPLATES), 'RG').stale).toBeUndefined();
  });

  it('keeps the stored play side when the formation flips strength', () => {
    const flipped: Play = { ...applied, players: applied.players.map(p => ({ ...p, x: 960 - p.x })) };
    expect(reaimBlocks(flipped, BUILT_IN_RUN_TEMPLATES).blockPlan!.playSide).toBe('right');
  });

  it('draws no lines and does not throw when every defender is removed', () => {
    const offenseOnly: Play = { ...applied, players: OFFENSE_TE_RIGHT };
    const reaimed = reaimBlocks(offenseOnly, BUILT_IN_RUN_TEMPLATES);
    expect(generated(reaimed)).toEqual([]);
    expect(reaimed.blockPlan!.assignments.length).toBeGreaterThan(0);
  });
});

describe('clearBlocks', () => {
  it('removes the plan and generated lines but keeps hand-drawn ones', () => {
    const applied = applyRunTemplate(makePlay({ actions: [route] }), zoneTemplate, 'right');
    const cleared = clearBlocks({ ...applied, actions: [...applied.actions, handBlock] });
    expect(cleared.blockPlan).toBeUndefined();
    expect(cleared.actions).toEqual([route, handBlock]);
  });
});

describe('editAssignment', () => {
  const applied = applyRunTemplate(makePlay(), zoneTemplate, 'right');

  it('marks the assignment as a hand edit and only regenerates its own lines', () => {
    const before = generated(applied).filter(a => a.assignmentId !== 'RT-block');
    const edited = editAssignment(applied, 'RT-block', { target: { type: 'defender', playerId: 'DE_R' } });
    expect(assignment(edited, 'RT')).toMatchObject({ override: true, target: { type: 'defender', playerId: 'DE_R' } });
    const after = generated(edited).filter(a => a.assignmentId !== 'RT-block');
    expect(after).toEqual(before);
    expect(edited.actions.find(a => a.assignmentId === 'RT-block')!.points.at(-1)).toEqual({ x: 660, y: 340 });
  });

  it('removes the combo line when the combo is cleared', () => {
    expect(generated(applied).some(a => a.assignmentId === 'RG-block' && a.branchType === 'combo')).toBe(true);
    const edited = editAssignment(applied, 'RG-block', { comboWith: null });
    expect(assignment(edited, 'RG').comboWith).toBeUndefined();
    expect(generated(edited).some(a => a.assignmentId === 'RG-block' && a.branchType === 'combo')).toBe(false);
  });

  it('adds a combo with a climb when a partner is chosen', () => {
    const edited = editAssignment(applied, 'LT-block', { comboWith: 'LG' });
    expect(assignment(edited, 'LT')).toMatchObject({ comboWith: 'LG', override: true });
    expect(generated(edited).some(a => a.assignmentId === 'LT-block' && a.branchType === 'combo')).toBe(true);
  });

  it('turns a block into a pull', () => {
    const edited = editAssignment(applied, 'LG-block', { pulls: true });
    expect(generated(edited).find(a => a.assignmentId === 'LG-block' && !a.branchType)!.type).toBe('pull_block');
  });

  it('clears the stale flag when the coach picks a new target', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const stale = reaimBlocks(without(edited, 'DE_L'), BUILT_IN_RUN_TEMPLATES);
    const fixed = editAssignment(stale, 'RG-block', { target: { type: 'defender', playerId: 'DT_L' } });
    expect(assignment(fixed, 'RG').stale).toBeUndefined();
  });

  it('returns the play unchanged for an unknown assignment', () => {
    expect(editAssignment(applied, 'nope', { pulls: true })).toBe(applied);
  });
});

describe('resolvePlaySide', () => {
  it('passes left and right through', () => {
    expect(resolvePlaySide('left', OFFENSE_TE_RIGHT)).toBe('left');
    expect(resolvePlaySide('right', OFFENSE_TE_RIGHT)).toBe('right');
  });

  it('maps strong and weak using the formation strength', () => {
    expect(resolvePlaySide('strong', OFFENSE_TE_RIGHT)).toBe('right');
    expect(resolvePlaySide('weak', OFFENSE_TE_RIGHT)).toBe('left');
  });

  it('refuses strong and weak when the formation is balanced', () => {
    const balanced = OFFENSE_TE_RIGHT.filter(p => p.id !== 'TE');
    expect(resolvePlaySide('strong', balanced)).toBeNull();
    expect(resolvePlaySide('weak', balanced)).toBeNull();
    expect(resolvePlaySide('left', balanced)).toBe('left');
  });
});

describe('captureRunTemplate', () => {
  const applied = applyRunTemplate(makePlay(), zoneTemplate, 'right');
  const retargeted = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });

  it('turns one retargeted block into exactly one technique override', () => {
    const saved = captureRunTemplate(retargeted, zoneTemplate, 'My zone');
    expect(saved.overrides).toEqual([
      { slot: 'og_ps', target: { by: 'technique', technique: '5-Tech Backside' } }
    ]);
    expect(saved).toMatchObject({ name: 'My zone', scheme: 'zone', builtIn: false, reviewed: true });
    expect(saved.id).not.toBe(zoneTemplate.id);
    expect(saved.rules).toEqual(zoneTemplate.rules);
  });

  it('does not save stale overrides', () => {
    const stale = reaimBlocks(without(retargeted, 'DE_L'), BUILT_IN_RUN_TEMPLATES);
    expect(captureRunTemplate(stale, zoneTemplate, 'x').overrides ?? []).toEqual([]);
  });

  it('does not save geometry-only changes', () => {
    const nudged: Play = {
      ...applied,
      actions: applied.actions.map(a => (a.assignmentId === 'RT-block' ? { ...a, points: [a.points[0], { x: 575, y: 350 }] } : a))
    };
    expect(captureRunTemplate(nudged, zoneTemplate, 'x').overrides ?? []).toEqual([]);
  });

  it('records a combo partner by slot', () => {
    const combo = editAssignment(applied, 'LT-block', { comboWith: 'LG' });
    expect(captureRunTemplate(combo, zoneTemplate, 'x').overrides).toEqual([{ slot: 'ot_bs', comboWithSlot: 'og_bs' }]);
  });

  it('keeps earlier overrides of the template being updated and reuses its id', () => {
    const base = captureRunTemplate(retargeted, zoneTemplate, 'My zone');
    const pulled = editAssignment(applyRunTemplate(makePlay(), base, 'right'), 'LG-block', { pulls: true });
    const updated = captureRunTemplate(pulled, base, 'My zone', base.id);
    expect(updated.id).toBe(base.id);
    expect(updated.overrides?.map(o => o.slot).sort()).toEqual(['og_bs', 'og_ps']);
  });

  it('applies a saved retarget to a different front by technique', () => {
    const saved = captureRunTemplate(retargeted, zoneTemplate, 'My zone');
    const otherFront: Play = {
      ...makePlay(),
      players: [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER.map(p => (p.id === 'DE_L' ? { ...p, id: 'EDGE', x: 300 } : p))]
    };
    const result = applyRunTemplate(otherFront, saved, 'right');
    expect(assignment(result, 'RG').target).toEqual({ type: 'defender', playerId: 'EDGE' });
  });

  it('falls back to the base rule when no defender has the saved technique', () => {
    const saved = captureRunTemplate(retargeted, zoneTemplate, 'My zone');
    const noMatch: Play = { ...makePlay(), players: [...OFFENSE_TE_RIGHT, ...FOUR_THREE_OVER.filter(p => p.id !== 'DE_L')] };
    expect(assignment(applyRunTemplate(noMatch, saved, 'right'), 'RG').target).toEqual({ type: 'defender', playerId: 'DT_R' });
  });
});
