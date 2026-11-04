import type { BlockKind, BlockRule, BlockSlot, RunTemplate, TargetRule, TemplateOverride } from '../types/playbook';

const STORAGE_KEY = 'antigravity_football_run_templates_v1';

const SLOTS: readonly BlockSlot[] = ['te_ps', 'ot_ps', 'og_ps', 'c', 'og_bs', 'ot_bs', 'te_bs', 'fb'];
const KINDS: readonly BlockKind[] = ['zone', 'down', 'kickout', 'trap', 'wrap', 'seal', 'lead'];
const GAPS = ['A', 'B', 'C', 'D'];

type Raw = Record<string, unknown>;
const isRecord = (value: unknown): value is Raw => typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function normalizeTargetRule(raw: unknown): TargetRule | undefined {
  if (!isRecord(raw)) return undefined;
  if (raw.by === 'level') return { by: 'level' };
  if (raw.by === 'none') return { by: 'none' };
  if (raw.by === 'technique' && isText(raw.technique)) return { by: 'technique', technique: raw.technique };
  if (raw.by === 'gap' && GAPS.includes(raw.gap as string) && (raw.relativeSide === 'playside' || raw.relativeSide === 'backside')) {
    return { by: 'gap', gap: raw.gap as 'A' | 'B' | 'C' | 'D', relativeSide: raw.relativeSide };
  }
  return undefined;
}

function normalizeOverride(raw: unknown): TemplateOverride | undefined {
  if (!isRecord(raw) || !SLOTS.includes(raw.slot as BlockSlot)) return undefined;
  const override: TemplateOverride = { slot: raw.slot as BlockSlot };
  const target = normalizeTargetRule(raw.target);
  if (target) override.target = target;
  if (raw.comboWithSlot === null) override.comboWithSlot = null;
  else if (SLOTS.includes(raw.comboWithSlot as BlockSlot)) override.comboWithSlot = raw.comboWithSlot as BlockSlot;
  if (typeof raw.pulls === 'boolean') override.pulls = raw.pulls;
  return override;
}

/**
 * Checks an untrusted run template (localStorage, Firestore). Unreadable parts are dropped; no id or name rejects it.
 * It fails closed: only an explicit `reviewed: true` counts as reviewed, and `builtIn` is never read from storage.
 */
export function normalizeRunTemplate(raw: unknown): RunTemplate | undefined {
  if (!isRecord(raw) || !isText(raw.id) || !isText(raw.name)) return undefined;
  if (raw.scheme !== 'zone' && raw.scheme !== 'gap') return undefined;

  const rules: Partial<Record<BlockSlot, BlockRule>> = {};
  if (isRecord(raw.rules)) {
    for (const [slot, rule] of Object.entries(raw.rules)) {
      if (SLOTS.includes(slot as BlockSlot) && isRecord(rule) && KINDS.includes(rule.kind as BlockKind)) {
        rules[slot as BlockSlot] = { kind: rule.kind as BlockKind };
      }
    }
  }

  const template: RunTemplate = { id: raw.id, name: raw.name, scheme: raw.scheme, reviewed: raw.reviewed === true, rules };
  if (typeof raw.description === 'string') template.description = raw.description;
  if (typeof raw.updatedAt === 'string') template.updatedAt = raw.updatedAt;
  if (Array.isArray(raw.overrides)) {
    const overrides = raw.overrides.map(normalizeOverride).filter((o): o is TemplateOverride => o !== undefined);
    if (overrides.length > 0) template.overrides = overrides;
  }
  return template;
}

/** Run templates that exist only on this device: saved or edited while the cloud was unreachable (or not set up). */
export function loadStoredRunTemplates(): RunTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(normalizeRunTemplate).filter((t): t is RunTemplate => t !== undefined);
  } catch (err) {
    console.warn('Could not read stored run templates:', err);
    return [];
  }
}

export function saveStoredRunTemplates(templates: RunTemplate[]): void {
  try {
    if (templates.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Could not store run templates on this device:', err);
  }
}

/**
 * Same custom id: this device's copy wins over the cloud's. Built-ins are never replaced or shadowed by stored
 * templates, so a stored copy cannot unlock a rule set the coach has not reviewed. Custom templates come first.
 */
export function mergeRunTemplateSources(builtIn: RunTemplate[], remote: RunTemplate[], deviceOnly: RunTemplate[]): RunTemplate[] {
  const builtInIds = new Set(builtIn.map(t => t.id));
  const custom = new Map<string, RunTemplate>();
  [...remote, ...deviceOnly].filter(t => !builtInIds.has(t.id)).forEach(t => custom.set(t.id, t));
  return [...custom.values(), ...builtIn];
}
