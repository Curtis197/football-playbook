import React, { useState } from 'react';
import type { Player, PathAction, Play, ActionType, AppMode } from '../types/playbook';
import { 
  Compass, 
  Shield, 
  Tag, 
  Plus, 
  X, 
  Lightbulb, 
  FileEdit,
  Sliders
} from 'lucide-react';

interface InspectorPanelProps {
  currentPlay: Play;
  selectedPlayer: Player | null;
  selectedAction: PathAction | null;
  appMode?: AppMode;
  onSelectPlayer?: (playerId: string | null) => void;
  onUpdatePlayer: (updated: Player) => void;
  onUpdateAction: (updated: PathAction) => void;
  onUpdatePlayNotes: (notes: Play['notes']) => void;
  onUpdateStrategyMatrix: (matrix: {
    primaryRunConcept?: string;
    counterAction?: string;
    targetFront?: string;
    tags?: string[];
    situation?: string[];
  }) => void;
  onUpdatePlayFormations: (offense: string, defense: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  currentPlay,
  selectedPlayer,
  selectedAction,
  appMode = 'build',
  onSelectPlayer,
  onUpdatePlayer,
  onUpdateAction,
  onUpdatePlayNotes,
  onUpdateStrategyMatrix,
  onUpdatePlayFormations
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'philosophy' | 'read_flow'>('philosophy');
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [newSituationInput, setNewSituationInput] = useState('');
  const [newCoachingKeyInput, setNewCoachingKeyInput] = useState('');

  // Automatically switch to annotation form when a player or action is newly selected
  const currentSelectedId = selectedPlayer?.id || selectedAction?.id || null;
  if (currentSelectedId && currentSelectedId !== prevSelectedId) {
    setPrevSelectedId(currentSelectedId);
    setActiveTab('inspector');
  } else if (!currentSelectedId && prevSelectedId) {
    setPrevSelectedId(null);
  }

  // Strategy Matrix options
  const runConcepts = ['Inside Zone', 'Split-Zone Read', 'Pin & Pull', 'Fold Trap', 'Outside Zone', 'Duo', 'Power / Counter'];
  const counterActions = ['Pop/Glance', 'Weakside Boot/Leak', 'Play-Action Seam', 'Jet Sweep', 'Mesh / Snag', 'QB Draw'];
  const defenseFronts = ['3-5 Odd (0-Tech)', '3-4 Over', '4-2-5 Nickel', '4-3 Under', 'Mint Front', 'Cover 1 Blitz'];

  // Handler for adding tags
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const updated = Array.from(new Set([...currentPlay.tags, newTagInput.trim()]));
    onUpdateStrategyMatrix({ tags: updated });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = currentPlay.tags.filter(t => t !== tagToRemove);
    onUpdateStrategyMatrix({ tags: updated });
  };

  // Handler for adding situation
  const handleAddSituation = () => {
    if (!newSituationInput.trim()) return;
    const updated = Array.from(new Set([...currentPlay.situation, newSituationInput.trim()]));
    onUpdateStrategyMatrix({ situation: updated });
    setNewSituationInput('');
  };

  const handleRemoveSituation = (sitToRemove: string) => {
    const updated = currentPlay.situation.filter(s => s !== sitToRemove);
    onUpdateStrategyMatrix({ situation: updated });
  };

  // Handler for coaching keys
  const handleAddCoachingKey = () => {
    if (!selectedPlayer || !newCoachingKeyInput.trim()) return;
    const keys = selectedPlayer.coachingKeys || [];
    onUpdatePlayer({
      ...selectedPlayer,
      coachingKeys: [...keys, newCoachingKeyInput.trim()]
    });
    setNewCoachingKeyInput('');
  };

  const handleRemoveCoachingKey = (idx: number) => {
    if (!selectedPlayer || !selectedPlayer.coachingKeys) return;
    const updated = selectedPlayer.coachingKeys.filter((_, i) => i !== idx);
    onUpdatePlayer({
      ...selectedPlayer,
      coachingKeys: updated
    });
  };

