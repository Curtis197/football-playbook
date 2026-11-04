import { describe, expect, it } from 'vitest';
import { LABEL_BACKDROP_DARK, LABEL_BACKDROP_LIGHT, contrastRatio, isLightColor, readableBackdrop, relativeLuminance, resolvePlayerColors } from './colors';
import type { Player } from '../types/playbook';

type ColorFields = Pick<Player, 'shape' | 'color' | 'nodeColor' | 'fillColor' | 'letterColor'>;

describe('isLightColor', () => {
  it.each([
    ['#ffffff', true], ['#fff', true], ['#f59e0b', true],
    ['#000000', false], ['#000', false], ['#1e3a8a', false], ['#0284c7', false]
  ])('%s -> %s', (hex, expected) => {
    expect(isLightColor(hex)).toBe(expected);
  });

  it('treats missing or malformed input as dark rather than throwing', () => {
    for (const input of ['', 'nope', '#12', '#gggggg']) expect(isLightColor(input)).toBe(false);
  });
});

describe('resolvePlayerColors', () => {
  it('uses the black default with no node when nothing is set', () => {
    expect(resolvePlayerColors({}, 'field')).toEqual({ shape: 'none', nodeColor: '#000000', fillColor: 'transparent', letterColor: '#000000' });
  });

  it('bare-text players never have a fill, even if one is stored', () => {
    expect(resolvePlayerColors({ shape: 'none', fillColor: '#ff0000' }, 'light').fillColor).toBe('transparent');
  });

  it('the legacy "color" field is the fallback for node and fill but not for explicit values', () => {
    expect(resolvePlayerColors({ shape: 'round', color: '#e11d48' }, 'field')).toMatchObject({ nodeColor: '#e11d48', fillColor: '#e11d48' });
    expect(resolvePlayerColors({ shape: 'round', color: '#e11d48', nodeColor: '#0284c7', fillColor: '#ffffff' }, 'field'))
      .toMatchObject({ nodeColor: '#0284c7', fillColor: '#ffffff' });
  });

  it('picks a readable letter colour for an opaque fill', () => {
    expect(resolvePlayerColors({ shape: 'round', fillColor: '#ffffff' }, 'field').letterColor).toBe('#000000');
    expect(resolvePlayerColors({ shape: 'round', fillColor: '#1e3a8a' }, 'field').letterColor).toBe('#ffffff');
  });

  it('an explicit letter colour wins on every surface', () => {
    for (const surface of ['field', 'light', 'dark'] as const) {
      expect(resolvePlayerColors({ shape: 'round', fillColor: '#ffffff', letterColor: '#10b981' }, surface).letterColor).toBe('#10b981');
    }
  });

  describe('an unset letter on a transparent fill depends on what it is drawn on', () => {
    it.each([['field', '#000000'], ['light', '#000000'], ['dark', '#ffffff']] as const)('%s -> %s', (surface, expected) => {
      expect(resolvePlayerColors({ shape: 'none' }, surface).letterColor).toBe(expected);
      expect(resolvePlayerColors({ shape: 'round', fillColor: 'transparent' }, surface).letterColor).toBe(expected);
    });
  });

  it('node, fill and shape never depend on the surface', () => {
    const samples: ColorFields[] = [{}, { shape: 'square', color: '#e11d48' }, { shape: 'round', nodeColor: '#0284c7', fillColor: '#1e3a8a' }];
    for (const sample of samples) {
      const field = resolvePlayerColors(sample, 'field');
      const dark = resolvePlayerColors(sample, 'dark');
      expect([field.shape, field.nodeColor, field.fillColor]).toEqual([dark.shape, dark.nodeColor, dark.fillColor]);
    }
  });
});

describe('contrast helpers (WCAG)', () => {
  it('relative luminance runs from 0 (black) to 1 (white), and unreadable input counts as black', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('#fff')).toBeCloseTo(1, 5);
    expect(relativeLuminance('nonsense')).toBe(0);
    expect(relativeLuminance('transparent')).toBe(0);
  });

  it('contrast ratio matches the published WCAG figures', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);   // order does not matter
    expect(contrastRatio('#777777', '#777777')).toBe(1);
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 1); // the well-known "just passes AA" grey
  });
});

describe('readableBackdrop (bare-text labels on the chalkboard)', () => {
  it('puts black labels on the light backdrop and white labels on the dark one', () => {
    expect(readableBackdrop('#000000')).toBe(LABEL_BACKDROP_LIGHT);
    expect(readableBackdrop('#ffffff')).toBe(LABEL_BACKDROP_DARK);
  });

  it('the default black label is now clearly readable (it was 1.27:1 on the dark board)', () => {
    expect(contrastRatio('#000000', LABEL_BACKDROP_DARK)).toBeLessThan(1.5);
    expect(contrastRatio('#000000', readableBackdrop('#000000'))).toBeGreaterThan(18);
  });

  it.each([
    ['Solid Black', '#000000', 18], ['Clean White', '#ffffff', 16], ['Deep Charcoal', '#334155', 9],
    ['Amber Gold', '#f59e0b', 7], ['Emerald Green', '#10b981', 6]
  ])('%s reads well (at least %d:1)', (_name, color, minimum) => {
    expect(contrastRatio(color, readableBackdrop(color))).toBeGreaterThan(minimum);
  });

  it('always picks the better of the two backdrops, so it can only help', () => {
    for (const color of ['#000000', '#ffffff', '#0284c7', '#e11d48', '#f59e0b', '#10b981', '#8b5cf6', '#334155', '#7c3aed', '#888888']) {
      const chosen = contrastRatio(color, readableBackdrop(color));
      expect(chosen, color).toBeGreaterThanOrEqual(contrastRatio(color, LABEL_BACKDROP_LIGHT) - 1e-9);
      expect(chosen, color).toBeGreaterThanOrEqual(contrastRatio(color, LABEL_BACKDROP_DARK) - 1e-9);
    }
  });

  it('improves the dark-board contrast of a rose label over the old always-dark disc', () => {
    expect(contrastRatio('#e11d48', readableBackdrop('#e11d48'))).toBeGreaterThan(contrastRatio('#e11d48', LABEL_BACKDROP_DARK));
  });

  it('never changes the stored colour: it only chooses what to draw behind it', () => {
    const colors = resolvePlayerColors({}, 'field');
    expect(colors.letterColor).toBe('#000000');
    expect(readableBackdrop(colors.letterColor)).toBe(LABEL_BACKDROP_LIGHT);
  });
});
