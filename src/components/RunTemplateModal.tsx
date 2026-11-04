import React, { useState } from 'react';
import { X, Trash2, Lock } from 'lucide-react';
import type { Player, RunTemplate, Theme } from '../types/playbook';
import { hasClearStrength } from '../utils/blockSlots';

export type RequestedPlaySide = 'left' | 'right' | 'strong' | 'weak';

interface RunTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: RunTemplate[];
  players: Player[];
  currentTemplateId?: string;
  onApply: (template: RunTemplate, playSide: RequestedPlaySide) => void;
  onDeleteTemplate: (id: string) => void;
  theme?: Theme;
}

const SIDES: { value: RequestedPlaySide; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'strong', label: 'Strong' },
  { value: 'weak', label: 'Weak' }
];

export const RunTemplateModal: React.FC<RunTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  players,
  currentTemplateId,
  onApply,
  onDeleteTemplate,
  theme = 'dark'
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [side, setSide] = useState<RequestedPlaySide>('right');
  if (!isOpen) return null;

  const isLight = theme === 'light';
  const clearStrength = hasClearStrength(players);
  // A strong/weak choice that the formation cannot answer falls back to a side the coach can actually apply
  const effectiveSide: RequestedPlaySide = !clearStrength && (side === 'strong' || side === 'weak') ? 'right' : side;
  const builtIn = templates.filter(t => t.builtIn);
  const mine = templates.filter(t => !t.builtIn);
  const selected = templates.find(t => t.id === selectedId) ?? null;
  const canApply = selected !== null && selected.reviewed;

  const panel = isLight ? 'bg-white text-slate-900 border-slate-400' : 'bg-[#0d1117] text-slate-100 border-slate-600';
  const muted = isLight ? 'text-slate-700' : 'text-slate-300';

  const card = (template: RunTemplate) => {
    const isSelected = template.id === selectedId;
    const locked = !template.reviewed;
    return (
      <div
        key={template.id}
        className={`relative rounded-lg border p-2.5 text-left ${
          isSelected
            ? isLight ? 'border-sky-700 bg-sky-50' : 'border-sky-400 bg-sky-950'
            : isLight ? 'border-slate-400 bg-slate-50' : 'border-slate-600 bg-slate-900'
        } ${locked ? 'opacity-70' : ''}`}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => setSelectedId(template.id)}
          className={`block w-full text-left cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded ${template.builtIn ? '' : 'pr-7'}`}
          aria-pressed={isSelected}
        >
          <span className="flex items-center gap-1.5 text-xs font-bold">
            {locked && <Lock className="w-3 h-3" aria-hidden="true" />}
            {template.name}
            {template.id === currentTemplateId && <span className="text-[10px] font-semibold">(on this play)</span>}
          </span>
          <span className={`block text-[11px] mt-1 leading-snug ${muted}`}>
            {locked ? 'Rules awaiting coach check' : template.description ?? (template.scheme === 'zone' ? 'Zone scheme' : 'Gap scheme')}
          </span>
        </button>
        {!template.builtIn && (
          <button
            type="button"
            onClick={() => onDeleteTemplate(template.id)}
            aria-label={`Delete template ${template.name}`}
            className={`absolute top-1.5 right-1.5 p-1 rounded cursor-pointer ${isLight ? 'text-rose-800 hover:bg-rose-100' : 'text-rose-300 hover:bg-rose-950'}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Choose a run">
      <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border shadow-2xl p-4 space-y-4 ${panel}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Choose a run</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded cursor-pointer hover:bg-slate-500/20">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">Run templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{builtIn.map(card)}</div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">My templates</h3>
          {mine.length === 0 ? (
            <p className={`text-[11px] ${muted}`}>Nothing saved yet. Apply a run, adjust a block, then use Save as template on the play bar.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{mine.map(card)}</div>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider">Play side</h3>
          <div role="group" aria-label="Play side" className="flex flex-wrap gap-1.5">
            {SIDES.map(option => {
              const needsStrength = option.value === 'strong' || option.value === 'weak';
              const disabled = needsStrength && !clearStrength;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  aria-pressed={effectiveSide === option.value}
                  title={disabled ? 'This formation has no clear strong side' : undefined}
                  onClick={() => setSide(option.value)}
                  className={`px-3 py-1 rounded border text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    effectiveSide === option.value
                      ? isLight ? 'bg-sky-700 text-white border-sky-800' : 'bg-sky-600 text-white border-sky-300'
                      : isLight ? 'bg-slate-100 border-slate-500' : 'bg-slate-800 border-slate-500'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {!clearStrength && <p className={`text-[11px] ${muted}`}>Strong and weak are off: this formation has no clear strong side.</p>}
        </section>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={`px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${isLight ? 'border-slate-500 bg-slate-100' : 'border-slate-500 bg-slate-800'}`}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={() => selected && onApply(selected, effectiveSide)}
            className="px-3 py-1.5 rounded text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply to play
          </button>
        </div>
      </div>
    </div>
  );
};
