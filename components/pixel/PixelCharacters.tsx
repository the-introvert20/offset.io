/**
 * OFFSET.IO Pixel Character System
 * Stitch "OFFSET.IO Retro Pixel Icon & Character System"
 *
 * Characters (24×24 pixel grid):
 *   CHAR-01 — THE SPROUT    curious / forgiving / onboarding
 *   CHAR-02 — THE TECH      analytical / exact / simulator  ← default selection
 *   CHAR-03 — THE FOREST    patient / stoic / long-term
 *   CHAR-04 — THE EARTH     systemic / global context
 *
 * States:
 *   normal        calm neutral
 *   on-target     relaxed / confident
 *   improving     subtle thumbs-up
 *   over-target   stressed / cautious
 *   streak-active holding spark
 *
 * Palette:
 *   INK   #1a1a1a  near-black
 *   BLUE  #1a36ff  cobalt (primary)
 *   PALE  #b8c8e8  pale blue
 *   OFF   #f5f0e8  off-white / canvas
 *   GREY  #8a8a8a  muted
 *   SKN   #e8d5b0  skin tone (neutral)
 *   HAIR_SPROUT  #6aaa40  green
 *   HAIR_TECH    #4466cc  blue-tinted
 *   HAIR_FOREST  #6b5a3e  brown
 *   HAIR_EARTH   #1a1a3a  deep navy
 */

'use client';

const INK  = '#1a1a1a';
const BLUE = '#1a36ff';
const PALE = '#b8c8e8';
const OFF  = '#f5f0e8';
const GREY = '#8a8a8a';
const SKN  = '#e8d5b0';    // skin
const HSP  = '#6aaa40';    // sprout hair
const HTE  = '#3355bb';    // tech hair
const HFO  = '#6b5a3e';    // forest hair
const HEA  = '#1a1a3a';    // earth hair
const RED  = '#cc3322';    // stress accent for over-target
const YEL  = '#ffdd44';    // spark/streak

type PxColor = string | null;

