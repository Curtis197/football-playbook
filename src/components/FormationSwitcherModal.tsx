import React, { useState, useEffect, useCallback } from 'react';
import type { Formation, Player, PathAction, Side } from '../types/playbook';
import { 
  fetchFormations, 
  saveFormation, 
  deleteFormation 
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
  AlertCircle
} from 'lucide-react';

interface FormationSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayers: Player[];
  currentActions: PathAction[];
  onApplyFormation: (players: Player[], keepActions: boolean) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormationSwitcherModal: React.FC<FormationSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentPlayers,
  currentActions,
  onApplyFormation,
  showNotification
}) => {
  const [formations, setFormations] = useState<Formation[]>(DEFAULT_FORMATIONS);
  const [selectedFormationId, setSelectedFormationId] = useState<string>(DEFAULT_FORMATIONS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFormationName, setNewFormationName] = useState('');
  const [newFormationSide, setNewFormationSide] = useState<Side | 'both'>('offense');
  const [newFormationPersonnel, setNewFormationPersonnel] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [confirmApplyModal, setConfirmApplyModal] = useState<Formation | null>(null);

  // Load formations from Firestore
  const loadFormations = useCallback(async () => {
    setIsLoading(true);
    try {
      const remote = await fetchFormations();
      if (remote.length > 0) {
        // Merge remote with default presets (remote takes precedence by id)
        const map = new Map<string, Formation>();
        DEFAULT_FORMATIONS.forEach(f => map.set(f.id, f));
        remote.forEach(f => map.set(f.id, f));
        setFormations(Array.from(map.values()));
      } else {
        setFormations(DEFAULT_FORMATIONS);
      }
    } catch {
      // Fallback to presets if Firestore is offline
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

  const selectedFormation = formations.find(f => f.id === selectedFormationId) || formations[0];

  // Save current player setup as new base formation template
  const handleSaveCurrentAsFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormationName.trim()) {
      showNotification('Please enter a formation name', 'error');
      return;
    }

    // Filter players based on side
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

    const newFormation: Formation = {
      id: `formation_${Date.now()}`,
      name: newFormationName.trim(),
      side: newFormationSide,
      personnel: newFormationPersonnel.trim() || (newFormationSide === 'offense' ? '11 Personnel' : 'Base Front'),
      players: playersToSave,
      description: `Saved from active chalkboard with ${playersToSave.length} players.`,
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await saveFormation(newFormation);
      showNotification(`Saved formation template "${newFormation.name}"!`, 'success');
      setFormations(prev => [newFormation, ...prev]);
      setSelectedFormationId(newFormation.id);
      setNewFormationName('');
      setNewFormationPersonnel('');
      setShowSaveForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error';
      // Still add locally if offline
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

  // Trigger apply with check for route assignments
  const handleInitiateApply = (formation: Formation) => {
    const hasRoutes = currentActions.length > 0;
    if (hasRoutes) {
      // Show confirmation prompt to choose whether to keep or clear routes
      setConfirmApplyModal(formation);
    } else {
      executeApply(formation, true);
    }
  };

  // Execute applying formation
  const executeApply = (formation: Formation, keepActions: boolean) => {
    let updatedPlayers: Player[] = [];

    if (formation.side === 'both') {
      // Replace all players with formation's players
      updatedPlayers = [...formation.players];
    } else if (formation.side === 'offense') {
      // Replace only offense players, preserve defense players
      const existingDefense = currentPlayers.filter(p => p.side === 'defense');
      updatedPlayers = [...formation.players, ...existingDefense];
    } else {
      // Replace only defense players, preserve offense players
      const existingOffense = currentPlayers.filter(p => p.side === 'offense');
      updatedPlayers = [...existingOffense, ...formation.players];
    }

    onApplyFormation(updatedPlayers, keepActions);
    showNotification(`Applied formation "${formation.name}"`, 'success');
    setConfirmApplyModal(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-rose-600 flex items-center justify-center shadow-lg text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">
                BASE FORMATION TEMPLATES
              </h2>
              <p className="text-xs text-slate-400">
                Apply offensive personnel packages & defensive fronts, or save current alignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current Canvas</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Formation Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shotgun Empty Quads"
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
                  onChange={(e) => setNewFormationSide(e.target.value as Side | 'both')}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                >
                  <option value="offense">Offense Only ({currentPlayers.filter(p => p.side === 'offense').length} players)</option>
                  <option value="defense">Defense Only ({currentPlayers.filter(p => p.side === 'defense').length} players)</option>
                  <option value="both">Both Offense & Defense ({currentPlayers.length} players)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Personnel / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21 Personnel, 3-5-3"
                  value={newFormationPersonnel}
                  onChange={(e) => setNewFormationPersonnel(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
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
                  Choose whether to keep existing route assignments aligned to the players, or clear all routes.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => executeApply(confirmApplyModal, true)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm transition-all"
                  >
                    Keep Route Assignments (Recommended)
                  </button>
                  <button
                    onClick={() => executeApply(confirmApplyModal, false)}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg shadow-sm transition-all"
                  >
                    Clear All Routes & Reset
                  </button>
                  <button
                    onClick={() => setConfirmApplyModal(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
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
          <div className="w-1/2 border-r border-[#30363d] overflow-y-auto p-4 space-y-2 bg-[#0c1017]">
            {isLoading ? (
              <p className="text-xs text-slate-400 p-4">Loading formation templates...</p>
            ) : (
              formations.map(f => {
                const isSelected = f.id === selectedFormationId;
                const isDefault = DEFAULT_FORMATIONS.some(def => def.id === f.id);

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFormationId(f.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#182234] border-sky-500 ring-1 ring-sky-500/50 shadow-md'
                        : 'bg-[#121620] hover:bg-[#161c28] border-[#222834]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5 ${
                        f.side === 'offense' 
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' 
                          : f.side === 'defense'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
                          : 'bg-indigo-950/80 text-indigo-300 border border-indigo-600/40'
                      }`}>
                        {f.side === 'offense' ? 'OFF' : f.side === 'defense' ? 'DEF' : 'ALL'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {f.personnel || (f.side === 'offense' ? 'Offense' : 'Defense')} • {f.players.length} Players
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!isDefault && (
                        <button
                          onClick={(e) => handleDeleteFormation(f, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
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
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm flex items-center gap-1"
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

          {/* RIGHT PREVIEW */}
          <div className="w-1/2 p-6 overflow-y-auto bg-[#10141d] flex flex-col justify-between">
            {selectedFormation ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    selectedFormation.side === 'offense'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-600/40'
                      : selectedFormation.side === 'defense'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600/40'
                      : 'bg-indigo-950/80 text-indigo-300 border-indigo-600/40'
                  }`}>
                    {selectedFormation.side} Template
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {selectedFormation.players.length} Players
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mb-1">
                  {selectedFormation.name}
                </h3>
                {selectedFormation.description && (
                  <p className="text-xs text-slate-400 mb-4">
                    {selectedFormation.description}
                  </p>
                )}

                {/* MINI PLAYER ROSTER MAP */}
                <div className="border border-[#232936] rounded-xl p-3 bg-[#0d1017]">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    Player Alignments
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
              <div className="pt-6 border-t border-[#232936] mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInitiateApply(selectedFormation)}
                  className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
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
