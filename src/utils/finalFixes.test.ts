import { describe, it, expect } from 'vitest';
import type { Play, RunTemplate } from '../types/playbook';
import {
  applyRunTemplate, captureRunTemplate, editAssignment, reaimBlocks, templateMissing
} from './blockPlanApply';
import { normalizeRunTemplate } from './runTemplateStorage';
import { BUILT_IN_RUN_TEMPLATES } from '../data/runConcepts';
import { OFFENSE_TE_RIGHT, FOUR_THREE_OVER, defensePlayer, makePlay } from '../test/fixtures';

const zone = BUILT_IN_RUN_TEMPLATES.find(t => t.id === 'run-inside-zone')!;
const applied = applyRunTemplate(makePlay(), zone, 'right');
const assignment = (play: Play, playerId: string) => play.blockPlan!.assignments.find(a => a.playerId === playerId)!;
const lines = (play: Play, assignmentId: string) => play.actions.filter(a => a.assignmentId === assignmentId);

describe('final review fixes', () => {
  it('Critical 1: hand edits follow their slot when the offense is swapped for players with new ids', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const renamed: Play = {
      ...edited,
      players: edited.players.map(p => (p.side === 'offense' ? { ...p, id: `N_${p.id}` } : p))
    };
    const reaimed = reaimBlocks(renamed, BUILT_IN_RUN_TEMPLATES);
    expect(assignment(reaimed, 'N_RG')).toMatchObject({ override: true, id: 'N_RG-block', target: { type: 'defender', playerId: 'DE_L' } });
    expect(lines(reaimed, 'N_RG-block').length).toBeGreaterThan(0);
    expect(reaimed.actions.some(a => a.assignmentId === 'RG-block')).toBe(false);
  });

  it('Critical 1: a combo partner is mapped to the new player too', () => {
    const edited = editAssignment(applied, 'LT-block', { comboWith: 'LG' });
    const renamed: Play = { ...edited, players: edited.players.map(p => (p.side === 'offense' ? { ...p, id: `N_${p.id}` } : p)) };
    expect(assignment(reaimBlocks(renamed, BUILT_IN_RUN_TEMPLATES), 'N_LT').comboWith).toBe('N_LG');
  });

  it('Important 3: editing a stale assignment keeps it stale and keeps its grey line', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'DE_L' } });
    const stale = reaimBlocks({ ...edited, players: edited.players.filter(p => p.id !== 'DE_L') }, BUILT_IN_RUN_TEMPLATES);
    const pulled = editAssignment(stale, 'RG-block', { pulls: true });
    expect(assignment(pulled, 'RG')).toMatchObject({ stale: true, pulls: true });
    expect(lines(pulled, 'RG-block')[0]).toMatchObject({ color: '#6b7280', label: 'target gone' });
  });

  it('Important 3: capture skips an assignment whose defender is not on the board even if not flagged stale', () => {
    const edited = editAssignment(applied, 'RG-block', { target: { type: 'defender', playerId: 'GHOST' } });
    expect(captureRunTemplate(edited, zone, 'x').overrides ?? []).toEqual([]);
  });

  it('Important 2: reports a template that is not in the list', () => {
    expect(templateMissing(applied, BUILT_IN_RUN_TEMPLATES)).toBe(false);
    expect(templateMissing(applied, [])).toBe(true);
    expect(templateMissing(makePlay(), [])).toBe(false);
  });

  it('Important 4: a saved Strong/Weak technique is relative to the play side, so it flips with the side', () => {
    const withTech = (techs: Record<string, string>) =>
      FOUR_THREE_OVER.map(p => (techs[p.id] ? { ...p, technique: techs[p.id] } : p));
    // Right play: the play-side guard is sent to the WEAK-side 3-tech, which is the backside of this play
    const rightPlay = editAssignment(
      applyRunTemplate(makePlay({ players: [...OFFENSE_TE_RIGHT, ...withTech({ DT_L: '3-Tech Weak' })] }), zone, 'right'),
      'RG-block',
      { target: { type: 'defender', playerId: 'DT_L' } }
    );
    const saved = captureRunTemplate(rightPlay, zone, 'x');
    expect(saved.overrides?.[0].target).toEqual({ by: 'technique', technique: '3-Tech Backside' });
    // Left play (strong side is still right): backside is the right, so the guard looks for the STRONG 3-tech
    const leftPlay = applyRunTemplate(
      makePlay({ players: [...OFFENSE_TE_RIGHT, ...withTech({ DT_R: '3-Tech Strong', DT_L: '3-Tech Weak' })] }),
      saved,
      'left'
    );
    expect(assignment(leftPlay, 'LG').target).toEqual({ type: 'defender', playerId: 'DT_R' });
  });

  it('Important 5: removing a combo the rules produced is saved and re-applied', () => {
    expect(assignment(applied, 'RG').comboWith).toBe('RT');
    const edited = editAssignment(applied, 'RG-block', { comboWith: null });
    const saved = captureRunTemplate(edited, zone, 'x');
    expect(saved.overrides).toContainEqual({ slot: 'og_ps', comboWithSlot: null });
    expect(assignment(applyRunTemplate(makePlay(), saved, 'right'), 'RG').comboWith).toBeUndefined();
  });

  it('Important 5: retargeting to Nobody is saved and re-applied', () => {
    const edited = editAssignment(applied, 'RT-block', { target: { type: 'none' } });
    const saved = captureRunTemplate(edited, zone, 'x');
    expect(saved.overrides).toContainEqual({ slot: 'ot_ps', target: { by: 'none' } });
    expect(assignment(applyRunTemplate(makePlay(), saved, 'right'), 'RT').target).toEqual({ type: 'none' });
  });

  it('Important 5: storage keeps the new override shapes', () => {
    const raw: RunTemplate = { id: 't', name: 't', scheme: 'zone', reviewed: true, rules: {}, overrides: [{ slot: 'c', comboWithSlot: null }, { slot: 'c', target: { by: 'none' } }] };
    expect(normalizeRunTemplate(raw)?.overrides).toEqual(raw.overrides);
  });

  it('keeps a defender that sits among unrelated players working (sanity)', () => {
    const extra = defensePlayer('X', 'X', 'DL', 600, 340, '3-Tech Strong');
    expect(extra.technique).toBe('3-Tech Strong');
  });
});
