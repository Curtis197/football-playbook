import type { Point } from '../types/playbook';
import { generateRoutePath, getDistance } from './bezier-math';

export interface RouteDrawerOptions {
  onComplete?: (routeData: {
    playerId: string | null;
    points: Point[];
    pathD: string;
    endMarker: 'arrow' | 'tbar' | 'dot' | 'none';
  }) => void;
}

/**
 * RouteDrawer controller managing canvas pointer events for route drawing.
 * Supports smooth Catmull-Rom interpolation (Single Click) and sharp directional cuts (Shift + Click).
 */
export class RouteDrawer {
  public svg: SVGSVGElement;
  public onComplete: NonNullable<RouteDrawerOptions['onComplete']>;
  public isDrawing: boolean = false;
  public waypoints: Point[] = [];
  public activePlayerId: string | null = null;
  public previewPath: SVGPathElement;

  constructor(svgElement: SVGSVGElement, options: RouteDrawerOptions = {}) {
    this.svg = svgElement;
    this.onComplete = options.onComplete || (() => {});

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
  public getSvgCoordinates(event: MouseEvent | PointerEvent): Point {
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
  public startRoute(playerId: string, originPoint: Point): void {
    this.isDrawing = true;
    this.activePlayerId = playerId;
    this.waypoints = [{ x: originPoint.x, y: originPoint.y, isSharp: false }];

    this.svg.appendChild(this.previewPath);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public handlePointerDown(event: PointerEvent | MouseEvent): void {
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

  public handlePointerMove(event: PointerEvent | MouseEvent): void {
    if (!this.isDrawing) return;
    const currentCoord = this.getSvgCoordinates(event);
    this.updatePreview(currentCoord);
  }

  public updatePreview(pointerCoord: Point): void {
    // Clone current waypoints and append live mouse pointer position
    const transientPoints: Point[] = [
      ...this.waypoints,
      { x: pointerCoord.x, y: pointerCoord.y, isSharp: false }
    ];

    const d = generateRoutePath(transientPoints, 0.5);
    this.previewPath.setAttribute('d', d);
  }

  public finishRoute(): void {
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

  public cancelRoute(): void {
    if (!this.isDrawing) return;
    this.cleanup();
  }

  public cleanup(): void {
    this.isDrawing = false;
    this.waypoints = [];
    this.activePlayerId = null;
    if (this.previewPath.parentNode) {
      this.previewPath.parentNode.removeChild(this.previewPath);
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.finishRoute();
    } else if (event.key === 'Escape') {
      this.cancelRoute();
    }
  }
}
