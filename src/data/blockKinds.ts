import type { BlockKind } from '../types/playbook';

/** The block types a coach can pick for a blocking line, with the rule each one follows. */
export const BLOCK_KIND_OPTIONS: { value: BlockKind; label: string; rule: string }[] = [
  { value: 'zone', label: 'Zone', rule: 'Zone: block the first on-the-line defender toward the play side. With nobody there, combo with the nearest blocker away from the play side, then climb.' },
  { value: 'down', label: 'Down', rule: 'Down: block the nearest on-the-line defender away from the play side. With nobody there, combo with the nearest blocker away from the play side, then climb.' },
  { value: 'seal', label: 'Seal', rule: 'Seal: same target as Zone, but never combos; with nobody there, climb straight to the second level.' },
  { value: 'kickout', label: 'Kickout', rule: 'Kickout (pulls): block the first on-the-line defender outside the hole.' },
  { value: 'trap', label: 'Trap', rule: 'Trap (pulls): block the first on-the-line defender inside the hole.' },
  { value: 'wrap', label: 'Wrap', rule: 'Wrap (pulls): block the second-level defender nearest the hole.' },
  { value: 'lead', label: 'Lead', rule: 'Lead: the back who is not the runner blocks the second-level defender nearest the hole.' }
];
