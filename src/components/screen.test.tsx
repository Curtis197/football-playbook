import type { ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlayBar } from './PlayBar';
import { Toolbar } from './Toolbar';
import { ModeSwitcher } from './ModeSwitcher';
import { InspectorPanel } from './InspectorPanel';
import { ChalkboardCanvas } from './ChalkboardCanvas';
import { DEFAULT_FORMATIONS, INITIAL_PLAYBOOK } from '../data/presets';
import type { AppMode, Theme } from '../types/playbook';
import { WISHBONE_ID, preset } from '../test/helpers';

// Server-side rendering in plain Node: no browser. It proves every screen component renders in every theme
// and mode, and pins down the structural promises of the screen (one control per job, read-only View mode).

const noop = () => {};
const play = preset(WISHBONE_ID);
const qb = play.players.find(p => p.side === 'offense' && p.label === 'QB')!;
const THEMES: Theme[] = ['dark', 'light'];
const MODES: AppMode[] = ['build', 'view'];
const count = (html: string, needle: string) => html.split(needle).length - 1;

const playBar = (theme: Theme, isView: boolean) => renderToStaticMarkup(
  <PlayBar
    theme={theme} isView={isView} currentPlay={play} allPlays={INITIAL_PLAYBOOK.plays} formations={DEFAULT_FORMATIONS}
    showGaps currentQBAlignment="shotgun" routeAdaptationMode="player_relative"
    onSelectPlay={noop} onUpdatePlayName={noop} onUpdateCategory={noop} onNewPlay={noop} onDuplicatePlay={noop} onResetCanvas={noop}
    onSelectOffenseFormation={noop} onSelectDefenseFront={noop} onUpdateOffenseFormation={noop} onUpdateDefenseFront={noop}
    onMorphBackfield={noop} onToggleRouteAdaptationMode={noop} onToggleShowGaps={noop} onShiftDefense={noop} onRealignDefense={noop}
    onOpenDefensePackages={noop}
    onOpenRunTemplates={noop} hasBlockPlan={false} canUpdateRunTemplate={false} onSaveRunTemplate={noop} onUpdateRunTemplate={noop} onClearBlocks={noop}
  />
);

const toolbar = (theme: Theme, appMode: AppMode, status: ComponentProps<typeof Toolbar>['cloudSyncStatus'] = 'idle') => renderToStaticMarkup(
  <Toolbar
    currentPlay={play} allPlays={INITIAL_PLAYBOOK.plays} appMode={appMode} onSetAppMode={noop} theme={theme} onToggleTheme={noop}
    onExportSvg={noop} onExportPlayJson={noop} onExportPlaybookJson={noop} onImportJson={noop} onOpenSituationMatrix={noop}
    onOpenPlayLibrary={noop} onOpenFormations={noop} onSaveToCloud={noop} onSaveToCloudOption={noop} cloudSyncStatus={status}
  />
);

const rail = (theme: Theme, appMode: AppMode, withSelection: boolean) => renderToStaticMarkup(
  <ModeSwitcher
    currentMode="select" onSetMode={noop} appMode={appMode} onSetAppMode={noop} theme={theme}
    selectedPlayerId={withSelection ? qb.id : null} selectedActionId={null} onDeleteSelected={noop}
    canUndo canRedo onUndo={noop} onRedo={noop}
  />
);

const inspector = (theme: Theme, appMode: AppMode, withSelection: boolean) => renderToStaticMarkup(
  <InspectorPanel
    currentPlay={play} selectedPlayer={withSelection ? qb : null} selectedAction={null} appMode={appMode} theme={theme}
    onSelectPlayer={noop} onUpdatePlayer={noop} onUpdateAction={noop} onUpdatePlayNotes={noop} onUpdateStrategyMatrix={noop}
    onUpdatePlayFormations={noop} formations={DEFAULT_FORMATIONS}
  />
);

