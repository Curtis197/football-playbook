import type { Player } from '../types/playbook';

/**
 * Standard Offensive Structure deduced from offensive player positions
 */
export interface OffensiveGap {
  id: string;
  name: string;
  label: 'D' | 'C' | 'B' | 'A';
  side: 'left' | 'right';
  x: number;
  y: number;
  isStrong: boolean;
  desc: string;
}

export interface OffensiveStructure {
  losY: number;
  center: Player;
  leftGuard: Player | null;
  rightGuard: Player | null;
  leftTackle: Player | null;
  rightTackle: Player | null;
  leftTE: Player | null;
  rightTE: Player | null;
  leftWR: Player | null;
  rightWR: Player | null;
  leftSlots: Player[];
  rightSlots: Player[];
  strength: 'left' | 'right';
  gaps: OffensiveGap[];
}

/**
 * Categorized Defensive Technique definition
 */
export interface TechniqueOption {
  code: string;
  label: string;
  category: 'DL' | 'LB' | 'DB';
  gapDesc?: string;
  level: '1st Level (LOS)' | '2nd Level (Box)' | '3rd Level (Secondary)';
}

export const COMMON_DEFENSIVE_TECHNIQUES: TechniqueOption[] = [
  // 1st Level: Down Linemen & Edge Rushers
  { code: '0-Tech', label: '0-Tech (Head-up Center)', category: 'DL', gapDesc: 'Two-gap nose over Center', level: '1st Level (LOS)' },
  { code: '1-Tech Weak', label: '1-Tech Weak (A-Gap)', category: 'DL', gapDesc: 'Backside A-gap shade on Center', level: '1st Level (LOS)' },
  { code: '1-Tech Strong', label: '1-Tech Strong (A-Gap)', category: 'DL', gapDesc: 'Playside A-gap shade on Center', level: '1st Level (LOS)' },
  { code: '2i-Tech Left', label: '2i-Tech Left', category: 'DL', gapDesc: 'Inside shade on Left Guard', level: '1st Level (LOS)' },
  { code: '2-Tech Left', label: '2-Tech Left (Head-up)', category: 'DL', gapDesc: 'Head-up on Left Guard', level: '1st Level (LOS)' },
  { code: '3-Tech Weak', label: '3-Tech Weak (B-Gap)', category: 'DL', gapDesc: 'Outside shade on Guard into weak B-gap', level: '1st Level (LOS)' },
  { code: '3-Tech Strong', label: '3-Tech Strong (B-Gap)', category: 'DL', gapDesc: 'Outside shade on Guard into strong B-gap', level: '1st Level (LOS)' },
  { code: '2i-Tech Right', label: '2i-Tech Right', category: 'DL', gapDesc: 'Inside shade on Right Guard', level: '1st Level (LOS)' },
  { code: '2-Tech Right', label: '2-Tech Right (Head-up)', category: 'DL', gapDesc: 'Head-up on Right Guard', level: '1st Level (LOS)' },
  { code: '4i-Tech Weak', label: '4i-Tech Weak (B-Gap)', category: 'DL', gapDesc: 'Inside eye on weak Tackle in B-gap', level: '1st Level (LOS)' },
  { code: '4i-Tech Strong', label: '4i-Tech Strong (B-Gap)', category: 'DL', gapDesc: 'Inside eye on strong Tackle in B-gap', level: '1st Level (LOS)' },
  { code: '4-Tech Left', label: '4-Tech Left (Head-up)', category: 'DL', gapDesc: 'Head-up on Left Tackle', level: '1st Level (LOS)' },
  { code: '4-Tech Right', label: '4-Tech Right (Head-up)', category: 'DL', gapDesc: 'Head-up on Right Tackle', level: '1st Level (LOS)' },
  { code: '5-Tech Weak', label: '5-Tech Weak (C-Gap)', category: 'DL', gapDesc: 'Outside shade on weak Tackle into C-gap', level: '1st Level (LOS)' },
  { code: '5-Tech Strong', label: '5-Tech Strong (C-Gap)', category: 'DL', gapDesc: 'Outside shade on strong Tackle into C-gap', level: '1st Level (LOS)' },
  { code: '7-Tech Weak', label: '7-Tech / 6i Weak', category: 'DL', gapDesc: 'Inside eye on weak TE / Ghost 7 edge', level: '1st Level (LOS)' },
  { code: '7-Tech Strong', label: '7-Tech / 6i Strong', category: 'DL', gapDesc: 'Inside eye on strong TE', level: '1st Level (LOS)' },
  { code: '6-Tech Strong', label: '6-Tech Strong (Head-up TE)', category: 'DL', gapDesc: 'Head-up on Tight End', level: '1st Level (LOS)' },
  { code: '9-Tech Weak', label: '9-Tech / Wide-9 Weak', category: 'DL', gapDesc: 'Ghost 9 / Wide edge rush backside', level: '1st Level (LOS)' },
  { code: '9-Tech Strong', label: '9-Tech / Wide-9 Strong', category: 'DL', gapDesc: 'Outside shade on TE / Wide edge rush', level: '1st Level (LOS)' },

  // 2nd Level: Linebackers & Overhangs
  { code: '00 Stack', label: '00 Stack (Mike Center)', category: 'LB', gapDesc: 'Stacked 4-5 yds directly over Center', level: '2nd Level (Box)' },
  { code: '10 Stack Weak', label: '10 Stack Weak (A-Gap)', category: 'LB', gapDesc: 'Stacked behind weak A-gap', level: '2nd Level (Box)' },
  { code: '10 Stack Strong', label: '10 Stack Strong (A-Gap)', category: 'LB', gapDesc: 'Stacked behind strong A-gap', level: '2nd Level (Box)' },
  { code: '20 Stack Left', label: '20 Stack Left (Guard)', category: 'LB', gapDesc: 'Stacked behind Left Guard', level: '2nd Level (Box)' },
  { code: '20 Stack Right', label: '20 Stack Right (Guard)', category: 'LB', gapDesc: 'Stacked behind Right Guard', level: '2nd Level (Box)' },
  { code: '30 Stack Weak', label: '30 Stack Weak (B-Gap / Will)', category: 'LB', gapDesc: 'Stacked behind weak B-gap', level: '2nd Level (Box)' },
  { code: '30 Stack Strong', label: '30 Stack Strong (B-Gap / Sam)', category: 'LB', gapDesc: 'Stacked behind strong B-gap', level: '2nd Level (Box)' },
  { code: '40 Stack Left', label: '40 Stack Left (Tackle)', category: 'LB', gapDesc: 'Stacked behind Left Tackle', level: '2nd Level (Box)' },
  { code: '40 Stack Right', label: '40 Stack Right (Tackle)', category: 'LB', gapDesc: 'Stacked behind Right Tackle', level: '2nd Level (Box)' },
  { code: '50 Stack Weak', label: '50 Stack Weak (C-Gap)', category: 'LB', gapDesc: 'Off-tackle scrape alignment weak', level: '2nd Level (Box)' },
  { code: '50 Stack Strong', label: '50 Stack Strong (C-Gap)', category: 'LB', gapDesc: 'Off-tackle scrape alignment strong', level: '2nd Level (Box)' },
  { code: 'Apex Weak', label: 'Apex Weak (Overhang)', category: 'LB', gapDesc: 'Splits tackle/TE and slot receiver weak', level: '2nd Level (Box)' },
  { code: 'Apex Strong', label: 'Apex Strong (Nickel/Sam)', category: 'LB', gapDesc: 'Splits tackle/TE and slot receiver strong', level: '2nd Level (Box)' },

  // 3rd Level: Defensive Backs & Secondary
  { code: 'Press CB Left', label: 'Press CB Left', category: 'DB', gapDesc: 'Press man leverage over boundary/left WR', level: '3rd Level (Secondary)' },
  { code: 'Press CB Right', label: 'Press CB Right', category: 'DB', gapDesc: 'Press man leverage over field/right WR', level: '3rd Level (Secondary)' },
  { code: 'Off CB Left', label: 'Off CB Left (7-8 yds)', category: 'DB', gapDesc: 'Cushion coverage over left receiver', level: '3rd Level (Secondary)' },
  { code: 'Off CB Right', label: 'Off CB Right (7-8 yds)', category: 'DB', gapDesc: 'Cushion coverage over right receiver', level: '3rd Level (Secondary)' },
  { code: 'Nickel / Slot Left', label: 'Nickel / Slot Left', category: 'DB', gapDesc: 'Coverage over inner left slot receiver', level: '3rd Level (Secondary)' },
  { code: 'Nickel / Slot Right', label: 'Nickel / Slot Right', category: 'DB', gapDesc: 'Coverage over inner right slot receiver', level: '3rd Level (Secondary)' },
  { code: 'Single-High FS', label: 'Single-High FS (Middle 1/3)', category: 'DB', gapDesc: 'Deep center field post safety', level: '3rd Level (Secondary)' },
  { code: '2-High Safety Left', label: '2-High Safety Left (Cover 2/4)', category: 'DB', gapDesc: 'Deep half/quarter safety left', level: '3rd Level (Secondary)' },
  { code: '2-High Safety Right', label: '2-High Safety Right (Cover 2/4)', category: 'DB', gapDesc: 'Deep half/quarter safety right', level: '3rd Level (Secondary)' },
  { code: 'Robber Weak', label: 'Robber Weak / Down Safety', category: 'DB', gapDesc: 'Intermediate hook-curl / box safety weak', level: '3rd Level (Secondary)' },
  { code: 'Robber Strong', label: 'Robber Strong / Down Safety', category: 'DB', gapDesc: 'Intermediate hook-curl / box safety strong', level: '3rd Level (Secondary)' }
];

