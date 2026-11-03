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

// Standard Line of Scrimmage reference (Center at X: 480, Y: 380)
// DL depth: Y = 348
// LB depth: Y = 295
// Apex depth: Y = 320
// DB depth: Y = 275 (Off CB), 335 (Press CB), 235 (Robber), 195 (2-High), 155 (Single-High)

export const BASIC_DEFENSIVE_FRONTS = [
  {
    id: 'front-4-3-over',
    name: '4-3 Over Front',
    side: 'defense',
    personnel: '4-3 Base Defense',
    description: 'Standard 4-3 front with 3-tech DT to the offensive strong side (tight end side), 1-tech nose tackle weak, and Sam linebacker over the tight end.',
    players: [
      { id: 'def_43o_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 462, y: 348, technique: '1-Tech Weak', assignmentTitle: '1-Tech Shade', assignmentNotes: 'Control weak A-gap; anchor against Center/LG double team.', coachingKeys: ['Attack Center left shoulder', 'Do not get washed down'] },
      { id: 'def_43o_dt', label: 'DT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 562, y: 348, technique: '3-Tech Strong', assignmentTitle: '3-Tech DT', assignmentNotes: 'Penetrate strong B-gap; disrupt zone and pull tracks.', coachingKeys: ['Explode off ball', 'Key RG outside hip'] },
      { id: 'def_43o_dew', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 335, y: 348, technique: '5-Tech Weak', assignmentTitle: 'Weak 5-End', assignmentNotes: 'Control weak C-gap / edge contain; QB option key.', coachingKeys: ['Keep outside arm free', 'Square up on mesh'] },
      { id: 'def_43o_des', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 625, y: 348, technique: '5-Tech Strong', assignmentTitle: 'Strong 5-End', assignmentNotes: 'Control C-gap between RT and TE; squeeze off-tackle.', coachingKeys: ['Punch and shed RT', 'Funnel run inside to Mike'] },
      { id: 'def_43o_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 390, y: 295, technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Scrape weak B-gap to perimeter on run flow; coverage hook-curl.', coachingKeys: ['Fast flow on weak zone', 'Stay clean of LG climb'] },
      { id: 'def_43o_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 295, technique: '20 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Plug strong A/B gap downhill on run; spy or middle hook on pass.', coachingKeys: ['Read Center/Guard triangle', 'Fill with heavy shoulder'] },
      { id: 'def_43o_s', label: 'S', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 675, y: 320, technique: 'Apex Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Apex / overhang over Tight End; force perimeter runs inside.', coachingKeys: ['Set D-gap edge', 'Jam TE release'] },
      { id: 'def_43o_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 132, y: 275, technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Cover 3 deep outside 1/3 or Cover 4 quarters.', coachingKeys: ['Cushion 7-8 yards', 'Eyes on receiver hips'] },
      { id: 'def_43o_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 848, y: 275, technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Cover 3 deep outside 1/3 or Cover 4 quarters.', coachingKeys: ['Cushion 7-8 yards', 'Do not get beat over top'] },
      { id: 'def_43o_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle 1/3 field safety; overlap outside vertical routes.', coachingKeys: ['Read QB front shoulder', 'Stay deeper than deepest'] },
      { id: 'def_43o_ss', label: 'SS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 560, y: 235, technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Down safety; curl-flat defender and primary run fit in strong alley.', coachingKeys: ['Alley support on sweep', 'Rob intermediate seam'] }
    ]
  },
  {
    id: 'front-4-3-under',
    name: '4-3 Under Front',
    side: 'defense',
    personnel: '4-3 Base Defense',
    description: '4-3 front setting the 3-tech DT to the weak side and 1-tech nose to the strong side, leaving Sam LB on the line of scrimmage over the TE.',
    players: [
      { id: 'def_43u_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 498, y: 348, technique: '1-Tech Strong', assignmentTitle: '1-Tech Strong Shade', assignmentNotes: 'Control strong A-gap between C and RG; occupy double team.', coachingKeys: ['Attack Center right shoulder', 'Hold ground on reach'] },
      { id: 'def_43u_dt', label: 'DT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 398, y: 348, technique: '3-Tech Weak', assignmentTitle: 'Weak 3-Tech DT', assignmentNotes: 'Penetrate weak B-gap; defeat LG single block to blow up counter/zone.', coachingKeys: ['Explode through LG outside shoulder', 'Chase from backside'] },
      { id: 'def_43u_dew', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 335, y: 348, technique: '5-Tech Weak', assignmentTitle: 'Weak 5-End', assignmentNotes: 'Speed rush weak C-gap edge; contain backside keeper.', coachingKeys: ['Bend around edge', 'Maintain quarterback leverage'] },
      { id: 'def_43u_des', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 642, y: 348, technique: '7-Tech Strong', assignmentTitle: 'Strong 7-End', assignmentNotes: 'Control inside shoulder of Tight End; lock up C-gap.', coachingKeys: ['Strike TE breastplate', 'Do not let TE reach'] },
      { id: 'def_43u_s', label: 'S', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 695, y: 335, technique: '9-Tech Strong', assignmentTitle: 'Sam Linebacker (LOS)', assignmentNotes: 'Stand-up edge defender outside TE; set hard edge in D-gap.', coachingKeys: ['Box everything inside', 'Reroute TE if releasing'] },
      { id: 'def_43u_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 570, y: 295, technique: '30 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Stack over strong B-gap; downhill plugger on off-tackle power.', coachingKeys: ['Scrape behind 7-tech DE', 'Punish pulling blockers'] },
      { id: 'def_43u_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 450, y: 295, technique: '10 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Stack weak A-gap; fast flow on weak inside zone or bootleg.', coachingKeys: ['Protect backside cutback', 'Fast trigger on guard pull'] },
      { id: 'def_43u_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 132, y: 275, technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Deep outside third.', coachingKeys: ['Maintain outside leverage'] },
      { id: 'def_43u_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 848, y: 275, technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Deep outside third.', coachingKeys: ['Maintain outside leverage'] },
      { id: 'def_43u_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Middle of field post.', coachingKeys: ['Apex deepest pass route'] },
      { id: 'def_43u_ss', label: 'SS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 580, y: 235, technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Intermediate robber and secondary strong-side run support.', coachingKeys: ['Read TE release', 'Fit strong C/D gap alley'] }
    ]
  },
  {
    id: 'front-3-4-over',
    name: '3-4 Over Front',
    side: 'defense',
    personnel: '3-4 Defense',
    description: 'Two-gap 3-4 front with 0-tech head-up Nose, 4i DE weak, 5-tech DE strong, twin inside backers (Mike & Will), and twin stand-up edge linebackers.',
    players: [
      { id: 'def_34o_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 348, technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Two-gap both A-gaps; demand double team from C and Guard.', coachingKeys: ['Strike Center chest', 'Own the midline'] },
      { id: 'def_34o_dew', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 378, y: 348, technique: '4i-Tech Weak', assignmentTitle: 'Weak 4i-End', assignmentNotes: 'Control weak B-gap; squeeze off-tackle and deny guard pull.', coachingKeys: ['Inside eye on LT', 'Forbid interior penetration'] },
      { id: 'def_34o_des', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 625, y: 348, technique: '5-Tech Strong', assignmentTitle: 'Strong 5-End', assignmentNotes: 'Control strong C-gap; set firm edge against reach block.', coachingKeys: ['Outside shoulder on RT', 'Keep outside pad free'] },
      { id: 'def_34o_olbw', label: 'OLB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 305, y: 335, technique: '9-Tech Weak', assignmentTitle: 'Backside Edge (Will OLB)', assignmentNotes: 'Contain edge; force cutback into pursuit; peel on bootleg.', coachingKeys: ['Set contain boundary', 'Rush or peel on RB'] },
      { id: 'def_34o_olbs', label: 'OLB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 695, y: 335, technique: '9-Tech Strong', assignmentTitle: 'Strongside Edge (Sam OLB)', assignmentNotes: 'Set perimeter cup; rush QB or drop into strong curl-flat.', coachingKeys: ['Constrict D-gap', 'Reroute Tight End'] },
      { id: 'def_34o_ilbw', label: 'ILB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 390, y: 295, technique: '30 Stack Weak', assignmentTitle: 'Weak Inside Backer (Will)', assignmentNotes: 'Scrape weak B-gap; flow downhill on zone action.', coachingKeys: ['Mirror RB steps', 'Stack and shed climbing tackle'] },
      { id: 'def_34o_ilbs', label: 'ILB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 295, technique: '20 Stack Strong', assignmentTitle: 'Strong Inside Backer (Mike)', assignmentNotes: 'Mirror RB mesh; fill strong A/B gap aggressively.', coachingKeys: ['Meet fullback/lead blocker in hole', 'Deliver heavy strike'] },
      { id: 'def_34o_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 132, y: 275, technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Cover 3 deep third.', coachingKeys: ['Backpedal with speed', 'Break on ball in flight'] },
      { id: 'def_34o_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 848, y: 275, technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Cover 3 deep third.', coachingKeys: ['Backpedal with speed', 'Break on ball in flight'] },
      { id: 'def_34o_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Middle third post control.', coachingKeys: ['Center field hawk', 'Read eyes of QB'] },
      { id: 'def_34o_ss', label: 'SS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 570, y: 235, technique: 'Robber Strong', assignmentTitle: 'Strong Safety', assignmentNotes: 'Roll down into strong hook-curl alley; primary run support.', coachingKeys: ['Trigger fast on run flash', 'Fill strong alley'] }
    ]
  },
  {
    id: 'front-3-5-odd',
    name: '3-5 Odd Front (3-3-5 Stack)',
    side: 'defense',
    personnel: '3-5-3 / 3-3-5 Defense',
    description: '3 down linemen with 0-tech head-up nose, dual 4i tackles, 3 second-level stack backers (Will, Mike, Sam), and twin apex overhangs (Bandit & Nickel).',
    players: [
      { id: 'def_35_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 348, technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Anchor both A-gaps; demand double-team block.', coachingKeys: ['Neutralize Center', 'Do not yield A-gap track'] },
      { id: 'def_35_dew', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 378, y: 348, technique: '4i-Tech Weak', assignmentTitle: '4i Weak DE', assignmentNotes: 'B-gap anchor; read option key for QB.', coachingKeys: ['Keep inside leverage on LT', 'Attack B-gap track'] },
      { id: 'def_35_des', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 582, y: 348, technique: '4i-Tech Strong', assignmentTitle: '4i Strong DE', assignmentNotes: 'Controls frontside B-gap; tight leverage on RT.', coachingKeys: ['Keep inside leverage on RT', 'Disrupt zone combo'] },
      { id: 'def_35_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 295, technique: '00 Stack', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Flow downhill to mirror mesh; fill A/B gap on run keys.', coachingKeys: ['Stay square behind Nose', 'Explode into ballcarrier'] },
      { id: 'def_35_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 390, y: 295, technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'B-gap scrape on zone action; protect backside glance.', coachingKeys: ['Read guard pull', 'Scrape over top to C-gap'] },
      { id: 'def_35_s', label: 'S', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 570, y: 295, technique: '30 Stack Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Scrapes strong B/C gap; fits off-tackle runs.', coachingKeys: ['Flow with strongside zone track', 'Funnel ball to Mike'] },
      { id: 'def_35_bd', label: 'BD', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 260, y: 320, technique: 'Apex Weak', assignmentTitle: 'Bandit Overhang', assignmentNotes: 'Perimeter force defender weak; contain bubble/flat.', coachingKeys: ['Outside-in leverage', 'Contain perimeter sweep'] },
      { id: 'def_35_nk', label: 'NK', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 740, y: 320, technique: 'Apex Strong', assignmentTitle: 'Nickel Overhang', assignmentNotes: 'Perimeter force defender strong; expand with speed flat.', coachingKeys: ['Read TE/slot release', 'Force everything inside'] },
      { id: 'def_35_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 132, y: 275, technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Deep 1/3 boundary bail.', coachingKeys: ['Press-bail technique', 'Protect deep sideline'] },
      { id: 'def_35_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 848, y: 275, technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Deep 1/3 field bail.', coachingKeys: ['Press-bail technique', 'Protect deep sideline'] },
      { id: 'def_35_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle of field insurance.', coachingKeys: ['Rotate to passing strength', 'Over the top support'] }
    ]
  },
  {
    id: 'front-4-2-5-nickel',
    name: '4-2-5 Nickel Over',
    side: 'defense',
    personnel: '4-2-5 Nickel',
    description: 'Modern 4-down front with 3-tech DT to strong side, 1-tech Nose to weak side, dual box backers (Mike & Will), and an athletic Nickel safety playing the apex.',
    players: [
      { id: 'def_425_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 462, y: 348, technique: '1-Tech Weak', assignmentTitle: '1-Tech Nose', assignmentNotes: 'Control weak A-gap; anchor against combo block.', coachingKeys: ['Disrupt Center-LG combination', 'Hold the point of attack'] },
      { id: 'def_425_dt', label: 'DT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 562, y: 348, technique: '3-Tech Strong', assignmentTitle: '3-Tech DT', assignmentNotes: 'Penetrate strong B-gap; disrupt zone and counter paths.', coachingKeys: ['Get off on snap', 'Shoot strong B-gap'] },
      { id: 'def_425_dew', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 335, y: 348, technique: '5-Tech Weak', assignmentTitle: 'Weak 5-End', assignmentNotes: 'Weak edge contain / QB option keep key.', coachingKeys: ['Keep shoulders parallel to LOS', 'Tackle dive or QB keep'] },
      { id: 'def_425_des', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 625, y: 348, technique: '5-Tech Strong', assignmentTitle: 'Strong 5-End', assignmentNotes: 'Set strong C-gap edge; squeeze off-tackle.', coachingKeys: ['Squeeze RT down block', 'Contain sweep outside'] },
      { id: 'def_425_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 390, y: 295, technique: '30 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Fast flow to weak perimeter; cover cutback lanes.', coachingKeys: ['Flow fast on outside zone', 'Bend back inside on counter'] },
      { id: 'def_425_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 540, y: 295, technique: '20 Stack Strong', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Downhill A/B gap plugger on run keys.', coachingKeys: ['Key offensive guard pull', 'Deliver violent hit in hole'] },
      { id: 'def_425_nk', label: 'NK', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 740, y: 320, technique: 'Apex Strong', assignmentTitle: 'Nickel Overhang', assignmentNotes: 'Alley defender; force bubble/flat and fit run from outside.', coachingKeys: ['Read slot receiver release', 'Set hard perimeter force'] },
      { id: 'def_425_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 132, y: 275, technique: 'Off CB Left', assignmentTitle: 'Left Cornerback', assignmentNotes: 'Cover 3 deep third or match quarters.', coachingKeys: ['Read WR stem', 'Break forward on screen'] },
      { id: 'def_425_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 848, y: 275, technique: 'Off CB Right', assignmentTitle: 'Right Cornerback', assignmentNotes: 'Cover 3 deep third or match quarters.', coachingKeys: ['Read WR stem', 'Break forward on screen'] },
      { id: 'def_425_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Free Safety', assignmentNotes: 'Deep middle of field insurance.', coachingKeys: ['Middle third post control', 'Read QB eyes'] },
      { id: 'def_425_ss', label: 'SS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 420, y: 235, technique: 'Robber Weak', assignmentTitle: 'Strong Safety (Weak Box)', assignmentNotes: 'Intermediate hole defender; bracket slot and support weak run.', coachingKeys: ['Rob intermediate crossers', 'Fit weakside alley'] }
    ]
  },
  {
    id: 'front-3-4-mint',
    name: 'Mint / Tite Front',
    side: 'defense',
    personnel: 'Mint / Tite Front',
    description: 'Saban/Smart Tite front closing both interior B-gaps with dual 4i ends and 0-nose, forcing runs to perimeter where linebackers scrape free.',
    players: [
      { id: 'def_mint_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 348, technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Anchor A-gaps; hold Center and RG combo.', coachingKeys: ['Control Center helmet', 'No A-gap leakage'] },
      { id: 'def_mint_de1', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 378, y: 348, technique: '4i-Tech Weak', assignmentTitle: 'Weak 4i-End', assignmentNotes: 'Plug weak B-gap tight; forbid interior climb to LB.', coachingKeys: ['Drive inside LT', 'Seal off weak B-gap'] },
      { id: 'def_mint_de2', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 582, y: 348, technique: '4i-Tech Strong', assignmentTitle: 'Strong 4i-End', assignmentNotes: 'Plug strong B-gap tight; forbid interior climb to LB.', coachingKeys: ['Drive inside RT', 'Seal off strong B-gap'] },
      { id: 'def_mint_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 390, y: 295, technique: '30 Stack Weak', assignmentTitle: 'Will Backer', assignmentNotes: 'Free to scrape C-gap and sideline on spill.', coachingKeys: ['Scrape free outside', 'Tackle on perimeter'] },
      { id: 'def_mint_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 570, y: 295, technique: '30 Stack Strong', assignmentTitle: 'Mike Backer', assignmentNotes: 'Free to scrape strong C-gap and perimeter on spill.', coachingKeys: ['Scrape free outside', 'Tackle on perimeter'] },
      { id: 'def_mint_jk', label: 'JK', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 305, y: 335, technique: '9-Tech Weak', assignmentTitle: 'Jack Backer', assignmentNotes: 'Stand-up backside edge; force cutback.', coachingKeys: ['Set hard perimeter cup', 'Keep outside arm free'] },
      { id: 'def_mint_st', label: 'ST', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 740, y: 320, technique: 'Apex Strong', assignmentTitle: 'Star Overhang', assignmentNotes: 'Overhang force player; jam slot and trigger on perimeter runs.', coachingKeys: ['Funnel everything back to LBs', 'Play aggressive flat'] },
      { id: 'def_mint_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 128, y: 335, technique: 'Press CB Left', assignmentTitle: 'Boundary Corner', assignmentNotes: 'Press-bail boundary.', coachingKeys: ['Disrupt WR timing', 'Bail into deep third'] },
      { id: 'def_mint_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 852, y: 335, technique: 'Press CB Right', assignmentTitle: 'Field Corner', assignmentNotes: 'Press-bail field.', coachingKeys: ['Disrupt WR timing', 'Bail into deep third'] },
      { id: 'def_mint_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 340, y: 195, technique: '2-High Safety Left', assignmentTitle: 'Split Safety Left', assignmentNotes: 'Cover 4 split half/quarter safety.', coachingKeys: ['Rob #2 vertical', 'Fill on run to boundary'] },
      { id: 'def_mint_ss', label: 'SS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 620, y: 195, technique: '2-High Safety Right', assignmentTitle: 'Split Safety Right', assignmentNotes: 'Cover 4 split half/quarter safety.', coachingKeys: ['Rob #2 vertical', 'Fill on run to field'] }
    ]
  },
  {
    id: 'front-bear-46',
    name: 'Bear / 46 Front',
    side: 'defense',
    personnel: 'Bear Front (46 Defense)',
    description: 'Historic Buddy Ryan Bear front covering Center and both Guards with 3 interior defensive linemen and twin edge rushers.',
    players: [
      { id: 'def_bear_nt', label: 'NT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 348, technique: '0-Tech', assignmentTitle: '0-Tech Nose', assignmentNotes: 'Destroy Center on snap; anchor midline.', coachingKeys: ['Bull rush Center', 'Forbid pass pocket step-up'] },
      { id: 'def_bear_dt1', label: 'DT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 398, y: 348, technique: '3-Tech Weak', assignmentTitle: 'Weak 3-Tech', assignmentNotes: 'Cover weak guard head/outside; penetrate weak B-gap.', coachingKeys: ['Deny guard pull', 'Disrupt zone tracks'] },
      { id: 'def_bear_dt2', label: 'DT', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 562, y: 348, technique: '3-Tech Strong', assignmentTitle: 'Strong 3-Tech', assignmentNotes: 'Cover strong guard head/outside; penetrate strong B-gap.', coachingKeys: ['Deny guard pull', 'Disrupt zone tracks'] },
      { id: 'def_bear_de1', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 305, y: 348, technique: '9-Tech Weak', assignmentTitle: 'Weak Edge Rusher', assignmentNotes: 'Speed contain rush off edge.', coachingKeys: ['Keep outside contain', 'Sprint to QB'] },
      { id: 'def_bear_de2', label: 'DE', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 695, y: 348, technique: '9-Tech Strong', assignmentTitle: 'Strong Edge Rusher', assignmentNotes: 'Speed contain rush off edge.', coachingKeys: ['Keep outside contain', 'Sprint to QB'] },
      { id: 'def_bear_m', label: 'M', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 295, technique: '00 Stack', assignmentTitle: 'Mike Linebacker', assignmentNotes: 'Clean A-gap plugger; fill aggressively downhill.', coachingKeys: ['Interior run stopper', 'Blitz A-gap on call'] },
      { id: 'def_bear_w', label: 'W', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 450, y: 295, technique: '10 Stack Weak', assignmentTitle: 'Will Linebacker', assignmentNotes: 'Stack weak A/B gap; blitz or cover RB.', coachingKeys: ['Downhill run fit', 'Match RB out of backfield'] },
      { id: 'def_bear_s', label: 'S', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 510, y: 295, technique: '10 Stack Strong', assignmentTitle: 'Sam Linebacker', assignmentNotes: 'Stack strong A/B gap; blitz or cover RB.', coachingKeys: ['Downhill run fit', 'Match RB out of backfield'] },
      { id: 'def_bear_cb1', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 128, y: 335, technique: 'Press CB Left', assignmentTitle: 'Press Corner Left', assignmentNotes: 'Zero man coverage.', coachingKeys: ['Hands on WR', 'No free releases'] },
      { id: 'def_bear_cb2', label: 'CB', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 852, y: 335, technique: 'Press CB Right', assignmentTitle: 'Press Corner Right', assignmentNotes: 'Zero man coverage.', coachingKeys: ['Hands on WR', 'No free releases'] },
      { id: 'def_bear_fs', label: 'FS', side: 'defense', shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000', x: 480, y: 155, technique: 'Single-High FS', assignmentTitle: 'Single High Free Safety', assignmentNotes: 'Center field hawk; sole deep safety in Cover 1/0.', coachingKeys: ['Read QB eyes', 'Defend post and go balls'] }
    ]
  }
];

async function seed() {
  console.log(`Starting upload of ${BASIC_DEFENSIVE_FRONTS.length} basic defensive fronts to Firestore...`);
  
  for (const front of BASIC_DEFENSIVE_FRONTS) {
    const frontRef = doc(db, 'formations', front.id);
    const data = {
      ...front,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(frontRef, data, { merge: true });
    console.log(`✔ Uploaded: ${front.name} (${front.id}) - ${front.players.length} players`);
  }

  console.log('✅ Successfully loaded all basic defensive fronts into Firebase Firestore!');
  process.exit(0);
}

if (process.argv[1] && process.argv[1].endsWith('seed-defensive-fronts.mjs')) {
  seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
