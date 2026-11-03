import type { Play } from '../types/playbook';

/**
 * 1. Y-STICK CONCEPT (11 Personnel, 3x1 Trips Open)
 * Foundational 3-step quick passing concept creating a 3-man horizontal triangle:
 * - #1 Outside WR: Mandatory Outside Release (MOR) Go / Clearout
 * - #2 Slot WR: 5-Yard Stick (stems vertical, plants outside foot, turns chest to QB)
 * - #3 Inner Slot: Speed Flat / Arrow to numbers
 * - Backfield: Check & Release weak flat
 * - Backside WR: 3-step Slant alert
 */
export const STICK_TRIPS_11P_PLAY: Play = {
  id: "play-pass-stick-11p-trips",
  name: "Gun 11P Trips - Y-Stick vs 4-3 Over",
  formationOffense: "Spread 3x1 Trips Open",
  frontDefense: "4-3 Over Front",
  category: "pass_dropback",
  primaryPassConcept: "stick",
  personnel: "11",
  receiverAlignment: "3x1",
  tags: ["stick", "11-personnel", "trips", "quick-game", "triangle-read", "spread"],
  situation: ["1st & 10", "2nd & 4", "3rd & 3-5", "Red Zone"],
  players: [
    // Offense (11 Personnel: 1 RB, 1 TE, 3 WRs)
    { id: "off_stk_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Pro (Man)", assignmentNotes: "Kick step; anchor against weak 5-tech DE.", technique: "Pass Set" },
    { id: "off_stk_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pass Pro (Slide)", assignmentNotes: "Step to Center; help on 1-tech nose tackle.", technique: "Pass Set" },
    { id: "off_stk_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Anchor Center", assignmentNotes: "Snap and anchor weak A-gap nose shade.", technique: "Pass Set" },
    { id: "off_stk_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pass Pro (Slide)", assignmentNotes: "Set strong B-gap vs 3-tech DT.", technique: "Pass Set" },
    { id: "off_stk_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Pro (Slide)", assignmentNotes: "Slide strong C-gap vs 5-tech DE.", technique: "Pass Set" },
    { id: "off_stk_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 465, assignmentTitle: "3-Step Catch & Throw", assignmentNotes: "Take 3-step gun drop. Triangle read on Apex/Nickel defender: If Nickel jumps flat -> throw Stick. If Nickel sits on Stick -> throw Flat.", coachingKeys: ["Rhythm drop - ball out on 3rd step", "Eyes on Apex linebacker/nickel"] },
    { id: "off_stk_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 430, y: 470, assignmentTitle: "Check & Release", assignmentNotes: "Scan weak A/B gap blitz; leak to weak boundary flat.", coachingKeys: ["Eyes on Will LB", "Soft hands outlet"] },
    { id: "off_stk_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Backside 3-Step Slant", assignmentNotes: "Win inside leverage on single-high man coverage alert.", coachingKeys: ["3 steps vertical then 45-degree cut", "Attack CB inside shoulder"] },
    { id: "off_stk_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 650, y: 395, assignmentTitle: "#3 Speed Flat / Arrow", assignmentNotes: "Sprint to numbers at 2-3 yards depth; stretch horizontal alley.", coachingKeys: ["Sprint at snap", "Pull Apex defender wide"] },
    { id: "off_stk_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 740, y: 395, assignmentTitle: "#2 5-Yard Stick", assignmentNotes: "Stem 5 yards vertical; plant outside foot; turn chest square to QB; sit in void.", coachingKeys: ["Do not let Mike drift into window", "Present big chest target"] },
    { id: "off_stk_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 380, assignmentTitle: "#1 MOR Clearout Go", assignmentNotes: "Mandatory Outside Release; clear corner and field safety deep.", coachingKeys: ["Sell deep vertical threat", "Take CB with you"] },

    // Defense (4-3 Over Front - 11 players comfortably spaced off LOS)
    { id: "def_stk_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 462, y: 325, technique: "1-Tech Weak", assignmentTitle: "1-Tech Shade", assignmentNotes: "Weak A-gap rush." },
    { id: "def_stk_dt", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 562, y: 325, technique: "3-Tech Strong", assignmentTitle: "3-Tech DT", assignmentNotes: "Strong B-gap penetrate rush." },
    { id: "def_stk_dew",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 335, y: 325, technique: "5-Tech Weak", assignmentTitle: "Weak 5-End", assignmentNotes: "Edge pass rush contain." },
    { id: "def_stk_des",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 625, y: 325, technique: "5-Tech Strong", assignmentTitle: "Strong 5-End", assignmentNotes: "Strong edge rush." },
    { id: "def_stk_w",  label: "W",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 265, technique: "30 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Hook-curl weak; match RB release." },
    { id: "def_stk_m",  label: "M",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 265, technique: "20 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Middle hook zone; conflicted by Stick vs Slant." },
    { id: "def_stk_s",  label: "S",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 675, y: 300, technique: "Apex Strong", assignmentTitle: "Apex / Nickel Sam", assignmentNotes: "Conflict player: must defend H flat or Y stick." },
    { id: "def_stk_cb1",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 240, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Cover 3 deep 1/3 over X." },
    { id: "def_stk_cb2",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 240, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Bail deep over Z clearout." },
    { id: "def_stk_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 105, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Deep middle 1/3." },
    { id: "def_stk_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 640, y: 195, technique: "Robber Strong", assignmentTitle: "Strong Safety", assignmentNotes: "Field curl-flat robber." }
  ],
  actions: [
    { id: "a_stk_z", playerId: "off_stk_z", type: "pass_route", endMarker: "arrow", points: [{ x: 860, y: 380 }, { x: 875, y: 260 }, { x: 875, y: 120 }], isCurved: false, label: "MOR Clearout" },
    { id: "a_stk_y", playerId: "off_stk_y", type: "pass_route", endMarker: "arrow", points: [{ x: 740, y: 395 }, { x: 740, y: 330 }, { x: 730, y: 330, isSharp: true }], isCurved: false, label: "5-Yd Stick" },
    { id: "a_stk_h", playerId: "off_stk_h", type: "pass_route", endMarker: "arrow", points: [{ x: 650, y: 395 }, { x: 710, y: 375 }, { x: 810, y: 370 }], isCurved: true, label: "Speed Flat" },
    { id: "a_stk_x", playerId: "off_stk_x", type: "pass_route", endMarker: "arrow", points: [{ x: 120, y: 380 }, { x: 160, y: 320, isSharp: true }, { x: 250, y: 230 }], isCurved: false, label: "3-Step Slant" },
    { id: "a_stk_rb",playerId: "off_stk_rb",type: "pass_route", endMarker: "arrow", points: [{ x: 430, y: 470 }, { x: 380, y: 430 }, { x: 260, y: 400 }], isCurved: true, label: "Check Flat" },
    { id: "a_stk_lt",playerId: "off_stk_lt",type: "run_block",  endMarker: "tbar",  points: [{ x: 360, y: 380 }, { x: 345, y: 360 }], isCurved: false },
    { id: "a_stk_lg",playerId: "off_stk_lg",type: "run_block",  endMarker: "tbar",  points: [{ x: 420, y: 380 }, { x: 445, y: 360 }], isCurved: false },
    { id: "a_stk_c", playerId: "off_stk_c", type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 380 }, { x: 475, y: 360 }], isCurved: false },
    { id: "a_stk_rg",playerId: "off_stk_rg",type: "run_block",  endMarker: "tbar",  points: [{ x: 540, y: 380 }, { x: 550, y: 360 }], isCurved: false },
    { id: "a_stk_rt",playerId: "off_stk_rt",type: "run_block",  endMarker: "tbar",  points: [{ x: 600, y: 380 }, { x: 615, y: 360 }], isCurved: false }
  ],
  notes: {
    qbRead: "Pre-snap confirm single/two-high. Post-snap triangle read on Apex/Nickel defender: If Apex widens to H out -> throw Y Stick in hole. If Apex sinks on Stick -> throw H in flat. Backside X slant is single-high alert.",
    lineBlocking: "5-man half slide; C/RG/RT slide field, LT/LG man-on-man weak.",
    philosophyReason: "Classic 3-man triangle concept putting immediate horizontal and vertical stress on the overhang defender.",
    hotRoute: "H hot on blitz from Apex Sam",
    coachingCue: "QB rhythm drop: plant back foot and ball comes out instantly to Stick or Flat"
  }
};

/**
 * 2. SNAG / Y-CORNER CONCEPT (21 Personnel, Pro-Set 2x1)
 * High-low triangle passing concept with Corner, Snag mini-curl, and Flat shoot:
 * - #1 Outside WR: Snag / 5-yd mini-curl replacing Mike LB
 * - #2 Tight End: 10-12 yd Corner / 7-route over top
 * - Backfield FB: Shoot / Arrow route to stretch perimeter flat
 * - Backfield TB: Pass protection pickup
 * - Backside WR: 12-yd Post-Dig alert
 */
export const SNAG_PRO_SET_21P_PLAY: Play = {
  id: "play-pass-snag-21p-pro",
  name: "Pro-Set 21P - Snag / Y-Corner vs 3-4 Over",
  formationOffense: "Pro-I Formation",
  frontDefense: "3-4 Over Front",
  category: "pass_dropback",
  primaryPassConcept: "snag",
  personnel: "21",
  receiverAlignment: "2x1",
  tags: ["snag", "y-corner", "21-personnel", "triangle-read", "pro_style", "high-low"],
  situation: ["1st & 10", "Red Zone (15-5 yd)", "3rd & Medium", "Two-Minute Drill"],
  players: [
    // Offense (21 Personnel: 2 RBs, 1 TE, 2 WRs)
    { id: "off_sng_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Vertical set on weak OLB pass rusher." },
    { id: "off_sng_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor weak 4i DE." },
    { id: "off_sng_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor 0-tech Nose." },
    { id: "off_sng_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor strong 4i DE." },
    { id: "off_sng_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Fan to strong OLB edge rusher." },
    { id: "off_sng_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 470, assignmentTitle: "5-Step Under Center Drop", assignmentNotes: "High-low read on field cornerback: 1. Corner route (Y) over top. 2. Shoot/flat (FB) if CB bails. 3. Snag (Z) inside hole.", coachingKeys: ["Read CB hip angle at 5 yards", "Throw Corner before break on Cover 2"] },
    { id: "off_sng_fb", label: "FB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 515, assignmentTitle: "Arrow Shoot to Flat", assignmentNotes: "Speed release to strong flat; stress underneath corner/flat defender.", coachingKeys: ["Head up looking for ball immediately", "Stretch boundary"] },
    { id: "off_sng_tb", label: "TB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 560, assignmentTitle: "Pass Pro Scan", assignmentNotes: "Step to weak A/B gap; pick up blitzing Will LB.", coachingKeys: ["Square up on blitzer", "Stay in pocket"] },
    { id: "off_sng_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Backside 12-Yd Dig", assignmentNotes: "Climb 12 yards; square in-cut behind Mike LB.", coachingKeys: ["Snapshot window across hashes"] },
    { id: "off_sng_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 380, assignmentTitle: "#2 10-12 Yd Corner / 7-Route", assignmentNotes: "Stem 8 yards vertical, sell post inside, plant inside foot and break 45 degrees to corner pylon.", coachingKeys: ["Sell post to hold safety", "Break crisp at 10 yards"] },
    { id: "off_sng_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 850, y: 395, assignmentTitle: "#1 5-Yard Snag Mini-Curl", assignmentNotes: "Stem 5 yards vertical; pivot inside 90 degrees; sit in hook window vacated by Mike.", coachingKeys: ["Replace Mike's drop", "Present chest to QB"] },

    // Defense (3-4 Over Front - 11 players comfortably spaced off LOS)
    { id: "def_sng_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 325, technique: "0-Tech", assignmentTitle: "0-Tech Nose", assignmentNotes: "A-gap bull rush." },
    { id: "def_sng_de1",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 325, technique: "4i-Tech Weak", assignmentTitle: "Weak 4i-End", assignmentNotes: "Weak B-gap rush." },
    { id: "def_sng_de2",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 570, y: 325, technique: "4i-Tech Strong", assignmentTitle: "Strong 4i-End", assignmentNotes: "Strong B-gap rush." },
    { id: "def_sng_olbw",label: "OLB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 300, y: 315, technique: "9-Tech Weak", assignmentTitle: "Weak Edge Rusher", assignmentNotes: "Speed rush off weak edge." },
    { id: "def_sng_olbs",label: "OLB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 670, y: 315, technique: "9-Tech Strong", assignmentTitle: "Strong Edge Rusher", assignmentNotes: "Edge contain rush vs Y." },
    { id: "def_sng_w",  label: "W",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 265, technique: "20 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Hook-curl weak." },
    { id: "def_sng_m",  label: "M",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 265, technique: "20 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Hook-curl strong; conflicted by Snag." },
    { id: "def_sng_cb1",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 240, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Deep 1/3 boundary." },
    { id: "def_sng_cb2",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 848, y: 240, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Cover 2/3 corner; high-low conflict on Corner/Flat." },
    { id: "def_sng_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 145, technique: "2-High Safety Left", assignmentTitle: "Free Safety", assignmentNotes: "Deep half safety weak." },
    { id: "def_sng_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 145, technique: "2-High Safety Right", assignmentTitle: "Strong Safety", assignmentNotes: "Deep half safety strong; threatened by Corner route." }
  ],
  actions: [
    { id: "a_sng_y", playerId: "off_sng_y", type: "pass_route", endMarker: "arrow", points: [{ x: 660, y: 380 }, { x: 680, y: 280, isSharp: true }, { x: 790, y: 180 }], isCurved: false, label: "10-Yd Corner" },
    { id: "a_sng_z", playerId: "off_sng_z", type: "pass_route", endMarker: "arrow", points: [{ x: 850, y: 395 }, { x: 840, y: 330, isSharp: true }, { x: 740, y: 330 }], isCurved: false, label: "5-Yd Snag" },
    { id: "a_sng_fb",playerId: "off_sng_fb",type: "pass_route", endMarker: "arrow", points: [{ x: 480, y: 515 }, { x: 600, y: 440 }, { x: 810, y: 375 }], isCurved: true, label: "Flat Arrow" },
    { id: "a_sng_x", playerId: "off_sng_x", type: "pass_route", endMarker: "arrow", points: [{ x: 120, y: 380 }, { x: 120, y: 260, isSharp: true }, { x: 340, y: 260 }], isCurved: false, label: "12-Yd Dig" },
    { id: "a_sng_tb",playerId: "off_sng_tb",type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 560 }, { x: 430, y: 460 }], isCurved: false, label: "Pass Pro" },
    { id: "a_sng_lt",playerId: "off_sng_lt",type: "run_block",  endMarker: "tbar",  points: [{ x: 360, y: 380 }, { x: 345, y: 360 }], isCurved: false },
    { id: "a_sng_lg",playerId: "off_sng_lg",type: "run_block",  endMarker: "tbar",  points: [{ x: 420, y: 380 }, { x: 425, y: 360 }], isCurved: false },
    { id: "a_sng_c", playerId: "off_sng_c", type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 380 }, { x: 480, y: 360 }], isCurved: false },
    { id: "a_sng_rg",playerId: "off_sng_rg",type: "run_block",  endMarker: "tbar",  points: [{ x: 540, y: 380 }, { x: 535, y: 360 }], isCurved: false },
    { id: "a_sng_rt",playerId: "off_sng_rt",type: "run_block",  endMarker: "tbar",  points: [{ x: 600, y: 380 }, { x: 615, y: 360 }], isCurved: false }
  ],
  notes: {
    qbRead: "High-low the boundary/field corner defender: 1. Corner route (Y) over top. 2. Shoot/flat (FB) if CB bails. 3. Snag (Z) inside hole if Mike flows to flat.",
    lineBlocking: "6-man protection; FB fast releases to flat, TB scans backside A/B gap to Will.",
    philosophyReason: "High-low triangle concept that creates impossible 2-on-1 and 3-on-2 binds for zone defenses.",
    hotRoute: "FB flat immediate if corner blitzes",
    coachingCue: "QB read Corner first - do not pass up the shot if CB squats on FB flat"
  }
};

/**
 * 3. MESH CONCEPT (12 Personnel, Ace Wing 2x2)
 * Universal man-coverage beater with shallow crossing mesh rub:
 * - Left Slot TE (H): Underneath shallow drag crossing at 4 yards depth
 * - Right Tight End (Y): Overneath shallow drag crossing at 5 yards depth (rubs off H)
 * - #1 Outside Left (X): Deep post taking safety deep
 * - #1 Outside Right (Z): 12-yard Dig / Basic settling over the ball
 * - Backfield (RB): Rail / Wheel route along sideline
 */
export const MESH_ACE_12P_PLAY: Play = {
  id: "play-pass-mesh-12p-ace",
  name: "Single-Back 12P - Mesh vs 4-2-5 Nickel",
  formationOffense: "Single-Back Ace (12 Personnel)",
  frontDefense: "4-2-5 Nickel Over",
  category: "pass_dropback",
  primaryPassConcept: "mesh",
  personnel: "12",
  receiverAlignment: "2x2",
  tags: ["mesh", "12-personnel", "2x2", "man-beater", "rub-concept", "pro_style"],
  situation: ["3rd & 4-7", "Red Zone (Inside 15)", "Heavy Man Coverage", "Two-Minute Drill"],
  players: [
    // Offense (12 Personnel: 1 RB, 2 TEs, 2 WRs)
    { id: "off_msh_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Pass protection edge vs DE." },
    { id: "off_msh_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Slide weak A-gap." },
    { id: "off_msh_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor 1-tech nose." },
    { id: "off_msh_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor 3-tech DT." },
    { id: "off_msh_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Set strong C-gap." },
    { id: "off_msh_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 465, assignmentTitle: "Gun 3-Step Mesh Progression", assignmentNotes: "1. Peak RB Rail/Wheel vs man. 2. Read Mesh crossers (H & Y) - let rub pick linebackers. 3. Z dig over ball.", coachingKeys: ["Mesh crossers must touch hands as they cross", "Lead crossers on the run"] },
    { id: "off_msh_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 430, y: 470, assignmentTitle: "Rail / Wheel Route", assignmentNotes: "Release to boundary flat then burst vertical up sideline.", coachingKeys: ["High alert vs man-to-man LB matchup"] },
    { id: "off_msh_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Deep Post Clearout", assignmentNotes: "Take boundary corner and safety deep; clear middle field.", coachingKeys: ["Sprint vertical to 12 yds before post stem"] },
    { id: "off_msh_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 300, y: 395, assignmentTitle: "Underneath Mesh Crosser", assignmentNotes: "Sprint shallow drag at 4 yards depth across formation; set the rub pick.", coachingKeys: ["Run at 4 yards depth exactly", "Stay flat across hashes"] },
    { id: "off_msh_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 380, assignmentTitle: "Overneath Mesh Crosser", assignmentNotes: "Sprint shallow drag at 5 yards depth; rub directly off H's hip.", coachingKeys: ["Clip H's hip - leave no daylight for chasing defenders"] },
    { id: "off_msh_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 850, y: 380, assignmentTitle: "10-12 Yd Basic Dig / Sit", assignmentNotes: "Stem 10 yards; square in-cut; settle in intermediate void over ball.", coachingKeys: ["Sit in hole against zone; run through against man"] },

    // Defense (4-2-5 Nickel Over - 11 players comfortably spaced off LOS)
    { id: "def_msh_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 462, y: 325, technique: "1-Tech Weak", assignmentTitle: "1-Tech Nose", assignmentNotes: "A-gap rush." },
    { id: "def_msh_dt", label: "DT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 562, y: 325, technique: "3-Tech Strong", assignmentTitle: "3-Tech DT", assignmentNotes: "B-gap rush." },
    { id: "def_msh_de1",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 335, y: 325, technique: "5-Tech Weak", assignmentTitle: "Weak DE", assignmentNotes: "Edge rush." },
    { id: "def_msh_de2",label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 625, y: 325, technique: "5-Tech Strong", assignmentTitle: "Strong DE", assignmentNotes: "Edge rush." },
    { id: "def_msh_w",  label: "W",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 410, y: 265, technique: "20 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Man coverage on H / RB." },
    { id: "def_msh_m",  label: "M",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 550, y: 265, technique: "20 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Man coverage on Y / intermediate hole." },
    { id: "def_msh_nk", label: "NK", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 670, y: 300, technique: "Nickel / Slot Right", assignmentTitle: "Nickel / Slot Defender", assignmentNotes: "Apex / hook-curl coverage." },
    { id: "def_msh_cb1",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 240, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Cover 4 boundary." },
    { id: "def_msh_cb2",label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 848, y: 240, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Cover 4 field." },
    { id: "def_msh_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 145, technique: "2-High Safety Left", assignmentTitle: "Free Safety", assignmentNotes: "Boundary quarter safety." },
    { id: "def_msh_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 145, technique: "2-High Safety Right", assignmentTitle: "Strong Safety", assignmentNotes: "Field quarter safety." }
  ],
  actions: [
    { id: "a_msh_h", playerId: "off_msh_h", type: "pass_route", endMarker: "arrow", points: [{ x: 300, y: 395 }, { x: 420, y: 340 }, { x: 560, y: 340 }, { x: 750, y: 340 }], isCurved: true, label: "4-Yd Under Drag" },
    { id: "a_msh_y", playerId: "off_msh_y", type: "pass_route", endMarker: "arrow", points: [{ x: 660, y: 380 }, { x: 540, y: 330 }, { x: 440, y: 330 }, { x: 250, y: 330 }], isCurved: true, label: "5-Yd Over Drag" },
    { id: "a_msh_rb",playerId: "off_msh_rb",type: "pass_route", endMarker: "arrow", points: [{ x: 430, y: 470 }, { x: 340, y: 440 }, { x: 200, y: 390 }, { x: 190, y: 200 }], isCurved: true, label: "Rail / Wheel" },
    { id: "a_msh_x", playerId: "off_msh_x", type: "pass_route", endMarker: "arrow", points: [{ x: 120, y: 380 }, { x: 140, y: 260, isSharp: true }, { x: 260, y: 140 }], isCurved: false, label: "Post Clearout" },
    { id: "a_msh_z", playerId: "off_msh_z", type: "pass_route", endMarker: "arrow", points: [{ x: 850, y: 380 }, { x: 850, y: 270, isSharp: true }, { x: 680, y: 270 }, { x: 500, y: 270 }], isCurved: false, label: "10-Yd Dig" },
    { id: "a_msh_lt",playerId: "off_msh_lt",type: "run_block",  endMarker: "tbar",  points: [{ x: 360, y: 380 }, { x: 345, y: 360 }], isCurved: false },
    { id: "a_msh_lg",playerId: "off_msh_lg",type: "run_block",  endMarker: "tbar",  points: [{ x: 420, y: 380 }, { x: 425, y: 360 }], isCurved: false },
    { id: "a_msh_c", playerId: "off_msh_c", type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 380 }, { x: 475, y: 360 }], isCurved: false },
    { id: "a_msh_rg",playerId: "off_msh_rg",type: "run_block",  endMarker: "tbar",  points: [{ x: 540, y: 380 }, { x: 550, y: 360 }], isCurved: false },
    { id: "a_msh_rt",playerId: "off_msh_rt",type: "run_block",  endMarker: "tbar",  points: [{ x: 600, y: 380 }, { x: 615, y: 360 }], isCurved: false }
  ],
  notes: {
    qbRead: "1. Peak RB Rail/Wheel vs man coverage. 2. Read Mesh crossers (H & Y) - let rub pick linebackers. 3. Z dig settling in open zone void.",
    lineBlocking: "6-man slide pro; RB dual-read Will to edge before releasing on Rail.",
    philosophyReason: "Universal man-coverage killer that creates natural rub picks while providing high-low answers vs zone.",
    hotRoute: "H crosser immediate if zero blitz",
    coachingCue: "Crossers must stay at designated depths (4 yds under, 5 yds over) so they don't collide with each other"
  }
};

/**
 * 4. SHALLOW CROSS / DRIVE CONCEPT (20 Personnel, Pistol Diamond 2x2)
 * High-low drive concept creating vertical conflict on Mike linebacker:
 * - Shallow Runner (H): 3-yd sprint drag under linebackers' feet
 * - Drive / Hunt Receiver (X): 10-12 yd Dig / Hunt route sitting in hole vacated by Mike
 * - Clearout (Z): Deep post taking safety deep
 * - Backfield (F): Flare / Flat checkdown
 * - Backfield (RB): Pass protection anchor
 */
export const SHALLOW_CROSS_PISTOL_20P_PLAY: Play = {
  id: "play-pass-shallow-20p-diamond",
  name: "Pistol 20P - Shallow Cross vs 3-5 Odd",
  formationOffense: "Pistol Diamond (20 Personnel)",
  frontDefense: "3-5 Odd Front (3-3-5 Stack)",
  category: "pass_dropback",
  primaryPassConcept: "shallow_cross",
  personnel: "20",
  receiverAlignment: "2x2",
  tags: ["shallow-cross", "drive", "20-personnel", "diamond", "high-low", "old_school"],
  situation: ["1st & 10", "2nd & 6-8", "Zone Matchup (Cover 3)", "Play-Action Alternate"],
  players: [
    // Offense (20 Personnel: 2 RBs, 0 TEs, 3 WRs)
    { id: "off_shw_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Pass protect weak edge." },
    { id: "off_shw_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Pass protect 0-tech / A-gap." },
    { id: "off_shw_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor midline." },
    { id: "off_shw_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Anchor 4i DE." },
    { id: "off_shw_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Pass Set", assignmentNotes: "Set strong C-gap." },
    { id: "off_shw_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 450, assignmentTitle: "Pistol 3-Step High-Low Read", assignmentNotes: "High-low read on Mike Linebacker: 1. Shallow crosser (H) underneath. 2. Dig / Hunt (X) in window vacated by Mike chasing shallow. 3. Checkdown to F.", coachingKeys: ["Eyes on Mike LB hip", "If Mike bites on shallow cross, drill the dig right behind his ear"] },
    { id: "off_shw_rb", label: "RB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 520, assignmentTitle: "Pass Pro Anchor", assignmentNotes: "Scan A/B gap blitz; stone interior push.", coachingKeys: ["Pick up any blitzing linebacker"] },
    { id: "off_shw_f",  label: "F",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 450, assignmentTitle: "Flare Flat Checkdown", assignmentNotes: "Release to boundary flat; hold flat defender.", coachingKeys: ["Emergency safety outlet"] },
    { id: "off_shw_h",  label: "H",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 570, y: 450, assignmentTitle: "Sprint Shallow Cross", assignmentNotes: "Sprint shallow drag at 3 yards under linebackers; pull Mike across formation.", coachingKeys: ["Sprint flat at 3 yards depth", "Do not climb into LB coverage"] },
    { id: "off_shw_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "10-12 Yd Dig / Hunt Route", assignmentNotes: "Stem 10 yards, plant outside foot, break 90 degrees inside, hunt void vacated by Mike.", coachingKeys: ["Square cut at 10 yards", "Settle between hashes if zone"] },
    { id: "off_shw_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 380, assignmentTitle: "Post Clearout Route", assignmentNotes: "Clear field safety and corner deep.", coachingKeys: ["Run safety out of the dig window"] },

    // Defense (3-5 Odd Front - 11 players comfortably spaced off LOS)
    { id: "def_shw_c1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 240, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Deep 1/3 boundary." },
    { id: "def_shw_w",  label: "W",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 300, y: 265, technique: "30 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Hook-curl weak; matches F flat." },
    { id: "def_shw_e1", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 370, y: 325, technique: "4i-Tech Weak", assignmentTitle: "Weak DE", assignmentNotes: "Weak pass rush." },
    { id: "def_shw_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 325, technique: "0-Tech Head-up", assignmentTitle: "0-Tech Nose", assignmentNotes: "Center bull rush." },
    { id: "def_shw_m",  label: "M",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 265, technique: "00 Stack", assignmentTitle: "Mike Linebacker", assignmentNotes: "Middle hook zone; prime conflict player between Shallow and Dig." },
    { id: "def_shw_e2", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 590, y: 325, technique: "4i-Tech Strong", assignmentTitle: "Strong DE", assignmentNotes: "Strong pass rush." },
    { id: "def_shw_s",  label: "S",  side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 670, y: 265, technique: "Apex Strong", assignmentTitle: "Sam Linebacker", assignmentNotes: "Hook-curl strong." },
    { id: "def_shw_nik",label: "NK", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 770, y: 300, technique: "Apex Strong", assignmentTitle: "Nickel", assignmentNotes: "Perimeter overhang." },
    { id: "def_shw_c2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 240, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Deep 1/3 field." },
    { id: "def_shw_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 105, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Deep post safety." },
    { id: "def_shw_ss", label: "SS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 620, y: 195, technique: "Robber Strong", assignmentTitle: "Strong Safety", assignmentNotes: "Robber intermediate." }
  ],
  actions: [
    { id: "a_shw_h", playerId: "off_shw_h", type: "pass_route", endMarker: "arrow", points: [{ x: 570, y: 450 }, { x: 500, y: 360 }, { x: 380, y: 360 }, { x: 220, y: 360 }], isCurved: true, label: "3-Yd Shallow Drag" },
    { id: "a_shw_x", playerId: "off_shw_x", type: "pass_route", endMarker: "arrow", points: [{ x: 120, y: 380 }, { x: 120, y: 280, isSharp: true }, { x: 280, y: 280 }, { x: 440, y: 280 }], isCurved: false, label: "10-Yd Dig / Hunt" },
    { id: "a_shw_z", playerId: "off_shw_z", type: "pass_route", endMarker: "arrow", points: [{ x: 860, y: 380 }, { x: 840, y: 240, isSharp: true }, { x: 680, y: 140 }], isCurved: false, label: "Post Clearout" },
    { id: "a_shw_f", playerId: "off_shw_f", type: "pass_route", endMarker: "arrow", points: [{ x: 390, y: 450 }, { x: 310, y: 440 }, { x: 180, y: 410 }], isCurved: true, label: "Flare Flat" },
    { id: "a_shw_rb",playerId: "off_shw_rb",type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 520 }, { x: 480, y: 440 }], isCurved: false, label: "Pass Pro" },
    { id: "a_shw_lt",playerId: "off_shw_lt",type: "run_block",  endMarker: "tbar",  points: [{ x: 360, y: 380 }, { x: 350, y: 360 }], isCurved: false },
    { id: "a_shw_lg",playerId: "off_shw_lg",type: "run_block",  endMarker: "tbar",  points: [{ x: 420, y: 380 }, { x: 425, y: 360 }], isCurved: false },
    { id: "a_shw_c", playerId: "off_shw_c", type: "run_block",  endMarker: "tbar",  points: [{ x: 480, y: 380 }, { x: 480, y: 360 }], isCurved: false },
    { id: "a_shw_rg",playerId: "off_shw_rg",type: "run_block",  endMarker: "tbar",  points: [{ x: 540, y: 380 }, { x: 545, y: 360 }], isCurved: false },
    { id: "a_shw_rt",playerId: "off_shw_rt",type: "run_block",  endMarker: "tbar",  points: [{ x: 600, y: 380 }, { x: 605, y: 360 }], isCurved: false }
  ],
  notes: {
    qbRead: "High-low read on Mike Linebacker: 1. Shallow crosser (H) underneath. 2. Dig / Hunt (X) in window vacated by Mike chasing shallow. 3. Checkdown to F.",
    lineBlocking: "6-man pass protection; RB steps up to stone any interior A-gap blitz.",
    philosophyReason: "Classic Bill Walsh / Air Raid drive concept creating an unmistakable vertical conflict on the middle linebacker.",
    hotRoute: "H shallow drag hot if blitz comes",
    coachingCue: "QB hold eyes downfield to let Mike clear out before ripping the Dig"
  }
};

export const BASIC_PASSING_CONCEPTS_PLAYS: Play[] = [
  STICK_TRIPS_11P_PLAY,
  SNAG_PRO_SET_21P_PLAY,
  MESH_ACE_12P_PLAY,
  SHALLOW_CROSS_PISTOL_20P_PLAY
];
