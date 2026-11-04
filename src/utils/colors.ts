import type { Player, PlayerShape } from '../types/playbook';

/**
 * Color utilities and preset palettes for football playbook entities (players and vector lines)
 */

export interface ColorSwatch {
  label: string;
  color: string;
}

export const LINE_COLOR_SWATCHES: ColorSwatch[] = [
  { label: 'Pass Route Sky', color: '#38bdf8' },
  { label: 'Run Block Amber', color: '#f59e0b' },
  { label: 'Pull Block Pink', color: '#ec4899' },
  { label: 'Motion Track Purple', color: '#c084fc' },
  { label: 'Emerald Green', color: '#10b981' },
  { label: 'Crimson Red', color: '#ef4444' },
  { label: 'Electric Cyan', color: '#06b6d4' },
  { label: 'Neon Orange', color: '#f97316' },
  { label: 'Lime Accent', color: '#84cc16' },
  { label: 'Crisp White', color: '#ffffff' },
  { label: 'Charcoal Black', color: '#1e293b' },
];

/**
 * Determines whether a given hex color is perceptually light or dark
 * using ITU-R BT.601 relative luminance formula.
 */
export function isLightColor(colorHex: string): boolean {
  if (!colorHex) return false;
  const hex = colorHex.replace('#', '').trim();
  let r = 0, g = 0, b = 0;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length >= 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return false;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  // Perceived brightness formula (0-255)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

/**
 * What a player is drawn on, which decides the letter colour when none is set:
 * - 'field': the chalkboard canvas (keeps the black 0/0/0 default; the canvas draws a readable backdrop behind it)
 * - 'light' / 'dark': UI chrome such as the Inspector and the hover card
 */
export type ColorSurface = 'field' | 'light' | 'dark';

export interface PlayerColors {
  shape: PlayerShape;
  nodeColor: string;
  fillColor: string;
  letterColor: string;
}

const DEFAULT_PLAYER_COLOR = '#000000';

/**
 * The single place that turns a player's optional colour fields into the colours to draw.
 * Explicit values always win; only unset values fall back, so the same player looks the same everywhere
 * except where the surface itself would make a default unreadable.
 */
export function resolvePlayerColors(
  player: Pick<Player, 'shape' | 'color' | 'nodeColor' | 'fillColor' | 'letterColor'>,
  surface: ColorSurface
): PlayerColors {
  const shape = player.shape || 'none';
  const nodeColor = player.nodeColor || player.color || DEFAULT_PLAYER_COLOR;
  const fillColor = shape === 'none'
    ? 'transparent'
    : (player.fillColor !== undefined ? player.fillColor : (player.color || DEFAULT_PLAYER_COLOR));

  let letterColor = player.letterColor;
  if (!letterColor) {
    if (fillColor === 'transparent') letterColor = surface === 'dark' ? '#ffffff' : DEFAULT_PLAYER_COLOR;
    else letterColor = isLightColor(fillColor) ? '#000000' : '#ffffff';
  }
  return { shape, nodeColor, fillColor, letterColor };
}

// ---- WCAG contrast, used to put each bare-text label on whichever backdrop reads best ----

function parseHex(color: string): [number, number, number] | null {
  const hex = color.replace('#', '').trim();
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex.length >= 6 ? hex.slice(0, 6) : '';
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** WCAG relative luminance (0 black .. 1 white). Anything that is not a hex colour counts as black. */
export function relativeLuminance(color: string): number {
  const channels = parseHex(color) ?? [0, 0, 0];
  const [r, g, b] = channels.map(value => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export const LABEL_BACKDROP_LIGHT = '#f1f5f9';
export const LABEL_BACKDROP_DARK = '#1a1f26';

/**
 * The backdrop for a bare-text label: light or dark, whichever contrasts more with the label colour. The stored
 * colour is never changed, so the black 0/0/0 default stays black and is simply drawn on a light disc.
 */
export function readableBackdrop(letterColor: string): string {
  return contrastRatio(letterColor, LABEL_BACKDROP_LIGHT) >= contrastRatio(letterColor, LABEL_BACKDROP_DARK)
    ? LABEL_BACKDROP_LIGHT
    : LABEL_BACKDROP_DARK;
}