const canvas = (theme: Theme, appMode: AppMode) => renderToStaticMarkup(
  <ChalkboardCanvas
    players={play.players} actions={play.actions} mode="select" appMode={appMode} theme={theme} showGaps
    selectedPlayerId={null} selectedActionId={null} onSelectPlayer={noop} onSelectAction={noop}
    onUpdatePlayerPosition={noop} onAddAction={noop} onUpdateActionPoints={noop} onAddPlayerAtPoint={noop}
  />
);

describe.each(THEMES.flatMap(theme => MODES.map(mode => [theme, mode] as const)))('%s theme, %s mode', (theme, mode) => {
  it('every screen component renders without throwing', () => {
    expect(playBar(theme, mode === 'view')).toContain('Play controls');
    expect(toolbar(theme, mode)).toContain('ANTIGRAVITY PLAYBOOK');
    expect(rail(theme, mode, true)).toContain('<aside');
    expect(inspector(theme, mode, true)).toContain('<aside');
    expect(inspector(theme, mode, false)).toContain('<aside');
    expect(canvas(theme, mode)).toContain('viewBox="0 0 1000 700"');
  });

  it('renders every player on the board', () => {
    const board = canvas(theme, mode);
    for (const p of play.players) expect(board, p.id).toContain(`translate(${p.x}, ${p.y})`);
  });
});

