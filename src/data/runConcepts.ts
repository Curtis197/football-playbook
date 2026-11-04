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
    defaultHole: 3,
    description: 'Zone block: take the first defender toward the play side; with nobody on the line, combo away from the play side, then climb.',
    rules: zoneRules()
  },
  {
    id: 'run-outside-zone',
    name: 'Outside Zone',
    scheme: 'zone',
    builtIn: true,
    reviewed: true,
    defaultHole: 5,
    description: 'Same zone blocks as Inside Zone; it differs only in the hole it is called to.',
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
    defaultHole: 3,
    description: 'Play side down-blocks, backside guard pulls and kicks out the first defender outside the hole, backside tackle seals, the other back leads.',
    rules: rules({ te_ps: 'down', ot_ps: 'down', og_ps: 'down', c: 'down', og_bs: 'kickout', ot_bs: 'seal', fb: 'lead' })
  },
  {
    id: 'run-counter',
    name: 'Counter',
    scheme: 'gap',
    builtIn: true,
    reviewed: false,
    defaultHole: 3,
    description: 'Play side down-blocks, center seals, backside guard kicks out, backside tackle wraps to the linebacker nearest the hole, the other back leads.',
    rules: rules({ te_ps: 'down', ot_ps: 'down', og_ps: 'down', c: 'seal', og_bs: 'kickout', ot_bs: 'wrap', fb: 'lead' })
  },
  {
    id: 'run-trap',
    name: 'Trap',
    scheme: 'gap',
    builtIn: true,
    reviewed: false,
    defaultHole: 1,
    description: 'Backside guard traps the first defender on the line inside the hole; tight end and tackle seal, guard and center down-block, backside tackle seals, the other back leads.',
    rules: rules({ te_ps: 'seal', ot_ps: 'seal', og_ps: 'down', c: 'down', og_bs: 'trap', ot_bs: 'seal', fb: 'lead' })
  }
);
