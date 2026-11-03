/**
 * @typedef {Object} RoutePoint
 * @property {number} x
 * @property {number} y
 * @property {boolean} [isSharp] - True if this waypoint represents a hard directional cut
 */

/**
 * Calculates distance between two points
 */
export function getDistance(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Converts a sequence of points into an SVG path string.
 * Supports smooth Catmull-Rom interpolation and sharp break angles.
 * 
 * Formula:
 * C1 = P1 + (P2 - P0) / (6 * tension)
 * C2 = P2 - (P3 - P1) / (6 * tension)
 * 
 * @param {RoutePoint[]} points - Array of path waypoints
 * @param {number} [tension=0.5] - Curve tension (0.5 = centripetal, smooth without self-intersection)
 * @returns {string} SVG Path 'd' attribute string
 */
export function generateRoutePath(points, tension = 0.5) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // If either point is designated as a sharp break, draw a straight line
    if (p1.isSharp || p2.isSharp) {
      d += ` L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      continue;
    }

    // Determine neighbor points for Catmull-Rom clamping
    const p0 = i > 0 ? points[i - 1] : p1;
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    // Cubic control points
    const cp1x = p1.x + (p2.x - p0.x) / (6 * tension);
    const cp1y = p1.y + (p2.y - p0.y) / (6 * tension);

    const cp2x = p2.x - (p3.x - p1.x) / (6 * tension);
    const cp2y = p2.y - (p3.y - p1.y) / (6 * tension);

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}
