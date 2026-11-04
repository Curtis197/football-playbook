import React, { useState } from 'react';
import { X, Trash2, Lock } from 'lucide-react';
import type { PlaySide, Player, RunCall, RunTemplate, Theme } from '../types/playbook';
import { holeName, isValidCall, runnerPlayer } from '../utils/runHoles';

/** "3 · B gap, right": the number a coach calls, and where it is. */
const holeLabel = (hole: number) => `${hole} · ${holeName(hole)}`;

const RUNNER_ROLES = ['QB', 'Fullback', 'Tailback', 'Other back'];

interface RunTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: RunTemplate[];
  players: Player[];
  currentTemplateId?: string;
  /** The call the play currently has, so the picker opens on it */
  currentCall?: RunCall;
  onApply: (template: RunTemplate, call: RunCall) => void;
  onDeleteTemplate: (id: string) => void;
  theme?: Theme;
}

const SIDES: { value: PlaySide; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
];

const RunPicker: React.FC<RunTemplateModalProps> = ({
  onClose,
  templates,
  players,
  currentTemplateId,
  currentCall,
  onApply,
  onDeleteTemplate,
  theme = 'dark'
}) => {
  // Mounted fresh on every opening, so it starts from the play's own call with no template picked
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hole, setHole] = useState(currentCall?.hole ?? 3);
  const [runner, setRunner] = useState(currentCall?.runner ?? 3);
  const [side, setSide] = useState<PlaySide | null>(currentCall?.hole === 0 ? currentCall.side ?? null : null);

  const isLight = theme === 'light';
  const call: RunCall = { hole, runner, side: hole === 0 ? side ?? undefined : undefined };
  const builtIn = templates.filter(t => t.builtIn);
  const mine = templates.filter(t => !t.builtIn);
  const selected = templates.find(t => t.id === selectedId) ?? null;
  const canApply = selected !== null && selected.reviewed && isValidCall(call);

  const panel = isLight ? 'bg-white text-slate-900 border-slate-500' : 'bg-[#0d1117] text-slate-100 border-slate-500';
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
            : isLight ? 'border-slate-500 bg-slate-50' : 'border-slate-500 bg-slate-900'
        } ${locked ? 'opacity-70' : ''}`}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => {
            setSelectedId(template.id);
            if (template.defaultHole !== undefined) setHole(template.defaultHole);
          }}
          className={`block w-full min-w-0 break-words text-left cursor-pointer disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded ${template.builtIn ? '' : 'pr-7'}`}
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
          <h3 className="text-[11px] font-bold uppercase tracking-wider">The call</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="block">
              <span className="block text-[11px] font-bold mb-1">Hole</span>
              <select
                aria-label="Hole"
                value={hole}
                onChange={(e) => setHole(Number(e.target.value))}
                className={`w-full px-2 py-1 rounded border text-xs ${isLight ? 'bg-white border-slate-500 text-slate-900' : 'bg-slate-900 border-slate-500 text-slate-100'}`}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(h => <option key={h} value={h}>{holeLabel(h)}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold mb-1">Runner</span>
              <select
                aria-label="Runner"
                value={runner}
                onChange={(e) => setRunner(Number(e.target.value))}
                className={`w-full px-2 py-1 rounded border text-xs ${isLight ? 'bg-white border-slate-500 text-slate-900' : 'bg-slate-900 border-slate-500 text-slate-100'}`}
              >
                {[1, 2, 3, 4].map(n => {
                  const who = runnerPlayer(players, n);
                  return <option key={n} value={n}>{n} · {RUNNER_ROLES[n - 1]}{who ? ` (${who.label})` : ' (none on the field)'}</option>;
                })}
              </select>
            </label>
          </div>
          {hole === 0 && (
            <div role="group" aria-label="Side for hole 0" className="space-y-1.5">
              <span className="block text-[11px] font-bold">Hole 0 is over the center: which way does it go?</span>
              <div className="flex flex-wrap gap-1.5">
                {SIDES.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={side === option.value}
                    onClick={() => setSide(option.value)}
                    className={`px-3 py-1 rounded border text-xs font-bold cursor-pointer ${
                      side === option.value
                        ? isLight ? 'bg-sky-700 text-white border-sky-800' : 'bg-sky-700 text-white border-sky-300'
                        : isLight ? 'bg-slate-100 border-slate-500' : 'bg-slate-800 border-slate-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className={`text-[11px] ${muted}`}>Odd holes go right, even holes go left.</p>
        </section>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className={`px-3 py-1.5 rounded border text-xs font-bold cursor-pointer ${isLight ? 'border-slate-500 bg-slate-100' : 'border-slate-500 bg-slate-800'}`}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={() => selected && onApply(selected, call)}
            className="px-3 py-1.5 rounded text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply to play
          </button>
        </div>
      </div>
    </div>
  );
};

export const RunTemplateModal: React.FC<RunTemplateModalProps> = (props) =>
  props.isOpen ? <RunPicker {...props} /> : null;
