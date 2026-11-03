# Feature Inventory

Comprehensive catalog of capabilities and features supported in the Football Playbook & Philosophy App on Antigravity.

## Core Features & Capabilities

- **Architecture & Data Schema (Spec 1)**:
  - Normalized 0-1000 x 700 field coordinate system
  - Type-safe Player schema with customizable shape (`round`, `square`, `rounded_square`, `none` / bare text), labels, assignments, coaching keys
  - PathAction vector engine schema (pass_route, run_block, motion, pull_block, curved/segmented points, markers)
  - Play model with formationOffense, frontDefense, category, tags, situation, notes (qbRead, lineBlocking, philosophyReason)
  - PlaybookFile collection model (v1.0.0) with philosophy summaries
  - LocalStorage persistence with import/export (JSON and SVG)

- **Vector Engine & Chalkboard SVG Canvas (Spec 2)**:
  - Responsive SVG `<viewBox="0 0 1000 700">` chalkboard rendering (`#1a1f26`)
  - Football field layout: Yard lines, 5-yard increments, hash marks, Line of Scrimmage (LOS)
  - Reusable `<defs>` SVG markers: `#arrow` (pass routes), `#tbar` (run blocks), `#dot` (motion/endpoints), `#pull-tbar`
  - Advanced Catmull-Rom to Cubic Bézier spline engine ($C^1$ continuity) with tension parameter $\alpha = 0.5$
  - Sharp Cut break geometry ($C^0$ continuity) preserving crisp directional breaks on plants, digs, outs, and posts
  - Standalone `bezier-math.js` / `bezier-math.ts` and `RouteDrawer.js` / `RouteDrawer.ts` modules
  - Shift + Click interactive creation of sharp break waypoints during route and block drawing
  - Waypoint visual differentiation: Diamonds for sharp cuts with "CUT" label, circles for smooth splines
  - In-canvas and inspector toggle for toggling between smooth arcs ($C^1$) and sharp cuts ($C^0$)
  - Multi-mode switcher:
    - Mode 1: Select / Move (Drag players, reposition waypoints, edit assignments)
    - Mode 2: Draw Route (Click player -> click waypoints -> Enter/Double-click to finish with Arrowhead)
    - Mode 3: Draw Block (Multi-point decomposed block tracks -> Enter/Double-click to finish with T-Bar)
    - Mode 4: Draw Motion (Click player -> waypoints -> Finish with Motion styling)
  - Full Block Vector Decomposition (Identical to Routes):
    - Multi-point waypoint drawing for pull blocks, fold tracks, combo climb releases, and kick-out angles.
    - Full Catmull-Rom spline arcs ($C^1$) and Shift+Click sharp plant breaks ($C^0$) with terminal T-Bar alignment.
    - In-canvas interactive decomposition: Clicking anywhere along a selected block or route vector inserts a new waypoint at that coordinate.
    - Inspector Panel Waypoints Manager: Interactive "+ Decompose Path / Add Waypoint" button, point deletion, and smooth/sharp toggle per waypoint.
  - Dedicated Build Mode vs View Mode Separation:
    - Build Mode: Clean, unobstructed play building where hovering does not display any blocking overlay; clicking players opens the dedicated Side Annotation Form for configuring assignments, notes, and coaching keys; quick player roster in side panel.
    - View Mode: Review & presentation mode where hovering over any player displays the Thought Partner interactive explanation overlay (badge, assignment, technique, coaching cues) and illuminates associated route vectors with glowing highlights.
    - Dual mode toggles in both Top Toolbar and Left Mode Switcher with real-time status cues and 1-click mode switching.
  - Thought Partner Interactive Hover: Floating assignment tooltip overlay with player badge, assignment title, assignment notes, and coaching keys in View Mode
  - Drag-and-drop repositioning with live coordinate updates and bounded field positioning

- **Theme Engine & Light Mode (Whiteboard) Support**:
  - Global theme switcher supporting Dark Mode (Classic Slate Chalkboard) and Light Mode (Clean Coaching Whiteboard).
  - One-click Sun/Moon toggle in Top Toolbar with automatic persistence to browser `localStorage` (`football_theme`) and HTML root class synchronization.
  - Whiteboard canvas field rendering (`.chalkboard-bg-light`) with high-contrast yard lines, numbers, hashes, LOS, and 1st down markers.
  - Fully reactive light mode styling across Toolbar, ModeSwitcher, InspectorPanel, and game planning matrix cards.

