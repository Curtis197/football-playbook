import type { Play, PlaybookFile, Formation } from '../types/playbook';

export const DEFAULT_WISHBONE_PLAY: Play = {
  id: "play-wishbone-zone-glance",
  name: "Shotgun Wishbone - Zone Read Glance vs 3-5 Odd",
  formationOffense: "Shotgun Wishbone Y-Right F-Wing",
  frontDefense: "3-5 Odd Front (0-Tech Nose)",
  category: "rpo",
  primaryRunConcept: "Split-Zone Read",
  counterAction: "Pop/Glance",
  targetFront: "3-5 Odd (0-Tech)",
  tags: ["zone-read", "3-5-counter", "leak", "high-low", "mesh-read", "rpo"],
  situation: ["1st & 10", "Red Zone", "Aggressive LB flow", "Short Yardage"],
  players: [
    // Offense (11 players)
    { id: "X",  label: "X",  side: "offense", x: 120, y: 380, assignmentTitle: "Glance Route", assignmentNotes: "5-step skinny post; replace the scraping Will LB.", coachingKeys: ["Win inside leverage on CB", "Snapshot window behind Will"] },
    { id: "LT", label: "LT", side: "offense", x: 360, y: 380, assignmentTitle: "Zone Step", assignmentNotes: "Zone track left; reach 4i-tech or combo to Will.", technique: "Zone Track" },
    { id: "LG", label: "LG", side: "offense", x: 420, y: 380, assignmentTitle: "Zone Combo", assignmentNotes: "Double 0-tech Nose with Center up to Mike.", technique: "Combo 0-Tech" },
    { id: "C",  label: "C",  side: "offense", x: 480, y: 380, assignmentTitle: "Head-up Nose", assignmentNotes: "Anchor 0-tech; forbid backside A-gap penetration.", technique: "Drive Block" },
    { id: "RG", label: "RG", side: "offense", x: 540, y: 380, assignmentTitle: "Zone Track", assignmentNotes: "Step play-side B-gap to 4-tech DT.", technique: "Reach 4-Tech" },
    { id: "RT", label: "RT", side: "offense", x: 600, y: 380, assignmentTitle: "Frontside Combo", assignmentNotes: "Combo with Y on DE to Sam LB.", technique: "Gap Seal" },
    { id: "Y",  label: "Y",  side: "offense", x: 660, y: 380, assignmentTitle: "Seam Release", assignmentNotes: "Fierce run fake; climb vertical behind flowing Mike.", coachingKeys: ["Sell drive block for 2 steps", "Burst through boundary seam"] },
    { id: "F",  label: "F",  side: "offense", x: 740, y: 420, assignmentTitle: "Speed Flat", assignmentNotes: "Stretch perimeter; pull nickel/corner out of seam window.", coachingKeys: ["Sprint flat at snap", "Open QB emergency outlet"] },
    { id: "QB", label: "QB", side: "offense", x: 480, y: 470, assignmentTitle: "Mesh & Read", assignmentNotes: "Read weakside DE. If crashes: pull and throw Glance behind Will.", coachingKeys: ["Ride mesh to 4 yards", "Eyes on weakside 4i/5 DE & Will"] },
    { id: "H",  label: "H",  side: "offense", x: 410, y: 530, assignmentTitle: "Insert / Check", assignmentNotes: "Step weakside B-gap to shield Will or leak to flat.", coachingKeys: ["Lead through weak B-gap", "Contact Will if QB keeps"] },
    { id: "Z",  label: "Z",  side: "offense", x: 550, y: 530, assignmentTitle: "Zone Path", assignmentNotes: "Aiming point playside A/B gap; press vertical then cut.", coachingKeys: ["Receive mesh with soft hands", "Cut off center block"] },

    // Defense (3-5 Odd Front - 11 players)
    { id: "def_c1", label: "CB", side: "defense", x: 120, y: 280, assignmentTitle: "Off Man / Deep 1/3", assignmentNotes: "Cushion technique on X; bails on pass flash.", technique: "Press Bail" },
    { id: "def_w",  label: "W",  side: "defense", x: 300, y: 310, assignmentTitle: "Will Linebacker", assignmentNotes: "B-gap scrape on zone action; susceptible to Glance read.", technique: "Scrape B-Gap" },
    { id: "def_e1", label: "DE", side: "defense", x: 370, y: 350, assignmentTitle: "4i Weak DE", assignmentNotes: "B-gap anchor; read option key for QB.", technique: "4i Technique" },
    { id: "def_nt", label: "NT", side: "defense", x: 480, y: 350, assignmentTitle: "0-Tech Nose", assignmentNotes: "Two-gap A-gaps; primary double-team target.", technique: "0-Tech Head-up" },
    { id: "def_m",  label: "M",  side: "defense", x: 480, y: 290, assignmentTitle: "Mike Linebacker", assignmentNotes: "Flows playside to mirror H/Z mesh; vulnerable to seam.", technique: "Flow to Zone" },
    { id: "def_e2", label: "DE", side: "defense", x: 590, y: 350, assignmentTitle: "4i Strong DE", assignmentNotes: "Controls frontside C-gap; tight leverage on RT.", technique: "4i Technique" },
    { id: "def_s",  label: "S",  side: "defense", x: 670, y: 310, assignmentTitle: "Sam Linebacker", assignmentNotes: "Apex over Y/F; must honor F-wing speed flat.", technique: "Apex / Seam Drop" },
    { id: "def_nik",label: "NK", side: "defense", x: 770, y: 330, assignmentTitle: "Nickel / Overhang", assignmentNotes: "Perimeter force defender; expands with F flat.", technique: "Force / Curl-Flat" },
    { id: "def_c2", label: "CB", side: "defense", x: 860, y: 270, assignmentTitle: "Cornerback", assignmentNotes: "Deep 1/3 boundary; retreat against vertical stem.", technique: "Cover 3 Deep" },
    { id: "def_fs", label: "FS", side: "defense", x: 480, y: 150, assignmentTitle: "Single-High Free Safety", assignmentNotes: "Deep middle of field; rotated toward strongside seam.", technique: "Middle 1/3" },
    { id: "def_ss", label: "SS", side: "defense", x: 620, y: 220, assignmentTitle: "Strong Safety", assignmentNotes: "Robber / intermediate hole defender; reads Y release.", technique: "Robber" }
  ],
  actions: [
    { id: "a_x", playerId: "X", type: "pass_route", endMarker: "arrow", points: [{ x: 120, y: 380, isSharp: false }, { x: 180, y: 250, isSharp: true }, { x: 260, y: 140, isSharp: false }], isCurved: true, label: "5-Step Glance" },
    { id: "a_y", playerId: "Y", type: "pass_route", endMarker: "arrow", points: [{ x: 660, y: 380, isSharp: false }, { x: 660, y: 260, isSharp: false }, { x: 660, y: 100, isSharp: false }], isCurved: false, label: "Seam Attack" },
    { id: "a_f", playerId: "F", type: "pass_route", endMarker: "arrow", points: [{ x: 740, y: 420, isSharp: false }, { x: 840, y: 380, isSharp: false }], isCurved: true, label: "Speed Flat" },
    { id: "a_z", playerId: "Z", type: "run_block",  endMarker: "arrow", points: [{ x: 550, y: 530, isSharp: false }, { x: 500, y: 430, isSharp: true }, { x: 520, y: 340, isSharp: false }], isCurved: true, label: "Playside Zone Track" },
    { id: "a_lt", playerId: "LT", type: "run_block", endMarker: "tbar", points: [{ x: 360, y: 380 }, { x: 370, y: 355 }], isCurved: false },
    { id: "a_lg", playerId: "LG", type: "run_block", endMarker: "tbar", points: [{ x: 420, y: 380 }, { x: 470, y: 355 }], isCurved: false },
    { id: "a_c",  playerId: "C",  type: "run_block", endMarker: "tbar", points: [{ x: 480, y: 380 }, { x: 480, y: 355 }], isCurved: false },
    { id: "a_rg", playerId: "RG", type: "run_block", endMarker: "tbar", points: [{ x: 540, y: 380 }, { x: 580, y: 355 }], isCurved: false },
    { id: "a_rt", playerId: "RT", type: "run_block", endMarker: "tbar", points: [{ x: 600, y: 380 }, { x: 595, y: 355 }], isCurved: false },
    { id: "a_h",  playerId: "H",  type: "pull_block", endMarker: "tbar", points: [{ x: 410, y: 530, isSharp: false }, { x: 360, y: 420, isSharp: false }, { x: 320, y: 330, isSharp: true }], isCurved: true, label: "Insert Kickout" }
  ],
  notes: {
    qbRead: "Key weakside 4i/5 DE; if crashes, keep or fire glance behind scraping Will LB.",
    lineBlocking: "Inside zone track; C/RG combo 0-tech to Mike; LT reaches 4i weak.",
    philosophyReason: "Neutralizes Mike scraping over the top while punishing 0-tech penetration with weakside glance RPO.",
    hotRoute: "F on immediate bubble/flat if Nickel blitzes",
    coachingCue: "QB do not rush mesh - let Will declare flow before glance throw"
  }
};

