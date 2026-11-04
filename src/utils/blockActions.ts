import type { BlockAssignment, BlockPlan, BlockTarget, PathAction, Player, Point } from '../types/playbook';
import { analyzeOffense } from './defensiveAlignment';
import { secondLevelDefenders } from './blockSlots';

const STALE_COLOR = '#6b7280';
const PULL_DIP = 20;       // How far behind the line a pulling lineman dips
const PULL_STRIDE = 30;    // How far down the line he travels before turning up
const STUB_LENGTH = 20;

const pointOf = (p: Player): Point => ({ x: p.x, y: p.y });

function targetPoint(target: BlockTarget | undefined, from: Player, players: Player[]): Point | undefined {
  if (!target || target.type === 'none') return undefined;
  if (target.type === 'defender') {
    const defender = players.find(p => p.id === target.playerId && p.side === 'defense');
    return defender ? pointOf(defender) : undefined;
  }
  if (target.type === 'level') {
    const nearest = [...secondLevelDefenders(players)].sort((a, b) => Math.abs(a.x - from.x) - Math.abs(b.x - from.x))[0];
    return nearest ? pointOf(nearest) : undefined;
  }
  const gap = analyzeOffense(players).gaps.find(g => g.label === target.gap && g.side === target.side);
  return gap ? { x: gap.x, y: gap.y } : undefined;
}

function staleActions(assignment: BlockAssignment, blocker: Player, dir: 1 | -1, previous: PathAction[]): PathAction[] {
  const old = previous.filter(a => a.assignmentId === assignment.id);
  if (old.length > 0) {
    return old.map(a => ({ ...a, color: STALE_COLOR, label: 'target gone' }));
  }
  return [{
    id: assignment.id,
    playerId: blocker.id,
    type: 'run_block',
    endMarker: 'tbar',
    assignmentId: assignment.id,
    color: STALE_COLOR,
    label: 'target gone',
    points: [pointOf(blocker), { x: blocker.x + dir * STUB_LENGTH, y: blocker.y - STUB_LENGTH }]
  }];
}

/**
 * Draws a block plan as ordinary block lines. A pull dips behind the line first; a combo adds a second line
 * from the shared defender to the climb target, linked to the first through `parentActionId`.
 * `previous` is the play's current lines, so a stale assignment can keep the line it had.
 */
export function buildBlockActions(plan: BlockPlan, players: Player[], previous: PathAction[] = []): PathAction[] {
  const dir = plan.playSide === 'right' ? 1 : -1;
  const actions: PathAction[] = [];

  for (const assignment of plan.assignments) {
    const blocker = players.find(p => p.id === assignment.playerId);
    if (!blocker) continue;

    if (assignment.stale) {
      actions.push(...staleActions(assignment, blocker, dir, previous));
      continue;
    }

    const end = targetPoint(assignment.target, blocker, players);
    if (!end) continue;

    const start = pointOf(blocker);
    const points = assignment.pulls
      ? [start, { x: blocker.x + dir * PULL_STRIDE, y: blocker.y + PULL_DIP }, end]
      : [start, end];
    const first: PathAction = {
      id: assignment.id,
      playerId: blocker.id,
      type: assignment.pulls ? 'pull_block' : 'run_block',
      endMarker: 'tbar',
      assignmentId: assignment.id,
      isCurved: assignment.pulls ? true : undefined,
      points
    };
    if (first.isCurved === undefined) delete first.isCurved;
    actions.push(first);

    const climb = assignment.comboWith ? targetPoint(assignment.climbTo, blocker, players) : undefined;
    if (climb) {
      actions.push({
        id: `${assignment.id}-climb`,
        playerId: blocker.id,
        type: 'run_block',
        endMarker: 'tbar',
        assignmentId: assignment.id,
        parentActionId: first.id,
        branchType: 'combo',
        points: [end, climb]
      });
    }
  }
  return actions;
}
