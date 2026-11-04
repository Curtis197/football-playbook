import React, { useRef, useState, useEffect } from 'react';
import type { Play, AppMode, Theme } from '../types/playbook';
import {
  Download,
  Upload,
  Layers,
  FileCode,
  Image as ImageIcon,
  BookOpen,
  Cloud,
  Check,
  RefreshCw,
  AlertCircle,
  Users,
  Shield,
  Eye,
  PenTool,
  Sun,
  Moon,
  ChevronDown,
  Zap
} from 'lucide-react';

export type CloudSyncStatus = 'idle' | 'saving' | 'saved' | 'error';
export type CloudSaveTarget = 'play' | 'offense' | 'defense' | 'playbook';

interface ToolbarProps {
  currentPlay: Play;
  allPlays: Play[];
  appMode?: AppMode;
  onSetAppMode?: (mode: AppMode) => void;
  theme?: Theme;
  onToggleTheme?: () => void;
  onExportSvg: () => void;
  onExportPlayJson: () => void;
  onExportPlaybookJson: () => void;
  onImportJson: (jsonString: string) => void;
  onOpenSituationMatrix: () => void;
  onOpenPlayLibrary?: () => void;
  onOpenFormations?: () => void;
  onSaveToCloud?: () => void;
  onSaveToCloudOption?: (target: CloudSaveTarget) => void;
  cloudSyncStatus?: CloudSyncStatus;
}

