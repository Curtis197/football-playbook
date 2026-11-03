import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Player, PathAction, CanvasMode, Point, AppMode, Theme, Formation, Play, RouteAdaptationMode } from '../types/playbook';
import type { SnapAlignment } from '../utils/formationBackfield';
import { generatePathString, getSvgCoordinates, clampFieldCoordinates, getDistance, insertPointIntoAction } from '../utils/geometry';
import { isLightColor } from '../utils/colors';
import { Shield, ChevronLeft, ChevronRight, RotateCcw, Save } from 'lucide-react';
import { analyzeOffense, calculateDefensiveAlignmentPosition } from '../utils/defensiveAlignment';
import { translateActionPoints } from '../utils/routeAdaptation';

interface ChalkboardCanvasProps {
  players: Player[];
  actions: PathAction[];
  mode: CanvasMode;
  appMode?: AppMode;
  theme?: Theme;
  showGaps?: boolean;
  onToggleShowGaps?: () => void;
  onOpenDefenseModal?: () => void;
  onShiftDefense?: (direction: 'left' | 'right' | 'over' | 'under' | 'pinch' | 'fan') => void;
  onRealignDefense?: () => void;
  formations?: Formation[];
  activeOffenseFormation?: string;
  activeDefenseFront?: string;
  allPlays?: Play[];
  activePlayId?: string;
  onSelectPlay?: (playId: string) => void;
  onSelectOffenseFormation?: (formationId: string) => void;
  onSelectDefenseFront?: (formationId: string) => void;
  currentQBAlignment?: SnapAlignment;
  onMorphBackfield?: (alignment: SnapAlignment) => void;
  routeAdaptationMode?: RouteAdaptationMode;
  onToggleRouteAdaptationMode?: () => void;
  onSetRouteAdaptationMode?: (mode: RouteAdaptationMode) => void;
  onUpdateOffenseFormation?: () => void;
  onUpdateDefenseFront?: () => void;
  selectedPlayerId: string | null;
  selectedActionId: string | null;
  onSelectPlayer: (id: string | null) => void;
  onSelectAction: (id: string | null) => void;
  onUpdatePlayerPosition: (id: string, x: number, y: number) => void;
  onAddAction: (action: PathAction) => void;
  onUpdateActionPoints: (actionId: string, points: Point[]) => void;
  onAddPlayerAtPoint: (x: number, y: number, side: 'offense' | 'defense') => void;
  onSwitchToBuildMode?: () => void;
  onSetMode?: (mode: CanvasMode) => void;
  restartBlockRequest?: { actionId: string; playerId: string; startPoint: Point } | null;
  onClearRestartBlockRequest?: () => void;
}

