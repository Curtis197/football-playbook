import { describe, expect, it } from 'vitest';
import { generateRoutePath, getDistance } from './bezier-math';
import {
  clampFieldCoordinates,
  generatePathString,
  getBlankNodeOffsetPoint,
  getSvgCoordinates,
  insertPointIntoAction
} from './geometry';
import type { Point } from '../types/playbook';

const pts = (...coords: [number, number, boolean?][]): Point[] => coords.map(([x, y, isSharp]) => (isSharp === undefined ? { x, y } : { x, y, isSharp }));
const commands = (path: string) => path.match(/[MLC]/g) ?? [];

describe('getDistance', () => {
  it('is the straight-line distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(getDistance({ x: 7, y: 7 }, { x: 7, y: 7 })).toBe(0);
  });
});

describe('generateRoutePath (Catmull-Rom curves with sharp cuts)', () => {
  it('draws nothing for no points and a bare move for one', () => {
    expect(generateRoutePath([])).toBe('');
    expect(generateRoutePath(pts([10, 20]))).toBe('M 10.0 20.0');
  });

  it('draws a straight line for two points', () => {
    expect(generateRoutePath(pts([0, 0], [100, 50]))).toBe('M 0.0 0.0 L 100.0 50.0');
  });

  it('draws smooth cubic segments through three or more smooth points', () => {
    const path = generateRoutePath(pts([0, 0], [50, 100], [150, 100]));
    expect(commands(path)).toEqual(['M', 'C', 'C']);
  });

  it('the curve passes through every waypoint (each segment ends exactly on its point)', () => {
    const points = pts([0, 0], [50, 100], [150, 100], [200, 20]);
    const path = generateRoutePath(points);
    for (const p of points.slice(1)) expect(path).toContain(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  });

  it('a sharp point turns both of its adjacent segments into straight lines', () => {
    const path = generateRoutePath(pts([0, 0], [50, 100, true], [150, 100], [200, 20]));
    expect(commands(path)).toEqual(['M', 'L', 'L', 'C']);
  });

  it('with every point sharp the route is a plain polyline', () => {
    expect(commands(generateRoutePath(pts([0, 0, true], [50, 100, true], [150, 100, true])))).toEqual(['M', 'L', 'L']);
  });

  it('collinear points give a curve that stays on the line (no overshoot)', () => {
    const path = generateRoutePath(pts([0, 0], [100, 0], [200, 0]));
    const ys = [...path.matchAll(/(-?\d+\.\d) (-?\d+\.\d)/g)].map(match => Number(match[2]));
    expect(ys.every(y => y === 0)).toBe(true);
  });

  it('never produces NaN, even for repeated points', () => {
    expect(generateRoutePath(pts([10, 10], [10, 10], [10, 10]))).not.toMatch(/NaN|Infinity/);
  });
});

describe('getBlankNodeOffsetPoint', () => {
  it('starts the line the given distance away from the player, along the first segment', () => {
    const start = getBlankNodeOffsetPoint({ x: 100, y: 100 }, { x: 200, y: 100 }, 18);
    expect(start).toEqual({ x: 118, y: 100 });
  });

  it('stays on the segment for diagonal lines', () => {
    const start = getBlankNodeOffsetPoint({ x: 0, y: 0 }, { x: 30, y: 40 }, 10);
    expect(getDistance({ x: 0, y: 0 }, start)).toBeCloseTo(10, 0);
    expect(start.x / start.y).toBeCloseTo(30 / 40, 1);
  });

  it('keeps the original start when the segment is no longer than the offset', () => {
    const p0 = { x: 5, y: 5 };
    expect(getBlankNodeOffsetPoint(p0, { x: 10, y: 5 }, 18)).toBe(p0);
    expect(getBlankNodeOffsetPoint(p0, p0, 18)).toBe(p0);
  });

  it('keeps the sharp flag of the start point', () => {
    expect(getBlankNodeOffsetPoint({ x: 0, y: 0, isSharp: true }, { x: 100, y: 0 })).toMatchObject({ isSharp: true });
  });
});

describe('generatePathString', () => {
  it('returns an empty string for no points', () => {
    expect(generatePathString([])).toBe('');
  });

  it('straight mode draws a polyline whatever the sharp flags say', () => {
    const path = generatePathString(pts([0, 0], [50, 100], [150, 100]), false);
    expect(commands(path)).toEqual(['M', 'L', 'L']);
  });

  it('curved mode uses the curve engine', () => {
    expect(generatePathString(pts([0, 0], [50, 100], [150, 100]), true)).toBe(generateRoutePath(pts([0, 0], [50, 100], [150, 100]), 0.5));
  });

  it('a start offset moves only the first point', () => {
    const plain = generatePathString(pts([100, 100], [200, 100]), false, 0);
    const offset = generatePathString(pts([100, 100], [200, 100]), false, 18);
    expect(plain).toBe('M 100.0 100.0 L 200.0 100.0');
    expect(offset).toBe('M 118.0 100.0 L 200.0 100.0');
  });
});

describe('clampFieldCoordinates', () => {
  it('keeps points inside the field margins and rounds them', () => {
    expect(clampFieldCoordinates({ x: -50, y: 9999 })).toEqual({ x: 20, y: 680 });
    expect(clampFieldCoordinates({ x: 5000, y: -1 })).toEqual({ x: 980, y: 20 });
    expect(clampFieldCoordinates({ x: 500.6, y: 300.4 })).toEqual({ x: 501, y: 300 });
  });

  it('keeps extra fields such as the sharp flag', () => {
    expect(clampFieldCoordinates({ x: 100, y: 100, isSharp: true })).toMatchObject({ isSharp: true });
  });
});

describe('getSvgCoordinates', () => {
  const svg = { getBoundingClientRect: () => ({ left: 10, top: 20, width: 500, height: 350 }) } as unknown as SVGSVGElement;
  const event = (clientX: number, clientY: number) => ({ clientX, clientY }) as Parameters<typeof getSvgCoordinates>[0];

  it('converts screen pixels to field units using the element\'s on-screen size', () => {
    // 500px wide shows 1000 units, so one pixel is two units
    expect(getSvgCoordinates(event(260, 195), svg)).toEqual({ x: 500, y: 350 });
  });

  it('clamps pointers outside the board to the field margins', () => {
    expect(getSvgCoordinates(event(-100, -100), svg)).toEqual({ x: 20, y: 20 });
    expect(getSvgCoordinates(event(9999, 9999), svg)).toEqual({ x: 980, y: 680 });
  });
});

describe('insertPointIntoAction', () => {
  const route = pts([0, 0], [100, 0], [100, 100]);

  it('inserts into the segment nearest the click, keeping the order', () => {
    const result = insertPointIntoAction(route, { x: 50, y: 5 });
    expect(result.map(p => [p.x, p.y])).toEqual([[0, 0], [50, 5], [100, 0], [100, 100]]);

    const second = insertPointIntoAction(route, { x: 95, y: 60 });
    expect(second.map(p => [p.x, p.y])).toEqual([[0, 0], [100, 0], [95, 60], [100, 100]]);
  });

  it('the new point is smooth and rounded', () => {
    const inserted = insertPointIntoAction(route, { x: 50.4, y: 5.6 })[1];
    expect(inserted).toEqual({ x: 50, y: 6, isSharp: false });
  });

  it('keeps the start and end points and every other point as they were', () => {
    const result = insertPointIntoAction(route, { x: 50, y: 5 });
    expect(result[0]).toBe(route[0]);
    expect(result.at(-1)).toBe(route.at(-1));
    expect(result).toHaveLength(route.length + 1);
  });

  it('appends when there are fewer than two points', () => {
    expect(insertPointIntoAction([], { x: 10, y: 10 })).toEqual([{ x: 10, y: 10, isSharp: false }]);
    expect(insertPointIntoAction(pts([5, 5]), { x: 10, y: 10 })).toHaveLength(2);
  });

  it('does not mutate its input', () => {
    const frozen = JSON.stringify(route);
    insertPointIntoAction(route, { x: 50, y: 5 });
    expect(JSON.stringify(route)).toBe(frozen);
  });
});
