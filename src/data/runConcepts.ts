import type { BlockKind, BlockSlot, RunTemplate } from '../types/playbook';

const ZONE_SLOTS: BlockSlot[] = ['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs'];

function zoneRules(): RunTemplate['rules'] {
  return Object.fromEntries(ZONE_SLOTS.map(slot => [slot, { kind: 'zone' as const }]));
}

/**
 * Built-in run templates. Each rule is read per blocker slot (see utils/blockSlots.ts).
 * Gap-scheme templates are added with `reviewed: false` until the coach has signed off their rules.
 */
export const BUILT_IN_RUN_TEMPLATES: RunTemplate[] = [
  {
    id: 'run-inside-zone',
    name: 'Inside Zone',
    scheme: 'zone',
    builtIn: true,
    reviewed: true,
    description: 'Each lineman takes the first defender toward the play side; uncovered linemen combo away from the play side, then climb to the second level.',
    rules: zoneRules()
  },
  {
    id: 'run-outside-zone',
    name: 'Outside Zone',
    scheme: 'zone',
    builtIn: true,
    reviewed: true,
    description: 'Same zone rules as Inside Zone in this version; the stretch aiming point is not modelled yet.',
    rules: zoneRules()
  }
];

const rules = (entries: Partial<Record<BlockSlot, BlockKind>>): RunTemplate['rules'] =>
  Object.fromEntries(Object.entries(entries).map(([slot, kind]) => [slot, { kind }]));

// DRAFT gap-scheme rules from standard conventions. reviewed:false keeps them disabled in the picker
// until the coach has signed them off.
BUILT_IN_RUN_TEMPLATES.push(
  {
    id: 'run-power',
    name: 'Power',
    scheme: 'gap',
    builtIn: true,
    reviewed: false,
    description: 'Play side down-blocks (doubles the interior lineman), backside guard pulls and kicks out the end man, backside tackle seals, fullback leads.',
    rules: rules({ te_ps: 'down', ot_ps: 'down', og_ps: 'down', c: 'down', og_bs: 'kickout', ot_bs: 'seal', fb: 'lead' })
  },
  {
    id: 'run-counter',
    name: 'Counter',
    scheme: 'gap',
    builtIn: true,
    reviewed: false,
    description: 'Play side down-blocks, center seals, backside guard kicks out the end man, backside tackle wraps to the linebacker, fullback leads.',
    rules: rules({ te_ps: 'down', ot_ps: 'down', og_ps: 'down', c: 'seal', og_bs: 'kickout', ot_bs: 'wrap', fb: 'lead' })
  },
  {
    id: 'run-trap',
    name: 'Trap',
    scheme: 'gap',
    builtIn: true,
    reviewed: false,
    description: 'Backside guard traps the first lineman past the play-side guard; tight end and tackle seal outside, guard and center down-block, backside tackle seals, fullback leads.',
    rules: rules({ te_ps: 'seal', ot_ps: 'seal', og_ps: 'down', c: 'down', og_bs: 'trap', ot_bs: 'seal', fb: 'lead' })
  }
);
