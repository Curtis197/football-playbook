import React from 'react';
import type { CanvasMode, AppMode, Theme } from '../types/playbook';
import {
  MousePointer,
  CornerUpRight,
  ShieldAlert,
  Activity,
  PlusCircle,
  Shield,
  Trash2,
  Info,
  Undo2,
  Redo2,
  type LucideIcon
} from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: CanvasMode;
  onSetMode: (mode: CanvasMode) => void;
  appMode?: AppMode;
  onSetAppMode?: (mode: AppMode) => void;
  theme?: Theme;
  selectedPlayerId: string | null;
  selectedActionId: string | null;
  onDeleteSelected: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

type Tone = 'sky' | 'amber' | 'purple' | 'rose';

// Until the 2xl breakpoint the rail is icon-only, so the icon is the only label and must read on its own:
// 700-shades on the light rail, 400-shades on the dark one.
const ICON_TONE: Record<Tone, { light: string; dark: string }> = {
  sky: { light: 'text-sky-700', dark: 'text-sky-400' },
  amber: { light: 'text-amber-700', dark: 'text-amber-400' },
  purple: { light: 'text-purple-700', dark: 'text-purple-400' },
  rose: { light: 'text-rose-700', dark: 'text-rose-400' }
};

const TOOLS: { id: CanvasMode; label: string; Icon: LucideIcon; tone: Tone; desc: string }[] = [
  { id: 'select', label: 'Select / Move', Icon: MousePointer, tone: 'sky', desc: 'Drag players or adjust route waypoints' },
  { id: 'draw_route', label: 'Draw Route', Icon: CornerUpRight, tone: 'sky', desc: 'Pass route with arrowhead marker' },
  { id: 'draw_block', label: 'Draw Block', Icon: ShieldAlert, tone: 'amber', desc: 'Multi-point block track with T-Bar marker' },
  { id: 'draw_motion', label: 'Draw Motion', Icon: Activity, tone: 'purple', desc: 'Pre-snap motion vector track' },
  { id: 'add_offense', label: '+ Offense Player', Icon: PlusCircle, tone: 'sky', desc: 'Click on field to add an offensive player' },
  { id: 'add_defense', label: '+ Defense Player', Icon: Shield, tone: 'rose', desc: 'Click on field to add a defensive player' }
];

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onSetMode,
  appMode = 'build',
  onSetAppMode,
  theme = 'dark',
  selectedPlayerId,
  selectedActionId,
  onDeleteSelected,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo
}) => {
  const isLight = theme === 'light';
  const isBuild = appMode === 'build';

  const historyButtonClass = (enabled: boolean) =>
    `flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
      enabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
    } ${
      isLight
        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-500'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-500'
    }`;

  // Picking a tool is a decision to edit, so it leaves View mode (the only other way back is the toolbar toggle)
  const handleToolClick = (toolId: CanvasMode) => {
    if (onSetAppMode && !isBuild) {
      onSetAppMode('build');
    }
    onSetMode(toolId);
  };

  const historyEnabled = isBuild;

  return (
    <aside className={`w-16 2xl:w-56 ${isLight ? 'bg-white border-r border-slate-200 text-slate-800' : 'bg-[#161b22] border-r border-[#30363d] text-slate-200'} flex flex-col justify-between p-2 select-none z-10 shrink-0`}>
      <div className="flex flex-col gap-1">
        {onUndo && onRedo && (
          <div className="flex flex-col 2xl:flex-row gap-1 mb-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo || !historyEnabled}
              aria-label="Undo"
              className={historyButtonClass(canUndo && historyEnabled)}
              title={historyEnabled ? 'Undo (Ctrl+Z)' : 'Undo is off in View mode'}
            >
              <Undo2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo || !historyEnabled}
              aria-label="Redo"
              className={historyButtonClass(canRedo && historyEnabled)}
              title={historyEnabled ? 'Redo (Ctrl+Shift+Z)' : 'Redo is off in View mode'}
            >
              <Redo2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden 2xl:inline">Redo</span>
            </button>
          </div>
        )}

        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} px-2 py-1 hidden 2xl:block`}>
          {isBuild ? 'Build Tools' : 'Chalkboard Tools'}
        </span>

        {TOOLS.map(({ id, label, Icon, tone, desc }) => {
          const isActive = isBuild && currentMode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleToolClick(id)}
              aria-label={label}
              aria-pressed={isActive}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-sky-50 border border-sky-700 text-sky-900 shadow-sm'
                    : 'bg-sky-600/20 border border-sky-500/50 text-sky-300 shadow-sm'
                  : isLight
                  ? 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title={`${label}: ${desc}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${ICON_TONE[tone][isLight ? 'light' : 'dark']}`} aria-hidden="true" />
              <div className="hidden 2xl:block overflow-hidden">
                <div className={`text-xs font-semibold leading-none ${isActive ? (isLight ? 'text-sky-900 font-bold' : 'text-sky-300') : ''}`}>{label}</div>
                <div className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} truncate mt-0.5`}>{desc}</div>
              </div>
            </button>
          );
        })}

        {/* Delete selection button: editing only */}
        {isBuild && (selectedPlayerId || selectedActionId) && (
          <div className={`mt-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
            <button
              type="button"
              onClick={onDeleteSelected}
              aria-label="Delete selected"
              className={`w-full flex items-center gap-2 p-2.5 rounded-lg ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border border-rose-700 text-rose-800'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/60 text-rose-300'
              } transition-all text-left cursor-pointer`}
              title="Delete selected player or vector path"
            >
              <Trash2 className={`w-5 h-5 shrink-0 ${isLight ? 'text-rose-700' : 'text-rose-400'}`} aria-hidden="true" />
              <div className="hidden 2xl:block">
                <div className="text-xs font-bold leading-none">Delete Selected</div>
                <div className={`text-[10px] ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                  {selectedPlayerId ? 'Remove player' : 'Remove vector'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER TIPS */}
      <div className={`hidden 2xl:flex flex-col gap-1.5 p-2 ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/70 border-slate-800 text-slate-400'
      } border rounded-lg text-[11px]`}>
        <div className={`flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>
          <Info className={`w-3.5 h-3.5 ${isLight ? 'text-sky-700' : 'text-sky-400'}`} aria-hidden="true" />
          <span>{isBuild ? 'Build Mode Tips' : 'View Mode Tips'}</span>
        </div>
        {isBuild ? (
          <>
            <p className="leading-tight text-[10px]">
              • Hover overlays are hidden during building so you can draw cleanly.
            </p>
            <p className="leading-tight text-[10px]">
              • Click any player to view and edit assignments in the side panel.
            </p>
          </>
        ) : (
          <p className={`leading-tight text-[10px] ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
            • View mode is read-only: hover a player to read their assignment and coaching keys. Pick a tool or switch to Build in the top bar to edit.
          </p>
        )}
      </div>
    </aside>
  );
};