  return (
    <aside className="w-80 lg:w-96 bg-[#161b22] border-l border-[#30363d] flex flex-col h-full select-none shrink-0 overflow-hidden text-slate-200">
      {/* MODE STATUS HEADER */}
      <div className="px-3.5 py-1.5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <FileEdit className="w-3.5 h-3.5 text-sky-400" />
          <span>Side Annotation Form</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            appMode === 'view'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : 'bg-sky-950/80 text-sky-400 border border-sky-500/40'
          }`}
        >
          {appMode === 'view' ? '👁️ View Mode' : '🛠️ Build Mode'}
        </span>
      </div>

      {/* PANEL TABS */}
      <div className="flex items-center border-b border-[#30363d] bg-[#0d1117]/80 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('philosophy')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'philosophy'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Philosophy & Scheme</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'inspector'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>{selectedPlayer ? `Player: ${selectedPlayer.label}` : selectedAction ? 'Vector Path' : 'Annotation Form'}</span>
        </button>

        <button
          onClick={() => setActiveTab('read_flow')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'read_flow'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>QB Reads</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* TAB 1: PHILOSOPHY & GAME PLANNING COMPANION (Spec 3) */}
        {activeTab === 'philosophy' && (
          <div className="space-y-4">
            {/* Formations Header */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                Formation Matchup
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Offensive Formation</label>
                <input
                  type="text"
                  value={currentPlay.formationOffense}
                  onChange={(e) => onUpdatePlayFormations(e.target.value, currentPlay.frontDefense)}
                  className="w-full bg-[#161b22] text-xs font-semibold text-sky-300 px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-0.5">Target Defensive Front</label>
                <input
                  type="text"
                  value={currentPlay.frontDefense}
                  onChange={(e) => onUpdatePlayFormations(currentPlay.formationOffense, e.target.value)}
                  className="w-full bg-[#161b22] text-xs font-semibold text-rose-300 px-2.5 py-1.5 rounded border border-slate-700 focus:border-rose-500 outline-none"
                />
              </div>
            </div>

            {/* STRATEGY TAGGING MATRIX (Spec 3.2) */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  Strategy Tagging Matrix
                </span>
                <span className="text-[10px] text-slate-500 font-mono">SPEC 3.2</span>
              </div>

              {/* 1. Primary Run Concept (Amber #f59e0b) */}
              <div>
                <label className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Primary Run Concept
                </label>
                <select
                  value={currentPlay.primaryRunConcept || 'Inside Zone'}
                  onChange={(e) => onUpdateStrategyMatrix({ primaryRunConcept: e.target.value })}
                  className="w-full bg-[#161b22] text-xs font-semibold text-amber-300 px-2.5 py-1.5 rounded border border-amber-500/40 focus:border-amber-400 outline-none"
                >
                  {runConcepts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 2. Counter-Action (Cyan #06b6d4) */}
              <div>
                <label className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Counter-Action / RPO Complement
                </label>
                <select
                  value={currentPlay.counterAction || 'Pop/Glance'}
                  onChange={(e) => onUpdateStrategyMatrix({ counterAction: e.target.value })}
                  className="w-full bg-[#161b22] text-xs font-semibold text-cyan-300 px-2.5 py-1.5 rounded border border-cyan-500/40 focus:border-cyan-400 outline-none"
                >
                  {counterActions.map((ca) => (
                    <option key={ca} value={ca}>{ca}</option>
                  ))}
                </select>
              </div>

              {/* 3. Target Defensive Front (Rose #f43f5e) */}
              <div>
                <label className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Target Defensive Front
                </label>
                <select
                  value={currentPlay.targetFront || '3-5 Odd (0-Tech)'}
                  onChange={(e) => onUpdateStrategyMatrix({ targetFront: e.target.value })}
                  className="w-full bg-[#161b22] text-xs font-semibold text-rose-300 px-2.5 py-1.5 rounded border border-rose-500/40 focus:border-rose-400 outline-none"
                >
                  {defenseFronts.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SCHEMATIC PHILOSOPHY RATIONALE */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Schematic Philosophy Rationale
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                Why this scheme punishes the target defensive structure:
              </p>
              <textarea
                value={currentPlay.notes.philosophyReason}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, philosophyReason: e.target.value })
                }
                rows={3}
                placeholder="e.g. Neutralizes Mike scraping over the top while punishing 0-tech penetration with weakside glance RPO."
                className="w-full bg-[#161b22] text-xs text-slate-200 p-2 rounded border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* SITUATION & GAME FLOW TAGS */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Situational Call Sheet
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentPlay.situation.map((sit) => (
                  <span
                    key={sit}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                  >
                    {sit}
                    <button
                      onClick={() => handleRemoveSituation(sit)}
                      className="hover:text-emerald-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add situation (e.g. Red Zone, 3rd & Short)"
                  value={newSituationInput}
                  onChange={(e) => setNewSituationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSituation()}
                  className="flex-1 bg-[#161b22] text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                />
                <button
                  onClick={handleAddSituation}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SCHEME TAGS */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Scheme Tags
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentPlay.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-sky-950/80 text-sky-300 border border-sky-700/50"
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)} className="hover:text-sky-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add scheme tag (e.g. leak, rpo)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-[#161b22] text-xs px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                />
                <button
                  onClick={handleAddTag}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INSPECTOR (PLAYER OR VECTOR) */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {selectedPlayer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                        selectedPlayer.side === 'offense'
                          ? 'bg-sky-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {selectedPlayer.label}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">Player Annotation Form</h3>
                      <p className="text-[10px] text-slate-400 capitalize">{selectedPlayer.side} • Side Form</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      ({selectedPlayer.x}, {selectedPlayer.y})
                    </span>
                    {onSelectPlayer && (
                      <button
                        type="button"
                        onClick={() => onSelectPlayer(null)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Close player form / Deselect"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Player Label & Side */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Position Label</label>
                    <input
                      type="text"
                      value={selectedPlayer.label}
                      onChange={(e) =>
                        onUpdatePlayer({ ...selectedPlayer, label: e.target.value })
                      }
                      className="w-full bg-[#161b22] text-xs font-bold text-white px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Technique / Alignment</label>
                    <input
                      type="text"
                      placeholder="e.g. 0-Tech, 4i, Apex"
                      value={selectedPlayer.technique || ''}
                      onChange={(e) =>
                        onUpdatePlayer({ ...selectedPlayer, technique: e.target.value })
                      }
                      className="w-full bg-[#161b22] text-xs text-amber-300 px-2.5 py-1.5 rounded border border-slate-700 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Assignment Title */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={selectedPlayer.assignmentTitle}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, assignmentTitle: e.target.value })
                    }
                    placeholder="e.g. Glance Route / Zone Step"
                    className="w-full bg-[#161b22] text-xs font-semibold text-sky-400 px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                  />
                </div>

                {/* Assignment Notes */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Assignment Coaching Notes
                  </label>
                  <textarea
                    value={selectedPlayer.assignmentNotes}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, assignmentNotes: e.target.value })
                    }
                    rows={4}
                    placeholder="Provide execution details, read rules, alignment splits, and leverage."
                    className="w-full bg-[#161b22] text-xs text-slate-300 p-2 rounded border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Coaching Keys List */}
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
                  <label className="text-[11px] text-amber-400 font-semibold block">
                    Key Coaching Points
                  </label>
                  <div className="space-y-1">
                    {(selectedPlayer.coachingKeys || []).map((key, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] bg-[#161b22] px-2 py-1 rounded text-slate-300 border border-slate-800"
                      >
                        <span>• {key}</span>
                        <button
                          onClick={() => handleRemoveCoachingKey(idx)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      placeholder="Add coaching cue..."
                      value={newCoachingKeyInput}
                      onChange={(e) => setNewCoachingKeyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCoachingKey()}
                      className="flex-1 bg-[#161b22] text-xs px-2 py-1 rounded border border-slate-700 focus:border-sky-500 outline-none"
                    />
                    <button
                      onClick={handleAddCoachingKey}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedAction ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-sky-400" />
                    Vector Path Inspector
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedAction.points.length} waypoints
                  </span>
                </div>

                {/* Action Type */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Vector Action Type</label>
                  <select
                    value={selectedAction.type}
                    onChange={(e) =>
                      onUpdateAction({ ...selectedAction, type: e.target.value as ActionType })
                    }
                    className="w-full bg-[#161b22] text-xs font-semibold text-sky-400 px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                  >
                    <option value="pass_route">Pass Route</option>
                    <option value="run_block">Run Block</option>
                    <option value="pull_block">Pull Block</option>
                    <option value="motion">Motion Track</option>
                  </select>
                </div>

                {/* Marker Type */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Terminal Marker</label>
                  <select
                    value={selectedAction.endMarker}
                    onChange={(e) =>
                      onUpdateAction({
                        ...selectedAction,
                        endMarker: e.target.value as PathAction['endMarker']
                      })
                    }
                    className="w-full bg-[#161b22] text-xs font-semibold text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                  >
                    <option value="arrow">Arrowhead (#arrow)</option>
                    <option value="tbar">T-Bar (#tbar)</option>
                    <option value="dot">Dot Point (#dot)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Curved Toggle */}
                <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Bézier Smoothing</div>
                    <div className="text-[10px] text-slate-400">
                      Renders smooth quadratic / cubic curve
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedAction.isCurved || false}
                    onChange={(e) =>
                      onUpdateAction({ ...selectedAction, isCurved: e.target.checked })
                    }
                    className="w-4 h-4 accent-sky-500 cursor-pointer"
                  />
                </div>

                {/* Action Label */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Waypoint Cue Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Break at 10 yds / Speed Flat"
                    value={selectedAction.label || ''}
                    onChange={(e) =>
                      onUpdateAction({ ...selectedAction, label: e.target.value })
                    }
                    className="w-full bg-[#161b22] text-xs text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:border-sky-500 outline-none"
                  />
                </div>

                {/* Waypoints & Break Geometry (Catmull-Rom & Sharp Cuts) */}
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block">
                      Waypoints & Break Geometry
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">C¹ Spline / C⁰ Cut</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Toggle break angles between smooth sweeping arcs ($C^1$) and crisp plant-foot cuts ($C^0$).
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {selectedAction.points.map((pt, pIdx) => {
                      const isOrigin = pIdx === 0;
                      const isSharp = Boolean(pt.isSharp);

                      return (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between text-[11px] bg-[#161b22] px-2.5 py-1.5 rounded border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500">
                              {isOrigin ? 'P0 (Origin)' : `P${pIdx}`}
                            </span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              ({Math.round(pt.x)}, {Math.round(pt.y)})
                            </span>
                          </div>

                          {!isOrigin && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...selectedAction.points];
                                updated[pIdx] = { ...pt, isSharp: !isSharp };
                                onUpdateAction({ ...selectedAction, points: updated });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                                isSharp
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                                  : 'bg-sky-950/80 text-sky-300 border border-sky-600/50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 ${
                                  isSharp ? 'rotate-45 bg-amber-400' : 'rounded-full bg-sky-400'
                                }`}
                              ></span>
                              {isSharp ? 'Sharp Cut Break' : 'Smooth Arc'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <FileEdit className="w-3.5 h-3.5 text-sky-400" />
                    Player Annotation Form
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select any player on the chalkboard or roster below to edit their assignments & coaching notes:
                  </p>
                </div>

                {/* Offense Players Roster */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center justify-between">
                    <span>Offense</span>
                    <span className="text-slate-500 font-mono text-[9px]">{currentPlay.players.filter(p => p.side === 'offense').length} players</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPlay.players.filter(p => p.side === 'offense').map(player => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => onSelectPlayer?.(player.id)}
                        className="flex items-center gap-2 p-1.5 bg-[#161b22] hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 rounded text-left transition-all group"
                      >
                        <span className="w-5 h-5 rounded bg-sky-600 group-hover:bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {player.label}
                        </span>
                        <div className="overflow-hidden">
                          <div className="text-[10px] font-semibold text-slate-200 truncate leading-tight">
                            {player.assignmentTitle || 'Assignment'}
                          </div>
                          {player.technique && (
                            <div className="text-[9px] text-amber-400 truncate leading-tight">
                              {player.technique}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Defense Players Roster */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                    <span>Defense</span>
                    <span className="text-slate-500 font-mono text-[9px]">{currentPlay.players.filter(p => p.side === 'defense').length} defenders</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPlay.players.filter(p => p.side === 'defense').map(player => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => onSelectPlayer?.(player.id)}
                        className="flex items-center gap-2 p-1.5 bg-[#161b22] hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 rounded text-left transition-all group"
                      >
                        <span className="w-5 h-5 rounded bg-rose-600 group-hover:bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {player.label}
                        </span>
                        <div className="overflow-hidden">
                          <div className="text-[10px] font-semibold text-slate-200 truncate leading-tight">
                            {player.assignmentTitle || 'Defend Gap'}
                          </div>
                          {player.technique && (
                            <div className="text-[9px] text-amber-400 truncate leading-tight">
                              {player.technique}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QB READ FLOW & BLOCKING RULES (Spec 1.2 / Spec 3) */}
        {activeTab === 'read_flow' && (
          <div className="space-y-4">
            {/* QB Read Progression */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                QB Read Progression & Mesh Rules
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                Defensive conflict defender, mesh read cue, and secondary progressions:
              </p>
              <textarea
                value={currentPlay.notes.qbRead}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, qbRead: e.target.value })
                }
                rows={4}
                className="w-full bg-[#161b22] text-xs text-slate-200 p-2 rounded border border-slate-700 focus:border-sky-500 outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Offensive Line Blocking Track */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Offensive Line Track & Combos
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                Gap rules, scoop tracks, combo releases to second-level linebackers:
              </p>
              <textarea
                value={currentPlay.notes.lineBlocking}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, lineBlocking: e.target.value })
                }
                rows={4}
                className="w-full bg-[#161b22] text-xs text-slate-200 p-2 rounded border border-slate-700 focus:border-amber-500 outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Coaching Cue & Hot Route */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                Hot Answer / Blitz Pressure Key
              </span>
              <input
                type="text"
                value={currentPlay.notes.hotRoute || ''}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, hotRoute: e.target.value })
                }
                placeholder="e.g. F on immediate flat if boundary nickel blitzes"
                className="w-full bg-[#161b22] text-xs text-slate-200 px-2.5 py-1.5 rounded border border-slate-700 focus:border-purple-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
