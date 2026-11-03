import React, { useState } from 'react';
import type { Play } from '../types/playbook';
import { X, CheckCircle, ShieldCheck, Zap, BookOpen } from 'lucide-react';

interface SituationMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  plays: Play[];
  activePlayId: string;
  onSelectPlay: (playId: string) => void;
}

export const SituationMatrixModal: React.FC<SituationMatrixModalProps> = ({
  isOpen,
  onClose,
  plays,
  activePlayId,
  onSelectPlay
}) => {
  const [filterFront, setFilterFront] = useState<string>('all');
  const [filterSituation, setFilterSituation] = useState<string>('all');

  if (!isOpen) return null;

  // Aggregate all fronts and situations
  const allFronts = Array.from(new Set(plays.map(p => p.targetFront || p.frontDefense))).filter(Boolean);
  const allSituations = Array.from(new Set(plays.flatMap(p => p.situation))).filter(Boolean);

  const filteredPlays = plays.filter(p => {
    const matchesFront = filterFront === 'all' || (p.targetFront === filterFront || p.frontDefense === filterFront);
    const matchesSituation = filterSituation === 'all' || p.situation.includes(filterSituation);
    return matchesFront && matchesSituation;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">
                Philosophy & Game Planning Companion
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Spec 3: Run-Fit Validation, Scheme Conflict Defenders, & Situational Play-Call Matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="p-4 bg-[#11161d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Filter by Front:</span>
              <select
                value={filterFront}
                onChange={(e) => setFilterFront(e.target.value)}
                className="bg-[#161b22] border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-sky-500"
              >
                <option value="all">All Defensive Fronts</option>
                {allFronts.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Filter by Situation:</span>
              <select
                value={filterSituation}
                onChange={(e) => setFilterSituation(e.target.value)}
                className="bg-[#161b22] border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-sky-500"
              >
                <option value="all">All Situations</option>
                {allSituations.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <strong className="text-sky-400">{filteredPlays.length}</strong> scheme answers
          </div>
        </div>

        {/* MATRIX TABLE & RUN FIT CHECKER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. STRATEGIC PILLAR MATRIX TABLE */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Strategic Tagging Matrix (Spec 3.2)
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Play Name</th>
                    <th className="py-2.5 px-3">Primary Run Concept</th>
                    <th className="py-2.5 px-3">Counter-Action</th>
                    <th className="py-2.5 px-3">Target Front</th>
                    <th className="py-2.5 px-3">Key Situations</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPlays.map((p) => {
                    const isActive = p.id === activePlayId;
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors hover:bg-slate-800/40 ${
                          isActive ? 'bg-sky-950/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            {isActive && <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                            <span>{p.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">{p.formationOffense}</span>
                        </td>

                        {/* Primary Run Concept (Amber #f59e0b) */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-600/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            {p.primaryRunConcept || 'Inside Zone'}
                          </span>
                        </td>

                        {/* Counter-Action (Cyan #06b6d4) */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-600/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            {p.counterAction || 'Pop/Glance'}
                          </span>
                        </td>

                        {/* Target Defensive Front (Rose #f43f5e) */}
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-600/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            {p.targetFront || p.frontDefense}
                          </span>
                        </td>

                        {/* Situations */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {p.situation.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                {s}
                              </span>
                            ))}
                            {p.situation.length > 2 && (
                              <span className="px-1 py-0.5 text-[10px] text-slate-500">
                                +{p.situation.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Select Button */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              onSelectPlay(p.id);
                              onClose();
                            }}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white border border-slate-700'
                            }`}
                          >
                            {isActive ? 'Active' : 'Load Play'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. RUN-FIT & SCHEME VALIDATION COMPANION */}
          <div className="bg-gradient-to-br from-slate-900 to-[#12171f] p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Defensive Run-Fit & Read Progression Analysis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#161c24] p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-sky-400 uppercase text-[10px] tracking-wider block">
                  1. Box Count & Leverage
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Against a 3-5 Odd, the defense commits 3 down linemen and 2 inside backers. Double-teaming the 0-Tech Nose removes backside spill while the QB mesh freezes the weakside DE.
                </p>
              </div>

              <div className="bg-[#161c24] p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                  2. Conflict Defender Key
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  The scraping Will LB is put in an impossible bind: if he flows aggressively to fit the inside zone mesh, the Glance route snaps right into the window he vacated.
                </p>
              </div>

              <div className="bg-[#161c24] p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                  3. Complementary Leak
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  When defenses adjust by bringing nickel pressure or rolling coverages, the speed flat (F) and boot leak (Y) punish perimeter over-rotation immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