// Closes a popup menu on an outside click or Escape
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close, ref]);
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentPlay,
  allPlays,
  appMode = 'build',
  onSetAppMode,
  theme = 'dark',
  onToggleTheme,
  onExportSvg,
  onExportPlayJson,
  onExportPlaybookJson,
  onImportJson,
  onOpenSituationMatrix,
  onOpenPlayLibrary,
  onOpenFormations,
  onSaveToCloud,
  onSaveToCloudOption,
  cloudSyncStatus = 'idle'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cloudMenuRef = useRef<HTMLDivElement | null>(null);
  const fileMenuRef = useRef<HTMLDivElement | null>(null);
  const [isCloudMenuOpen, setIsCloudMenuOpen] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const isLight = theme === 'light';
  const isView = appMode === 'view';

  useDismiss(isCloudMenuOpen, () => setIsCloudMenuOpen(false), cloudMenuRef);
  useDismiss(isFileMenuOpen, () => setIsFileMenuOpen(false), fileMenuRef);

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

  const handleSelectSaveTarget = (target: CloudSaveTarget) => {
    setIsCloudMenuOpen(false);
    if (onSaveToCloudOption) {
      onSaveToCloudOption(target);
    } else if (onSaveToCloud) {
      onSaveToCloud();
    }
  };

  // One skin for the plain buttons: slate-500 edges stay visible (3:1) on both header surfaces
  const plainButton = `flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border shadow-sm transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 ${
    isLight
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-500 focus-visible:ring-sky-700'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-500 focus-visible:ring-sky-400'
  }`;
  const iconTone = (tone: 'sky' | 'amber' | 'rose' | 'purple' | 'emerald' | 'cyan' | 'indigo') => {
    const shades: Record<string, [string, string]> = {
      sky: ['text-sky-700', 'text-sky-400'],
      amber: ['text-amber-700', 'text-amber-400'],
      rose: ['text-rose-700', 'text-rose-400'],
      purple: ['text-purple-700', 'text-purple-400'],
      emerald: ['text-emerald-700', 'text-emerald-400'],
      cyan: ['text-cyan-700', 'text-cyan-400'],
      indigo: ['text-indigo-700', 'text-indigo-400']
    };
    return shades[tone][isLight ? 0 : 1];
  };
  const secondaryText = isLight ? 'text-slate-600' : 'text-slate-400';
  const menuItem = `w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-all cursor-pointer outline-none focus-visible:ring-2 ${
    isLight ? 'hover:bg-slate-100 focus-visible:ring-sky-700' : 'hover:bg-slate-800/80 focus-visible:ring-sky-400'
  }`;
  const menuPanel = `absolute right-0 top-full mt-1.5 rounded-xl shadow-2xl border z-50 p-1.5 ${
    isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#161c27] border-slate-700 text-slate-100'
  }`;

  const renderCloudButton = () => {
    if (!onSaveToCloud && !onSaveToCloudOption) return null;

    if (cloudSyncStatus === 'saving') {
      return (
        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-900 text-sky-100 border border-sky-600 rounded-lg cursor-wait transition-all"
          title="Saving to Firestore..."
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-300" />
          <span>Saving...</span>
        </button>
      );
    }

    if (cloudSyncStatus === 'saved') {
      return (
        <button
          onClick={() => handleSelectSaveTarget('play')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-900 text-emerald-100 border border-emerald-500 rounded-lg shadow-sm transition-all"
          title="Successfully persisted to cloud"
        >
          <Check className="w-3.5 h-3.5 text-emerald-300" />
          <span>Saved to Cloud</span>
        </button>
      );
    }

    if (cloudSyncStatus === 'error') {
      return (
        <button
          onClick={() => handleSelectSaveTarget('play')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-900 text-rose-100 border border-rose-500 rounded-lg hover:bg-rose-800 transition-all"
          title="Cloud write failed (Click to retry)"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-300" />
          <span>Sync Error (Retry)</span>
        </button>
      );
    }

    const targets: { target: CloudSaveTarget; title: string; detail: string; chip: string; tone: 'sky' | 'amber' | 'rose' | 'indigo'; icon: React.ReactNode }[] = [
      { target: 'play', title: 'Save Active Play', detail: `"${currentPlay.name}"`, chip: 'Play', tone: 'sky', icon: <span aria-hidden="true">🏈</span> },
      { target: 'offense', title: 'Save Offense Formation', detail: `"${currentPlay.formationOffense || 'Active Offense'}"`, chip: '11 Players', tone: 'amber', icon: <Zap className="w-3.5 h-3.5" aria-hidden="true" /> },
      { target: 'defense', title: 'Save Defensive Front', detail: `"${currentPlay.frontDefense || 'Active Defense Front'}"`, chip: 'Techniques', tone: 'rose', icon: <Shield className="w-3.5 h-3.5" aria-hidden="true" /> },
      { target: 'playbook', title: 'Save Entire Playbook', detail: 'Sync all playbook concepts to Cloud', chip: `${allPlays.length} Plays`, tone: 'indigo', icon: <Layers className="w-3.5 h-3.5" aria-hidden="true" /> }
    ];

    return (
      <div className="relative inline-flex items-stretch rounded-lg shadow-sm" ref={cloudMenuRef}>
        {/* Main Save Play button */}
        <button
          type="button"
          onClick={() => handleSelectSaveTarget('play')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-800 hover:to-blue-800 text-white rounded-l-lg border-y border-l border-sky-900/40 transition-all active:scale-95"
          title={`Quick Save Play: "${currentPlay.name}" to Cloud`}
        >
          <Cloud className="w-3.5 h-3.5 text-sky-100" />
          <span>Save to Cloud</span>
        </button>

        {/* Dropdown Chevron toggle for target options */}
        <button
          type="button"
          onClick={() => setIsCloudMenuOpen(open => !open)}
          aria-haspopup="menu"
          aria-expanded={isCloudMenuOpen}
          aria-label="Choose what to save to the cloud"
          className={`px-1.5 py-1.5 text-xs font-semibold bg-blue-800 hover:bg-blue-900 text-white rounded-r-lg border border-sky-900/40 transition-all active:scale-95 flex items-center justify-center ${
            isCloudMenuOpen ? 'bg-blue-900 ring-1 ring-sky-300' : ''
          }`}
          title="Choose what to save to Cloud: Active Play, Offensive Formation, Defensive Front, or Playbook"
        >
          <ChevronDown className={`w-3.5 h-3.5 text-sky-100 transition-transform ${isCloudMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isCloudMenuOpen && (
          <div role="menu" className={`${menuPanel} w-72`}>
            <div className={`px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border-b ${secondaryText} ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              Cloud Save Targets
            </div>
            <div className="py-1 space-y-0.5">
              {targets.map(item => (
                <button key={item.target} type="button" role="menuitem" onClick={() => handleSelectSaveTarget(item.target)} className={menuItem}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${isLight ? 'bg-slate-100' : 'bg-slate-800'} ${iconTone(item.tone)}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center justify-between gap-2">
                      <span>{item.title}</span>
                      <span className={`text-[10px] font-semibold ${iconTone(item.tone)}`}>{item.chip}</span>
                    </div>
                    <p className={`text-[11px] truncate ${secondaryText}`}>{item.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const modeButton = (mode: AppMode, label: string, activeClass: string, icon: React.ReactNode, title: string) => {
    const active = appMode === mode;
    return (
      <button
        type="button"
        onClick={() => onSetAppMode?.(mode)}
        aria-pressed={active}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 ${
          isLight ? 'focus-visible:ring-sky-700' : 'focus-visible:ring-sky-400'
        } ${
          active
            ? `${activeClass} text-white shadow-sm`
            : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
        }`}
        title={title}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header className={`w-full ${isLight ? 'bg-white border-b border-slate-200 text-slate-800' : 'bg-[#161b22] border-b border-[#30363d] text-slate-200'} px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 shadow-md`}>
      {/* LEFT SECTION: brand and the three places you go to find or manage things */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center font-black text-white text-base shadow-sm" aria-hidden="true">
            🏈
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'} leading-none`}>
              ANTIGRAVITY PLAYBOOK
            </h1>
            <p className={`text-[10px] ${secondaryText} font-medium`}>Scheme & Philosophy Engine</p>
          </div>
        </div>

        {onOpenPlayLibrary && (
          <button
            type="button"
            onClick={onOpenPlayLibrary}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 ${
              isLight
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-700 focus-visible:ring-sky-700'
                : 'bg-[#1f2633] hover:bg-[#283244] text-sky-300 border-sky-500 focus-visible:ring-sky-400'
            }`}
            title="Open Playbook Library & Cloud Repository"
          >
            <Layers className={`w-3.5 h-3.5 ${iconTone('sky')}`} aria-hidden="true" />
            <span>My Playbook</span>
            <span className={`${isLight ? 'bg-sky-100 text-sky-900 border-sky-700' : 'bg-sky-950 text-sky-200 border-sky-600'} text-[10px] px-1.5 rounded-full border`}>
              {allPlays.length}
            </span>
          </button>
        )}

        {onOpenFormations && (
          <button type="button" onClick={onOpenFormations} className={plainButton} title="Open Base Formation Templates">
            <Users className={`w-3.5 h-3.5 ${iconTone('amber')}`} aria-hidden="true" />
            <span>Formations</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSituationMatrix}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          title="Open the Game Plan Matrix: run-fit checker and situational call sheet"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Game Plan</span>
        </button>
      </div>

      {/* RIGHT SECTION: mode, theme, cloud, files */}
      <div className="flex flex-wrap items-center gap-2">
        {onSetAppMode && (
          <div
            role="group"
            aria-label="Mode"
            className={`flex items-center p-1 rounded-lg border shadow-inner ${isLight ? 'bg-slate-100 border-slate-500' : 'bg-[#0d1117] border-slate-500'}`}
          >
            {modeButton('build', 'Build', 'bg-sky-700', <PenTool className="w-3.5 h-3.5" aria-hidden="true" />, 'Build Mode: draw plays, move players and edit annotations')}
            {modeButton('view', 'View', 'bg-emerald-700', <Eye className="w-3.5 h-3.5" aria-hidden="true" />, 'View Mode: read-only. Hover players to read assignments and coaching keys')}
          </div>
        )}

        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm outline-none focus-visible:ring-2 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-500 focus-visible:ring-sky-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-500 focus-visible:ring-sky-400'
            }`}
            title={isLight ? 'Switch to Dark Mode (Chalkboard)' : 'Switch to Light Mode (Whiteboard)'}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" aria-hidden="true" /> : <Sun className="w-4 h-4 text-amber-400" aria-hidden="true" />}
          </button>
        )}

        {renderCloudButton()}

        {/* FILE MENU: exports and import */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            onClick={() => setIsFileMenuOpen(open => !open)}
            aria-haspopup="menu"
            aria-expanded={isFileMenuOpen}
            className={plainButton}
            title="Export or import plays"
          >
            <FileCode className={`w-3.5 h-3.5 ${iconTone('purple')}`} aria-hidden="true" />
            <span>File</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {isFileMenuOpen && (
            <div role="menu" className={`${menuPanel} w-64`}>
              <button type="button" role="menuitem" className={menuItem} onClick={() => { setIsFileMenuOpen(false); onExportPlayJson(); }}>
                <Download className={`w-3.5 h-3.5 mt-0.5 ${iconTone('sky')}`} aria-hidden="true" />
                <div><div className="font-bold">Export active play</div><p className={`text-[11px] ${secondaryText}`}>JSON file of this play</p></div>
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => { setIsFileMenuOpen(false); onExportPlaybookJson(); }}>
                <BookOpen className={`w-3.5 h-3.5 mt-0.5 ${iconTone('indigo')}`} aria-hidden="true" />
                <div><div className="font-bold">Export full playbook</div><p className={`text-[11px] ${secondaryText}`}>JSON file of all {allPlays.length} plays</p></div>
              </button>
              <button type="button" role="menuitem" className={menuItem} onClick={() => { setIsFileMenuOpen(false); onExportSvg(); }}>
                <ImageIcon className={`w-3.5 h-3.5 mt-0.5 ${iconTone('cyan')}`} aria-hidden="true" />
                <div><div className="font-bold">Export diagram (SVG)</div><p className={`text-[11px] ${secondaryText}`}>Vector image of the chalkboard</p></div>
              </button>
              <div className={`my-1 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`} />
              <button
                type="button"
                role="menuitem"
                disabled={isView}
                className={`${menuItem} disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={() => { setIsFileMenuOpen(false); fileInputRef.current?.click(); }}
                title={isView ? 'Importing changes your plays, so it is off in View mode' : 'Import a play or playbook JSON file'}
              >
                <Upload className={`w-3.5 h-3.5 mt-0.5 ${iconTone('emerald')}`} aria-hidden="true" />
                <div><div className="font-bold">Import JSON</div><p className={`text-[11px] ${secondaryText}`}>Play or playbook file</p></div>
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
};

export default Toolbar;