describe('View mode is read-only', () => {
  it('the play bar disables every group that edits the play, but not navigation', () => {
    const view = playBar('dark', true);
    expect(count(view, '<fieldset disabled')).toBe(7);
    expect(view.match(/<select[^>]*aria-label="Active play"[^>]*>/)?.[0]).not.toMatch(/disabled/);
    expect(view).toMatch(/aria-pressed="true"[^>]*>\s*<span>Gaps<\/span>/);
    expect(count(playBar('dark', false), '<fieldset disabled')).toBe(0);
  });

  it('the Inspector says so and disables the forms, while the deselect button stays usable', () => {
    const view = inspector('dark', 'view', true);
    expect(view).toContain('Read-only in View mode');
    expect(inspector('dark', 'build', true)).not.toContain('Read-only in View mode');

    const closeAt = view.indexOf('Close player form');
    const firstFieldset = view.indexOf('<fieldset disabled');
    expect(closeAt).toBeGreaterThan(-1);
    expect(closeAt).toBeLessThan(firstFieldset);

    const insideForm = view.slice(firstFieldset);
    for (const field of ['Position Label', 'Player Node Shape', 'Assignment Title', 'Key Coaching Points']) expect(insideForm).toContain(field);
    expect(count(inspector('dark', 'build', true), '<fieldset disabled')).toBe(0);
  });

  describe('every Inspector tab', () => {
    const tab = (initialTab: 'philosophy' | 'read_flow', appMode: AppMode) => renderToStaticMarkup(
      <InspectorPanel
        currentPlay={play} selectedPlayer={null} selectedAction={null} appMode={appMode} theme="dark" initialTab={initialTab}
        onSelectPlayer={noop} onUpdatePlayer={noop} onUpdateAction={noop} onUpdatePlayNotes={noop} onUpdateStrategyMatrix={noop}
        onUpdatePlayFormations={noop} formations={DEFAULT_FORMATIONS}
      />
    );

    it.each([
      ['philosophy', 'Formation Matchup'],
      ['read_flow', 'QB Read Progression']
    ] as const)('%s: the whole tab sits inside a disabled fieldset in View mode, and an enabled one in Build', (name, marker) => {
      const view = tab(name, 'view');
      expect(view.indexOf('<fieldset disabled')).toBeGreaterThan(-1);
      expect(view.indexOf('<fieldset disabled')).toBeLessThan(view.indexOf(marker));
      expect(count(tab(name, 'build'), '<fieldset disabled')).toBe(0);
    });

    it('the vector form is read-only in View mode, with its header outside the disabled part', () => {
      const html = renderToStaticMarkup(
        <InspectorPanel
          currentPlay={play} selectedPlayer={null} selectedAction={play.actions[0]} appMode="view" theme="dark"
          onSelectPlayer={noop} onUpdatePlayer={noop} onUpdateAction={noop} onUpdatePlayNotes={noop} onUpdateStrategyMatrix={noop}
          onUpdatePlayFormations={noop} formations={DEFAULT_FORMATIONS}
        />
      );
      const fieldset = html.indexOf('<fieldset disabled');
      expect(html.indexOf('Vector Path Inspector')).toBeLessThan(fieldset);
      expect(html.indexOf('Vector Action Type')).toBeGreaterThan(fieldset);
      expect(html.indexOf('Terminal Marker')).toBeGreaterThan(fieldset);
    });

    const vector = (type: 'run_block' | 'pull_block' | 'pass_route' | 'motion', appMode: AppMode, extra: object = {}) => renderToStaticMarkup(
      <InspectorPanel
        currentPlay={play} selectedPlayer={null} appMode={appMode} theme="dark"
        selectedAction={{ id: 'sel', playerId: qb.id, type, endMarker: 'tbar', points: [{ x: 1, y: 1 }, { x: 2, y: 2 }], ...extra }}
        onSelectPlayer={noop} onUpdatePlayer={noop} onUpdateAction={noop} onUpdatePlayNotes={noop} onUpdateStrategyMatrix={noop}
        onUpdatePlayFormations={noop} formations={DEFAULT_FORMATIONS}
      />
    );

    it.each(['run_block', 'pull_block'] as const)('a %s offers the seven block types under the action type', type => {
      const html = vector(type, 'build');
      expect(html).toContain('Block type');
      expect(html.indexOf('Block type')).toBeGreaterThan(html.indexOf('Vector Action Type'));
      expect(html.indexOf('Block type')).toBeLessThan(html.indexOf('Line Color'));
      for (const label of ['Zone', 'Down', 'Seal', 'Kickout', 'Trap', 'Wrap', 'Lead']) expect(html).toContain('>' + label + '<');
    });

    it.each(['pass_route', 'motion'] as const)('a %s has no block type field', type => {
      expect(vector(type, 'build')).not.toContain('Block type');
    });

    it('shows the rule of the chosen block type and keeps the field read-only in View mode', () => {
      const html = vector('run_block', 'view', { blockType: 'zone' });
      expect(html).toContain('<option value="zone" selected');
      expect(html).toContain('first on-the-line defender toward the play side');
      expect(html.indexOf('Block type')).toBeGreaterThan(html.indexOf('<fieldset disabled'));
    });

    it('a line made by a run template shows its block type but cannot be changed here', () => {
      const html = vector('run_block', 'build', { blockType: 'down', assignmentId: 'RT-block' });
      expect(html).toMatch(/aria-label="Block type"[^>]*disabled|disabled[^>]*aria-label="Block type"/);
      expect(html).toContain('Set by the run template');
    });

    it('with nothing selected the player roster is not inside any disabled fieldset', () => {
      const html = renderToStaticMarkup(
        <InspectorPanel
          currentPlay={play} selectedPlayer={null} selectedAction={null} appMode="view" theme="dark" initialTab="inspector"
          onSelectPlayer={noop} onUpdatePlayer={noop} onUpdateAction={noop} onUpdatePlayNotes={noop} onUpdateStrategyMatrix={noop}
          onUpdatePlayFormations={noop} formations={DEFAULT_FORMATIONS}
        />
      );
      expect(html).toContain('Select any player on the chalkboard or roster below');
      expect(count(html, '<fieldset disabled')).toBe(0);
      expect(count(html, `>${qb.label}<`)).toBeGreaterThan(0);
    });
  });

  it('the rail turns off undo/redo and hides delete', () => {
    const view = rail('dark', 'view', true);
    expect(view).toMatch(/aria-label="Undo"[^>]*disabled|disabled[^>]*aria-label="Undo"/);
    expect(view).not.toContain('Delete selected');
    const build = rail('dark', 'build', true);
    expect(build).toContain('Delete selected');
    expect(build).not.toMatch(/aria-label="Undo"[^>]*disabled=""|disabled=""[^>]*aria-label="Undo"/);
  });

  it('the status line announces read-only mode and has no switch-to-build shortcut', () => {
    expect(canvas('dark', 'view')).toContain('Read-only: hover over players');
    expect(canvas('dark', 'view')).not.toContain('Switch to Build');
  });
});

