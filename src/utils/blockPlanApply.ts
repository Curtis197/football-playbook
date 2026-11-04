import type { BlockAssignment, BlockPlan, BlockTarget, PathAction, Play, PlaySide, Player, RunTemplate, TargetRule, TemplateOverride } from '../types/playbook';
import { buildBlockActions } from './blockActions';
import { hasClearStrength, resolveStrongSide } from './blockSlots';
import { resolveBlockPlan } from './runTemplates';

const isBlockLine = (action: PathAction) => action.type === 'run_block' || action.type === 'pull_block';

/** What the coach can change on one assignment. `comboWith: null` removes the combo. */
export interface AssignmentChange {
  target?: BlockTarget;
  comboWith?: string | null;
  pulls?: boolean;
}

/**
 * Puts a run template on a play: every blocking line on the play (generated or hand-drawn) is replaced
 * by the template's lines. Routes and motions are untouched.
 */
export function applyRunTemplate(play: Play, template: RunTemplate, playSide: PlaySide): Play {
  const blockPlan = resolveBlockPlan(template, play.players, playSide);
  return {
    ...play,
    primaryRunConcept: template.name,
    blockPlan,
    actions: [...play.actions.filter(a => !isBlockLine(a)), ...buildBlockActions(blockPlan, play.players, play.actions)]
  };
}

const defenderExists = (target: BlockTarget, players: Player[]) =>
  target.type !== 'defender' || players.some(p => p.id === target.playerId && p.side === 'defense');

/**
 * Re-aims a play's blocks at the players now on the board. Assignments the coach edited are kept as they
 * are; if the defender they point at is gone they are flagged stale instead of being silently retargeted.
 * A play with no block plan (or an unknown template) comes back untouched.
 */
export function reaimBlocks(play: Play, templates: RunTemplate[]): Play {
  const current = play.blockPlan;
  if (!current) return play;
  const template = templates.find(t => t.id === current.templateId);
  if (!template) return play;

  const fresh = resolveBlockPlan(template, play.players, current.playSide);
  const edited = new Map(current.assignments.filter(a => a.override).map(a => [a.id, a]));
  const present = (playerId: string) => play.players.some(p => p.id === playerId);

  const assignments = fresh.assignments.map((assignment): BlockAssignment => {
    const old = edited.get(assignment.id);
    if (!old || !present(old.playerId)) return assignment;
    const kept: BlockAssignment = { ...old };
    delete kept.stale;
    if (kept.comboWith && !present(kept.comboWith)) {
      delete kept.comboWith;
      delete kept.climbTo;
    }
    if (!defenderExists(kept.target, play.players)) kept.stale = true;
    return kept;
  });

  const blockPlan: BlockPlan = { ...current, assignments };
  return {
    ...play,
    blockPlan,
    actions: [...play.actions.filter(a => !a.assignmentId), ...buildBlockActions(blockPlan, play.players, play.actions)]
  };
}

/** Removes the template's blocks and detaches it from the play. Hand-drawn lines stay. */
export function clearBlocks(play: Play): Play {
  const { blockPlan: _removed, ...rest } = play;
  return { ...rest, actions: play.actions.filter(a => !a.assignmentId) };
}

/** Applies a hand edit to one assignment and redraws only that assignment's lines. */
export function editAssignment(play: Play, assignmentId: string, change: AssignmentChange): Play {
  const plan = play.blockPlan;
  const old = plan?.assignments.find(a => a.id === assignmentId);
  if (!plan || !old) return play;

  const updated: BlockAssignment = { ...old, override: true };
  delete updated.stale;
  if (change.target) updated.target = change.target;
  if (change.comboWith === null) {
    delete updated.comboWith;
    delete updated.climbTo;
  } else if (change.comboWith) {
    updated.comboWith = change.comboWith;
    updated.climbTo ??= { type: 'level', level: 'second' };
  }
  if (change.pulls === true) updated.pulls = true;
  if (change.pulls === false) delete updated.pulls;

  const blockPlan: BlockPlan = { ...plan, assignments: plan.assignments.map(a => (a.id === assignmentId ? updated : a)) };
  return {
    ...play,
    blockPlan,
    actions: [
      ...play.actions.filter(a => a.assignmentId !== assignmentId),
      ...buildBlockActions({ ...blockPlan, assignments: [updated] }, play.players, play.actions)
    ]
  };
}

/**
 * Left and right pass through. Strong and weak become left or right using the formation's strength,
 * or null when the formation has no clear strong side (the coach must pick left or right).
 */
export function resolvePlaySide(
  requested: 'left' | 'right' | 'strong' | 'weak',
  players: Player[]
): PlaySide | null {
  if (requested === 'left' || requested === 'right') return requested;
  if (!hasClearStrength(players)) return null;
  const strong = resolveStrongSide(players);
  if (requested === 'strong') return strong;
  return strong === 'right' ? 'left' : 'right';
}

const targetRuleOf = (target: BlockTarget, plan: BlockPlan, players: Player[]): TargetRule | undefined => {
  if (target.type === 'defender') {
    const technique = players.find(p => p.id === target.playerId)?.technique;
    return technique ? { by: 'technique', technique } : { by: 'level' };
  }
  if (target.type === 'level') return { by: 'level' };
  if (target.type === 'gap') return { by: 'gap', gap: target.gap, relativeSide: target.side === plan.playSide ? 'playside' : 'backside' };
  return undefined;
};

/**
 * Saves a play's blocks as a template: the base template's rules plus the coach's hand edits, written
 * relative to slots and techniques so they apply to other formations and fronts. Stale edits and pure
 * geometry changes are not saved. Updating (`existingId`) keeps the earlier edits of the same slots' siblings.
 */
export function captureRunTemplate(play: Play, base: RunTemplate, name: string, existingId?: string): RunTemplate {
  const plan = play.blockPlan;
  const captured: TemplateOverride[] = [];
  const untouched = plan ? resolveBlockPlan(base, play.players, plan.playSide).assignments : [];
  const sameTarget = (a: BlockTarget, b: BlockTarget) => JSON.stringify(a) === JSON.stringify(b);
  for (const a of plan?.assignments ?? []) {
    if (!plan || !a.override || a.stale) continue;
    const original = untouched.find(u => u.slot === a.slot);
    // Only what the coach changed relative to what the template would have drawn is saved
    const override: TemplateOverride = { slot: a.slot };
    if (!original || !sameTarget(a.target, original.target)) {
      const target = targetRuleOf(a.target, plan, play.players);
      if (target) override.target = target;
    }
    if (a.comboWith && a.comboWith !== original?.comboWith) {
      const partner = plan.assignments.find(other => other.playerId === a.comboWith);
      if (partner) override.comboWithSlot = partner.slot;
    }
    if ((a.pulls === true) !== (original?.pulls === true)) override.pulls = a.pulls === true;
    if (Object.keys(override).length > 1) captured.push(override);
  }

  const capturedSlots = new Set(captured.map(o => o.slot));
  const overrides = [...(base.overrides ?? []).filter(o => !capturedSlots.has(o.slot)), ...captured];
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'template';
  const template: RunTemplate = {
    id: existingId ?? `run-user-${slug}-${Date.now().toString().slice(-4)}`,
    name,
    scheme: base.scheme,
    builtIn: false,
    reviewed: true,
    rules: { ...base.rules },
    updatedAt: new Date().toISOString()
  };
  if (base.description) template.description = base.description;
  if (overrides.length > 0) template.overrides = overrides;
  return template;
}
