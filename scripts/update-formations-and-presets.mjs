import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: 'AIzaSyCUhaolKLREYDSoTmGQ125rVAsWDr1axIs',
  authDomain: 'football-playbook-c6936.firebaseapp.com',
  projectId: 'football-playbook-c6936',
  storageBucket: 'football-playbook-c6936.firebasestorage.app',
  messagingSenderId: '1070455562140',
  appId: '1:1070455562140:web:884fd61e3650903527f259'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import existing definitions
const { BASIC_OFFENSIVE_FORMATIONS } = await import('./seed-offensive-formations.mjs');
const { BASIC_DEFENSIVE_FRONTS } = await import('./seed-defensive-fronts.mjs');

// Style mapping
const OFFENSE_STYLES = {
  'formation-spread-2x2': { style: 'spread', labels: ['Spread', 'Doubles', '10/11P'] },
  'formation-spread-trips-3x1': { style: 'spread', labels: ['Spread', 'Trips', '11P'] },
  'formation-shotgun-bunch-11': { style: 'spread', labels: ['Spread', 'Bunch', '11P'] },
  'formation-empty-3x2': { style: 'spread', labels: ['Spread', 'Empty', '10P'] },
  'formation-pro-i-21': { style: 'pro_style', labels: ['Pro Style', 'Under Center', '21P'] },
  'formation-single-back-ace': { style: 'pro_style', labels: ['Pro Style', 'Ace 12P'] },
  'formation-wishbone-21': { style: 'old_school', labels: ['Old School', 'Triple Option', '21P'] },
  'formation-pistol-diamond-20': { style: 'old_school', labels: ['Old School', 'Diamond', '20P'] }
};

const DEFENSE_STYLES = {
  'front-4-3-over': { style: 'even_front', labels: ['Even Front', '4-Down', '4-3 Base'] },
  'front-4-3-under': { style: 'even_front', labels: ['Even Front', '4-Down', '4-3 Under'] },
  'front-4-2-5-nickel': { style: 'even_front', labels: ['Even Front', '4-Down', 'Nickel'] },
  'front-3-4-over': { style: 'odd_front', labels: ['Odd Front', '3-Down', '3-4 Base'] },
  'front-3-5-odd': { style: 'odd_front', labels: ['Odd Front', '3-Down', '3-3-5 Stack'] },
  'front-3-4-mint': { style: 'odd_front', labels: ['Odd Front', '3-Down', 'Mint / Tite'] },
  'front-bear-46': { style: 'heavy_front', labels: ['Heavy Front', 'Goal Line', '46 Bear'] }
};

console.log('1. Updating and uploading formations to Firestore...');

const enrichedOffense = BASIC_OFFENSIVE_FORMATIONS.map(f => ({
  ...f,
  style: OFFENSE_STYLES[f.id]?.style || 'spread',
  labels: OFFENSE_STYLES[f.id]?.labels || ['Offense'],
  updatedAt: new Date().toISOString()
}));

const enrichedDefense = BASIC_DEFENSIVE_FRONTS.map(f => ({
  ...f,
  style: DEFENSE_STYLES[f.id]?.style || 'even_front',
  labels: DEFENSE_STYLES[f.id]?.labels || ['Defense Front'],
  updatedAt: new Date().toISOString()
}));

for (const f of [...enrichedOffense, ...enrichedDefense]) {
  const ref = doc(db, 'formations', f.id);
  await setDoc(ref, f, { merge: true });
  console.log(`✔ Synced to Firestore: [${f.style}] ${f.name} (${f.id})`);
}

console.log('2. Generating updated src/data/presets.ts...');

const allFormations = [...enrichedOffense, ...enrichedDefense];

