/**
 * Arithmetic check for receiver numbering (#1/#2/#3 outside-in) and route mapping.
 * Run: npm run check:receivers   (exit code 1 when the defense and route counters disagree)
 */
import { analyzeOffense } from '../src/utils/defensiveAlignment';
import { categorizeOffensivePlayers, adaptRoutesToNewFormation } from '../src/utils/routeAdaptation';
import { BASIC_PASSING_CONCEPTS_PLAYS } from '../src/data/passingConcepts';
import { INITIAL_PLAYBOOK } from '../src/data/presets';
import { MATRIX_OFFENSIVE_FORMATIONS } from '../src/data/offensiveFormationsMatrix';
import type { PathAction, Player } from '../src/types/playbook';

interface Source { id: string; name: string; players: Player[] }
const seen = new Set<string>();
const sources: Source[] = [
  ...[...BASIC_PASSING_CONCEPTS_PLAYS, ...INITIAL_PLAYBOOK.plays].map(p => ({ id: p.id, name: p.name, players: p.players })),
  ...MATRIX_OFFENSIVE_FORMATIONS.filter(f => f.side !== 'defense').map(f => ({ id: f.id, name: f.name, players: f.players })),
].filter(s => (seen.has(s.id + "|" + s.name) ? false : (seen.add(s.id + "|" + s.name), true)));

const ids = (ps: Player[]) => ps.map(p => p.id).join(',');
const fmt = (ps: Player[]) => ps.map((p, i) => `#${i + 1}:${p.label}@${p.x}`).join(' ') || '-';

// 1. The defense counter and the route counter must produce identical numbering.
let mismatches = 0;
for (const s of sources) {
  const def = analyzeOffense(s.players);
  const route = categorizeOffensivePlayers(s.players);
  if (ids(def.allReceiversLeft) !== ids(route.leftReceivers) || ids(def.allReceiversRight) !== ids(route.rightReceivers)) {
    mismatches++;
    console.log(`MISMATCH ${s.name}`);
    console.log(`  defense L[${fmt(def.allReceiversLeft)}] R[${fmt(def.allReceiversRight)}]`);
    console.log(`  route   L[${fmt(route.leftReceivers)}] R[${fmt(route.rightReceivers)}]`);
  }
}
console.log(`sources: ${sources.length}   defense != route numbering: ${mismatches}`);

// 2. Route mapping: one route per receiver, every source onto every other formation.
let swaps = 0, routes = 0, stacked = 0, orphaned = 0;
for (const src of sources) {
  const r = categorizeOffensivePlayers(src.players);
  const receivers = [...r.leftReceivers, ...r.rightReceivers];
  const actions = receivers.map((p, i) => ({
    id: `a${i}`,
    playerId: p.id,
    type: 'route',
    points: [{ x: p.x, y: p.y }, { x: p.x, y: p.y - 100 }]
  })) as unknown as PathAction[];
  for (const tgt of sources) {
    if (tgt === src) continue;
    swaps++;
    routes += actions.length;
    const out = adaptRoutesToNewFormation(actions, src.players, tgt.players.filter(p => p.side === 'offense'), 'concept_numbered');
    const used = out.map(a => a.playerId);
    stacked += used.length - new Set(used).size;
    orphaned += out.filter(a => !tgt.players.some(p => p.id === a.playerId)).length;
  }
}
console.log(`swaps: ${swaps}   routes: ${routes}   stacked on one player: ${stacked}   left without a matching receiver: ${orphaned}`);
console.log('(stacked is non-zero only when two plays share a player id; orphaned routes keep their place by design)');

if (mismatches > 0) {
  console.error('FAIL: the two receiver counters disagree');
  process.exit(1);
}
console.log('OK');
