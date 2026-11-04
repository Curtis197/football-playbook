import React, { useState } from 'react';
import type { Player, PathAction, Play, ActionType, AppMode, Point, Theme, AlignmentLeverage, Formation, PlayerPosition } from '../types/playbook';
import type { AssignmentChange } from '../utils/blockPlanApply';
import { resolveFormation } from '../utils/playMigrations';
import { 
  Compass, 
  Shield, 
  Tag, 
  Plus, 
  X, 
  Lightbulb, 
  FileEdit,
  Sliders,
  Trash2,
  Palette,
  Type,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Target
} from 'lucide-react';
import { LINE_COLOR_SWATCHES, resolvePlayerColors } from '../utils/colors';
import { 
  analyzeOffense, 
  calculateDefensiveAlignmentPosition, 
  COMMON_DEFENSIVE_TECHNIQUES, 
  shiftDefensiveFront 
} from '../utils/defensiveAlignment';

const CORE_PLAYER_SWATCHES = [
  { label: 'Solid Black', color: '#000000' },
  { label: 'Clean White', color: '#ffffff' },
  { label: 'Offense Sky', color: '#0284c7' },
  { label: 'Defense Rose', color: '#e11d48' },
  { label: 'Amber Gold', color: '#f59e0b' },
  { label: 'Emerald Green', color: '#10b981' },
  { label: 'Royal Purple', color: '#8b5cf6' },
  { label: 'Deep Charcoal', color: '#334155' },
];

const HOVER_SWATCHES = [
  { label: 'Sky Highlight', color: '#38bdf8' },
  { label: 'Amber Gold', color: '#f59e0b' },
  { label: 'Emerald Green', color: '#10b981' },
  { label: 'Hot Pink', color: '#ec4899' },
  { label: 'Royal Purple', color: '#a855f7' },
  { label: 'Clean White', color: '#ffffff' },
  { label: 'Solid Black', color: '#000000' },
];

export type InspectorTab = 'inspector' | 'philosophy' | 'read_flow';