export const GUN_TREY_BOOT_PLAY: Play = {
  id: "play-gun-trey-split-boot",
  name: "Gun Trey - Split-Zone Weakside Boot vs 3-4 Over",
  formationOffense: "11 Personnel Gun Trey Open",
  frontDefense: "3-4 Over Front",
  category: "pass_action",
  primaryRunConcept: "Split-Zone Read",
  counterAction: "Weakside Boot/Leak",
  targetFront: "3-4 Over",
  tags: ["play-action", "bootleg", "split-zone", "flood-weak", "3-4-counter"],
  situation: ["1st & 10", "2nd & Short", "Red Zone High"],
  players: [
    // Offense
    { id: "X",  label: "X",  side: "offense", x: 100, y: 380, assignmentTitle: "Over Route", assignmentNotes: "Deep over crosser from weakside to strongside at 14 yds.", coachingKeys: ["Clear under safety", "Catch on run"] },
    { id: "LT", label: "LT", side: "offense", x: 360, y: 380, assignmentTitle: "Zone Slide", assignmentNotes: "Slide protect backside C-gap.", technique: "Slide Right" },
    { id: "LG", label: "LG", side: "offense", x: 420, y: 380, assignmentTitle: "Zone Slide", assignmentNotes: "Slide protect A-gap.", technique: "Slide Right" },
    { id: "C",  label: "C",  side: "offense", x: 480, y: 380, assignmentTitle: "Turn & Seal", assignmentNotes: "Reach nose; seal strongside.", technique: "Drive Seal" },
    { id: "RG", label: "RG", side: "offense", x: 540, y: 380, assignmentTitle: "Zone Slide", assignmentNotes: "Slide protect B-gap.", technique: "Slide Right" },
    { id: "RT", label: "RT", side: "offense", x: 600, y: 380, assignmentTitle: "Zone Slide", assignmentNotes: "Hinge and protect edge.", technique: "Hinge" },
    { id: "Y",  label: "Y",  side: "offense", x: 660, y: 380, assignmentTitle: "Split Sift & Boot Leak", assignmentNotes: "Wham fake on backside end, then leak to weak boundary flat.", coachingKeys: ["Chop-step at edge", "Slip past rushing OLB into open flat"] },
    { id: "H",  label: "H",  side: "offense", x: 730, y: 380, assignmentTitle: "Corner Route", assignmentNotes: "Stem vertical 10 yds, break 45 degrees to corner flag.", coachingKeys: ["Hold safety inside"] },
    { id: "Z",  label: "Z",  side: "offense", x: 820, y: 380, assignmentTitle: "Speed Out / Stop", assignmentNotes: "Quick out at 6 yards to hold boundary corner.", coachingKeys: ["Snap hips on cut"] },
    { id: "QB", label: "QB", side: "offense", x: 480, y: 460, assignmentTitle: "Bootleg Action", assignmentNotes: "Fake zone right to RB; roll weak left on naked boot.", coachingKeys: ["Deep 5-step boot angle", "Read Y leak to X over"] },
    { id: "RB", label: "RB", side: "offense", x: 530, y: 460, assignmentTitle: "Zone Fake", assignmentNotes: "Fierce zone run track right; sell downhill contact.", coachingKeys: ["Pocket mesh arms", "Attack frontside B-gap"] },

    // Defense (3-4 Over)
    { id: "def_cb1", label: "CB", side: "defense", x: 100, y: 280, assignmentTitle: "Deep 1/3", assignmentNotes: "Backpedal on snap." },
    { id: "def_olb1",label: "OLB",side: "defense", x: 280, y: 340, assignmentTitle: "Backside Edge", assignmentNotes: "Bites hard on RB zone fake right; leaves flat open." },
    { id: "def_de1", label: "DE", side: "defense", x: 380, y: 345, assignmentTitle: "4-Tech DT", assignmentNotes: "Occupied by slide protection." },
    { id: "def_nt",  label: "NT", side: "defense", x: 470, y: 345, assignmentTitle: "Nose Tackle", assignmentNotes: "Anchors A-gap." },
    { id: "def_ilb1",label: "ILB",side: "defense", x: 420, y: 290, assignmentTitle: "Backside ILB", assignmentNotes: "Flows right with zone steps." },
    { id: "def_ilb2",label: "ILB",side: "defense", x: 540, y: 290, assignmentTitle: "Playside ILB", assignmentNotes: "Flows to C-gap." },
    { id: "def_de2", label: "DE", side: "defense", x: 590, y: 345, assignmentTitle: "5-Tech DE", assignmentNotes: "Contain edge." },
    { id: "def_olb2",label: "OLB",side: "defense", x: 680, y: 340, assignmentTitle: "Strong OLB", assignmentNotes: "Drops to hook-curl." },
    { id: "def_cb2", label: "CB", side: "defense", x: 840, y: 280, assignmentTitle: "Cover 3 Deep", assignmentNotes: "Deep third strong." },
    { id: "def_fs",  label: "FS", side: "defense", x: 400, y: 160, assignmentTitle: "Free Safety", assignmentNotes: "Carries vertical route." },
    { id: "def_ss",  label: "SS", side: "defense", x: 650, y: 190, assignmentTitle: "Strong Safety", assignmentNotes: "Bite on deep corner." }
  ],
  actions: [
    { id: "b_y", playerId: "Y", type: "pass_route", endMarker: "arrow", points: [{ x: 660, y: 380, isSharp: false }, { x: 450, y: 440, isSharp: false }, { x: 260, y: 430, isSharp: false }, { x: 180, y: 350, isSharp: false }], isCurved: true, label: "Boot Leak" },
    { id: "b_qb", playerId: "QB", type: "motion", endMarker: "arrow", points: [{ x: 480, y: 460, isSharp: false }, { x: 380, y: 480, isSharp: false }, { x: 280, y: 440, isSharp: false }], isCurved: true, label: "Naked Boot" },
    { id: "b_rb", playerId: "RB", type: "run_block", endMarker: "arrow", points: [{ x: 530, y: 460, isSharp: false }, { x: 620, y: 380, isSharp: false }], isCurved: false, label: "Zone Fake Track" },
    { id: "b_x", playerId: "X", type: "pass_route", endMarker: "arrow", points: [{ x: 100, y: 380, isSharp: false }, { x: 240, y: 250, isSharp: false }, { x: 500, y: 220, isSharp: false }], isCurved: true, label: "14-Yd Over Cross" },
    { id: "b_h", playerId: "H", type: "pass_route", endMarker: "arrow", points: [{ x: 730, y: 380, isSharp: false }, { x: 740, y: 260, isSharp: true }, { x: 860, y: 170, isSharp: false }], isCurved: true, label: "Deep Corner" },
    { id: "b_z", playerId: "Z", type: "pass_route", endMarker: "arrow", points: [{ x: 820, y: 380, isSharp: false }, { x: 880, y: 320, isSharp: true }], isCurved: false, label: "6-Yd Out" }
  ],
  notes: {
    qbRead: "Boot progression: 1. Y leak in flat; 2. X over crossing face of safety; 3. Run for 1st down.",
    lineBlocking: "Full zone slide right; sell hard reach to pull linebackers right.",
    philosophyReason: "Exploits 3-4 Over back-side edge crash while giving the QB high-percentage open grass in the boundary.",
    hotRoute: "Y flat immediate check",
    coachingCue: "Y must convincingly sell the sift block before slipping the edge"
  }
};