const presetsContent = `import type { Play, PlaybookFile, Formation } from '../types/playbook';

export const DEFAULT_WISHBONE_PLAY: Play = {
  id: "play-wishbone-zone-glance",
  name: "Shotgun Wishbone - Zone Read Glance vs 3-5 Odd",
  formationOffense: "Shotgun Wishbone 21 Pers",
  frontDefense: "3-5 Odd Front (3-3-5 Stack)",
  category: "rpo",
  primaryRunConcept: "Split-Zone Read",
  counterAction: "Pop/Glance",
  targetFront: "3-5 Odd (0-Tech)",
  tags: ["zone-read", "3-5-counter", "leak", "high-low", "mesh-read", "rpo", "old_school"],
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
    { id: "def_c1", label: "CB", side: "defense", x: 120, y: 280, assignmentTitle: "Off Man / Deep 1/3", assignmentNotes: "Cushion technique on X; bails on pass flash.", technique: "Off CB Left" },
    { id: "def_w",  label: "W",  side: "defense", x: 300, y: 310, assignmentTitle: "Will Linebacker", assignmentNotes: "B-gap scrape on zone action; susceptible to Glance read.", technique: "30 Stack Weak" },
    { id: "def_e1", label: "DE", side: "defense", x: 370, y: 350, assignmentTitle: "4i Weak DE", assignmentNotes: "B-gap anchor; read option key for QB.", technique: "4i-Tech Weak" },
    { id: "def_nt", label: "NT", side: "defense", x: 480, y: 350, assignmentTitle: "0-Tech Nose", assignmentNotes: "Two-gap A-gaps; primary double-team target.", technique: "0-Tech Head-up" },
    { id: "def_m",  label: "M",  side: "defense", x: 480, y: 290, assignmentTitle: "Mike Linebacker", assignmentNotes: "Flows playside to mirror H/Z mesh; vulnerable to seam.", technique: "00 Stack" },
    { id: "def_e2", label: "DE", side: "defense", x: 590, y: 350, assignmentTitle: "4i Strong DE", assignmentNotes: "Controls frontside C-gap; tight leverage on RT.", technique: "4i-Tech Strong" },
    { id: "def_s",  label: "S",  side: "defense", x: 670, y: 310, assignmentTitle: "Sam Linebacker", assignmentNotes: "Apex over Y/F; must honor F-wing speed flat.", technique: "Apex Strong" },
    { id: "def_nik",label: "NK", side: "defense", x: 770, y: 330, assignmentTitle: "Nickel / Overhang", assignmentNotes: "Perimeter force defender; expands with F flat.", technique: "Apex Strong" },
    { id: "def_c2", label: "CB", side: "defense", x: 860, y: 270, assignmentTitle: "Cornerback", assignmentNotes: "Deep 1/3 boundary; retreat against vertical stem.", technique: "Off CB Right" },
    { id: "def_fs", label: "FS", side: "defense", x: 480, y: 150, assignmentTitle: "Single-High Free Safety", assignmentNotes: "Deep middle of field; rotated toward strongside seam.", technique: "Single-High FS" },
    { id: "def_ss", label: "SS", side: "defense", x: 620, y: 220, assignmentTitle: "Strong Safety", assignmentNotes: "Robber / intermediate hole defender; reads Y release.", technique: "Robber Strong" }
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

export const PRO_I_VEER_OPTION_PLAY: Play = {
  id: "play-pro-i-veer-option",
  name: "Pro-I - Veer Option vs 3-5 Odd",
  formationOffense: "Pro-I Formation",
  frontDefense: "3-5 Odd Front (3-3-5 Stack)",
  category: "run",
  primaryRunConcept: "Veer Option",
  counterAction: "Play-Action Boot / Pop",
  targetFront: "3-5 Odd Front",
  tags: ["pro-i", "veer-option", "triple-option", "dive-pitch", "under-center", "pro_style"],
  situation: ["1st & 10", "Short Yardage", "Goal Line"],
  players: [
    // Offense (Pro-I 21 Personnel)
    { id: "off_proi_lt", label: "LT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 360, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Veer down on 4i DE or release to Will.", technique: "Veer Down" },
    { id: "off_proi_lg", label: "LG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 420, y: 380, assignmentTitle: "Combo Nose", assignmentNotes: "Double 0-tech nose with Center to Mike.", technique: "Combo 0-Tech" },
    { id: "off_proi_c",  label: "C",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 380, assignmentTitle: "Anchor Center", assignmentNotes: "Base 0-tech; step playside.", technique: "Base Drive" },
    { id: "off_proi_rg", label: "RG", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 540, y: 380, assignmentTitle: "Veer Climb", assignmentNotes: "Leave 4i unblocked (dive read); climb inside to Mike.", technique: "Veer Release" },
    { id: "off_proi_rt", label: "RT", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 600, y: 380, assignmentTitle: "Veer Climb to Sam", assignmentNotes: "Release past DE; climb to cut off Sam LB.", technique: "Climb to Sam" },
    { id: "off_proi_y",  label: "Y",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 660, y: 380, assignmentTitle: "Arc Release", assignmentNotes: "Arc around defensive end; seal Nickel / safety in alley.", technique: "Arc to Alley" },
    { id: "off_proi_x",  label: "X",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 120, y: 380, assignmentTitle: "Boundary Stalk", assignmentNotes: "Stalk boundary corner.", technique: "Stalk" },
    { id: "off_proi_z",  label: "Z",  side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 860, y: 395, assignmentTitle: "Field Crack / Stalk", assignmentNotes: "Crack field safety or stalk corner.", technique: "Stalk" },
    { id: "off_proi_qb", label: "QB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 415, assignmentTitle: "Under Center Reverse Pivot & Read", assignmentNotes: "Ride FB dive into B-gap. Read strong 4i DE: If DE sits/widens -> give to FB; if DE squeezes -> pull, attack Sam LB and pitch to TB.", coachingKeys: ["Eyes glued to 4i DE shoulder", "Replace the crashing end"] },
    { id: "off_proi_fb", label: "FB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 465, assignmentTitle: "Downhill Dive Path", assignmentNotes: "Aim inside leg of RG; receive dive if DE widens; press downhill.", coachingKeys: ["Soft pocket for ball", "Run through arm tackles"] },
    { id: "off_proi_tb", label: "TB", side: "offense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 525, assignmentTitle: "Pitch Relationship", assignmentNotes: "Maintain 4 yards deep by 4 yards wide pitch relation with QB.", coachingKeys: ["Keep depth on pitch path", "Accelerate in alley"] },

    // Defense (3-5 Odd Front pre-aligned)
    { id: "def_35_nt", label: "NT", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 348, technique: "0-Tech", assignmentTitle: "0-Tech Nose", assignmentNotes: "Anchor midline." },
    { id: "def_35_dew", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 378, y: 348, technique: "4i-Tech Weak", assignmentTitle: "4i Weak DE", assignmentNotes: "B-gap anchor." },
    { id: "def_35_des", label: "DE", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 582, y: 348, technique: "4i-Tech Strong", assignmentTitle: "4i Strong DE (Dive Read Key)", assignmentNotes: "Dive key for QB on veer option." },
    { id: "def_35_m", label: "M", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 295, technique: "00 Stack", assignmentTitle: "Mike Backer", assignmentNotes: "Flow to dive mesh." },
    { id: "def_35_w", label: "W", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 390, y: 295, technique: "30 Stack Weak", assignmentTitle: "Will Backer", assignmentNotes: "Scrape to cutback." },
    { id: "def_35_s", label: "S", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 570, y: 295, technique: "30 Stack Strong", assignmentTitle: "Sam Backer (Pitch Key)", assignmentNotes: "Pitch key for QB." },
    { id: "def_35_bd", label: "BD", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 260, y: 320, technique: "Apex Weak", assignmentTitle: "Bandit Overhang", assignmentNotes: "Weak perimeter force." },
    { id: "def_35_nk", label: "NK", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 740, y: 320, technique: "Apex Strong", assignmentTitle: "Nickel Overhang", assignmentNotes: "Strong alley force." },
    { id: "def_35_cb1", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 132, y: 275, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Deep 1/3." },
    { id: "def_35_cb2", label: "CB", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 848, y: 275, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Deep 1/3." },
    { id: "def_35_fs", label: "FS", side: "defense", shape: "none", nodeColor: "#000000", fillColor: "transparent", letterColor: "#000000", x: 480, y: 155, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Alley fill." }
  ],
  actions: [
    { id: "v_fb", playerId: "off_proi_fb", type: "run_block", endMarker: "arrow", points: [{ x: 480, y: 465 }, { x: 550, y: 360 }], isCurved: true, label: "FB Dive Track" },
    { id: "v_qb", playerId: "off_proi_qb", type: "run_block", endMarker: "arrow", points: [{ x: 480, y: 415 }, { x: 520, y: 430 }, { x: 620, y: 410 }], isCurved: true, label: "QB Option Track" },
    { id: "v_tb", playerId: "off_proi_tb", type: "run_block", endMarker: "arrow", points: [{ x: 480, y: 525 }, { x: 580, y: 490 }, { x: 730, y: 430 }], isCurved: true, label: "TB Pitch Track" },
    { id: "v_y",  playerId: "off_proi_y",  type: "run_block", endMarker: "tbar",  points: [{ x: 660, y: 380 }, { x: 690, y: 320 }, { x: 740, y: 260 }], isCurved: true, label: "Arc to Alley" },
    { id: "v_rt", playerId: "off_proi_rt", type: "run_block", endMarker: "tbar",  points: [{ x: 600, y: 380 }, { x: 580, y: 310 }], isCurved: false, label: "Veer to Sam" },
    { id: "v_rg", playerId: "off_proi_rg", type: "run_block", endMarker: "tbar",  points: [{ x: 540, y: 380 }, { x: 500, y: 310 }], isCurved: false, label: "Veer to Mike" },
    { id: "v_c",  playerId: "off_proi_c",  type: "run_block", endMarker: "tbar",  points: [{ x: 480, y: 380 }, { x: 480, y: 350 }], isCurved: false, label: "Drive 0-Tech" }
  ],
  notes: {
    qbRead: "Key 4i Strong DE. If DE stays wide, hand off to FB on B-gap dive. If DE pinches/crashes, pull and attack Sam LB on pitch option.",
    lineBlocking: "Leave 4i unblocked (dive read). RG and RT veer release inside to second-level linebackers (Mike & Sam). Y arcs to alley safety.",
    philosophyReason: "Classic option football forces odd front 4i DE and Sam into an impossible 2-on-1 conflict regardless of how aggressive they play.",
    hotRoute: "Z slant if safety creeps into alley",
    coachingCue: "QB ride mesh with FB right into the line of scrimmage before making pull decision"
  }
};

export const GUN_TREY_BOOT_PLAY: Play = {
  id: "play-gun-trey-split-boot",
  name: "Gun Trey - Split-Zone Weakside Boot vs 3-4 Over",
  formationOffense: "Spread 3x1 Trips Open",
  frontDefense: "3-4 Over Front",
  category: "pass_action",
  primaryRunConcept: "Split-Zone Read",
  counterAction: "Weakside Boot/Leak",
  targetFront: "3-4 Over Front",
  tags: ["play-action", "bootleg", "split-zone", "flood-weak", "3-4-counter", "spread"],
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
    { id: "def_cb1", label: "CB", side: "defense", x: 100, y: 280, technique: "Off CB Left", assignmentTitle: "Deep 1/3", assignmentNotes: "Backpedal on snap." },
    { id: "def_olb1",label: "OLB",side: "defense", x: 280, y: 340, technique: "9-Tech Wide Weak", assignmentTitle: "Backside Edge", assignmentNotes: "Bites hard on RB zone fake right; leaves flat open." },
    { id: "def_de1", label: "DE", side: "defense", x: 380, y: 345, technique: "4i-Tech Weak", assignmentTitle: "4-Tech DT", assignmentNotes: "Occupied by slide protection." },
    { id: "def_nt",  label: "NT", side: "defense", x: 470, y: 345, technique: "0-Tech Head-up", assignmentTitle: "Nose Tackle", assignmentNotes: "Anchors A-gap." },
    { id: "def_ilb1",label: "ILB",side: "defense", x: 420, y: 290, technique: "30 Stack Weak", assignmentTitle: "Backside ILB", assignmentNotes: "Flows right with zone steps." },
    { id: "def_ilb2",label: "ILB",side: "defense", x: 540, y: 290, technique: "30 Stack Strong", assignmentTitle: "Playside ILB", assignmentNotes: "Flows to C-gap." },
    { id: "def_de2", label: "DE", side: "defense", x: 590, y: 345, technique: "5-Tech Strong", assignmentTitle: "5-Tech DE", assignmentNotes: "Contain edge." },
    { id: "def_olb2",label: "OLB",side: "defense", x: 680, y: 340, technique: "Apex Strong", assignmentTitle: "Strong OLB", assignmentNotes: "Drops to hook-curl." },
    { id: "def_cb2", label: "CB", side: "defense", x: 840, y: 280, technique: "Off CB Right", assignmentTitle: "Cover 3 Deep", assignmentNotes: "Deep third strong." },
    { id: "def_fs",  label: "FS", side: "defense", x: 400, y: 160, technique: "Single-High FS", assignmentTitle: "Free Safety", assignmentNotes: "Carries vertical route." },
    { id: "def_ss",  label: "SS", side: "defense", x: 650, y: 190, technique: "Robber Strong", assignmentTitle: "Strong Safety", assignmentNotes: "Bite on deep corner." }
  ],
  actions: [
    { id: "b_y", playerId: "Y", type: "pass_route", endMarker: "arrow", points: [{ x: 660, y: 380, isSharp: false }, { x: 450, y: 440, isSharp: false }, { x: 260, y: 430, isSharp: false }, { x: 180, y: 350, isSharp: false }], isCurved: true, label: "Boot Leak" },
    { id: "b_qb", playerId: "QB", type: "motion", endMarker: "arrow", points: [{ x: 480, y: 460, isSharp: false }, { x: 380, y: 480, isSharp: false }, { x: 280, y: 440, isSharp: false }], isCurved: true, label: "Naked Boot" },
    { id: "b_rb", playerId: "RB", type: "run_block", endMarker: "arrow", points: [{ x: 530, y: 460, isSharp: false }, { x: 620, y: 380, isSharp: false }], isCurved: false, label: "Zone Fake Track" },
    { id: "b_x", playerId: "X", type: "pass_route", endMarker: "arrow", points: [{ x: 100, y: 380, isSharp: false }, { x: 240, y: 250, isSharp: false }, { x: 500, y: 220, isSharp: false }], isCurved: true, label: "14-Yd Over Cross" },
    { id: "b_h", playerId: "H", type: "pass_route", endMarker: "arrow", points: [{ x: 730, y: 380, isSharp: false }, { x: 740, y: 260, isSharp: true }, { x: 860, y: 170, isSharp: false }], isCurved: true, label: "Deep Corner" },
    { id: "b_z", playerId: "Z", type: "pass_route", endMarker: "arrow", points: [{ x: 820, y: 380, isSharp: false }, { x: 840, y: 320, isSharp: false }], isCurved: false, label: "Quick Out" }
  ],
  notes: {
    qbRead: "Full fake to RB; whip head around to spot weak flat (Y); progress to crossing X.",
    lineBlocking: "Full zone slide right; backside tackle hinges on OLB; leave weak end unblocked for boot bite.",
    philosophyReason: "Punishes aggressive flowing 3-4 linebackers who over-commit to Gun Trey zone runs to the field.",
    hotRoute: "Z quick out if corner sits in soft off-man",
    coachingCue: "TE Y must sell run block for a full 2-count before releasing into open space"
  }
};

export const PISTOL_COUNTER_TREY_PLAY: Play = {
  id: "play-pistol-counter-trey",
  name: "Pistol 12P - Counter GT vs 4-2-5 Nickel",
  formationOffense: "Single-Back Ace (12 Personnel)",
  frontDefense: "4-2-5 Nickel Over",
  category: "run",
  primaryRunConcept: "Pin & Pull",
  counterAction: "Play-Action Seam",
  targetFront: "4-2-5 Nickel",
  tags: ["counter-gt", "gap-scheme", "pull-block", "4-2-5-punisher", "pro_style"],
  situation: ["3rd & 2", "Goal Line", "Aggressive LB flow"],
  players: [
    // Offense (11 Players - 12 Personnel)
    { id: "X",  label: "X",  side: "offense", x: 120, y: 380, assignmentTitle: "Stalk Block", assignmentNotes: "Stalk corner; prevent secondary run fill.", technique: "Stalk" },
    { id: "LT", label: "LT", side: "offense", x: 360, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Angle down block on 3-tech DT; secure inside gap.", technique: "Down Angle" },
    { id: "LG", label: "LG", side: "offense", x: 420, y: 380, assignmentTitle: "Pull & Kick", assignmentNotes: "Pull flat down LOS; kick out unblocked defensive end.", technique: "Skip Pull Kick" },
    { id: "C",  label: "C",  side: "offense", x: 480, y: 380, assignmentTitle: "Backside Reach", assignmentNotes: "Reach 1-tech nose; cut off back-side flow.", technique: "Back Reach" },
    { id: "RG", label: "RG", side: "offense", x: 540, y: 380, assignmentTitle: "Pull & Lead", assignmentNotes: "Follow LG pull; wrap up into hole on Mike LB.", technique: "Wrap Pull Lead" },
    { id: "RT", label: "RT", side: "offense", x: 600, y: 380, assignmentTitle: "Hinge Backside", assignmentNotes: "Step inside then hinge to protect backside rush.", technique: "Step & Hinge" },
    { id: "Y",  label: "Y",  side: "offense", x: 300, y: 380, assignmentTitle: "Down Block", assignmentNotes: "Pin 7-tech DE inside with LT.", technique: "Pin Block" },
    { id: "H",  label: "H",  side: "offense", x: 250, y: 400, assignmentTitle: "Wing Seal", assignmentNotes: "Seal edge overhang or double 7-tech with Y.", technique: "Wing Seal" },
    { id: "Z",  label: "Z",  side: "offense", x: 880, y: 380, assignmentTitle: "Clearout / Post", assignmentNotes: "Run off safety.", technique: "Clear" },
    { id: "QB", label: "QB", side: "offense", x: 480, y: 450, assignmentTitle: "Reverse Pivot & Hand", assignmentNotes: "Reverse pivot to left; hand off to RB; boot fake right.", technique: "Reverse Pivot" },
    { id: "RB", label: "RB", side: "offense", x: 480, y: 530, assignmentTitle: "Counter Step & Cut", assignmentNotes: "Counter step right, press behind pulling RG, explode in alley.", technique: "Counter Cut" },

    // Defense (4-2-5 Nickel Over - 11 Players)
    { id: "def_425_nt", label: "NT", side: "defense", x: 462, y: 348, technique: "1-Tech Weak", assignmentTitle: "1-Tech Shade", assignmentNotes: "Weak A-gap anchor; control Center." },
    { id: "def_425_dt", label: "DT", side: "defense", x: 562, y: 348, technique: "3-Tech Strong", assignmentTitle: "3-Tech DT", assignmentNotes: "Strong B-gap penetration." },
    { id: "def_425_dew", label: "DE", side: "defense", x: 335, y: 348, technique: "5-Tech Weak", assignmentTitle: "Weak 5-End", assignmentNotes: "C-gap contain / pull kick target." },
    { id: "def_425_des", label: "DE", side: "defense", x: 625, y: 348, technique: "5-Tech Strong", assignmentTitle: "Strong 5-End", assignmentNotes: "Contain edge strong." },
    { id: "def_425_w",  label: "W",  side: "defense", x: 420, y: 295, technique: "20 Stack Weak", assignmentTitle: "Will Linebacker", assignmentNotes: "Scrape backside to frontside A/B gap." },
    { id: "def_425_m",  label: "M",  side: "defense", x: 540, y: 295, technique: "20 Stack Strong", assignmentTitle: "Mike Linebacker", assignmentNotes: "Plug strong B/C gap downhill." },
    { id: "def_425_nk", label: "NK", side: "defense", x: 680, y: 320, technique: "Apex Strong", assignmentTitle: "Nickel / Star", assignmentNotes: "Apex overhang; alley force defender." },
    { id: "def_425_cb1",label: "CB", side: "defense", x: 132, y: 275, technique: "Off CB Left", assignmentTitle: "Left Cornerback", assignmentNotes: "Cover 4 quarters / Cover 3 deep." },
    { id: "def_425_cb2",label: "CB", side: "defense", x: 848, y: 275, technique: "Off CB Right", assignmentTitle: "Right Cornerback", assignmentNotes: "Cover 4 quarters / Cover 3 deep." },
    { id: "def_425_fs", label: "FS", side: "defense", x: 360, y: 185, technique: "2-High Safety Left", assignmentTitle: "Free Safety", assignmentNotes: "Cover 4 boundary quarter safety." },
    { id: "def_425_ss", label: "SS", side: "defense", x: 600, y: 185, technique: "2-High Safety Right", assignmentTitle: "Strong Safety", assignmentNotes: "Cover 4 field quarter safety." }
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
    PRO_I_VEER_OPTION_PLAY,
    GUN_TREY_BOOT_PLAY,
    PISTOL_COUNTER_TREY_PLAY
  ]
};

export const DEFAULT_FORMATIONS: Formation[] = ${JSON.stringify(allFormations, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/presets.ts'), presetsContent, 'utf8');
console.log('✔ Successfully generated src/data/presets.ts with 4 plays and 15 styled formations!');
