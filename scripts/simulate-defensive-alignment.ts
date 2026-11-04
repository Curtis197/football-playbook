/**
 * Arithmetic check for defensive alignment: every defensive package against every offensive
 * alignment. Fails (exit 1) on an unrecognized technique, a defender off the board, a corner
 * that is not exactly 12 px inside #1, or two defenders overlapping (nodes are 32 px wide).
 * Run: npm run check:defense   (add --v to list every finding)
 */
import { analyzeOffense, loadDefensivePackage, DEFENSIVE_PACKAGES, calculateDefensiveAlignmentPosition } from '../src/utils/defensiveAlignment';
import { BASIC_PASSING_CONCEPTS_PLAYS } from '../src/data/passingConcepts';
import { INITIAL_PLAYBOOK } from '../src/data/presets';
import { MATRIX_OFFENSIVE_FORMATIONS } from '../src/data/offensiveFormationsMatrix';
import type { Player } from '../src/types/playbook';

const NODE_R = 16; // ChalkboardCanvas draws players with r=16
const NODE_D = 2 * NODE_R;
const verbose = process.argv.includes('--v');

const seen = new Set<string>();
const sources = [
  ...[...BASIC_PASSING_CONCEPTS_PLAYS, ...INITIAL_PLAYBOOK.plays].map(p => ({ id: p.id, name: p.name, players: p.players })),
  ...MATRIX_OFFENSIVE_FORMATIONS.filter(f => f.side !== 'defense').map(f => ({ id: f.id, name: f.name, players: f.players })),
].filter(s => (seen.has(s.id + "|" + s.name) ? false : (seen.add(s.id + "|" + s.name), true)));

const dist = (a: Player, b: Player) => Math.hypot(a.x - b.x, a.y - b.y);
const failures: string[] = [];
let combos = 0;

for (const src of sources) {
  const structure = analyzeOffense(src.players.filter(p => p.side === 'offense'));
  for (const pkg of DEFENSIVE_PACKAGES) {
    combos++;
    const placed = loadDefensivePackage(pkg, [], structure);
    const where = `${src.name} | ${pkg.name}`;
    pkg.defenders.forEach((d, i) => {
      const p = placed[i];
      if (!calculateDefensiveAlignmentPosition(d.technique, structure).matched) failures.push(`UNMATCHED ${where} | ${d.technique}`);
      if (p.x < NODE_R || p.x > 1000 - NODE_R || p.y < NODE_R) failures.push(`OFF-BOARD ${where} | ${d.label} ${d.technique} (${p.x},${p.y})`);
      if (/^off cb/i.test(d.technique)) {
        const n1 = /left/i.test(d.technique) ? structure.number1Left : structure.number1Right;
        if (n1 && Math.abs(p.x - n1.x) !== 12) failures.push(`CB-LEVERAGE ${where} | ${d.technique} x=${p.x} #1=${n1.x}`);
      }
      for (let j = i + 1; j < placed.length; j++) {
        const gap = dist(p, placed[j]);
        if (gap < NODE_D) {
          failures.push(`OVERLAP ${where} | ${d.label}[${d.technique}] x ${pkg.defenders[j].label}[${pkg.defenders[j].technique}] d=${gap.toFixed(0)}`);
        }
      }
    });
  }
}

console.log(`offense alignments: ${sources.length}   packages: ${DEFENSIVE_PACKAGES.length}   combinations: ${combos}   node diameter: ${NODE_D}px`);
console.log(`findings: ${failures.length}`);
failures.slice(0, verbose ? failures.length : 15).forEach(f => console.log('  ' + f));
if (failures.length > 0) {
  console.error('FAIL');
  process.exit(1);
}
console.log('OK');
