import { describe, it, expect } from 'vitest';
import { normalizePlay, normalizePlaybook, playsEqual } from './playValidation';
import { makePlay } from '../test/fixtures';

const blockPlan = {
  templateId: 'run-inside-zone',
  playSide: 'right',
  assignments: [
    { id: 'RT-block', playerId: 'RT', slot: 'ot_ps', kind: 'zone', target: { type: 'defender', playerId: 'DT_R' }, override: true }
  ]
};

describe('schema 1.2.0 block plans', () => {
  it('keeps blockPlan and assignmentId through normalizePlay', () => {
    const raw = makePlay({
      actions: [{ id: 'a1', playerId: 'RT', type: 'run_block', endMarker: 'tbar', points: [{ x: 600, y: 380 }, { x: 570, y: 340 }], assignmentId: 'RT-block' }]
    });
    const result = normalizePlay({ ...raw, blockPlan });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blockPlan?.templateId).toBe('run-inside-zone');
    expect(result.value.blockPlan?.playSide).toBe('right');
    expect(result.value.blockPlan?.assignments[0].override).toBe(true);
    expect(result.value.actions[0].assignmentId).toBe('RT-block');
  });

  it('drops a blockPlan with an invalid playSide', () => {
    const result = normalizePlay({ ...makePlay(), blockPlan: { ...blockPlan, playSide: 'up' } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blockPlan).toBeUndefined();
  });

  it('drops malformed assignments but keeps the plan', () => {
    const result = normalizePlay({ ...makePlay(), blockPlan: { ...blockPlan, assignments: [blockPlan.assignments[0], { id: 5 }] } });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blockPlan?.assignments).toHaveLength(1);
  });

  it('leaves a 1.1.0 play without blockPlan unchanged', () => {
    const play = makePlay();
    const result = normalizePlay(play);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blockPlan).toBeUndefined();
    expect(playsEqual(result.value, play)).toBe(true);
  });

  it('reads versions 1.0.0, 1.1.0 and 1.2.0 and rejects others', () => {
    for (const version of ['1.0.0', '1.1.0', '1.2.0']) {
      const result = normalizePlaybook({ version, title: 't', philosophySummary: '', plays: [makePlay()] });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.version).toBe('1.2.0');
    }
    expect(normalizePlaybook({ version: '9.9.9', title: 't', philosophySummary: '', plays: [makePlay()] }).ok).toBe(false);
  });
});
