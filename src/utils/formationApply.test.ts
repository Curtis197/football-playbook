import { describe, expect, it } from 'vitest';
import { applyFormationToPlay, buildFormationFromPlay, captureFormationPlayers, formationHasPlayers } from './formationApply';
import { analyzeOffense, realignAllDefenders } from './defensiveAlignment';
import { adaptRoutesToNewFormation } from './routeAdaptation';
import { detectCurrentQBPosition } from './formationBackfield';
import { DEFAULT_FORMATIONS } from '../data/presets';
import type { Formation } from '../types/playbook';
import { WISHBONE_ID, clone, preset, template } from '../test/helpers';

const wishbone = preset(WISHBONE_ID);
const offenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'offense');
const defenseTemplates = DEFAULT_FORMATIONS.filter(f => f.side === 'defense');
const keep = { routeMode: 'player_relative', keepRoutes: true } as const;

describe('applyFormationToPlay: offense templates', () => {
  it.each(offenseTemplates.map(f => [f.name, f] as const))('%s: routes follow their players and defenders re-align', (_name, formation) => {
    const result = applyFormationToPlay(wishbone, formation, keep);

    // written out independently of the implementation: this is what applying an offense template means
    const newOffense = formation.players;
    const expectedActions = adaptRoutesToNewFormation(wishbone.actions, wishbone.players, newOffense, 'player_relative');
    const expectedDefense = realignAllDefenders(wishbone.players.filter(p => p.side === 'defense'), analyzeOffense(newOffense));
    expect(result.players).toEqual([...newOffense, ...expectedDefense]);
    expect(result.actions).toEqual(expectedActions);

    const ids = result.players.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(result.actions.every(a => ids.includes(a.playerId))).toBe(true);
  });

  it('links the play to the template it applied and leaves the front link alone', () => {
    const spread = template('formation-spread-2x2');
    const result = applyFormationToPlay(wishbone, spread, keep);
    expect(result.formationOffenseId).toBe(spread.id);
    expect(result.formationOffense).toBe(spread.name);
    expect(result.frontDefenseId).toBe(wishbone.frontDefenseId);
  });

  it('keeps the number of defenders', () => {
    const result = applyFormationToPlay(wishbone, template('formation-spread-2x2'), keep);
    expect(result.players.filter(p => p.side === 'defense')).toHaveLength(wishbone.players.filter(p => p.side === 'defense').length);
  });

  it('clears the routes when asked to', () => {
    expect(applyFormationToPlay(wishbone, template('formation-spread-2x2'), { ...keep, keepRoutes: false }).actions).toEqual([]);
  });

  it('maps routes one-to-one without stacking in #1/#2/#3 mode', () => {
    const result = applyFormationToPlay(wishbone, template('formation-spread-2x2'), { routeMode: 'concept_numbered', keepRoutes: true });
    const mappedToNew = result.actions.filter(a => result.players.some(p => p.id === a.playerId)).map(a => a.playerId);
    expect(new Set(mappedToNew).size).toBe(mappedToNew.length);
  });

  it('does not mutate the play or the template', () => {
    const play = clone(wishbone);
    const spread = clone(template('formation-spread-2x2'));
    const frozen = [JSON.stringify(play), JSON.stringify(spread)];
    applyFormationToPlay(play, spread, keep);
    expect([JSON.stringify(play), JSON.stringify(spread)]).toEqual(frozen);
  });
});

describe('applyFormationToPlay: defensive fronts', () => {
  it.each(defenseTemplates.map(f => [f.name, f] as const))('%s: defenders are pre-aligned to the current offense; offense and routes untouched', (_name, front) => {
    const result = applyFormationToPlay(wishbone, front, keep);
    const expected = realignAllDefenders(front.players.filter(p => p.side === 'defense' || front.side === 'defense'), analyzeOffense(wishbone.players));
    expect(result.players.filter(p => p.side === 'offense')).toEqual(wishbone.players.filter(p => p.side === 'offense'));
    expect(result.players.filter(p => p.side === 'defense')).toEqual(expected);
    expect(result.actions).toBe(wishbone.actions);
  });

  it('links the front and leaves the offense link alone', () => {
    const front = defenseTemplates[0];
    const result = applyFormationToPlay(wishbone, front, keep);
    expect(result.frontDefenseId).toBe(front.id);
    expect(result.formationOffenseId).toBe(wishbone.formationOffenseId);
  });
});

describe('applyFormationToPlay: both-sided and empty templates', () => {
  it('a both-sided template replaces every player as stored and links both sides', () => {
    const both: Formation = { id: 'both-1', name: 'Both', side: 'both', players: [...offenseTemplates[0].players, ...defenseTemplates[0].players] };
    const result = applyFormationToPlay(wishbone, both, keep);
    expect(result.players).toHaveLength(both.players.length);
    expect([result.formationOffenseId, result.frontDefenseId]).toEqual(['both-1', 'both-1']);
  });

  it('a template with nothing for its side is not applicable and the play comes back untouched', () => {
    const empty: Formation = { id: 'e', name: 'Empty', side: 'defense', players: [] };
    expect(formationHasPlayers(empty)).toBe(false);
    expect(applyFormationToPlay(wishbone, empty, keep)).toBe(wishbone);
    expect(formationHasPlayers({ id: 'x', name: 'x', side: 'offense', players: [] })).toBe(false);
    expect(formationHasPlayers(offenseTemplates[0])).toBe(true);
  });
});

