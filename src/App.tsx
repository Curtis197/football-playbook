import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { 
  Play, 
  PlaybookFile, 
  Player, 
  PathAction, 
  CanvasMode, 
  PlayCategory,
  AppMode,
  Theme,
  Point,
  Formation,
  RunTemplate,
  RouteAdaptationMode
} from './types/playbook';
import { INITIAL_PLAYBOOK } from './data/presets';
import { 
  loadPlaybookFromStorage, 
  savePlaybookToStorage, 
  downloadJsonFile, 
  downloadSvgFile,
  parseAndValidateImport,
  takeStorageLoadNotice
} from './utils/storage';
import { playsEqual } from './utils/playValidation';
import { newerCopy, resolveFormation, upgradePlayers } from './utils/playMigrations';
import { ChalkboardCanvas } from './components/ChalkboardCanvas';
import { Toolbar, type CloudSyncStatus, type CloudSaveTarget } from './components/Toolbar';
import { ModeSwitcher } from './components/ModeSwitcher';
import { PlayBar } from './components/PlayBar';
import { InspectorPanel } from './components/InspectorPanel';
import { SituationMatrixModal } from './components/SituationMatrixModal';
import { PlayLibraryModal } from './components/PlayLibraryModal';
import { FormationSwitcherModal } from './components/FormationSwitcherModal';
import { DefenseFrontModal } from './components/DefenseFrontModal';
import { RunTemplateModal, type RequestedPlaySide } from './components/RunTemplateModal';
import { shiftDefensiveFront, realignAllDefenders, analyzeOffense } from './utils/defensiveAlignment';
import { applyFormationToPlay, buildFormationFromPlay, captureFormationPlayers, formationHasPlayers } from './utils/formationApply';
import { morphBackfieldAlignment, detectCurrentQBPosition, type SnapAlignment } from './utils/formationBackfield';
import { savePlay, fetchAllPlays } from './services/playbookDb';
import { isFirebaseConfigured } from './services/firebase';
import { useFormationLibrary } from './hooks/useFormationLibrary';
import { useRunTemplateLibrary } from './hooks/useRunTemplateLibrary';
import { applyRunTemplate, captureRunTemplate, clearBlocks, editAssignment, reaimBlocks, resolvePlaySide, type AssignmentChange } from './utils/blockPlanApply';

// Undo/redo keeps whole-playbook snapshots. Edits that arrive within COALESCE_MS of each other
// (a drag, typing in a field) share one undo step.
interface PlaybookHistory {
  present: PlaybookFile;
  past: PlaybookFile[];
  future: PlaybookFile[];
  lastEditAt: number;
}
const HISTORY_LIMIT = 100;
const COALESCE_MS = 600;

// Stamps every play that was added or changed by an edit, so each play knows when it was last edited here.
function stampEditedPlays(before: PlaybookFile, after: PlaybookFile): PlaybookFile {
  const previous = new Map(before.plays.map(p => [p.id, p]));
  const editedAt = new Date().toISOString();
  let changed = false;
  const plays = after.plays.map(p => {
    if (previous.get(p.id) === p) return p;
    changed = true;
    return { ...p, updatedAt: editedAt };
  });
  return changed ? { ...after, plays } : after;
}

// Local edits always win; the cloud only contributes plays this device does not have.
function mergeCloudPlays(local: PlaybookFile, remote: Play[]): PlaybookFile {
  const merged = new Map<string, Play>();
  INITIAL_PLAYBOOK.plays.forEach(p => merged.set(p.id, p));
  local.plays.forEach(p => merged.set(p.id, p));
  const localIds = new Set(local.plays.map(p => p.id));
  remote.forEach(p => {
    if (!localIds.has(p.id)) merged.set(p.id, p);
  });
  return { ...local, plays: Array.from(merged.values()) };
}

