// 1. Core Position & Coordinates (Normalized 0-1000 x 700 field coordinates)
export type Side = 'offense' | 'defense';

export interface Point {
  x: number;
  y: number;
  isSharp?: boolean; // True if this waypoint represents a hard directional cut / plant-foot break
}

export type RoutePoint = Point;

// 2. Player Entity
export type PlayerShape = 'round' | 'square' | 'rounded_square' | 'none';
export type AlignmentLeverage = 'head_up' | 'inside_shade' | 'outside_shade' | 'press' | 'off_cushion' | 'apex';
// What the player IS, independent of the free-text label (labels like X, Y, H, F, S mean different things per scheme)
export type PlayerPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'DB';

export interface Player {
  id: string;              // e.g. "off_y", "def_w"
  label: string;           // "Y", "H", "Z", "W", "M", "NT"
  side: Side;
  position?: PlayerPosition; // Role used for route adaptation and backfield logic; inferred once from label + alignment when absent
  shape?: PlayerShape;     // 'round', 'square', 'rounded_square', or 'none' (default: 'none' / no node shape for both offense and defense)
  color?: string;          // Legacy custom hex color fallback
  letterColor?: string;    // Custom position label / text color (default: black '#000000' / rgb 0,0,0)
  nodeColor?: string;      // Custom node stroke / border color (default: black '#000000' / rgb 0,0,0)
  fillColor?: string;      // Custom node background fill color (default: 'transparent' when no node)
  hoverColor?: string;     // Optional custom hover accent color
  x: number;               // Normalized X coordinate
  y: number;               // Normalized Y coordinate
  assignmentTitle: string; // e.g. "Seam Attack / Clearout"
  assignmentNotes: string; // e.g. "Attack inside shoulder of Sam; sit if single-high stays deep"
  technique?: string;      // e.g. "0-Tech", "4i-Tech", "Apex"
  coachingKeys?: string[]; // e.g. ["Read Will LB flow", "Eyes inside on snap"]
  alignReferenceTarget?: string; // Optional offensive reference target: e.g. "#1_wr_left", "#1_wr_right", "#2_slot_left", "#2_slot_right", or offensive player label/id
  alignLeverage?: AlignmentLeverage; // Optional leverage modifier: e.g. "inside_shade", "off_cushion", "press", "head_up", "outside_shade", "apex"
}

// 3. Vector Paths (Routes & Blocks)
export type ActionType = 'pass_route' | 'run_block' | 'motion' | 'pull_block';

export interface PathAction {
  id: string;
  playerId: string;
  type: ActionType;
  points: Point[];         // [StartPoint, Waypoint1, ..., EndPoint]
  isCurved?: boolean;      // If true, render as quadratic/cubic Bezier
  endMarker: 'arrow' | 'tbar' | 'dot' | 'none';
  label?: string;          // Optional waypoint cue (e.g., "Break at 10 yds")
  color?: string;          // Custom color override
  parentActionId?: string; // Optional ID of parent block this action restarted from (double team or option block)
  branchType?: 'combo' | 'option'; // Optional classification for restarted block
  assignmentId?: string;   // Set on lines generated from a BlockPlan assignment; hand-drawn lines have none
}

// 4. Complete Play Definition
export type PlayCategory = 'run' | 'pass_action' | 'pass_dropback' | 'rpo' | 'screen' | 'blitz_pickup';
export type PassingConcept = 'stick' | 'snag' | 'mesh' | 'shallow_cross' | 'smash' | 'flood' | 'dagger' | 'drive' | string;

export interface PlayNotes {
  qbRead: string;          // "Key weakside 4i/5 DE; if crashes, keep or fire glance"
  lineBlocking: string;    // "Inside zone track; C/RG combo 0-tech to Mike"
  philosophyReason: string;// "Neutralizes Mike scraping over the top"
  hotRoute?: string;
  coachingCue?: string;
}

export interface Play {
  id: string;
  name: string;            // "Shotgun Wishbone - Zone Read Glance"
  formationOffense: string;// Display label of the offensive formation, e.g. "Shotgun Wishbone 21 Pers"
  formationOffenseId?: string; // Id of the linked Formation template; the link, not the label, is what pickers and "Update" use
  frontDefense: string;    // Display label of the defensive front, e.g. "3-5 Odd Front (3-3-5 Stack)"
  frontDefenseId?: string; // Id of the linked defensive Formation template
  updatedAt?: string;      // ISO time of the last local edit; used to say which copy is newer when local and cloud differ
  category: PlayCategory;
  tags: string[];          // ["zone-read", "3-5-counter", "leak", "high-low"]
  situation: string[];     // ["1st & 10", "Red Zone", "Aggressive LB flow"]
  primaryRunConcept?: string; // "Inside Zone", "Split-Zone Read", "Pin & Pull", "Fold Trap"
  primaryPassConcept?: PassingConcept; // "stick", "snag", "mesh", "shallow_cross", "smash", "flood"
  personnel?: string;         // "21", "22", "12", "11", "20", "10"
  receiverAlignment?: ReceiverAlignment; // "2x2", "3x1", "bunch", "2x1", "empty"
  counterAction?: string;     // "Pop/Glance", "Weakside Boot/Leak", "Play-Action Seam", "Jet Sweep"
  players: Player[];
  actions: PathAction[];
  notes: PlayNotes;
  blockPlan?: BlockPlan;      // Run-template block assignments (schema 1.2.0)
}