export const PISTOL_COUNTER_TREY_PLAY: Play = {
  id: "play-pistol-counter-trey",
  name: "Pistol 12P - Counter GT vs 4-2-5 Nickel",
  formationOffense: "Pistol 12 Personnel Ace Wing",
  frontDefense: "4-2-5 Nickel Over",
  category: "run",
  primaryRunConcept: "Pin & Pull",
  counterAction: "Play-Action Seam",
  targetFront: "4-2-5 Nickel",
  tags: ["counter-gt", "gap-scheme", "pull-block", "4-2-5-punisher"],
  situation: ["3rd & 2", "Goal Line", "Aggressive LB flow"],
  players: [
    // Offense
    { id: "X",  label: "X",  side: "offense", x: 120, y: 380, assignmentTitle: "Stalk Block", assignmentNotes: "Stalk corner; prevent secondary run fill.", technique: "Stalk" },
    { id: "LT", label: "LT", side: "offense", x: 360, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Angle down block on 3-tech DT; secure inside gap.", technique: "Down Angle" },
    { id: "LG", label: "LG", side: "offense", x: 420, y: 380, assignmentTitle: "Pull & Kick", assignmentNotes: "Pull flat down LOS; kick out unblocked defensive end.", technique: "Skip Pull Kick" },
    { id: "C",  label: "C",  side: "offense", x: 480, y: 380, assignmentTitle: "Backside Reach", assignmentNotes: "Reach 1-tech nose; cut off back-side flow.", technique: "Back Reach" },
    { id: "RG", label: "RG", side: "offense", x: 540, y: 380, assignmentTitle: "Pull & Lead", assignmentNotes: "Follow LG pull; wrap up into hole on Mike LB.", technique: "Wrap Pull Lead" },
    { id: "RT", label: "RT", side: "offense", x: 600, y: 380, assignmentTitle: "Hinge Backside", assignmentNotes: "Step inside then hinge to protect backside rush.", technique: "Step & Hinge" },
    { id: "Y",  label: "Y",  side: "offense", x: 300, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Pin 7-tech DE inside with LT.", technique: "Pin Block" },
    { id: "Z",  label: "Z",  side: "offense", x: 880, y: 380, assignmentTitle: "Clearout / Post", assignmentNotes: "Run off safety.", technique: "Clear" },
    { id: "QB", label: "QB", side: "offense", x: 480, y: 450, assignmentTitle: "Reverse Pivot & Hand", assignmentNotes: "Reverse pivot to left; hand off to RB; boot fake right.", technique: "Reverse Pivot" },
    { id: "RB", label: "RB", side: "offense", x: 480, y: 530, assignmentTitle: "Counter Step & Cut", assignmentNotes: "Counter step right, press behind pulling RG, explode in alley.", technique: "Counter Cut" }
  ],
  actions: [
    { id: "c_lg", playerId: "LG", type: "pull_block", endMarker: "tbar", points: [{ x: 420, y: 380 }, { x: 370, y: 410 }, { x: 260, y: 370 }], isCurved: true, label: "Kick Out DE" },
    { id: "c_rg", playerId: "RG", type: "pull_block", endMarker: "tbar", points: [{ x: 540, y: 380 }, { x: 450, y: 415 }, { x: 330, y: 350 }, { x: 310, y: 290 }], isCurved: true, label: "Wrap to Mike" },
    { id: "c_lt", playerId: "LT", type: "run_block", endMarker: "tbar", points: [{ x: 360, y: 380 }, { x: 390, y: 345 }], isCurved: false, label: "Down on 3-Tech" },
    { id: "c_y",  playerId: "Y",  type: "run_block", endMarker: "tbar", points: [{ x: 300, y: 380 }, { x: 330, y: 345 }], isCurved: false, label: "Pin DE" },
    { id: "c_rb", playerId: "RB", type: "run_block", endMarker: "arrow", points: [{ x: 480, y: 530 }, { x: 510, y: 500 }, { x: 430, y: 440 }, { x: 320, y: 320 }, { x: 300, y: 200 }], isCurved: true, label: "Counter Track" }
  ],
  notes: {
    qbRead: "Presnap confirm box count. If overhang apex creeps into box, check to seam glance.",
    lineBlocking: "Down blocks by LT and Y pin the strongside edge; Guard kicks out DE, Tackle wraps for Mike.",
    philosophyReason: "Crushes over-pursuing 4-2-5 Nickel linebackers by changing gap leverage and building an impenetrable double-pull alley.",
    hotRoute: "Z slant if safety rotates down",
    coachingCue: "RB be patient on counter step; wait for RG wrap block before bursting vertical"
  }
};

export const INITIAL_PLAYBOOK: PlaybookFile = {
  version: "1.0.0",
  title: "Modern Offensive Philosophy & System Playbook",
  philosophySummary: "Multiple-personnel hybrid scheme prioritizing gap-control manipulation, high-low conflict creation against modern odd/over fronts, and complementary RPO / Boot counter-actions.",
  plays: [
    DEFAULT_WISHBONE_PLAY,
    GUN_TREY_BOOT_PLAY,
    PISTOL_COUNTER_TREY_PLAY
  ]
};

export const DEFAULT_FORMATIONS: Formation[] = [
  {
    id: "formation-wishbone-21",
    name: "Shotgun Wishbone 21 Pers",
    side: "offense",
    personnel: "21 Personnel",
    description: "Heavy backfield with H & Z flankers flanking QB in gun; Y tight wing.",
    players: DEFAULT_WISHBONE_PLAY.players.filter(p => p.side === 'offense'),
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-3-5-odd",
    name: "3-5 Odd Front (0-Tech Nose)",
    side: "defense",
    personnel: "3-5-3 Defense",
    description: "3 down linemen with 0-tech head-up nose, 4i DEs, 3 second-level LBs and 2 apex overhangs.",
    players: DEFAULT_WISHBONE_PLAY.players.filter(p => p.side === 'defense'),
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-gun-trey-11",
    name: "11 Personnel Gun Trey Open",
    side: "offense",
    personnel: "11 Personnel",
    description: "Single-back 3x1 spread formation creating boundary 1-on-1 and field passing triangles.",
    players: GUN_TREY_BOOT_PLAY.players.filter(p => p.side === 'offense'),
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-3-4-over",
    name: "3-4 Over Front",
    side: "defense",
    personnel: "3-4 Defense",
    description: "Two-gap front shifted toward the field / strongside with stand-up edge rushers.",
    players: GUN_TREY_BOOT_PLAY.players.filter(p => p.side === 'defense'),
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-pistol-12-ace",
    name: "Pistol 12 Personnel Ace Wing",
    side: "offense",
    personnel: "12 Personnel",
    description: "Downhill Pistol alignment with tight end attached and wing tight-end for double-pull gap schemes.",
    players: PISTOL_COUNTER_TREY_PLAY.players.filter(p => p.side === 'offense'),
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-4-2-5-nickel",
    name: "4-2-5 Nickel Over",
    side: "defense",
    personnel: "4-2-5 Nickel",
    description: "Modern 4-down front with twin inside backers and athletic nickel safety playing the alley.",
    players: PISTOL_COUNTER_TREY_PLAY.players.filter(p => p.side === 'defense'),
    createdAt: new Date().toISOString()
  }
];

