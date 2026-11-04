import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Copy, Layers, PlusCircle, RotateCcw, Save, Shield, Zap } from 'lucide-react';
import type { Formation, Play, PlayCategory, RouteAdaptationMode, Theme } from '../types/playbook';
import type { SnapAlignment } from '../utils/formationBackfield';
import { resolveFormation } from '../utils/playMigrations';

type ShiftDirection = 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan';

interface PlayBarProps {
  theme: Theme;
  /** View mode is read-only: everything that edits the play is disabled, navigation stays live */
  isView: boolean;
  currentPlay: Play;
  allPlays: Play[];
  formations: Formation[];
  showGaps: boolean;
  currentQBAlignment: SnapAlignment;
  routeAdaptationMode: RouteAdaptationMode;
  onSelectPlay: (playId: string) => void;
  onUpdatePlayName: (name: string) => void;
  onUpdateCategory: (category: PlayCategory) => void;
  onNewPlay: () => void;
  onDuplicatePlay: () => void;
  onResetCanvas: () => void;
  onSelectOffenseFormation: (formationId: string) => void;
  onSelectDefenseFront: (formationId: string) => void;
  onUpdateOffenseFormation: () => void;
  onUpdateDefenseFront: () => void;
  onMorphBackfield: (alignment: SnapAlignment) => void;
  onToggleRouteAdaptationMode: () => void;
  onToggleShowGaps: () => void;
  onShiftDefense: (direction: ShiftDirection) => void;
  onRealignDefense: () => void;
  onOpenDefensePackages: () => void;
  /** Run templates: open the picker; the other three only appear once the play has template blocks */
  onOpenRunTemplates: () => void;
  hasBlockPlan: boolean;
  canUpdateRunTemplate: boolean;
  onSaveRunTemplate: () => void;
  onUpdateRunTemplate: () => void;
  onClearBlocks: () => void;
}

interface FormationGroup {
  label: string;
  items: Formation[];
}

const MATCHUP_OPEN_KEY = 'football_matchup_bar';

const CATEGORY_OPTIONS: { value: PlayCategory; label: string }[] = [
  { value: 'run', label: 'Run' },
  { value: 'pass_dropback', label: 'Dropback Pass' },
  { value: 'rpo', label: 'RPO' },
  { value: 'pass_action', label: 'Play-Action' },
  { value: 'screen', label: 'Screen' },
  { value: 'blitz_pickup', label: 'Blitz Pickup' }
];

const OFFENSE_STYLES: { style: string; label: string }[] = [
  { style: 'pro_style', label: 'Pro Style (Under Center & Heavy)' },
  { style: 'spread', label: 'Spread (10 & 11 Personnel)' },
  { style: 'old_school', label: 'Old School (Option & Multi-Back)' }
];

const DEFENSE_STYLES: { style: string; label: string }[] = [
  { style: 'even_front', label: 'Even Fronts (4-Down Linemen)' },
  { style: 'odd_front', label: 'Odd Fronts (3-Down Linemen)' },
  { style: 'heavy_front', label: 'Heavy / Bear Fronts' }
];

function groupByStyle(formations: Formation[], styles: { style: string; label: string }[], otherLabel: string): FormationGroup[] {
  const known = new Set(styles.map(s => s.style));
  return [
    ...styles.map(s => ({ label: s.label, items: formations.filter(f => f.style === s.style) })),
    { label: otherLabel, items: formations.filter(f => !f.style || !known.has(f.style)) }
  ].filter(group => group.items.length > 0);
}

// Every control wears the same skin; borders use slate-500 so the edge of a control is visible (3:1) on the bar.
const fieldClass = (isLight: boolean) =>
  `text-[11px] font-medium rounded px-2 py-1 border outline-none focus:ring-2 ${
    isLight
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-500 focus:ring-sky-700'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-500 focus:ring-sky-400'
  }`;

const buttonBase =
  'inline-flex items-center gap-1 font-bold cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

const neutralButtonClass = (isLight: boolean) => `${fieldClass(isLight)} ${buttonBase}`;

const accentButtonClass = (isLight: boolean, tone: 'amber' | 'rose') => {
  const light = tone === 'amber'
    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-700 focus:ring-amber-700'
    : 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-700 focus:ring-rose-700';
  const dark = tone === 'amber'
    ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-500 focus:ring-amber-400'
    : 'bg-rose-950 hover:bg-rose-900 text-rose-200 border-rose-500 focus:ring-rose-400';
  return `px-1.5 py-1 rounded text-[10px] border outline-none focus:ring-2 ${buttonBase} ${isLight ? light : dark}`;
};

