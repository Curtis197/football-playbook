import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Play, 
  PlaybookFile, 
  Player, 
  PathAction, 
  CanvasMode, 
  PlayCategory,
  AppMode 
} from './types/playbook';
import { DEFAULT_WISHBONE_PLAY } from './data/presets';
import { 
  loadPlaybookFromStorage, 
  savePlaybookToStorage, 
  downloadJsonFile, 
  downloadSvgFile, 
  parseAndValidateImport 
} from './utils/storage';
import { ChalkboardCanvas } from './components/ChalkboardCanvas';
import { Toolbar, type CloudSyncStatus } from './components/Toolbar';
import { ModeSwitcher } from './components/ModeSwitcher';
import { InspectorPanel } from './components/InspectorPanel';
import { SituationMatrixModal } from './components/SituationMatrixModal';
import { PlayLibraryModal } from './components/PlayLibraryModal';
import { FormationSwitcherModal } from './components/FormationSwitcherModal';
import { savePlay } from './services/playbookDb';
import { isFirebaseConfigured } from './services/firebase';

export const App: React.FC = () => {
  const [playbook, setPlaybook] = useState<PlaybookFile>(() => loadPlaybookFromStorage());
  const [activePlayId, setActivePlayId] = useState<string>(() => playbook.plays[0]?.id || DEFAULT_WISHBONE_PLAY.id);
  const [appMode, setAppMode] = useState<AppMode>('build');
  const [mode, setMode] = useState<CanvasMode>('select');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isFormationsModalOpen, setIsFormationsModalOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  // Add player at coordinate
  const handleAddPlayerAtPoint = (x: number, y: number, side: 'offense' | 'defense') => {
    const existingCount = currentPlay.players.filter(p => p.side === side).length;
    const label = side === 'offense' ? `O${existingCount + 1}` : `D${existingCount + 1}`;
    const newPlayer: Player = {
      id: `${side}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      label,
      side,
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
  const handleSaveToCloud = async () => {
    setCloudSyncStatus('saving');
    try {
      await savePlay(currentPlay);
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0d1117]">
      {/* TOP TOOLBAR */}
      <Toolbar
        currentPlay={currentPlay}
        allPlays={playbook.plays}
        appMode={appMode}
        onSetAppMode={handleSetAppMode}
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
        onSaveToCloud={handleSaveToCloud}
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
          selectedPlayerId={selectedPlayerId}
          selectedActionId={selectedActionId}
          onDeleteSelected={handleDeleteSelected}
        />

        {/* CENTER STAGE: CHALKBOARD SVG CANVAS */}
        <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#10141a]">
          <ChalkboardCanvas
            players={currentPlay.players}
            actions={currentPlay.actions}
            mode={mode}
            appMode={appMode}
            selectedPlayerId={selectedPlayerId}
            selectedActionId={selectedActionId}
            onSelectPlayer={setSelectedPlayerId}
            onSelectAction={setSelectedActionId}
            onUpdatePlayerPosition={handleUpdatePlayerPosition}
            onAddAction={handleAddAction}
            onUpdateActionPoints={handleUpdateActionPoints}
            onAddPlayerAtPoint={handleAddPlayerAtPoint}
            onSwitchToBuildMode={() => handleSetAppMode('build')}
          />
        </main>

        {/* RIGHT INSPECTOR & PHILOSOPHY PANEL */}
        <InspectorPanel
          currentPlay={currentPlay}
          selectedPlayer={selectedPlayer}
          selectedAction={selectedAction}
          appMode={appMode}
          onSelectPlayer={setSelectedPlayerId}
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
        showNotification={showNotification}
      />
    </div>
  );
};

export default App;