// 4b. Run templates and block assignments (schema 1.2.0)
export type PlaySide = 'left' | 'right';
// Slots are named relative to the play side: ps = play side, bs = backside
export type BlockSlot = 'te_ps' | 'ot_ps' | 'og_ps' | 'c' | 'og_bs' | 'ot_bs' | 'te_bs' | 'fb';
export type BlockKind = 'zone' | 'down' | 'kickout' | 'wrap' | 'seal' | 'lead';

export type BlockTarget =
  | { type: 'defender'; playerId: string }
  | { type: 'level'; level: 'second' }
  | { type: 'gap'; gap: 'A' | 'B' | 'C' | 'D'; side: PlaySide }
  | { type: 'none' };

export interface BlockAssignment {
  id: string;
  playerId: string;
  slot: BlockSlot;
  kind: BlockKind;
  target: BlockTarget;
  comboWith?: string;      // playerId of the combo partner who keeps the defender
  climbTo?: BlockTarget;   // where the combo climbs to afterwards
  pulls?: boolean;
  override?: boolean;      // Hand-edited by the coach: survives re-aiming
  stale?: boolean;         // Overridden, but its target defender no longer exists
}

export interface BlockPlan {
  templateId: string;
  playSide: PlaySide;
  assignments: BlockAssignment[];
}

export interface BlockRule {
  kind: BlockKind;
}

export type TargetRule =
  | { by: 'technique'; technique: string }
  | { by: 'level' }
  | { by: 'gap'; gap: 'A' | 'B' | 'C' | 'D'; relativeSide: 'playside' | 'backside' };

// A coach's hand adjustment, expressed relative to slots and techniques so it applies to other fronts
export interface TemplateOverride {
  slot: BlockSlot;
  target?: TargetRule;
  comboWithSlot?: BlockSlot;
  pulls?: boolean;
}

export interface RunTemplate {
  id: string;
  name: string;
  scheme: 'zone' | 'gap';
  builtIn?: boolean;
  reviewed: boolean;        // False until the coach has signed off the rules; unreviewed templates cannot be applied
  description?: string;
  rules: Partial<Record<BlockSlot, BlockRule>>;
  overrides?: TemplateOverride[];
  updatedAt?: string;
}

// 5. Playbook Collection
export interface PlaybookFile {
  version: "1.2.0"; // 1.0.0 and 1.1.0 files are migrated on read (see utils/playMigrations.ts)
  title: string;
  philosophySummary: string;
  plays: Play[];
}

// 6. Editor Interaction Modes
export type CanvasMode = 'select' | 'draw_route' | 'draw_block' | 'draw_motion' | 'add_offense' | 'add_defense';
export type AppMode = 'build' | 'view';
export type Theme = 'dark' | 'light';
export type RouteAdaptationMode = 'player_relative' | 'concept_numbered';

export type FormationStyle = 'pro_style' | 'spread' | 'old_school' | 'even_front' | 'odd_front' | 'heavy_front' | 'hybrid' | string;

export type QBPosition = 'shotgun' | 'pistol' | 'down_center' | string;

export type ReceiverAlignment = 
  | '1x1' 
  | '2x1' 
  | '1x2' 
  | '2x2' 
  | '3x1' 
  | '1x3' 
  | '3x2' 
  | '2x3' 
  | '4x1' 
  | '1x4' 
  | 'bunch' 
  | 'tight' 
  | string;

// 7. Base Formation Template Definition
export interface Formation {
  id: string;
  name: string;
  side: Side | 'both';
  personnel?: string;                  // e.g. "21", "31", "30", "20", "11", "12", "10", "01", "00", "22", "32"
  qbPosition?: QBPosition;             // "shotgun" | "pistol" | "down_center"
  receiverAlignment?: ReceiverAlignment; // "2x2", "3x1", "2x1", "3x2", "1x1", "4x1"
  style?: FormationStyle;              // "pro_style" | "spread" | "old_school" | "even_front" | ...
  isBunch?: boolean;                   // Flag indicating clustered/bunch receiver alignment
  labels?: string[];
  tags?: string[];
  description?: string;
  players: Player[];
  createdAt?: string;
  updatedAt?: string;
}

