import type { Point } from '../types/playbook';

/**
 * Generate an SVG path data string from an array of Points
 * Supports both straight segmented polylines and smooth quadratic/cubic Bezier curves
 */
export function generatePathString(points: Point[], isCurved: boolean = false): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  if (!isCurved) {
    // Straight segmented lines: M x0 y0 L x1 y1 L x2 y2 ...
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }

  // Curved routing
  if (points.length === 2) {
    // Curve between two points: generate an intelligent intermediate control point
    const p0 = points[0];
    const p1 = points[1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    // Perpendicular offset based on curve direction
    const cx = p0.x + dx * 0.5 - dy * 0.15;
    const cy = p0.y + dy * 0.5 + dx * 0.15;
    return `M ${p0.x} ${p0.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${p1.x} ${p1.y}`;
  }

  if (points.length === 3) {
    // Quadratic Bezier: P0 -> start, P1 -> control point, P2 -> endpoint
    const p0 = points[0];
    const p1 = points[1];
    const p2 = points[2];
    return `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
  }

  // Multi-point smooth spline (Cubic Bezier through midpoints)
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const pCurr = points[i];
    const pNext = points[i + 1];
    const mx = (pCurr.x + pNext.x) / 2;
    const my = (pCurr.y + pNext.y) / 2;

    if (i === 0) {
      d += ` Q ${pCurr.x} ${pCurr.y} ${mx} ${my}`;
    } else {
      d += ` Q ${pCurr.x} ${pCurr.y} ${mx} ${my}`;
    }
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/**
 * Calculates Euclidean distance between two points
 */
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Clamps coordinates to valid field space (0-1000 width, 0-700 height)
 */
export function clampFieldCoordinates(p: Point): Point {
  return {
    x: Math.max(20, Math.min(980, Math.round(p.x))),
    y: Math.max(20, Math.min(680, Math.round(p.y)))
  };
}

/**
 * Converts screen/client pointer event coordinates into SVG normalized viewBox (0-1000 x 700)
 */
export function getSvgCoordinates(e: React.MouseEvent | React.PointerEvent, svgElement: SVGSVGElement): Point {
  const rect = svgElement.getBoundingClientRect();
  const scaleX = 1000 / rect.width;
  const scaleY = 700 / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  return clampFieldCoordinates({ x, y });
}
