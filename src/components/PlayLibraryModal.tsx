import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Play, PlayCategory } from '../types/playbook';
import { 
  fetchAllPlays, 
  deletePlay, 
  savePlay, 
  seedDefaultPresets
} from '../services/playbookDb';
import { isFirebaseConfigured } from '../services/firebase';
import { 
  X, 
  Search, 
  Filter, 
  Cloud, 
  CloudOff, 
  Trash2, 
  Copy, 
  Play as PlayIcon, 
  Sparkles, 
  RefreshCw,
  Tag,
  Shield,
  Zap,
  Activity,
  Layers,
  Target,
  Users
} from 'lucide-react';

interface PlayLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayId: string;
  onSelectPlay: (play: Play) => boolean | void;
  onDuplicatePlay: (play: Play) => void;
  onDeletePlay: (playId: string) => void;
  localPlays: Play[];
  onPlayListChanged?: () => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const generateDuplicatePlayId = () => `play_${Date.now()}`;

export const PlayLibraryModal: React.FC<PlayLibraryModalProps> = ({
  isOpen,
  onClose,
  currentPlayId,
  onSelectPlay,
  onDuplicatePlay,
  onDeletePlay,
  localPlays,
  onPlayListChanged,
  showNotification
}) => {
  const [remotePlays, setRemotePlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlayCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load all plays from Firestore (or fallback to local)
  const loadPlays = useCallback(async () => {
    setIsLoading(true);
    setCloudError(null);
    try {
      const plays = await fetchAllPlays();
      setRemotePlays(plays);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to query remote database';
      console.warn('[PlayLibraryModal] Cloud fetch error:', errorMsg);
      setCloudError(
        isFirebaseConfigured
          ? `Cloud sync notice: ${errorMsg}. Displaying local browser plays.`
          : 'Firebase credentials not configured in .env. Showing local plays library.'
      );
      // Fallback to local plays
      setRemotePlays(localPlays);
    } finally {
      setIsLoading(false);
    }
  }, [localPlays]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void loadPlays();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadPlays]);

  // Combine all plays: merge all remote cloud plays and local plays so all cloud plays are visible
  const displayPlays = useMemo(() => {
    const map = new Map<string, Play>();
    localPlays.forEach(p => map.set(p.id, p));
    remotePlays.forEach(p => map.set(p.id, p));
    const list = Array.from(map.values());

    return list.filter(play => {
      // Category filter
      if (selectedCategory !== 'all' && play.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag && !play.tags?.includes(selectedTag)) {
        return false;
      }
      // Search query (name, tags, concepts, personnel, alignment, scheme)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = play.name.toLowerCase().includes(query);
        const matchesCategory = play.category.toLowerCase().includes(query);
        const matchesRun = play.primaryRunConcept?.toLowerCase().includes(query) ?? false;
        const matchesPass = play.primaryPassConcept?.toLowerCase().includes(query) ?? false;
        const matchesPersonnel = play.personnel?.toLowerCase().includes(query) ?? false;
        const matchesAlignment = play.receiverAlignment?.toLowerCase().includes(query) ?? false;
        const matchesCounter = play.counterAction?.toLowerCase().includes(query) ?? false;
        const matchesFront = play.frontDefense?.toLowerCase().includes(query) ?? false;
        const matchesTags = play.tags?.some(t => t.toLowerCase().includes(query)) ?? false;
        return matchesName || matchesCategory || matchesRun || matchesPass || matchesPersonnel || matchesAlignment || matchesCounter || matchesFront || matchesTags;
      }
      return true;
    });
  }, [remotePlays, localPlays, selectedCategory, selectedTag, searchQuery]);

  // Extract all unique tags across all available plays
  const allUniqueTags = useMemo(() => {
    const map = new Map<string, Play>();
    localPlays.forEach(p => map.set(p.id, p));
    remotePlays.forEach(p => map.set(p.id, p));
    const pool = Array.from(map.values());
    const tagsSet = new Set<string>();
    pool.forEach(p => p.tags?.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [remotePlays, localPlays]);

  // Handle Seeding Default Presets to Firestore
  const handleSeedPresets = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDefaultPresets();
      showNotification(`Successfully seeded ${result.playsCount} preset plays to Firestore!`, 'success');
      setCloudError(null);
      await loadPlays();
      if (onPlayListChanged) onPlayListChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seeding failed';
      showNotification(`Seeding error: ${msg}`, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Play Deletion
  const handleDelete = async (play: Play, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete play "${play.name}"?`)) {
      try {
        await deletePlay(play.id);
        showNotification(`Deleted play "${play.name}" from database`, 'info');
      } catch (err) {
        console.warn('Could not delete from Firestore:', err);
      }
      onDeletePlay(play.id);
      setRemotePlays(prev => prev.filter(p => p.id !== play.id));
      if (onPlayListChanged) onPlayListChanged();
    }
  };

  // Handle Play Duplication
  const handleDuplicate = async (play: Play, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: Play = {
      ...play,
      id: generateDuplicatePlayId(),
      name: `${play.name} (Copy)`
    };
    try {
      await savePlay(duplicated);
      showNotification(`Duplicated play "${duplicated.name}"`, 'success');
    } catch (err) {
      console.warn('Cloud duplicate warning:', err);
    }
    onDuplicatePlay(duplicated);
    setRemotePlays(prev => [duplicated, ...prev]);
    if (onPlayListChanged) onPlayListChanged();
  };

  // Handle Play Selection
  const handleSelect = (play: Play) => {
    if (onSelectPlay(play) === false) return;
    showNotification(`Loaded "${play.name}" onto Chalkboard`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-[#12161f] border border-[#30363d] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-black tracking-tight text-white">
                  PLAYBOOK LIBRARY & REPOSITORY
                </h2>
                {isFirebaseConfigured ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <Cloud className="w-3 h-3" />
                    Cloud Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full" title="Add Firebase keys to .env to enable direct cloud persistence">
                    <CloudOff className="w-3 h-3" />
                    Local / Offline Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Explore, duplicate, and load schemes, RPOs, and counter-actions onto your chalkboard canvas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedPresets}
              disabled={isSeeding}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg border border-emerald-500/40 shadow-sm transition-all"
              title="Populate Firestore with default Wishbone, Boot, and Counter Trey schemes"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-200 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Presets'}</span>
            </button>

            <button
              onClick={loadPlays}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              title="Refresh Plays"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all"
              title="Close Library"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CLOUD ERROR / DEMO BANNER */}
        {cloudError && (
          <div className="bg-amber-950/40 border-b border-amber-800/40 px-6 py-2.5 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{cloudError}</span>
            </div>
            <button
              onClick={handleSeedPresets}
              className="underline text-amber-300 hover:text-amber-100 text-xs font-semibold ml-4"
            >
              Seed Default Plays Now
            </button>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="px-6 py-3.5 border-b border-[#2d333b] bg-[#141820] flex flex-wrap items-center justify-between gap-3">
          {/* SEARCH BOX */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by play name, scheme, front, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-sky-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Cat:
            </span>
            {(['all', 'run', 'pass_dropback', 'pass_action', 'rpo', 'screen', 'blitz_pickup'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all uppercase ${
                  selectedCategory === cat
                    ? 'bg-sky-600 border-sky-400 text-white shadow-sm'
                    : 'bg-[#1a1f29] border-[#30363d] text-slate-400 hover:text-slate-200 hover:bg-[#222936]'
                }`}
              >
                {cat === 'all' ? 'All' : cat === 'pass_dropback' ? 'Pass' : cat.replace('_', ' ')}
              </button>
            ))}

            {(selectedCategory !== 'all' || selectedTag || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="text-[11px] text-rose-400 hover:text-rose-200 underline font-semibold ml-2 transition-colors whitespace-nowrap"
              >
                Reset Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* TAGS FILTER BAR */}
        {allUniqueTags.length > 0 && (
          <div className="px-6 py-2 border-b border-[#2d333b] bg-[#0f131a] flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-slate-400 font-medium flex-shrink-0 mr-1">Tags:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded-full bg-rose-900/60 text-rose-300 border border-rose-600/50 flex items-center gap-1 font-semibold"
              >
                Clear Tag Filter ✕
              </button>
            )}
            {allUniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-full border transition-all font-mono text-[10px] ${
                  selectedTag === tag
                    ? 'bg-sky-500 text-slate-900 font-bold border-sky-300 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* CARDS GRID */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0c1017]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-xs">Querying Firestore database...</p>
            </div>
          ) : displayPlays.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400 border border-dashed border-slate-800 rounded-xl p-8 text-center">
              <Layers className="w-10 h-10 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-300">No plays matched your criteria</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing your search query or filters, or seed default playbook presets.
                </p>
              </div>
              <button
                onClick={handleSeedPresets}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Seed Default Presets
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayPlays.map(play => {
                const isActive = play.id === currentPlayId;

                return (
                  <div
                    key={play.id}
                    onClick={() => handleSelect(play)}
                    className={`group relative flex flex-col justify-between rounded-xl p-4 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#162030] border-sky-500/80 shadow-lg shadow-sky-950/50 ring-1 ring-sky-500/50'
                        : 'bg-[#131722] hover:bg-[#181d2a] border-[#252b37] hover:border-slate-600 shadow-sm'
                    }`}
                  >
                    {/* CARD TOP: NAME & CATEGORY */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-slate-900/80 text-slate-300 border-slate-700">
                          {play.category.replace('_', ' ')}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-950/90 border border-sky-500/40 px-2 py-0.5 rounded-full">
                            Active On Board
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                        {play.name}
                      </h3>

                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium line-clamp-1">
                        {play.formationOffense || 'Custom Formation'} vs {play.frontDefense || 'Defensive Front'}
                      </p>

                      {/* SPEC 3 STRATEGY BADGES */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {/* Passing Concept (Indigo badge #6366f1) */}
                        {play.primaryPassConcept && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-indigo-300 bg-indigo-950/70 border-indigo-500/40 shadow-xs"
                            title="Primary Passing Concept"
                          >
                            <Target className="w-2.5 h-2.5 text-indigo-400" />
                            {play.primaryPassConcept.toUpperCase().replace('_', ' ')}
                          </span>
                        )}

                        {/* Personnel Badge (Blue badge #3b82f6) */}
                        {play.personnel && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-blue-300 bg-blue-950/70 border-blue-500/40 shadow-xs"
                            title="Personnel Grouping"
                          >
                            <Users className="w-2.5 h-2.5 text-blue-400" />
                            {play.personnel}P
                          </span>
                        )}

                        {/* Receiver Alignment Badge (Emerald badge #10b981) */}
                        {play.receiverAlignment && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-emerald-300 bg-emerald-950/70 border-emerald-500/40 shadow-xs"
                            title="Receiver Alignment"
                          >
                            <Layers className="w-2.5 h-2.5 text-emerald-400" />
                            {play.receiverAlignment}
                          </span>
                        )}

                        {/* 1. Run Concept (Amber badge #f59e0b) */}
                        {play.primaryRunConcept && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-amber-300 bg-amber-950/70 border-amber-500/40 shadow-xs"
                            title="Primary Run Concept"
                          >
                            <Zap className="w-2.5 h-2.5 text-amber-400" />
                            {play.primaryRunConcept}
                          </span>
                        )}

                        {/* 2. Counter / PA Action (Cyan badge #06b6d4) */}
                        {play.counterAction && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-cyan-300 bg-cyan-950/70 border-cyan-500/40 shadow-xs"
                            title="Counter / Play-Action"
                          >
                            <Activity className="w-2.5 h-2.5 text-cyan-400" />
                            {play.counterAction}
                          </span>
                        )}

                        {/* 3. Defensive Front (Rose badge #f43f5e) */}
                        {play.frontDefense && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border text-rose-300 bg-rose-950/70 border-rose-500/40 shadow-xs"
                            title="Target Defensive Front"
                          >
                            <Shield className="w-2.5 h-2.5 text-rose-400" />
                            {play.frontDefense}
                          </span>
                        )}
                      </div>

                      {/* PHILOSOPHY NOTE SNIPPET */}
                      {play.notes?.philosophyReason && (
                        <p className="text-[11px] text-slate-400 italic mt-2.5 line-clamp-2 bg-[#0d1017] p-2 rounded-lg border border-[#212733]">
                          "{play.notes.philosophyReason}"
                        </p>
                      )}

                      {/* TAGS */}
                      {play.tags && play.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {play.tags.map(t => (
                            <button
                              key={t}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(selectedTag === t ? null : t);
                              }}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                selectedTag === t
                                  ? 'bg-sky-500 text-slate-900 font-bold border-sky-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                              }`}
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CARD FOOTER ACTIONS */}
                    <div className="flex items-center justify-between border-t border-[#232936] pt-3 mt-4">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>{play.players?.length || 0} players</span>
                        <span>•</span>
                        <span>{play.actions?.length || 0} vectors</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleDuplicate(play, e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-all"
                          title="Duplicate Play"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(play, e)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-all"
                          title="Delete Play"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelect(play)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all"
                          title="Load onto Chalkboard"
                        >
                          <PlayIcon className="w-3 h-3 fill-current" />
                          <span>Load</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-[#30363d] bg-[#141822] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Total Plays: <strong className="text-white">{displayPlays.length}</strong></span>
            {selectedTag && (
              <span className="text-sky-400">
                (Filtered by tag: <strong>#{selectedTag}</strong>)
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="text-sky-400">
                (Category: <strong>{selectedCategory}</strong>)
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default PlayLibraryModal;
