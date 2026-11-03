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
  },
  {
    id: "formation-spread-2x2",
    name: "Spread 2x2 Open (Doubles)",
    side: "offense",
    personnel: "10/11 Personnel",
    description: "Balanced 4-wide spread formation with twin receivers to both boundary and field, opening up the box for interior zone and quick RPO glance/bubbles.",
    players: [
      { id: "off_2x2_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Pro / Zone", assignmentNotes: "Vertical pass set on edge or reach 5-tech on zone." },
      { id: "off_2x2_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Zone Combo", assignmentNotes: "Anchor A/B gap or combo with Center to Mike." },
      { id: "off_2x2_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Anchor Point", assignmentNotes: "Declare Mike; anchor Nose." },
      { id: "off_2x2_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Zone Combo", assignmentNotes: "Anchor A/B gap or combo with Center to Mike." },
      { id: "off_2x2_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Pro / Zone", assignmentNotes: "Vertical pass set on edge." },
      { id: "off_2x2_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 460, assignmentTitle: "Shotgun Operator", assignmentNotes: "Read overhang apex defender or high-low safety." },
      { id: "off_2x2_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 535, y: 460, assignmentTitle: "Zone Track / Check", assignmentNotes: "Aiming point inside leg of guard or scan for blitz pickup." },
      { id: "off_2x2_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Boundary Split End", assignmentNotes: "Iso 1-on-1 backside glance, hitch, or fade." },
      { id: "off_2x2_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 240, y: 395, assignmentTitle: "Slot Left", assignmentNotes: "Seam, bubble screen, or option route." },
      { id: "off_2x2_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 720, y: 395, assignmentTitle: "Slot Right", assignmentNotes: "Seam stretch, arrow, or snag route." },
      { id: "off_2x2_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 395, assignmentTitle: "Field Flanker", assignmentNotes: "Comeback, post, or quick out." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-spread-trips-3x1",
    name: "Spread 3x1 Trips Open",
    side: "offense",
    personnel: "11 Personnel",
    description: "Unbalanced spread formation creating a 3-receiver triangle flood to the field side with single isolated receiver to the boundary.",
    players: [
      { id: "off_3x1_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Pro / Zone", assignmentNotes: "Protect backside edge." },
      { id: "off_3x1_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Zone Track", assignmentNotes: "Slide protect A-gap." },
      { id: "off_3x1_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center", assignmentNotes: "Anchor Nose; declare Mike." },
      { id: "off_3x1_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Zone Track", assignmentNotes: "Step to 3-tech." },
      { id: "off_3x1_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Pro / Zone", assignmentNotes: "Protect strong edge." },
      { id: "off_3x1_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 460, assignmentTitle: "Shotgun QB", assignmentNotes: "Read trips triangle progression or backside 1-on-1." },
      { id: "off_3x1_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 425, y: 460, assignmentTitle: "Offset RB", assignmentNotes: "Zone run track or check-release to boundary flat." },
      { id: "off_3x1_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Backside Iso X", assignmentNotes: "Solo boundary match vs CB." },
      { id: "off_3x1_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 680, y: 395, assignmentTitle: "Inside Trips (Y)", assignmentNotes: "Seam, shallow crosser, or stick route." },
      { id: "off_3x1_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 760, y: 395, assignmentTitle: "Middle Trips (H)", assignmentNotes: "Deep out, wheel, or bubble screen." },
      { id: "off_3x1_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 380, assignmentTitle: "Outside Trips (Z)", assignmentNotes: "Clearout vertical post or curl." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-pro-i-21",
    name: "Pro-I Formation",
    side: "offense",
    personnel: "21 Personnel",
    description: "Classic downhill power run formation under center with attached Tight End (Y) on the right, Fullback (FB) and Tailback (TB) aligned in an I-formation stack.",
    players: [
      { id: "off_proi_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Tackle Drive", assignmentNotes: "Base block 5-tech or reach." },
      { id: "off_proi_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Guard Drive / Pull", assignmentNotes: "Drive block 3-tech or pull skip for kickout." },
      { id: "off_proi_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center Anchor", assignmentNotes: "Snap to QB under center; block 0/1-tech." },
      { id: "off_proi_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Playside Guard", assignmentNotes: "Combo with Center/Tackle to Mike." },
      { id: "off_proi_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Playside Tackle", assignmentNotes: "Drive block 4/5-tech DE." },
      { id: "off_proi_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 380, assignmentTitle: "Attached Tight End", assignmentNotes: "Down block 7-tech DE or release on boot/seam." },
      { id: "off_proi_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 415, assignmentTitle: "Under Center QB", assignmentNotes: "Reverse pivot handoff or play-action bootleg." },
      { id: "off_proi_fb", label: "FB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 465, assignmentTitle: "Lead Fullback", assignmentNotes: "Lead through hole; isolate Sam or Mike LB." },
      { id: "off_proi_tb", label: "TB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 525, assignmentTitle: "Deep Tailback", assignmentNotes: "Take downhill handoff; press hole and cut off FB block." },
      { id: "off_proi_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Split End Left", assignmentNotes: "Stalk block corner or post route." },
      { id: "off_proi_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 395, assignmentTitle: "Flanker Right", assignmentNotes: "Crack safety or deep play-action post." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-single-back-ace",
    name: "Single-Back Ace (12 Personnel)",
    side: "offense",
    personnel: "12 Personnel",
    description: "Balanced two tight-end formation with dual attached TEs (Y right, H left) creating an 8-man box front for dual-sided zone, pin & pull, and play-action seams.",
    players: [
      { id: "off_ace_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 300, y: 380, assignmentTitle: "Inline Tight End Left", assignmentNotes: "Pin 5-tech DE or release on seam." },
      { id: "off_ace_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Left Tackle", assignmentNotes: "Zone combo with LG." },
      { id: "off_ace_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Left Guard", assignmentNotes: "Zone step A-gap." },
      { id: "off_ace_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center", assignmentNotes: "Reach nose." },
      { id: "off_ace_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Right Guard", assignmentNotes: "Zone step A/B gap." },
      { id: "off_ace_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Right Tackle", assignmentNotes: "Combo with Y on DE to Sam." },
      { id: "off_ace_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 380, assignmentTitle: "Inline Tight End Right", assignmentNotes: "Seal edge or climb to safety." },
      { id: "off_ace_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 460, assignmentTitle: "Gun QB", assignmentNotes: "Zone read mesh or high-low safety read." },
      { id: "off_ace_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 530, assignmentTitle: "Dot Back", assignmentNotes: "Aim for playside A-gap; cut off Center." },
      { id: "off_ace_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 395, assignmentTitle: "Wide Receiver Left", assignmentNotes: "Clearout vertical or comeback." },
      { id: "off_ace_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 395, assignmentTitle: "Wide Receiver Right", assignmentNotes: "Clearout vertical or comeback." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-shotgun-bunch-11",
    name: "Shotgun Bunch Right",
    side: "offense",
    personnel: "11 Personnel",
    description: "Compressed 3-man bunch triangle on the strong side to defeat press man coverage through natural picks, rub routes, and sprint-out concepts.",
    players: [
      { id: "off_bnch_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Backside Pass Pro", assignmentNotes: "Slide protect edge." },
      { id: "off_bnch_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pass Pro", assignmentNotes: "Anchor A-gap." },
      { id: "off_bnch_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center", assignmentNotes: "Step to Mike." },
      { id: "off_bnch_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pass Pro", assignmentNotes: "Anchor B-gap." },
      { id: "off_bnch_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Pro", assignmentNotes: "Vertical set." },
      { id: "off_bnch_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 460, assignmentTitle: "Shotgun QB", assignmentNotes: "Read bunch spacing (corner, arrow, mesh)." },
      { id: "off_bnch_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 425, y: 460, assignmentTitle: "Check Release RB", assignmentNotes: "Scan backside blitz then check into boundary flat." },
      { id: "off_bnch_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Isolated X", assignmentNotes: "1-on-1 boundary match." },
      { id: "off_bnch_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 720, y: 380, assignmentTitle: "Bunch Point (Y)", assignmentNotes: "Point of bunch; stem vertical corner or seam." },
      { id: "off_bnch_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 675, y: 410, assignmentTitle: "Bunch Inside (H)", assignmentNotes: "Inside of bunch; shallow rub or quick flat." },
      { id: "off_bnch_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 765, y: 410, assignmentTitle: "Bunch Outside (Z)", assignmentNotes: "Outside of bunch; sprint arrow flat or deep post." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-pistol-diamond-20",
    name: "Pistol Diamond (20 Personnel)",
    side: "offense",
    personnel: "20 Personnel",
    description: "Triple-option inverted diamond formation with 3 backs surrounding the Pistol QB for downhill power read, triple option, and misdirection counter sweeps.",
    players: [
      { id: "off_dmnd_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Secure inside B-gap." },
      { id: "off_dmnd_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pull / Zone", assignmentNotes: "Skip pull or zone track." },
      { id: "off_dmnd_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center", assignmentNotes: "Drive block 0-tech." },
      { id: "off_dmnd_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pull / Zone", assignmentNotes: "Drive block 3-tech." },
      { id: "off_dmnd_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Down block 5-tech." },
      { id: "off_dmnd_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 445, assignmentTitle: "Pistol QB", assignmentNotes: "Read DE on zone read; keep or pitch." },
      { id: "off_dmnd_f1", label: "F1", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 455, assignmentTitle: "Left Flanker Back", assignmentNotes: "Lead through hole on LB or motion across." },
      { id: "off_dmnd_f2", label: "F2", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 455, assignmentTitle: "Right Flanker Back", assignmentNotes: "Lead block on perimeter force or pitch track." },
      { id: "off_dmnd_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 525, assignmentTitle: "Pistol Tailback", assignmentNotes: "Downhill dive path or mesh track." },
      { id: "off_dmnd_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Boundary Receiver", assignmentNotes: "Stalk block CB." },
      { id: "off_dmnd_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 380, assignmentTitle: "Field Receiver", assignmentNotes: "Stalk block CB." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "formation-empty-3x2",
    name: "Empty 3x2 (Quads Spread)",
    side: "offense",
    personnel: "10 Personnel",
    description: "Empty backfield with 5 receivers spread across the formation, stretching the defense horizontally and creating clear blitz windows for quick passing.",
    players: [
      { id: "off_mpty_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Quick Pass Pro", assignmentNotes: "Short 2-step set." },
      { id: "off_mpty_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Quick Pass Pro", assignmentNotes: "Protect A-gap." },
      { id: "off_mpty_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Center", assignmentNotes: "Protect midline." },
      { id: "off_mpty_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Quick Pass Pro", assignmentNotes: "Protect B-gap." },
      { id: "off_mpty_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Quick Pass Pro", assignmentNotes: "Short 2-step set." },
      { id: "off_mpty_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 460, assignmentTitle: "Empty Gun QB", assignmentNotes: "Catch, plant, throw; read hot blitz leverage." },
      { id: "off_mpty_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 110, y: 380, assignmentTitle: "Boundary Outside (X)", assignmentNotes: "Quick hitch or fade." },
      { id: "off_mpty_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 230, y: 395, assignmentTitle: "Boundary Slot (H)", assignmentNotes: "Slant, out, or whip route." },
      { id: "off_mpty_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 395, assignmentTitle: "Field Inner Slot (Y)", assignmentNotes: "Stick or option route." },
      { id: "off_mpty_f",  label: "F",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 750, y: 395, assignmentTitle: "Field Middle Slot (F)", assignmentNotes: "Speed out or seam." },
      { id: "off_mpty_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 870, y: 380, assignmentTitle: "Field Outside (Z)", assignmentNotes: "Vertical clearout." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "front-4-3-over",
    name: "4-3 Over Front",
    side: "defense",
    personnel: "4-3 Base Defense",
    description: "Standard 4-3 front with 3-tech DT to the offensive strong side, 1-tech nose tackle weak, and Sam linebacker over the tight end.",
    players: [
      { id: "def_43o_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 462, y: 348, technique: "1-Tech Weak", assignmentTitle: "1-Tech Shade", assignmentNotes: "Control weak A-gap; anchor against Center/LG double team." },
      { id: "def_43o_dt", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 562, y: 348, technique: "3-Tech Strong", assignmentTitle: "3-Tech DT", assignmentNotes: "Penetrate strong B-gap; disrupt zone and pull tracks." },
      { id: "def_43o_dew", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 335, y: 348, technique: "5-Tech Weak", assignmentTitle: "Weak 5-End", assignmentNotes: "Control weak C-gap / edge contain; QB option key." },
      { id: "def_43o_des", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 625, y: 348, technique: "5-Tech Strong", assignmentTitle: "Strong 5-End", assignmentNotes: "Control C-gap between RT and TE; squeeze off-tackle." },
      { id: "def_43o_w", label: "W", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 295, technique: "30 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Scrape weak B-gap to perimeter on run flow." },
      { id: "def_43o_m", label: "M", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 295, technique: "20 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Plug strong A/B gap downhill on run." },
      { id: "def_43o_s", label: "S", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 675, y: 320, technique: "Apex Strong", assignmentTitle: "Sam Linebacker", assignmentNotes: "Apex / overhang over Tight End; force perimeter runs inside." },
      { id: "def_43o_cb1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 275, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Cover 3 deep outside 1/3." },
      { id: "def_43o_cb2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 848, y: 275, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Cover 3 deep outside 1/3." },
      { id: "def_43o_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 155, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Deep middle 1/3 field safety." },
      { id: "def_43o_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 560, y: 235, technique: "Robber Strong", assignmentTitle: "Strong Safety", assignmentNotes: "Down safety; curl-flat defender and primary run fit in strong alley." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "front-4-3-under",
    name: "4-3 Under Front",
    side: "defense",
    personnel: "4-3 Base Defense",
    description: "4-3 front setting the 3-tech DT to the weak side and 1-tech nose to the strong side, leaving Sam LB on the line of scrimmage over the TE.",
    players: [
      { id: "def_43u_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 498, y: 348, technique: "1-Tech Strong", assignmentTitle: "1-Tech Strong Shade", assignmentNotes: "Control strong A-gap between C and RG; occupy double team." },
      { id: "def_43u_dt", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 398, y: 348, technique: "3-Tech Weak", assignmentTitle: "Weak 3-Tech DT", assignmentNotes: "Penetrate weak B-gap; defeat LG single block to blow up counter/zone." },
      { id: "def_43u_dew", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 335, y: 348, technique: "5-Tech Weak", assignmentTitle: "Weak 5-End", assignmentNotes: "Speed rush weak C-gap edge; contain backside keeper." },
      { id: "def_43u_des", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 642, y: 348, technique: "7-Tech Strong", assignmentTitle: "Strong 7-End", assignmentNotes: "Control inside shoulder of Tight End; lock up C-gap." },
      { id: "def_43u_s", label: "S", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 695, y: 335, technique: "9-Tech Strong", assignmentTitle: "Sam Linebacker (LOS)", assignmentNotes: "Stand-up edge defender outside TE; set hard edge in D-gap." },
      { id: "def_43u_m", label: "M", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 570, y: 295, technique: "30 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Stack over strong B-gap; downhill plugger on off-tackle power." },
      { id: "def_43u_w", label: "W", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 450, y: 295, technique: "10 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Stack weak A-gap; fast flow on weak inside zone or bootleg." },
      { id: "def_43u_cb1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 275, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Deep outside third." },
      { id: "def_43u_cb2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 848, y: 275, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Deep outside third." },
      { id: "def_43u_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 155, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Middle of field post." },
      { id: "def_43u_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 580, y: 235, technique: "Robber Strong", assignmentTitle: "Strong Safety", assignmentNotes: "Intermediate robber and secondary strong-side run support." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "front-3-4-mint",
    name: "Mint / Tite Front",
    side: "defense",
    personnel: "Mint / Tite Front",
    description: "Saban/Smart Tite front closing both interior B-gaps with dual 4i ends and 0-nose, forcing runs to perimeter where linebackers scrape free.",
    players: [
      { id: "def_mint_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 348, technique: "0-Tech", assignmentTitle: "0-Tech Nose", assignmentNotes: "Anchor A-gaps; hold Center and RG combo." },
      { id: "def_mint_de1", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 378, y: 348, technique: "4i-Tech Weak", assignmentTitle: "Weak 4i-End", assignmentNotes: "Plug weak B-gap tight; forbid interior climb to LB." },
      { id: "def_mint_de2", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 582, y: 348, technique: "4i-Tech Strong", assignmentTitle: "Strong 4i-End", assignmentNotes: "Plug strong B-gap tight; forbid interior climb to LB." },
      { id: "def_mint_w", label: "W", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 295, technique: "30 Stack Weak", assignmentTitle: "Will Backer", assignmentNotes: "Free to scrape C-gap and sideline on spill." },
      { id: "def_mint_m", label: "M", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 570, y: 295, technique: "30 Stack Strong", assignmentTitle: "Mike Backer", assignmentNotes: "Free to scrape strong C-gap and perimeter on spill." },
      { id: "def_mint_jk", label: "JK", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 305, y: 335, technique: "9-Tech Weak", assignmentTitle: "Jack Backer", assignmentNotes: "Stand-up backside edge; force cutback." },
      { id: "def_mint_st", label: "ST", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 740, y: 320, technique: "Apex Strong", assignmentTitle: "Star Overhang", assignmentNotes: "Overhang force player; jam slot and trigger on perimeter runs." },
      { id: "def_mint_cb1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 128, y: 335, technique: "Press CB Left", assignmentTitle: "Boundary Corner", assignmentNotes: "Press-bail boundary." },
      { id: "def_mint_cb2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 852, y: 335, technique: "Press CB Right", assignmentTitle: "Field Corner", assignmentNotes: "Press-bail field." },
      { id: "def_mint_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 340, y: 195, technique: "2-High Safety Left", assignmentTitle: "Split Safety Left", assignmentNotes: "Cover 4 split half/quarter safety." },
      { id: "def_mint_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 620, y: 195, technique: "2-High Safety Right", assignmentTitle: "Split Safety Right", assignmentNotes: "Cover 4 split half/quarter safety." }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "front-bear-46",
    name: "Bear / 46 Front",
    side: "defense",
    personnel: "Bear Front (46 Defense)",
    description: "Historic Buddy Ryan Bear front covering Center and both Guards with 3 interior defensive linemen and twin edge rushers.",
    players: [
      { id: "def_bear_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 348, technique: "0-Tech", assignmentTitle: "0-Tech Nose", assignmentNotes: "Destroy Center on snap; anchor midline." },
      { id: "def_bear_dt1", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 398, y: 348, technique: "3-Tech Weak", assignmentTitle: "Weak 3-Tech", assignmentNotes: "Cover weak guard head/outside; penetrate weak B-gap." },
      { id: "def_bear_dt2", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 562, y: 348, technique: "3-Tech Strong", assignmentTitle: "Strong 3-Tech", assignmentNotes: "Cover strong guard head/outside; penetrate strong B-gap." },
      { id: "def_bear_de1", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 305, y: 348, technique: "9-Tech Weak", assignmentTitle: "Weak Edge Rusher", assignmentNotes: "Speed contain rush off edge." },
      { id: "def_bear_de2", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 695, y: 348, technique: "9-Tech Strong", assignmentTitle: "Strong Edge Rusher", assignmentNotes: "Speed contain rush off edge." },
      { id: "def_bear_m", label: "M", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 295, technique: "00 Stack", assignmentTitle: "Mike Linebacker", assignmentNotes: "Clean A-gap plugger; fill aggressively downhill." },
      { id: "def_bear_w", label: "W", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 450, y: 295, technique: "10 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Stack weak A/B gap; blitz or cover RB." },
      { id: "def_bear_s", label: "S", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 510, y: 295, technique: "10 Stack Strong", assignmentTitle: "Sam Linebacker", assignmentNotes: "Stack strong A/B gap; blitz or cover RB." },
      { id: "def_bear_cb1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 128, y: 335, technique: "Press CB Left", assignmentTitle: "Press Corner Left", assignmentNotes: "Zero man coverage." },
      { id: "def_bear_cb2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 852, y: 335, technique: "Press CB Right", assignmentTitle: "Press Corner Right", assignmentNotes: "Zero man coverage." },
      { id: "def_bear_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 155, technique: "Single-High FS", assignmentTitle: "Single High Free Safety", assignmentNotes: "Center field hawk; sole deep safety in Cover 1/0." }
    ],
    createdAt: new Date().toISOString()
  }
];

