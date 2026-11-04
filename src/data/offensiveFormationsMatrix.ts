import type { Formation, Player } from '../types/playbook';

/**
 * Standard Offensive Line (5 players at LOS y=380)
 */
function createStandardOL(prefix: string): Player[] {
  return [
    {
      id: `${prefix}_lt`,
      label: 'LT',
      side: 'offense',
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x: 360,
      y: 380,
      assignmentTitle: 'Left Tackle',
      assignmentNotes: 'Set edge or base drive block.'
    },
    {
      id: `${prefix}_lg`,
      label: 'LG',
      side: 'offense',
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x: 420,
      y: 380,
      assignmentTitle: 'Left Guard',
      assignmentNotes: 'Combo interior 0/1-tech to linebacker.'
    },
    {
      id: `${prefix}_c`,
      label: 'C',
      side: 'offense',
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x: 480,
      y: 380,
      assignmentTitle: 'Center',
      assignmentNotes: 'Midline anchor point; snap and base drive.'
    },
    {
      id: `${prefix}_rg`,
      label: 'RG',
      side: 'offense',
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x: 540,
      y: 380,
      assignmentTitle: 'Right Guard',
      assignmentNotes: 'Frontside zone track or pull kickout.'
    },
    {
      id: `${prefix}_rt`,
      label: 'RT',
      side: 'offense',
      shape: 'none',
      nodeColor: '#000000',
      fillColor: 'transparent',
      letterColor: '#000000',
      x: 600,
      y: 380,
      assignmentTitle: 'Right Tackle',
      assignmentNotes: 'Frontside seal on 4i/5-tech edge.'
    }
  ];
}

function makeSkillPlayer(
  id: string,
  label: string,
  x: number,
  y: number,
  title: string,
  notes: string
): Player {
  return {
    id,
    label,
    side: 'offense',
    shape: 'none',
    nodeColor: '#000000',
    fillColor: 'transparent',
    letterColor: '#000000',
    x,
    y,
    assignmentTitle: title,
    assignmentNotes: notes
  };
}

