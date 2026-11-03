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

  - Blank Node Perimeter Vector Origin & Text Clearance Buffer:
    - When player shape is `none` (bare label), vector lines (routes, blocks, motion) dynamically calculate their origin from the blank node perimeter boundary (`startOffset = 18px` along trajectory) using `getBlankNodeOffsetPoint(p0, p1, 18)`.
    - Eliminates line strike-through and intersection through the player letter text.
    - Integrated circular clearance background buffer (`r="15"`) beneath bare text ensuring crossing lines and field hash marks never obscure player labels.
    - Live drawing preview dynamically renders with the same perimeter offset when drawing from a blank node player.
  - Combo & Option Block Continuation Engine:
    - Continuation block vectors can restart directly from an existing block track or terminal T-Bar, enabling authentic Double Team combo releases to linebackers and Option read seals.
    - Schema support: `parentActionId?: string` and `branchType?: 'combo' | 'option'` in `PathAction`.
    - 3 Ergonomic Ways to Restart a Combo/Option Block:
      1. Click anywhere along an existing block line in `draw_block` mode to branch a continuation block from that coordinate.
      2. 1-click on-canvas `+COMBO` trigger button displayed at the terminal waypoint of any selected block.
      3. Dedicated "Combo & Option Block (Restart)" card in Inspector Panel with "+ Restart Block from Terminal T-Bar" button.
    - Visual Combo Junction Marker: Golden circular link node (`r="6"`) at the restart origin connecting parent and child block vectors.

- **Custom Color Picking & Node Shape Geometry for Players & Lines**:
  - Player Node Shape Selector & Default Bare Label Presentation:
    - 4 selectable node shape profiles per player: `round` (classic circle), `square` (traditional block), `rounded_square` (modern squircle), and `none` (bare text label).
    - Default player representation: Set to `none` (no node shape) and pure black 0/0/0 (`#000000`) for both offense and defense, delivering authentic minimalist playbook typography directly on the chalkboard or whiteboard.
    - `none` shape renders cleanly as bare high-contrast text in player's schematic/custom color with an invisible responsive hit box (`fill="transparent"`) for seamless click, drag-and-drop, and hover detection.
    - Subtle dashed bounding rectangle on selection and dashed tooltip badge for bare text players.
  - Multi-Parameter Player Color Engine (Spec: 3 Color Parameters + Optional Hover Color):
    - **Letter Color**: Customizable position label / text color (defaults to pure black 0/0/0 `#000000` for bare text, or high-contrast white `#ffffff` on filled shapes).
    - **Node Color (Border)**: Customizable perimeter outline/stroke color (defaults to pure black 0/0/0 `#000000`).
    - **Fill Color (Interior)**: Customizable node body background color (defaults to transparent when `none`, with 1-click 'None' transparent fill option).
    - **Hover Color (Optional)**: Optional interactive accent color highlighting the player's border and halo on canvas hover in both build and view modes.
    - **Default Black 0/0/0 with No Node**: All unconfigured players for both offense and defense default to bare text (`none`) in pure solid black 0/0/0. 1-click "Default Black" quick-reset button restores this standard instantly.
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