describe('captureFormationPlayers', () => {
  const originalDefense = wishbone.players.filter(p => p.side === 'defense');

  it('offense: only offensive players, exactly as they are', () => {
    expect(captureFormationPlayers(wishbone.players, 'offense')).toEqual(wishbone.players.filter(p => p.side === 'offense'));
  });

  it('defense: keeps every defender where the coach put them and records a technique for each', () => {
    const captured = captureFormationPlayers(wishbone.players, 'defense');
    expect(captured.map(p => [p.id, p.x, p.y])).toEqual(originalDefense.map(p => [p.id, p.x, p.y]));
    expect(captured.every(p => p.technique && p.technique.trim().length > 0)).toBe(true);
  });

  it('defense: an explicit technique is never overwritten', () => {
    const captured = captureFormationPlayers(wishbone.players, 'defense');
    originalDefense.filter(p => p.technique).forEach((p, i) => expect(captured.find(c => c.id === p.id)?.technique, String(i)).toBe(p.technique));
  });

  it('both: the players as-is', () => {
    expect(captureFormationPlayers(wishbone.players, 'both')).toBe(wishbone.players);
  });
});

describe('buildFormationFromPlay', () => {
  const ace = template('formation-single-back-ace');

  it('re-saving an existing template keeps its id, name and the fields a save used to drop', () => {
    const rebuilt = buildFormationFromPlay({ ...wishbone, formationOffense: ace.name, formationOffenseId: ace.id }, 'offense', ace);
    expect(rebuilt.id).toBe(ace.id);
    expect(rebuilt.name).toBe(ace.name);
    expect(rebuilt.receiverAlignment).toBe(ace.receiverAlignment);
    expect(rebuilt.isBunch).toBe(ace.isBunch);
    expect(rebuilt.tags).toEqual(ace.tags);
    expect(rebuilt.personnel).toBe(ace.personnel);
  });

  it('refreshes players, QB alignment and the edit time from the play', () => {
    const rebuilt = buildFormationFromPlay({ ...wishbone, formationOffense: ace.name }, 'offense', ace);
    expect(rebuilt.players).toEqual(wishbone.players.filter(p => p.side === 'offense'));
    expect(rebuilt.qbPosition).toBe(detectCurrentQBPosition(rebuilt.players));
    expect(Date.parse(rebuilt.updatedAt ?? '')).not.toBeNaN();
  });

  it('a new offense template gets a generated id and takes its name from the play', () => {
    const fresh = buildFormationFromPlay({ ...wishbone, formationOffense: 'My New Set' }, 'offense', undefined);
    expect(fresh.id).toMatch(/^formation-my-new-set-\d{1,4}$/);
    expect(fresh).toMatchObject({ name: 'My New Set', side: 'offense' });
  });

  it('a new defensive front gets a "front-" id and defenders that carry techniques', () => {
    const fresh = buildFormationFromPlay({ ...wishbone, frontDefense: 'My Front' }, 'defense', undefined);
    expect(fresh.id).toMatch(/^front-my-front-\d{1,4}$/);
    expect(fresh.side).toBe('defense');
    expect(fresh.players.every(p => p.technique)).toBe(true);
  });

  it('falls back to a readable name when the play has none', () => {
    expect(buildFormationFromPlay({ ...wishbone, formationOffense: '' }, 'offense', undefined).name).toBe('Custom Offensive Formation');
    expect(buildFormationFromPlay({ ...wishbone, frontDefense: '' }, 'defense', undefined).name).toBe('Custom Defensive Front');
  });

  it('classifies a new front by its down linemen: four is even, three is odd', () => {
    const offense = wishbone.players.filter(p => p.side === 'offense');
    const lineman = (n: number) => ({ ...wishbone.players.find(p => p.position === 'DL' && p.side === 'defense')!, id: `dl${n}`, x: 400 + n * 40 });
    const frontWith = (count: number) => buildFormationFromPlay(
      { ...wishbone, players: [...offense, ...Array.from({ length: count }, (_, n) => lineman(n))], frontDefense: `${count} Down` },
      'defense',
      undefined
    );
    expect(frontWith(4).style).toBe('even_front');
    expect(frontWith(3).style).toBe('odd_front');
  });

  it('an existing template keeps its own style classification', () => {
    const odd = defenseTemplates.find(f => f.style === 'odd_front');
    expect(odd).toBeDefined();
    if (odd) expect(buildFormationFromPlay({ ...wishbone, frontDefense: odd.name }, 'defense', odd).style).toBe('odd_front');
  });
});
