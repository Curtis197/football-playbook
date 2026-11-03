import type { Point } from '../types/playbook';
import { generateRoutePath, getDistance } from './bezier-math';

export { generateRoutePath, getDistance };

/**
 * Generate an SVG path data string from an array of Points
 * Supports both straight segmented polylines and smooth Catmull-Rom/cubic Bezier curves with sharp breaks
 */
export function generatePathString(points: Point[], isCurved: boolean = false): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  if (!isCurved) {
    // Straight segmented lines: M x0 y0 L x1 y1 L x2 y2 ...
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');
  }

  // Smooth Catmull-Rom cubic Bezier with sharp break support
  return generateRoutePath(points, 0.5);
}

/**
 * Clamps coordinates to valid field space (0-1000 width, 0-700 height)
 */
export function clampFieldCoordinates(p: Point): Point {
  return {
    ...p,
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