interface InspectorPanelProps {
  currentPlay: Play;
  selectedPlayer: Player | null;
  selectedAction: PathAction | null;
  appMode?: AppMode;
  theme?: Theme;
  onSelectPlayer?: (playerId: string | null) => void;
  onUpdatePlayer: (updated: Player) => void;
  onUpdateAction: (updated: PathAction) => void;
  onStartRestartBlock?: (fromAction: PathAction) => void;
  onUpdatePlayNotes: (notes: Play['notes']) => void;
  onUpdateStrategyMatrix: (matrix: {
    primaryRunConcept?: string;
    counterAction?: string;
    tags?: string[];
    situation?: string[];
  }) => void;
  onUpdatePlayFormations: (offense: string, defense: string) => void;
  formations?: Formation[];
  /** Which tab is open first. Defaults to Philosophy; tests use it to render every tab. */
  initialTab?: InspectorTab;
  onEditAssignment?: (assignmentId: string, change: AssignmentChange) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  currentPlay,
  selectedPlayer,
  selectedAction,
  appMode = 'build',
  theme = 'dark',
  onSelectPlayer,
  onUpdatePlayer,
  onUpdateAction,
  onStartRestartBlock,
  onUpdatePlayNotes,
  onUpdateStrategyMatrix,
  onUpdatePlayFormations,
  formations = [],
  initialTab = 'philosophy',
  onEditAssignment
}) => {
  const isLight = theme === 'light';
  // View mode is read-only. Forms sit inside a disabled fieldset: text stays fully readable (their colours are
  // set on the elements), buttons are dimmed, and nothing can be typed or clicked into the play.
  const isView = appMode === 'view';
  const formFieldsetClass =
    'min-w-0 border-0 p-0 m-0 space-y-4 [&:disabled_button]:opacity-50 [&:disabled_button]:cursor-default [&:disabled_input]:cursor-default [&:disabled_select]:cursor-default [&:disabled_textarea]:cursor-default';
  const [activeTab, setActiveTab] = useState<InspectorTab>(initialTab);
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [newSituationInput, setNewSituationInput] = useState('');
  const [newCoachingKeyInput, setNewCoachingKeyInput] = useState('');
  const [techCategoryTab, setTechCategoryTab] = useState<'DL' | 'LB' | 'DB'>('DL');

  // Analyze active offensive formation for dynamic defensive gap pre-alignment
  const offenseStructure = analyzeOffense(currentPlay.players);

  // Apply defensive alignment parameter and immediately pre-align coordinates
  const handleApplyDefensiveTechnique = (code: string) => {
    if (!selectedPlayer) return;
    const pos = calculateDefensiveAlignmentPosition(code, offenseStructure, selectedPlayer);
    onUpdatePlayer({
      ...selectedPlayer,
      technique: code,
      x: pos.x,
      y: pos.y
    });
  };

  // Re-snap defensive player to their declared alignment parameter
  const handleSnapPlayerToAlignment = () => {
    if (!selectedPlayer) return;
    const tech = selectedPlayer.technique || (selectedPlayer.alignReferenceTarget?.includes('#2') ? '#2 Slot' : '#1 WR');
    const pos = calculateDefensiveAlignmentPosition(tech, offenseStructure, selectedPlayer);
    onUpdatePlayer({
      ...selectedPlayer,
      technique: selectedPlayer.technique || tech,
      x: pos.x,
      y: pos.y
    });
  };

  // Update offensive reference target for CB / NB / DB
  const handleUpdateReferenceTarget = (target: string) => {
    if (!selectedPlayer) return;
    const updated: Player = {
      ...selectedPlayer,
      alignReferenceTarget: target === 'auto' ? undefined : target
    };
    const defaultTech = target.includes('#2') ? '#2 Slot' : '#1 WR';
    const techToUse = updated.technique || (target !== 'auto' ? defaultTech : undefined);
    if (techToUse) {
      updated.technique = techToUse;
      const pos = calculateDefensiveAlignmentPosition(techToUse, offenseStructure, updated);
      updated.x = pos.x;
      updated.y = pos.y;
    }
    onUpdatePlayer(updated);
  };

  // Update coverage alignment leverage (press, off, inside shade, etc.)
  const handleUpdateLeverage = (leverage: AlignmentLeverage) => {
    if (!selectedPlayer) return;
    const updated: Player = {
      ...selectedPlayer,
      alignLeverage: leverage
    };
    const techToUse = updated.technique || (updated.alignReferenceTarget?.includes('#2') ? '#2 Slot' : '#1 WR');
    const pos = calculateDefensiveAlignmentPosition(techToUse, offenseStructure, updated);
    updated.technique = techToUse;
    updated.x = pos.x;
    updated.y = pos.y;
    onUpdatePlayer(updated);
  };

  // Shift individual defender left or right
  const handleShiftPlayerGap = (dir: 'left' | 'right') => {
    if (!selectedPlayer) return;
    const shifted = shiftDefensiveFront([selectedPlayer], offenseStructure, dir);
    if (shifted[0]) {
      onUpdatePlayer(shifted[0]);
    }
  };

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

  // Formation names offered as suggestions; a name only links to a template when it matches one exactly
  const offenseTemplates = formations.filter(f => f.side === 'offense' || f.side === 'both');
  const defenseTemplates = formations.filter(f => f.side === 'defense' || f.side === 'both');
  const isOffenseLinked = Boolean(resolveFormation(formations, 'offense', currentPlay.formationOffenseId, currentPlay.formationOffense));
  const isDefenseLinked = Boolean(resolveFormation(formations, 'defense', currentPlay.frontDefenseId, currentPlay.frontDefense));
  const linkNote = (linked: boolean) => (
    <span className={`block mt-0.5 text-[10px] ${
      linked ? (isLight ? 'text-emerald-800' : 'text-emerald-300') : (isLight ? 'text-slate-600' : 'text-slate-400')
    }`}>
      {linked ? 'Linked to a saved template' : 'Custom label, not linked to a template'}
    </span>
  );

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

  // Players are drawn here on the panel's own surface, so unset letter colours stay readable in both themes
  const colorSurface = isLight ? 'light' : 'dark';

  const getPlayerRosterBadgeStyle = (pl: Player) => {
    const { shape, nodeColor, fillColor, letterColor } = resolvePlayerColors(pl, colorSurface);

    return {
      backgroundColor: fillColor,
      borderColor: pl.hoverColor || nodeColor,
      borderWidth: '1.5px',
      borderStyle: shape === 'none' ? ('dashed' as const) : ('solid' as const),
      color: letterColor
    };
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
    <aside className={`w-80 min-[1800px]:w-96 ${isLight ? 'bg-white border-l border-slate-200 text-slate-800' : 'bg-[#161b22] border-l border-[#30363d] text-slate-200'} flex flex-col h-full select-none shrink-0 overflow-hidden`}>
      {/* MODE STATUS HEADER */}
      <div className={`px-3.5 py-1.5 ${isLight ? 'bg-slate-50 border-b border-slate-200' : 'bg-[#0d1117] border-b border-[#30363d]'} flex items-center justify-between text-xs`}>
        <span className={`${isLight ? 'text-slate-600' : 'text-slate-400'} font-semibold flex items-center gap-1.5`}>
          <FileEdit className="w-3.5 h-3.5 text-sky-500" />
          <span>Side Annotation Form</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            appMode === 'view'
              ? isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : isLight ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-sky-950/80 text-sky-400 border border-sky-500/40'
          }`}
        >
          {appMode === 'view' ? '👁️ View Mode' : '🛠️ Build Mode'}
        </span>
      </div>

      {/* PANEL TABS */}
      <div className={`flex items-center border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#30363d] bg-[#0d1117]/80'} text-xs font-semibold`}>
        <button
          onClick={() => setActiveTab('philosophy')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'philosophy'
              ? isLight ? 'border-sky-600 text-sky-700 bg-white shadow-sm' : 'border-sky-500 text-sky-400 bg-slate-900/40'
              : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Philosophy</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'inspector'
              ? isLight ? 'border-sky-600 text-sky-700 bg-white shadow-sm' : 'border-sky-500 text-sky-400 bg-slate-900/40'
              : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileEdit className="w-3.5 h-3.5" />
          <span>{selectedPlayer ? `Player: ${selectedPlayer.label}` : selectedAction ? 'Vector' : 'Form'}</span>
        </button>

        <button
          onClick={() => setActiveTab('read_flow')}
          className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
            activeTab === 'read_flow'
              ? isLight ? 'border-sky-600 text-sky-700 bg-white shadow-sm' : 'border-sky-500 text-sky-400 bg-slate-900/40'
              : isLight ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Reads</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isView && (
          <p className={`text-[11px] leading-snug ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Read-only in View mode. Switch to Build in the top bar to edit.
          </p>
        )}

        {/* TAB 1: PHILOSOPHY & GAME PLANNING COMPANION (Spec 3) */}
        {activeTab === 'philosophy' && (
          <fieldset disabled={isView} className={formFieldsetClass}>
            {/* Formations Header */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'} block`}>
                Formation Matchup
              </span>
              <div>
                <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-0.5 font-semibold`}>Offensive Formation</label>
                <input
                  type="text"
                  list="offense-template-names"
                  value={currentPlay.formationOffense}
                  onChange={(e) => onUpdatePlayFormations(e.target.value, currentPlay.frontDefense)}
                  className={`w-full ${isLight ? 'bg-white text-sky-700 border-slate-300' : 'bg-[#161b22] text-sky-300 border-slate-700'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                />
                <datalist id="offense-template-names">
                  {offenseTemplates.map(f => <option key={f.id} value={f.name} />)}
                </datalist>
                {linkNote(isOffenseLinked)}
              </div>
              <div>
                <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-0.5 font-semibold`}>Target Defensive Front</label>
                <input
                  type="text"
                  list="defense-template-names"
                  value={currentPlay.frontDefense}
                  onChange={(e) => onUpdatePlayFormations(currentPlay.formationOffense, e.target.value)}
                  className={`w-full ${isLight ? 'bg-white text-rose-700 border-slate-300' : 'bg-[#161b22] text-rose-300 border-slate-700'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-rose-500 outline-none`}
                />
                <datalist id="defense-template-names">
                  {defenseTemplates.map(f => <option key={f.id} value={f.name} />)}
                </datalist>
                {linkNote(isDefenseLinked)}
              </div>
            </div>

            {/* STRATEGY TAGGING MATRIX (Spec 3.2) */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'} flex items-center gap-1.5`}>
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Strategy Tagging Matrix
                </span>
                <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'} font-mono`}>SPEC 3.2</span>
              </div>

              {/* 1. Primary Run Concept (Amber #f59e0b) */}
              <div>
                <label className="text-[11px] text-amber-500 font-semibold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Primary Run Concept
                </label>
                <select
                  value={currentPlay.primaryRunConcept || 'Inside Zone'}
                  onChange={(e) => onUpdateStrategyMatrix({ primaryRunConcept: e.target.value })}
                  className={`w-full ${isLight ? 'bg-white text-amber-700 border-amber-300' : 'bg-[#161b22] text-amber-300 border-amber-500/40'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-amber-400 outline-none`}
                >
                  {runConcepts.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 2. Counter-Action (Cyan #06b6d4) */}
              <div>
                <label className="text-[11px] text-cyan-500 font-semibold flex items-center gap-1 mb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Counter-Action / RPO Complement
                </label>
                <select
                  value={currentPlay.counterAction || 'Pop/Glance'}
                  onChange={(e) => onUpdateStrategyMatrix({ counterAction: e.target.value })}
                  className={`w-full ${isLight ? 'bg-white text-cyan-700 border-cyan-300' : 'bg-[#161b22] text-cyan-300 border-cyan-500/40'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-cyan-400 outline-none`}
                >
                  {counterActions.map((ca) => (
                    <option key={ca} value={ca}>{ca}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* SCHEMATIC PHILOSOPHY RATIONALE */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Schematic Philosophy Rationale
              </span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-tight`}>
                Why this scheme punishes the target defensive structure:
              </p>
              <textarea
                value={currentPlay.notes.philosophyReason}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, philosophyReason: e.target.value })
                }
                rows={3}
                placeholder="e.g. Neutralizes Mike scraping over the top while punishing 0-tech penetration with weakside glance RPO."
                className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs p-2 rounded border focus:border-sky-500 outline-none resize-none leading-relaxed`}
              />
            </div>

            {/* SITUATION & GAME FLOW TAGS */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'} block`}>
                Situational Call Sheet
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentPlay.situation.map((sit) => (
                  <span
                    key={sit}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                      isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {sit}
                    <button
                      onClick={() => handleRemoveSituation(sit)}
                      className={`hover:${isLight ? 'text-emerald-950' : 'text-emerald-100'} cursor-pointer`}
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
                  className={`flex-1 ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-white border-slate-700'} text-xs px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                />
                <button
                  onClick={handleAddSituation}
                  className={`px-2.5 py-1.5 ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} rounded text-xs border cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SCHEME TAGS */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'} block`}>
                Scheme Tags
              </span>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {currentPlay.tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                      isLight ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-sky-950/80 text-sky-300 border border-sky-700/50'
                    }`}
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)} className={`hover:${isLight ? 'text-sky-950' : 'text-sky-100'} cursor-pointer`}>
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
                  className={`flex-1 ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-white border-slate-700'} text-xs px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                />
                <button
                  onClick={handleAddTag}
                  className={`px-2.5 py-1.5 ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} rounded text-xs border cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </fieldset>
        )}

        {/* TAB 2: INSPECTOR (PLAYER OR VECTOR) */}
        {activeTab === 'inspector' && (
          <div className="space-y-4">
            {selectedPlayer ? (
              <div className="space-y-4">
                <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const {
                        shape: pShape,
                        nodeColor: pNodeColor,
                        fillColor: pFillColor,
                        letterColor: pLetterColor
                      } = resolvePlayerColors(selectedPlayer, colorSurface);

                      return (
                        <span
                          className={`w-7 h-7 flex items-center justify-center font-bold text-xs shadow-sm ${
                            pShape === 'round'
                              ? 'rounded-full'
                              : pShape === 'rounded_square'
                              ? 'rounded-md'
                              : pShape === 'square'
                              ? 'rounded-none'
                              : 'rounded-md border-2 border-dashed'
                          }`}
                          style={{
                            backgroundColor: pFillColor,
                            borderColor: selectedPlayer.hoverColor || pNodeColor,
                            borderWidth: '2px',
                            borderStyle: pShape === 'none' ? 'dashed' : 'solid',
                            color: pLetterColor
                          }}
                        >
                          {selectedPlayer.label}
                        </span>
                      );
                    })()}
                    <div>
                      <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Player Annotation Form</h3>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} capitalize`}>{selectedPlayer.side} • Side Form</p>
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
                        className={`text-slate-400 hover:${isLight ? 'text-slate-800' : 'text-white'} p-1 rounded hover:${isLight ? 'bg-slate-200' : 'bg-slate-800'} transition-colors`}
                        title="Close player form / Deselect"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <fieldset disabled={isView} className={formFieldsetClass}>
                {/* Player Label */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Position Label</label>
                  <input
                    type="text"
                    value={selectedPlayer.label}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, label: e.target.value })
                    }
                    className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-[#161b22] text-white border-slate-700'} text-xs font-bold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  />
                </div>

                {/* Role: what the player is, independent of the label (X, Y, H, F, S mean different things per scheme) */}
                <div>
                  <label htmlFor="player-position-select" className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Role</label>
                  <select
                    id="player-position-select"
                    value={selectedPlayer.position ?? ''}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, position: (e.target.value || undefined) as PlayerPosition | undefined })
                    }
                    className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-500' : 'bg-[#161b22] text-white border-slate-500'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  >
                    <option value="">Auto (from label and alignment)</option>
                    {(selectedPlayer.side === 'offense'
                      ? (['QB', 'RB', 'WR', 'TE', 'OL'] as const)
                      : (['DL', 'LB', 'DB'] as const)
                    ).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* DEFENSIVE PRE-ALIGNMENT & GAP ENGINE (when side === 'defense') */}
                {selectedPlayer.side === 'defense' ? (
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'} flex flex-col gap-2.5`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                          Pre-Align to Offense
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'} border`}>
                        Strength: {offenseStructure.strength.toUpperCase()}
                      </span>
                    </div>

                    {/* Active Alignment Status Pill */}
                    {selectedPlayer.technique && (
                      <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                        isLight ? 'bg-white border-rose-200 text-slate-800' : 'bg-[#161c26] border-rose-500/30 text-slate-200'
                      }`}>
                        <div className="flex items-center gap-1.5 truncate">
                          <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold text-amber-400 font-mono text-[11px]">
                            {selectedPlayer.technique}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {calculateDefensiveAlignmentPosition(selectedPlayer.technique, offenseStructure, selectedPlayer).description}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          ({selectedPlayer.x}, {selectedPlayer.y})
                        </span>
                      </div>
                    )}

                    {/* Offensive Receiver / Player Reference Section (For CB / NB / DB) */}
                    <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-white/95 border-rose-200 shadow-sm' : 'bg-[#151a24] border-slate-700/60'} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                            Offensive Reference (CB / NB)
                          </span>
                        </div>
                        {selectedPlayer.alignReferenceTarget && selectedPlayer.alignReferenceTarget !== 'auto' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40">
                            Anchored
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-medium">
                            Auto
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Target Reference Selector */}
                        <div>
                          <label className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-0.5 font-semibold`}>
                            Target Player
                          </label>
                          <select
                            value={selectedPlayer.alignReferenceTarget || 'auto'}
                            onChange={(e) => handleUpdateReferenceTarget(e.target.value)}
                            className={`w-full ${
                              isLight ? 'bg-slate-50 text-slate-800 border-slate-300' : 'bg-[#1a212e] text-slate-200 border-slate-700'
                            } text-xs font-semibold px-2 py-1.5 rounded border focus:border-sky-500 outline-none`}
                          >
                            <option value="auto">Auto (from technique)</option>
                            <optgroup label="Numbered Receivers (Outside-In)">
                              <option value="#1_wr_left">#1 WR Left {offenseStructure.number1Left ? `(${offenseStructure.number1Left.label})` : ''}</option>
                              <option value="#1_wr_right">#1 WR Right {offenseStructure.number1Right ? `(${offenseStructure.number1Right.label})` : ''}</option>
                              <option value="#2_slot_left">#2 Slot Left {offenseStructure.number2Left ? `(${offenseStructure.number2Left.label})` : ''}</option>
                              <option value="#2_slot_right">#2 Slot Right {offenseStructure.number2Right ? `(${offenseStructure.number2Right.label})` : ''}</option>
                              <option value="#3_slot_left">#3 Slot Left {offenseStructure.number3Left ? `(${offenseStructure.number3Left.label})` : ''}</option>
                              <option value="#3_slot_right">#3 Slot Right {offenseStructure.number3Right ? `(${offenseStructure.number3Right.label})` : ''}</option>
                            </optgroup>
                            <optgroup label="Offensive Players">
                              {currentPlay.players.filter(p => p.side === 'offense').map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.label} (x: {p.x})
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {/* Alignment Leverage Selector */}
                        <div>
                          <label className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-0.5 font-semibold`}>
                            Leverage / Depth
                          </label>
                          <select
                            value={selectedPlayer.alignLeverage || 'off_cushion'}
                            onChange={(e) => handleUpdateLeverage(e.target.value as AlignmentLeverage)}
                            className={`w-full ${
                              isLight ? 'bg-slate-50 text-slate-800 border-slate-300' : 'bg-[#1a212e] text-slate-200 border-slate-700'
                            } text-xs font-semibold px-2 py-1.5 rounded border focus:border-sky-500 outline-none`}
                          >
                            <option value="off_cushion">Off Cushion (7 yds)</option>
                            <option value="press">Press (2.5 yds)</option>
                            <option value="inside_shade">Inside Shade</option>
                            <option value="outside_shade">Outside Shade</option>
                            <option value="head_up">Head-Up</option>
                            <option value="apex">Apex Overhang</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Single-Player Gap Shifting Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShiftPlayerGap('left')}
                        className={`flex-1 py-1 px-2 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#181f2a] hover:bg-[#202938] border-slate-700 text-slate-200'
                        }`}
                        title="Shift this defender 1 gap to the left"
                      >
                        <ChevronLeft className="w-3 h-3" /> Shift Gap Left
                      </button>

                      <button
                        type="button"
                        onClick={handleSnapPlayerToAlignment}
                        className={`py-1 px-2.5 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          isLight ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                        }`}
                        title="Re-snap to calculated coordinates for current technique"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" /> Re-Snap
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShiftPlayerGap('right')}
                        className={`flex-1 py-1 px-2 rounded border text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#181f2a] hover:bg-[#202938] border-slate-700 text-slate-200'
                        }`}
                        title="Shift this defender 1 gap to the right"
                      >
                        Shift Gap Right <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Technique Level Selector Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-700/40 pb-1">
                      {(['DL', 'LB', 'DB'] as const).map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setTechCategoryTab(tab)}
                          className={`flex-1 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                            techCategoryTab === tab
                              ? isLight ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm'
                              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tab === 'DL' ? '1st Level (DL)' : tab === 'LB' ? '2nd Level (LB)' : '3rd Level (DB)'}
                        </button>
                      ))}
                    </div>

                    {/* Quick Technique / Gap Chips Grid */}
                    <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                      {COMMON_DEFENSIVE_TECHNIQUES.filter(t => t.category === techCategoryTab).map(tech => {
                        const isMatch = selectedPlayer.technique === tech.code;
                        return (
                          <button
                            key={tech.code}
                            type="button"
                            onClick={() => handleApplyDefensiveTechnique(tech.code)}
                            className={`px-2 py-1 rounded border text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              isMatch
                                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                                : isLight
                                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                                  : 'bg-[#181f2a] hover:bg-[#222b3a] border-slate-700/70 text-slate-300'
                            }`}
                            title={tech.gapDesc || tech.label}
                          >
                            <span>{tech.code}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Technique / Alignment Input & Snap */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Custom technique (e.g. 4i-Tech Weak, Apex Strong)"
                        value={selectedPlayer.technique || ''}
                        onChange={(e) => onUpdatePlayer({ ...selectedPlayer, technique: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSnapPlayerToAlignment();
                          }
                        }}
                        className={`flex-1 ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-amber-300 border-slate-700'} text-xs px-2 py-1 rounded border focus:border-amber-500 outline-none`}
                      />
                      <button
                        type="button"
                        onClick={handleSnapPlayerToAlignment}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow transition-all active:scale-95"
                        title="Snap player coordinate to this alignment parameter"
                      >
                        Snap
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Offensive Technique / Assignment */
                  <div>
                    <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>
                      Technique / Assignment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Zone Track, Combo 0-Tech"
                      value={selectedPlayer.technique || ''}
                      onChange={(e) =>
                        onUpdatePlayer({ ...selectedPlayer, technique: e.target.value })
                      }
                      className={`w-full ${isLight ? 'bg-white text-amber-700 border-slate-300' : 'bg-[#161b22] text-amber-300 border-slate-700'} text-xs px-2.5 py-1.5 rounded border focus:border-amber-500 outline-none`}
                    />
                  </div>
                )}

                {/* Player Node Shape Selector (Round, Square, Rounded Square, None) */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>
                    Player Node Shape
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdatePlayer({ ...selectedPlayer, shape: 'round' })}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedPlayer.shape === 'round'
                          ? isLight ? 'bg-sky-100 border-sky-400 text-sky-800 shadow-sm' : 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm'
                          : isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-[#161b22] border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title="Round: Traditional circle node"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block shrink-0"></span>
                      <span>Round</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePlayer({ ...selectedPlayer, shape: 'square' })}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedPlayer.shape === 'square'
                          ? isLight ? 'bg-sky-100 border-sky-400 text-sky-800 shadow-sm' : 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm'
                          : isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-[#161b22] border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title="Square: Crisp square box"
                    >
                      <span className="w-3.5 h-3.5 rounded-none border-2 border-current inline-block shrink-0"></span>
                      <span>Square</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePlayer({ ...selectedPlayer, shape: 'rounded_square' })}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedPlayer.shape === 'rounded_square'
                          ? isLight ? 'bg-sky-100 border-sky-400 text-sky-800 shadow-sm' : 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm'
                          : isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-[#161b22] border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title="Rounded Square: Squircle node with rounded corners"
                    >
                      <span className="w-3.5 h-3.5 rounded-md border-2 border-current inline-block shrink-0"></span>
                      <span>Rounded</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdatePlayer({ ...selectedPlayer, shape: 'none' })}
                      className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                        (selectedPlayer.shape || 'none') === 'none'
                          ? isLight ? 'bg-sky-100 border-sky-400 text-sky-800 shadow-sm' : 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-sm'
                          : isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-[#161b22] border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                      title="None: Bare text label with no enclosing round or square shape"
                    >
                      <Type className="w-3.5 h-3.5 shrink-0" />
                      <span>None</span>
                    </button>
                  </div>
                </div>

                {/* PLAYER COLOR PARAMETERS (3 Color Parameters: Letter Color, Node Color, Fill Color + Optional Hover Color) */}
                {(() => {
                  const {
                    nodeColor: pNodeColor,
                    fillColor: pFillColor,
                    letterColor: pLetterColor
                  } = resolvePlayerColors(selectedPlayer, colorSurface);

                  return (
                    <div className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'} space-y-3`}>
                      <div className="flex items-center justify-between">
                        <label className={`text-[11px] ${isLight ? 'text-slate-800' : 'text-slate-200'} font-bold flex items-center gap-1.5`}>
                          <Palette className="w-3.5 h-3.5 text-sky-500" />
                          <span>Player Colors</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => onUpdatePlayer({
                            ...selectedPlayer,
                            shape: 'none',
                            nodeColor: '#000000',
                            fillColor: 'transparent',
                            letterColor: '#000000',
                            hoverColor: undefined,
                            color: undefined
                          })}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                            isLight
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title="Set default black 0/0/0 with no node shape"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Default Black</span>
                        </button>
                      </div>

                      {/* 1. Node Color (Border / Outline) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block shadow-xs"
                              style={{ backgroundColor: pNodeColor }}
                            />
                            <span>Node Color (Border)</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{pNodeColor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {CORE_PLAYER_SWATCHES.map(swatch => {
                            const isCurrent = pNodeColor.toLowerCase() === swatch.color.toLowerCase();
                            return (
                              <button
                                key={`node-${swatch.color}`}
                                type="button"
                                onClick={() => onUpdatePlayer({ ...selectedPlayer, nodeColor: swatch.color })}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer hover:scale-125 shrink-0 ${
                                  isCurrent
                                    ? 'ring-2 ring-sky-500 ring-offset-1 border-white scale-110 shadow-sm'
                                    : 'border-black/20 hover:border-slate-400 opacity-90 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: swatch.color }}
                                title={`Node: ${swatch.label}`}
                              />
                            );
                          })}
                          {/* Custom Picker */}
                          <label
                            className={`relative w-5 h-5 rounded-full border border-dashed ${
                              isLight ? 'border-slate-400 hover:border-sky-500 bg-white' : 'border-slate-600 hover:border-sky-400 bg-slate-800'
                            } cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-125 shrink-0`}
                            title="Custom node color"
                          >
                            <input
                              type="color"
                              value={pNodeColor}
                              onChange={(e) => onUpdatePlayer({ ...selectedPlayer, nodeColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-[10px] font-bold text-slate-400 leading-none">+</span>
                          </label>
                        </div>
                      </div>

                      {/* 2. Fill Color (Interior Background) */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block shadow-xs"
                              style={{ backgroundColor: pFillColor === 'transparent' ? 'transparent' : pFillColor }}
                            />
                            <span>Fill Color (Interior)</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{pFillColor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {CORE_PLAYER_SWATCHES.map(swatch => {
                            const isCurrent = pFillColor.toLowerCase() === swatch.color.toLowerCase();
                            return (
                              <button
                                key={`fill-${swatch.color}`}
                                type="button"
                                onClick={() => onUpdatePlayer({ ...selectedPlayer, fillColor: swatch.color })}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer hover:scale-125 shrink-0 ${
                                  isCurrent
                                    ? 'ring-2 ring-sky-500 ring-offset-1 border-white scale-110 shadow-sm'
                                    : 'border-black/20 hover:border-slate-400 opacity-90 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: swatch.color }}
                                title={`Fill: ${swatch.label}`}
                              />
                            );
                          })}
                          {/* Transparent chip */}
                          <button
                            type="button"
                            onClick={() => onUpdatePlayer({ ...selectedPlayer, fillColor: 'transparent' })}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border transition-all cursor-pointer ${
                              pFillColor === 'transparent'
                                ? 'ring-2 ring-sky-500 border-sky-400 bg-sky-50 text-sky-800'
                                : isLight ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                            title="Hollow / Transparent interior"
                          >
                            None
                          </button>
                          {/* Custom Picker */}
                          <label
                            className={`relative w-5 h-5 rounded-full border border-dashed ${
                              isLight ? 'border-slate-400 hover:border-sky-500 bg-white' : 'border-slate-600 hover:border-sky-400 bg-slate-800'
                            } cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-125 shrink-0`}
                            title="Custom fill color"
                          >
                            <input
                              type="color"
                              value={pFillColor === 'transparent' ? '#000000' : pFillColor}
                              onChange={(e) => onUpdatePlayer({ ...selectedPlayer, fillColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-[10px] font-bold text-slate-400 leading-none">+</span>
                          </label>
                        </div>
                      </div>

                      {/* 3. Letter Color (Position Label Text) */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block shadow-xs"
                              style={{ backgroundColor: pLetterColor }}
                            />
                            <span>Letter Color (Text)</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{pLetterColor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {CORE_PLAYER_SWATCHES.map(swatch => {
                            const isCurrent = pLetterColor.toLowerCase() === swatch.color.toLowerCase();
                            return (
                              <button
                                key={`letter-${swatch.color}`}
                                type="button"
                                onClick={() => onUpdatePlayer({ ...selectedPlayer, letterColor: swatch.color })}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer hover:scale-125 shrink-0 ${
                                  isCurrent
                                    ? 'ring-2 ring-sky-500 ring-offset-1 border-white scale-110 shadow-sm'
                                    : 'border-black/20 hover:border-slate-400 opacity-90 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: swatch.color }}
                                title={`Letter: ${swatch.label}`}
                              />
                            );
                          })}
                          {/* Custom Picker */}
                          <label
                            className={`relative w-5 h-5 rounded-full border border-dashed ${
                              isLight ? 'border-slate-400 hover:border-sky-500 bg-white' : 'border-slate-600 hover:border-sky-400 bg-slate-800'
                            } cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-125 shrink-0`}
                            title="Custom letter color"
                          >
                            <input
                              type="color"
                              value={pLetterColor}
                              onChange={(e) => onUpdatePlayer({ ...selectedPlayer, letterColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-[10px] font-bold text-slate-400 leading-none">+</span>
                          </label>
                        </div>
                      </div>

                      {/* 4. Optional Hover Color */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'} flex items-center gap-1.5`}>
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/30 inline-block shadow-xs"
                              style={{ backgroundColor: selectedPlayer.hoverColor || 'transparent' }}
                            />
                            <span>Hover Color (Optional)</span>
                          </span>
                          {selectedPlayer.hoverColor && (
                            <button
                              type="button"
                              onClick={() => onUpdatePlayer({ ...selectedPlayer, hoverColor: undefined })}
                              className="text-[9px] text-slate-400 hover:text-rose-500 hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {HOVER_SWATCHES.map(swatch => {
                            const isCurrent = (selectedPlayer.hoverColor || '').toLowerCase() === swatch.color.toLowerCase();
                            return (
                              <button
                                key={`hover-${swatch.color}`}
                                type="button"
                                onClick={() => onUpdatePlayer({ ...selectedPlayer, hoverColor: swatch.color })}
                                className={`w-5 h-5 rounded-full border transition-all cursor-pointer hover:scale-125 shrink-0 ${
                                  isCurrent
                                    ? 'ring-2 ring-sky-500 ring-offset-1 border-white scale-110 shadow-sm'
                                    : 'border-black/20 hover:border-slate-400 opacity-90 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: swatch.color }}
                                title={`Hover: ${swatch.label}`}
                              />
                            );
                          })}
                          {/* Custom Picker */}
                          <label
                            className={`relative w-5 h-5 rounded-full border border-dashed ${
                              isLight ? 'border-slate-400 hover:border-sky-500 bg-white' : 'border-slate-600 hover:border-sky-400 bg-slate-800'
                            } cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-125 shrink-0`}
                            title="Custom hover color"
                          >
                            <input
                              type="color"
                              value={selectedPlayer.hoverColor || '#38bdf8'}
                              onChange={(e) => onUpdatePlayer({ ...selectedPlayer, hoverColor: e.target.value })}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <span className="text-[10px] font-bold text-slate-400 leading-none">+</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Assignment Title */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Assignment Title</label>
                  <input
                    type="text"
                    value={selectedPlayer.assignmentTitle}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, assignmentTitle: e.target.value })
                    }
                    placeholder="e.g. Glance Route / Zone Step"
                    className={`w-full ${isLight ? 'bg-white text-sky-700 border-slate-300' : 'bg-[#161b22] text-sky-400 border-slate-700'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  />
                </div>

                {/* Assignment Notes */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>
                    Assignment Coaching Notes
                  </label>
                  <textarea
                    value={selectedPlayer.assignmentNotes}
                    onChange={(e) =>
                      onUpdatePlayer({ ...selectedPlayer, assignmentNotes: e.target.value })
                    }
                    rows={4}
                    placeholder="Provide execution details, read rules, alignment splits, and leverage."
                    className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-300 border-slate-700'} text-xs p-2 rounded border focus:border-sky-500 outline-none resize-none leading-relaxed`}
                  />
                </div>

                {/* Coaching Keys List */}
                <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'} p-2.5 rounded-lg border space-y-2`}>
                  <label className="text-[11px] text-amber-500 font-semibold block">
                    Key Coaching Points
                  </label>
                  <div className="space-y-1">
                    {(selectedPlayer.coachingKeys || []).map((key, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between text-[11px] ${isLight ? 'bg-white text-slate-800 border-slate-200' : 'bg-[#161b22] text-slate-300 border-slate-800'} px-2 py-1 rounded border`}
                      >
                        <span>• {key}</span>
                        <button
                          onClick={() => handleRemoveCoachingKey(idx)}
                          className="text-slate-500 hover:text-rose-500 cursor-pointer"
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
                      className={`flex-1 ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-white border-slate-700'} text-xs px-2 py-1 rounded border focus:border-sky-500 outline-none`}
                    />
                    <button
                      onClick={handleAddCoachingKey}
                      className={`px-2 py-1 ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} rounded text-xs border cursor-pointer`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                </fieldset>
              </div>
            ) : selectedAction ? (
              <div className="space-y-4">
                <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-700'}`}>
                  <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
                    <Sliders className="w-3.5 h-3.5 text-sky-500" />
                    Vector Path Inspector
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedAction.points.length} waypoints
                  </span>
                </div>

                <fieldset disabled={isView} className={formFieldsetClass}>
                {/* Action Type */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Vector Action Type</label>
                  <select
                    value={selectedAction.type}
                    onChange={(e) =>
                      onUpdateAction({ ...selectedAction, type: e.target.value as ActionType })
                    }
                    className={`w-full ${isLight ? 'bg-white text-sky-700 border-slate-300' : 'bg-[#161b22] text-sky-400 border-slate-700'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  >
                    <option value="pass_route">Pass Route</option>
                    <option value="run_block">Run Block</option>
                    <option value="pull_block">Pull Block</option>
                    <option value="motion">Motion Track</option>
                  </select>
                </div>

                {/* Vector Line Color Picker */}
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'} font-semibold flex items-center gap-1.5`}>
                      <Palette className="w-3.5 h-3.5 text-sky-500" />
                      <span>Line Color</span>
                    </label>
                    {selectedAction.color && (
                      <button
                        type="button"
                        onClick={() => onUpdateAction({ ...selectedAction, color: undefined })}
                        className="text-[10px] text-sky-500 hover:underline cursor-pointer"
                        title="Reset to action type default color"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {LINE_COLOR_SWATCHES.map(swatch => {
                      const defaultColor = selectedAction.type === 'run_block' ? '#f59e0b' : selectedAction.type === 'pull_block' ? '#ec4899' : selectedAction.type === 'motion' ? '#c084fc' : '#38bdf8';
                      const activeColor = selectedAction.color || defaultColor;
                      const isCurrent = activeColor.toLowerCase() === swatch.color.toLowerCase();
                      return (
                        <button
                          key={swatch.color}
                          type="button"
                          onClick={() => onUpdateAction({ ...selectedAction, color: swatch.color })}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer hover:scale-125 shrink-0 ${
                            isCurrent
                              ? 'ring-2 ring-sky-500 ring-offset-1 border-white scale-110 shadow-sm'
                              : 'border-black/20 hover:border-slate-400 opacity-90 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: swatch.color }}
                          title={swatch.label}
                        />
                      );
                    })}

                    {/* Custom Color Input */}
                    <label
                      className={`relative w-5 h-5 rounded-full border border-dashed ${
                        isLight ? 'border-slate-400 hover:border-sky-500 bg-white' : 'border-slate-600 hover:border-sky-400 bg-slate-800'
                      } cursor-pointer flex items-center justify-center overflow-hidden transition-all hover:scale-125 shrink-0`}
                      title="Custom color picker"
                    >
                      <input
                        type="color"
                        value={selectedAction.color || (selectedAction.type === 'run_block' ? '#f59e0b' : selectedAction.type === 'pull_block' ? '#ec4899' : selectedAction.type === 'motion' ? '#c084fc' : '#38bdf8')}
                        onChange={(e) => onUpdateAction({ ...selectedAction, color: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-[10px] font-bold text-slate-400 leading-none">+</span>
                    </label>
                  </div>
                </div>

                {/* Marker Type */}
                <div>
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Terminal Marker</label>
                  <select
                    value={selectedAction.endMarker}
                    onChange={(e) =>
                      onUpdateAction({
                        ...selectedAction,
                        endMarker: e.target.value as PathAction['endMarker']
                      })
                    }
                    className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs font-semibold px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  >
                    <option value="arrow">Arrowhead (#arrow)</option>
                    <option value="tbar">T-Bar (#tbar)</option>
                    <option value="dot">Dot Point (#dot)</option>
                    <option value="none">None</option>
                  </select>
                </div>

                {/* Curved Toggle */}
                <div className={`flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'} p-2.5 rounded-lg border`}>
                  <div>
                    <div className={`text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Bézier Smoothing</div>
                    <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
                  <label className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} block mb-1 font-semibold`}>Waypoint Cue Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Break at 10 yds / Speed Flat"
                    value={selectedAction.label || ''}
                    onChange={(e) =>
                      onUpdateAction({ ...selectedAction, label: e.target.value })
                    }
                    className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs px-2.5 py-1.5 rounded border focus:border-sky-500 outline-none`}
                  />
                </div>

                {/* Waypoints & Break Geometry (Catmull-Rom & Sharp Cuts) */}
                <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/70 border-slate-800'} p-3 rounded-lg border space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500 block">
                      Waypoints & Break Geometry
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">C¹ Spline / C⁰ Cut</span>
                  </div>
                  <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight`}>
                    Decompose route and block tracks into multi-segment paths ($C^1$ smooth sweeps & $C^0$ sharp plant cuts).
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {selectedAction.points.map((pt, pIdx) => {
                      const isOrigin = pIdx === 0;
                      const isSharp = Boolean(pt.isSharp);

                      return (
                        <div
                          key={pIdx}
                          className={`flex items-center justify-between text-[11px] ${isLight ? 'bg-white border-slate-200' : 'bg-[#161b22] border-slate-800'} px-2.5 py-1.5 rounded border`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-500">
                              {isOrigin ? 'P0 (Origin)' : `P${pIdx}`}
                            </span>
                            <span className={`${isLight ? 'text-slate-700' : 'text-slate-300'} font-mono text-[11px]`}>
                              ({Math.round(pt.x)}, {Math.round(pt.y)})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isOrigin && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...selectedAction.points];
                                  updated[pIdx] = { ...pt, isSharp: !isSharp };
                                  onUpdateAction({ ...selectedAction, points: updated });
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                  isSharp
                                    ? isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-950/80 text-amber-300 border border-amber-600/50'
                                    : isLight ? 'bg-sky-100 text-sky-800 border border-sky-300' : 'bg-sky-950/80 text-sky-300 border border-sky-600/50'
                                }`}
                                title="Toggle between Sharp Cut Plant (C0) and Smooth Arc (C1)"
                              >
                                <span
                                  className={`w-1.5 h-1.5 ${
                                    isSharp ? 'rotate-45 bg-amber-500' : 'rounded-full bg-sky-500'
                                  }`}
                                ></span>
                                {isSharp ? 'Sharp Cut' : 'Smooth Arc'}
                              </button>
                            )}

                            {!isOrigin && selectedAction.points.length > 2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = selectedAction.points.filter((_, idx) => idx !== pIdx);
                                  onUpdateAction({ ...selectedAction, points: updated });
                                }}
                                className={`text-slate-400 hover:text-rose-500 p-1 rounded hover:${isLight ? 'bg-slate-200' : 'bg-slate-800'} transition-colors cursor-pointer`}
                                title="Delete this waypoint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Decompose / Add Waypoint Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const pts = selectedAction.points;
                      if (pts.length < 2) return;
                      const pPrev = pts[pts.length - 2];
                      const pLast = pts[pts.length - 1];
                      const midPoint: Point = {
                        x: Math.round((pPrev.x + pLast.x) / 2),
                        y: Math.round((pPrev.y + pLast.y) / 2),
                        isSharp: false
                      };
                      const updated = [
                        ...pts.slice(0, pts.length - 1),
                        midPoint,
                        pLast
                      ];
                      onUpdateAction({ ...selectedAction, points: updated });
                    }}
                    className={`w-full mt-2 py-1.5 px-3 ${
                      isLight
                        ? 'bg-sky-50 hover:bg-sky-100 border-sky-300 text-sky-800'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-sky-500/50 text-sky-300'
                    } border rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Decompose Path / Add Waypoint</span>
                  </button>

                  {/* Template assignment: editing any of these marks the block as a hand edit that re-aiming keeps */}
                  {selectedAction.assignmentId && onEditAssignment && (() => {
                    const assignment = currentPlay.blockPlan?.assignments.find(a => a.id === selectedAction.assignmentId);
                    if (!assignment) return null;
                    const defenders = currentPlay.players.filter(p => p.side === 'defense');
                    const blockers = currentPlay.blockPlan!.assignments.filter(a => a.playerId !== assignment.playerId);
                    const targetValue = assignment.target.type === 'defender'
                      ? `def:${assignment.target.playerId}`
                      : assignment.target.type === 'level' ? 'level' : 'none';
                    const selectClass = `w-full px-2 py-1 rounded border text-xs ${isLight ? 'bg-white border-slate-500 text-slate-900' : 'bg-slate-900 border-slate-500 text-slate-100'}`;
                    const labelClass = `block text-[11px] font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`;
                    return (
                      <div className={`mt-3 pt-3 border-t space-y-2 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>Template assignment</span>
                          {assignment.override && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${isLight ? 'bg-sky-100 text-sky-900 border-sky-700' : 'bg-sky-950 text-sky-200 border-sky-500'}`}>Hand edit</span>
                          )}
                        </div>
                        {assignment.stale && (
                          <p className={`text-[11px] font-semibold ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                            Target gone. Pick another or clear the blocks.
                          </p>
                        )}
                        <label className="block">
                          <span className={labelClass}>Blocks</span>
                          <select
                            aria-label="Block target"
                            value={targetValue}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (v === 'level') onEditAssignment(assignment.id, { target: { type: 'level', level: 'second' } });
                              else if (v === 'none') onEditAssignment(assignment.id, { target: { type: 'none' } });
                              else onEditAssignment(assignment.id, { target: { type: 'defender', playerId: v.slice(4) } });
                            }}
                            className={selectClass}
                          >
                            {assignment.stale && assignment.target.type === 'defender' && (
                              <option value={targetValue}>(gone) {assignment.target.playerId}</option>
                            )}
                            <option value="level">Second level (nearest linebacker)</option>
                            {defenders.map(d => (
                              <option key={d.id} value={`def:${d.id}`}>{d.label}{d.technique ? ` (${d.technique})` : ''}</option>
                            ))}
                            <option value="none">Nobody</option>
                          </select>
                        </label>
                        <label className="block">
                          <span className={labelClass}>Combo with</span>
                          <select
                            aria-label="Combo partner"
                            value={assignment.comboWith ?? ''}
                            onChange={(e) => onEditAssignment(assignment.id, { comboWith: e.target.value === '' ? null : e.target.value })}
                            className={selectClass}
                          >
                            <option value="">Nobody</option>
                            {blockers.map(b => (
                              <option key={b.playerId} value={b.playerId}>{currentPlay.players.find(p => p.id === b.playerId)?.label ?? b.playerId}</option>
                            ))}
                          </select>
                        </label>
                        <label className={`flex items-center gap-2 text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          <input
                            type="checkbox"
                            checked={assignment.pulls === true}
                            onChange={(e) => onEditAssignment(assignment.id, { pulls: e.target.checked })}
                          />
                          Pulls
                        </label>
                      </div>
                    );
                  })()}

                  {/* Combo & Option Block (Restart) */}
                  {(selectedAction.type === 'run_block' || selectedAction.type === 'pull_block') && (
                    <div className={`mt-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`text-[11px] font-bold ${isLight ? 'text-amber-800' : 'text-amber-400'} uppercase tracking-wider flex items-center gap-1`}>
                          <span>Combo & Option Block</span>
                        </label>
                        {selectedAction.parentActionId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                            Combo Branch
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] mb-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Restart a second-level continuation block (e.g. double-team release to linebacker, or option read seal) directly from this block's endpoint.
                      </p>
                      <button
                        type="button"
                        onClick={() => onStartRestartBlock?.(selectedAction)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Restart Block from Terminal T-Bar</span>
                      </button>
                    </div>
                  )}
                </div>
                </fieldset>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} p-3 rounded-lg border text-center space-y-1`}>
                  <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center justify-center gap-1.5`}>
                    <FileEdit className="w-3.5 h-3.5 text-sky-500" />
                    Player Annotation Form
                  </h4>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Select any player on the chalkboard or roster below to edit their assignments & coaching notes:
                  </p>
                </div>

                {/* Offense Players Roster */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 flex items-center justify-between">
                    <span>Offense</span>
                    <span className="text-slate-500 font-mono text-[9px]">{currentPlay.players.filter(p => p.side === 'offense').length} players</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPlay.players.filter(p => p.side === 'offense').map(player => {
                      const badgeStyle = getPlayerRosterBadgeStyle(player);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => onSelectPlayer?.(player.id)}
                          className={`flex items-center gap-2 p-1.5 ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-sky-400'
                              : 'bg-[#161b22] hover:bg-slate-800 border-slate-700 hover:border-sky-500/50'
                          } border rounded text-left transition-all group cursor-pointer`}
                        >
                          <span
                            className={`w-5 h-5 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm ${
                              (player.shape || 'none') === 'round'
                                ? 'rounded-full'
                                : (player.shape || 'none') === 'rounded_square'
                                ? 'rounded-sm'
                                : (player.shape || 'none') === 'square'
                                ? 'rounded-none'
                                : 'rounded-sm border border-dashed'
                            }`}
                            style={badgeStyle}
                          >
                            {player.label}
                          </span>
                          <div className="overflow-hidden">
                            <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'} truncate leading-tight`}>
                              {player.assignmentTitle || 'Assignment'}
                            </div>
                            {player.technique && (
                              <div className="text-[9px] text-amber-500 truncate leading-tight font-medium">
                                {player.technique}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Defense Players Roster */}
                <div className={`space-y-1.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center justify-between">
                    <span>Defense</span>
                    <span className="text-slate-500 font-mono text-[9px]">{currentPlay.players.filter(p => p.side === 'defense').length} defenders</span>
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentPlay.players.filter(p => p.side === 'defense').map(player => {
                      const badgeStyle = getPlayerRosterBadgeStyle(player);
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => onSelectPlayer?.(player.id)}
                          className={`flex items-center gap-2 p-1.5 ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-rose-400'
                              : 'bg-[#161b22] hover:bg-slate-800 border-slate-700 hover:border-rose-500/50'
                          } border rounded text-left transition-all group cursor-pointer`}
                        >
                          <span
                            className={`w-5 h-5 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm ${
                              (player.shape || 'none') === 'round'
                                ? 'rounded-full'
                                : (player.shape || 'none') === 'rounded_square'
                                ? 'rounded-sm'
                                : (player.shape || 'none') === 'square'
                                ? 'rounded-none'
                                : 'rounded-sm border border-dashed'
                            }`}
                            style={badgeStyle}
                          >
                            {player.label}
                          </span>
                          <div className="overflow-hidden">
                            <div className={`text-[10px] font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'} truncate leading-tight`}>
                              {player.assignmentTitle || 'Defend Gap'}
                            </div>
                            {player.technique && (
                              <div className="text-[9px] text-amber-500 truncate leading-tight font-medium">
                                {player.technique}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QB READ FLOW & BLOCKING RULES (Spec 1.2 / Spec 3) */}
        {activeTab === 'read_flow' && (
          <fieldset disabled={isView} className={formFieldsetClass}>
            {/* QB Read Progression */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                QB Read Progression & Mesh Rules
              </span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-tight`}>
                Defensive conflict defender, mesh read cue, and secondary progressions:
              </p>
              <textarea
                value={currentPlay.notes.qbRead}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, qbRead: e.target.value })
                }
                rows={4}
                className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs p-2 rounded border focus:border-sky-500 outline-none resize-none leading-relaxed font-sans`}
              />
            </div>

            {/* Offensive Line Blocking Track */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Offensive Line Track & Combos
              </span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-tight`}>
                Gap rules, scoop tracks, combo releases to second-level linebackers:
              </p>
              <textarea
                value={currentPlay.notes.lineBlocking}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, lineBlocking: e.target.value })
                }
                rows={4}
                className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs p-2 rounded border focus:border-amber-500 outline-none resize-none leading-relaxed font-sans`}
              />
            </div>

            {/* Coaching Cue & Hot Route */}
            <div className={`${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'} rounded-lg p-3 border space-y-2`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-400'} block`}>
                Hot Answer / Blitz Pressure Key
              </span>
              <input
                type="text"
                value={currentPlay.notes.hotRoute || ''}
                onChange={(e) =>
                  onUpdatePlayNotes({ ...currentPlay.notes, hotRoute: e.target.value })
                }
                placeholder="e.g. F on immediate flat if boundary nickel blitzes"
                className={`w-full ${isLight ? 'bg-white text-slate-800 border-slate-300' : 'bg-[#161b22] text-slate-200 border-slate-700'} text-xs px-2.5 py-1.5 rounded border focus:border-purple-500 outline-none`}
              />
            </div>
          </fieldset>
        )}
      </div>
    </aside>
  );
};
