import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Formation, Player, PathAction, Side, RouteAdaptationMode, QBPosition, ReceiverAlignment } from '../types/playbook';
import { morphBackfieldAlignment, detectCurrentQBPosition, type SnapAlignment } from '../utils/formationBackfield';
import { 
  fetchFormations, 
  saveFormation, 
  deleteFormation,
  seedAllFormations
} from '../services/playbookDb';
import { DEFAULT_FORMATIONS } from '../data/presets';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Shield, 
  Users, 
  Sparkles, 
  AlertCircle,
  Save,
  Cloud,
  Search,
  RotateCcw,
  Zap,
  Filter,
  Layers
} from 'lucide-react';

interface FormationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayers: Player[];
  currentActions: PathAction[];
  onApplyFormation: (players: Player[], keepActions: boolean, mode?: RouteAdaptationMode) => void;
  onUpdateFormation?: (formationId: string, side: 'offense' | 'defense' | 'both') => Promise<void> | void;
  routeAdaptationMode?: RouteAdaptationMode;
  onSetRouteAdaptationMode?: (mode: RouteAdaptationMode) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormationSwitcherModal: React.FC<FormationSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentPlayers,
  currentActions,
  onApplyFormation,
  onUpdateFormation,
  routeAdaptationMode: _routeAdaptationMode = 'player_relative',
  onSetRouteAdaptationMode: _onSetRouteAdaptationMode,
  showNotification
}) => {
  const [formations, setFormations] = useState<Formation[]>(DEFAULT_FORMATIONS);
  const [selectedFormationId, setSelectedFormationId] = useState<string>(DEFAULT_FORMATIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  // New Formation Save Form State
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newFormationName, setNewFormationName] = useState('');
  const [newFormationSide, setNewFormationSide] = useState<Side | 'both'>('offense');
  const [newFormationPersonnel, setNewFormationPersonnel] = useState('11');
  const [newFormationQB, setNewFormationQB] = useState<QBPosition>('shotgun');
  const [newFormationAlign, setNewFormationAlign] = useState<ReceiverAlignment>('2x2');
  const [newFormationIsBunch, setNewFormationIsBunch] = useState(false);
  const [newFormationStyle, setNewFormationStyle] = useState<string>('spread');
  const [newFormationLabels, setNewFormationLabels] = useState('');

  // Enhanced Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | 'offense' | 'defense'>('offense');
  const [personnelFilter, setPersonnelFilter] = useState<string>('all');
  const [qbFilter, setQbFilter] = useState<string>('all');
  const [alignFilter, setAlignFilter] = useState<string>('all');
  const [bunchFilter, setBunchFilter] = useState<'all' | 'bunch' | 'non_bunch'>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [previewBackfield, setPreviewBackfield] = useState<SnapAlignment | null>(null);

  const [confirmApplyModal, setConfirmApplyModal] = useState<Formation | null>(null);

  // Load formations from Firestore
  const loadFormations = useCallback(async () => {
    setIsLoading(true);
    try {
      const remote = await fetchFormations();
      if (remote.length > 0) {
        const map = new Map<string, Formation>();
        DEFAULT_FORMATIONS.forEach(f => map.set(f.id, f));
        remote.forEach(f => map.set(f.id, f));
        setFormations(Array.from(map.values()));
      } else {
        setFormations(DEFAULT_FORMATIONS);
      }
    } catch {
      setFormations(DEFAULT_FORMATIONS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void loadFormations();
        setShowSaveForm(false);
        setConfirmApplyModal(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadFormations]);

  // Sync / Seed all formations into Firebase Firestore
  const handleSyncToFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const result = await seedAllFormations(DEFAULT_FORMATIONS);
      await loadFormations();
      showNotification(`Successfully synced ${result.count} formations to Firebase Firestore!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      showNotification(`Firebase sync error: ${msg}`, 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setPersonnelFilter('all');
    setQbFilter('all');
    setAlignFilter('all');
    setBunchFilter('all');
    setStyleFilter('all');
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (personnelFilter !== 'all') count++;
    if (qbFilter !== 'all') count++;
    if (alignFilter !== 'all') count++;
    if (bunchFilter !== 'all') count++;
    if (styleFilter !== 'all') count++;
    return count;
  }, [searchQuery, personnelFilter, qbFilter, alignFilter, bunchFilter, styleFilter]);

  // Multi-facet filtering logic
  const filteredFormations = useMemo(() => {
    return formations.filter(f => {
      // 1. Side filter
      if (sideFilter === 'offense' && f.side !== 'offense' && f.side !== 'both') return false;
      if (sideFilter === 'defense' && f.side !== 'defense' && f.side !== 'both') return false;

      // 2. Search query (matches name, description, personnel, tags, labels)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description?.toLowerCase().includes(q) ?? false;
        const matchesPersonnel = f.personnel?.toLowerCase().includes(q) ?? false;
        const matchesTags = f.tags?.some(t => t.toLowerCase().includes(q)) ?? false;
        const matchesLabels = f.labels?.some(l => l.toLowerCase().includes(q)) ?? false;
        if (!matchesName && !matchesDesc && !matchesPersonnel && !matchesTags && !matchesLabels) {
          return false;
        }
      }

      // 3. Style filter
      if (styleFilter !== 'all' && f.style !== styleFilter) return false;

      // 4. Offensive-specific facets (Personnel, QB, Alignment, Bunch)
      if (f.side === 'offense' || f.side === 'both') {
        // Backfield Personnel filter
        if (personnelFilter !== 'all') {
          if (personnelFilter === 'empty') {
            if (f.personnel !== '01' && f.personnel !== '00' && !f.personnel?.includes('Empty')) {
              return false;
            }
          } else {
            if (f.personnel !== personnelFilter && !f.personnel?.includes(personnelFilter)) {
              return false;
            }
          }
        }

        // QB Position filter
        if (qbFilter !== 'all') {
          if (f.qbPosition !== qbFilter) return false;
        }

        // Receiver Alignment filter
        if (alignFilter !== 'all') {
          if (f.receiverAlignment !== alignFilter && !f.receiverAlignment?.includes(alignFilter)) {
            return false;
          }
        }

        // Bunch filter
        if (bunchFilter === 'bunch' && !f.isBunch) return false;
        if (bunchFilter === 'non_bunch' && f.isBunch) return false;
      }

      return true;
    });
  }, [formations, sideFilter, searchQuery, styleFilter, personnelFilter, qbFilter, alignFilter, bunchFilter]);

  // Base selected formation template
  const baseSelectedFormation = formations.find(f => f.id === selectedFormationId) || filteredFormations[0] || formations[0];

  // Active QB backfield alignment (either preview override or native formation alignment)
  const currentBackfield = previewBackfield || (baseSelectedFormation?.qbPosition as SnapAlignment) || (baseSelectedFormation ? detectCurrentQBPosition(baseSelectedFormation.players) : 'shotgun');

  // Selected formation with live morphed backfield if coach clicked Center / Pistol / Gun
  const selectedFormation = useMemo(() => {
    if (!baseSelectedFormation || baseSelectedFormation.side === 'defense' || !previewBackfield) {
      return baseSelectedFormation;
    }
    const morphed = morphBackfieldAlignment(baseSelectedFormation.players, [], previewBackfield);
    return {
      ...baseSelectedFormation,
      players: morphed.players,
      qbPosition: previewBackfield
    };
  }, [baseSelectedFormation, previewBackfield]);

  // Save current player setup as new base formation template
  const handleSaveCurrentAsFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormationName.trim()) {
      showNotification('Please enter a formation name', 'error');
      return;
    }

    let playersToSave: Player[] = [];
    if (newFormationSide === 'both') {
      playersToSave = currentPlayers;
    } else {
      playersToSave = currentPlayers.filter(p => p.side === newFormationSide);
    }

    if (playersToSave.length === 0) {
      showNotification(`No ${newFormationSide} players currently on the chalkboard to save.`, 'error');
      return;
    }

    const labelsList = newFormationLabels
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const isOffense = newFormationSide === 'offense';

    const newFormation: Formation = {
      id: `formation_${Date.now()}`,
      name: newFormationName.trim(),
      side: newFormationSide,
      personnel: newFormationPersonnel.trim() || (isOffense ? '11' : 'Base Front'),
      qbPosition: isOffense ? newFormationQB : undefined,
      receiverAlignment: isOffense ? newFormationAlign : undefined,
      isBunch: isOffense ? newFormationIsBunch : undefined,
      style: newFormationStyle as any,
      labels: labelsList.length > 0 ? labelsList : [isOffense ? 'Offense' : 'Defense Front'],
      tags: isOffense ? [
        newFormationPersonnel.trim(),
        String(newFormationQB),
        String(newFormationAlign),
        newFormationStyle,
        ...(newFormationIsBunch ? ['bunch'] : [])
      ] : [newFormationStyle],
      players: playersToSave,
      description: `Saved from active chalkboard with ${playersToSave.length} players.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await saveFormation(newFormation);
      showNotification(`Saved formation template "${newFormation.name}"!`, 'success');
      setFormations(prev => [newFormation, ...prev]);
      setSelectedFormationId(newFormation.id);
      setNewFormationName('');
      setShowSaveForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      setFormations(prev => [newFormation, ...prev]);
      setSelectedFormationId(newFormation.id);
      setShowSaveForm(false);
      showNotification(`Saved locally (${msg})`, 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete custom formation
  const handleDeleteFormation = async (formation: Formation, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete formation "${formation.name}"?`)) {
      try {
        await deleteFormation(formation.id);
      } catch (err) {
        console.warn('Could not delete from Firestore:', err);
      }
      setFormations(prev => prev.filter(f => f.id !== formation.id));
      if (selectedFormationId === formation.id) {
        setSelectedFormationId(DEFAULT_FORMATIONS[0].id);
      }
      showNotification(`Deleted formation "${formation.name}"`, 'info');
    }
  };

  // Update selected formation with current chalkboard layout
  const handleUpdateSelectedFormation = async () => {
    if (!selectedFormation) return;
    if (window.confirm(`Update formation "${selectedFormation.name}" with current chalkboard positions?`)) {
      if (onUpdateFormation) {
        await onUpdateFormation(selectedFormation.id, selectedFormation.side);
        void loadFormations();
        return;
      }

      let playersToSave: Player[] = [];
      if (selectedFormation.side === 'both') {
        playersToSave = currentPlayers;
      } else {
        playersToSave = currentPlayers.filter(p => p.side === selectedFormation.side);
      }
      if (playersToSave.length === 0) {
        showNotification(`No ${selectedFormation.side} players on chalkboard to update "${selectedFormation.name}".`, 'error');
        return;
      }
      const updatedFormation: Formation = {
        ...selectedFormation,
        players: playersToSave,
        updatedAt: new Date().toISOString()
      };
      try {
        await saveFormation(updatedFormation);
        showNotification(`Updated formation "${updatedFormation.name}"!`, 'success');
        setFormations(prev => prev.map(f => (f.id === updatedFormation.id ? updatedFormation : f)));
      } catch {
        setFormations(prev => prev.map(f => (f.id === updatedFormation.id ? updatedFormation : f)));
        showNotification(`Updated "${updatedFormation.name}" locally`, 'info');
      }
    }
  };

  // Trigger apply with check for route assignments
  const handleInitiateApply = (formation: Formation) => {
    const hasRoutes = currentActions.length > 0;
    if (hasRoutes) {
      setConfirmApplyModal(formation);
    } else {
      executeApply(formation, true, _routeAdaptationMode);
    }
  };

  // Execute applying formation
  const executeApply = (formation: Formation, keepActions: boolean, mode?: RouteAdaptationMode) => {
    let updatedPlayers: Player[] = [];

    if (formation.side === 'both') {
      updatedPlayers = [...formation.players];
    } else if (formation.side === 'offense') {
      const existingDefense = currentPlayers.filter(p => p.side === 'defense');
      updatedPlayers = [...formation.players, ...existingDefense];
    } else {
      const existingOffense = currentPlayers.filter(p => p.side === 'offense');
      updatedPlayers = [...existingOffense, ...formation.players];
    }

    onApplyFormation(updatedPlayers, keepActions, mode);
    showNotification(`Applied formation "${formation.name}"`, 'success');
    setConfirmApplyModal(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b24] flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  BASE FORMATION TEMPLATES
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono font-bold border border-slate-700">
                  {filteredFormations.length} / {formations.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Categorized by Backfield Personnel (21, 31, 30...), QB Alignment, Receiver Spread & Style.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToFirebase}
              disabled={isSyncingFirebase}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg shadow-sm transition-all cursor-pointer"
              title="Sync all default mapped formations directly into Firebase Firestore"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncingFirebase ? 'animate-bounce' : ''}`} />
              <span>{isSyncingFirebase ? 'Syncing to Firebase...' : 'Sync to Firebase'}</span>
            </button>
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current Canvas</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SAVE CURRENT AS FORMATION FORM */}
        {showSaveForm && (
          <form onSubmit={handleSaveCurrentAsFormation} className="bg-[#171d29] border-b border-[#30363d] p-4 text-xs animate-in slide-in-from-top duration-150">
            <h3 className="font-bold text-white mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Save Chalkboard Alignment as New Formation Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Formation Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gun 11 Snug Bunch"
                  value={newFormationName}
                  onChange={(e) => setNewFormationName(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Scope / Side
                </label>
                <select
                  value={newFormationSide}
                  onChange={(e) => {
                    const side = e.target.value as Side | 'both';
                    setNewFormationSide(side);
                    if (side === 'defense') setNewFormationStyle('even_front');
                    else setNewFormationStyle('spread');
                  }}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                >
                  <option value="offense">Offense Only ({currentPlayers.filter(p => p.side === 'offense').length} players)</option>
                  <option value="defense">Defense Only ({currentPlayers.filter(p => p.side === 'defense').length} players)</option>
                  <option value="both">Both Offense & Defense ({currentPlayers.length} players)</option>
                </select>
              </div>

              {newFormationSide !== 'defense' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Personnel (Backfield)
                    </label>
                    <select
                      value={newFormationPersonnel}
                      onChange={(e) => setNewFormationPersonnel(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    >
                      <option value="11">11 (1 RB, 1 TE)</option>
                      <option value="12">12 (1 RB, 2 TE)</option>
                      <option value="21">21 (2 RB, 1 TE)</option>
                      <option value="20">20 (2 RB, 0 TE)</option>
                      <option value="22">22 (2 RB, 2 TE)</option>
                      <option value="31">31 (3 RB, 1 TE)</option>
                      <option value="30">30 (3 RB, 0 TE)</option>
                      <option value="10">10 (1 RB, 0 TE)</option>
                      <option value="01">01 Empty (1 TE)</option>
                      <option value="00">00 Empty (5 WR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      QB Position
                    </label>
                    <select
                      value={newFormationQB}
                      onChange={(e) => setNewFormationQB(e.target.value as QBPosition)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                    >
                      <option value="shotgun">Shotgun</option>
                      <option value="pistol">Pistol</option>
                      <option value="down_center">Down Center</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Receiver Alignment
                    </label>
                    <select
                      value={newFormationAlign}
                      onChange={(e) => setNewFormationAlign(e.target.value as ReceiverAlignment)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500 font-mono"
                    >
                      <option value="2x2">2x2 (Doubles)</option>
                      <option value="3x1">3x1 (Trips/Trey)</option>
                      <option value="2x1">2x1 (Pro/Slot)</option>
                      <option value="3x2">3x2 (Empty)</option>
                      <option value="4x1">4x1 (Quads)</option>
                      <option value="1x1">1x1 (Heavy/Tight)</option>
                    </select>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Style Category
                </label>
                <select
                  value={newFormationStyle}
                  onChange={(e) => setNewFormationStyle(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500 font-medium"
                >
                  {newFormationSide !== 'defense' ? (
                    <>
                      <option value="spread">Spread</option>
                      <option value="pro_style">Pro Style</option>
                      <option value="old_school">Old School</option>
                    </>
                  ) : (
                    <>
                      <option value="even_front">Even Front (4-Down)</option>
                      <option value="odd_front">Odd Front (3-Down)</option>
                      <option value="heavy_front">Heavy / Bear Front</option>
                    </>
                  )}
                </select>
              </div>

              {newFormationSide === 'offense' && (
                <div className="flex items-center gap-2 pb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={newFormationIsBunch}
                      onChange={(e) => setNewFormationIsBunch(e.target.checked)}
                      className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-amber-300">Is Bunch Formation</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Labels (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spread, 11P, Trips"
                  value={newFormationLabels}
                  onChange={(e) => setNewFormationLabels(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CONFIRMATION OVERLAY FOR ROUTE ASSIGNMENTS */}
        {confirmApplyModal && (
          <div className="bg-amber-950/80 border-b border-amber-600/50 p-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-amber-200 text-sm">
                  Apply "{confirmApplyModal.name}" onto Chalkboard?
                </h4>
                <p className="text-amber-300/90 mt-1">
                  This play has <strong>{currentActions.length} existing vector routes / blocks</strong>. 
                  Choose how to adapt existing route vectors to the new formation:
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => executeApply(confirmApplyModal, true, 'player_relative')}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Translates each player's route vector (stem and breaks) relative to their new alignment"
                  >
                    <span>🎯</span>
                    <span>Keep: Relative to Player</span>
                  </button>
                  <button
                    onClick={() => executeApply(confirmApplyModal, true, 'concept_numbered')}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Maps passing routes to outside-in receivers: #1 Outside, #2 Slot, #3 Inner"
                  >
                    <span className="font-mono text-purple-200 font-bold">#123</span>
                    <span>Keep: Concept (#1/#2/#3 Outside)</span>
                  </button>
                  <button
                    onClick={() => executeApply(confirmApplyModal, false)}
                    className="px-3 py-1.5 bg-rose-700/80 hover:bg-rose-600 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    Clear All Routes
                  </button>
                  <button
                    onClick={() => setConfirmApplyModal(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENT AREA: SPLIT LIST & PREVIEW */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT LIST */}
          <div className="w-1/2 border-r border-[#30363d] flex flex-col bg-[#0c1017] overflow-hidden">
            
            {/* MULTI-FACET FILTER BAR */}
            <div className="p-3 border-b border-[#222834] bg-[#11151e] space-y-2 flex-shrink-0">
              
              {/* SEARCH INPUT */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, personnel (21, 31, 11), bunch, gun, pistol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#090d14] border border-[#222834] rounded-lg pl-8 pr-7 py-1 text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* SIDE TABS */}
              <div className="flex items-center gap-1 bg-[#090d14] p-1 rounded-lg border border-[#222834]">
                <button
                  type="button"
                  onClick={() => setSideFilter('all')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    sideFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({formations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSideFilter('offense')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    sideFilter === 'offense' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Offense ({formations.filter(f => f.side === 'offense' || f.side === 'both').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSideFilter('defense')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    sideFilter === 'defense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Defense ({formations.filter(f => f.side === 'defense' || f.side === 'both').length})
                </button>
              </div>

              {/* OFFENSIVE FACET ROWS */}
              {sideFilter !== 'defense' && (
                <div className="space-y-1.5 text-[10px]">
                  {/* PERSONNEL ROW */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-0.5">
                      <Layers className="w-2.5 h-2.5" />
                      Pers:
                    </span>
                    {['all', '31', '30', '22', '21', '20', '12', '11', '10', 'empty'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPersonnelFilter(p)}
                        className={`px-2 py-0.5 rounded-full font-bold font-mono transition-all flex-shrink-0 cursor-pointer ${
                          personnelFilter === p
                            ? 'bg-amber-500 text-black shadow-sm'
                            : 'bg-[#181d28] text-slate-400 hover:text-slate-200 border border-[#252c3c]'
                        }`}
                      >
                        {p === 'all' ? 'All' : p === 'empty' ? '00/01' : p}
                      </button>
                    ))}
                  </div>

                  {/* QB ALIGNMENT & BUNCH ROW */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">QB:</span>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'shotgun', label: 'Gun' },
                      { id: 'pistol', label: 'Pistol' },
                      { id: 'down_center', label: 'Center' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setQbFilter(item.id)}
                        className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                          qbFilter === item.id
                            ? 'bg-sky-500 text-slate-950 shadow-sm'
                            : 'bg-[#181d28] text-slate-400 hover:text-slate-200 border border-[#252c3c]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}

                    <span className="text-slate-600 mx-1">|</span>

                    {/* BUNCH TOGGLE */}
                    <button
                      type="button"
                      onClick={() => setBunchFilter(bunchFilter === 'bunch' ? 'all' : 'bunch')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                        bunchFilter === 'bunch'
                          ? 'bg-rose-500 text-white shadow-sm ring-1 ring-rose-400'
                          : 'bg-[#181d28] text-rose-300 hover:text-rose-200 border border-rose-900/50'
                      }`}
                    >
                      <Zap className="w-2.5 h-2.5" />
                      <span>Bunch</span>
                    </button>
                  </div>

                  {/* RECEIVER ALIGNMENT ROW */}
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
                    <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">Align:</span>
                    {['all', '2x2', '3x1', '2x1', '3x2', '4x1', '1x1'].map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAlignFilter(a)}
                        className={`px-2 py-0.5 rounded-full font-bold font-mono transition-all flex-shrink-0 cursor-pointer ${
                          alignFilter === a
                            ? 'bg-purple-500 text-white shadow-sm'
                            : 'bg-[#181d28] text-slate-400 hover:text-slate-200 border border-[#252c3c]'
                        }`}
                      >
                        {a === 'all' ? 'All' : a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STYLE PILLS ROW */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[10px] no-scrollbar">
                <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">Style:</span>
                <button
                  type="button"
                  onClick={() => setStyleFilter('all')}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                    styleFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                {sideFilter !== 'defense' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('spread')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'spread'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Spread
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('pro_style')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'pro_style'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Pro Style
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('old_school')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'old_school'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Old School
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('even_front')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'even_front'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Even (4-Down)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('odd_front')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'odd_front'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Odd (3-Down)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStyleFilter('heavy_front')}
                      className={`px-2 py-0.5 rounded-full font-bold transition-all flex-shrink-0 cursor-pointer ${
                        styleFilter === 'heavy_front'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Heavy / Bear
                    </button>
                  </>
                )}
              </div>

              {/* ACTIVE FILTER SUMMARY & RESET */}
              {activeFilterCount > 0 && (
                <div className="flex items-center justify-between text-[11px] text-sky-400 pt-1 border-t border-[#222834]/60">
                  <span className="flex items-center gap-1 font-semibold">
                    <Filter className="w-3 h-3 text-sky-400" />
                    <span>{filteredFormations.length} matched ({activeFilterCount} active filters)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-sky-300 font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              )}
            </div>

            {/* FORMATION CARDS LIST */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading formation templates...</div>
              ) : filteredFormations.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-slate-400 text-xs font-semibold">No formations found matching selected criteria.</p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                filteredFormations.map(f => {
                  const isSelected = f.id === selectedFormationId;
                  const isDefault = DEFAULT_FORMATIONS.some(def => def.id === f.id);

                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setSelectedFormationId(f.id);
                        setPreviewBackfield(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#182234] border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                          : 'bg-[#121620] hover:bg-[#161c28] border-[#222834]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black mt-0.5 flex-shrink-0 ${
                          f.side === 'offense' 
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' 
                            : f.side === 'defense'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                            : 'bg-indigo-950/80 text-indigo-300 border border-indigo-600/40'
                        }`}>
                          {f.side === 'offense' ? 'OFF' : f.side === 'defense' ? 'DEF' : 'ALL'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                            {f.style && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${
                                f.style === 'pro_style' ? 'bg-sky-950 text-sky-300 border border-sky-700/50' :
                                f.style === 'spread' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' :
                                f.style === 'old_school' ? 'bg-amber-950 text-amber-300 border border-amber-700/50' :
                                f.style === 'even_front' ? 'bg-blue-950 text-blue-300 border border-blue-700/50' :
                                f.style === 'odd_front' ? 'bg-purple-950 text-purple-300 border border-purple-700/50' :
                                f.style === 'heavy_front' ? 'bg-rose-950 text-rose-300 border border-rose-700/50' :
                                'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}>
                                {f.style === 'pro_style' ? 'Pro Style' :
                                 f.style === 'spread' ? 'Spread' :
                                 f.style === 'old_school' ? 'Old School' :
                                 f.style === 'even_front' ? 'Even Front' :
                                 f.style === 'odd_front' ? 'Odd Front' :
                                 f.style === 'heavy_front' ? 'Heavy Front' : f.style}
                              </span>
                            )}
                          </div>

                          {/* OFFENSIVE FACET BADGES */}
                          {f.side === 'offense' ? (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {f.personnel && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40">
                                  {f.personnel}P
                                </span>
                              )}
                              {f.qbPosition && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-600/40">
                                  {f.qbPosition === 'shotgun' ? 'Gun' : f.qbPosition === 'pistol' ? 'Pistol' : 'Under Center'}
                                </span>
                              )}
                              {f.receiverAlignment && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-600/40">
                                  {f.receiverAlignment}
                                </span>
                              )}
                              {f.isBunch && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-600/40 flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5 text-rose-400" />
                                  Bunch
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              {f.personnel || 'Defense Front'} • {f.players.length} Players
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!isDefault && (
                          <button
                            onClick={(e) => handleDeleteFormation(f, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete custom formation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiateApply(f);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                          title="Apply this template onto the canvas"
                        >
                          <Check className="w-3 h-3" />
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="w-1/2 p-6 overflow-y-auto bg-[#10141d] flex flex-col justify-between">
            {selectedFormation ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      selectedFormation.side === 'offense'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                        : selectedFormation.side === 'defense'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                        : 'bg-indigo-950/80 text-indigo-300 border-indigo-600/40'
                    }`}>
                      {selectedFormation.side} Template
                    </span>
                    {selectedFormation.isBunch && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/40 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-rose-400" />
                        Bunch Cluster
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedFormation.players.length} Players
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mb-1">
                  {selectedFormation.name}
                </h3>
                
                {/* 4-DIMENSION PILL SUMMARY */}
                {selectedFormation.side === 'offense' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 bg-[#0d1017] p-2.5 rounded-xl border border-[#232936]">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Backfield:</span>
                      <strong className="text-amber-300 text-xs font-mono">{selectedFormation.personnel || 'N/A'} Pers</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">QB Position:</span>
                      <strong className="text-sky-300 text-xs">
                        {selectedFormation.qbPosition === 'shotgun' ? 'Shotgun' : selectedFormation.qbPosition === 'pistol' ? 'Pistol' : 'Under Center'}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Alignment:</span>
                      <strong className="text-purple-300 text-xs font-mono">{selectedFormation.receiverAlignment || 'Standard'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-500">Style:</span>
                      <strong className="text-emerald-300 text-xs capitalize">{selectedFormation.style?.replace('_', ' ') || 'Pro'}</strong>
                    </div>
                  </div>
                )}

                {/* INTERACTIVE BACKFIELD MODIFIER (Ace, Deuce, Spread, etc.) */}
                {selectedFormation.side === 'offense' && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#090d14] border border-[#232936] mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-extrabold text-slate-300">Backfield Snap:</span>
                      <span className="text-[10px] text-slate-500 font-mono">(Center / Gun / Pistol)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#121620] p-1 rounded-lg border border-[#222834]">
                      <button
                        type="button"
                        onClick={() => setPreviewBackfield('down_center')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentBackfield === 'down_center'
                            ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Under Center: QB under Center at 1 yard, RB downhill at 6-7 yards"
                      >
                        <span>🏈</span>
                        <span>Under Center</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewBackfield('pistol')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentBackfield === 'pistol'
                            ? 'bg-sky-600 text-white shadow-sm ring-1 ring-sky-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Pistol: QB at 3.5 yards, RB stacked directly behind at 7 yards"
                      >
                        <span>🎯</span>
                        <span>Pistol</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewBackfield('shotgun')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          currentBackfield === 'shotgun'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Shotgun: QB at 5-6 yards, RB offset sidecar"
                      >
                        <span>⚡</span>
                        <span>Shotgun</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedFormation.description && (
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    {selectedFormation.description}
                  </p>
                )}

                {/* MINI PLAYER ROSTER MAP */}
                <div className="border border-[#232936] rounded-xl p-3 bg-[#0d1017]">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    Player Alignments ({selectedFormation.players.length})
                  </h5>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFormation.players.map(p => (
                      <div key={p.id} className="bg-[#141923] p-1.5 rounded-lg border border-[#202735] text-[10px]">
                        <div className="flex items-center justify-between">
                          <strong className={p.side === 'offense' ? 'text-amber-400' : 'text-rose-400'}>
                            {p.label}
                          </strong>
                          <span className="font-mono text-slate-500">
                            {p.x},{p.y}
                          </span>
                        </div>
                        <p className="text-slate-400 truncate text-[9px] mt-0.5">
                          {p.assignmentTitle || p.technique || 'Position'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {selectedFormation && (
              <div className="pt-6 border-t border-[#232936] mt-6 flex items-center justify-end gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSelectedFormation}
                  className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Update this formation template with current player positions from the chalkboard"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  Update with Current Canvas
                </button>
                <button
                  type="button"
                  onClick={() => handleInitiateApply(selectedFormation)}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Apply Template to Canvas
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FormationSwitcherModal;
