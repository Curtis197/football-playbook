import React, { useState } from 'react';
import type { Player, Theme } from '../types/playbook';
import { 
  analyzeOffense, 
  loadDefensivePackage, 
  DEFENSIVE_PACKAGES, 
  shiftDefensiveFront, 
  realignAllDefenders,
  type DefensivePackage 
} from '../utils/defensiveAlignment';
import { 
  Shield, 
  X, 
  Check, 
  Sparkles, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface DefenseFrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayers: Player[];
  theme?: Theme;
  onApplyDefenders: (updatedDefenders: Player[]) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DefenseFrontModal: React.FC<DefenseFrontModalProps> = ({
  isOpen,
  onClose,
  currentPlayers,
  theme = 'dark',
  onApplyDefenders,
  showNotification
}) => {
  const isLight = theme === 'light';
  const offenseStructure = analyzeOffense(currentPlayers);
  const currentDefenders = currentPlayers.filter(p => p.side === 'defense');

  const [selectedPkgId, setSelectedPkgId] = useState<string>(DEFENSIVE_PACKAGES[0].id);
  const selectedPkg = DEFENSIVE_PACKAGES.find(p => p.id === selectedPkgId) || DEFENSIVE_PACKAGES[0];

  if (!isOpen) return null;

  // Handle Loading the selected package
  const handleLoadPackage = (pkg: DefensivePackage) => {
    const updated = loadDefensivePackage(pkg, currentDefenders, offenseStructure);
    onApplyDefenders(updated);
    showNotification(`Loaded and pre-aligned "${pkg.name}" to offense!`, 'success');
    onClose();
  };

  // Handle Shifting existing defenders
  const handleShift = (direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan') => {
    const shifted = shiftDefensiveFront(currentPlayers, offenseStructure, direction);
    const onlyDefenders = shifted.filter(p => p.side === 'defense');
    onApplyDefenders(onlyDefenders);
    const labelMap: Record<string, string> = {
      left: 'Shifted Front Left',
      right: 'Shifted Front Right',
      over: 'Set Front to Over (Strongside)',
      under: 'Set Front to Under (Weakside)',
      pinch: 'Pinched Front (Crashed Inside)',
      fan: 'Fanned Front (Stemmed Outside)'
    };
    showNotification(labelMap[direction] || 'Shifted defense', 'info');
  };

  // Handle Re-aligning all defenders
  const handleRealign = () => {
    const realigned = realignAllDefenders(currentPlayers, offenseStructure);
    const onlyDefenders = realigned.filter(p => p.side === 'defense');
    onApplyDefenders(onlyDefenders);
    showNotification('Re-aligned all defenders to offensive positions!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-200">
      <div className={`relative ${isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#12161f] border-[#30363d] text-slate-100'} border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden`}>
        
        {/* HEADER */}
        <div className={`px-5 py-4 border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#262c36] bg-[#161c26]'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>Defensive Pre-Alignment & Gap Engine</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Dynamic Gap Snapping
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Automatically pre-align defenders, load defensive fronts, and shift gap leverage based on offensive positions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg ${isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OFFENSIVE SITUATION BAR */}
        <div className={`px-5 py-2.5 border-b ${isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'} flex flex-wrap items-center justify-between gap-3 text-xs`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Offense Strength:</span>
              <span className="uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400">
                {offenseStructure.strength} Side
              </span>
            </div>
            <div>
              <span>L.O.S.: </span>
              <span className="font-mono font-bold">Y = {offenseStructure.losY}</span>
            </div>
            <div>
              <span>Center: </span>
              <span className="font-mono font-bold">X = {offenseStructure.center.x}</span>
            </div>
            <div>
              <span>Tight End: </span>
              <span className="font-semibold">
                {offenseStructure.rightTE ? 'Right (Y)' : offenseStructure.leftTE ? 'Left (Y)' : 'None (Spread Open)'}
              </span>
            </div>
          </div>

          {/* QUICK SHIFT CONTROLS */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase mr-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Shift Defense:
            </span>
            <button
              onClick={() => handleShift('left')}
              className={`px-2 py-1 text-[11px] font-bold rounded border ${isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'} transition-all flex items-center gap-1`}
              title="Shift DL and LBs 1 gap left"
            >
              <ChevronLeft className="w-3 h-3" /> Left
            </button>
            <button
              onClick={() => handleShift('right')}
              className={`px-2 py-1 text-[11px] font-bold rounded border ${isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'} transition-all flex items-center gap-1`}
              title="Shift DL and LBs 1 gap right"
            >
              Right <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleShift('over')}
              className="px-2 py-1 text-[11px] font-bold rounded border bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/40 text-sky-400 transition-all"
              title="Set 3-Tech and Overhang to strong side"
            >
              Over (Strong)
            </button>
            <button
              onClick={() => handleShift('under')}
              className="px-2 py-1 text-[11px] font-bold rounded border bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/40 text-purple-400 transition-all"
              title="Set 3-Tech DT to weak side"
            >
              Under (Weak)
            </button>
            <button
              onClick={() => handleShift('pinch')}
              className="px-2 py-1 text-[11px] font-bold rounded border bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/40 text-rose-400 transition-all flex items-center gap-1"
              title="Pinch defensive line inside"
            >
              <Minimize2 className="w-3 h-3" /> Pinch
            </button>
            <button
              onClick={() => handleShift('fan')}
              className="px-2 py-1 text-[11px] font-bold rounded border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-400 transition-all flex items-center gap-1"
              title="Stem / Fan defensive line outside"
            >
              <Maximize2 className="w-3 h-3" /> Fan
            </button>
            <button
              onClick={handleRealign}
              className={`px-2 py-1 text-[11px] font-bold rounded border ${isLight ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900' : 'bg-amber-900/30 hover:bg-amber-900/50 border-amber-600/40 text-amber-300'} transition-all flex items-center gap-1`}
              title="Re-snap all defenders to their designated technique"
            >
              <RotateCcw className="w-3 h-3" /> Re-Align All
            </button>
          </div>
        </div>

        {/* BODY: PACKAGE SELECTION & DEFENDER ROSTER */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* LEFT: DEFENSIVE PACKAGES LIST */}
          <div className="flex flex-col gap-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-1`}>
              Available Defensive Fronts
            </h3>
            {DEFENSIVE_PACKAGES.map((pkg) => {
              const isSelected = pkg.id === selectedPkgId;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? isLight 
                        ? 'bg-rose-50 border-rose-500 shadow-sm' 
                        : 'bg-rose-950/30 border-rose-500 shadow-sm'
                      : isLight 
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                        : 'bg-[#161c26] hover:bg-[#1c2432] border-[#2b3544] text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-rose-500' : 'bg-slate-500'}`} />
                      {pkg.name}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                      {pkg.scheme}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'} line-clamp-2`}>
                    {pkg.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SELECTED PACKAGE ROSTER PREVIEW (2 COLS) */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#161c26] border-[#2b3544]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <span>{selectedPkg.name}</span>
                    <span className="text-xs font-normal text-rose-400 font-mono">({selectedPkg.scheme} Personnel)</span>
                  </h4>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
                    {selectedPkg.description}
                  </p>
                </div>
                <button
                  onClick={() => handleLoadPackage(selectedPkg)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Zap className="w-4 h-4" /> Load & Align Front
                </button>
              </div>

              {/* DEFENDER ALIGNMENT TABLE */}
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-700 text-slate-400'} text-[11px]`}>
                      <th className="pb-2 font-semibold">POS</th>
                      <th className="pb-2 font-semibold">TECHNIQUE / ALIGNMENT</th>
                      <th className="pb-2 font-semibold">ASSIGNMENT</th>
                      <th className="pb-2 font-semibold text-right">PRE-ALIGNED (X, Y)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {selectedPkg.defenders.map((def) => {
                      const pos = def.technique ? loadDefensivePackage(selectedPkg, currentDefenders, offenseStructure).find(d => d.label === def.label) : null;
                      return (
                        <tr key={def.id} className="hover:bg-rose-500/5 transition-colors">
                          <td className="py-2 font-bold text-rose-400 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded flex items-center justify-center bg-rose-500/20 text-[10px]">
                              {def.label}
                            </span>
                          </td>
                          <td className="py-2 font-semibold">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px]">
                              {def.technique}
                            </span>
                          </td>
                          <td className="py-2 max-w-[200px] truncate text-[11px]">
                            {def.assignmentTitle}
                          </td>
                          <td className="py-2 text-right font-mono text-[11px] text-slate-400">
                            {pos ? `(${pos.x}, ${pos.y})` : 'Auto'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* OFFENSIVE GAPS OVERVIEW */}
            <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-100/60 border-slate-200' : 'bg-[#10141c] border-[#222936]'}`}>
              <h5 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} mb-2`}>
                Offensive Gap Coordinates & Strength Distribution
              </h5>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                {offenseStructure.gaps.map((gap) => (
                  <div
                    key={gap.id}
                    className={`p-1.5 rounded-lg border text-[10px] ${
                      gap.isStrong
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : isLight 
                          ? 'bg-white border-slate-300 text-slate-700' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-[12px] font-black">{gap.label} GAP</div>
                    <div className="text-[9px] uppercase font-semibold text-slate-400">{gap.side}</div>
                    <div className="font-mono text-[9px] text-slate-400">X: {gap.x}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className={`px-5 py-3 border-t ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#262c36] bg-[#161c26]'} flex items-center justify-between`}>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Defenders snap relative to Center, Guards, Tackles, and Tight Ends.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'} transition-all`}
            >
              Cancel
            </button>
            <button
              onClick={() => handleLoadPackage(selectedPkg)}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply {selectedPkg.name}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
