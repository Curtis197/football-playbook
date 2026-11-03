// 1. Core Position & Coordinates (Normalized 0-1000 x 700 field coordinates)
export type Side = 'offense' | 'defense';

export interface Point {
  x: number;
  y: number;
}

// 2. Player Entity
export interface Player {
  id: string;              // e.g. "off_y", "def_w"
  label: string;           // "Y", "H", "Z", "W", "M", "NT"
  side: Side;
  x: number;               // Normalized X coordinate
  y: number;               // Normalized Y coordinate
  assignmentTitle: string; // e.g. "Seam Attack / Clearout"
  assignmentNotes: string; // e.g. "Attack inside shoulder of Sam; sit if single-high stays deep"
  technique?: string;      // e.g. "0-Tech", "4i-Tech", "Apex"
  coachingKeys?: string[]; // e.g. ["Read Will LB flow", "Eyes inside on snap"]
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
}

// 4. Complete Play Definition
export type PlayCategory = 'run' | 'pass_action' | 'rpo' | 'screen' | 'blitz_pickup';

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
  formationOffense: string;// "Shotgun Wishbone Y-Right F-Wing"
  frontDefense: string;    // "3-5 Odd Front (0-Tech Nose)"
  category: PlayCategory;
  tags: string[];          // ["zone-read", "3-5-counter", "leak", "high-low"]
  situation: string[];     // ["1st & 10", "Red Zone", "Aggressive LB flow"]
  primaryRunConcept?: string; // "Inside Zone", "Split-Zone Read", "Pin & Pull", "Fold Trap"
  counterAction?: string;     // "Pop/Glance", "Weakside Boot/Leak", "Play-Action Seam", "Jet Sweep"
  targetFront?: string;       // "3-5 Odd (0-Tech)", "3-4 Over", "4-2-5 Nickel", "4-3 Under"
  players: Player[];
  actions: PathAction[];
  notes: PlayNotes;
}

// 5. Playbook Collection
export interface PlaybookFile {
  version: "1.0.0";
  title: string;
  philosophySummary: string;
  plays: Play[];
}

// 6. Editor Interaction Modes
export type CanvasMode = 'select' | 'draw_route' | 'draw_block' | 'draw_motion' | 'add_offense' | 'add_defense';