/**
 * Analyzes offensive players on the field to deduce the Line of Scrimmage,
 * offensive line positions (C, LG, RG, LT, RT, TEs), receivers, and gaps.
 */
export function analyzeOffense(players: Player[]): OffensiveStructure {
  const offense = players.filter(p => p.side === 'offense');

  // Fallback defaults if no offense exists
  const fallbackCenter: Player = {
    id: 'C_fallback',
    label: 'C',
    side: 'offense',
    x: 480,
    y: 380,
    assignmentTitle: 'Center',
    assignmentNotes: 'Anchor line'
  };

  if (offense.length === 0) {
    return {
      losY: 380,
      center: fallbackCenter,
      leftGuard: null,
      rightGuard: null,
      leftTackle: null,
      rightTackle: null,
      leftTE: null,
      rightTE: null,
      leftWR: null,
      rightWR: null,
      leftSlots: [],
      rightSlots: [],
      strength: 'right',
      gaps: []
    };
  }

  // 1. Identify Center (C)
  // Search for player labeled 'C' or 'OC' or 'CENTER', or player on line closest to X = 480-500
  let center = offense.find(p => p.label.trim().toUpperCase() === 'C');
  if (!center) {
    // Look for players near typical LOS y (between 360 and 420)
    const onLine = offense.filter(p => p.y >= 350 && p.y <= 420);
    if (onLine.length > 0) {
      // Pick player closest to x = 480
      center = onLine.reduce((prev, curr) => 
        Math.abs(curr.x - 480) < Math.abs(prev.x - 480) ? curr : prev
      );
    } else {
      center = offense[0];
    }
  }

  const losY = center ? center.y : 380;
  const centerX = center.x;

  // 2. Identify Offensive Linemen and Tight Ends
  // Linemen are within ±25 units of losY
  const losLine = offense.filter(p => Math.abs(p.y - losY) <= 30 && p.id !== center.id);

  // Split into left and right of Center
  const leftOfCenter = losLine.filter(p => p.x < centerX).sort((a, b) => b.x - a.x); // descending X: closest to C first
  const rightOfCenter = losLine.filter(p => p.x > centerX).sort((a, b) => a.x - b.x); // ascending X: closest to C first

  // Guards
  const leftGuard = leftOfCenter.find(p => p.label.trim().toUpperCase() === 'LG') || leftOfCenter[0] || null;
  const rightGuard = rightOfCenter.find(p => p.label.trim().toUpperCase() === 'RG') || rightOfCenter[0] || null;

  // Tackles
  const leftTackle = leftOfCenter.find(p => p.label.trim().toUpperCase() === 'LT') || 
    leftOfCenter.filter(p => p !== leftGuard)[0] || null;
  const rightTackle = rightOfCenter.find(p => p.label.trim().toUpperCase() === 'RT') || 
    rightOfCenter.filter(p => p !== rightGuard)[0] || null;

  // Tight Ends (TE / Y) on LOS or flexed close
  const teCandidates = offense.filter(p => 
    p.label.trim().toUpperCase() === 'Y' || 
    p.label.trim().toUpperCase() === 'TE' ||
    p.assignmentTitle?.toLowerCase().includes('tight end')
  );

  const leftTE = teCandidates.find(p => p.x < centerX && Math.abs(p.y - losY) <= 50) || 
    leftOfCenter.filter(p => p !== leftGuard && p !== leftTackle)[0] || null;

  const rightTE = teCandidates.find(p => p.x > centerX && Math.abs(p.y - losY) <= 50) || 
    rightOfCenter.filter(p => p !== rightGuard && p !== rightTackle)[0] || null;

  // 3. Wide Receivers & Slots
  const receivers = offense.filter(p => 
    p !== center && p !== leftGuard && p !== rightGuard && p !== leftTackle && p !== rightTackle && p !== leftTE && p !== rightTE &&
    p.label.trim().toUpperCase() !== 'QB' && p.label.trim().toUpperCase() !== 'RB' && p.label.trim().toUpperCase() !== 'FB'
  );

  const leftReceivers = receivers.filter(p => p.x < centerX).sort((a, b) => a.x - b.x); // smallest X = outermost
  const rightReceivers = receivers.filter(p => p.x > centerX).sort((a, b) => b.x - a.x); // largest X = outermost

  const leftWR = leftReceivers[0] || null;
  const rightWR = rightReceivers[0] || null;

  const leftSlots = leftReceivers.filter(p => p !== leftWR);
  const rightSlots = rightReceivers.filter(p => p !== rightWR);

  // 4. Determine Formation Strength
  // TE presence dictates strength. If both or neither, count total players to right vs left of center
  let strength: 'left' | 'right' = 'right';
  if (rightTE && !leftTE) {
    strength = 'right';
  } else if (leftTE && !rightTE) {
    strength = 'left';
  } else {
    const leftCount = offense.filter(p => p.x < centerX).length;
    const rightCount = offense.filter(p => p.x > centerX).length;
    strength = rightCount >= leftCount ? 'right' : 'left';
  }

  // 5. Establish Gaps from Linemen positions
  const lgX = leftGuard ? leftGuard.x : centerX - 60;
  const rgX = rightGuard ? rightGuard.x : centerX + 60;
  const ltX = leftTackle ? leftTackle.x : lgX - 60;
  const rtX = rightTackle ? rightTackle.x : rgX + 60;
  const lteX = leftTE ? leftTE.x : ltX - 60;
  const rteX = rightTE ? rightTE.x : rtX + 60;

  const gaps: OffensiveGap[] = [
    {
      id: 'gap_d_left',
      name: 'Left D Gap',
      label: 'D',
      side: 'left',
      x: Math.round(leftTE ? lteX - 40 : ltX - 70),
      y: losY,
      isStrong: strength === 'left',
      desc: 'Outside contain / edge perimeter left'
    },
    {
      id: 'gap_c_left',
      name: 'Left C Gap',
      label: 'C',
      side: 'left',
      x: Math.round(leftTE ? (lteX + ltX) / 2 : ltX - 35),
      y: losY,
      isStrong: strength === 'left',
      desc: 'Between Left Tackle and TE (or off-tackle)'
    },
    {
      id: 'gap_b_left',
      name: 'Left B Gap',
      label: 'B',
      side: 'left',
      x: Math.round((ltX + lgX) / 2),
      y: losY,
      isStrong: strength === 'left',
      desc: 'Between Left Tackle and Left Guard'
    },
    {
      id: 'gap_a_left',
      name: 'Left A Gap',
      label: 'A',
      side: 'left',
      x: Math.round((lgX + centerX) / 2),
      y: losY,
      isStrong: strength === 'left',
      desc: 'Between Center and Left Guard'
    },
    {
      id: 'gap_a_right',
      name: 'Right A Gap',
      label: 'A',
      side: 'right',
      x: Math.round((centerX + rgX) / 2),
      y: losY,
      isStrong: strength === 'right',
      desc: 'Between Center and Right Guard'
    },
    {
      id: 'gap_b_right',
      name: 'Right B Gap',
      label: 'B',
      side: 'right',
      x: Math.round((rgX + rtX) / 2),
      y: losY,
      isStrong: strength === 'right',
      desc: 'Between Right Guard and Right Tackle'
    },
    {
      id: 'gap_c_right',
      name: 'Right C Gap',
      label: 'C',
      side: 'right',
      x: Math.round(rightTE ? (rtX + rteX) / 2 : rtX + 35),
      y: losY,
      isStrong: strength === 'right',
      desc: 'Between Right Tackle and TE (or off-tackle)'
    },
    {
      id: 'gap_d_right',
      name: 'Right D Gap',
      label: 'D',
      side: 'right',
      x: Math.round(rightTE ? rteX + 40 : rtX + 70),
      y: losY,
      isStrong: strength === 'right',
      desc: 'Outside contain / edge perimeter right'
    }
  ];

  return {
    losY,
    center,
    leftGuard,
    rightGuard,
    leftTackle,
    rightTackle,
    leftTE,
    rightTE,
    leftWR,
    rightWR,
    leftSlots,
    rightSlots,
    strength,
    gaps
  };
}