- **Defensive Pre-Alignment, Dynamic Gap Snapping, Load Fronts, and Front Shifting Engine**:
  - Dynamic Offensive Line Structure Analysis (`analyzeOffense`):
    - Identifies Center (C), Left Guard (LG), Right Guard (RG), Left Tackle (LT), Right Tackle (RT), Tight Ends (inline or wings), slot receivers, and boundary receivers.
    - Accurately establishes the Line of Scrimmage (LOS) Y coordinate.
    - Calculates all offensive gaps with exact field X coordinates: Left D, Left C, Left B, Left A, Right A, Right B, Right C, Right D.
    - Evaluates formation strength (Strong side vs Weak side) based on Tight End alignment and receiver distribution.
  - Automatic Defensive Parameter Snapping (`calculateDefensiveAlignmentPosition`):
    - When any defensive player receives a technique/alignment parameter (e.g. `0-Tech`, `1-Tech Weak`, `3-Tech Strong`, `4i-Tech Weak`, `5-Tech Strong`, `7-Tech`, `9-Tech Wide`, `00 Stack`, `10 Stack`, `20 Stack`, `30 Stack`, `40 Stack`, `50 Stack`, `Apex Overhang`, `Press CB`, `Off CB`, `Single-High FS`, `2-High Safety`, `Robber`), the player automatically snaps to their designated coordinate relative to the offense.
    - Resolves relative alignment descriptors (`Strong`, `Weak`) dynamically against the detected offensive strength.
    - Spacious Depth Calibration for Authentic Blocking Schemes:
      - Down Linemen (`dlY = losY - 55`): Pushed 55px off LOS, giving 37px of visible line running room from blank node player boundaries for clean drive blocks, reach angles, and unobstructed terminal T-bar markers.
      - Linebackers (`lbY = losY - 115`): Pushed 115px off LOS (60px behind DL), providing authentic second-level depth for Double Team combo climb releases, fold tracks, and linebacker scrape flows.
      - Apex Overhang / Nickel (`apexY = losY - 80`): Walked-out alley force depth.
      - Defensive Backs: `pressY = losY - 65`, `offCbY = losY - 140`, `robberY = losY - 185`, `twoHighY = losY - 235`, `singleHighY = losY - 275`.
      - Automatic local storage migration seamlessly upgrades legacy cramped wishbone coordinates to the new spacious alignment.
    - Inspector Panel Technique Controller: Categorized tabs (1st Level DL, 2nd Level LB, 3rd Level DB) with quick-select chips, individual defender gap shift buttons (`◀ Shift Gap Left`, `Shift Gap Right ▶`), and re-snap trigger.
  - Offensive Receiver Reference Alignment Engine for DBs (CB/NB) & 9-Technique Perimeter Anchoring:
    - Numbered Receiver Analysis (`#1`, `#2`, `#3` from Outside-In):
      - Dynamically analyzes all eligible perimeter receivers on each side of the center and ranks them from sideline inward: `#1 Outside WR`, `#2 Slot WR`, and `#3 Inner Slot/Wing` for both left and right sides.
      - Maintains accurate receiver indexing across 2x2 Doubles, 3x1 Trips Open, 2x1 Pro-Sets, and condensed bunch packages.
    - Explicit Defender Reference Target & Coverage Leverage (`Player` schema):
      - Extended `Player` model with `alignReferenceTarget?: string` (`#1_wr_left`, `#1_wr_right`, `#2_slot_left`, `#2_slot_right`, `#3_slot_left`, `#3_slot_right`, or offensive player label/id) and `alignLeverage?: AlignmentLeverage` (`head_up`, `inside_shade`, `outside_shade`, `press`, `off_cushion`, `apex`).
      - Cornerbacks (`CB`) automatically anchor to `#1 Receiver` (Press at 2.5 yds depth, Off Cushion at 7 yds depth with inside leverage).
      - Nickelbacks / Slot Defenders (`NB`, `NK`, `Star`, `Slot CB`) automatically anchor to `#2 Slot Receiver` (Press, Off Cushion, or Apex overhang).
      - Automatic re-alignment: Whenever the offensive formation changes or shifts, all anchored defenders adapt their positions dynamically to the new offensive structure while maintaining leverage.
    - Inspector Panel Offensive Reference Controller:
      - Dedicated "Offensive Reference (CB / NB)" control block in the Inspector Panel pre-align section.
      - Includes "Target Player" dropdown (Auto, Numbered Receivers, or specific offensive players) and "Leverage / Depth" dropdown (`Off Cushion (7 yds)`, `Press (2.5 yds)`, `Inside Shade`, `Outside Shade`, `Head-Up`, `Apex Overhang`).
      - Interactive "Anchored" badge and 1-click Re-Snap action with live chalkboard updates.
    - 9-Technique / Wide-9 Edge Rusher Fix:
      - Inline Tight End Proximity Restriction: Enforces strict inline attached proximity (`<= 85px` from Tackle) and explicitly excludes wide receivers (`X`, `Z`, `WR`, `QB`, `RB`, `FB`) from being misclassified as Tight Ends.
      - Eliminates 9-technique defensive ends straying past perimeter receivers out to the sideline (e.g. `x=895`), anchoring Wide-9 rushers strictly 45px outside the Offensive Tackle or 28px outside an attached TE.
  - Load Defense Front Packages (`DefenseFrontModal.tsx`):
    - Load comprehensive 11-player defensive front schemes pre-aligned directly to the offensive alignment:
      - 3-4 Over Front
      - 4-2-5 Nickel Over
      - 3-5 Odd Front (3-3-5 Stack)
      - 4-3 Under Front
      - Mint / Tite Front (Saban/Smart 3-4 Mint)
      - Bear / 46 Front (Covered interior with twin edge rushers)
    - Full breakdown table previewing position, technique, schematic assignment, and calculated (X, Y) coordinates.
  - Defensive Front Shifting & Stemming:
    - Shift Left: Slants and slides all front defenders 1 gap to the left.
    - Shift Right: Slants and slides all front defenders 1 gap to the right.
    - Set Over: Sets 3-tech and overhang to strong side.
    - Set Under: Sets 3-tech and will linebacker to weak side.
    - Pinch: Crashes defensive linemen 1 shade inward towards Center.
    - Fan: Stems defensive linemen outward into wide rush angles.
    - Re-align All: Re-computes and snaps every defender to their designated technique based on current offensive positions.
  - Chalkboard Canvas Gap Overlay & HUD Controls (`ChalkboardCanvas.tsx`):
    - Visual gap badges along the line of scrimmage: `[ D ] [ C ] [ B ] [ A ] (C) [ A ] [ B ] [ C ] [ D ]` with strongside amber highlighting.
    - Formation strength direction banner (`STRONG ➜` / `⬅ STRONG`).
    - Dynamic alignment guidelines connecting selected defenders to their assigned gaps.
    - On-canvas HUD overlay bar for 1-click Gap toggle, Load Defense modal trigger, quick shift buttons, and re-align action.
    - Interactive On-Canvas Formation Dropdown Pickers:
      - 🏈 **Offense Formation Dropdown**: Directly select any offensive formation (e.g. Spread 2x2 Open, Trips Open 3x1, Pro-I 21 Pers, Single Back Ace 12 Pers, Shotgun Bunch 11 Pers, Pistol Diamond 20 Pers, Empty Quads 3x2, Shotgun Wishbone 21 Pers); offensive players instantly update their positions, offensive structure is dynamically re-analyzed, and all existing defensive players automatically re-align to the newly established gaps and strength.
      - 🛡️ **Defense Front Dropdown**: Directly select any defensive front (e.g. 4-3 Over Front, 4-3 Under Front, 3-4 Over Front, 3-5 Odd Front, 4-2-5 Nickel Over, 3-4 Mint Tite, 46 Bear Front); defensive players immediately snap to their designated alignment techniques mapped dynamically against the active offensive formation.
      - Seamless two-way integration with Firebase Firestore `formations` collection and offline presets fallback, supporting both dark mode chalkboard and light mode whiteboard styling.
    - Universal Defensive Technique Auto-Inference (`inferDefenderTechnique`):
      - If an imported or legacy defensive player lacks an explicit `technique` parameter, the engine automatically deduces their role and gap technique from their position label (NT, DT, DE, W, M, S, CB, FS, SS, NK) and relative alignment to the offensive center and strength, guaranteeing zero unaligned defensive players.
    - Update Saved Formation Engine:
      - 1-Click "Update" buttons integrated directly on the Chalkboard Canvas top HUD bar for active offensive formations and active defensive fronts. Saves adjusted positions and techniques directly back to the formation template in Firestore and local state.
      - "Update with Current Canvas" action within `FormationSwitcherModal.tsx` allowing coaches to overwrite existing templates with updated chalkboard positioning.

