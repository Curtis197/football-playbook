import { generateRoutePath, getDistance } from './bezier-math.js';

export class RouteDrawer {
  /**
   * @param {SVGSVGElement} svgElement - Root SVG canvas element
   * @param {Object} options
   * @param {Function} options.onComplete - Callback when a route completes
   */
  constructor(svgElement, options = {}) {
    this.svg = svgElement;
    this.onComplete = options.onComplete || (() => {});
    
    this.isDrawing = false;
    this.waypoints = []; // [{x, y, isSharp}]
    this.activePlayerId = null;

    // Container for active preview path
    this.previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.previewPath.setAttribute('class', 'route-preview-path');
    this.previewPath.setAttribute('fill', 'none');
    this.previewPath.setAttribute('stroke', '#38bdf8');
    this.previewPath.setAttribute('stroke-width', '3');
    this.previewPath.setAttribute('stroke-dasharray', '6 4');
    this.previewPath.setAttribute('marker-end', 'url(#arrow)');
    
    // Bind handlers
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Transforms screen MouseEvent client coordinates into SVG viewBox coordinate space
   */
  getSvgCoordinates(event) {
    const pt = this.svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return { x: event.clientX, y: event.clientY };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }

  /**
   * Start drawing a route from an origin player coordinate
   */
  startRoute(playerId, originPoint) {
    this.isDrawing = true;
    this.activePlayerId = playerId;
    this.waypoints = [{ x: originPoint.x, y: originPoint.y, isSharp: false }];
    
    this.svg.appendChild(this.previewPath);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handlePointerDown(event) {
    if (!this.isDrawing) return;

    // Prevent handling if double click fires
    if (event.detail > 1) return;

    const coords = this.getSvgCoordinates(event);
    const lastPoint = this.waypoints[this.waypoints.length - 1];

    // Minimum distance threshold (prevent overlapping duplicate points)
    if (lastPoint && getDistance(lastPoint, coords) < 10) return;

    // Shift + Click creates a sharp cut (in, out, dig, post angle break)
    const isSharp = event.shiftKey;

    this.waypoints.push({
      x: coords.x,
      y: coords.y,
      isSharp
    });

    this.updatePreview(coords);
  }

  handlePointerMove(event) {
    if (!this.isDrawing) return;
    const currentCoord = this.getSvgCoordinates(event);
    this.updatePreview(currentCoord);
  }

  updatePreview(pointerCoord) {
    // Clone current waypoints and append live mouse pointer position
    const transientPoints = [
      ...this.waypoints,
      { x: pointerCoord.x, y: pointerCoord.y, isSharp: false }
    ];

    const d = generateRoutePath(transientPoints, 0.5);
    this.previewPath.setAttribute('d', d);
  }

  finishRoute() {
    if (!this.isDrawing) return;

    if (this.waypoints.length >= 2) {
      const finalPathString = generateRoutePath(this.waypoints, 0.5);
      this.onComplete({
        playerId: this.activePlayerId,
        points: [...this.waypoints],
        pathD: finalPathString,
        endMarker: 'arrow'
      });
    }

    this.cleanup();
  }

  cancelRoute() {
    if (!this.isDrawing) return;
    this.cleanup();
  }

  cleanup() {
    this.isDrawing = false;
    this.waypoints = [];
    this.activePlayerId = null;
    if (this.previewPath.parentNode) {
      this.previewPath.parentNode.removeChild(this.previewPath);
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      this.finishRoute();
    } else if (event.key === 'Escape') {
      this.cancelRoute();
    }
  }
}
