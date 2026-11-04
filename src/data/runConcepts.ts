import type { BlockSlot, RunTemplate } from '../types/playbook';

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
