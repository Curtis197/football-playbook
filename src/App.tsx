import React, { useState, useEffect, useCallback } from 'react';
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
  Formation
} from './types/playbook';
import { DEFAULT_WISHBONE_PLAY, DEFAULT_FORMATIONS } from './data/presets';
import { 
  loadPlaybookFromStorage, 
  savePlaybookToStorage, 
  downloadJsonFile, 
  downloadSvgFile, 
  parseAndValidateImport 
} from './utils/storage';
import { ChalkboardCanvas } from './components/ChalkboardCanvas';
import { Toolbar, type CloudSyncStatus, type CloudSaveTarget } from './components/Toolbar';
import { ModeSwitcher } from './components/ModeSwitcher';
import { InspectorPanel } from './components/InspectorPanel';
import { SituationMatrixModal } from './components/SituationMatrixModal';
import { PlayLibraryModal } from './components/PlayLibraryModal';
import { FormationSwitcherModal } from './components/FormationSwitcherModal';
import { DefenseFrontModal } from './components/DefenseFrontModal';
import { shiftDefensiveFront, realignAllDefenders, analyzeOffense, calculateDefensiveAlignmentPosition, inferDefenderTechnique } from './utils/defensiveAlignment';
import { savePlay, fetchFormations, saveFormation } from './services/playbookDb';
import { isFirebaseConfigured } from './services/firebase';