- **Multi-Target Cloud Save, Scheme Style Categorization & Hierarchical Play-Front Picker**:
  - Multi-Target Cloud Save Engine (`Toolbar.tsx` & `App.tsx`):
    - Split-button dropdown menu with 4 dedicated cloud persistence targets:
      1. 🏈 **Save Active Play**: Persists complete play concept (player positions, Catmull-Rom routes, blocking schemes, QB reads, and notes) to Firestore `plays`.
      2. ⚡ **Save Offensive Formation**: Extracts the 11 offensive positions & assignments from the chalkboard, applies style and labels, and persists to Firestore `formations`.
      3. 🛡️ **Save Defensive Front**: Extracts the 11 defensive positions & alignment techniques from the chalkboard, derives scheme styles, and persists to Firestore `formations`.
      4. 📚 **Save Entire Playbook**: Batch synchronizes all plays in the active playbook to Firebase Firestore.
  - Formation Scheme Style Classification & Optgroup Sorting:
    - Supported offensive styles: `pro_style` (Pro Style / Under Center / Heavy 21P/12P), `spread` (Spread 10P/11P / Doubles / Trips / Bunch / Quads), `old_school` (Triple Option / Wishbone / Diamond 20P).
    - Supported defensive front styles: `even_front` (4-Down Linemen: 4-3 Over, 4-3 Under, 4-2-5 Nickel), `odd_front` (3-Down Linemen: 3-4 Over, 3-5 Odd Stack, Mint/Tite), `heavy_front` (Goal Line / 46 Bear).
    - Chalkboard Canvas Dropdown Optgroups: Both Offense and Defense dropdown pickers organize formations into structured `<optgroup>` sections for rapid schematic navigation.
    - Formation Switcher Modal Filter Tabs (`FormationSwitcherModal.tsx`): Scope tabs (`All`, `Offense`, `Defense`) and style filter pills (`Pro Style`, `Spread`, `Old School` or `Even`, `Odd`, `Heavy`) with real-time counters, colored style badges, and customizable labels on new templates.
  - Hierarchical Game-Planning Concept Flow (`ChalkboardCanvas.tsx`):
    - Integrated 3-step hierarchy on the Chalkboard Canvas top HUD bar:
      1. `Offense Formation` (e.g. Pro-I 21 Pers)
      2. `Play / Concept` (e.g. Pro-I - Veer Option vs 3-5 Odd)
      3. `Target Defensive Front` (e.g. 3-5 Odd, switchable to 4-3 Over, 4-2-5 Nickel, Bear 46)
    - Automatically filters and highlights plays belonging to the selected offensive formation, while still granting instant access to other playbook plays.
    - Allows coaches to instantly stress-test any play concept against any defensive front with automated dynamic gap realignment.