- **Custom Color Picking & Node Shape Geometry for Players & Lines**:
  - Player Node Shape Selector:
    - 4 selectable node shape profiles per player: `round` (classic circle), `square` (traditional block), `rounded_square` (modern squircle), and `none` (bare text label).
    - `none` shape renders cleanly as bare high-contrast text in player's schematic/custom color with an invisible responsive hit box (`fill="transparent"`) for seamless click, drag-and-drop, and hover detection.
    - Subtle dashed bounding rectangle on selection and dashed tooltip badge for bare text players.
  - Multi-Parameter Player Color Engine (Spec: 3 Color Parameters + Optional Hover Color):
    - **Letter Color**: Customizable position label / text color (defaults to high-contrast white `#ffffff` against black fill, or `#000000` when bare text).
    - **Node Color (Border)**: Customizable perimeter outline/stroke color (defaults to pure black `#000000` with no shade).
    - **Fill Color (Interior)**: Customizable node body background color (defaults to pure black `#000000` with no shade, with 1-click 'None' transparent fill option).
    - **Hover Color (Optional)**: Optional interactive accent color highlighting the player's border and halo on canvas hover in both build and view modes.
    - **Default Black Setting**: All player node and fill geometries default to pure solid black `#000000` with no shade. 1-click "Default Black" quick-reset button restores the solid black standard instantly.
    - Comprehensive swatches for all 4 parameters plus native HTML5 color pickers (`<input type="color" />`).
    - Synchronized live preview across chalkboard canvas nodes, Thought Partner hover tooltip badges, inspector header badges, and offensive/defensive roster lists.
  - Vector Line & Terminal Marker Color Picker:
    - Custom color picking for pass routes, run blocks, pull blocks, and motion tracks with 11 football concept swatches and custom color picker.
    - Dynamic SVG `<marker>` generation per action (`arrow-${id}`, `tbar-${id}`, `dot-${id}`) ensuring terminal arrowheads and perpendicular T-Bars match the custom stroke color.
    - 1-click "Reset Default" to revert back to schematic role defaults.

- **Philosophy & Game Planning Companion (Spec 3)**:
  - Strategy Tagging Matrix with colored badges:
    - Primary Run Concept (Inside Zone, Split-Zone Read, Pin & Pull, Fold Trap) - Amber (`#f59e0b`)
    - Counter-Action (Pop/Glance, Weakside Boot/Leak, Play-Action Seam, Jet Sweep) - Cyan (`#06b6d4`)
    - Target Defensive Front (3-5 Odd, 3-4 Over, 4-2-5 Nickel, 4-3 Under) - Rose (`#f43f5e`)
    - Situation tags ("1st & 10", "Red Zone", "Aggressive LB flow", etc.)
  - Default Shotgun Wishbone Preset Payload:
    - 21/22 Personnel Wishbone system vs 3-5 Odd front
    - Complete offensive lineup (QB, X, LT, LG, C, RG, RT, Y, F, H, Z)
    - Complete defensive front (Nose, 4i DEs, Will, Mike, Sam, Corners, Safeties)
    - Full actions (Glance route, Seam route, Speed flat, Zone run track, mesh read)
  - Additional Presets:
    - 11 Personnel Gun Trey - Split Zone Boot vs 3-4 Over
    - 12 Personnel Pistol - Counter Trey vs 4-2-5 Nickel
  - Thought Partner Philosophy Inspector:
    - QB Read progression breakdown
    - Offensive Line blocking rules & combo assignments
    - Schematic Philosophy rationale ("Why this beats this front")
    - Run-Fit Checker & Situation Matrix viewer

- **File & State Management**:
  - Export Play as standalone JSON
  - Export Playbook as comprehensive JSON
  - Export Diagram as high-res standalone SVG
  - Import JSON with validation
  - Reset & Duplicate play functionality

- **Firebase NoSQL Cloud Persistence & Playbook Library (Spec 4)**:
  - Auth-free direct access via Firebase JS SDK (`firebase/app`, `firebase/firestore`)
  - Configurable Vite environment credentials (`.env.example` with fallback/demo modes)
  - Full CRUD persistence service layer (`src/services/playbookDb.ts`):
    - `savePlay`, `fetchPlay`, `fetchAllPlays`, `fetchPlaysByCategory`, `fetchPlaysByTag`, `deletePlay`
    - `saveFormation`, `fetchFormations`, `deleteFormation`
    - `seedDefaultPresets` (1-click cloud seeding of Wishbone, Boot, and Counter Trey presets)
  - Playbook Library Drawer (`PlayLibraryModal.tsx`):
    - Triggered via top toolbar "My Playbook" button with real-time play counter
    - Strategy Badges display: Run Concept (Amber `#f59e0b`), Counter / PA Action (Cyan `#06b6d4`), Defensive Front (Rose `#f43f5e`)
    - Dynamic filter bar: Category switcher (`run`, `pass_action`, `rpo`, `screen`, `blitz_pickup`) and clickable strategy tags (`#3-5-counter`, `#zone-read`, etc.)
    - Full search across play names, formations, fronts, and coaching philosophy concepts
    - Direct card actions: Load onto Chalkboard, Duplicate, and Delete with live synchronization
  - Base Formation Templates Switcher (`FormationSwitcherModal.tsx`):
    - Save current chalkboard alignment as a new reusable base formation template
    - Scope selection: Offense only, Defense only, or Both
    - Apply existing formation templates to canvas with intelligent route retention (preserves route vectors aligned with players) or clean reset confirmation
    - Default formation presets (Shotgun Wishbone 21 Pers, 3-5 Odd Front, 11 Personnel Gun Trey, 3-4 Over, Pistol 12 Ace Wing, 4-2-5 Nickel)
  - Real-Time Cloud Sync Feedback (`Toolbar.tsx`):
    - "Save to Cloud" button with multi-state visual feedback (Idle -> Saving -> Saved checkmark -> Error retry)
    - Graceful offline / unconfigured fallback with non-intrusive alert toasts preserving full canvas functionality

