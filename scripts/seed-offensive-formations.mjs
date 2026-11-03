import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

// Standard Line of Scrimmage at Y = 380
// Center at X = 480
// Guards at X = 420, 540
// Tackles at X = 360, 600

export const BASIC_OFFENSIVE_FORMATIONS = [
  {
    id: 'formation-spread-2x2',
    name: 'Spread 2x2 Open (Doubles)',
    side: 'offense',
    personnel: '10/11 Personnel',
    description: 'Balanced 4-wide spread formation with twin receivers to both boundary and field, opening up the box for interior zone and quick RPO glance/bubbles.',
    players: [
      { id: 'off_2x2_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Pass Pro / Zone', assignmentNotes: 'Vertical pass set on edge or reach 5-tech on zone.' },
      { id: 'off_2x2_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Zone Combo', assignmentNotes: 'Anchor A/B gap or combo with Center to Mike.' },
      { id: 'off_2x2_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Anchor Point', assignmentNotes: 'Declare Mike; anchor Nose.' },
      { id: 'off_2x2_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Zone Combo', assignmentNotes: 'Anchor A/B gap or combo with Center to Mike.' },
      { id: 'off_2x2_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Pass Pro / Zone', assignmentNotes: 'Vertical pass set on edge.' },
      { id: 'off_2x2_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 460, assignmentTitle: 'Shotgun Operator', assignmentNotes: 'Read overhang apex defender or high-low safety.' },
      { id: 'off_2x2_rb', label: 'RB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 535, y: 460, assignmentTitle: 'Zone Track / Check', assignmentNotes: 'Aiming point inside leg of guard or scan for blitz pickup.' },
      { id: 'off_2x2_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Boundary Split End', assignmentNotes: 'Iso 1-on-1 backside glance, hitch, or fade.' },
      { id: 'off_2x2_h',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 240, y: 395, assignmentTitle: 'Slot Left', assignmentNotes: 'Seam, bubble screen, or option route.' },
      { id: 'off_2x2_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 720, y: 395, assignmentTitle: 'Slot Right', assignmentNotes: 'Seam stretch, arrow, or snag route.' },
      { id: 'off_2x2_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 860, y: 395, assignmentTitle: 'Field Flanker', assignmentNotes: 'Comeback, post, or quick out.' }
    ]
  },
  {
    id: 'formation-spread-trips-3x1',
    name: 'Spread 3x1 Trips Open',
    side: 'offense',
    personnel: '11 Personnel',
    description: 'Unbalanced spread formation creating a 3-receiver triangle flood to the field side with single isolated receiver to the boundary.',
    players: [
      { id: 'off_3x1_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Pass Pro / Zone', assignmentNotes: 'Protect backside edge.' },
      { id: 'off_3x1_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Zone Track', assignmentNotes: 'Slide protect A-gap.' },
      { id: 'off_3x1_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center', assignmentNotes: 'Anchor Nose; declare Mike.' },
      { id: 'off_3x1_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Zone Track', assignmentNotes: 'Step to 3-tech.' },
      { id: 'off_3x1_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Pass Pro / Zone', assignmentNotes: 'Protect strong edge.' },
      { id: 'off_3x1_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 460, assignmentTitle: 'Shotgun QB', assignmentNotes: 'Read trips triangle progression or backside 1-on-1.' },
      { id: 'off_3x1_rb', label: 'RB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 425, y: 460, assignmentTitle: 'Offset RB', assignmentNotes: 'Zone run track or check-release to boundary flat.' },
      { id: 'off_3x1_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Backside Iso X', assignmentNotes: 'Solo boundary match vs CB.' },
      { id: 'off_3x1_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 680, y: 395, assignmentTitle: 'Inside Trips (Y)', assignmentNotes: 'Seam, shallow crosser, or stick route.' },
      { id: 'off_3x1_h',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 760, y: 395, assignmentTitle: 'Middle Trips (H)', assignmentNotes: 'Deep out, wheel, or bubble screen.' },
      { id: 'off_3x1_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 860, y: 380, assignmentTitle: 'Outside Trips (Z)', assignmentNotes: 'Clearout vertical post or curl.' }
    ]
  },
  {
    id: 'formation-pro-i-21',
    name: 'Pro-I Formation',
    side: 'offense',
    personnel: '21 Personnel',
    description: 'Classic downhill power run formation under center with attached Tight End (Y) on the right, Fullback (FB) and Tailback (TB) aligned in an I-formation stack.',
    players: [
      { id: 'off_proi_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Tackle Drive', assignmentNotes: 'Base block 5-tech or reach.' },
      { id: 'off_proi_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Guard Drive / Pull', assignmentNotes: 'Drive block 3-tech or pull skip for kickout.' },
      { id: 'off_proi_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center Anchor', assignmentNotes: 'Snap to QB under center; block 0/1-tech.' },
      { id: 'off_proi_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Playside Guard', assignmentNotes: 'Combo with Center/Tackle to Mike.' },
      { id: 'off_proi_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Playside Tackle', assignmentNotes: 'Drive block 4/5-tech DE.' },
      { id: 'off_proi_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 660, y: 380, assignmentTitle: 'Attached Tight End', assignmentNotes: 'Down block 7-tech DE or release on boot/seam.' },
      { id: 'off_proi_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 415, assignmentTitle: 'Under Center QB', assignmentNotes: 'Reverse pivot handoff or play-action bootleg.' },
      { id: 'off_proi_fb', label: 'FB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 465, assignmentTitle: 'Lead Fullback', assignmentNotes: 'Lead through hole; isolate Sam or Mike LB.' },
      { id: 'off_proi_tb', label: 'TB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 525, assignmentTitle: 'Deep Tailback', assignmentNotes: 'Take downhill handoff; press hole and cut off FB block.' },
      { id: 'off_proi_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Split End Left', assignmentNotes: 'Stalk block corner or post route.' },
      { id: 'off_proi_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 860, y: 395, assignmentTitle: 'Flanker Right', assignmentNotes: 'Crack safety or deep play-action post.' }
    ]
  },
  {
    id: 'formation-single-back-ace',
    name: 'Single-Back Ace (12 Personnel)',
    side: 'offense',
    personnel: '12 Personnel',
    description: 'Balanced two tight-end formation with dual attached TEs (Y right, H left) creating an 8-man box front for dual-sided zone, pin & pull, and play-action seams.',
    players: [
      { id: 'off_ace_h',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 300, y: 380, assignmentTitle: 'Inline Tight End Left', assignmentNotes: 'Pin 5-tech DE or release on seam.' },
      { id: 'off_ace_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Left Tackle', assignmentNotes: 'Zone combo with LG.' },
      { id: 'off_ace_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Left Guard', assignmentNotes: 'Zone step A-gap.' },
      { id: 'off_ace_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center', assignmentNotes: 'Reach nose.' },
      { id: 'off_ace_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Right Guard', assignmentNotes: 'Zone step A/B gap.' },
      { id: 'off_ace_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Right Tackle', assignmentNotes: 'Combo with Y on DE to Sam.' },
      { id: 'off_ace_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 660, y: 380, assignmentTitle: 'Inline Tight End Right', assignmentNotes: 'Seal edge or climb to safety.' },
      { id: 'off_ace_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 460, assignmentTitle: 'Gun QB', assignmentNotes: 'Zone read mesh or high-low safety read.' },
      { id: 'off_ace_rb', label: 'RB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 530, assignmentTitle: 'Dot Back', assignmentNotes: 'Aim for playside A-gap; cut off Center.' },
      { id: 'off_ace_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 395, assignmentTitle: 'Wide Receiver Left', assignmentNotes: 'Clearout vertical or comeback.' },
      { id: 'off_ace_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 860, y: 395, assignmentTitle: 'Wide Receiver Right', assignmentNotes: 'Clearout vertical or comeback.' }
    ]
  },
  {
    id: 'formation-shotgun-bunch-11',
    name: 'Shotgun Bunch Right',
    side: 'offense',
    personnel: '11 Personnel',
    description: 'Compressed 3-man bunch triangle on the strong side to defeat press man coverage through natural picks, rub routes, and sprint-out concepts.',
    players: [
      { id: 'off_bnch_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Backside Pass Pro', assignmentNotes: 'Slide protect edge.' },
      { id: 'off_bnch_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor A-gap.' },
      { id: 'off_bnch_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center', assignmentNotes: 'Step to Mike.' },
      { id: 'off_bnch_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Anchor B-gap.' },
      { id: 'off_bnch_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Pass Pro', assignmentNotes: 'Vertical set.' },
      { id: 'off_bnch_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 460, assignmentTitle: 'Shotgun QB', assignmentNotes: 'Read bunch spacing (corner, arrow, mesh).' },
      { id: 'off_bnch_rb', label: 'RB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 425, y: 460, assignmentTitle: 'Check Release RB', assignmentNotes: 'Scan backside blitz then check into boundary flat.' },
      { id: 'off_bnch_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Isolated X', assignmentNotes: '1-on-1 boundary match.' },
      { id: 'off_bnch_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 720, y: 380, assignmentTitle: 'Bunch Point (Y)', assignmentNotes: 'Point of bunch; stem vertical corner or seam.' },
      { id: 'off_bnch_h',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 675, y: 410, assignmentTitle: 'Bunch Inside (H)', assignmentNotes: 'Inside of bunch; shallow rub or quick flat.' },
      { id: 'off_bnch_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 765, y: 410, assignmentTitle: 'Bunch Outside (Z)', assignmentNotes: 'Outside of bunch; sprint arrow flat or deep post.' }
    ]
  },
  {
    id: 'formation-pistol-diamond-20',
    name: 'Pistol Diamond (20 Personnel)',
    side: 'offense',
    personnel: '20 Personnel',
    description: 'Triple-option inverted diamond formation with 3 backs surrounding the Pistol QB for downhill power read, triple option, and misdirection counter sweeps.',
    players: [
      { id: 'off_dmnd_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Down Block', assignmentNotes: 'Secure inside B-gap.' },
      { id: 'off_dmnd_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Pull / Zone', assignmentNotes: 'Skip pull or zone track.' },
      { id: 'off_dmnd_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center', assignmentNotes: 'Drive block 0-tech.' },
      { id: 'off_dmnd_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Pull / Zone', assignmentNotes: 'Drive block 3-tech.' },
      { id: 'off_dmnd_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Down Block', assignmentNotes: 'Down block 5-tech.' },
      { id: 'off_dmnd_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 445, assignmentTitle: 'Pistol QB', assignmentNotes: 'Read DE on zone read; keep or pitch.' },
      { id: 'off_dmnd_f1', label: 'F1', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 455, assignmentTitle: 'Left Flanker Back', assignmentNotes: 'Lead through hole on LB or motion across.' },
      { id: 'off_dmnd_f2', label: 'F2', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 455, assignmentTitle: 'Right Flanker Back', assignmentNotes: 'Lead block on perimeter force or pitch track.' },
      { id: 'off_dmnd_rb', label: 'RB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 525, assignmentTitle: 'Pistol Tailback', assignmentNotes: 'Downhill dive path or mesh track.' },
      { id: 'off_dmnd_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Boundary Receiver', assignmentNotes: 'Stalk block CB.' },
      { id: 'off_dmnd_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 860, y: 380, assignmentTitle: 'Field Receiver', assignmentNotes: 'Stalk block CB.' }
    ]
  },
  {
    id: 'formation-empty-3x2',
    name: 'Empty 3x2 (Quads Spread)',
    side: 'offense',
    personnel: '10 Personnel',
    description: 'Empty backfield with 5 receivers spread across the formation, stretching the defense horizontally and creating clear blitz windows for quick passing.',
    players: [
      { id: 'off_mpty_lt', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Quick Pass Pro', assignmentNotes: 'Short 2-step set.' },
      { id: 'off_mpty_lg', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Quick Pass Pro', assignmentNotes: 'Protect A-gap.' },
      { id: 'off_mpty_c',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Center', assignmentNotes: 'Protect midline.' },
      { id: 'off_mpty_rg', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Quick Pass Pro', assignmentNotes: 'Protect B-gap.' },
      { id: 'off_mpty_rt', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Quick Pass Pro', assignmentNotes: 'Short 2-step set.' },
      { id: 'off_mpty_qb', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 460, assignmentTitle: 'Empty Gun QB', assignmentNotes: 'Catch, plant, throw; read hot blitz leverage.' },
      { id: 'off_mpty_x',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 110, y: 380, assignmentTitle: 'Boundary Outside (X)', assignmentNotes: 'Quick hitch or fade.' },
      { id: 'off_mpty_h',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 230, y: 395, assignmentTitle: 'Boundary Slot (H)', assignmentNotes: 'Slant, out, or whip route.' },
      { id: 'off_mpty_y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 660, y: 395, assignmentTitle: 'Field Inner Slot (Y)', assignmentNotes: 'Stick or option route.' },
      { id: 'off_mpty_f',  label: 'F',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 750, y: 395, assignmentTitle: 'Field Middle Slot (F)', assignmentNotes: 'Speed out or seam.' },
      { id: 'off_mpty_z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 870, y: 380, assignmentTitle: 'Field Outside (Z)', assignmentNotes: 'Vertical clearout.' }
    ]
  },
  {
    id: 'formation-wishbone-21',
    name: 'Shotgun Wishbone 21 Pers',
    side: 'offense',
    personnel: '21 Personnel',
    description: 'Heavy backfield with H & Z flankers flanking QB in gun; Y tight wing.',
    players: [
      { id: 'X',  label: 'X',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 120, y: 380, assignmentTitle: 'Glance Route', assignmentNotes: '5-step skinny post; replace the scraping Will LB.', coachingKeys: ['Win inside leverage on CB', 'Snapshot window behind Will'] },
      { id: 'LT', label: 'LT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 360, y: 380, assignmentTitle: 'Zone Step', assignmentNotes: 'Zone track left; reach 4i-tech or combo to Will.', technique: 'Zone Track' },
      { id: 'LG', label: 'LG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 380, assignmentTitle: 'Zone Combo', assignmentNotes: 'Double 0-tech Nose with Center up to Mike.', technique: 'Combo 0-Tech' },
      { id: 'C',  label: 'C',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 380, assignmentTitle: 'Head-up Nose', assignmentNotes: 'Anchor 0-tech; forbid backside A-gap penetration.', technique: 'Drive Block' },
      { id: 'RG', label: 'RG', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 380, assignmentTitle: 'Zone Track', assignmentNotes: 'Step play-side B-gap to 4-tech DT.', technique: 'Reach 4-Tech' },
      { id: 'RT', label: 'RT', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 600, y: 380, assignmentTitle: 'Frontside Combo', assignmentNotes: 'Combo with Y on DE to Sam LB.', technique: 'Gap Seal' },
      { id: 'Y',  label: 'Y',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 660, y: 380, assignmentTitle: 'Seam Release', assignmentNotes: 'Fierce run fake; climb vertical behind flowing Mike.', coachingKeys: ['Sell drive block for 2 steps', 'Burst through boundary seam'] },
      { id: 'F',  label: 'F',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 740, y: 420, assignmentTitle: 'Speed Flat', assignmentNotes: 'Stretch perimeter; pull nickel/corner out of seam window.', coachingKeys: ['Sprint flat at snap', 'Open QB emergency outlet'] },
      { id: 'QB', label: 'QB', side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 470, assignmentTitle: 'Mesh & Read', assignmentNotes: 'Read weakside DE. If crashes: pull and throw Glance behind Will.', coachingKeys: ['Ride mesh to 4 yards', 'Eyes on weakside 4i/5 DE & Will'] },
      { id: 'H',  label: 'H',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 410, y: 530, assignmentTitle: 'Insert / Check', assignmentNotes: 'Step weakside B-gap to shield Will or leak to flat.', coachingKeys: ['Lead through weak B-gap', 'Contact Will if QB keeps'] },
      { id: 'Z',  label: 'Z',  side: 'offense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 550, y: 530, assignmentTitle: 'Zone Path', assignmentNotes: 'Aiming point playside A/B gap; press vertical then cut.', coachingKeys: ['Receive mesh with soft hands', 'Cut off center block'] }
    ]
  }
];

async function seed() {
  console.log(`Starting upload of ${BASIC_OFFENSIVE_FORMATIONS.length} basic offensive formations to Firestore...`);
  
  for (const formation of BASIC_OFFENSIVE_FORMATIONS) {
    const formationRef = doc(db, 'formations', formation.id);
    const data = {
      ...formation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(formationRef, data, { merge: true });
    console.log(`✔ Uploaded: ${formation.name} (${formation.id}) - ${formation.players.length} players`);
  }

  console.log('✅ Successfully loaded all basic offensive formations into Firebase Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