export const App: React.FC = () => {
  const [history, setHistory] = useState<PlaybookHistory>(() => ({
    present: loadPlaybookFromStorage(),
    past: [],
    future: [],
    lastEditAt: 0
  }));
  const playbook = history.present;
  const latestPlaybook = useRef(playbook);
  useEffect(() => {
    latestPlaybook.current = playbook;
  }, [playbook]);

  const setPlaybook = useCallback((update: PlaybookFile | ((prev: PlaybookFile) => PlaybookFile)) => {
    setHistory(h => {
      const updated = typeof update === 'function' ? update(h.present) : update;
      if (updated === h.present) return h;
      const next = stampEditedPlays(h.present, updated);
      const now = Date.now();
      const joinsLastStep = now - h.lastEditAt < COALESCE_MS;
      return {
        present: next,
        past: joinsLastStep ? h.past : [...h.past, h.present].slice(-HISTORY_LIMIT),
        future: [],
        lastEditAt: now
      };
    });
  }, []);
  const [activePlayId, setActivePlayId] = useState<string>(() => playbook.plays[0]?.id || INITIAL_PLAYBOOK.plays[0].id);
  const [appMode, setAppMode] = useState<AppMode>('build');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('football_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [mode, setMode] = useState<CanvasMode>('select');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isFormationsModalOpen, setIsFormationsModalOpen] = useState(false);
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [showGaps, setShowGaps] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [restartBlockRequest, setRestartBlockRequest] = useState<{ actionId: string; playerId: string; startPoint: Point } | null>(null);
  const {
    formations,
    refresh: refreshFormations,
    upsert: upsertFormation,
    remove: removeFormation,
    seedDefaults: seedFormationDefaults
  } = useFormationLibrary();
  const {
    templates: runTemplates,
    refresh: refreshRunTemplates,
    upsert: upsertRunTemplate,
    remove: removeRunTemplate
  } = useRunTemplateLibrary();
  const [routeAdaptationMode, setRouteAdaptationMode] = useState<RouteAdaptationMode>('player_relative');

  // Background cloud sync changes the playbook without creating an undo step
  const mergeRemotePlays = useCallback((remote: Play[]) => {
    setHistory(h => ({ ...h, present: mergeCloudPlays(h.present, remote) }));
  }, []);

  // Flash notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', durationMs = 3500) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, durationMs);
  }, []);

  // Refresh all plays from Cloud Firestore (or fallback to presets & localStorage)
  const refreshCloudPlays = useCallback(async () => {
    if (!isFirebaseConfigured) return;
    try {
      const remotePlays = await fetchAllPlays();
      if (remotePlays.length > 0) {
        mergeRemotePlays(remotePlays);
      }
    } catch (e) {
      console.warn('Could not refresh cloud plays:', e);
    }
  }, [mergeRemotePlays]);

  // Load all formations and plays from Firestore on startup so all cloud items are immediately visible
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      if (!isFirebaseConfigured) return;
      try {
        const remotePlays = await fetchAllPlays();
        if (remotePlays.length > 0 && isMounted) {
          const differing = remotePlays.flatMap(remote => {
            const local = latestPlaybook.current.plays.find(p => p.id === remote.id);
            return local && !playsEqual(local, remote) ? [{ local, remote }] : [];
          });
          mergeRemotePlays(remotePlays);
          if (differing.length > 0) {
            const cloudNewer = differing.filter(d => newerCopy(d.local, d.remote) === 'remote').length;
            const newerNote = cloudNewer > 0 ? ` (${cloudNewer} newer in the cloud)` : '';
            showNotification(
              `${differing.length} play${differing.length === 1 ? ' differs' : 's differ'} from the cloud copy${newerNote}. Your local version was kept; open My Playbook to load the cloud one.`,
              'info',
              7000
            );
          }
        }
      } catch (e) {
        console.warn('Could not load remote cloud data, using offline presets:', e);
      }
    }
    void loadCloudData();
    return () => {
      isMounted = false;
    };
  }, [mergeRemotePlays, showNotification]);

  // Formations come from the same place on startup as everywhere else
  useEffect(() => {
    void refreshFormations();
    void refreshRunTemplates();
  }, [refreshFormations, refreshRunTemplates]);

  // Tell the user when stored data had to be repaired or set aside on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      const notice = takeStorageLoadNotice();
      if (notice) showNotification(notice, 'error', 9000);
    }, 0);
    return () => clearTimeout(timer);
  }, [showNotification]);

  // Sync theme to document element and LocalStorage
  useEffect(() => {
    localStorage.setItem('football_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showNotification(`Switched to ${nextTheme === 'light' ? 'Light Mode (Whiteboard)' : 'Dark Mode (Chalkboard)'}`, 'info');
  };

  const handleSetAppMode = (nextMode: AppMode) => {
    setAppMode(nextMode);
    if (nextMode === 'view') {
      showNotification('View Mode: Hover over players to inspect coaching explanations', 'info');
    } else {
      showNotification('Build Mode: Canvas uncluttered, side annotation form active', 'info');
    }
  };

  // Sync state to LocalStorage
  useEffect(() => {
    savePlaybookToStorage(playbook);
  }, [playbook]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    setHistory(h => {
      if (h.past.length === 0) return h;
      return {
        present: h.past[h.past.length - 1],
        past: h.past.slice(0, -1),
        future: [h.present, ...h.future],
        lastEditAt: 0
      };
    });
    showNotification('Undid last change', 'info');
  }, [canUndo, showNotification]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    setHistory(h => {
      if (h.future.length === 0) return h;
      return {
        present: h.future[0],
        past: [...h.past, h.present].slice(-HISTORY_LIMIT),
        future: h.future.slice(1),
        lastEditAt: 0
      };
    });
    showNotification('Redid change', 'info');
  }, [canRedo, showNotification]);

  const isAnyModalOpen = isMatrixModalOpen || isLibraryModalOpen || isFormationsModalOpen || isDefenseModalOpen || isRunModalOpen;

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo. Text fields keep their own native undo.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // View mode is read-only, so the history shortcuts are off there too
      if (!(e.ctrlKey || e.metaKey) || e.altKey || isAnyModalOpen || appMode !== 'build') return;
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, isAnyModalOpen, appMode]);

  // Current active play
  const currentPlay = playbook.plays.find(p => p.id === activePlayId) || playbook.plays[0] || INITIAL_PLAYBOOK.plays[0];

  // Selected entities
  const selectedPlayer = currentPlay.players.find(p => p.id === selectedPlayerId) || null;
  const selectedAction = currentPlay.actions.find(a => a.id === selectedActionId) || null;

  // Update current play helper
  const updateCurrentPlay = useCallback((updater: (prev: Play) => Play) => {
    setPlaybook(prev => ({
      ...prev,
      plays: prev.plays.map(p => (p.id === currentPlay.id ? updater(p) : p))
    }));
  }, [currentPlay.id, setPlaybook]);

  // Play selection
  const handleSelectPlay = (playId: string) => {
    setActivePlayId(playId);
    setSelectedPlayerId(null);
    setSelectedActionId(null);
  };

  // Play name update
  const handleUpdatePlayName = (name: string) => {
    updateCurrentPlay(p => ({ ...p, name }));
  };

  // Category update
  const handleUpdateCategory = (category: PlayCategory) => {
    updateCurrentPlay(p => ({ ...p, category }));
  };

  // Player position update (dragging)
  const handleUpdatePlayerPosition = (playerId: string, x: number, y: number) => {
    updateCurrentPlay(p => ({
      ...p,
      players: p.players.map(player => (player.id === playerId ? { ...player, x, y } : player))
    }));
  };

  // Add vector action
  const handleAddAction = (action: PathAction) => {
    updateCurrentPlay(p => ({
      ...p,
      actions: [...p.actions, action]
    }));
    setSelectedActionId(action.id);
    setSelectedPlayerId(null);
    showNotification(`Added ${action.type.replace('_', ' ')} vector`, 'success');
  };

  // Update action points (waypoint dragging)
  const handleUpdateActionPoints = (actionId: string, points: PathAction['points']) => {
    updateCurrentPlay(p => ({
      ...p,
      actions: p.actions.map(act => (act.id === actionId ? { ...act, points } : act))
    }));
  };

  // Restart continuation/combo block from existing block terminal point
  const handleStartRestartBlock = (fromAction: PathAction) => {
    if (!fromAction.points || fromAction.points.length === 0) return;
    const terminalPoint = fromAction.points[fromAction.points.length - 1];
    setMode('draw_block');
    setSelectedPlayerId(fromAction.playerId);
    setSelectedActionId(fromAction.id);
    setRestartBlockRequest({
      actionId: fromAction.id,
      playerId: fromAction.playerId,
      startPoint: { x: terminalPoint.x, y: terminalPoint.y, isSharp: false }
    });
    showNotification(`Drawing combo block starting from ${fromAction.label || 'block'} endpoint... Click canvas to plot next waypoint!`, 'info');
  };

  // Add player at coordinate
  const handleAddPlayerAtPoint = (x: number, y: number, side: 'offense' | 'defense') => {
    const existingCount = currentPlay.players.filter(p => p.side === side).length;
    const label = side === 'offense' ? `O${existingCount + 1}` : `D${existingCount + 1}`;
    const newPlayer: Player = {
      id: `${side}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      label,
      side,
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x,
      y,
      assignmentTitle: side === 'offense' ? 'Route / Assignment' : 'Coverage / Gap',
      assignmentNotes: side === 'offense' ? 'Execute schematic assignment.' : 'Align and defend designated gap.',
      coachingKeys: []
    };

    updateCurrentPlay(p => ({
      ...p,
      players: [...p.players, newPlayer]
    }));
    setSelectedPlayerId(newPlayer.id);
    setSelectedActionId(null);
    setMode('select');
    showNotification(`Placed ${side} player (${label})`, 'success');
  };

  // Delete selected entity
  const handleDeleteSelected = () => {
    if (selectedPlayerId) {
      updateCurrentPlay(p => ({
        ...p,
        players: p.players.filter(pl => pl.id !== selectedPlayerId),
        actions: p.actions.filter(act => act.playerId !== selectedPlayerId)
      }));
      setSelectedPlayerId(null);
      showNotification('Player and connected vectors removed', 'info');
    } else if (selectedActionId) {
      updateCurrentPlay(p => ({
        ...p,
        actions: p.actions.filter(act => act.id !== selectedActionId)
      }));
      setSelectedActionId(null);
      showNotification('Vector path removed', 'info');
    }
  };

  // Restore the active play to its own original template (only built-in plays have one)
  const handleResetCanvas = () => {
    const original = INITIAL_PLAYBOOK.plays.find(p => p.id === currentPlay.id);
    if (!original) {
      showNotification('This play has no original template to reset to. Use Undo (Ctrl+Z) to step back instead.', 'info');
      return;
    }
    if (!window.confirm(`Restore "${original.name}" to its original template? Your edits to this play are replaced (Ctrl+Z undoes this).`)) {
      return;
    }
    updateCurrentPlay(() => original);
    setSelectedPlayerId(null);
    setSelectedActionId(null);
    showNotification(`Restored "${original.name}" to its original template`, 'info');
  };

  // Create new play
  const handleNewPlay = () => {
    const newPlayId = `play_${Date.now()}`;
    const offenseTemplate = resolveFormation(formations, 'offense', 'formation-spread-2x2', undefined);
    const frontTemplate = resolveFormation(formations, 'defense', undefined, '4-2-5 Nickel Over');
    const blankPlay: Play = {
      id: newPlayId,
      name: `New Play ${playbook.plays.length + 1}`,
      formationOffense: offenseTemplate?.name ?? 'Spread 2x2 Open',
      formationOffenseId: offenseTemplate?.id,
      frontDefense: frontTemplate?.name ?? '4-2-5 Nickel Over',
      frontDefenseId: frontTemplate?.id,
      category: 'pass_action',
      primaryRunConcept: 'Inside Zone',
      counterAction: 'Pop/Glance',
      tags: ['new-play'],
      situation: ['1st & 10'],
      players: upgradePlayers([
        { id: 'LT', label: 'LT', side: 'offense', x: 360, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Vertical set.' },
        { id: 'LG', label: 'LG', side: 'offense', x: 420, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor A-gap.' },
        { id: 'C',  label: 'C',  side: 'offense', x: 480, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Declare Mike.' },
        { id: 'RG', label: 'RG', side: 'offense', x: 540, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor B-gap.' },
        { id: 'RT', label: 'RT', side: 'offense', x: 600, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Vertical set.' },
        { id: 'QB', label: 'QB', side: 'offense', x: 480, y: 460, assignmentTitle: '3-Step Drop', assignmentNotes: 'Read boundary safety.' }
      ]),
      actions: [],
      notes: {
        qbRead: 'Pre-snap boundary single-high confirmation; rhythm throw on 3-step hitch.',
        lineBlocking: '5-man slide protection with center declaring Mike.',
        philosophyReason: 'Quick rhythm delivery neutralizing edge blitz pressure.'
      }
    };

    setPlaybook(prev => ({
      ...prev,
      plays: [...prev.plays, blankPlay]
    }));
    setActivePlayId(newPlayId);
    showNotification('Created new play', 'success');
  };

  // Duplicate play
  const handleDuplicatePlay = () => {
    const duplicated: Play = {
      ...currentPlay,
      id: `play_${Date.now()}`,
      name: `${currentPlay.name} (Copy)`
    };

    setPlaybook(prev => ({
      ...prev,
      plays: [...prev.plays, duplicated]
    }));
    setActivePlayId(duplicated.id);
    showNotification('Play duplicated', 'success');
  };

  // Export SVG
  const handleExportSvg = () => {
    const svgElem = document.querySelector('svg.chalkboard-bg') as SVGSVGElement | null;
    if (svgElem) {
      downloadSvgFile(svgElem, `${currentPlay.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
      showNotification('Downloaded SVG chalkboard graphic', 'success');
    }
  };

  // Export Play JSON
  const handleExportPlayJson = () => {
    downloadJsonFile(currentPlay, `${currentPlay.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    showNotification('Exported active play JSON', 'success');
  };

  // Export Playbook JSON
  const handleExportPlaybookJson = () => {
    downloadJsonFile(playbook, 'playbook_master_collection.json');
    showNotification('Exported full playbook JSON', 'success');
  };

  // Import JSON
  const handleImportJson = (jsonString: string) => {
    const result = parseAndValidateImport(jsonString);
    if (result.error) {
      showNotification(`Import failed: ${result.error}`, 'error');
      return;
    }

    if (result.warnings && result.warnings.length > 0) {
      console.info('Import adjustments:', result.warnings);
    }
    const adjustments = result.warnings && result.warnings.length > 0 ? ` (${result.warnings.length} adjusted, see console)` : '';

    if (result.playbook) {
      const incoming = result.playbook;
      if (!window.confirm(`Replace your whole playbook (${playbook.plays.length} plays) with the imported one (${incoming.plays.length} plays)? Ctrl+Z undoes this.`)) {
        return;
      }
      setPlaybook(incoming);
      if (incoming.plays.length > 0) {
        setActivePlayId(incoming.plays[0].id);
      }
      showNotification(`Imported playbook with ${incoming.plays.length} plays!${adjustments}`, 'success');
    } else if (result.play) {
      const importedPlay = result.play;
      const existing = playbook.plays.find(p => p.id === importedPlay.id);
      if (existing && !window.confirm(`A play named "${existing.name}" already exists with this id. Replace it with the imported "${importedPlay.name}"? Ctrl+Z undoes this.`)) {
        return;
      }
      setPlaybook(prev => {
        const exists = prev.plays.some(p => p.id === importedPlay.id);
        const updatedPlays = exists
          ? prev.plays.map(p => (p.id === importedPlay.id ? importedPlay : p))
          : [...prev.plays, importedPlay];
        return { ...prev, plays: updatedPlays };
      });
      setActivePlayId(importedPlay.id);
      showNotification(`Imported play: "${importedPlay.name}"${adjustments}`, 'success');
    }
  };

  // Save to Cloud Firestore: the active play, the whole playbook, or this play's offense / front as a template
  const handleSaveToCloud = async (target: CloudSaveTarget = 'play') => {
    setCloudSyncStatus('saving');
    const savesPlays = target === 'play' || target === 'playbook';
    let status: CloudSyncStatus = 'saved';
    try {
      if (savesPlays && !isFirebaseConfigured) throw new Error('Firebase keys are not set in .env');

      if (target === 'play') {
        await savePlay(currentPlay);
        showNotification(`Saved "${currentPlay.name}" to the cloud`, 'success');
      } else if (target === 'playbook') {
        for (const p of playbook.plays) {
          await savePlay(p);
        }
        showNotification(`Saved all ${playbook.plays.length} plays to the cloud`, 'success');
      } else {
        const players = captureFormationPlayers(currentPlay.players, target);
        if (players.length === 0) throw new Error(`No ${target} players on the chalkboard to save as a formation.`);
        const existing = target === 'offense'
          ? resolveFormation(formations, 'offense', currentPlay.formationOffenseId, currentPlay.formationOffense)
          : resolveFormation(formations, 'defense', currentPlay.frontDefenseId, currentPlay.frontDefense);
        const formation = buildFormationFromPlay(currentPlay, target, existing);
        const outcome = await upsertFormation(formation);
        // Link the play to the template it just saved, so the picker and "Update" find it by id
        updateCurrentPlay(p => (target === 'offense'
          ? { ...p, formationOffense: formation.name, formationOffenseId: formation.id }
          : { ...p, frontDefense: formation.name, frontDefenseId: formation.id }));
        if (outcome.storedIn === 'cloud') {
          showNotification(`Saved ${target === 'offense' ? 'formation' : 'front'} "${formation.name}" to the cloud`, 'success');
        } else {
          status = 'error';
          showNotification(`"${formation.name}" is saved on this device only (cloud: ${outcome.reason})`, 'error');
        }
      }
    } catch (err: unknown) {
      status = 'error';
      const msg = err instanceof Error ? err.message : 'Write failed';
      console.warn('[handleSaveToCloud] Cloud error:', msg);
      showNotification(`Cloud save failed: ${msg}.${savesPlays ? ' Your plays are still saved on this device.' : ''}`, 'error');
    }
    setCloudSyncStatus(status);
    if (status === 'saved' && savesPlays) void refreshCloudPlays();
    setTimeout(() => {
      setCloudSyncStatus('idle');
    }, status === 'saved' ? 3000 : 4000);
  };

  // Detect current QB snap alignment from active offensive players
  const currentQBAlignment = useMemo(() => {
    return detectCurrentQBPosition(currentPlay.players);
  }, [currentPlay.players]);

  // Run templates: blocks follow the formation, front and play side, inside the same undo step as the change
  const reaim = (p: Play): Play => reaimBlocks(p, runTemplates);

  const handleApplyRunTemplate = (template: RunTemplate, requested: RequestedPlaySide) => {
    const side = resolvePlaySide(requested, currentPlay.players);
    if (!side) {
      showNotification('This formation has no clear strong side. Pick left or right.', 'error');
      return;
    }
    const replaced = currentPlay.actions.filter(a => a.type === 'run_block' || a.type === 'pull_block').length;
    updateCurrentPlay(p => applyRunTemplate(p, template, side));
    setSelectedPlayerId(null);
    setSelectedActionId(null);
    setIsRunModalOpen(false);
    const replacedNote = replaced > 0 ? ` Replaced ${replaced} existing blocking line${replaced === 1 ? '' : 's'}.` : '';
    showNotification(`Applied "${template.name}" to the ${side}.${replacedNote}`, 'success');
  };

  const handleClearBlocks = () => {
    updateCurrentPlay(p => clearBlocks(p));
    setSelectedActionId(null);
    showNotification('Cleared the template blocks', 'info');
  };

  const handleEditAssignment = (assignmentId: string, change: AssignmentChange) => {
    updateCurrentPlay(p => editAssignment(p, assignmentId, change));
  };

  const reportRunTemplateOutcome = (name: string, outcome: Awaited<ReturnType<typeof upsertRunTemplate>>) => {
    if (outcome.storedIn === 'cloud') showNotification(`Saved "${name}"`, 'success');
    else showNotification(`Saved "${name}" on this device only (cloud: ${outcome.reason})`, 'info');
  };

  const handleSaveRunTemplate = async () => {
    const plan = currentPlay.blockPlan;
    const base = plan && runTemplates.find(t => t.id === plan.templateId);
    if (!plan || !base) {
      showNotification('Apply a run template first, then save it.', 'error');
      return;
    }
    const name = window.prompt('Name for the new run template', `${base.name} (mine)`)?.trim();
    if (!name) return;
    const saved = captureRunTemplate(currentPlay, base, name);
    reportRunTemplateOutcome(name, await upsertRunTemplate(saved));
    updateCurrentPlay(p => (p.blockPlan ? { ...p, blockPlan: { ...p.blockPlan, templateId: saved.id } } : p));
  };

  const handleUpdateRunTemplate = async () => {
    const plan = currentPlay.blockPlan;
    const base = plan && runTemplates.find(t => t.id === plan.templateId);
    if (!plan || !base || base.builtIn) return;
    const saved = captureRunTemplate(currentPlay, base, base.name, base.id);
    reportRunTemplateOutcome(base.name, await upsertRunTemplate(saved));
  };

  // Morph backfield alignment between Down Center, Pistol, and Shotgun
  const handleMorphBackfield = (targetAlignment: SnapAlignment) => {
    const result = morphBackfieldAlignment(currentPlay.players, currentPlay.actions, targetAlignment);
    if (result.previousAlignment === result.newAlignment) return;

    updateCurrentPlay(p => reaim({
      ...p,
      players: result.players,
      actions: result.actions
    }));

    const labelMap: Record<SnapAlignment, string> = {
      down_center: 'Under Center (Down Center)',
      shotgun: 'Shotgun',
      pistol: 'Pistol'
    };
    showNotification(`Morphed backfield to ${labelMap[targetAlignment]}`, 'success');
  };

  // Apply pre-aligned defenders from Defense Fronts
  const handleApplyDefenders = (updatedDefenders: Player[], frontName?: string) => {
    updateCurrentPlay(p => {
      const nonDefenders = p.players.filter(pl => pl.side !== 'defense');
      return reaim({
        ...p,
        frontDefense: frontName || p.frontDefense,
        // A defense package is not a saved template, so a package name must not keep a stale template link
        frontDefenseId: frontName ? undefined : p.frontDefenseId,
        players: [...nonDefenders, ...updatedDefenders]
      });
    });
  };

  // Shift defensive front (Left, Right, Over, Under, Pinch, Fan)
  const handleShiftDefense = (direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan') => {
    const structure = analyzeOffense(currentPlay.players);
    const updated = shiftDefensiveFront(currentPlay.players, structure, direction);
    updateCurrentPlay(p => reaim({
      ...p,
      players: updated
    }));
    const labelMap: Record<string, string> = {
      left: 'Shifted Front Left',
      right: 'Shifted Front Right',
      over: 'Set Front Over (Strongside)',
      under: 'Set Front Under (Weakside)',
      pinch: 'Pinched Front (Crashed Inside)',
      fan: 'Fanned Front (Stemmed Outside)'
    };
    showNotification(labelMap[direction] || 'Shifted Defense', 'info');
  };

  // Re-align all defenders to current offensive positions
  const handleRealignDefense = () => {
    const structure = analyzeOffense(currentPlay.players);
    const updated = realignAllDefenders(currentPlay.players, structure);
    updateCurrentPlay(p => reaim({
      ...p,
      players: updated
    }));
    showNotification('Re-aligned all defenders to offensive positions', 'success');
  };

  // The one way a template reaches a play: the on-canvas pickers and the Formations drawer both call this
  const applyFormation = (
    formation: Formation,
    keepRoutes = true,
    routeMode: RouteAdaptationMode = routeAdaptationMode
  ) => {
    if (!formationHasPlayers(formation)) {
      showNotification(`"${formation.name}" has no players to apply.`, 'error');
      return;
    }
    updateCurrentPlay(p => reaim(applyFormationToPlay(p, formation, { routeMode, keepRoutes })));
    setSelectedPlayerId(null);
    setSelectedActionId(null);
    const routesNote = formation.side === 'defense'
      ? ''
      : keepRoutes
        ? ` Routes: ${routeMode === 'player_relative' ? 'player-relative' : '#1/#2/#3 concept'}.`
        : ' Routes cleared.';
    showNotification(`Applied "${formation.name}".${routesNote}`, 'success');
  };

  const handleSelectOffenseFormation = (formationId: string) => {
    const formation = resolveFormation(formations, 'offense', formationId, undefined);
    if (formation) applyFormation(formation);
  };

  const handleSelectDefenseFront = (formationId: string) => {
    const formation = resolveFormation(formations, 'defense', formationId, undefined);
    if (formation) applyFormation(formation);
  };

  // Update an existing saved formation template with current chalkboard layout
  const handleUpdateFormation = async (formationId: string, side: 'offense' | 'defense' | 'both') => {
    const existing = formations.find(f => f.id === formationId);
    if (!existing) return;

    const players = captureFormationPlayers(currentPlay.players, side);
    if (players.length === 0) {
      showNotification(`No ${side} players on the chalkboard to update "${existing.name}".`, 'error');
      return;
    }

    const outcome = await upsertFormation({
      ...existing,
      players,
      qbPosition: side === 'defense' ? existing.qbPosition : detectCurrentQBPosition(players)
    });
    if (outcome.storedIn === 'cloud') {
      showNotification(`Updated "${existing.name}" with the current chalkboard positions`, 'success');
    } else {
      showNotification(`Updated "${existing.name}" on this device only (cloud: ${outcome.reason})`, 'error');
    }
  };

  const handleToggleShowGaps = () => {
    setShowGaps(prev => !prev);
    showNotification(`Offensive Gaps Overlay ${!showGaps ? 'Enabled' : 'Disabled'}`, 'info');
  };

  // Play Library actions
  // Returns false when the user declines to replace a differing local copy
  const handleSelectPlayFromLibrary = (play: Play): boolean => {
    const local = playbook.plays.find(p => p.id === play.id);
    if (local && !playsEqual(local, play)) {
      const newer = newerCopy(local, play);
      const recency = newer === 'local' ? 'Your local copy is newer.' : newer === 'remote' ? 'The copy you are loading is newer.' : 'Neither copy has a newer edit time.';
      if (!window.confirm(`"${local.name}" on this device differs from the copy you are loading. ${recency} Replace your local version? Ctrl+Z undoes this.`)) {
        return false;
      }
    }
    setPlaybook(prev => {
      const exists = prev.plays.some(p => p.id === play.id);
      const updated = exists ? prev.plays.map(p => (p.id === play.id ? play : p)) : [play, ...prev.plays];
      return { ...prev, plays: updated };
    });
    setActivePlayId(play.id);
    setSelectedPlayerId(null);
    setSelectedActionId(null);
    return true;
  };

  const handleDuplicatePlayFromLibrary = (play: Play) => {
    setPlaybook(prev => ({
      ...prev,
      plays: [play, ...prev.plays]
    }));
  };

  const handleDeletePlayFromLibrary = (playId: string) => {
    setPlaybook(prev => {
      const remaining = prev.plays.filter(p => p.id !== playId);
      return {
        ...prev,
        plays: remaining.length > 0 ? remaining : [INITIAL_PLAYBOOK.plays[0]]
      };
    });
    if (activePlayId === playId) {
      const fallback = playbook.plays.find(p => p.id !== playId) || INITIAL_PLAYBOOK.plays[0];
      setActivePlayId(fallback.id);
      setSelectedPlayerId(null);
      setSelectedActionId(null);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1117] text-slate-100'} transition-colors`}>
      {/* TOP TOOLBAR: app-level actions only; play-level controls live in the PlayBar above the board */}
      <Toolbar
        currentPlay={currentPlay}
        allPlays={playbook.plays}
        appMode={appMode}
        onSetAppMode={handleSetAppMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onExportSvg={handleExportSvg}
        onExportPlayJson={handleExportPlayJson}
        onExportPlaybookJson={handleExportPlaybookJson}
        onImportJson={handleImportJson}
        onOpenSituationMatrix={() => setIsMatrixModalOpen(true)}
        onOpenPlayLibrary={() => setIsLibraryModalOpen(true)}
        onOpenFormations={() => setIsFormationsModalOpen(true)}
        onSaveToCloud={() => handleSaveToCloud('play')}
        onSaveToCloudOption={handleSaveToCloud}
        cloudSyncStatus={cloudSyncStatus}
      />

      {/* MAIN WORKSPACE: Mode Switcher + SVG Chalkboard + Inspector */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT MODE SWITCHER */}
        <ModeSwitcher
          currentMode={mode}
          onSetMode={setMode}
          appMode={appMode}
          onSetAppMode={handleSetAppMode}
          theme={theme}
          selectedPlayerId={selectedPlayerId}
          selectedActionId={selectedActionId}
          onDeleteSelected={handleDeleteSelected}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* CENTER STAGE: play controls above the chalkboard; the board gets the remaining room */}
        <main className={`flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden ${theme === 'light' ? 'bg-slate-200/90' : 'bg-[#10141a]'} transition-colors`}>
          <PlayBar
            theme={theme}
            isView={appMode === 'view'}
            currentPlay={currentPlay}
            allPlays={playbook.plays}
            formations={formations}
            showGaps={showGaps}
            currentQBAlignment={currentQBAlignment}
            routeAdaptationMode={routeAdaptationMode}
            onSelectPlay={handleSelectPlay}
            onUpdatePlayName={handleUpdatePlayName}
            onUpdateCategory={handleUpdateCategory}
            onNewPlay={handleNewPlay}
            onDuplicatePlay={handleDuplicatePlay}
            onResetCanvas={handleResetCanvas}
            onSelectOffenseFormation={handleSelectOffenseFormation}
            onSelectDefenseFront={handleSelectDefenseFront}
            onUpdateOffenseFormation={() => {
              const f = resolveFormation(formations, 'offense', currentPlay.formationOffenseId, currentPlay.formationOffense);
              if (f) handleUpdateFormation(f.id, 'offense');
            }}
            onUpdateDefenseFront={() => {
              const f = resolveFormation(formations, 'defense', currentPlay.frontDefenseId, currentPlay.frontDefense);
              if (f) handleUpdateFormation(f.id, 'defense');
            }}
            onMorphBackfield={handleMorphBackfield}
            onToggleRouteAdaptationMode={() => {
              const next: RouteAdaptationMode = routeAdaptationMode === 'player_relative' ? 'concept_numbered' : 'player_relative';
              setRouteAdaptationMode(next);
              showNotification(`Route Adaptation: ${next === 'player_relative' ? 'Relative to Player' : '#1/#2/#3 Concept Outside'}`, 'info');
            }}
            onToggleShowGaps={handleToggleShowGaps}
            onOpenRunTemplates={() => setIsRunModalOpen(true)}
            hasBlockPlan={Boolean(currentPlay.blockPlan)}
            canUpdateRunTemplate={Boolean(currentPlay.blockPlan && runTemplates.find(t => t.id === currentPlay.blockPlan!.templateId && !t.builtIn))}
            onSaveRunTemplate={() => { void handleSaveRunTemplate(); }}
            onUpdateRunTemplate={() => { void handleUpdateRunTemplate(); }}
            onClearBlocks={handleClearBlocks}
            onShiftDefense={handleShiftDefense}
            onRealignDefense={handleRealignDefense}
            onOpenDefensePackages={() => setIsDefenseModalOpen(true)}
          />
          <div className="flex-1 min-h-0">
            <ChalkboardCanvas
              players={currentPlay.players}
              actions={currentPlay.actions}
              mode={mode}
              appMode={appMode}
              theme={theme}
              showGaps={showGaps}
              selectedPlayerId={selectedPlayerId}
              selectedActionId={selectedActionId}
              onSelectPlayer={setSelectedPlayerId}
              onSelectAction={setSelectedActionId}
              onUpdatePlayerPosition={handleUpdatePlayerPosition}
              onAddAction={handleAddAction}
              onUpdateActionPoints={handleUpdateActionPoints}
              onAddPlayerAtPoint={handleAddPlayerAtPoint}
              onSetMode={setMode}
              restartBlockRequest={restartBlockRequest}
              onClearRestartBlockRequest={() => setRestartBlockRequest(null)}
            />
          </div>
        </main>

        {/* RIGHT INSPECTOR & PHILOSOPHY PANEL */}
        <InspectorPanel
          currentPlay={currentPlay}
          selectedPlayer={selectedPlayer}
          selectedAction={selectedAction}
          appMode={appMode}
          theme={theme}
          onSelectPlayer={setSelectedPlayerId}

          onStartRestartBlock={handleStartRestartBlock}
          onEditAssignment={handleEditAssignment}
          onUpdatePlayer={(updated) => {
            updateCurrentPlay(p => ({
              ...p,
              players: p.players.map(pl => (pl.id === updated.id ? updated : pl))
            }));
          }}
          onUpdateAction={(updated) => {
            updateCurrentPlay(p => ({
              ...p,
              actions: p.actions.map(act => (act.id === updated.id ? updated : act))
            }));
          }}
          onUpdatePlayNotes={(notes) => {
            updateCurrentPlay(p => ({ ...p, notes }));
          }}
          onUpdateStrategyMatrix={(matrix) => {
            updateCurrentPlay(p => ({ ...p, ...matrix }));
          }}
          formations={formations}
          onUpdatePlayFormations={(offense, defense) => {
            // Typed names link to a template only on an exact match; anything else is a plain label
            updateCurrentPlay(p => ({
              ...p,
              formationOffense: offense,
              formationOffenseId: resolveFormation(formations, 'offense', undefined, offense)?.id,
              frontDefense: defense,
              frontDefenseId: resolveFormation(formations, 'defense', undefined, defense)?.id
            }));
          }}
        />
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 transition-all transform animate-bounce ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white border border-emerald-400/40'
              : notification.type === 'error'
              ? 'bg-rose-700 text-white border border-rose-400/40'
              : 'bg-slate-800 text-sky-300 border border-slate-600'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* PHILOSOPHY & SITUATION MATRIX MODAL (Spec 3) */}
      <SituationMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        plays={playbook.plays}
        activePlayId={currentPlay.id}
        onSelectPlay={handleSelectPlay}
      />

      {/* PLAYBOOK LIBRARY DRAWER / MODAL */}
      <PlayLibraryModal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        currentPlayId={currentPlay.id}
        onSelectPlay={handleSelectPlayFromLibrary}
        onDuplicatePlay={handleDuplicatePlayFromLibrary}
        onDeletePlay={handleDeletePlayFromLibrary}
        localPlays={playbook.plays}
        onPlayListChanged={refreshCloudPlays}
        showNotification={showNotification}
      />

      {/* FORMATION TEMPLATES SWITCHER MODAL */}
      <FormationSwitcherModal
        isOpen={isFormationsModalOpen}
        onClose={() => setIsFormationsModalOpen(false)}
        currentPlayers={currentPlay.players}
        currentActions={currentPlay.actions}
        formations={formations}
        onApplyFormation={applyFormation}
        onSaveFormation={upsertFormation}
        onDeleteFormation={removeFormation}
        onRefreshFormations={refreshFormations}
        onSeedFormations={seedFormationDefaults}
        onUpdateFormation={handleUpdateFormation}
        routeAdaptationMode={routeAdaptationMode}
        onSetRouteAdaptationMode={setRouteAdaptationMode}
        showNotification={showNotification}
      />

      {/* RUN TEMPLATE PICKER */}
      <RunTemplateModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        templates={runTemplates}
        players={currentPlay.players}
        currentTemplateId={currentPlay.blockPlan?.templateId}
        onApply={handleApplyRunTemplate}
        onDeleteTemplate={(id) => { void removeRunTemplate(id); }}
        theme={theme}
      />

      {/* DEFENSIVE PRE-ALIGNMENT & FRONTS MODAL */}
      <DefenseFrontModal
        isOpen={isDefenseModalOpen}
        onClose={() => setIsDefenseModalOpen(false)}
        currentPlayers={currentPlay.players}
        theme={theme}
        onApplyDefenders={handleApplyDefenders}
        showNotification={showNotification}
      />
    </div>
  );
};

export default App;