function PixelGrid24({
  grid,
  size,
  label,
}: {
  grid: PxColor[][];
  size: number;
  label: string;
}) {
  const cellSize = size / 24;
  const pixels: React.ReactNode[] = [];
  grid.forEach((row, y) => {
    row.forEach((col, x) => {
      if (col) {
        pixels.push(
          <rect
            key={`${x}-${y}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill={col}
          />
        );
      }
    });
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={label}
      role="img"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {pixels}
    </svg>
  );
}

// ─── SHARED BODY TEMPLATE (24×24) ────────────────────────────────────────────
// Row indices: 0-2 = top/hair, 3-7 = head, 8-9 = neck, 10-18 = body, 19-23 = legs
// Column center: ~11-12

// Helper to merge layers (top wins)
function mergeGrids(...grids: PxColor[][][]): PxColor[][] {
  const out: PxColor[][] = Array.from({ length: 24 }, () => Array(24).fill(null));
  for (const grid of grids) {
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        if (grid[y]?.[x]) out[y][x] = grid[y][x];
      }
    }
  }
  return out;
}

// ── Base body (shared across all chars/states) ───────────────────────────────
const BASE_BODY: PxColor[][] = [
  // Legs / feet (rows 18–23)
  ...Array(18).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null, null], // 18
  [null, null, null, null, null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null, null, null, null], // 19
  [null, null, null, null, null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null, null, null, null], // 20
  [null, null, null, null, null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null, null, null, null], // 21
  [null, null, null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null, null, null], // 22
  [null, null, null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null, null], // 23
];

const TORSO_LAYER: PxColor[][] = [
  ...Array(9).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null], // 9
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 10
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 11
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 12
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 13
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 14
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 15
  [null, null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null], // 16
  [null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null], // 17
  ...Array(6).fill(Array(24).fill(null)),
];

const HEAD_BASE: PxColor[][] = [
  ...Array(3).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null], // 3
  [null, null, null, null, null, null, null, INK,  SKN,  SKN,  SKN,  SKN,  SKN,  SKN,  SKN,  INK,  null, null, null, null, null, null, null, null], // 4
  [null, null, null, null, null, null, null, INK,  SKN,  INK,  SKN,  SKN,  SKN,  INK,  SKN,  INK,  null, null, null, null, null, null, null, null], // 5 eyes
  [null, null, null, null, null, null, null, INK,  SKN,  SKN,  SKN,  SKN,  SKN,  SKN,  SKN,  INK,  null, null, null, null, null, null, null, null], // 6
  [null, null, null, null, null, null, null, INK,  SKN,  SKN,  INK,  INK,  SKN,  SKN,  SKN,  INK,  null, null, null, null, null, null, null, null], // 7 mouth
  [null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null], // 8
  ...Array(15).fill(Array(24).fill(null)),
];

// ── Character-specific hair / colour accents ─────────────────────────────────

const HAIR_SPROUT: PxColor[][] = [
  [null, null, null, null, null, null, null, null, null, null, null, HSP,  HSP,  null, null, null, null, null, null, null, null, null, null, null], // 0
  [null, null, null, null, null, null, null, null, null, HSP,  HSP,  HSP,  HSP,  HSP,  null, null, null, null, null, null, null, null, null, null], // 1
  [null, null, null, null, null, null, null, HSP,  HSP,  HSP,  HSP,  HSP,  HSP,  HSP,  HSP,  null, null, null, null, null, null, null, null, null], // 2
  ...Array(21).fill(Array(24).fill(null)),
];

const HAIR_TECH: PxColor[][] = [
  [null, null, null, null, null, null, null, HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  null, null, null, null, null, null, null, null, null], // 0
  [null, null, null, null, null, null, HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  null, null, null, null, null, null, null, null], // 1
  [null, null, null, null, null, null, null, HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  HTE,  null, null, null, null, null, null, null, null, null], // 2
  ...Array(21).fill(Array(24).fill(null)),
];

const HAIR_FOREST: PxColor[][] = [
  [null, null, null, null, null, null, null, HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  null, null, null, null, null, null, null, null, null], // 0
  [null, null, null, null, null, null, HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  null, null, null, null, null, null, null, null], // 1
  [null, null, null, null, null, null, HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  HFO,  null, null, null, null, null, null, null, null], // 2
  ...Array(21).fill(Array(24).fill(null)),
];

const HAIR_EARTH: PxColor[][] = [
  [null, null, null, null, null, null, null, HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  null, null, null, null, null, null, null, null, null], // 0
  [null, null, null, null, null, null, HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  null, null, null, null, null, null, null, null], // 1
  [null, null, null, null, null, null, HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  HEA,  null, null, null, null, null, null, null, null], // 2
  ...Array(21).fill(Array(24).fill(null)),
];

// ── Body accent (shirt design per character) ─────────────────────────────────

const SHIRT_PLAIN: PxColor[][] = Array(24).fill(Array(24).fill(null));

const SHIRT_TECH: PxColor[][] = [
  ...Array(10).fill(Array(24).fill(null)),
  // Small data-screen graphic on torso
  [null, null, null, null, null, null, null, null, null, null, INK,  PALE, PALE, INK,  null, null, null, null, null, null, null, null, null, null], // 10
  [null, null, null, null, null, null, null, null, null, null, INK,  PALE, PALE, INK,  null, null, null, null, null, null, null, null, null, null], // 11
  [null, null, null, null, null, null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null, null], // 12
  ...Array(11).fill(Array(24).fill(null)),
];

// ── Behavioral state overlays ─────────────────────────────────────────────────
// These are layered ON TOP of the character's base grid.

// NORMAL: standard mouth
const STATE_NORMAL: PxColor[][] = Array(24).fill(Array(24).fill(null));

// ON-TARGET: slight smile (override mouth row)
const STATE_ON_TARGET: PxColor[][] = [
  ...Array(7).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, INK,  SKN,  SKN,  INK,  SKN,  SKN,  INK,  SKN,  INK,  null, null, null, null, null, null, null, null], // 7 wider smile
  ...Array(16).fill(Array(24).fill(null)),
];

// IMPROVING: thumbs-up hand (extends arm right)
const STATE_IMPROVING_ARM: PxColor[][] = [
  ...Array(10).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null, null, null, null], // 10 arm
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  SKN,  INK,  null, null, null, null, null], // 11
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  SKN,  INK,  null, null, null, null, null], // 12
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  INK,  null, null, null, null, null], // 13
  ...Array(10).fill(Array(24).fill(null)),
];

// OVER-TARGET: stressed brow + frown
const STATE_OVER_TARGET: PxColor[][] = [
  ...Array(5).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, INK,  SKN,  RED,  SKN,  SKN,  SKN,  RED,  SKN,  INK,  null, null, null, null, null, null, null, null], // 5 stressed brow
  [null, null, null, null, null, null, null, INK,  SKN,  INK,  SKN,  SKN,  SKN,  INK,  SKN,  INK,  null, null, null, null, null, null, null, null], // 6 eyes
  [null, null, null, null, null, null, null, INK,  SKN,  SKN,  SKN,  INK,  INK,  SKN,  SKN,  INK,  null, null, null, null, null, null, null, null], // 7 frown
  ...Array(16).fill(Array(24).fill(null)),
];

// STREAK-ACTIVE: holding spark in right hand
const STATE_STREAK_ARM: PxColor[][] = [
  ...Array(10).fill(Array(24).fill(null)),
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null, null, null, null], // 10
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  SKN,  INK,  null, null, null, null, null], // 11
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  SKN,  INK,  null, null, null, null, null], // 12
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, INK,  null, YEL,  null, null, null, null], // 13 spark
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, YEL,  YEL,  YEL,  null, null, null], // 14
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, YEL,  null, null, null, null], // 15
  ...Array(8).fill(Array(24).fill(null)),
];

// ─── CHARACTER + STATE LOOKUP ────────────────────────────────────────────────

export type CharacterType = 'sprout' | 'tech' | 'forest' | 'earth';
export type CharacterState = 'normal' | 'on-target' | 'improving' | 'over-target' | 'streak-active';

const CHAR_HAIR: Record<CharacterType, PxColor[][]> = {
  sprout: HAIR_SPROUT,
  tech:   HAIR_TECH,
  forest: HAIR_FOREST,
  earth:  HAIR_EARTH,
};

const CHAR_SHIRT: Record<CharacterType, PxColor[][]> = {
  sprout: SHIRT_PLAIN,
  tech:   SHIRT_TECH,
  forest: SHIRT_PLAIN,
  earth:  SHIRT_PLAIN,
};

const STATE_ARM: Record<CharacterState, PxColor[][]> = {
  'normal':        STATE_NORMAL,
  'on-target':     STATE_ON_TARGET,
  'improving':     STATE_IMPROVING_ARM,
  'over-target':   STATE_OVER_TARGET,
  'streak-active': STATE_STREAK_ARM,
};

const STATE_FACE: Record<CharacterState, PxColor[][]> = {
  'normal':        STATE_NORMAL,
  'on-target':     STATE_ON_TARGET,
  'improving':     STATE_NORMAL,
  'over-target':   STATE_OVER_TARGET,
  'streak-active': STATE_NORMAL,
};

function buildCharacterGrid(character: CharacterType, state: CharacterState): PxColor[][] {
  return mergeGrids(
    BASE_BODY,
    TORSO_LAYER,
    CHAR_SHIRT[character],
    HEAD_BASE,
    CHAR_HAIR[character],
    STATE_FACE[state],
    STATE_ARM[state],
  );
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export interface PixelCharacterProps {
  /** Which character to render */
  character: CharacterType;
  /** Emotional / behavioral state */
  state?: CharacterState;
  /** Rendered size in px (square). Default 48. */
  size?: number;
  /** Optional CSS class */
  className?: string;
}

const CHAR_LABELS: Record<CharacterType, string> = {
  sprout: 'The Sprout — curious, onboarding',
  tech:   'The Tech — analytical, simulator',
  forest: 'The Forest — patient, long-term goals',
  earth:  'The Earth — systemic, global context',
};

/**
 * Render a pixel character from the OFFSET.IO Stitch character system.
 *
 * @example
 * <PixelCharacter character="tech" state="improving" size={48} />
 */
export function PixelCharacter({ character, state = 'normal', size = 48, className }: PixelCharacterProps) {
  const grid = buildCharacterGrid(character, state);
  const label = `${CHAR_LABELS[character]} (${state})`;
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
    >
      <PixelGrid24 grid={grid} size={size} label={label} />
    </span>
  );
}

/**
 * Map dashboard data state → character behavioral state
 */
export function resolveCharacterState(opts: {
  isOnTarget: boolean;
  isImproving: boolean;
  isOverTarget: boolean;
  streakActive: boolean;
}): CharacterState {
  const { isOnTarget, isImproving, isOverTarget, streakActive } = opts;
  if (streakActive)  return 'streak-active';
  if (isImproving)   return 'improving';
  if (isOnTarget)    return 'on-target';
  if (isOverTarget)  return 'over-target';
  return 'normal';
}