export const App: React.FC = () => {
  const [playbook, setPlaybook] = useState<PlaybookFile>(() => loadPlaybookFromStorage());
  const [activePlayId, setActivePlayId] = useState<string>(() => playbook.plays[0]?.id || DEFAULT_WISHBONE_PLAY.id);
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
  const [showGaps, setShowGaps] = useState(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [restartBlockRequest, setRestartBlockRequest] = useState<{ actionId: string; playerId: string; startPoint: Point } | null>(null);
  const [formations, setFormations] = useState<Formation[]>(() => DEFAULT_FORMATIONS);

  // Load formations from Firestore (or fallback to DEFAULT_FORMATIONS)
  useEffect(() => {
    let isMounted = true;
    async function loadAllFormations() {
      try {
        if (isFirebaseConfigured) {
          const remote = await fetchFormations();
          if (remote.length > 0 && isMounted) {
            const map = new Map<string, Formation>();
            DEFAULT_FORMATIONS.forEach(f => map.set(f.id, f));
            remote.forEach(f => map.set(f.id, f));
            setFormations(Array.from(map.values()));
          }
        }
      } catch (e) {
        console.warn('Could not load remote formations, using offline presets:', e);
      }
    }
    loadAllFormations();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Flash notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Current active play
  const currentPlay = playbook.plays.find(p => p.id === activePlayId) || playbook.plays[0] || DEFAULT_WISHBONE_PLAY;

  // Selected entities
  const selectedPlayer = currentPlay.players.find(p => p.id === selectedPlayerId) || null;
  const selectedAction = currentPlay.actions.find(a => a.id === selectedActionId) || null;

  // Update current play helper
  const updateCurrentPlay = useCallback((updater: (prev: Play) => Play) => {
    setPlaybook(prev => ({
      ...prev,
      plays: prev.plays.map(p => (p.id === currentPlay.id ? updater(p) : p))
    }));
  }, [currentPlay.id]);

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

  // Reset Canvas to initial Wishbone template
  const handleResetCanvas = () => {
    if (window.confirm('Reset this play to default template positions?')) {
      updateCurrentPlay(() => ({
        ...DEFAULT_WISHBONE_PLAY,
        id: currentPlay.id,
        name: currentPlay.name
      }));
      setSelectedPlayerId(null);
      setSelectedActionId(null);
      showNotification('Canvas reset to default template', 'info');
    }
  };

  // Create new play
  const handleNewPlay = () => {
    const newPlayId = `play_${Date.now()}`;
    const blankPlay: Play = {
      id: newPlayId,
      name: `New Play ${playbook.plays.length + 1}`,
      formationOffense: 'Spread 2x2 Open',
      frontDefense: '4-2-5 Nickel',
      category: 'pass_action',
      primaryRunConcept: 'Inside Zone',
      counterAction: 'Pop/Glance',
      targetFront: '4-2-5 Nickel',
      tags: ['new-play'],
      situation: ['1st & 10'],
      players: [
        { id: 'LT', label: 'LT', side: 'offense', x: 360, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Vertical set.' },
        { id: 'LG', label: 'LG', side: 'offense', x: 420, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor A-gap.' },
        { id: 'C',  label: 'C',  side: 'offense', x: 480, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Declare Mike.' },
        { id: 'RG', label: 'RG', side: 'offense', x: 540, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor B-gap.' },
        { id: 'RT', label: 'RT', side: 'offense', x: 600, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Vertical set.' },
        { id: 'QB', label: 'QB', side: 'offense', x: 480, y: 460, assignmentTitle: '3-Step Drop', assignmentNotes: 'Read boundary safety.' }
      ],
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

    if (result.playbook) {
      setPlaybook(result.playbook);
      if (result.playbook.plays.length > 0) {
        setActivePlayId(result.playbook.plays[0].id);
      }
      showNotification(`Imported playbook with ${result.playbook.plays.length} plays!`, 'success');
    } else if (result.play) {
      const importedPlay = result.play;
      setPlaybook(prev => {
        const exists = prev.plays.some(p => p.id === importedPlay.id);
        const updatedPlays = exists
          ? prev.plays.map(p => (p.id === importedPlay.id ? importedPlay : p))
          : [...prev.plays, importedPlay];
        return { ...prev, plays: updatedPlays };
      });
      setActivePlayId(importedPlay.id);
      showNotification(`Imported play: "${importedPlay.name}"`, 'success');
    }
  };

  // Save active play to Cloud Firestore
  const handleSaveToCloud = async (target: CloudSaveTarget = 'play') => {
    setCloudSyncStatus('saving');
    try {
      if (target === 'play') {
        if (isFirebaseConfigured) {
          await savePlay(currentPlay);
        }
        } else if (target === 'offense') {
        const offPlayers = currentPlay.players.filter(p => p.side === 'offense');
        if (offPlayers.length === 0) {
          throw new Error('No offensive players found on canvas to save as formation.');
        }
        const existing = formations.find(
          f => (f.side === 'offense' || f.side === 'both') &&
               (f.name.toLowerCase() === currentPlay.formationOffense.toLowerCase() || f.id === currentPlay.formationOffense)
        );
        const formationId = existing ? existing.id : `formation-${currentPlay.formationOffense.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        const savedFormation: Formation = {
          id: formationId,
          name: currentPlay.formationOffense || 'Custom Offensive Formation',
          side: 'offense',
          personnel: existing?.personnel || '11 Personnel',
          description: existing?.description || `Offensive formation saved from play "${currentPlay.name}"`,
          style: existing?.style || (currentPlay.tags?.includes('spread') ? 'spread' : currentPlay.tags?.includes('old_school') ? 'old_school' : 'pro_style'),
          labels: existing?.labels || ['Offense', 'Custom'],
          players: offPlayers,
          updatedAt: new Date().toISOString()
        };
        if (isFirebaseConfigured) {
          await saveFormation(savedFormation);
        }
        setFormations(prev => {
          const found = prev.some(f => f.id === savedFormation.id);
          return found ? prev.map(f => (f.id === savedFormation.id ? savedFormation : f)) : [...prev, savedFormation];
        });
        showNotification(`Saved Offensive Formation "${savedFormation.name}" to Cloud!`, 'success');
      } else if (target === 'defense') {
        const defPlayers = currentPlay.players.filter(p => p.side === 'defense');
        if (defPlayers.length === 0) {
          throw new Error('No defensive players found on canvas to save as front.');
        }
        const structure = analyzeOffense(currentPlay.players);
        const enrichedDefenders = defPlayers.map(p => ({
          ...p,
          technique: p.technique || inferDefenderTechnique(p, structure)
        }));
        const existing = formations.find(
          f => (f.side === 'defense' || f.side === 'both') &&
               (f.name.toLowerCase() === currentPlay.frontDefense.toLowerCase() || f.id === currentPlay.frontDefense)
        );
        const frontId = existing ? existing.id : `front-${currentPlay.frontDefense.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
        const dlCount = enrichedDefenders.filter(d => ['NT', 'DT', 'DE', 'E'].includes(d.label)).length;
        const savedFront: Formation = {
          id: frontId,
          name: currentPlay.frontDefense || 'Custom Defensive Front',
          side: 'defense',
          personnel: existing?.personnel || 'Base Defense',
          description: existing?.description || `Defensive front saved from play "${currentPlay.name}"`,
          style: existing?.style || (dlCount >= 4 ? 'even_front' : 'odd_front'),
          labels: existing?.labels || ['Defense Front', 'Custom'],
          players: enrichedDefenders,
          updatedAt: new Date().toISOString()
        };
        if (isFirebaseConfigured) {
          await saveFormation(savedFront);
        }
        setFormations(prev => {
          const found = prev.some(f => f.id === savedFront.id);
          return found ? prev.map(f => (f.id === savedFront.id ? savedFront : f)) : [...prev, savedFront];
        });
        showNotification(`Saved Defensive Front "${savedFront.name}" to Cloud!`, 'success');
      } else if (target === 'playbook') {
        if (isFirebaseConfigured) {
          for (const p of playbook.plays) {
            await savePlay(p);
          }
        }
        showNotification(`Saved all ${playbook.plays.length} plays in Playbook to Cloud!`, 'success');
      }
      setCloudSyncStatus('saved');
      showNotification(`Saved "${currentPlay.name}" to Cloud Firestore!`, 'success');
      setTimeout(() => {
        setCloudSyncStatus('idle');
      }, 3000);
    } catch (err: unknown) {
      setCloudSyncStatus('error');
      const msg = err instanceof Error ? err.message : 'Write failed';
      console.warn('[handleSaveToCloud] Cloud error:', msg);
      showNotification(
        isFirebaseConfigured
          ? `Firestore save error: ${msg}. Play saved locally.`
          : 'Firebase keys not set in .env. Play saved locally in browser storage.',
        'error'
      );
      setTimeout(() => {
        setCloudSyncStatus('idle');
      }, 4000);
    }
  };

  // Apply Formation Template to current play
  const handleApplyFormation = (newPlayers: Player[], keepActions: boolean) => {
    updateCurrentPlay(p => {
      let nextActions = keepActions ? [...p.actions] : [];
      if (keepActions) {
        // Keep existing route assignments aligned to the players
        const playerMap = new Map(newPlayers.map(pl => [pl.id, pl]));
        nextActions = nextActions.map(action => {
          const player = playerMap.get(action.playerId);
          if (player && action.points.length > 0) {
            const updatedPoints = [
              { ...action.points[0], x: player.x, y: player.y },
              ...action.points.slice(1)
            ];
            return { ...action, points: updatedPoints };
          }
          return action;
        });
      }

      return {
        ...p,
        players: newPlayers,
        actions: nextActions
      };
    });
    setSelectedPlayerId(null);
    setSelectedActionId(null);
  };

  // Apply pre-aligned defenders from Defense Fronts
  const handleApplyDefenders = (updatedDefenders: Player[], frontName?: string) => {
    updateCurrentPlay(p => {
      const nonDefenders = p.players.filter(pl => pl.side !== 'defense');
      return {
        ...p,
        frontDefense: frontName || p.frontDefense,
        players: [...nonDefenders, ...updatedDefenders]
      };
    });
  };

  // Shift defensive front (Left, Right, Over, Under, Pinch, Fan)
  const handleShiftDefense = (direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan') => {
    const structure = analyzeOffense(currentPlay.players);
    const updated = shiftDefensiveFront(currentPlay.players, structure, direction);
    updateCurrentPlay(p => ({
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
    updateCurrentPlay(p => ({
      ...p,
      players: updated
    }));
    showNotification('Re-aligned all defenders to offensive positions', 'success');
  };

  // Select and apply an Offensive Formation from dropdown
  const handleSelectOffenseFormation = (formationId: string) => {
    const formation = formations.find(f => f.id === formationId || f.name === formationId);
    if (!formation) return;
    const offPlayers = formation.players.filter(p => p.side === 'offense' || formation.side === 'offense');
    if (offPlayers.length === 0) return;

    const newStructure = analyzeOffense(offPlayers);

    updateCurrentPlay(p => {
      // Re-anchor existing routes whose playerId matches
      const playerMap = new Map(offPlayers.map(pl => [pl.id, pl]));
      const nextActions = p.actions.map(action => {
        const player = playerMap.get(action.playerId);
        if (player && action.points.length > 0) {
          return {
            ...action,
            points: [
              { ...action.points[0], x: player.x, y: player.y },
              ...action.points.slice(1)
            ]
          };
        }
        return action;
      });

      // Automatically re-align all defensive players to the new offensive structure
      const currentDefenders = p.players.filter(pl => pl.side === 'defense');
      const realignedDefenders = realignAllDefenders(currentDefenders, newStructure);

      return {
        ...p,
        formationOffense: formation.name,
        actions: nextActions,
        players: [...offPlayers, ...realignedDefenders]
      };
    });

    setSelectedPlayerId(null);
    setSelectedActionId(null);
    showNotification(`Switched Offense to "${formation.name}" & re-aligned defense!`, 'success');
  };

  // Select and apply a Defensive Front from dropdown
  const handleSelectDefenseFront = (formationId: string) => {
    const formation = formations.find(f => f.id === formationId || f.name === formationId);
    if (!formation) return;
    const defPlayers = formation.players.filter(p => p.side === 'defense' || formation.side === 'defense');
    if (defPlayers.length === 0) return;

    const structure = analyzeOffense(currentPlay.players);
    // Pre-align new defensive players dynamically according to active offensive structure
    const realignedDefenders = defPlayers.map(p => {
      const tech = inferDefenderTechnique(p, structure);
      const pos = calculateDefensiveAlignmentPosition(tech, structure);
      return { ...p, technique: tech, x: pos.x, y: pos.y };
    });

    updateCurrentPlay(p => {
      const nonDefenders = p.players.filter(pl => pl.side !== 'defense');
      return {
        ...p,
        frontDefense: formation.name,
        players: [...nonDefenders, ...realignedDefenders]
      };
    });

    setSelectedPlayerId(null);
    setSelectedActionId(null);
    showNotification(`Loaded Defensive Front: "${formation.name}"`, 'success');
  };

  // Update an existing saved formation template with current chalkboard layout
  const handleUpdateFormation = async (formationId: string, side: 'offense' | 'defense' | 'both') => {
    const existing = formations.find(f => f.id === formationId || f.name === formationId);
    if (!existing) return;

    let updatedPlayers: Player[] = [];
    if (side === 'both') {
      updatedPlayers = currentPlay.players;
    } else if (side === 'offense') {
      updatedPlayers = currentPlay.players.filter(p => p.side === 'offense');
    } else {
      // For defense, ensure every defender has their technique recorded
      const structure = analyzeOffense(currentPlay.players);
      updatedPlayers = currentPlay.players
        .filter(p => p.side === 'defense')
        .map(p => ({
          ...p,
          technique: inferDefenderTechnique(p, structure)
        }));
    }

    if (updatedPlayers.length === 0) {
      showNotification(`No ${side} players on chalkboard to update "${existing.name}".`, 'error');
      return;
    }

    const updatedFormation: Formation = {
      ...existing,
      players: updatedPlayers,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured) {
        await saveFormation(updatedFormation);
      }
      setFormations(prev => prev.map(f => (f.id === existing.id ? updatedFormation : f)));
      showNotification(`Updated formation "${existing.name}" with current chalkboard positions!`, 'success');
    } catch (err: unknown) {
      console.warn('Could not update formation remotely:', err);
      setFormations(prev => prev.map(f => (f.id === existing.id ? updatedFormation : f)));
      showNotification(`Updated "${existing.name}" locally in storage.`, 'info');
    }
  };

  const handleToggleShowGaps = () => {
    setShowGaps(prev => !prev);
    showNotification(`Offensive Gaps Overlay ${!showGaps ? 'Enabled' : 'Disabled'}`, 'info');
  };

  // Play Library actions
  const handleSelectPlayFromLibrary = (play: Play) => {
    setPlaybook(prev => {
      const exists = prev.plays.some(p => p.id === play.id);
      const updated = exists ? prev.plays.map(p => (p.id === play.id ? play : p)) : [play, ...prev.plays];
      return { ...prev, plays: updated };
    });
    setActivePlayId(play.id);
    setSelectedPlayerId(null);
    setSelectedActionId(null);
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
        plays: remaining.length > 0 ? remaining : [DEFAULT_WISHBONE_PLAY]
      };
    });
    if (activePlayId === playId) {
      const fallback = playbook.plays.find(p => p.id !== playId) || DEFAULT_WISHBONE_PLAY;
      setActivePlayId(fallback.id);
      setSelectedPlayerId(null);
      setSelectedActionId(null);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0d1117] text-slate-100'} transition-colors`}>
      {/* TOP TOOLBAR */}
      <Toolbar
        currentPlay={currentPlay}
        allPlays={playbook.plays}
        appMode={appMode}
        onSetAppMode={handleSetAppMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectPlay={handleSelectPlay}
        onUpdatePlayName={handleUpdatePlayName}
        onUpdateCategory={handleUpdateCategory}
        onResetCanvas={handleResetCanvas}
        onNewPlay={handleNewPlay}
        onDuplicatePlay={handleDuplicatePlay}
        onExportSvg={handleExportSvg}
        onExportPlayJson={handleExportPlayJson}
        onExportPlaybookJson={handleExportPlaybookJson}
        onImportJson={handleImportJson}
        onOpenSituationMatrix={() => setIsMatrixModalOpen(true)}
        onOpenPlayLibrary={() => setIsLibraryModalOpen(true)}
        onOpenFormations={() => setIsFormationsModalOpen(true)}
        onOpenDefense={() => setIsDefenseModalOpen(true)}
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
        />

        {/* CENTER STAGE: CHALKBOARD SVG CANVAS */}
        <main className={`flex-1 flex flex-col items-center justify-center relative overflow-hidden ${theme === 'light' ? 'bg-slate-200/90' : 'bg-[#10141a]'} transition-colors`}>
          <ChalkboardCanvas
            players={currentPlay.players}
            actions={currentPlay.actions}
            mode={mode}
            appMode={appMode}
            theme={theme}
            showGaps={showGaps}
            onToggleShowGaps={handleToggleShowGaps}
            onOpenDefenseModal={() => setIsDefenseModalOpen(true)}
            onShiftDefense={handleShiftDefense}
            onRealignDefense={handleRealignDefense}
            formations={formations}
            allPlays={playbook.plays}
            activePlayId={currentPlay.id}
            onSelectPlay={handleSelectPlay}
            activeOffenseFormation={currentPlay.formationOffense}
            activeDefenseFront={currentPlay.frontDefense}
            onSelectOffenseFormation={handleSelectOffenseFormation}
            onSelectDefenseFront={handleSelectDefenseFront}
            onUpdateOffenseFormation={() => {
              const f = formations.find(fm => (fm.side === 'offense' || fm.side === 'both') && (fm.id === currentPlay.formationOffense || fm.name === currentPlay.formationOffense));
              if (f) handleUpdateFormation(f.id, 'offense');
            }}
            onUpdateDefenseFront={() => {
              const f = formations.find(fm => (fm.side === 'defense' || fm.side === 'both') && (fm.id === currentPlay.frontDefense || fm.name === currentPlay.frontDefense));
              if (f) handleUpdateFormation(f.id, 'defense');
            }}
            selectedPlayerId={selectedPlayerId}
            selectedActionId={selectedActionId}
            onSelectPlayer={setSelectedPlayerId}

            onSelectAction={setSelectedActionId}
            onUpdatePlayerPosition={handleUpdatePlayerPosition}
            onAddAction={handleAddAction}
            onUpdateActionPoints={handleUpdateActionPoints}
            onAddPlayerAtPoint={handleAddPlayerAtPoint}
            onSwitchToBuildMode={() => handleSetAppMode('build')}
            onSetMode={setMode}
            restartBlockRequest={restartBlockRequest}
            onClearRestartBlockRequest={() => setRestartBlockRequest(null)}
          />
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
          onUpdatePlayFormations={(offense, defense) => {
            updateCurrentPlay(p => ({
              ...p,
              formationOffense: offense,
              frontDefense: defense
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
              ? 'bg-rose-600 text-white border border-rose-400/40'
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
        showNotification={showNotification}
      />

      {/* FORMATION TEMPLATES SWITCHER MODAL */}
      <FormationSwitcherModal
        isOpen={isFormationsModalOpen}
        onClose={() => setIsFormationsModalOpen(false)}
        currentPlayers={currentPlay.players}
        currentActions={currentPlay.actions}
        onApplyFormation={handleApplyFormation}
        onUpdateFormation={handleUpdateFormation}
        showNotification={showNotification}
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