/**
 * Calculates the exact (x, y) coordinates for any defensive technique/alignment parameter
 * dynamically derived from the offensive alignment.
 */
export function calculateDefensiveAlignmentPosition(
  techniqueStr: string,
  structure: OffensiveStructure
): { x: number; y: number; matched: boolean; description: string } {
  if (!techniqueStr || !techniqueStr.trim()) {
    return { x: 480, y: structure.losY - 115, matched: false, description: 'Default LB position' };
  }

  const raw = techniqueStr.trim().toLowerCase();
  const { losY, center, leftGuard, rightGuard, leftTackle, rightTackle, leftTE, rightTE, leftWR, rightWR, leftSlots, rightSlots, strength } = structure;

  // Key offensive reference points
  const cX = center.x;
  const lgX = leftGuard ? leftGuard.x : cX - 60;
  const rgX = rightGuard ? rightGuard.x : cX + 60;
  const ltX = leftTackle ? leftTackle.x : lgX - 60;
  const rtX = rightTackle ? rightTackle.x : rgX + 60;
  const lteX = leftTE ? leftTE.x : ltX - 60;
  const rteX = rightTE ? rightTE.x : rtX + 60;

  const wrLX = leftWR ? leftWR.x : 120;
  const wrRX = rightWR ? rightWR.x : 860;
  const slotLX = leftSlots[0] ? leftSlots[0].x : Math.round((ltX + wrLX) / 2);
  const slotRX = rightSlots[0] ? rightSlots[0].x : Math.round((rtX + wrRX) / 2);

  // Depth offsets (comfortably spaced from LOS for clear blocking tracks, pull angles, and combo releases)
  const dlY = losY - 55;       // Down lineman on LOS (~5.5 yds off offensive ball spot)
  const lbY = losY - 115;      // 2nd level box linebacker (60px behind DL, plenty of combo room)
  const apexY = losY - 80;     // Walked-out apex overhang / nickel
  const pressY = losY - 65;    // Press cornerback
  const offCbY = losY - 140;   // Off cornerback (7-8 yds cushion)
  const robberY = losY - 185;  // Intermediate down safety / robber
  const twoHighY = losY - 235; // 2-high safety
  const singleHighY = losY - 275; // 1-high free safety (middle 1/3)

  // Resolve 'strong' and 'weak' tags to 'left' or 'right'
  const isTargetStrong = raw.includes('strong');
  const isTargetWeak = raw.includes('weak');
  const targetSide: 'left' | 'right' = isTargetStrong 
    ? strength 
    : isTargetWeak 
      ? (strength === 'right' ? 'left' : 'right') 
      : (raw.includes('left') || raw.includes('weakside') ? 'left' : 'right');

  // --- 1. Down Lineman Techniques (0 to 9) ---
  if (raw.startsWith('0-tech') || raw === '0' || raw.includes('nose') || raw.includes('0 tech') || raw.includes('head-up nose')) {
    return { x: cX, y: dlY, matched: true, description: '0-Tech Head-up Center' };
  }

  // 1-Technique (A-gap shade on Center)
  if (raw.includes('1-tech') || raw.includes('1 tech') || raw === '1') {
    const x = targetSide === 'left' ? cX - 18 : cX + 18;
    return { x, y: dlY, matched: true, description: `1-Tech shade ${targetSide === 'left' ? 'Left' : 'Right'} A-gap` };
  }

  // 2i-Technique (Inside shade on Guard)
  if (raw.includes('2i')) {
    const x = targetSide === 'left' ? lgX + 18 : rgX - 18;
    return { x, y: dlY, matched: true, description: `2i-Tech inside shade ${targetSide === 'left' ? 'Left' : 'Right'} Guard` };
  }

  // 2-Technique (Head-up Guard)
  if (raw.includes('2-tech') || raw.includes('2 tech') || raw === '2') {
    const x = targetSide === 'left' ? lgX : rgX;
    return { x, y: dlY, matched: true, description: `2-Tech head-up ${targetSide === 'left' ? 'Left' : 'Right'} Guard` };
  }

  // 3-Technique (Outside shade Guard into B-gap)
  if (raw.includes('3-tech') || raw.includes('3 tech') || raw === '3') {
    const x = targetSide === 'left' ? lgX - 22 : rgX + 22;
    return { x, y: dlY, matched: true, description: `3-Tech outside shade ${targetSide === 'left' ? 'Left' : 'Right'} Guard into B-gap` };
  }

  // 4i-Technique (Inside shade Tackle into B-gap)
  if (raw.includes('4i')) {
    const x = targetSide === 'left' ? ltX + 18 : rtX - 18;
    return { x, y: dlY, matched: true, description: `4i-Tech inside shade ${targetSide === 'left' ? 'Left' : 'Right'} Tackle into B-gap` };
  }

  // 4-Technique (Head-up Tackle)
  if (raw.includes('4-tech') || raw.includes('4 tech') || raw === '4') {
    const x = targetSide === 'left' ? ltX : rtX;
    return { x, y: dlY, matched: true, description: `4-Tech head-up ${targetSide === 'left' ? 'Left' : 'Right'} Tackle` };
  }

  // 5-Technique (Outside shade Tackle into C-gap)
  if (raw.includes('5-tech') || raw.includes('5 tech') || raw === '5') {
    const x = targetSide === 'left' ? ltX - 25 : rtX + 25;
    return { x, y: dlY, matched: true, description: `5-Tech outside shade ${targetSide === 'left' ? 'Left' : 'Right'} Tackle into C-gap` };
  }

  // 6i / 7-Technique (Inside eye TE / ghost edge)
  if (raw.includes('7-tech') || raw.includes('7 tech') || raw.includes('6i') || raw === '7') {
    const x = targetSide === 'left' 
      ? (leftTE ? lteX + 18 : ltX - 35) 
      : (rightTE ? rteX - 18 : rtX + 35);
    return { x, y: dlY, matched: true, description: `7-Tech / 6i ${targetSide === 'left' ? 'Left' : 'Right'} into C-gap` };
  }

  // 6-Technique (Head-up TE)
  if (raw.includes('6-tech') || raw.includes('6 tech') || raw === '6') {
    const x = targetSide === 'left' ? (leftTE ? lteX : ltX - 40) : (rightTE ? rteX : rtX + 40);
    return { x, y: dlY, matched: true, description: `6-Tech head-up ${targetSide === 'left' ? 'Left' : 'Right'} TE` };
  }

  // 9-Technique / Wide-9 (Outside shade TE / Wide rush edge)
  if (raw.includes('9-tech') || raw.includes('9 tech') || raw.includes('wide-9') || raw.includes('wide 9') || raw === '9') {
    const x = targetSide === 'left' ? (leftTE ? lteX - 35 : ltX - 55) : (rightTE ? rteX + 35 : rtX + 55);
    return { x, y: dlY, matched: true, description: `9-Tech wide edge ${targetSide === 'left' ? 'Left' : 'Right'} D-gap` };
  }

  // --- 2. Linebacker Stacks (00 to 50 & Apex) ---
  if (raw.includes('00') || raw.includes('mike stack') || raw.includes('center stack') || raw.includes('flow to zone')) {
    return { x: cX, y: lbY, matched: true, description: '00 Stack over Center' };
  }

  if (raw.includes('10 stack') || raw.includes('10') || raw.includes('a-gap stack')) {
    const x = targetSide === 'left' ? Math.round((lgX + cX) / 2) : Math.round((rgX + cX) / 2);
    return { x, y: lbY, matched: true, description: `10 Stack over ${targetSide === 'left' ? 'Left' : 'Right'} A-Gap` };
  }

  if (raw.includes('20 stack') || raw.includes('20')) {
    const x = targetSide === 'left' ? lgX : rgX;
    return { x, y: lbY, matched: true, description: `20 Stack over ${targetSide === 'left' ? 'Left' : 'Right'} Guard` };
  }

  if (raw.includes('30 stack') || raw.includes('30') || raw.includes('will stack') || raw.includes('sam stack') || raw.includes('b-gap stack') || raw.includes('scrape')) {
    const x = targetSide === 'left' ? Math.round((ltX + lgX) / 2) : Math.round((rtX + rgX) / 2);
    return { x, y: lbY, matched: true, description: `30 Stack over ${targetSide === 'left' ? 'Left' : 'Right'} B-Gap` };
  }

  if (raw.includes('40 stack') || raw.includes('40')) {
    const x = targetSide === 'left' ? ltX : rtX;
    return { x, y: lbY, matched: true, description: `40 Stack over ${targetSide === 'left' ? 'Left' : 'Right'} Tackle` };
  }

  if (raw.includes('50 stack') || raw.includes('50') || raw.includes('c-gap stack')) {
    const x = targetSide === 'left' ? ltX - 40 : rtX + 40;
    return { x, y: lbY, matched: true, description: `50 Stack over ${targetSide === 'left' ? 'Left' : 'Right'} C-Gap` };
  }

  // Apex (Overhang split between tackle/TE and slot/receiver)
  if (raw.includes('apex') || raw.includes('overhang') || raw.includes('spur')) {
    let x: number;
    if (targetSide === 'left') {
      const edge = leftTE ? lteX : ltX;
      x = Math.round((edge + slotLX) / 2);
    } else {
      const edge = rightTE ? rteX : rtX;
      x = Math.round((edge + slotRX) / 2);
    }
    return { x, y: apexY, matched: true, description: `Apex Overhang ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // --- 3. Defensive Backs / Secondary ---
  // Press CB
  if (raw.includes('press cb') || raw.includes('press corner') || raw.includes('press bail')) {
    const x = targetSide === 'left' ? wrLX + 8 : wrRX - 8;
    return { x, y: pressY, matched: true, description: `Press Cornerback ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // Off CB
  if (raw.includes('off cb') || raw.includes('off man') || raw.includes('cover 3 deep') || raw.includes('cornerback') || raw.includes('cb')) {
    const x = targetSide === 'left' ? wrLX + 12 : wrRX - 12;
    return { x, y: offCbY, matched: true, description: `Off Cornerback ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // Nickel / Slot Defender
  if (raw.includes('nickel') || raw.includes('slot cb') || raw.includes('star')) {
    const x = targetSide === 'left' ? slotLX : slotRX;
    return { x, y: apexY, matched: true, description: `Nickel / Slot Defender ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // Single-High Free Safety
  if (raw.includes('single-high') || raw.includes('single high') || raw.includes('free safety') || raw.includes('fs') || raw.includes('middle 1/3')) {
    return { x: cX, y: singleHighY, matched: true, description: 'Single-High Free Safety' };
  }

  // 2-High Safety
  if (raw.includes('2-high') || raw.includes('two high') || raw.includes('cover 2 safety') || raw.includes('deep 1/2')) {
    const x = targetSide === 'left' ? cX - 140 : cX + 140;
    return { x, y: twoHighY, matched: true, description: `2-High Safety ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // Robber / Down Safety
  if (raw.includes('robber') || raw.includes('strong safety') || raw.includes('down safety') || raw.includes('ss')) {
    const x = targetSide === 'left' ? cX - 80 : cX + 80;
    return { x, y: robberY, matched: true, description: `Robber / Strong Safety ${targetSide === 'left' ? 'Left' : 'Right'}` };
  }

  // Default fallback
  return { x: cX, y: lbY, matched: false, description: 'Unrecognized technique' };
}

/**
 * Defensive Front Preset Template
 */
export interface DefensivePackage {
  id: string;
  name: string;
  scheme: string;
  description: string;
  defenders: Array<{
    id: string;
    label: string;
    technique: string;
    assignmentTitle: string;
    assignmentNotes: string;
    coachingKeys?: string[];
  }>;
}

export const DEFENSIVE_PACKAGES: DefensivePackage[] = [
  {
    id: 'pkg-4-3-over',
    name: '4-3 Over Front',
    scheme: '4-3',
    description: 'Standard 4-3 front with 3-tech DT to the offensive strong side, 1-tech nose tackle weak, and Sam linebacker over the tight end.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '1-Tech Weak', assignmentTitle: '1-Tech Shade', assignmentNotes: 'Control weak A-gap; anchor against Center/LG double team.' },
      { id: 'def_dt', label: 'DT', technique: '3-Tech Strong', assignmentTitle: '3-Tech DT', assignmentNotes: 'Penetrate strong B-gap; disrupt zone and pull tracks.' },
      { id: 'def_de_w', label: 'DE', technique: '5-Tech Weak', assignmentTitle: 'Weak 5-End', assignmentNotes: 'Control weak C-gap / edge contain; QB option key.' },
      { id: 'def_de_s', label: 'DE', technique: '5-Tech Strong', assignmentTitle: 'Strong 5-End', assignmentNotes: 'Control C-gap between RT and TE; squeeze off-tackle.' },
      { id: 'def_w', label: 'W', technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Scrape weak B-gap to perimeter on run flow.' },
      { id: 'def_m', label: 'M', technique: '20 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Plug strong A/B gap downhill on run.' },
      { id: 'def_s', label: 'S', technique: 'Apex Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Apex / overhang over Tight End; force perimeter runs inside.' },
      { id: 'def_cb1', label: 'CB', technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Cover 3 deep outside 1/3.' },
      { id: 'def_cb2', label: 'CB', technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Cover 3 deep outside 1/3.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle 1/3 field safety.' },
      { id: 'def_ss', label: 'SS', technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Down safety; curl-flat defender and primary run fit in strong alley.' }
    ]
  },
  {
    id: 'pkg-3-4-over',
    name: '3-4 Over Front',
    scheme: '3-4',
    description: 'Two-gap 3-4 front setting the 3-tech & strong OLB edge to the offensive strength with twin inside backers.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Two-gap A-gaps; demand double team from C and Guard.' },
      { id: 'def_de_w', label: 'DE', technique: '4i-Tech Weak', assignmentTitle: 'Weak 4i End', assignmentNotes: 'Control weak B-gap; squeeze off tackle.' },
      { id: 'def_de_s', label: 'DE', technique: '5-Tech Strong', assignmentTitle: 'Strong 5 End', assignmentNotes: 'Control strong C-gap; set firm edge against reach block.' },
      { id: 'def_olb_w', label: 'OLB', technique: '9-Tech Weak', assignmentTitle: 'Backside Edge', assignmentNotes: 'Contain edge; force cutback into pursuit.' },
      { id: 'def_olb_s', label: 'OLB', technique: '9-Tech Strong', assignmentTitle: 'Strongside Edge', assignmentNotes: 'Set perimeter cup; rush or drop flat on pass.' },
      { id: 'def_ilb_w', label: 'ILB', technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Scrape weak B-gap; flow downhill on zone.' },
      { id: 'def_ilb_s', label: 'ILB', technique: '20 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Mirror RB mesh; fill strong A/B gap.' },
      { id: 'def_cb_l', label: 'CB', technique: 'Off CB Left', assignmentTitle: 'Boundary Corner', assignmentNotes: 'Deep 1/3 cushion coverage.' },
      { id: 'def_cb_r', label: 'CB', technique: 'Off CB Right', assignmentTitle: 'Field Corner', assignmentNotes: 'Deep 1/3 cushion coverage.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Middle third post control.' },
      { id: 'def_ss', label: 'SS', technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Roll down into strong hook-curl alley.' }
    ]
  },
  {
    id: 'pkg-4-2-5-nickel',
    name: '4-2-5 Nickel Over',
    scheme: '4-2-5',
    description: 'Modern 4-down front with 3-tech to strong side, 1-tech nose to weak side, and an athletic Nickel apex overhang.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '1-Tech Weak', assignmentTitle: '1-Tech Nose', assignmentNotes: 'Control weak A-gap; anchor against combo block.' },
      { id: 'def_dt', label: 'DT', technique: '3-Tech Strong', assignmentTitle: '3-Tech DT', assignmentNotes: 'Penetrate strong B-gap; disrupt zone tracks.' },
      { id: 'def_de_w', label: 'DE', technique: '5-Tech Weak', assignmentTitle: 'Weak 5 End', assignmentNotes: 'Weak edge contain / QB option keep keeper.' },
      { id: 'def_de_s', label: 'DE', technique: '5-Tech Strong', assignmentTitle: 'Strong 5 End', assignmentNotes: 'Set strong C-gap edge; squeeze off-tackle.' },
      { id: 'def_w', label: 'W', technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Fast flow to weak perimeter; cover cutback.' },
      { id: 'def_m', label: 'M', technique: '20 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Downhill A/B gap plugger on run keys.' },
      { id: 'def_nk', label: 'NK', technique: 'Apex Strong', assignmentTitle: 'Nickel Overhang', assignmentNotes: 'Alley defender; force bubble/flat and fit run.' },
      { id: 'def_cb1', label: 'CB', technique: 'Off CB Left', assignmentTitle: 'Left Corner', assignmentNotes: 'Cover 3 deep third or match quarters.' },
      { id: 'def_cb2', label: 'CB', technique: 'Off CB Right', assignmentTitle: 'Right Corner', assignmentNotes: 'Cover 3 deep third or match quarters.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle of field insurance.' },
      { id: 'def_ss', label: 'SS', technique: 'Robber Weak', assignmentTitle: 'Strong Safety', assignmentNotes: 'Intermediate hole defender; bracket slot.' }
    ]
  },
  {
    id: 'pkg-3-5-odd',
    name: '3-5 Odd Front (3-3-5 Stack)',
    scheme: '3-5',
    description: '3 down linemen with 0-tech head-up nose, dual 4i tackles, 3 second-level stack backers, and twin apex overhangs.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Two-gap A-gaps; primary double-team target.' },
      { id: 'def_e1', label: 'DE', technique: '4i-Tech Weak', assignmentTitle: '4i Weak DE', assignmentNotes: 'B-gap anchor; read option key for QB.' },
      { id: 'def_e2', label: 'DE', technique: '4i-Tech Strong', assignmentTitle: '4i Strong DE', assignmentNotes: 'Controls frontside B/C-gap; leverage on RT.' },
      { id: 'def_m', label: 'M', technique: '00 Stack', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Flows downhill to mirror mesh.' },
      { id: 'def_w', label: 'W', technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'B-gap scrape on zone action.' },
      { id: 'def_s', label: 'S', technique: '30 Stack Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Scrapes strong side; fills off-tackle.' },
      { id: 'def_ov_w', label: 'BD', technique: 'Apex Weak', assignmentTitle: 'Bandit Overhang', assignmentNotes: 'Perimeter force defender weak.' },
      { id: 'def_ov_s', label: 'NK', technique: 'Apex Strong', assignmentTitle: 'Nickel Overhang', assignmentNotes: 'Perimeter force defender strong.' },
      { id: 'def_c1', label: 'CB', technique: 'Off CB Left', assignmentTitle: 'Left Corner', assignmentNotes: 'Deep 1/3 boundary bail.' },
      { id: 'def_c2', label: 'CB', technique: 'Off CB Right', assignmentTitle: 'Right Corner', assignmentNotes: 'Deep 1/3 boundary bail.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle field post.' }
    ]
  },
  {
    id: 'pkg-4-3-under',
    name: '4-3 Under Front',
    scheme: '4-3',
    description: 'Shifts the 3-tech DT to the weak side, setting a heavy front to stop weakside inside zone and pulling counters.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '1-Tech Strong', assignmentTitle: '1-Tech Shade', assignmentNotes: 'Strong A-gap control; occupy Center and RG.' },
      { id: 'def_dt', label: 'DT', technique: '3-Tech Weak', assignmentTitle: 'Weak 3-Tech', assignmentNotes: 'Disrupt weak B-gap track.' },
      { id: 'def_de_w', label: 'DE', technique: '5-Tech Weak', assignmentTitle: 'Weak 5 End', assignmentNotes: 'Open side edge speed rush.' },
      { id: 'def_de_s', label: 'DE', technique: '7-Tech Strong', assignmentTitle: 'Strong 7 End', assignmentNotes: 'Lock up TE inside shoulder; hold C-gap.' },
      { id: 'def_sam', label: 'S', technique: 'Apex Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Line of scrimmage overhang over TE.' },
      { id: 'def_mike', label: 'M', technique: '30 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Fit strong B/C gap downhill.' },
      { id: 'def_will', label: 'W', technique: '10 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Scrape weak A-gap to cutback.' },
      { id: 'def_cb1', label: 'CB', technique: 'Off CB Left', assignmentTitle: 'Left Corner', assignmentNotes: 'Outside 1/3 coverage.' },
      { id: 'def_cb2', label: 'CB', technique: 'Off CB Right', assignmentTitle: 'Right Corner', assignmentNotes: 'Outside 1/3 coverage.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Post safety.' },
      { id: 'def_ss', label: 'SS', technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Robber / Curl-Flat defender.' }
    ]
  },
  {
    id: 'pkg-3-4-mint',
    name: 'Mint / Tite Front',
    scheme: 'Mint',
    description: 'Saban/Smart Tite Front closing both interior B-gaps with dual 4i ends and 0-nose, forcing runs to perimeter.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Anchor A-gaps.' },
      { id: 'def_de1', label: 'DE', technique: '4i-Tech Weak', assignmentTitle: 'Weak 4i End', assignmentNotes: 'Plug weak B-gap tight.' },
      { id: 'def_de2', label: 'DE', technique: '4i-Tech Strong', assignmentTitle: 'Strong 4i End', assignmentNotes: 'Plug strong B-gap tight.' },
      { id: 'def_ilb1', label: 'W', technique: '30 Stack Weak', assignmentTitle: 'Will Backer', assignmentNotes: 'Free to scrape C-gap.' },
      { id: 'def_ilb2', label: 'M', technique: '30 Stack Strong', assignmentTitle: 'Mike Backer', assignmentNotes: 'Free to scrape C-gap.' },
      { id: 'def_olb1', label: 'JK', technique: '9-Tech Weak', assignmentTitle: 'Jack Backer', assignmentNotes: 'Stand-up backside edge.' },
      { id: 'def_olb2', label: 'ST', technique: 'Apex Strong', assignmentTitle: 'Star Overhang', assignmentNotes: 'Overhang force player.' },
      { id: 'def_cb1', label: 'CB', technique: 'Press CB Left', assignmentTitle: 'Boundary Corner', assignmentNotes: 'Press-bail boundary.' },
      { id: 'def_cb2', label: 'CB', technique: 'Press CB Right', assignmentTitle: 'Field Corner', assignmentNotes: 'Press-bail field.' },
      { id: 'def_fs', label: 'FS', technique: '2-High Safety Left', assignmentTitle: 'Split Safety', assignmentNotes: 'Cover 4 split half/quarter.' },
      { id: 'def_ss', label: 'SS', technique: '2-High Safety Right', assignmentTitle: 'Split Safety', assignmentNotes: 'Cover 4 split half/quarter.' }
    ]
  },
  {
    id: 'pkg-bear-46',
    name: 'Bear / 46 Front',
    scheme: 'Bear',
    description: 'Historic Buddy Ryan Bear Front covering Center and both Guards with big interior linemen and twin edge rushers.',
    defenders: [
      { id: 'def_nt', label: 'NT', technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Destroy Center on snap.' },
      { id: 'def_dt1', label: 'DT', technique: '3-Tech Weak', assignmentTitle: 'Weak 3-Tech', assignmentNotes: 'Cover weak guard head/outside.' },
      { id: 'def_dt2', label: 'DT', technique: '3-Tech Strong', assignmentTitle: 'Strong 3-Tech', assignmentNotes: 'Cover strong guard head/outside.' },
      { id: 'def_de1', label: 'DE', technique: '9-Tech Weak', assignmentTitle: 'Weak Edge', assignmentNotes: 'Contain rush.' },
      { id: 'def_de2', label: 'DE', technique: '9-Tech Strong', assignmentTitle: 'Strong Edge', assignmentNotes: 'Contain rush.' },
      { id: 'def_m', label: 'M', technique: '00 Stack', assignmentTitle: 'Mike Stack', assignmentNotes: 'Clean A-gap plugger.' },
      { id: 'def_w', label: 'W', technique: '10 Stack Weak', assignmentTitle: 'Will Backer', assignmentNotes: 'Stack weak.' },
      { id: 'def_s', label: 'S', technique: '10 Stack Strong', assignmentTitle: 'Sam Backer', assignmentNotes: 'Stack strong.' },
      { id: 'def_cb1', label: 'CB', technique: 'Press CB Left', assignmentTitle: 'Press Corner', assignmentNotes: 'Press man.' },
      { id: 'def_cb2', label: 'CB', technique: 'Press CB Right', assignmentTitle: 'Press Corner', assignmentNotes: 'Press man.' },
      { id: 'def_fs', label: 'FS', technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Center field hawk.' }
    ]
  }
];

/**
 * Loads a complete defensive package onto the field and automatically aligns every defender
 * according to the active offensive formation.
 */
export function loadDefensivePackage(
  pkg: DefensivePackage,
  currentDefensePlayers: Player[],
  structure: OffensiveStructure
): Player[] {
  return pkg.defenders.map((defPreset, idx) => {
    // Attempt to retain existing defensive player's visual style/colors/shapes if present
    const existing = currentDefensePlayers[idx] || currentDefensePlayers.find(p => p.label === defPreset.label);
    const pos = calculateDefensiveAlignmentPosition(defPreset.technique, structure);

    return {
      id: existing ? existing.id : `def_${Date.now()}_${idx}`,
      label: defPreset.label,
      side: 'defense' as const,
      shape: existing?.shape ?? 'none',
      letterColor: existing?.letterColor ?? '#000000',
      nodeColor: existing?.nodeColor ?? '#000000',
      fillColor: existing?.fillColor ?? 'transparent',
      hoverColor: existing?.hoverColor,
      x: pos.x,
      y: pos.y,
      technique: defPreset.technique,
      assignmentTitle: defPreset.assignmentTitle,
      assignmentNotes: defPreset.assignmentNotes,
      coachingKeys: defPreset.coachingKeys || []
    };
  });
}

/**
 * Infers an appropriate defensive alignment technique for a defensive player
 * based on their label (e.g. NT, DT, DE, W, M, S, CB, FS, SS) and relative field position
 * if their technique is not explicitly specified.
 */
export function inferDefenderTechnique(player: Player, structure: OffensiveStructure): string {
  if (player.technique && player.technique.trim()) {
    return player.technique;
  }
  const lbl = (player.label || '').toUpperCase().trim();
  const isLeftOfCenter = player.x < structure.center.x;
  const sideTag = isLeftOfCenter 
    ? (structure.strength === 'left' ? 'Strong' : 'Weak') 
    : (structure.strength === 'right' ? 'Strong' : 'Weak');

  if (lbl === 'NT' || lbl === 'NOSE' || lbl === 'N') return '0-Tech Head-up';
  if (lbl === 'DT' || lbl === 'T' || lbl === 'TACKLE') return `3-Tech ${sideTag}`;
  if (lbl === 'DE' || lbl === 'E' || lbl === 'END') return `5-Tech ${sideTag}`;
  if (lbl === 'W' || lbl === 'WILL') return '30 Stack Weak';
  if (lbl === 'M' || lbl === 'MIKE') return '20 Stack Strong';
  if (lbl === 'S' || lbl === 'SAM') return 'Apex Strong';
  if (lbl === 'CB' || lbl === 'C' || lbl === 'CORNER') return isLeftOfCenter ? 'Off CB Left' : 'Off CB Right';
  if (lbl === 'FS' || lbl === 'FREE') return 'Single-High FS';
  if (lbl === 'SS' || lbl === 'SAFETY') return `Robber ${sideTag}`;
  if (lbl === 'STAR' || lbl === 'NICKEL' || lbl === 'NK' || lbl === 'ROVER') return `Apex ${sideTag}`;
  if (lbl === 'ILB' || lbl === 'LB') return `30 Stack ${sideTag}`;
  if (lbl === 'OLB' || lbl === 'EDGE') return `Apex ${sideTag}`;

  return `20 Stack ${sideTag}`;
}

/**
 * Re-aligns all defensive players based on their existing technique/alignment parameter
 * against the current offensive formation. If a player lacks a technique, infers one automatically.
 */
export function realignAllDefenders(
  players: Player[],
  structure: OffensiveStructure
): Player[] {
  return players.map(player => {
    if (player.side !== 'defense') return player;
    const tech = inferDefenderTechnique(player, structure);
    const pos = calculateDefensiveAlignmentPosition(tech, structure);
    return {
      ...player,
      technique: tech,
      x: pos.x,
      y: pos.y
    };
  });
}

/**
 * Defensive Shift Operations: Shifts the defensive front dynamically (Left, Right, Over, Under, Pinch, Fan)
 */
export function shiftDefensiveFront(
  players: Player[],
  structure: OffensiveStructure,
  direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan'
): Player[] {
  return players.map(player => {
    if (player.side !== 'defense') return player;
    const currentTech = player.technique || '';
    let nextTech = currentTech;

    switch (direction) {
      case 'left':
        if (currentTech.includes('3-Tech Strong') || currentTech.includes('3-Tech Right')) nextTech = '1-Tech Strong';
        else if (currentTech.includes('1-Tech Strong') || currentTech.includes('1-Tech Right')) nextTech = '0-Tech';
        else if (currentTech.includes('0-Tech')) nextTech = '1-Tech Weak';
        else if (currentTech.includes('1-Tech Weak') || currentTech.includes('1-Tech Left')) nextTech = '3-Tech Weak';
        else if (currentTech.includes('5-Tech Strong') || currentTech.includes('5-Tech Right')) nextTech = '4i-Tech Strong';
        else if (currentTech.includes('4i-Tech Weak') || currentTech.includes('4i-Tech Left')) nextTech = '5-Tech Weak';
        else if (currentTech.includes('30 Stack Strong')) nextTech = '10 Stack Strong';
        else if (currentTech.includes('10 Stack Strong')) nextTech = '00 Stack';
        else if (currentTech.includes('00 Stack')) nextTech = '10 Stack Weak';
        else if (currentTech.includes('10 Stack Weak')) nextTech = '30 Stack Weak';
        break;

      case 'right':
        if (currentTech.includes('3-Tech Weak') || currentTech.includes('3-Tech Left')) nextTech = '1-Tech Weak';
        else if (currentTech.includes('1-Tech Weak') || currentTech.includes('1-Tech Left')) nextTech = '0-Tech';
        else if (currentTech.includes('0-Tech')) nextTech = '1-Tech Strong';
        else if (currentTech.includes('1-Tech Strong') || currentTech.includes('1-Tech Right')) nextTech = '3-Tech Strong';
        else if (currentTech.includes('5-Tech Weak') || currentTech.includes('5-Tech Left')) nextTech = '4i-Tech Weak';
        else if (currentTech.includes('4i-Tech Strong') || currentTech.includes('4i-Tech Right')) nextTech = '5-Tech Strong';
        else if (currentTech.includes('30 Stack Weak')) nextTech = '10 Stack Weak';
        else if (currentTech.includes('10 Stack Weak')) nextTech = '00 Stack';
        else if (currentTech.includes('00 Stack')) nextTech = '10 Stack Strong';
        else if (currentTech.includes('10 Stack Strong')) nextTech = '30 Stack Strong';
        break;

      case 'over':
        // Over front: 3-tech and Apex overhang set to strong side
        if (player.label === 'DT' || player.label === 'NT') {
          nextTech = player.label === 'DT' ? '3-Tech Strong' : '1-Tech Weak';
        } else if (player.label === 'M' || player.label === 'ILB') {
          nextTech = '20 Stack Strong';
        } else if (player.label === 'W') {
          nextTech = '30 Stack Weak';
        }
        break;

      case 'under':
        // Under front: 3-tech DT to weak side, 1-tech to strong side
        if (player.label === 'DT' || player.label === 'NT') {
          nextTech = player.label === 'DT' ? '3-Tech Weak' : '1-Tech Strong';
        } else if (player.label === 'M' || player.label === 'ILB') {
          nextTech = '30 Stack Strong';
        } else if (player.label === 'W') {
          nextTech = '10 Stack Weak';
        }
        break;

      case 'pinch':
        // Pinch / Crash inside: 5-techs into 4i, 3-techs into 2i/1-tech
        if (currentTech.includes('5-Tech Weak')) nextTech = '4i-Tech Weak';
        else if (currentTech.includes('5-Tech Strong')) nextTech = '4i-Tech Strong';
        else if (currentTech.includes('3-Tech Weak')) nextTech = '2i-Tech Left';
        else if (currentTech.includes('3-Tech Strong')) nextTech = '2i-Tech Right';
        else if (currentTech.includes('9-Tech')) nextTech = currentTech.replace('9-Tech', '7-Tech');
        break;

      case 'fan':
        // Fan / Stem outside: 4i into 5-tech, 1-tech into 3-tech, 7-tech into 9-tech
        if (currentTech.includes('4i-Tech Weak')) nextTech = '5-Tech Weak';
        else if (currentTech.includes('4i-Tech Strong')) nextTech = '5-Tech Strong';
        else if (currentTech.includes('1-Tech Weak')) nextTech = '3-Tech Weak';
        else if (currentTech.includes('1-Tech Strong')) nextTech = '3-Tech Strong';
        else if (currentTech.includes('7-Tech')) nextTech = currentTech.replace('7-Tech', '9-Tech');
        break;
    }

    // Calculate new position based on the adjusted technique
    const pos = calculateDefensiveAlignmentPosition(nextTech, structure);
    return {
      ...player,
      technique: nextTech,
      x: pos.x,
      y: pos.y
    };
  });
}