export const ChalkboardCanvas: React.FC<ChalkboardCanvasProps> = ({
  players,
  actions,
  mode,
  appMode = 'build',
  theme = 'dark',
  showGaps = true,
  onToggleShowGaps,
  onOpenDefenseModal,
  onShiftDefense,
  onRealignDefense,
  formations = [],
  activeOffenseFormation,
  activeDefenseFront,
  allPlays,
  activePlayId,
  onSelectPlay,
  onSelectOffenseFormation,
  onSelectDefenseFront,
  currentQBAlignment = 'shotgun',
  onMorphBackfield,
  routeAdaptationMode = 'player_relative',
  onToggleRouteAdaptationMode,
  onSetRouteAdaptationMode: _onSetRouteAdaptationMode,
  onUpdateOffenseFormation,
  onUpdateDefenseFront,
  selectedPlayerId,
  selectedActionId,
  onSelectPlayer,
  onSelectAction,
  onUpdatePlayerPosition,
  onAddAction,
  onUpdateActionPoints,
  onAddPlayerAtPoint,
  onSwitchToBuildMode,
  onSetMode,
  restartBlockRequest,
  onClearRestartBlockRequest
}) => {
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Dynamic analysis of offensive positions to derive LOS, gaps, and formation strength
  const offenseStructure = analyzeOffense(players);

  // Split formations into offensive and defensive groups
  const offensiveFormations = formations.filter(f => f.side === 'offense' || f.side === 'both');
  const defensiveFormations = formations.filter(f => f.side === 'defense' || f.side === 'both');

  // Match active selection by id or name
  const activeOffenseId = formations.find(
    f => (f.side === 'offense' || f.side === 'both') && (
      f.id === activeOffenseFormation ||
      f.name.toLowerCase() === activeOffenseFormation?.toLowerCase() ||
      (activeOffenseFormation && f.name.toLowerCase().includes(activeOffenseFormation.toLowerCase())) ||
      (activeOffenseFormation && activeOffenseFormation.toLowerCase().includes(f.name.toLowerCase()))
    )
  )?.id || '';

  const activeDefenseId = formations.find(
    f => (f.side === 'defense' || f.side === 'both') && (
      f.id === activeDefenseFront ||
      f.name.toLowerCase() === activeDefenseFront?.toLowerCase() ||
      (activeDefenseFront && f.name.toLowerCase().includes(activeDefenseFront.toLowerCase())) ||
      (activeDefenseFront && activeDefenseFront.toLowerCase().includes(f.name.toLowerCase()))
    )
  )?.id || '';

  // Group offensive formations by style (Pro Style, Spread, Old School)
  const proStyleFormations = offensiveFormations.filter(f => f.style === 'pro_style');
  const spreadFormations = offensiveFormations.filter(f => f.style === 'spread');
  const oldSchoolFormations = offensiveFormations.filter(f => f.style === 'old_school');
  const otherOffenseFormations = offensiveFormations.filter(
    f => !f.style || !['pro_style', 'spread', 'old_school'].includes(f.style)
  );

  // Group defensive fronts by style (Even Fronts, Odd Fronts, Heavy / Bear)
  const evenFronts = defensiveFormations.filter(f => f.style === 'even_front');
  const oddFronts = defensiveFormations.filter(f => f.style === 'odd_front');
  const heavyFronts = defensiveFormations.filter(f => f.style === 'heavy_front');
  const otherDefenseFronts = defensiveFormations.filter(
    f => !f.style || !['even_front', 'odd_front', 'heavy_front'].includes(f.style)
  );

  // Filter plays belonging to active offensive formation for hierarchical game-planning
  const playsForFormation = (allPlays || []).filter(p => {
    if (!activeOffenseFormation && !activeOffenseId) return false;
    const matchName = activeOffenseFormation && p.formationOffense?.toLowerCase() === activeOffenseFormation.toLowerCase();
    const activeObj = formations.find(f => f.id === activeOffenseId);
    const matchObjName = activeObj && p.formationOffense?.toLowerCase() === activeObj.name.toLowerCase();
    const partialMatch = activeOffenseFormation && (
      p.formationOffense?.toLowerCase().includes(activeOffenseFormation.toLowerCase()) ||
      activeOffenseFormation.toLowerCase().includes(p.formationOffense?.toLowerCase() || '')
    );
    return Boolean(matchName || matchObjName || partialMatch);
  });

  const otherPlays = (allPlays || []).filter(p => !playsForFormation.some(pf => pf.id === p.id));
  const passingPlays = otherPlays.filter(p => p.primaryPassConcept || p.category === 'pass_dropback');
  const runOptionPlays = otherPlays.filter(p => (p.category === 'run' || p.primaryRunConcept) && !p.primaryPassConcept);
  const rpoPaPlays = otherPlays.filter(p => (p.category === 'rpo' || p.category === 'pass_action' || p.category === 'screen') && !p.primaryPassConcept);
  const remainingPlays = otherPlays.filter(p => 
    !passingPlays.some(pp => pp.id === p.id) &&
    !runOptionPlays.some(rp => rp.id === p.id) &&
    !rpoPaPlays.some(pa => pa.id === p.id)
  );

  // Dragging state
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Waypoint dragging state
  const [draggingWaypoint, setDraggingWaypoint] = useState<{ actionId: string; pointIndex: number } | null>(null);

  // Drawing state (for Draw Route / Draw Block / Draw Motion / Restart Block)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [drawingPlayerId, setDrawingPlayerId] = useState<string | null>(null);
  const [drawingParentActionId, setDrawingParentActionId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);

  // Hover state for Thought Partner tooltip (Active only in View Mode)
  const [hoveredPlayerId, setHoveredPlayerId] = useState<string | null>(null);
  const [canvasHoveredPlayerId, setCanvasHoveredPlayerId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Handle external restart block request (e.g. from Inspector or on-canvas combo trigger)
  useEffect(() => {
    if (restartBlockRequest) {
      // oxlint-disable-next-line react/set-state-in-effect
      setDrawingPlayerId(restartBlockRequest.playerId);
      setDrawingParentActionId(restartBlockRequest.actionId);
      setDrawingPoints([restartBlockRequest.startPoint]);
      onClearRestartBlockRequest?.();
    }
  }, [restartBlockRequest, onClearRestartBlockRequest]);

  const activeHoveredPlayer = appMode === 'view' 
    ? players.find(p => p.id === (hoveredPlayerId || selectedPlayerId))
    : null;

  // Handle pointer down on player
  const handlePlayerPointerDown = (e: React.PointerEvent, player: Player) => {
    e.stopPropagation();
    if (appMode === 'view') {
      onSelectPlayer(player.id);
      onSelectAction(null);
      setTooltipPos({ x: player.x, y: player.y });
      return;
    }

    if (mode === 'select') {
      onSelectPlayer(player.id);
      onSelectAction(null);
      if (svgRef.current) {
        const svgCoords = getSvgCoordinates(e, svgRef.current);
        setDraggingPlayerId(player.id);
        setDragOffset({
          x: svgCoords.x - player.x,
          y: svgCoords.y - player.y
        });
      }
    } else if (mode === 'draw_route' || mode === 'draw_block' || mode === 'draw_motion') {
      // Start drawing from this player
      setDrawingPlayerId(player.id);
      setDrawingPoints([{ x: player.x, y: player.y, isSharp: false }]);
      onSelectPlayer(player.id);
    }
  };

  // Complete drawing an action
  const finishDrawing = useCallback((pointsToSave: Point[]) => {
    if (!drawingPlayerId || pointsToSave.length < 2) {
      setDrawingPoints([]);
      setDrawingPlayerId(null);
      return;
    }

    let actionType: PathAction['type'] = 'pass_route';
    let endMarker: PathAction['endMarker'] = 'arrow';
    let isCurved = true;

    if (mode === 'draw_block') {
      actionType = 'run_block';
      endMarker = 'tbar';
      isCurved = true; // Catmull-Rom spline with sharp cut break support for decomposed block vectors
    } else if (mode === 'draw_motion') {
      actionType = 'motion';
      endMarker = 'arrow';
      isCurved = true;
    } else {
      actionType = 'pass_route';
      endMarker = 'arrow';
      isCurved = true; // Catmull-Rom spline with sharp cut preservation
    }

    const newAction: PathAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      playerId: drawingPlayerId,
      type: actionType,
      points: pointsToSave,
      isCurved,
      endMarker,
      label: drawingParentActionId
        ? 'Combo Block'
        : (actionType === 'pass_route' ? 'Route' : actionType === 'run_block' ? 'Block' : 'Motion'),
      parentActionId: drawingParentActionId || undefined,
      branchType: drawingParentActionId ? 'combo' : undefined
    };

    onAddAction(newAction);
    setDrawingPoints([]);
    setDrawingPlayerId(null);
    setDrawingParentActionId(null);
  }, [drawingPlayerId, drawingParentActionId, mode, onAddAction]);

  // Handle SVG background click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!svgRef.current) return;

    if (appMode === 'view') {
      onSelectPlayer(null);
      onSelectAction(null);
      return;
    }

    const pt = getSvgCoordinates(e, svgRef.current);

    if (mode === 'add_offense') {
      onAddPlayerAtPoint(pt.x, pt.y, 'offense');
      return;
    }
    if (mode === 'add_defense') {
      onAddPlayerAtPoint(pt.x, pt.y, 'defense');
      return;
    }

    if (drawingPlayerId && (mode === 'draw_route' || mode === 'draw_block' || mode === 'draw_motion')) {
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      // Minimum distance threshold (prevent overlapping duplicate points)
      if (lastPoint && getDistance(lastPoint, pt) < 10) return;

      // Shift + Click creates a sharp cut break (dig, out, post angle break, pull-block kickout)
      const isSharp = e.shiftKey;
      const newPt: Point = { ...pt, isSharp };
      const newPts = [...drawingPoints, newPt];

      // Allow block vectors to be multi-point decomposed just like routes
      setDrawingPoints(newPts);
      return;
    }

    // Otherwise deselect if clicked empty field
    if (mode === 'select') {
      onSelectPlayer(null);
      onSelectAction(null);
    }
  };

  // Double click finishes route drawing
  const handleDoubleClick = () => {
    if (appMode === 'view') return;
    if (drawingPoints.length >= 2) {
      finishDrawing(drawingPoints);
    }
  };

  // Pointer move across SVG canvas
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    const pt = getSvgCoordinates(e, svgRef.current);
    setCursorPos(pt);

    if (appMode === 'view') return;

    if (draggingPlayerId) {
      const newX = pt.x - dragOffset.x;
      const newY = pt.y - dragOffset.y;
      const clamped = clampFieldCoordinates({ x: newX, y: newY });
      const currentPlayer = players.find(p => p.id === draggingPlayerId);
      const dx = clamped.x - (currentPlayer?.x ?? clamped.x);
      const dy = clamped.y - (currentPlayer?.y ?? clamped.y);

      onUpdatePlayerPosition(draggingPlayerId, clamped.x, clamped.y);

      // Dynamically translate all points in any actions that belong to this player so the route moves relative to the player
      if (dx !== 0 || dy !== 0) {
        const playerActions = actions.filter(a => a.playerId === draggingPlayerId);
        playerActions.forEach(act => {
          if (act.points.length > 0) {
            const updatedPoints = translateActionPoints(act.points, dx, dy);
            onUpdateActionPoints(act.id, updatedPoints);
          }
        });
      }
    } else if (draggingWaypoint) {
      const act = actions.find(a => a.id === draggingWaypoint.actionId);
      if (act) {
        const updatedPoints = [...act.points];
        updatedPoints[draggingWaypoint.pointIndex] = {
          ...updatedPoints[draggingWaypoint.pointIndex],
          x: pt.x,
          y: pt.y
        };
        onUpdateActionPoints(act.id, updatedPoints);
      }
    }
  };

  // Pointer up clears drag states
  const handlePointerUp = () => {
    setDraggingPlayerId(null);
    setDraggingWaypoint(null);
  };

  // Cancel drawing on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawingPoints([]);
        setDrawingPlayerId(null);
        setDrawingParentActionId(null);
      } else if (e.key === 'Enter' && drawingPoints.length >= 2) {
        finishDrawing(drawingPoints);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingPoints, finishDrawing]);

  // Determine line styling
  const getActionStroke = (action: PathAction, isSelected: boolean) => {
    if (isSelected && action.color) return action.color;
    if (isSelected) return isLight ? '#0284c7' : '#38bdf8';
    if (action.color) return action.color;
    switch (action.type) {
      case 'pass_route':
        return isLight ? '#0284c7' : '#38bdf8'; // Sky blue / Deep blue
      case 'run_block':
        return isLight ? '#d97706' : '#f59e0b'; // Amber
      case 'pull_block':
        return isLight ? '#db2777' : '#ec4899'; // Pink / violet
      case 'motion':
        return isLight ? '#9333ea' : '#c084fc'; // Purple
      default:
        return isLight ? '#0284c7' : '#38bdf8';
    }
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center ${isLight ? 'bg-slate-200/90' : 'bg-[#10141a]'} p-2 select-none overflow-hidden transition-colors`}>
      {/* Field container with blackboard / whiteboard border */}
      <div className={`relative w-full max-w-[1100px] aspect-[1000/700] rounded-xl shadow-2xl border-4 ${isLight ? 'border-slate-300 bg-white' : 'border-[#2b3544] bg-[#161c24]'} overflow-hidden transition-colors`}>
        <svg
          ref={svgRef}
          viewBox="0 0 1000 700"
          className={`w-full h-full ${isLight ? 'chalkboard-bg-light' : 'chalkboard-bg'} cursor-crosshair touch-none transition-colors`}
          onPointerDown={(e) => {
            if (e.target === svgRef.current) {
              handleCanvasClick(e);
            }
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <defs>
            {/* Standard Pass Route Arrowhead */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isLight ? "#0284c7" : "#38bdf8"} />
            </marker>

            {/* Run Block T-Bar */}
            <marker
              id="tbar"
              viewBox="0 0 10 14"
              refX="5"
              refY="7"
              markerWidth="7"
              markerHeight="10"
              orient="auto"
            >
              <line x1="5" y1="0.5" x2="5" y2="13.5" stroke={isLight ? "#d97706" : "#f59e0b"} strokeWidth="3" strokeLinecap="round" />
            </marker>

            {/* Pull Block Pink T-Bar */}
            <marker
              id="pull-tbar"
              viewBox="0 0 10 14"
              refX="5"
              refY="7"
              markerWidth="7"
              markerHeight="10"
              orient="auto"
            >
              <line x1="5" y1="0.5" x2="5" y2="13.5" stroke={isLight ? "#db2777" : "#ec4899"} strokeWidth="3" strokeLinecap="round" />
            </marker>

            {/* Motion Purple Arrow */}
            <marker
              id="motion-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill={isLight ? "#9333ea" : "#c084fc"} />
            </marker>

            {/* Dot marker */}
            <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
              <circle cx="5" cy="5" r="3.5" fill={isLight ? "#0284c7" : "#38bdf8"} />
            </marker>

            {/* Dynamic per-action markers for custom colors */}
            {actions.map(act => {
              const isSelected = selectedActionId === act.id;
              const isPlayerHoveredInView = appMode === 'view' && hoveredPlayerId === act.playerId;
              const strokeColor = getActionStroke(act, isSelected || isPlayerHoveredInView);
              return (
                <React.Fragment key={`defs-markers-${act.id}`}>
                  <marker
                    id={`arrow-${act.id}`}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill={strokeColor} />
                  </marker>
                  <marker
                    id={`tbar-${act.id}`}
                    viewBox="0 0 10 14"
                    refX="5"
                    refY="7"
                    markerWidth="7"
                    markerHeight="10"
                    orient="auto"
                  >
                    <line x1="5" y1="0.5" x2="5" y2="13.5" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
                  </marker>
                  <marker id={`dot-${act.id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                    <circle cx="5" cy="5" r="3.5" fill={strokeColor} />
                  </marker>
                </React.Fragment>
              );
            })}

            {/* Player Glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>
            <filter id="defense-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f43f5e" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* FIELD GRID & MARKINGS */}
          <g className="field-grid pointer-events-none opacity-40">
            {/* Yard lines: horizontal every 50 units (representing 5 yards) */}
            {[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650].map(y => (
              <g key={`yardline-${y}`}>
                <line
                  x1="30"
                  y1={y}
                  x2="970"
                  y2={y}
                  stroke={y % 100 === 0 
                    ? (isLight ? "rgba(15, 23, 42, 0.28)" : "rgba(255, 255, 255, 0.25)") 
                    : (isLight ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.1)")}
                  strokeWidth={y % 100 === 0 ? "1.5" : "0.75"}
                />
                {/* Yard numbers along sidelines */}
                {y % 100 === 0 && (
                  <>
                    <text x="50" y={y + 4} fill={isLight ? "#475569" : "#64748b"} fontSize="11" fontFamily="monospace" textAnchor="middle">
                      {Math.abs(50 - Math.round((y - 100) / 10))}
                    </text>
                    <text x="950" y={y + 4} fill={isLight ? "#475569" : "#64748b"} fontSize="11" fontFamily="monospace" textAnchor="middle">
                      {Math.abs(50 - Math.round((y - 100) / 10))}
                    </text>
                  </>
                )}
              </g>
            ))}

            {/* College & Pro Hash Marks */}
            {[100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600].map(y => (
              <g key={`hash-${y}`}>
                {/* Left Hash */}
                <line x1="420" y1={y - 5} x2="420" y2={y + 5} stroke={isLight ? "rgba(15, 23, 42, 0.22)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" />
                {/* Right Hash */}
                <line x1="580" y1={y - 5} x2="580" y2={y + 5} stroke={isLight ? "rgba(15, 23, 42, 0.22)" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" />
              </g>
            ))}
          </g>

          {/* LINE OF SCRIMMAGE (LOS) at Y = 380 */}
          <g className="los-group pointer-events-none">
            <line
              x1="30"
              y1="380"
              x2="970"
              y2="380"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.85"
            />
            {/* First Down line at Y = 330 */}
            <line
              x1="30"
              y1="330"
              x2="970"
              y2="330"
              stroke="#eab308"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.65"
            />
            <rect x="35" y="368" width="56" height="16" rx="4" fill="#0e7490" opacity="0.9" />
            <text x="63" y="380" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              L.O.S.
            </text>
            <rect x="35" y="322" width="62" height="16" rx="4" fill="#854d0e" opacity="0.9" />
            <text x="66" y="334" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              1ST DOWN
            </text>
          </g>

          {/* OFFENSIVE GAPS & ALIGNMENT MARKERS (A, B, C, D Gaps) */}
          {showGaps && (
            <g className="gaps-layer pointer-events-none transition-opacity duration-300">
              {offenseStructure.gaps.map(gap => (
                <g key={gap.id} className="gap-marker">
                  <line
                    x1={gap.x}
                    y1={offenseStructure.losY - 14}
                    x2={gap.x}
                    y2={offenseStructure.losY + 14}
                    stroke={gap.isStrong ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <rect
                    x={gap.x - 9}
                    y={offenseStructure.losY - 8}
                    width="18"
                    height="16"
                    rx="3"
                    fill={gap.isStrong ? (isLight ? '#fef3c7' : '#78350f') : (isLight ? '#e0f2fe' : '#0c4a6e')}
                    stroke={gap.isStrong ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x={gap.x}
                    y={offenseStructure.losY + 4}
                    fill={gap.isStrong ? (isLight ? '#92400e' : '#fde68a') : (isLight ? '#0369a1' : '#bae6fd')}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {gap.label}
                  </text>
                </g>
              ))}

              {/* 0-Tech Head-up Center dot */}
              <circle
                cx={offenseStructure.center.x}
                cy={offenseStructure.losY}
                r="3.5"
                fill="#f59e0b"
                opacity="0.85"
              />

              {/* Strength direction indicator */}
              <g className="strength-indicator">
                <rect
                  x={offenseStructure.strength === 'right' ? Math.min(880, offenseStructure.center.x + 195) : Math.max(90, offenseStructure.center.x - 250)}
                  y={offenseStructure.losY - 8}
                  width="54"
                  height="16"
                  rx="4"
                  fill={isLight ? '#fef3c7' : '#451a03'}
                  stroke="#f59e0b"
                  strokeWidth="1"
                  opacity="0.9"
                />
                <text
                  x={(offenseStructure.strength === 'right' ? Math.min(880, offenseStructure.center.x + 195) : Math.max(90, offenseStructure.center.x - 250)) + 27}
                  y={offenseStructure.losY + 4}
                  fill={isLight ? '#b45309' : '#fcd34d'}
                  fontSize="8"
                  fontWeight="black"
                  letterSpacing="0.5"
                  textAnchor="middle"
                >
                  {offenseStructure.strength === 'right' ? 'STRONG ➜' : '⬅ STRONG'}
                </text>
              </g>
            </g>
          )}

          {/* SELECTED DEFENDER ALIGNMENT GUIDELINE TO GAP */}
          {(() => {
            const selectedDef = players.find(p => p.id === selectedPlayerId && p.side === 'defense');
            if (!selectedDef || !selectedDef.technique) return null;
            const targetPos = calculateDefensiveAlignmentPosition(selectedDef.technique, offenseStructure);
            return (
              <g className="alignment-guideline pointer-events-none">
                <line
                  x1={selectedDef.x}
                  y1={selectedDef.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.75"
                />
                <circle cx={targetPos.x} cy={targetPos.y} r="3" fill="#f59e0b" opacity="0.9" />
              </g>
            );
          })()}

          {/* RENDER PATH ACTIONS (Routes, Blocks, Motion) */}
          <g className="actions-layer">
            {actions.map(act => {
              const isSelected = selectedActionId === act.id;
              const isPlayerHoveredInView = appMode === 'view' && hoveredPlayerId === act.playerId;
              const pathPlayer = players.find(p => p.id === act.playerId);
              const isAttachedToNoNodePlayer = !act.parentActionId && pathPlayer && (pathPlayer.shape || 'none') === 'none';
              const startOffset = isAttachedToNoNodePlayer ? 18 : 0;
              const pathD = generatePathString(act.points, act.isCurved ?? false, startOffset);
              const strokeColor = getActionStroke(act, isSelected || isPlayerHoveredInView);

              let markerEnd = 'none';
              if (act.endMarker === 'arrow') {
                markerEnd = `url(#arrow-${act.id})`;
              } else if (act.endMarker === 'tbar') {
                markerEnd = `url(#tbar-${act.id})`;
              } else if (act.endMarker === 'dot') {
                markerEnd = `url(#dot-${act.id})`;
              }

              // Compute mid-label location
              const midPt = act.points.length >= 2 
                ? act.points[Math.floor(act.points.length / 2)] 
                : null;

              return (
                <g key={act.id} className="cursor-pointer group">
                  {/* Thick transparent hit area for easy click selection, waypoint decomposition, and block restarting */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                    className={mode === 'draw_block' && (act.type === 'run_block' || act.type === 'pull_block') ? "cursor-copy" : isSelected ? "cursor-copy" : "cursor-pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (mode === 'draw_block' && (act.type === 'run_block' || act.type === 'pull_block')) {
                        // Restart a new continuation / combo block from this block!
                        if (svgRef.current && appMode === 'build') {
                          const clickPt = getSvgCoordinates(e, svgRef.current);
                          setDrawingPlayerId(act.playerId);
                          setDrawingParentActionId(act.id);
                          setDrawingPoints([{ x: Math.round(clickPt.x), y: Math.round(clickPt.y), isSharp: false }]);
                          onSelectAction(act.id);
                          return;
                        }
                      }

                      if (!isSelected) {
                        onSelectAction(act.id);
                        onSelectPlayer(null);
                      } else if (svgRef.current && appMode === 'build') {
                        // Interactive decomposition: insert new waypoint along this segment
                        const clickPt = getSvgCoordinates(e, svgRef.current);
                        const updated = insertPointIntoAction(act.points, clickPt);
                        onUpdateActionPoints(act.id, updated);
                      }
                    }}
                  >
                    <title>
                      {mode === 'draw_block' && (act.type === 'run_block' || act.type === 'pull_block')
                        ? 'Click anywhere on this block to Restart a Combo / Option Block'
                        : isSelected 
                        ? `${act.label || 'Vector'}: Click on line to insert/decompose waypoint` 
                        : `Click to select ${act.label || 'vector'}`}
                    </title>
                  </path>
                  {/* Actual visible vector line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelected || isPlayerHoveredInView ? "5" : "3"}
                    strokeDasharray={act.type === 'motion' ? "7 5" : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={markerEnd}
                    filter={isPlayerHoveredInView ? "url(#glow)" : undefined}
                    className="transition-all duration-150 group-hover:brightness-125 pointer-events-none"
                  />

                  {/* Combo Junction Marker for restarted blocks */}
                  {act.parentActionId && (
                    <g transform={`translate(${act.points[0].x}, ${act.points[0].y})`} className="pointer-events-none">
                      <circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.5))" />
                      <circle r="2.5" fill="#ffffff" />
                    </g>
                  )}

                  {/* Waypoint cues / labels */}
                  {act.label && midPt && (
                    <g transform={`translate(${midPt.x}, ${midPt.y - 10})`}>
                      <rect
                        x="-45"
                        y="-12"
                        width="90"
                        height="16"
                        rx="3"
                        fill={isLight ? "#ffffff" : "#0f172a"}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="0"
                        fill={isLight ? "#0f172a" : "#e2e8f0"}
                        fontSize="9"
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                      >
                        {act.label}
                      </text>
                    </g>
                  )}

                  {/* Waypoint handles if selected */}
                  {isSelected && act.points.map((pt, idx) => {
                    const isStart = idx === 0;
                    const isSharpCut = Boolean(pt.isSharp);

                    return (
                      <g key={`handle-${act.id}-${idx}`}>
                        {isSharpCut ? (
                          // Sharp Cut: Diamond handle
                          <rect
                            x={pt.x - 6}
                            y={pt.y - 6}
                            width="12"
                            height="12"
                            transform={`rotate(45, ${pt.x}, ${pt.y})`}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="cursor-move hover:scale-125 transition-transform"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDraggingWaypoint({ actionId: act.id, pointIndex: idx });
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = [...act.points];
                              updated[idx] = { ...pt, isSharp: false };
                              onUpdateActionPoints(act.id, updated);
                            }}
                          >
                            <title>{`Point ${idx + 1}: Sharp Cut Break (Click to toggle smooth)`}</title>
                          </rect>
                        ) : (
                          // Smooth Arc: Circle handle
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isStart ? "5" : "7"}
                            fill={isStart ? "#64748b" : "#38bdf8"}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="cursor-move hover:scale-125 transition-transform"
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              setDraggingWaypoint({ actionId: act.id, pointIndex: idx });
                            }}
                            onClick={(e) => {
                              if (isStart) return;
                              e.stopPropagation();
                              const updated = [...act.points];
                              updated[idx] = { ...pt, isSharp: true };
                              onUpdateActionPoints(act.id, updated);
                            }}
                          >
                            <title>{isStart ? "Route Origin" : `Point ${idx + 1}: Smooth Arc (Click to toggle sharp cut)`}</title>
                          </circle>
                        )}

                        {/* Label indicating Sharp Cut on canvas */}
                        {isSharpCut && (
                          <text
                            x={pt.x}
                            y={pt.y - 11}
                            fill="#f59e0b"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            className="pointer-events-none select-none font-mono"
                          >
                            CUT
                          </text>
                        )}

                        {/* On-canvas +COMBO trigger at the terminal waypoint of a block */}
                        {isSelected && (act.type === 'run_block' || act.type === 'pull_block') && idx === act.points.length - 1 && (
                          <g 
                            transform={`translate(${pt.x + 12}, ${pt.y - 10})`}
                            className="cursor-pointer group/combo"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetMode?.('draw_block');
                              setDrawingPlayerId(act.playerId);
                              setDrawingParentActionId(act.id);
                              setDrawingPoints([{ x: pt.x, y: pt.y, isSharp: false }]);
                            }}
                          >
                            <rect
                              x="0"
                              y="0"
                              width="58"
                              height="20"
                              rx="10"
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                              className="group-hover/combo:fill-amber-400 transition-colors"
                            />
                            <text
                              x="29"
                              y="13"
                              fill="#0f172a"
                              fontSize="9"
                              fontWeight="900"
                              textAnchor="middle"
                              className="select-none font-mono"
                            >
                              +COMBO
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* LIVE DRAWING PREVIEW (Catmull-Rom with Sharp Cut Support for Routes, Blocks & Motion) */}
            {drawingPlayerId && drawingPoints.length > 0 && cursorPos && (() => {
              const drawingPlayer = players.find(p => p.id === drawingPlayerId);
              const isNoNodeStart = !drawingParentActionId && drawingPlayer && (drawingPlayer.shape || 'none') === 'none';
              const previewOffset = isNoNodeStart ? 18 : 0;
              const previewPoints = [...drawingPoints, { ...cursorPos, isSharp: false }];
              const previewPathD = generatePathString(previewPoints, true, previewOffset);
              const isBlock = mode === 'draw_block' || Boolean(drawingParentActionId);

              return (
                <g className="drawing-preview pointer-events-none">
                  <path
                    d={previewPathD}
                    fill="none"
                    stroke={isBlock ? '#f59e0b' : mode === 'draw_motion' ? '#c084fc' : '#38bdf8'}
                    strokeWidth="3"
                    strokeDasharray={mode === 'draw_motion' ? "6 4" : "4 4"}
                    markerEnd={isBlock ? 'url(#tbar)' : 'url(#arrow)'}
                  />
                  {drawingPoints.map((pt, i) => (
                    pt.isSharp ? (
                      <rect
                        key={`draft-pt-${i}`}
                        x={pt.x - 5}
                        y={pt.y - 5}
                        width="10"
                        height="10"
                        transform={`rotate(45, ${pt.x}, ${pt.y})`}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    ) : (
                      <circle 
                        key={`draft-pt-${i}`} 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="5" 
                        fill={isBlock ? '#f59e0b' : mode === 'draw_motion' ? '#c084fc' : '#38bdf8'} 
                      />
                    )
                  ))}
                </g>
              );
            })()}
          </g>

          {/* RENDER PLAYERS (Round, Square, or Rounded Square) */}
          <g className="players-layer">
            {players.map(player => {
              const isSelected = selectedPlayerId === player.id;
              const isHovered = (appMode === 'view' && hoveredPlayerId === player.id) || canvasHoveredPlayerId === player.id;
              const isOffense = player.side === 'offense';
              const isView = appMode === 'view';
              const shape = player.shape || 'none';

              // 3 Color parameters: letterColor, nodeColor, fillColor + optional hoverColor
              // Default player setting: no node shape ('none') and black 0/0/0 for both offense and defense
              const defaultColor = '#000000';
              const effectiveNodeColor = player.nodeColor || player.color || defaultColor;
              const effectiveFillColor = shape === 'none'
                ? 'transparent'
                : (player.fillColor !== undefined ? player.fillColor : (player.color || defaultColor));
              const effectiveLetterColor = player.letterColor || (shape === 'none'
                ? defaultColor
                : (effectiveFillColor === 'transparent'
                  ? defaultColor
                  : (isLightColor(effectiveFillColor) ? '#000000' : '#ffffff')));

              const strokeColor = (isHovered && player.hoverColor)
                ? player.hoverColor
                : (isSelected
                  ? (isLight ? '#0284c7' : '#38bdf8')
                  : effectiveNodeColor);

              const fillColor = effectiveFillColor;

              const haloStroke = (isHovered && player.hoverColor)
                ? player.hoverColor
                : (isSelected ? (isLight ? '#0284c7' : '#38bdf8') : effectiveNodeColor);

              const textFill = effectiveLetterColor;

              const glowFilter = isSelected
                ? (isOffense ? "url(#glow)" : "url(#defense-glow)")
                : undefined;

              return (
                <g
                  key={player.id}
                  transform={`translate(${player.x}, ${player.y})`}
                  className={isView ? "cursor-pointer transition-transform duration-75" : "cursor-grab active:cursor-grabbing transition-transform duration-75"}
                  onPointerDown={(e) => handlePlayerPointerDown(e, player)}
                  onPointerEnter={() => {
                    setCanvasHoveredPlayerId(player.id);
                    if (isView) {
                      setHoveredPlayerId(player.id);
                      setTooltipPos({ x: player.x, y: player.y });
                    }
                  }}
                  onPointerLeave={() => {
                    setCanvasHoveredPlayerId(null);
                    if (isView) {
                      setHoveredPlayerId(null);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlayer(player.id);
                    onSelectAction(null);
                  }}
                >
                  <g filter={glowFilter}>
                    {/* Selection Halo */}
                    {isSelected && (
                      shape === 'round' ? (
                        <circle
                          cx="0"
                          cy="0"
                          r="22"
                          fill="none"
                          stroke={haloStroke}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin"
                          style={{ animationDuration: '6s' }}
                        />
                      ) : shape === 'square' ? (
                        <rect
                          x="-18"
                          y="-18"
                          width="36"
                          height="36"
                          rx="0"
                          fill="none"
                          stroke={haloStroke}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      ) : shape === 'rounded_square' ? (
                        <rect
                          x="-18"
                          y="-18"
                          width="36"
                          height="36"
                          rx="8"
                          fill="none"
                          stroke={haloStroke}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                        />
                      ) : (
                        <rect
                          x="-18"
                          y="-15"
                          width="36"
                          height="30"
                          rx="5"
                          fill="none"
                          stroke={haloStroke}
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      )
                    )}

                    {/* Main Node Body (Round, Square, Rounded Square, or Bare Text) */}
                    {shape === 'round' ? (
                      <circle
                        cx="0"
                        cy="0"
                        r={isHovered ? "18" : "16"}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? "3" : "2.2"}
                        className="transition-all"
                      />
                    ) : shape === 'square' ? (
                      <rect
                        x={isHovered ? "-15" : "-14"}
                        y={isHovered ? "-15" : "-14"}
                        width={isHovered ? "30" : "28"}
                        height={isHovered ? "30" : "28"}
                        rx="0"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? "3" : "2.2"}
                        className="transition-all"
                      />
                    ) : shape === 'rounded_square' ? (
                      <rect
                        x={isHovered ? "-15" : "-14"}
                        y={isHovered ? "-15" : "-14"}
                        width={isHovered ? "30" : "28"}
                        height={isHovered ? "30" : "28"}
                        rx="6"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isHovered ? "3" : "2.2"}
                        className="transition-all"
                      />
                    ) : (
                      // Bare Text ('none') with subtle clearance buffer so field hash and intersecting lines don't strike through text
                      <>
                        <circle
                          cx="0"
                          cy="0"
                          r="15"
                          fill={isLight ? "#ffffff" : "#1a1f26"}
                          opacity="0.92"
                          className="pointer-events-none"
                        />
                        <rect
                          x="-14"
                          y="-14"
                          width="28"
                          height="28"
                          rx="4"
                          fill="transparent"
                          stroke={isHovered ? strokeColor : "transparent"}
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          className="transition-all"
                        />
                      </>
                    )}

                    {/* Player Label */}
                    <text
                      x="0"
                      y="1"
                      fill={textFill}
                      stroke={!isLight && textFill === '#000000' && shape === 'none' ? 'rgba(255, 255, 255, 0.45)' : undefined}
                      strokeWidth={!isLight && textFill === '#000000' && shape === 'none' ? '0.75' : undefined}
                      style={{ paintOrder: 'stroke fill' }}
                      fontSize={shape === 'none' ? (player.label.length > 2 ? "12" : "14") : (player.label.length > 2 ? "10" : "11")}
                      fontWeight={shape === 'none' ? "900" : "bold"}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      pointerEvents="none"
                    >
                      {player.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* TOP HUD: OFFENSE & DEFENSE FORMATION PICKERS + DEFENSE SHIFT & GAPS */}
        <div className={`absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 ${
          isLight ? 'bg-white/95 border-slate-300' : 'bg-slate-900/90 border-slate-700/80'
        } backdrop-blur-md px-3 py-1.5 rounded-lg border shadow-lg text-xs pointer-events-auto`}>
          {/* LEFT: FORMATION PICKERS */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* OFFENSE FORMATION PICKER */}
            <div className="flex items-center gap-1.5">
              <span className="text-base select-none" role="img" aria-label="football">🏈</span>
              <label htmlFor="offense-formation-select" className={`text-[11px] font-bold ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Offense:
              </label>
              <select
                id="offense-formation-select"
                value={activeOffenseId}
                onChange={(e) => onSelectOffenseFormation?.(e.target.value)}
                className={`text-[11px] font-medium rounded px-2 py-1 border transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-amber-500 max-w-[210px] truncate ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                }`}
                title="Select offensive formation template"
              >
                {!activeOffenseId && <option value="" disabled>Select Offense Formation...</option>}
                {proStyleFormations.length > 0 && (
                  <optgroup label="Pro Style (Under Center & Heavy)">
                    {proStyleFormations.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {spreadFormations.length > 0 && (
                  <optgroup label="Spread (10 & 11 Personnel)">
                    {spreadFormations.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {oldSchoolFormations.length > 0 && (
                  <optgroup label="Old School (Option & Multi-Back)">
                    {oldSchoolFormations.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherOffenseFormations.length > 0 && (
                  <optgroup label="Other Formations">
                    {otherOffenseFormations.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {onUpdateOffenseFormation && activeOffenseId && (
                <button
                  type="button"
                  onClick={onUpdateOffenseFormation}
                  className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isLight
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  }`}
                  title={`Update "${activeOffenseFormation}" with current chalkboard offensive positions`}
                >
                  <Save className="w-3 h-3 text-amber-500" />
                  <span>Update</span>
                </button>
              )}

              {/* DYNAMIC BACKFIELD MORPH TOGGLE (Center / Gun / Pistol) */}
              {onMorphBackfield && (
                <div 
                  className={`flex items-center rounded-lg p-0.5 border text-[10px] shadow-sm ${
                    isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#090d14] border-[#2a313f]'
                  }`}
                  title="Morph backfield alignment between Under Center, Pistol, and Shotgun while preserving perimeter receiver distribution"
                >
                  <button
                    type="button"
                    onClick={() => onMorphBackfield('down_center')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentQBAlignment === 'down_center'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Under Center (QB direct snap at 1 yard, RB downhill at 6-7 yards)"
                  >
                    <span>🏈</span>
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMorphBackfield('pistol')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentQBAlignment === 'pistol'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Pistol (QB at 3.5 yards, RB stacked directly behind at 7 yards)"
                  >
                    <span>🎯</span>
                    <span>Pistol</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMorphBackfield('shotgun')}
                    className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentQBAlignment === 'shotgun'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Shotgun (QB at 5-6 yards, RB offset sidecar)"
                  >
                    <span>⚡</span>
                    <span>Gun</span>
                  </button>
                </div>
              )}

              {/* ROUTE ADAPTATION MODE TOGGLE */}
              {onToggleRouteAdaptationMode && (
                <button
                  type="button"
                  onClick={onToggleRouteAdaptationMode}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm ${
                    routeAdaptationMode === 'concept_numbered'
                      ? isLight
                        ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300'
                        : 'bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border-purple-500/50'
                      : isLight
                        ? 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300'
                        : 'bg-sky-900/50 hover:bg-sky-800/60 text-sky-200 border-sky-500/50'
                  }`}
                  title={`Route adaptation when changing offensive formation:\n• Player-Relative: Translates full vector (stem, breaks, cuts) relative to each player\n• Concept (#1/#2/#3): Maps routes to #1, #2, #3 receivers from outside in\n\nClick to toggle (Currently: ${
                    routeAdaptationMode === 'concept_numbered' ? '#1/#2/#3 Concept Outside' : 'Relative to Player'
                  })`}
                >
                  {routeAdaptationMode === 'concept_numbered' ? (
                    <>
                      <span className="font-mono text-purple-400 font-extrabold text-[11px]">#123</span>
                      <span>Concept</span>
                    </>
                  ) : (
                    <>
                      <span>🎯</span>
                      <span>Player-Rel</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* PLAY / CONCEPT PICKER (Hierarchical flow: Formation ➔ Play ➔ Defense) */}
            {allPlays && onSelectPlay && (
              <>
                <div className={`h-4 w-[1px] ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs select-none" role="img" aria-label="play">📋</span>
                  <label htmlFor="play-concept-select" className={`text-[11px] font-bold ${
                    isLight ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    Play:
                  </label>
                  <select
                    id="play-concept-select"
                    value={activePlayId || ''}
                    onChange={(e) => onSelectPlay(e.target.value)}
                    className={`text-[11px] font-medium rounded px-2 py-1 border transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-sky-500 max-w-[210px] truncate ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                    }`}
                    title="Select play / concept belonging to this formation or test across playbook"
                  >
                    {playsForFormation.length > 0 && (
                      <optgroup label={`Plays for this Formation (${playsForFormation.length})`}>
                        {playsForFormation.map(p => (
                          <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                            🏈 {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {passingPlays.length > 0 && (
                      <optgroup label={`Passing Concepts (${passingPlays.length})`}>
                        {passingPlays.map(p => (
                          <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                            🎯 {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {runOptionPlays.length > 0 && (
                      <optgroup label={`Run & Option Schemes (${runOptionPlays.length})`}>
                        {runOptionPlays.map(p => (
                          <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                            🏃 {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {rpoPaPlays.length > 0 && (
                      <optgroup label={`RPO & Play-Action (${rpoPaPlays.length})`}>
                        {rpoPaPlays.map(p => (
                          <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                            ⚡ {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {remainingPlays.length > 0 && (
                      <optgroup label={`Other Playbook Plays (${remainingPlays.length})`}>
                        {remainingPlays.map(p => (
                          <option key={p.id} value={p.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </>
            )}

            <div className={`h-4 w-[1px] ${isLight ? 'bg-slate-300' : 'bg-slate-700'}`} />

            {/* DEFENSE FRONT PICKER */}
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <label htmlFor="defense-front-select" className={`text-[11px] font-bold ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                Defense:
              </label>
              <select
                id="defense-front-select"
                value={activeDefenseId}
                onChange={(e) => onSelectDefenseFront?.(e.target.value)}
                className={`text-[11px] font-medium rounded px-2 py-1 border transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-rose-500 max-w-[210px] truncate ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                }`}
                title="Select defensive front (pre-aligns automatically to offensive gaps)"
              >
                {!activeDefenseId && <option value="" disabled>Select Defensive Front...</option>}
                {evenFronts.length > 0 && (
                  <optgroup label="Even Fronts (4-Down Linemen)">
                    {evenFronts.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {oddFronts.length > 0 && (
                  <optgroup label="Odd Fronts (3-Down Linemen)">
                    {oddFronts.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {heavyFronts.length > 0 && (
                  <optgroup label="Heavy / Bear Fronts">
                    {heavyFronts.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherDefenseFronts.length > 0 && (
                  <optgroup label="Other Fronts">
                    {otherDefenseFronts.map(f => (
                      <option key={f.id} value={f.id} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-slate-100'}>
                        {f.name} {f.personnel ? `(${f.personnel})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {onUpdateDefenseFront && activeDefenseId && (
                <button
                  type="button"
                  onClick={onUpdateDefenseFront}
                  className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
                    isLight
                      ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-300'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                  }`}
                  title={`Update "${activeDefenseFront}" with current chalkboard defensive positions & techniques`}
                >
                  <Save className="w-3 h-3 text-rose-500" />
                  <span>Update</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: GAPS TOGGLE + SHIFT CONTROLS + MODAL TRIGGER */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {onToggleShowGaps && (
              <button
                type="button"
                onClick={onToggleShowGaps}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  showGaps 
                    ? isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/25 text-amber-300 border border-amber-500/50' 
                    : isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
                title="Toggle offensive gap markers (A, B, C, D) on the line of scrimmage"
              >
                <span>Gaps</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-black ${
                  showGaps ? 'bg-amber-500 text-slate-950' : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-700 text-slate-300'
                }`}>
                  {showGaps ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {onShiftDefense && (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onShiftDefense('left')}
                  className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Shift front 1 gap left"
                >
                  <ChevronLeft className="w-3 h-3 inline" /> Left
                </button>
                <button
                  type="button"
                  onClick={() => onShiftDefense('right')}
                  className={`px-1.5 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Shift front 1 gap right"
                >
                  Right <ChevronRight className="w-3 h-3 inline" />
                </button>
                <button
                  type="button"
                  onClick={() => onShiftDefense('over')}
                  className="px-1.5 py-1 rounded text-[10px] font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all cursor-pointer"
                  title="Set front to Over (Strongside 3-tech)"
                >
                  Over
                </button>
                <button
                  type="button"
                  onClick={() => onShiftDefense('under')}
                  className="px-1.5 py-1 rounded text-[10px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all cursor-pointer"
                  title="Set front to Under (Weakside 3-tech)"
                >
                  Under
                </button>
              </div>
            )}

            {onRealignDefense && (
              <button
                type="button"
                onClick={onRealignDefense}
                className={`p-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                  isLight ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
                title="Re-align all defenders to current offensive positions"
              >
                <RotateCcw className="w-3 h-3 text-amber-500" />
              </button>
            )}

            {onOpenDefenseModal && (
              <button
                type="button"
                onClick={onOpenDefenseModal}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  isLight ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300' : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                } border flex items-center gap-1 transition-all active:scale-95 cursor-pointer`}
                title="Open detailed Defensive Fronts modal with techniques & assignments"
              >
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Fronts Modal</span>
              </button>
            )}
          </div>
        </div>

        {/* THOUGHT PARTNER INTERACTIVE HOVER OVERLAY - ONLY SHOWN IN VIEW MODE (Spec 2.2) */}
        {appMode === 'view' && activeHoveredPlayer && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(tooltipPos.x / 1000) * 100}%`,
              top: `${(tooltipPos.y / 700) * 100}%`
            }}
          >
            <div className="bg-[#0f172a]/95 backdrop-blur-md border border-[#38bdf8]/50 text-slate-100 rounded-lg p-3 shadow-2xl min-w-[240px] max-w-[300px] pointer-events-auto">
              <div className="flex items-center gap-2 mb-1.5">
                {(() => {
                  const activeShape = activeHoveredPlayer.shape || 'none';
                  const activeNodeColor = activeHoveredPlayer.nodeColor || activeHoveredPlayer.color || '#000000';
                  const activeFillColor = activeShape === 'none'
                    ? 'transparent'
                    : (activeHoveredPlayer.fillColor !== undefined ? activeHoveredPlayer.fillColor : (activeHoveredPlayer.color || '#000000'));
                  const activeLetterColor = activeHoveredPlayer.letterColor || (activeShape === 'none'
                    ? '#000000'
                    : (activeFillColor === 'transparent' ? '#ffffff' : (isLightColor(activeFillColor) ? '#000000' : '#ffffff')));

                  return (
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold ${
                        activeShape === 'round'
                          ? 'rounded-full'
                          : activeShape === 'rounded_square'
                          ? 'rounded'
                          : activeShape === 'square'
                          ? 'rounded-none'
                          : 'rounded border border-dashed'
                      }`}
                      style={{
                        backgroundColor: activeFillColor,
                        borderColor: activeHoveredPlayer.hoverColor || activeNodeColor,
                        borderWidth: '2px',
                        borderStyle: activeShape === 'none' ? 'dashed' : 'solid',
                        color: activeLetterColor
                      }}
                    >
                      {activeHoveredPlayer.label}
                    </span>
                  );
                })()}
                <span className="font-semibold text-xs tracking-wider uppercase text-sky-400">
                  {activeHoveredPlayer.assignmentTitle || 'Unassigned'}
                </span>
                {activeHoveredPlayer.technique && (
                  <span className="ml-auto text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                    {activeHoveredPlayer.technique}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                {activeHoveredPlayer.assignmentNotes || 'No specific assignment notes.'}
              </p>
              {activeHoveredPlayer.coachingKeys && activeHoveredPlayer.coachingKeys.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-700/60">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block mb-0.5">
                    Coaching Cue:
                  </span>
                  <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                    {activeHoveredPlayer.coachingKeys.map((key, kIdx) => (
                      <li key={kIdx} className="leading-tight">{key}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Small tooltip pointer arrow */}
            <div className="w-3 h-3 bg-[#0f172a] border-r border-b border-[#38bdf8]/50 transform rotate-45 mx-auto -mt-1.5"></div>
          </div>
        )}

        {/* BOTTOM CANVAS STATUS BAR */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-700/50 pointer-events-none">
          <div className="flex items-center gap-3">
            {appMode === 'view' ? (
              <>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  VIEW MODE
                </span>
                <span className="text-slate-300 text-xs">
                  Hover over players to inspect assignments & coaching keys.
                </span>
                {onSwitchToBuildMode && (
                  <button
                    onClick={onSwitchToBuildMode}
                    className="pointer-events-auto px-2.5 py-0.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition-all shadow-sm cursor-pointer ml-1"
                  >
                    🛠️ Switch to Build Mode
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/90 border border-sky-500/40 text-sky-300 font-bold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  BUILD MODE
                </span>
                <span>
                  Tool: <strong className="text-sky-300 capitalize">{mode.replace('_', ' ')}</strong>
                </span>
                {drawingPlayerId ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-2">
                    <span>Click: <strong className="text-sky-300">Add Waypoint</strong></span>
                    <span>•</span>
                    <span>Shift+Click: <strong className="text-amber-300">Sharp Break / Cut</strong></span>
                    <span>•</span>
                    <span>Double-Click/Enter: <strong>Finish</strong></span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    Click vector to select • Click selected vector line to insert/decompose waypoints
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> Pass Route
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block"></span> Run Block
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rotate-45 bg-amber-500 inline-block"></span> Sharp Cut
            </span>
            {cursorPos && (
              <span className="font-mono text-[11px] text-slate-500 ml-2">
                X:{Math.round(cursorPos.x)} Y:{Math.round(cursorPos.y)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