- **Route Adaptation & Vector Relative Translation Engine (`routeAdaptation.ts`)**:
  - Full Vector Relative Translation:
    - When an offensive formation changes, vector routes, block tracks, and motion paths dynamically translate relative to the player ($\Delta x = \text{newX} - \text{oldX}, \Delta y = \text{newY} - \text{oldY}$), moving all waypoints, cut breaks, and terminal markers intact instead of freezing them at initial field coordinates.
    - Prevents vector distortion and preserves authentic route depth, stem angle, and cut geometry across different offensive personnel packages.
    - Dragging a player in select/build mode translates all vector actions belonging to that player smoothly with the drag movement.
  - Receiver Distribution Concept Mapping (#1/#2/#3 Outside):
    - Categorizes offensive skill receivers from the sideline inward:
      - Left of Center: Left #1 (outermost), Left #2 (slot), Left #3 (inner/wing).
      - Right of Center: Right #1 (outermost), Right #2 (slot), Right #3 (inner/wing).
    - When `concept_numbered` mode is chosen, passing routes adapt to the outside-in receiver hierarchy so concepts like Smash, Flood, Mesh, and Dagger map to the corresponding outside and slot receivers of the new formation automatically.
    - Linemen (pass pro, run blocks, pull traps) and backfield players maintain player-relative positional translation.
  - Coach-Controlled Adaptation Mode Switcher:
    - 1-Click HUD Toggle on Chalkboard Canvas top bar: `[🎯 Player-Rel]` vs `[🔢 #123 Concept]`.
    - Enhanced confirmation prompt in `FormationSwitcherModal.tsx`: Allows choosing between `🎯 Keep: Relative to Player`, `🔢 Keep: Concept (#1/#2/#3 Outside)`, or clearing routes.

- **4-Tier Offensive Formation Taxonomy & Backfield Matrix Engine (`offensiveFormationsMatrix.ts` & `FormationSwitcherModal.tsx`)**:
  - Full matrix labeling across 4 core dimensions:
    1. **Backfield Personnel Number** (`21`, `31`, `30`, `20`, `22`, `12`, `11`, `10`, `01`, `00`).
    2. **QB Position** (`Shotgun`, `Pistol`, `Down Center` / Under Center).
    3. **Receiver Alignment** (`2x2`, `3x1`, `2x1`, `3x2`, `4x1`, `1x1`, and bunch clusters).
    4. **Scheme Style** (`Pro Style`, `Spread`, `Old School`).
  - Comprehensive Formation Library:
    - 31 Personnel: Classic Wishbone 31, Delaware Wing-T 31, Maryland I 31, Power-T 31, Pistol Full House 31.
    - 30 Personnel: Wishbone Open 30, Shotgun Diamond 30.
    - 22 Personnel: Power-I Tank 22, Double Wing 22, Pistol Heavy 22.
    - 21 Personnel: Pro-I Classic 21, Strong-I 21, Weak-I 21, Split Backs Pro 21, Shotgun Split 21, Pistol I-Form 21, Pro-I Condensed Bunch 21, Shotgun 21 Wing Bunch.
    - 20 Personnel: Gun 20 Split (Pony), Gun 20 Trips, Gun 20 Pony Bunch, Pistol Diamond 20.
    - 12 Personnel: Single-Back Ace 12, Gun 12 Doubles (Y-Off), Gun 12 Trey Bunch, Pistol 12 Wing, Under Center 12 Wing Bunch.
    - 11 Personnel: Spread 2x2, Spread Trips 3x1, Gun 11 Bunch, Gun 11 Snug Bunch, Pistol 11 Bunch, Under Center 11 Condensed Bunch, Under Center 11 Slot, Pistol 11 Doubles.
    - 10 Personnel: Gun 10 Doubles (4-Wide), Gun 10 Trips Open, Gun 10 Bunch Open, Gun 10 Quads Bunch.
    - Empty Sets (01/00): Empty 3x2, Gun Empty 01 Bunch, Gun Empty 00 5-Wide, Gun Empty 00 Double Bunch.
  - Multi-Facet Formation Picker & Filter Bar (`FormationSwitcherModal.tsx`):
    - Real-time text search query across formation names, personnel, tags, and descriptions.
    - Filter pills for Backfield Personnel (`All`, `31`, `30`, `22`, `21`, `20`, `12`, `11`, `10`, `00/01`).
    - QB Position filter pills (`All`, `Gun`, `Pistol`, `Center`).
    - Receiver Alignment filter pills (`All`, `2x2`, `3x1`, `2x1`, `3x2`, `4x1`, `1x1`).
    - Dedicated Bunch Filter toggle (`⚡ Bunch`).
    - Scheme style filter pills (`Spread`, `Pro Style`, `Old School`).
    - Active filter counter and 1-click Reset Filters action.
  - 1-Click Sync to Firebase Firestore:
    - Dedicated "Sync to Firebase" action in the formation modal header batch-upserts all mapped formation templates directly to Firestore.

- **Dynamic Backfield Alignment Morph Engine (Under Center, Pistol, Shotgun) (`formationBackfield.ts`)**:
  - Orthogonal Backfield Modifier for Surface Formations (Ace, Deuce, Trips, Doubles, Bunch):
    - Allows switching any base formation between Under Center (`down_center`), `pistol`, and `shotgun` dynamically without altering the 5 offensive linemen or perimeter receiver alignments (X, Z, Y, U, slots, wings).
    - Singleback Sets (Ace 12P, Deuce 12P, Spread 11P):
      - Under Center: QB at 1 yard depth (`y=415`), RB at 6-7 yards depth (`y=500`) directly behind QB.
      - Pistol: QB at 3.5 yards depth (`y=440`), RB stacked directly behind at 7 yards depth (`y=520`).
      - Shotgun: QB at 5-6 yards depth (`y=465`), RB offset as sidecar (`x=540, y=465` or `x=420, y=465`).
    - Two-Back Sets (Pro-I, Split Backs, 21P, 22P):
      - Under Center: FB at 4-5 yards (`y=465`), TB at 7-8 yards (`y=525`).
      - Pistol: FB at 4.5 yards (`y=485`), TB deep at 7.5 yards (`y=545`).
      - Shotgun: Dual split sidecars flanking the QB (`x=420` and `x=540`, `y=465`).
    - Relative Vector Action Translation:
      - Automatically calculates $(\Delta x, \Delta y)$ for QB and RB movements to translate any existing pass protection, mesh paths, and route tracks smoothly without distortion.
  - On-Canvas Chalkboard Top HUD Segmented Modifier (`ChalkboardCanvas.tsx`):
    - 3-segment toggle directly beside the Offensive Formation dropdown: `[ 🏈 Center | 🎯 Pistol | ⚡ Gun ]` with real-time active state detection.
  - Formation Switcher Modal Live Variant Selector (`FormationSwitcherModal.tsx`):
    - Interactive "Backfield Snap: [ Under Center | Pistol | Shotgun ]" modifier in the right preview panel, allowing coaches to preview and apply any formation (such as Ace or Deuce) in their preferred snap alignment.

- **Passing Concepts Library & Multi-Dimensional Separation (Stick, Snag, Mesh, Shallow Cross)**:
  - Full Cloud Sync on Startup (`src/App.tsx`):
    - App initialization automatically fetches all cloud formations (`fetchFormations`) and plays (`fetchAllPlays`) from Firestore, merging them with local presets into authoritative state.
    - All cloud formations and plays appear immediately in top HUD selectors and modal drawers without requiring manual load steps.
  - Streamlined Formation Drawer (`src/components/FormationSwitcherModal.tsx`):
    - Replaced multi-row redundant facet filter container with a clean, responsive layout featuring global search and side tabs (`All`, `Offense`, `Defense`), providing full vertical space for formation cards.
  - Unified Play Library Drawer (`src/components/PlayLibraryModal.tsx`):
    - Merges remote cloud plays and local plays by ID to guarantee every cloud item is visible, with quick search and clean category filters.
  - Foundational Passing Schemes (`src/data/passingConcepts.ts`):
    - **Y-Stick Concept** (`Gun 11P Trips - Y-Stick vs 4-3 Over`):
      - 11 Personnel (1 RB, 1 TE, 3 WRs), 3x1 Trips Open receiver alignment.
      - 3-man triangle passing read: #1 Outside MOR Go/Clearout, #2 5-Yard Stick (sit in void), #3 Speed Flat/Arrow to pull Apex defender. Weakside check & release flat, backside single-high alert slant.
    - **Snag / Y-Corner Concept** (`Pro-Set 21P - Snag / Y-Corner vs 3-4 Over`):
      - 21 Personnel (2 RBs, 1 TE, 2 WRs), 2x1 Pro-Set receiver alignment.
      - 3-level perimeter flood: #1 Snag/Mini-Curl (sit at 5-6 yards in curl window), Corner route (stem 8-10 yards, 45° break to sideline pylon), Arrow/Speed Flat out of backfield. High-low on flat defender.
    - **Mesh Concept** (`Single-Back 12P - Mesh vs 4-2-5 Nickel`):
      - 12 Personnel (1 RB, 2 TEs, 2 WRs), 2x2 Ace Wing receiver alignment.
      - Rub concept crossing routes at 4-5 yards depth: Under shallow crosser (setting the mesh) and Over shallow crosser (rubbing underneath trailing defenders), with twin Post-Corner and Wheel/Overhang perimeter options.
    - **Shallow Cross / Drive Concept** (`Pistol 20P - Shallow Cross vs 3-5 Odd`):
      - 20 Personnel (2 RBs, 0 TEs, 3 WRs), 2x2 Diamond receiver alignment.
      - High-low conflict on middle linebacker: #1 Shallow Drag under the Mike LB at 3 yards depth, paired with Dig / Hunt route digging into vacated window at 10 yards depth behind flowing Mike.
  - Multi-Dimensional Filtering in Playbook Library (`src/components/PlayLibraryModal.tsx`):
    - **Category Filters**: Run, Dropback Pass (`pass_dropback`), Play-Action, RPO, Screen, Blitz Pickup.
    - **Concept Family Filter**: All Concepts, Stick, Snag, Mesh, Shallow Cross.
    - **Personnel Filter (Backfield Count)**: All Personnel, 11P, 12P, 20P, 21P, 22P.
    - **Receiver Alignment Filter**: All Alignments, 3x1 Trips, 2x2 Doubles, 2x1 Pro-Set, Bunch, Empty.
    - Strategy Badges on Play Cards:
      - Passing Concept badge (Indigo `#6366f1` with Target icon).
      - Personnel Grouping badge (Blue `#3b82f6` with Users icon).
      - Receiver Alignment badge (Emerald `#10b981` with Layers icon).
    - 1-Click "Reset All Filters" when any multidimensional filter is engaged.
  - Concept-Organized Play Picker on Chalkboard Canvas (`src/components/ChalkboardCanvas.tsx`):
    - Hierarchical optgroup breakdown: `Plays for this Formation`, `Passing Concepts (Stick, Snag, Mesh, Shallow)`, `Run & Option Schemes`, `RPO & Play-Action`, and `Other Playbook Plays`.

- **Cloud Visibility Guarantee & Streamlined Formation/Play Navigation**:
  - Full Cloud Sync on Startup (`src/App.tsx`):
    - App initialization automatically fetches all cloud formations (`fetchFormations`) and plays (`fetchAllPlays`) from Firestore, merging them with local presets into authoritative state.
    - All cloud formations and plays appear immediately in top HUD selectors and modal drawers without requiring manual load steps.
  - Streamlined Formation Drawer (`src/components/FormationSwitcherModal.tsx`):
    - Replaced multi-row redundant facet filter container with a clean, responsive layout featuring global search and side tabs (`All`, `Offense`, `Defense`), providing full vertical space for formation cards.
  - Unified Play Library Drawer (`src/components/PlayLibraryModal.tsx`):
    - Merges remote cloud plays and local plays by ID to guarantee every cloud item is visible, with quick search and clean category filters.