describe('one control per job', () => {
  const screen = (mode: AppMode) =>
    toolbar('dark', mode) + rail('dark', mode, true) + playBar('dark', mode === 'view') + canvas('dark', mode) + inspector('dark', mode, true);

  it.each(MODES)('%s: exactly one Build/View toggle', mode => {
    const html = screen(mode);
    expect(count(html, 'aria-label="Mode"')).toBe(1);
    expect(count(html, '>Build<')).toBe(1);
    expect(count(html, '>View<')).toBe(1);
  });

  it.each(MODES)('%s: exactly one play selector', mode => {
    expect(count(screen(mode), 'aria-label="Active play"')).toBe(1);
  });

  it.each(MODES)('%s: exactly one way into the defense packages, and the old buttons are gone', mode => {
    const html = screen(mode);
    expect(count(html, 'Defensive packages: pre-aligned')).toBe(1);
    expect(html).not.toContain('Defense Fronts');
    expect(html).not.toContain('Fronts Modal');
  });

  it.each(MODES)('%s: one formation picker and one front picker', mode => {
    const html = screen(mode);
    expect(count(html, 'id="offense-formation-select"')).toBe(1);
    expect(count(html, 'id="defense-front-select"')).toBe(1);
  });

  it('the top bar no longer carries play-level controls', () => {
    const html = toolbar('dark', 'build');
    for (const gone of ['Rename play', 'Duplicate current play', 'Create blank play', 'Active play']) expect(html).not.toContain(gone);
  });
});

describe('the board is never covered or cropped', () => {
  it('has no absolutely positioned bars over the field', () => {
    for (const mode of MODES) expect(canvas('dark', mode)).not.toMatch(/class="[^"]*absolute (top|bottom)-/);
  });

  it('sizes itself from both the available width and height', () => {
    const html = canvas('dark', 'build');
    expect(html).toContain('container-type:size');
    expect(html).toContain('100cqw');
    expect(html).toContain('100cqh');
  });
});

describe('tool shortcuts on the rail', () => {
  it('each tool button announces its key and shows it in the tooltip', () => {
    const html = rail('dark', 'build', false);
    for (const [name, key] of [['Select', 'V'], ['Route', 'R'], ['Block', 'B'], ['Motion', 'M'], ['Offense', 'O'], ['Defense', 'D']]) {
      expect(html, name).toContain(`aria-keyshortcuts="${key}"`);
    }
    expect(html).toContain('(V)');
  });
});

describe('accessibility basics', () => {
  it('icon-only controls have names', () => {
    const html = playBar('dark', false) + rail('dark', 'build', true);
    for (const label of ['Reset play to its original template', 'Re-align all defenders', 'Undo', 'Redo']) {
      expect(html, label).toContain(`aria-label="${label}"`);
    }
  });

  it('the play bar\'s selects are all labelled', () => {
    const html = playBar('dark', false);
    expect(html).toContain('aria-label="Active play"');
    expect(html).toContain('aria-label="Play category"');
    expect(html).toContain('for="offense-formation-select"');
    expect(html).toContain('for="defense-front-select"');
  });

  it('menus say they are menus and report whether they are open', () => {
    const html = toolbar('dark', 'build');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
  });

  it('the Matchup disclosure is wired to the region it controls', () => {
    const html = playBar('dark', false);
    expect(html).toContain('aria-controls="matchup-controls"');
    expect(html).toContain('id="matchup-controls"');
  });
});

describe('cloud button states', () => {
  it.each(['idle', 'saving', 'saved', 'error'] as const)('renders when %s', status => {
    expect(toolbar('light', 'build', status).length).toBeGreaterThan(0);
  });

  it('only the idle state offers the save-target menu', () => {
    expect(toolbar('dark', 'build', 'idle')).toContain('Choose what to save to the cloud');
    expect(toolbar('dark', 'build', 'saving')).not.toContain('Choose what to save to the cloud');
  });
});
