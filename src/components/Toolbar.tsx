import React, { useRef } from 'react';
import type { Play, PlayCategory, AppMode } from '../types/playbook';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  PlusCircle, 
  Copy, 
  Layers, 
  FileCode, 
  Image as ImageIcon,
  BookOpen,
  Cloud,
  Check,
  RefreshCw,
  AlertCircle,
  Users,
  Eye,
  PenTool
} from 'lucide-react';

export type CloudSyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ToolbarProps {
  currentPlay: Play;
  allPlays: Play[];
  appMode?: AppMode;
  onSetAppMode?: (mode: AppMode) => void;
  onSelectPlay: (playId: string) => void;
  onUpdatePlayName: (name: string) => void;
  onUpdateCategory: (category: PlayCategory) => void;
  onResetCanvas: () => void;
  onNewPlay: () => void;
  onDuplicatePlay: () => void;
  onExportSvg: () => void;
  onExportPlayJson: () => void;
  onExportPlaybookJson: () => void;
  onImportJson: (jsonString: string) => void;
  onOpenSituationMatrix: () => void;
  onOpenPlayLibrary?: () => void;
  onOpenFormations?: () => void;
  onSaveToCloud?: () => void;
  cloudSyncStatus?: CloudSyncStatus;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPlay,
  allPlays,
  appMode = 'build',
  onSetAppMode,
  onSelectPlay,
  onUpdatePlayName,
  onUpdateCategory,
  onResetCanvas,
  onNewPlay,
  onDuplicatePlay,
  onExportSvg,
  onExportPlayJson,
  onExportPlaybookJson,
  onImportJson,
  onOpenSituationMatrix,
  onOpenPlayLibrary,
  onOpenFormations,
  onSaveToCloud,
  cloudSyncStatus = 'idle'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJson(content);
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-import same file if needed
    e.target.value = '';
  };

  const getCategoryBadgeClass = (cat: PlayCategory) => {
    switch (cat) {
      case 'rpo':
        return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
      case 'run':
        return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
      case 'pass_action':
        return 'bg-sky-900/60 text-sky-300 border-sky-500/50';
      case 'screen':
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50';
      case 'blitz_pickup':
        return 'bg-rose-900/60 text-rose-300 border-rose-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-600';
    }
  };

  const renderCloudButton = () => {
    if (!onSaveToCloud) return null;

    switch (cloudSyncStatus) {
      case 'saving':
        return (
          <button
            disabled
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-900/60 text-sky-200 border border-sky-600/50 rounded-lg cursor-wait transition-all"
            title="Saving to Firestore..."
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Saving...</span>
          </button>
        );
      case 'saved':
        return (
          <button
            onClick={onSaveToCloud}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-900/70 text-emerald-200 border border-emerald-500/50 rounded-lg shadow-sm transition-all animate-in fade-in"
            title="Successfully persisted to cloud"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Saved to Cloud</span>
          </button>
        );
      case 'error':
        return (
          <button
            onClick={onSaveToCloud}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-950/70 text-rose-200 border border-rose-500/50 rounded-lg hover:bg-rose-900/80 transition-all"
            title="Cloud write failed (Click to retry)"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Sync Error (Retry)</span>
          </button>
        );
      case 'idle':
      default:
        return (
          <button
            onClick={onSaveToCloud}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg shadow-sm transition-all active:scale-95 border border-sky-500/40"
            title="Save active play to Firebase Firestore"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-200" />
            <span>Save to Cloud</span>
          </button>
        );
    }
  };

  return (
    <header className="w-full bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200 shadow-md">
      {/* LEFT SECTION: Brand & Play Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white text-base shadow-sm">
            🏈
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              ANTIGRAVITY PLAYBOOK
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Scheme & Philosophy Engine</p>
          </div>
        </div>

        {/* MY PLAYBOOK MODAL TRIGGER BUTTON */}
        {onOpenPlayLibrary && (
          <button
            onClick={onOpenPlayLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#1f2633] hover:bg-[#283244] text-sky-300 border border-sky-500/40 rounded-lg shadow-sm transition-all active:scale-95"
            title="Open Playbook Library & Cloud Repository"
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>My Playbook</span>
            <span className="bg-sky-950 text-sky-300 text-[10px] px-1.5 py-0.2 rounded-full border border-sky-600/40">
              {allPlays.length}
            </span>
          </button>
        )}

        {/* FORMATIONS TEMPLATES MODAL TRIGGER BUTTON */}
        {onOpenFormations && (
          <button
            onClick={onOpenFormations}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg shadow-sm transition-all active:scale-95"
            title="Open Base Formation Templates Switcher"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Formations</span>
          </button>
        )}

        {/* Quick Play Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#0d1117] px-2.5 py-1 rounded-lg border border-[#30363d]">
          <select
            value={currentPlay.id}
            onChange={(e) => onSelectPlay(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-1 max-w-[160px] truncate"
            title="Active Play"
          >
            {allPlays.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#161b22] text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Editable Play Name Input */}
        <input
          type="text"
          value={currentPlay.name}
          onChange={(e) => onUpdatePlayName(e.target.value)}
          title="Click to rename play"
          className="bg-slate-900/80 hover:bg-slate-900 text-xs font-semibold text-slate-100 px-3 py-1.5 rounded-lg border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none w-56 transition-all"
        />

        {/* Category Selector */}
        <select
          value={currentPlay.category}
          onChange={(e) => onUpdateCategory(e.target.value as PlayCategory)}
          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all ${getCategoryBadgeClass(
            currentPlay.category
          )}`}
        >
          <option value="run" className="bg-[#161b22] text-amber-300">Run</option>
          <option value="rpo" className="bg-[#161b22] text-purple-300">RPO</option>
          <option value="pass_action" className="bg-[#161b22] text-sky-300">Play-Action</option>
          <option value="screen" className="bg-[#161b22] text-emerald-300">Screen</option>
          <option value="blitz_pickup" className="bg-[#161b22] text-rose-300">Blitz Pickup</option>
        </select>

        {/* BUILD MODE VS VIEW MODE SEGMENTED TOGGLE */}
        {onSetAppMode && (
          <div className="flex items-center bg-[#0d1117] p-1 rounded-lg border border-[#30363d] ml-1 shadow-inner">
            <button
              type="button"
              onClick={() => onSetAppMode('build')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                appMode === 'build'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Build Mode: Diagram plays, move players, draw routes, and edit annotations on side panel without popup interruptions"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Build Mode</span>
            </button>
            <button
              type="button"
              onClick={() => onSetAppMode('view')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                appMode === 'view'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View Mode: Hover over players on chalkboard to inspect coaching explanations and assignments"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Mode</span>
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SECTION: Cloud Sync, Game Plan Tools, Operations & Exports */}
      <div className="flex items-center gap-2">
        {/* SAVE TO CLOUD BUTTON WITH VISUAL INDICATOR */}
        {renderCloudButton()}

        {/* Situation & Philosophy Matrix */}
        <button
          onClick={onOpenSituationMatrix}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-lg shadow-sm transition-all active:scale-95"
          title="Open Run-Fit & Strategy Matrix"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Game Plan Matrix</span>
        </button>

        {/* Play Operations: New / Duplicate / Reset */}
        <div className="h-5 w-px bg-slate-700 mx-1" />

        <button
          onClick={onNewPlay}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Create blank play"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>New</span>
        </button>

        <button
          onClick={onDuplicatePlay}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Duplicate current play"
        >
          <Copy className="w-3.5 h-3.5 text-sky-400" />
          <span>Duplicate</span>
        </button>

        <button
          onClick={onResetCanvas}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Reset canvas routes & positions to preset default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset</span>
        </button>

        <div className="h-5 w-px bg-slate-700 mx-1" />

        {/* Export SVG */}
        <button
          onClick={onExportSvg}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Export vector chalkboard diagram as SVG"
        >
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>SVG</span>
        </button>

        {/* Export JSON (Play / Playbook) */}
        <div className="relative group">
          <button
            onClick={onExportPlayJson}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
            title="Download play as JSON"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-[#161b22] border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]">
            <button
              onClick={onExportPlayJson}
              className="px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              Export Active Play
            </button>
            <button
              onClick={onExportPlaybookJson}
              className="px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Export Full Playbook
            </button>
          </div>
        </div>

        {/* Import JSON */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
          title="Import JSON play or playbook"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </header>
  );
};

export default Toolbar;
