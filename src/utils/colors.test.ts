import { describe, expect, it } from 'vitest';
import { isLightColor, resolvePlayerColors } from './colors';
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
