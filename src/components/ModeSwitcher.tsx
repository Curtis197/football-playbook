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
  Eye,
  Wrench,
  Undo2,
  Redo2
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
  const historyButtonClass = (enabled: boolean) =>
    `flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
      enabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'
    } ${
      isLight
        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-500'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-500'
    }`;
  const modes: { id: CanvasMode; label: string; icon: React.ReactNode; desc: string; shortcut?: string }[] = [
    {
      id: 'select',
      label: 'Select / Move',
      icon: <MousePointer className="w-5 h-5 text-sky-400" />,
      desc: 'Drag players or adjust route waypoints',
      shortcut: 'V'
    },
    {
      id: 'draw_route',
      label: 'Draw Route',
      icon: <CornerUpRight className="w-5 h-5 text-sky-400" />,
      desc: 'Pass route with arrowhead marker',
      shortcut: 'R'
    },
    {
      id: 'draw_block',
      label: 'Draw Block',
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      desc: 'Multi-point block track with T-Bar marker',
      shortcut: 'B'
    },
    {
      id: 'draw_motion',
      label: 'Draw Motion',
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      desc: 'Pre-snap motion vector track',
      shortcut: 'M'
    },
    {
      id: 'add_offense',
      label: '+ Offense Player',
      icon: <PlusCircle className="w-5 h-5 text-sky-400" />,
      desc: 'Click on field to add offensive player circle',
      shortcut: 'O'
    },
    {
      id: 'add_defense',
      label: '+ Defense Player',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      desc: 'Click on field to add defensive player square',
      shortcut: 'D'
    }
  ];

  const handleToolClick = (toolId: CanvasMode) => {
    if (onSetAppMode && appMode !== 'build') {
      onSetAppMode('build');
    }
    onSetMode(toolId);
  };

  return (
    <aside className={`w-16 md:w-56 ${isLight ? 'bg-white border-r border-slate-200 text-slate-800' : 'bg-[#161b22] border-r border-[#30363d] text-slate-200'} flex flex-col justify-between p-2 select-none z-10 shrink-0`}>
      <div className="flex flex-col gap-1">
        {/* APP MODE TOGGLE (BUILD VS VIEW) */}
        {onSetAppMode && (
          <div className={`flex items-center ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0d1117] border-slate-700/60'} p-1 rounded-lg border mb-2`}>
            <button
              type="button"
              onClick={() => onSetAppMode('build')}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appMode === 'build'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Build Mode: Draw routes, move players, edit annotations on side panel"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Build</span>
            </button>
            <button
              type="button"
              onClick={() => onSetAppMode('view')}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                appMode === 'view'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View Mode: Hover over players to inspect coaching explanations"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">View</span>
            </button>
          </div>
        )}

        {onUndo && onRedo && (
          <div className="flex flex-col md:flex-row gap-1 mb-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              className={historyButtonClass(canUndo)}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              className={historyButtonClass(canRedo)}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">Redo</span>
            </button>
          </div>
        )}

        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-500'} px-2 py-1 hidden md:block`}>
          {appMode === 'view' ? 'Chalkboard Tools' : 'Build Tools'}
        </span>

        {modes.map((m) => {
          const isActive = appMode === 'build' && currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleToolClick(m.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group cursor-pointer ${
                isActive
                  ? isLight
                    ? 'bg-sky-50 border border-sky-400 text-sky-800 shadow-sm'
                    : 'bg-sky-600/20 border border-sky-500/50 text-sky-300 shadow-sm'
                  : isLight
                  ? 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title={`${m.label}: ${m.desc}`}
            >
              <div className="shrink-0">{m.icon}</div>
              <div className="hidden md:block overflow-hidden">
                <div className={`text-xs font-semibold leading-none ${isActive ? (isLight ? 'text-sky-900 font-bold' : 'text-sky-300') : ''}`}>{m.label}</div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} truncate mt-0.5`}>{m.desc}</div>
              </div>
            </button>
          );
        })}

        {/* Delete selection button */}
        {(selectedPlayerId || selectedActionId) && (
          <div className={`mt-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
            <button
              onClick={onDeleteSelected}
              className={`w-full flex items-center gap-2 p-2.5 rounded-lg ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300'
              } transition-all text-left cursor-pointer`}
              title="Delete selected player or vector path"
            >
              <Trash2 className="w-5 h-5 text-rose-500 shrink-0" />
              <div className="hidden md:block">
                <div className="text-xs font-bold leading-none">Delete Selected</div>
                <div className={`text-[10px] ${isLight ? 'text-rose-600' : 'text-rose-400/80'}`}>
                  {selectedPlayerId ? 'Remove player' : 'Remove vector'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER TIPS */}
      <div className={`hidden md:flex flex-col gap-1.5 p-2 ${
        isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/70 border-slate-800 text-slate-400'
      } border rounded-lg text-[11px]`}>
        <div className={`flex items-center gap-1 ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold`}>
          <Info className="w-3.5 h-3.5 text-sky-500" />
          <span>{appMode === 'view' ? 'View Mode Tips' : 'Build Mode Tips'}</span>
        </div>
        {appMode === 'view' ? (
          <p className={`leading-tight text-[10px] ${isLight ? 'text-emerald-700' : 'text-emerald-300/90'}`}>
            • Hover over any player to review coaching keys and live explanations without blocking canvas building.
          </p>
        ) : (
          <>
            <p className="leading-tight text-[10px]">
              • Hover overlays are hidden during building so you can draw cleanly.
            </p>
            <p className="leading-tight text-[10px]">
              • Click any player to view and edit assignments in the side panel.
            </p>
          </>
        )}
      </div>
    </aside>
  );
};