export const MATRIX_OFFENSIVE_FORMATIONS: Formation[] = [
  // ==========================================
  // 31 PERSONNEL (3 RBs, 1 TE, 1 WR)
  // ==========================================
  {
    id: 'formation-wishbone-classic-31',
    name: 'Wishbone Classic 31',
    side: 'offense',
    personnel: '31',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['31', 'down_center', '1x1', 'old_school', 'wishbone', 'triple_option'],
    labels: ['31 Pers', 'Under Center', 'Old School', 'Triple Option'],
    description: 'Classic Under-Center Wishbone triple option backfield with full house (FB directly behind QB, two halfbacks split deep) and Y tight end.',
    players: [
      ...createStandardOL('wb31'),
      makeSkillPlayer('wb31_qb', 'QB', 480, 415, 'Under Center Pivot', 'Reverse pivot; mesh with FB dive; read DE for keep/pitch to halfback.'),
      makeSkillPlayer('wb31_fb', 'FB', 480, 465, 'Midline Dive', 'Press A/B gap downhill directly off guard block; receive dive or clear path.'),
      makeSkillPlayer('wb31_lhb', 'LHB', 410, 525, 'Option Pitch Relation', 'Maintain 4x4 pitch relationship with QB to the weak side or seal edge.'),
      makeSkillPlayer('wb31_rhb', 'RHB', 550, 525, 'Option Pitch Relation', 'Maintain 4x4 pitch relationship with QB on strongside option track.'),
      makeSkillPlayer('wb31_y', 'Y', 660, 380, 'Attached Tight End', 'Base block DE or arc release to scrape linebacker.'),
      makeSkillPlayer('wb31_x', 'X', 120, 380, 'Boundary Split End', 'Stalk corner or clear perimeter for option pitch.')
    ]
  },
  {
    id: 'formation-wing-t-31',
    name: 'Delaware Wing-T 31',
    side: 'offense',
    personnel: '31',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['31', 'down_center', '1x1', 'old_school', 'wing_t', 'buck_sweep'],
    labels: ['31 Pers', 'Under Center', 'Old School', 'Wing-T'],
    description: 'Traditional Delaware Wing-T alignment with Fullback behind QB, Halfback offset weak, and Wingback on the hip of the tight end.',
    players: [
      ...createStandardOL('wt31'),
      makeSkillPlayer('wt31_qb', 'QB', 480, 415, 'Under Center Operator', 'Execute buck sweep handoff fake to FB, ride mesh with WB or keep boot.'),
      makeSkillPlayer('wt31_fb', 'FB', 480, 465, 'Fullback Trap / Dive', 'Aim inside leg of guard on trap track; punish interior A-gap.'),
      makeSkillPlayer('wt31_hb', 'HB', 420, 520, 'Halfback Counter / Sweep', 'Offset weakside halfback; lead on buck sweep or receive counter handoff.'),
      makeSkillPlayer('wt31_wb', 'WB', 720, 410, 'Wingback', 'Lined up on hip of Y; motion across for buck sweep or crack safety.'),
      makeSkillPlayer('wt31_y', 'Y', 660, 380, 'Strongside Tight End', 'Down block tackle or reach defensive end.'),
      makeSkillPlayer('wt31_x', 'X', 120, 380, 'Split End', 'Isolate boundary corner on post/fade.')
    ]
  },
  {
    id: 'formation-maryland-i-31',
    name: 'Maryland I 31',
    side: 'offense',
    personnel: '31',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['31', 'down_center', '1x1', 'old_school', 'maryland_i', 'power'],
    labels: ['31 Pers', 'Under Center', 'Old School', 'Power I'],
    description: 'Three running backs stacked in a straight vertical line behind the under-center quarterback for maximum downhill isolation and power.',
    players: [
      ...createStandardOL('mi31'),
      makeSkillPlayer('mi31_qb', 'QB', 480, 415, 'Under Center Pivot', 'Direct snap; reverse pivot and hand off to deep tailback with dual lead fullbacks.'),
      makeSkillPlayer('mi31_fb1', 'FB1', 480, 460, 'First Lead Blocker', 'Kick out edge defender or first linebacker in B-gap.'),
      makeSkillPlayer('mi31_fb2', 'FB2', 480, 510, 'Second Lead Blocker', 'Insert into A/B gap and seal Mike linebacker.'),
      makeSkillPlayer('mi31_tb', 'TB', 480, 560, 'Deep Tailback', 'Follow dual lead wall downhill with explosive north-south burst.'),
      makeSkillPlayer('mi31_y', 'Y', 660, 380, 'Inline Tight End', 'Drive block strongside defensive end.'),
      makeSkillPlayer('mi31_x', 'X', 120, 380, 'Split End', 'Stalk boundary corner.')
    ]
  },
  {
    id: 'formation-power-t-31',
    name: 'Power-T Formation 31',
    side: 'offense',
    personnel: '31',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['31', 'down_center', '1x1', 'old_school', 'power_t'],
    labels: ['31 Pers', 'Under Center', 'Old School', 'T-Formation'],
    description: 'Classic T-Formation with 3 backs aligned horizontally 4 yards behind under-center QB for misdirection and quick-hitting wedge blocks.',
    players: [
      ...createStandardOL('pt31'),
      makeSkillPlayer('pt31_qb', 'QB', 480, 415, 'Under Center Pivot', 'Turn and ride midline mesh with center FB or give to sweep HB.'),
      makeSkillPlayer('pt31_lhb', 'LHB', 400, 470, 'Left Halfback', 'Sweep track left or fold block inside on counter.'),
      makeSkillPlayer('pt31_fb', 'FB', 480, 470, 'Middle Fullback', 'Plunge straight into midline A-gap behind center wedge.'),
      makeSkillPlayer('pt31_rhb', 'RHB', 560, 470, 'Right Halfback', 'Sweep track right or seal off-tackle C-gap.'),
      makeSkillPlayer('pt31_y', 'Y', 660, 380, 'Tight End', 'Base block or combo to second level.'),
      makeSkillPlayer('pt31_x', 'X', 120, 380, 'Split End', 'Perimeter clearout or stalk.')
    ]
  },
  {
    id: 'formation-pistol-fullhouse-31',
    name: 'Pistol Full House 31',
    side: 'offense',
    personnel: '31',
    qbPosition: 'pistol',
    receiverAlignment: '2x1',
    style: 'old_school',
    isBunch: false,
    tags: ['31', 'pistol', '2x1', 'old_school', 'fullhouse', 'triple_option'],
    labels: ['31 Pers', 'Pistol', 'Old School', 'Option'],
    description: 'Pistol alignment with dual flanking H-backs flanking the QB and deep tailback, preserving downhill rushing angles with pistol passing spacing.',
    players: [
      ...createStandardOL('pfh31'),
      makeSkillPlayer('pfh31_qb', 'QB', 480, 440, 'Pistol Operator', 'Mesh with tailback; read defensive end for keep or speed pitch to H2.'),
      makeSkillPlayer('pfh31_h1', 'H1', 410, 440, 'Left H-Back', 'Lead block weakside B-gap or kick out defensive end.'),
      makeSkillPlayer('pfh31_h2', 'H2', 550, 440, 'Right H-Back', 'Arc release for option pitch relation or seal overhang.'),
      makeSkillPlayer('pfh31_tb', 'TB', 480, 520, 'Pistol Tailback', 'Downhill north-south zone/power track behind guard.'),
      makeSkillPlayer('pfh31_y', 'Y', 660, 380, 'Inline Tight End', 'Drive block defensive end.'),
      makeSkillPlayer('pfh31_x', 'X', 120, 380, 'Split End', 'Isolate corner on glance / hitch.')
    ]
  },

  // ==========================================
  // 30 PERSONNEL (3 RBs, 0 TE, 2 WRs)
  // ==========================================
  {
    id: 'formation-wishbone-open-30',
    name: 'Wishbone Open 30',
    side: 'offense',
    personnel: '30',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['30', 'down_center', '1x1', 'old_school', 'wishbone_open'],
    labels: ['30 Pers', 'Under Center', 'Old School', 'Spread Option'],
    description: 'Spread Wishbone featuring 3 backs under center and split wide receivers on both sides, removing the tight end to widen the defensive box.',
    players: [
      ...createStandardOL('wo30'),
      makeSkillPlayer('wo30_qb', 'QB', 480, 415, 'Under Center Option', 'Triple option read: give dive, keep, or pitch to halfback with box spread.'),
      makeSkillPlayer('wo30_fb', 'FB', 480, 465, 'Fullback Dive', 'Aim playside guard inside leg.'),
      makeSkillPlayer('wo30_lhb', 'LHB', 410, 525, 'Left Halfback', 'Pitch track weakside.'),
      makeSkillPlayer('wo30_rhb', 'RHB', 550, 525, 'Right Halfback', 'Pitch track strongside.'),
      makeSkillPlayer('wo30_x', 'X', 120, 380, 'Split End Left', 'Backside hitch / fade alert.'),
      makeSkillPlayer('wo30_z', 'Z', 860, 380, 'Split End Right', 'Field post / fade alert.')
    ]
  },
  {
    id: 'formation-shotgun-diamond-30',
    name: 'Shotgun Diamond 30',
    side: 'offense',
    personnel: '30',
    qbPosition: 'shotgun',
    receiverAlignment: '2x1',
    style: 'spread',
    isBunch: false,
    tags: ['30', 'shotgun', '2x1', 'spread', 'diamond', 'counter_bash'],
    labels: ['30 Pers', 'Shotgun', 'Spread', 'Diamond'],
    description: 'Shotgun Diamond formation with 3 backs surrounding the quarterback (2 sidecars, 1 deep back) and dual split receivers.',
    players: [
      ...createStandardOL('sd30'),
      makeSkillPlayer('sd30_qb', 'QB', 480, 465, 'Gun Diamond Operator', 'Read backside defensive end on inverted veer or counter bash.'),
      makeSkillPlayer('sd30_h1', 'H1', 415, 465, 'Left Sidecar', 'Lead block through B-gap or pull across formation on counter.'),
      makeSkillPlayer('sd30_h2', 'H2', 545, 465, 'Right Sidecar', 'Lead block edge or arc release for option pitch.'),
      makeSkillPlayer('sd30_tb', 'TB', 480, 530, 'Deep Pistol Back', 'Aiming point inside A-gap or sweep track opposite QB read.'),
      makeSkillPlayer('sd30_x', 'X', 120, 380, 'Split End Left', 'Boundary glance route.'),
      makeSkillPlayer('sd30_z', 'Z', 860, 380, 'Flanker Right', 'Field comeback / vertical.')
    ]
  },

  // ==========================================
  // 22 PERSONNEL (2 RBs, 2 TEs, 1 WR)
  // ==========================================
  {
    id: 'formation-power-i-tank-22',
    name: 'Power-I Tank 22',
    side: 'offense',
    personnel: '22',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['22', 'down_center', '1x1', 'pro_style', 'power_i', 'tank'],
    labels: ['22 Pers', 'Under Center', 'Pro Style', 'Jumbo Heavy'],
    description: 'Heavy Jumbo 22 personnel with double tight ends (Y & U on both sides of line) and classic FB/TB I-formation for goal-line power and max protect.',
    players: [
      ...createStandardOL('pi22'),
      makeSkillPlayer('pi22_u', 'U', 300, 380, 'Left Tight End', 'Base block weakside DE; create 7-man offensive line surface.'),
      makeSkillPlayer('pi22_y', 'Y', 660, 380, 'Right Tight End', 'Base block strongside DE or combo to linebacker.'),
      makeSkillPlayer('pi22_qb', 'QB', 480, 415, 'Under Center QB', 'Turn and hand off Power-O to tailback or execute play-action rollout.'),
      makeSkillPlayer('pi22_fb', 'FB', 480, 465, 'Lead Fullback', 'Isolate Sam linebacker in C-gap; blow open running lane.'),
      makeSkillPlayer('pi22_tb', 'TB', 480, 525, 'Tailback', 'Follow fullback lead block downhill with high knee drive.'),
      makeSkillPlayer('pi22_x', 'X', 120, 380, 'Isolated Split End', 'Single-coverage red zone fade alert.')
    ]
  },
  {
    // The id keeps "22" from the original name so plays already linked to this template stay linked.
    id: 'formation-double-wing-22',
    name: 'Double Wing 32',
    side: 'offense',
    personnel: '32',
    qbPosition: 'down_center',
    receiverAlignment: '1x1',
    style: 'old_school',
    isBunch: false,
    tags: ['32', 'down_center', '1x1', 'old_school', 'double_wing', 'toss'],
    labels: ['32 Pers', 'Under Center', 'Old School', 'Double Wing'],
    description: 'Old School Double Wing set with dual inline tight ends and dual wingbacks 1 yard off the hip of each TE. Heavy toss, trap, and wedge scheme.',
    players: [
      ...createStandardOL('dw22'),
      makeSkillPlayer('dw22_u', 'U', 300, 380, 'Left Tight End', 'Down block on interior tackle.'),
      makeSkillPlayer('dw22_y', 'Y', 660, 380, 'Right Tight End', 'Down block or reach defensive end.'),
      makeSkillPlayer('dw22_lw', 'LW', 240, 410, 'Left Wingback', 'Motion across backfield for toss sweep or kick out end.'),
      makeSkillPlayer('dw22_rw', 'RW', 720, 410, 'Right Wingback', 'Crack safety or seal perimeter overhang.'),
      makeSkillPlayer('dw22_qb', 'QB', 480, 415, 'Under Center Pivot', 'Reverse pivot and pitch toss to wingback in full motion.'),
      makeSkillPlayer('dw22_bb', 'B', 480, 470, 'B-Back', 'Plunge into wedge or lead block into perimeter alley.')
    ]
  },
  {
    id: 'formation-pistol-heavy-22',
    name: 'Pistol Heavy 22',
    side: 'offense',
    personnel: '22',
    qbPosition: 'pistol',
    receiverAlignment: '1x2',
    style: 'pro_style',
    isBunch: false,
    tags: ['22', 'pistol', '1x2', 'pro_style', 'heavy'],
    labels: ['22 Pers', 'Pistol', 'Pro Style', 'Heavy'],
    description: 'Pistol 22 personnel with dual tight ends, an offset lead fullback, and deep pistol tailback for downhill Duo and counter gap schemes.',
    players: [
      ...createStandardOL('ph22'),
      makeSkillPlayer('ph22_u', 'U', 300, 380, 'Left Tight End', 'Base drive block on edge defender.'),
      makeSkillPlayer('ph22_y', 'Y', 660, 380, 'Right Tight End', 'Double team 5-tech with tackle to linebacker.'),
      makeSkillPlayer('ph22_qb', 'QB', 480, 440, 'Pistol Operator', 'Handoff Duo/Counter to tailback; fake bootleg weak.'),
      makeSkillPlayer('ph22_fb', 'FB', 430, 460, 'Offset Fullback', 'Insert into playside B-gap and isolate Mike linebacker.'),
      makeSkillPlayer('ph22_tb', 'TB', 480, 520, 'Pistol Tailback', 'Press Duo track downhill; read linebacker leverage.'),
      makeSkillPlayer('ph22_x', 'X', 120, 380, 'Solo Split End', 'Isolate corner on backside dig/slant.')
    ]
  },

  // ==========================================
  // 21 PERSONNEL (2 RBs, 1 TE, 2 WRs)
  // ==========================================
  {
    id: 'formation-strong-i-21',
    name: 'Strong-I 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'down_center',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['21', 'down_center', '2x1', 'pro_style', 'strong_i', 'lead'],
    labels: ['21 Pers', 'Under Center', 'Pro Style', 'Strong-I'],
    description: 'Pro-style Strong-I with fullback offset to the tight end (strong) side, providing immediate blocking leverage on C-gap Power and Isolation.',
    players: [
      ...createStandardOL('si21'),
      makeSkillPlayer('si21_y', 'Y', 660, 380, 'Attached Tight End', 'Drive block strongside DE or combo to Sam LB.'),
      makeSkillPlayer('si21_qb', 'QB', 480, 415, 'Under Center Pivot', 'Reverse pivot and hand off to tailback; sell play-action naked bootleg.'),
      makeSkillPlayer('si21_fb', 'FB', 520, 465, 'Strongside Fullback', 'Offset to TE side; lead through C-gap and blast Sam linebacker.'),
      makeSkillPlayer('si21_tb', 'TB', 480, 525, 'Tailback', 'Follow fullback lead through C-gap on strong power.'),
      makeSkillPlayer('si21_x', 'X', 120, 380, 'Split End Left', 'Iso boundary post/slant.'),
      makeSkillPlayer('si21_z', 'Z', 860, 395, 'Flanker Right', 'Field corner stalk or corner route.')
    ]
  },
  {
    id: 'formation-weak-i-21',
    name: 'Weak-I 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'down_center',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['21', 'down_center', '2x1', 'pro_style', 'weak_i', 'counter'],
    labels: ['21 Pers', 'Under Center', 'Pro Style', 'Weak-I'],
    description: 'Pro-style Weak-I with fullback offset away from the tight end. Ideal for weakside lead zone, counter misdirection, and weakside bootlegs.',
    players: [
      ...createStandardOL('wi21'),
      makeSkillPlayer('wi21_y', 'Y', 660, 380, 'Attached Tight End', 'Base block or cross-formation leak on play-action boot.'),
      makeSkillPlayer('wi21_qb', 'QB', 480, 415, 'Under Center Pivot', 'Handoff to tailback on weak lead or execute bootleg to TE side.'),
      makeSkillPlayer('wi21_fb', 'FB', 440, 465, 'Weakside Fullback', 'Offset weak; lead block through weak B-gap on Will LB.'),
      makeSkillPlayer('wi21_tb', 'TB', 480, 525, 'Tailback', 'Cut back off center block into weakside B-gap.'),
      makeSkillPlayer('wi21_x', 'X', 120, 380, 'Split End Left', 'Crack safety or stalk corner.'),
      makeSkillPlayer('wi21_z', 'Z', 860, 395, 'Flanker Right', 'Clearout route on field side.')
    ]
  },
  {
    id: 'formation-split-backs-pro-21',
    name: 'Split Backs Pro 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'down_center',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['21', 'down_center', '2x1', 'pro_style', 'split_backs', 'west_coast'],
    labels: ['21 Pers', 'Under Center', 'Pro Style', 'West Coast'],
    description: 'Bill Walsh West Coast Offense classic split backs formation with FB and HB balanced behind under-center QB for Texas angle routes and sprint-outs.',
    players: [
      ...createStandardOL('sb21'),
      makeSkillPlayer('sb21_y', 'Y', 660, 380, 'Attached Tight End', 'Intermediate 10-yard dig or seam release.'),
      makeSkillPlayer('sb21_qb', 'QB', 480, 415, 'Under Center QB', '5-step drop; read HB Texas route against linebacker or throw quick out.'),
      makeSkillPlayer('sb21_fb', 'FB', 430, 480, 'Left Split Back', 'Scan for blitz pickup or release to weak flat.'),
      makeSkillPlayer('sb21_hb', 'HB', 530, 480, 'Right Split Back', 'Execute Texas / angle route over the middle behind LB drop.'),
      makeSkillPlayer('sb21_x', 'X', 120, 380, 'Split End Left', '3-step slant route.'),
      makeSkillPlayer('sb21_z', 'Z', 860, 395, 'Flanker Right', '12-yard curl route.')
    ]
  },
  {
    id: 'formation-shotgun-split-21',
    name: 'Shotgun Split 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'shotgun',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['21', 'shotgun', '2x1', 'pro_style', 'split', 'pass_protection'],
    labels: ['21 Pers', 'Shotgun', 'Pro Style', 'Split Backs'],
    description: 'Shotgun formation with dual running backs flanking the quarterback for dual cross-protection against blitzes and dual swing routes.',
    players: [
      ...createStandardOL('sgs21'),
      makeSkillPlayer('sgs21_y', 'Y', 660, 380, 'Attached Tight End', 'Seam / cross route.'),
      makeSkillPlayer('sgs21_qb', 'QB', 480, 465, 'Shotgun QB', 'Read high-low coverage with clean pocket protection.'),
      makeSkillPlayer('sgs21_rb1', 'RB1', 415, 465, 'Left Sidecar Back', 'Check-release weak flat or pick up A/B gap blitz.'),
      makeSkillPlayer('sgs21_rb2', 'RB2', 545, 465, 'Right Sidecar Back', 'Check-release strong flat or seal edge on zone read.'),
      makeSkillPlayer('sgs21_x', 'X', 120, 380, 'Split End Left', 'Boundary glance route.'),
      makeSkillPlayer('sgs21_z', 'Z', 860, 395, 'Flanker Right', 'Field comeback / post.')
    ]
  },
  {
    id: 'formation-pistol-i-21',
    name: 'Pistol I-Form 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'pistol',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['21', 'pistol', '2x1', 'pro_style', 'pistol_i'],
    labels: ['21 Pers', 'Pistol', 'Pro Style', 'Pistol I'],
    description: 'Pistol I-Formation with inline fullback directly behind pistol QB and deep tailback at 7 yards for downhill downhill north-south tracks.',
    players: [
      ...createStandardOL('pi21'),
      makeSkillPlayer('pi21_y', 'Y', 660, 380, 'Tight End', 'Drive block DE or release on seam.'),
      makeSkillPlayer('pi21_qb', 'QB', 480, 440, 'Pistol QB', 'Direct handoff to tailback or bootleg play-action.'),
      makeSkillPlayer('pi21_fb', 'FB', 480, 485, 'Inline Lead Fullback', 'Isolate Mike linebacker downhill through A-gap.'),
      makeSkillPlayer('pi21_tb', 'TB', 480, 545, 'Deep Pistol Tailback', 'Receive handoff at full speed; press cutback lane.'),
      makeSkillPlayer('pi21_x', 'X', 120, 380, 'Split End Left', 'Iso post / hitch.'),
      makeSkillPlayer('pi21_z', 'Z', 860, 395, 'Flanker Right', 'Stalk field corner.')
    ]
  },
  {
    id: 'formation-pro-i-condensed-bunch-21',
    name: 'Pro-I Condensed Bunch 21',
    side: 'offense',
    personnel: '21',
    qbPosition: 'down_center',
    receiverAlignment: '3x0',
    style: 'pro_style',
    isBunch: true,
    tags: ['21', 'down_center', '3x0', 'pro_style', 'bunch', 'condensed'],
    labels: ['21 Pers', 'Under Center', 'Pro Style', 'Bunch'],
    description: 'Under-center 21 personnel with TE and two WRs condensed into a tight 3-man bunch to create natural rub routes and heavy perimeter run blocking.',
    players: [
      ...createStandardOL('pib21'),
      makeSkillPlayer('pib21_y', 'Y', 660, 380, 'Bunch Point (TE)', 'Point of bunch on LOS; seal edge or run corner route.'),
      makeSkillPlayer('pib21_z', 'Z', 710, 400, 'Bunch Wing (Z)', 'Flanker off LOS in bunch; execute wheel or mesh crosser.'),
      makeSkillPlayer('pib21_w', 'W', 675, 420, 'Bunch Sniffer (W)', 'Condensed slot off LOS; flat arrow route or crack block.'),
      makeSkillPlayer('pib21_qb', 'QB', 480, 415, 'Under Center QB', 'Play-action turn; fire quick bunch concept or handoff power.'),
      makeSkillPlayer('pib21_fb', 'FB', 480, 465, 'Lead Fullback', 'Kick out edge or lead through C-gap.'),
      makeSkillPlayer('pib21_tb', 'TB', 480, 525, 'Tailback', 'Downhill run track or check-release.')
    ]
  },
  {
    id: 'formation-shotgun-21-wing-bunch',
    name: 'Shotgun 21 Wing Bunch',
    side: 'offense',
    personnel: '21',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['21', 'shotgun', '3x1', 'spread', 'bunch', 'wing_bunch'],
    labels: ['21 Pers', 'Shotgun', 'Spread', 'Bunch'],
    description: 'Shotgun 21 personnel with H-Back stepping up to form a 3-man bunch triangle with TE and Z receiver. Combines RPO spacing with rub routes.',
    players: [
      ...createStandardOL('gwb21'),
      makeSkillPlayer('gwb21_y', 'Y', 660, 380, 'Bunch Point TE', 'On LOS; vertical clearout or drag across field.'),
      makeSkillPlayer('gwb21_h', 'H', 670, 415, 'Bunch H-Back', 'Off LOS in bunch; arrow flat screen or perimeter lead block.'),
      makeSkillPlayer('gwb21_z', 'Z', 715, 395, 'Bunch Flanker', 'Off LOS; snag / pivot route underneath.'),
      makeSkillPlayer('gwb21_qb', 'QB', 480, 465, 'Shotgun QB', 'Read bunch overhang or hand off inside zone.'),
      makeSkillPlayer('gwb21_tb', 'TB', 420, 465, 'Sidecar Tailback', 'Inside zone track away from bunch.'),
      makeSkillPlayer('gwb21_x', 'X', 120, 380, 'Backside Solo WR', 'Boundary glance / slant.')
    ]
  },

  // ==========================================
  // 20 PERSONNEL (2 RBs, 0 TE, 3 WRs)
  // ==========================================
  {
    id: 'formation-shotgun-pony-split-20',
    name: 'Gun 20 Split (Pony)',
    side: 'offense',
    personnel: '20',
    qbPosition: 'shotgun',
    receiverAlignment: '2x1',
    style: 'spread',
    isBunch: false,
    tags: ['20', 'shotgun', '2x1', 'spread', 'pony', 'split_backs'],
    labels: ['20 Pers', 'Shotgun', 'Spread', 'Pony Set'],
    description: 'Modern 20 personnel "Pony" package featuring 2 dynamic running backs flanking the shotgun quarterback with 3 wide receivers spreading the secondary.',
    players: [
      ...createStandardOL('gp20'),
      makeSkillPlayer('gp20_qb', 'QB', 480, 465, 'Shotgun Operator', 'Zone read option with dual back threat or dual swing screen.'),
      makeSkillPlayer('gp20_rb1', 'RB1', 415, 465, 'Left Pony Back', 'Zone track across face or swing route to boundary.'),
      makeSkillPlayer('gp20_rb2', 'RB2', 545, 465, 'Right Pony Back', 'Lead block for QB keeper or wheel route to field.'),
      makeSkillPlayer('gp20_x', 'X', 120, 380, 'Boundary WR', 'Glance / hitch iso.'),
      makeSkillPlayer('gp20_h', 'H', 730, 395, 'Slot WR Right', 'Quick out / bubble screen.'),
      makeSkillPlayer('gp20_z', 'Z', 860, 380, 'Flanker Right', 'Stalk corner or vertical fade.')
    ]
  },
  {
    id: 'formation-shotgun-20-trips',
    name: 'Gun 20 Trips',
    side: 'offense',
    personnel: '20',
    qbPosition: 'shotgun',
    receiverAlignment: '3x0',
    style: 'spread',
    isBunch: false,
    tags: ['20', 'shotgun', '3x0', 'spread', 'trips'],
    labels: ['20 Pers', 'Shotgun', 'Spread', 'Trips'],
    description: '3 wide receivers overloaded to the field with dual running backs in the backfield for max slide pass protection and misdirection counter runs.',
    players: [
      ...createStandardOL('g20t'),
      makeSkillPlayer('g20t_qb', 'QB', 480, 465, 'Shotgun QB', 'Scan trips route tree; dual backs pick up exotic blitzes.'),
      makeSkillPlayer('g20t_rb1', 'RB1', 415, 465, 'Sidecar Back', 'Inside zone track or check-release.'),
      makeSkillPlayer('g20t_rb2', 'RB2', 415, 520, 'Stacked Back', 'Lead block on counter or pass block edge rusher.'),
      makeSkillPlayer('g20t_x', 'X', 670, 395, 'Inside Trips Slot', 'Bender seam route.'),
      makeSkillPlayer('g20t_h', 'H', 750, 395, 'Middle Trips Slot', 'Out / pivot route.'),
      makeSkillPlayer('g20t_z', 'Z', 860, 380, 'Outside Trips Flanker', 'Vertical post / clearout.')
    ]
  },
  {
    id: 'formation-shotgun-20-pony-bunch',
    name: 'Gun 20 Pony Bunch',
    side: 'offense',
    personnel: '20',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['20', 'shotgun', '3x1', 'spread', 'bunch', 'pony_bunch'],
    labels: ['20 Pers', 'Shotgun', 'Spread', 'Bunch'],
    description: 'One tailback in the backfield and the second dynamic running back split wide inside a 3-man bunch cluster to create matchup problems against linebackers.',
    players: [
      ...createStandardOL('g20pb'),
      makeSkillPlayer('g20pb_qb', 'QB', 480, 465, 'Shotgun QB', 'Read bunch rub concept; hit RB2 on quick arrow or wheel.'),
      makeSkillPlayer('g20pb_rb1', 'RB1', 420, 465, 'Backfield RB', 'Inside zone track to keep linebackers honest.'),
      makeSkillPlayer('g20pb_rb2', 'RB2', 675, 415, 'Bunch RB2', 'Aligned inside bunch; arrow flat screen or wheel mismatch.'),
      makeSkillPlayer('g20pb_y', 'Y', 660, 380, 'Bunch Point WR', 'Point on LOS; vertical clearout.'),
      makeSkillPlayer('g20pb_z', 'Z', 715, 395, 'Bunch Flanker', 'Snag / sit route underneath.'),
      makeSkillPlayer('g20pb_x', 'X', 120, 380, 'Backside Solo WR', 'Isolated boundary post.')
    ]
  },

  // ==========================================
  // 12 PERSONNEL (1 RB, 2 TEs, 2 WRs)
  // ==========================================
  {
    id: 'formation-deuce-12',
    name: 'Deuce / Twin-TE (12 Personnel)',
    side: 'offense',
    personnel: '12',
    qbPosition: 'down_center',
    receiverAlignment: '2x2',
    style: 'pro_style',
    isBunch: false,
    tags: ['12', 'down_center', '2x2', 'pro_style', 'deuce', 'twin_te'],
    labels: ['12 Pers', 'Under Center', 'Pro Style', 'Deuce'],
    description: '12 Personnel Deuce formation pairing inline TE (Y) and wing TE (U) on the same side with split WRs, adaptable between Under Center, Pistol, and Shotgun for power gap runs and play-action crossers.',
    players: [
      ...createStandardOL('deuce12'),
      makeSkillPlayer('deuce12_y', 'Y', 660, 380, 'Inline Tight End', 'Base block DE or climb to Sam LB.'),
      makeSkillPlayer('deuce12_u', 'U', 720, 400, 'Wing/Slot Tight End', 'Seal overhang defender or leak into flat on play-action.'),
      makeSkillPlayer('deuce12_qb', 'QB', 480, 415, 'Under Center QB', 'Reverse pivot handoff on Duo/Power, or roll out bootleg.'),
      makeSkillPlayer('deuce12_tb', 'TB', 480, 500, 'Singleback Tailback', 'Downhill track behind double-team on 3-tech.'),
      makeSkillPlayer('deuce12_x', 'X', 120, 380, 'Split End Left', 'Iso boundary slant / go.'),
      makeSkillPlayer('deuce12_z', 'Z', 860, 380, 'Flanker Right', 'Field clearout / comeback.')
    ]
  },
  {
    id: 'formation-shotgun-12-doubles',
    name: 'Gun 12 Doubles (Y-Off)',
    side: 'offense',
    personnel: '12',
    qbPosition: 'shotgun',
    receiverAlignment: '2x2',
    style: 'spread',
    isBunch: false,
    tags: ['12', 'shotgun', '2x2', 'spread', 'y_off', 'rpo'],
    labels: ['12 Pers', 'Shotgun', 'Spread', '2x2 Doubles'],
    description: 'Modern 12 personnel spread with 1 inline TE right and 1 flexed H-back slot left, creating a balanced 2x2 presentation with high-level split-zone RPO capability.',
    players: [
      ...createStandardOL('g12d'),
      makeSkillPlayer('g12d_y', 'Y', 660, 380, 'Inline Tight End', 'Drive block DE or run seam/pop route.'),
      makeSkillPlayer('g12d_u', 'U', 270, 395, 'Flexed Slot TE', 'Slot bubble screen or split slice across formation.'),
      makeSkillPlayer('g12d_qb', 'QB', 480, 465, 'Shotgun Operator', 'Read backside defensive end for split zone or throw slot RPO.'),
      makeSkillPlayer('g12d_rb', 'RB', 540, 465, 'Sidecar Back', 'Aiming point inside A-gap on split zone track.'),
      makeSkillPlayer('g12d_x', 'X', 120, 380, 'Boundary WR', 'Glance / hitch iso.'),
      makeSkillPlayer('g12d_z', 'Z', 860, 380, 'Field WR', 'Vertical clearout / comeback.')
    ]
  },
  {
    id: 'formation-shotgun-12-trey-bunch',
    name: 'Gun 12 Trey Bunch',
    side: 'offense',
    personnel: '12',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['12', 'shotgun', '3x1', 'spread', 'bunch', 'heavy_bunch'],
    labels: ['12 Pers', 'Shotgun', 'Spread', 'Heavy Bunch'],
    description: 'Heavy 12 personnel bunch pairing 2 Tight Ends (Y on LOS, U in sniffer) and Z receiver in a powerful 3-man cluster for gap runs and rub-route seams.',
    players: [
      ...createStandardOL('g12tb'),
      makeSkillPlayer('g12tb_y', 'Y', 660, 380, 'Bunch Point (TE1)', 'On LOS; block DE or vertical seam attack.'),
      makeSkillPlayer('g12tb_u', 'U', 685, 415, 'Bunch Sniffer (TE2)', 'Off LOS; kick out edge or release to flat.'),
      makeSkillPlayer('g12tb_z', 'Z', 725, 395, 'Bunch Flanker (Z)', 'Off LOS; rub route or corner shot.'),
      makeSkillPlayer('g12tb_qb', 'QB', 480, 465, 'Shotgun QB', 'Read edge defender or trigger vertical bunch concept.'),
      makeSkillPlayer('g12tb_rb', 'RB', 420, 465, 'Sidecar Back', 'Pin & pull or inside zone track.'),
      makeSkillPlayer('g12tb_x', 'X', 120, 380, 'Solo Backside WR', 'Isolated boundary post.')
    ]
  },
  {
    id: 'formation-pistol-12-wing',
    name: 'Pistol 12 Wing',
    side: 'offense',
    personnel: '12',
    qbPosition: 'pistol',
    receiverAlignment: '2x2',
    style: 'pro_style',
    isBunch: false,
    tags: ['12', 'pistol', '2x2', 'pro_style', 'wing', 'counter_trey'],
    labels: ['12 Pers', 'Pistol', 'Pro Style', 'Wing'],
    description: 'Pistol 12 personnel with 1 inline TE and 1 wingback TE on the same side, powering downhill Counter Trey and Play-Action Bootlegs.',
    players: [
      ...createStandardOL('p12w'),
      makeSkillPlayer('p12w_y', 'Y', 660, 380, 'Inline Tight End', 'Down block tackle or climb to linebacker.'),
      makeSkillPlayer('p12w_u', 'U', 720, 410, 'Wing Tight End', 'Pull across formation on counter trey or lead block.'),
      makeSkillPlayer('p12w_qb', 'QB', 480, 440, 'Pistol QB', 'Handoff counter trey to deep back; roll out bootleg.'),
      makeSkillPlayer('p12w_tb', 'TB', 480, 520, 'Pistol Tailback', 'Counter track downhill behind pulling guard and wing TE.'),
      makeSkillPlayer('p12w_x', 'X', 120, 380, 'Split End Left', 'Stalk boundary corner.'),
      makeSkillPlayer('p12w_z', 'Z', 860, 395, 'Flanker Right', 'Clearout route on field side.')
    ]
  },
  {
    id: 'formation-under-center-12-wing-bunch',
    name: 'Under Center 12 Wing Bunch',
    side: 'offense',
    personnel: '12',
    qbPosition: 'down_center',
    receiverAlignment: '3x1',
    style: 'pro_style',
    isBunch: true,
    tags: ['12', 'down_center', '3x1', 'pro_style', 'bunch', 'wing_bunch'],
    labels: ['12 Pers', 'Under Center', 'Pro Style', 'Bunch'],
    description: 'Under-center 12 personnel condensed bunch with dual TEs and Z flanker tightly aligned, setting up Duo/Power runs with max-protect play-action deep shots.',
    players: [
      ...createStandardOL('u12wb'),
      makeSkillPlayer('u12wb_y', 'Y', 660, 380, 'Inline Tight End', 'Point of bunch on LOS; drive block or release on seam.'),
      makeSkillPlayer('u12wb_u', 'U', 690, 415, 'Wing TE', 'Kick out edge or leak to flat on play-action boot.'),
      makeSkillPlayer('u12wb_z', 'Z', 730, 395, 'Flanker WR', 'Corner / post route off play fake.'),
      makeSkillPlayer('u12wb_qb', 'QB', 480, 415, 'Under Center QB', 'Reverse pivot; heavy run fake to tailback into deep shot.'),
      makeSkillPlayer('u12wb_tb', 'TB', 480, 500, 'Singleback Tailback', 'Downhill Duo track into C-gap.'),
      makeSkillPlayer('u12wb_x', 'X', 120, 380, 'Backside Split End', 'Deep 1-on-1 post.')
    ]
  },

  // ==========================================
  // 11 PERSONNEL (1 RB, 1 TE, 3 WRs)
  // ==========================================
  {
    id: 'formation-shotgun-11-snug-bunch',
    name: 'Gun 11 Snug Bunch',
    side: 'offense',
    personnel: '11',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['11', 'shotgun', '3x1', 'spread', 'bunch', 'snug_bunch'],
    labels: ['11 Pers', 'Shotgun', 'Spread', 'Snug Bunch'],
    description: 'Condensed bunch clustered within 2 yards of the right tackle box. Forces secondary into tight spacing and creates perimeter edge seal on crack sweeps.',
    players: [
      ...createStandardOL('g11sb'),
      makeSkillPlayer('g11sb_y', 'Y', 650, 380, 'Snug Point (TE)', 'Point of bunch on LOS; seal DE or vertical seam.'),
      makeSkillPlayer('g11sb_h', 'H', 675, 410, 'Snug Slot (H)', 'Off LOS; quick arrow flat screen or mesh crosser.'),
      makeSkillPlayer('g11sb_z', 'Z', 710, 395, 'Snug Flanker (Z)', 'Off LOS; snag / pivot or wheel over the top.'),
      makeSkillPlayer('g11sb_qb', 'QB', 480, 465, 'Shotgun QB', 'Quick release to bunch flat or hand off inside zone.'),
      makeSkillPlayer('g11sb_rb', 'RB', 420, 465, 'Sidecar Back', 'Inside zone track away from bunch.'),
      makeSkillPlayer('g11sb_x', 'X', 120, 380, 'Solo Backside WR', 'Isolated boundary post.')
    ]
  },
  {
    id: 'formation-pistol-11-bunch',
    name: 'Pistol 11 Bunch',
    side: 'offense',
    personnel: '11',
    qbPosition: 'pistol',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['11', 'pistol', '3x1', 'spread', 'bunch'],
    labels: ['11 Pers', 'Pistol', 'Spread', 'Bunch'],
    description: 'Pistol 11 personnel combining the downhill north-south running track of a deep tailback with a 3-man bunch triangle for bubble/arrow RPOs.',
    players: [
      ...createStandardOL('p11b'),
      makeSkillPlayer('p11b_y', 'Y', 680, 380, 'Bunch Point', 'Point on LOS; vertical release.'),
      makeSkillPlayer('p11b_h', 'H', 660, 410, 'Bunch Inside Wing', 'Arrow screen or mesh crosser.'),
      makeSkillPlayer('p11b_z', 'Z', 720, 410, 'Bunch Outside Wing', 'Corner route or crack block.'),
      makeSkillPlayer('p11b_qb', 'QB', 480, 440, 'Pistol Operator', 'Mesh read with tailback or fire bunch arrow RPO.'),
      makeSkillPlayer('p11b_tb', 'TB', 480, 520, 'Pistol Tailback', 'Downhill inside zone track.'),
      makeSkillPlayer('p11b_x', 'X', 120, 380, 'Solo Backside WR', 'Backside glance / fade.')
    ]
  },
  {
    id: 'formation-under-center-11-condensed-bunch',
    name: 'Under Center 11 Condensed Bunch',
    side: 'offense',
    personnel: '11',
    qbPosition: 'down_center',
    receiverAlignment: '3x1',
    style: 'pro_style',
    isBunch: true,
    tags: ['11', 'down_center', '3x1', 'pro_style', 'bunch', 'condensed'],
    labels: ['11 Pers', 'Under Center', 'Pro Style', 'Bunch'],
    description: 'Modern NFL under-center 11 personnel (Shanahan / McVay) with condensed 3-man bunch setting up outside zone stretch and naked bootleg leak.',
    players: [
      ...createStandardOL('u11cb'),
      makeSkillPlayer('u11cb_y', 'Y', 660, 380, 'Bunch Point TE', 'On LOS; block DE or run deep corner.'),
      makeSkillPlayer('u11cb_h', 'H', 685, 410, 'Bunch Inside WR', 'Cross-field drag / leak route.'),
      makeSkillPlayer('u11cb_z', 'Z', 725, 395, 'Bunch Flanker WR', 'Intermediate dig route behind linebackers.'),
      makeSkillPlayer('u11cb_qb', 'QB', 480, 415, 'Under Center Pivot', 'Reverse pivot; outside zone fake into bootleg pass.'),
      makeSkillPlayer('u11cb_tb', 'TB', 480, 500, 'Singleback Tailback', 'Outside zone stretch track to the edge.'),
      makeSkillPlayer('u11cb_x', 'X', 120, 380, 'Backside Solo WR', '1-on-1 backside glance.')
    ]
  },
  {
    id: 'formation-under-center-11-slot',
    name: 'Under Center 11 Slot',
    side: 'offense',
    personnel: '11',
    qbPosition: 'down_center',
    receiverAlignment: '2x1',
    style: 'pro_style',
    isBunch: false,
    tags: ['11', 'down_center', '2x1', 'pro_style', 'wide_zone'],
    labels: ['11 Pers', 'Under Center', 'Pro Style', 'Wide Zone'],
    description: 'Pro-style under-center 11 personnel base formation with inline TE and slot/flanker combination right. Standard foundation for outside zone and play-action.',
    players: [
      ...createStandardOL('u11s'),
      makeSkillPlayer('u11s_y', 'Y', 660, 380, 'Inline Tight End', 'Reach block defensive end on outside zone.'),
      makeSkillPlayer('u11s_h', 'H', 750, 395, 'Slot Receiver Right', 'Crack safety or deep over route.'),
      makeSkillPlayer('u11s_z', 'Z', 860, 380, 'Flanker Right', 'Clearout route on field side.'),
      makeSkillPlayer('u11s_qb', 'QB', 480, 415, 'Under Center QB', 'Reverse pivot; handoff outside zone or execute bootleg.'),
      makeSkillPlayer('u11s_tb', 'TB', 480, 500, 'Singleback Tailback', 'Aiming point outside leg of tight end on wide zone track.'),
      makeSkillPlayer('u11s_x', 'X', 120, 380, 'Split End Left', 'Backside dig / post.')
    ]
  },
  {
    id: 'formation-pistol-11-doubles',
    name: 'Pistol 11 Doubles (2x2)',
    side: 'offense',
    personnel: '11',
    qbPosition: 'pistol',
    receiverAlignment: '2x2',
    style: 'spread',
    isBunch: false,
    tags: ['11', 'pistol', '2x2', 'spread', 'doubles'],
    labels: ['11 Pers', 'Pistol', 'Spread', '2x2 Doubles'],
    description: 'Balanced 2x2 spread with pistol quarterback and downhill tailback, providing equal horizontal spacing across the field with inside zone read capability.',
    players: [
      ...createStandardOL('p11d'),
      makeSkillPlayer('p11d_y', 'Y', 660, 380, 'Inline Tight End', 'Drive block DE or release on seam.'),
      makeSkillPlayer('p11d_z', 'Z', 860, 380, 'Field Flanker', 'Vertical post / fade.'),
      makeSkillPlayer('p11d_h', 'H', 230, 395, 'Slot Receiver Left', 'Quick bubble / slant.'),
      makeSkillPlayer('p11d_x', 'X', 120, 380, 'Split End Left', 'Boundary hitch / glance.'),
      makeSkillPlayer('p11d_qb', 'QB', 480, 440, 'Pistol QB', 'Read backside DE on zone read or throw quick 2x2 concept.'),
      makeSkillPlayer('p11d_tb', 'TB', 480, 520, 'Pistol Tailback', 'Downhill inside zone track.')
    ]
  },

  // ==========================================
  // 10 PERSONNEL (1 RB, 0 TE, 4 WRs)
  // ==========================================
  {
    id: 'formation-shotgun-10-doubles',
    name: 'Gun 10 Doubles (4-Wide)',
    side: 'offense',
    personnel: '10',
    qbPosition: 'shotgun',
    receiverAlignment: '2x2',
    style: 'spread',
    isBunch: false,
    tags: ['10', 'shotgun', '2x2', 'spread', 'air_raid', '4_wide'],
    labels: ['10 Pers', 'Shotgun', 'Spread', 'Air Raid'],
    description: 'True Air Raid 10 personnel spread with 2 wide receivers balanced to each side and zero tight ends, opening the interior box to 5-6 defenders for draw/zone runs.',
    players: [
      ...createStandardOL('g10d'),
      makeSkillPlayer('g10d_x', 'X', 120, 380, 'Split End Left', 'Boundary vertical / hitch.'),
      makeSkillPlayer('g10d_h', 'H', 230, 395, 'Slot Receiver Left', 'Quick bubble / arrow screen.'),
      makeSkillPlayer('g10d_y', 'Y', 730, 395, 'Slot Receiver Right', 'Cross-field mesh drag or stick route.'),
      makeSkillPlayer('g10d_z', 'Z', 860, 380, 'Flanker Right', 'Field vertical clearout.'),
      makeSkillPlayer('g10d_qb', 'QB', 480, 465, 'Shotgun QB', 'Read safety high-low or hand off inside zone against light box.'),
      makeSkillPlayer('g10d_rb', 'RB', 535, 465, 'Sidecar Back', 'Inside zone track or draw play.')
    ]
  },
  {
    id: 'formation-shotgun-10-trips-open',
    name: 'Gun 10 Trips Open',
    side: 'offense',
    personnel: '10',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: false,
    tags: ['10', 'shotgun', '3x1', 'spread', 'trips_open', 'air_raid'],
    labels: ['10 Pers', 'Shotgun', 'Spread', 'Trips Open'],
    description: 'Air Raid 10 personnel with 3 detached wide receivers to the field side and a solo isolated receiver on the boundary. Four verticals and flood concepts.',
    players: [
      ...createStandardOL('g10to'),
      makeSkillPlayer('g10to_x', 'X', 120, 380, 'Backside Solo WR', '1-on-1 backside choice / glance.'),
      makeSkillPlayer('g10to_h', 'H', 670, 395, 'Inside Trips Slot', 'Bender seam route.'),
      makeSkillPlayer('g10to_y', 'Y', 750, 395, 'Middle Trips Slot', '10-yard out / pivot.'),
      makeSkillPlayer('g10to_z', 'Z', 860, 380, 'Outside Trips WR', 'Vertical post / clearout.'),
      makeSkillPlayer('g10to_qb', 'QB', 480, 465, 'Shotgun QB', '3-step drop; flood trips coverage or fire backside choice.'),
      makeSkillPlayer('g10to_rb', 'RB', 420, 465, 'Sidecar Back', 'Check-release flat or pick up blitz.')
    ]
  },
  {
    id: 'formation-shotgun-10-bunch-open',
    name: 'Gun 10 Bunch Open',
    side: 'offense',
    personnel: '10',
    qbPosition: 'shotgun',
    receiverAlignment: '3x1',
    style: 'spread',
    isBunch: true,
    tags: ['10', 'shotgun', '3x1', 'spread', 'bunch', 'open_bunch'],
    labels: ['10 Pers', 'Shotgun', 'Spread', 'Bunch Open'],
    description: '3 wide receivers in a wide bunch cluster with no tight end on the field. Creates maximum speed on rub releases and perimeter screen blocking.',
    players: [
      ...createStandardOL('g10bo'),
      makeSkillPlayer('g10bo_x', 'X', 120, 380, 'Backside Solo WR', '1-on-1 backside glance.'),
      makeSkillPlayer('g10bo_h', 'H', 680, 380, 'Bunch Point WR', 'Point on LOS; vertical clearout.'),
      makeSkillPlayer('g10bo_y', 'Y', 660, 410, 'Bunch Inside Wing', 'Quick arrow flat screen.'),
      makeSkillPlayer('g10bo_z', 'Z', 720, 410, 'Bunch Outside Wing', 'Corner route over the top.'),
      makeSkillPlayer('g10bo_qb', 'QB', 480, 465, 'Shotgun QB', 'Trigger bunch spacing or handoff inside zone.'),
      makeSkillPlayer('g10bo_rb', 'RB', 420, 465, 'Sidecar Back', 'Inside zone track away from bunch.')
    ]
  },
  {
    id: 'formation-shotgun-10-quads-bunch',
    name: 'Gun 10 Quads Bunch',
    side: 'offense',
    personnel: '10',
    qbPosition: 'shotgun',
    receiverAlignment: '4x0',
    style: 'spread',
    isBunch: true,
    tags: ['10', 'shotgun', '4x0', 'spread', 'quads', 'bunch'],
    labels: ['10 Pers', 'Shotgun', 'Spread', 'Quads Bunch'],
    description: 'Extreme perimeter overload with 3 receivers in a bunch and a 4th receiver split wide outside the pod, completely overwhelming zone coverage rules.',
    players: [
      ...createStandardOL('g10qb'),
      makeSkillPlayer('g10qb_h', 'H', 670, 380, 'Bunch Point WR', 'Point on LOS; vertical clearout.'),
      { ...makeSkillPlayer('g10qb_y', 'Y', 650, 410, 'Bunch Inside Wing', 'Arrow screen underneath.'), position: 'WR' },
      makeSkillPlayer('g10qb_z', 'Z', 705, 410, 'Bunch Outside Wing', 'Wheel route.'),
      makeSkillPlayer('g10qb_w', 'W', 860, 380, 'Quads Boundary WR', 'Clearout streak / comeback.'),
      makeSkillPlayer('g10qb_qb', 'QB', 480, 465, 'Shotgun QB', 'Overload pass read against tilted secondary.'),
      makeSkillPlayer('g10qb_rb', 'RB', 420, 465, 'Sidecar Back', 'Check-release weak flat.')
    ]
  },

  // ==========================================
  // 01 & 00 PERSONNEL (EMPTY SETS - 0 RBs)
  // ==========================================
  {
    id: 'formation-empty-01-bunch',
    name: 'Gun Empty 01 Bunch (3x2)',
    side: 'offense',
    personnel: '01',
    qbPosition: 'shotgun',
    receiverAlignment: '3x2',
    style: 'spread',
    isBunch: true,
    tags: ['01', 'shotgun', '3x2', 'spread', 'empty', 'bunch'],
    labels: ['01 Pers', 'Shotgun', 'Spread', 'Empty Bunch'],
    description: 'Empty 5-receiver set with 1 TE and 2 WRs in a bunch cluster right, and 2 spread receivers left. Spacing, mesh, and stick route packages.',
    players: [
      ...createStandardOL('ge01b'),
      makeSkillPlayer('ge01b_y', 'Y', 680, 380, 'Bunch Point (TE)', 'Point on LOS; seam / corner route.'),
      makeSkillPlayer('ge01b_h', 'H', 660, 410, 'Bunch Inside Wing', 'Arrow screen underneath.'),
      makeSkillPlayer('ge01b_z', 'Z', 720, 410, 'Bunch Outside Wing', 'Snag / sit route in zone hole.'),
      makeSkillPlayer('ge01b_w', 'W', 230, 395, 'Slot Left', 'Quick slant / bubble.'),
      makeSkillPlayer('ge01b_x', 'X', 120, 380, 'Split End Left', 'Hitch / fade.'),
      makeSkillPlayer('ge01b_qb', 'QB', 480, 465, 'Shotgun Empty QB', 'Quick 1-step or 3-step distribution; locate mismatch.')
    ]
  },
  {
    id: 'formation-empty-00-5wide',
    name: 'Gun Empty 00 (5-Wide)',
    side: 'offense',
    personnel: '00',
    qbPosition: 'shotgun',
    receiverAlignment: '3x2',
    style: 'spread',
    isBunch: false,
    tags: ['00', 'shotgun', '3x2', 'spread', 'empty', '5_wide'],
    labels: ['00 Pers', 'Shotgun', 'Spread', '5-Wide Empty'],
    description: 'Pure 5-wide receiver empty spread formation. Maximum horizontal stretch across the defense for quick-game slants, bubbles, and stick concepts.',
    players: [
      ...createStandardOL('ge00'),
      makeSkillPlayer('ge00_x', 'X', 110, 380, 'Split End Left', 'Boundary quick hitch / slant.'),
      makeSkillPlayer('ge00_w', 'W', 230, 395, 'Slot Left', 'Quick bubble / out.'),
      makeSkillPlayer('ge00_y', 'Y', 670, 395, 'Inside Slot Right', 'Stick route at 5 yards.'),
      makeSkillPlayer('ge00_h', 'H', 760, 395, 'Outside Slot Right', 'Corner / seam route.'),
      makeSkillPlayer('ge00_z', 'Z', 880, 380, 'Flanker Right', 'Field vertical / comeback.'),
      makeSkillPlayer('ge00_qb', 'QB', 480, 465, 'Shotgun Empty QB', 'Fast rhythm passer; get ball out in 1.8 to 2.2 seconds.')
    ]
  },
  {
    id: 'formation-empty-00-double-bunch',
    name: 'Gun Empty 00 Double Bunch',
    side: 'offense',
    personnel: '00',
    qbPosition: 'shotgun',
    receiverAlignment: '3x2',
    style: 'spread',
    isBunch: true,
    tags: ['00', 'shotgun', '3x2', 'spread', 'empty', 'double_bunch'],
    labels: ['00 Pers', 'Shotgun', 'Spread', 'Double Bunch'],
    description: 'Pure 5-wide with 3 receivers clustered in bunch right and 2 receivers in a tight stack/bunch left, creating double rub-route releases across the field.',
    players: [
      ...createStandardOL('ge00db'),
      makeSkillPlayer('ge00db_x', 'X', 160, 380, 'Left Bunch Point', 'Point on LOS; vertical release.'),
      makeSkillPlayer('ge00db_w', 'W', 195, 410, 'Left Bunch Wing', 'Quick flat / slant underneath.'),
      makeSkillPlayer('ge00db_h', 'H', 680, 380, 'Right Bunch Point', 'Point on LOS; deep corner route.'),
      makeSkillPlayer('ge00db_y', 'Y', 660, 410, 'Right Inside Wing', 'Arrow screen / drag.'),
      makeSkillPlayer('ge00db_z', 'Z', 720, 410, 'Right Outside Wing', 'Wheel route.'),
      makeSkillPlayer('ge00db_qb', 'QB', 480, 465, 'Shotgun Empty QB', 'Dual rub-route reader; attack isolated safety.')
    ]
  }
];