const primaryButtonClass = (isLight: boolean) =>
  `px-2.5 py-1 rounded text-[11px] text-white bg-sky-700 hover:bg-sky-800 border border-transparent outline-none focus:ring-2 ${
    isLight ? 'focus:ring-sky-700' : 'focus:ring-sky-400'
  } ${buttonBase}`;

const labelClass = (isLight: boolean) => `text-[11px] font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`;

// Native option lists are drawn by the browser, so they get an explicit surface of their own.
const optionClass = (isLight: boolean) => (isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100');

const FormationOptions: React.FC<{ groups: FormationGroup[]; isLight: boolean }> = ({ groups, isLight }) => (
  <>
    {groups.map(group => (
      <optgroup key={group.label} label={group.label}>
        {group.items.map(f => (
          <option key={f.id} value={f.id} className={optionClass(isLight)}>
            {f.name} {f.personnel ? `(${f.personnel})` : ''}
          </option>
        ))}
      </optgroup>
    ))}
  </>
);

// One flex row per group; a fieldset so View mode can disable everything inside with a single attribute.
const groupClass = 'flex items-center gap-1.5 min-w-0 border-0 p-0 m-0';

export const PlayBar: React.FC<PlayBarProps> = ({
  theme,
  isView,
  currentPlay,
  allPlays,
  formations,
  showGaps,
  currentQBAlignment,
  routeAdaptationMode,
  onSelectPlay,
  onUpdatePlayName,
  onUpdateCategory,
  onNewPlay,
  onDuplicatePlay,
  onResetCanvas,
  onSelectOffenseFormation,
  onSelectDefenseFront,
  onUpdateOffenseFormation,
  onUpdateDefenseFront,
  onMorphBackfield,
  onToggleRouteAdaptationMode,
  onToggleShowGaps,
  onShiftDefense,
  onRealignDefense,
  onOpenDefensePackages,
  onOpenRunTemplates,
  hasBlockPlan,
  canUpdateRunTemplate,
  onSaveRunTemplate,
  onUpdateRunTemplate,
  onClearBlocks
}) => {
  const isLight = theme === 'light';

  // Remembered per device; open by default. Hiding the matchup line gives the board about a line more height.
  const [matchupOpen, setMatchupOpen] = useState(() => {
    try {
      return localStorage.getItem(MATCHUP_OPEN_KEY) !== 'closed';
    } catch {
      return true;
    }
  });
  const toggleMatchup = () => {
    const next = !matchupOpen;
    setMatchupOpen(next);
    try {
      localStorage.setItem(MATCHUP_OPEN_KEY, next ? 'open' : 'closed');
    } catch {
      /* a private window may block storage; the toggle still works for this session */
    }
  };

  const offenseTemplates = formations.filter(f => f.side === 'offense' || f.side === 'both');
  const defenseTemplates = formations.filter(f => f.side === 'defense' || f.side === 'both');
  const offenseGroups = groupByStyle(offenseTemplates, OFFENSE_STYLES, 'Other Formations');
  const defenseGroups = groupByStyle(defenseTemplates, DEFENSE_STYLES, 'Other Fronts');

  const activeOffenseId = resolveFormation(formations, 'offense', currentPlay.formationOffenseId, currentPlay.formationOffense)?.id ?? '';
  const activeDefenseId = resolveFormation(formations, 'defense', currentPlay.frontDefenseId, currentPlay.frontDefense)?.id ?? '';

  // Plays grouped for quick scanning: those that use the active offensive formation come first
  const playsForFormation = activeOffenseId
    ? allPlays.filter(p => resolveFormation(formations, 'offense', p.formationOffenseId, p.formationOffense)?.id === activeOffenseId)
    : [];
  const others = allPlays.filter(p => !playsForFormation.some(pf => pf.id === p.id));
  const passing = others.filter(p => p.primaryPassConcept || p.category === 'pass_dropback');
  const runOption = others.filter(p => (p.category === 'run' || p.primaryRunConcept) && !p.primaryPassConcept);
  const rpoPa = others.filter(p => (p.category === 'rpo' || p.category === 'pass_action' || p.category === 'screen') && !p.primaryPassConcept);
  const remaining = others.filter(p =>
    !passing.some(pp => pp.id === p.id) && !runOption.some(rp => rp.id === p.id) && !rpoPa.some(pa => pa.id === p.id)
  );
  const playGroups: { label: string; plays: Play[] }[] = [
    { label: `Plays for this Formation (${playsForFormation.length})`, plays: playsForFormation },
    { label: `Passing Concepts (${passing.length})`, plays: passing },
    { label: `Run & Option Schemes (${runOption.length})`, plays: runOption },
    { label: `RPO & Play-Action (${rpoPa.length})`, plays: rpoPa },
    { label: `Other Playbook Plays (${remaining.length})`, plays: remaining }
  ].filter(group => group.plays.length > 0);

  const morphOptions: { value: SnapAlignment; icon: string; label: string; activeClass: string; title: string }[] = [
    { value: 'down_center', icon: '🏈', label: 'Center', activeClass: 'bg-amber-800 text-white', title: 'Under Center (QB direct snap at 1 yard, RB downhill at 6-7 yards)' },
    { value: 'pistol', icon: '🎯', label: 'Pistol', activeClass: 'bg-sky-700 text-white', title: 'Pistol (QB at 3.5 yards, RB stacked directly behind at 7 yards)' },
    { value: 'shotgun', icon: '⚡', label: 'Gun', activeClass: 'bg-emerald-700 text-white', title: 'Shotgun (QB at 5-6 yards, RB offset sidecar)' }
  ];

  const shiftOptions: { direction: ShiftDirection; label: string; title: string; before?: boolean }[] = [
    { direction: 'left', label: 'Left', title: 'Shift front 1 gap left', before: true },
    { direction: 'right', label: 'Right', title: 'Shift front 1 gap right' },
    { direction: 'over', label: 'Over', title: 'Set front to Over (Strongside 3-tech)' },
    { direction: 'under', label: 'Under', title: 'Set front to Under (Weakside 3-tech)' }
  ];

  const field = fieldClass(isLight);
  const routesLabel = routeAdaptationMode === 'concept_numbered' ? 'Routes: #1/#2/#3' : 'Routes: by player';

  return (
    <section
      aria-label="Play controls"
      className={`shrink-0 flex flex-col gap-1.5 px-2 py-2 border-b ${isLight ? 'bg-white border-slate-300' : 'bg-[#161b22] border-[#30363d]'}`}
    >
      {/* LINE 1: which play, and play-level actions */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <select
          aria-label="Active play"
          value={currentPlay.id}
          onChange={(e) => onSelectPlay(e.target.value)}
          className={`${field} w-50 truncate cursor-pointer`}
          title="Select play (grouped by formation and concept)"
        >
          {playGroups.map(group => (
            <optgroup key={group.label} label={group.label}>
              {group.plays.map(p => (
                <option key={p.id} value={p.id} className={optionClass(isLight)}>{p.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <fieldset disabled={isView} className={groupClass}>
          <input
            type="text"
            aria-label="Play name"
            value={currentPlay.name}
            onChange={(e) => onUpdatePlayName(e.target.value)}
            title="Rename play"
            className={`${field} w-38 font-semibold`}
          />
          <select
            aria-label="Play category"
            value={currentPlay.category}
            onChange={(e) => onUpdateCategory(e.target.value as PlayCategory)}
            className={`${field} cursor-pointer disabled:cursor-default`}
            title="Play category"
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value} className={optionClass(isLight)}>{option.label}</option>
            ))}
          </select>
          <button type="button" onClick={onNewPlay} className={primaryButtonClass(isLight)} title="Create blank play">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button type="button" onClick={onDuplicatePlay} className={neutralButtonClass(isLight)} title="Duplicate current play">
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>
          <button
            type="button"
            onClick={onResetCanvas}
            aria-label="Reset play to its original template"
            className={`${neutralButtonClass(isLight)} !px-1.5`}
            title="Restore this play to its original template (built-in plays only)"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </fieldset>

        {/* Run templates get their own wrapping group so the long labels never push the play controls off the bar */}
        <fieldset disabled={isView} className={`${groupClass} flex-wrap`}>
          <button
            type="button"
            onClick={onOpenRunTemplates}
            className={primaryButtonClass(isLight)}
            title="Choose a run template and give every blocker an assignment"
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Run</span>
          </button>
          {hasBlockPlan && (
            <>
              <button type="button" onClick={onSaveRunTemplate} className={neutralButtonClass(isLight)} title="Save these blocks, with your adjustments, as a new run template">
                <Save className="w-3 h-3" aria-hidden="true" />
                <span>Save as template</span>
              </button>
              {canUpdateRunTemplate && (
                <button type="button" onClick={onUpdateRunTemplate} className={neutralButtonClass(isLight)} title="Update the template this play came from with your adjustments">
                  <span>Update template</span>
                </button>
              )}
              <button type="button" onClick={onClearBlocks} className={accentButtonClass(isLight, 'rose')} title="Remove the template's blocks from this play">
                <span>Clear blocks</span>
              </button>
            </>
          )}
        </fieldset>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleShowGaps}
            aria-pressed={showGaps}
            className={`${showGaps ? accentButtonClass(isLight, 'amber') : neutralButtonClass(isLight)} !py-1 !px-2 !text-[11px]`}
            title="Toggle offensive gap markers (A, B, C, D) on the line of scrimmage"
          >
            <span>Gaps</span>
          </button>
          <button
            type="button"
            onClick={toggleMatchup}
            aria-expanded={matchupOpen}
            aria-controls="matchup-controls"
            className={neutralButtonClass(isLight)}
            title={matchupOpen ? 'Hide the formation and defense controls to give the board more height' : 'Show the formation and defense controls'}
          >
            <span>Matchup</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${matchupOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* LINE 2: the matchup on the board (collapsible: it is the tallest part of the bar) */}
      <div id="matchup-controls" hidden={!matchupOpen} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <fieldset disabled={isView} className={groupClass}>
          <span className="text-sm select-none" aria-hidden="true">🏈</span>
          <label htmlFor="offense-formation-select" className={labelClass(isLight)}>Offense</label>
          <select
            id="offense-formation-select"
            value={activeOffenseId}
            onChange={(e) => onSelectOffenseFormation(e.target.value)}
            className={`${field} w-44 truncate cursor-pointer disabled:cursor-default`}
            title="Select offensive formation template"
          >
            {!activeOffenseId && <option value="" disabled>Select formation...</option>}
            <FormationOptions groups={offenseGroups} isLight={isLight} />
          </select>
          {activeOffenseId && (
            <button
              type="button"
              onClick={onUpdateOffenseFormation}
              className={accentButtonClass(isLight, 'amber')}
              title={`Update "${currentPlay.formationOffense}" with the current offensive positions`}
            >
              <Save className="w-3 h-3" />
              <span>Update</span>
            </button>
          )}
        </fieldset>

        <fieldset disabled={isView} className={`${groupClass} rounded-lg p-0.5 border ${isLight ? 'bg-slate-100 border-slate-500' : 'bg-slate-800 border-slate-500'}`}>
          {morphOptions.map(option => {
            const active = currentQBAlignment === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onMorphBackfield(option.value)}
                aria-pressed={active}
                className={`px-2 py-0.5 rounded text-[10px] ${buttonBase} ${
                  active ? option.activeClass : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
                title={option.title}
              >
                <span aria-hidden="true">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </fieldset>

        <fieldset disabled={isView} className={groupClass}>
          <button
            type="button"
            onClick={onToggleRouteAdaptationMode}
            className={`${neutralButtonClass(isLight)} !text-[10px] !px-1.5`}
            title={`Route adaptation when changing offensive formation:\n• By player: moves each route with its player\n• #1/#2/#3: maps routes to receivers from the outside in\n\nClick to switch (now: ${routeAdaptationMode === 'concept_numbered' ? '#1/#2/#3' : 'by player'})`}
          >
            <span>{routesLabel}</span>
          </button>
        </fieldset>

        <fieldset disabled={isView} className={groupClass}>
          <Shield className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-rose-700' : 'text-rose-300'}`} aria-hidden="true" />
          <label htmlFor="defense-front-select" className={labelClass(isLight)}>Defense</label>
          <select
            id="defense-front-select"
            value={activeDefenseId}
            onChange={(e) => onSelectDefenseFront(e.target.value)}
            className={`${field} w-44 truncate cursor-pointer disabled:cursor-default`}
            title="Select defensive front (pre-aligns automatically to offensive gaps)"
          >
            {!activeDefenseId && <option value="" disabled>Select front...</option>}
            <FormationOptions groups={defenseGroups} isLight={isLight} />
          </select>
          {activeDefenseId && (
            <button
              type="button"
              onClick={onUpdateDefenseFront}
              className={accentButtonClass(isLight, 'rose')}
              title={`Update "${currentPlay.frontDefense}" with the current defensive positions and techniques`}
            >
              <Save className="w-3 h-3" />
              <span>Update</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenDefensePackages}
            className={`${neutralButtonClass(isLight)} !text-[10px] !px-1.5`}
            title="Defensive packages: pre-aligned schemes, shifts and technique assignments"
          >
            <Layers className="w-3 h-3" />
            <span>Packages</span>
          </button>
        </fieldset>

        <fieldset disabled={isView} className={groupClass}>
          {shiftOptions.map(option => (
            <button
              key={option.direction}
              type="button"
              onClick={() => onShiftDefense(option.direction)}
              className={`${neutralButtonClass(isLight)} !text-[10px] !px-1.5`}
              title={option.title}
            >
              {option.before && <ChevronLeft className="w-3 h-3" aria-hidden="true" />}
              <span>{option.label}</span>
              {option.direction === 'right' && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
            </button>
          ))}
          <button
            type="button"
            onClick={onRealignDefense}
            aria-label="Re-align all defenders"
            className={`${neutralButtonClass(isLight)} !px-1.5`}
            title="Re-align all defenders to the current offensive positions"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
          </button>
        </fieldset>
      </div>
    </section>
  );
};

export default PlayBar;
