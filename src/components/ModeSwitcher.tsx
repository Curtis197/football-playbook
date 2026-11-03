import React from 'react';
import type { CanvasMode } from '../types/playbook';
import { 
  MousePointer, 
  CornerUpRight, 
  ShieldAlert, 
  Activity, 
  PlusCircle, 
  Shield, 
  Trash2,
  Info
} from 'lucide-react';

interface ModeSwitcherProps {
  currentMode: CanvasMode;
  onSetMode: (mode: CanvasMode) => void;
  selectedPlayerId: string | null;
  selectedActionId: string | null;
  onDeleteSelected: () => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  currentMode,
  onSetMode,
  selectedPlayerId,
  selectedActionId,
  onDeleteSelected
}) => {
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
      desc: 'Run block with T-Bar marker',
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

  return (
    <aside className="w-16 md:w-56 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between p-2 select-none z-10 shrink-0">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1 hidden md:block">
          Tool Mode
        </span>

        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSetMode(m.id)}
              className={`flex items-center gap-3 p-2.5 rounded-lg text-left transition-all group ${
                isActive
                  ? 'bg-sky-600/20 border border-sky-500/50 text-sky-300 shadow-sm'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              title={`${m.label}: ${m.desc}`}
            >
              <div className="shrink-0">{m.icon}</div>
              <div className="hidden md:block overflow-hidden">
                <div className="text-xs font-semibold leading-none">{m.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{m.desc}</div>
              </div>
            </button>
          );
        })}

        {/* Delete selection button */}
        {(selectedPlayerId || selectedActionId) && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <button
              onClick={onDeleteSelected}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 transition-all text-left"
              title="Delete selected player or vector path"
            >
              <Trash2 className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="hidden md:block">
                <div className="text-xs font-bold leading-none">Delete Selected</div>
                <div className="text-[10px] text-rose-400/80">
                  {selectedPlayerId ? 'Remove player' : 'Remove vector'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER TIPS */}
      <div className="hidden md:flex flex-col gap-1.5 p-2 bg-slate-900/70 border border-slate-800 rounded-lg text-[11px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300 font-semibold">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Quick Tips</span>
        </div>
        <p className="leading-tight text-[10px] text-slate-400">
          • Double-click field or press <strong>Enter</strong> to complete a route.
        </p>
        <p className="leading-tight text-[10px] text-slate-400">
          • Hover over any player to review coaching keys.
        </p>
      </div>
    </aside>
  );
};
