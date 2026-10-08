/**
 * OFFSET.IO Pixel Icon System
 * Stitch Retro Pixel Icon & Character System
 * 
 * Palette:
 *   INK:         #1a1a1a  (near-black)
 *   BLUE:        #1a36ff  (Offset Blue / primary cobalt)
 *   PALE_BLUE:   #b8c8e8
 *   OFF_WHITE:   #f5f0e8
 *   GREY:        #8a8a8a
 * 
 * Each icon is defined as a 16×16 pixel grid.
 * A pixel = 1 unit in SVG space.
 * Rendered with image-rendering: pixelated for hard edges.
 */

'use client';

const INK = '#1a1a1a';
const BLUE = '#1a36ff';
const PALE = '#b8c8e8';
const GREY = '#8a8a8a';
const WHITE = '#f5f0e8';

type PxColor = string | null;

// Helper: render a 16×16 pixel grid
function PixelGrid({
  grid,
  size,
  label,
}: {
  grid: PxColor[][];
  size: number;
  label: string;
}) {
  const cellSize = size / 16;
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
      style={{ imageRendering: 'pixelated', display: 'inline-block', flexShrink: 0 }}
    >
      {pixels}
    </svg>
  );
}

// ─── PIXEL ICON DEFINITIONS ──────────────────────────────────────────────────
// Each grid is 16 rows × 16 columns. null = transparent.

const ICONS: Record<string, { grid: PxColor[][]; label: string }> = {

  // ── CATEGORY 01: Carbon & Emissions ────────────────────────────────────────

  footprint: {
    label: 'Carbon footprint',
    grid: [
      [null, null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, null, INK,  INK,  null, null, INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  co2: {
    label: 'CO₂ molecule',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, INK,  INK,  null, null, null, null, null, null, null, null, null, INK,  INK,  null, null],
      [INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null],
      [INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null],
      [null, INK,  INK,  null, null, null, INK,  INK,  null, null, null, null, INK,  INK,  null, null],
      [null, null, null, null, null, INK,  PALE, PALE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  PALE, PALE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, INK,  INK,  INK,  INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  INK,  GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, null, null, GREY, INK,  INK,  null, null, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  INK,  GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, null, null, null, INK,  INK,  null, null, GREY, null, INK,  null, null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'earth-grid': {
    label: 'Earth grid',
    grid: [
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  null, null, null, null],
      [null, INK,  BLUE, BLUE, PALE, BLUE, BLUE, BLUE, BLUE, PALE, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, PALE, PALE, PALE, BLUE, BLUE, PALE, PALE, PALE, BLUE, INK,  null, null, null],
      [INK,  BLUE, BLUE, PALE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, PALE, BLUE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, PALE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, PALE, BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, BLUE, PALE, PALE, PALE, PALE, PALE, PALE, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  emissions: {
    label: 'Emissions',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, INK,  null, null, INK,  null, null, INK,  null, null, null, null, null, null, null],
      [null, null, INK,  INK,  null, INK,  null, null, INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  null, INK,  null, null, null, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  null, null, null, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, INK,  null, null, null, null, null, null, null, null, GREY, INK,  null, null],
      [null, INK,  GREY, INK,  BLUE, null, null, null, null, null, null, null, GREY, INK,  null, null],
      [null, INK,  GREY, INK,  BLUE, BLUE, null, null, null, null, null, null, GREY, INK,  null, null],
      [null, INK,  GREY, INK,  BLUE, BLUE, BLUE, null, null, null, null, null, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  reduction: {
    label: 'Carbon reduction',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, BLUE, BLUE, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null],
      [null, null, null, null, null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, null, null, null],
      [BLUE, null, null, null, null, null, null, null, BLUE, BLUE, INK,  INK,  BLUE, null, null, null],
      [BLUE, BLUE, null, null, null, null, null, BLUE, BLUE, INK,  null, null, INK,  null, null, null],
      [BLUE, BLUE, BLUE, null, null, null, BLUE, BLUE, INK,  null, null, null, null, INK,  null, null],
      [BLUE, BLUE, BLUE, BLUE, null, BLUE, BLUE, INK,  null, null, null, null, null, null, INK,  null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'carbon-goal': {
    label: 'Carbon goal',
    grid: [
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, INK,  INK,  INK,  INK,  INK,  INK,  BLUE, BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  INK,  PALE, PALE, PALE, PALE, INK,  INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  PALE, BLUE, BLUE, BLUE, BLUE, PALE, INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  PALE, BLUE, BLUE, BLUE, BLUE, PALE, INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  PALE, BLUE, INK,  INK,  BLUE, PALE, INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  PALE, BLUE, INK,  INK,  BLUE, PALE, INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  PALE, BLUE, BLUE, BLUE, BLUE, PALE, INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, INK,  INK,  PALE, PALE, PALE, PALE, INK,  INK,  BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, BLUE, INK,  INK,  INK,  INK,  INK,  INK,  BLUE, BLUE, BLUE, INK,  null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, null, null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'audit-meter': {
    label: 'Audit meter / confidence',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null, null],
      [null, null, null, INK,  GREY, GREY, null, null, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, INK,  GREY, null, null, null, null, null, null, GREY, GREY, INK,  null, null, null],
      [null, null, INK,  GREY, null, null, null, null, null, null, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, null, null, BLUE, BLUE, null, null, null, null, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, null, BLUE, BLUE, BLUE, BLUE, null, null, null, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, null, null, null, BLUE, BLUE, BLUE, null, null, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, null, null, null, null, BLUE, BLUE, null, null, GREY, GREY, INK,  null, null],
      [null, null, INK,  GREY, null, null, null, INK,  INK,  null, null, GREY, INK,  null, null, null],
      [null, null, INK,  INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── CATEGORY 02: Mobility & Transit ────────────────────────────────────────

  'petrol-car': {
    label: 'Petrol car',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  INK,  null, null, null, null, null],
      [null, null, null, INK,  GREY, WHITE,WHITE,WHITE,WHITE,GREY, GREY, INK,  null, null, null, null],
      [null, INK,  INK,  GREY, GREY, WHITE,WHITE,WHITE,WHITE,GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null],
      [INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, null, INK,  INK,  INK,  GREY, GREY, GREY, GREY, GREY, INK,  INK,  INK,  null, null, null],
      [null, null, INK,  null, INK,  INK,  INK,  INK,  INK,  INK,  null, INK,  null, null, null, null],
      [null, INK,  null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, INK,  null, null, null],
      [null, INK,  null, null, null, INK,  null, null, INK,  null, null, null, INK,  null, null, null],
      [null, null, INK,  null, INK,  null, null, null, null, INK,  null, INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'ev-car': {
    label: 'Electric vehicle',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, PALE, PALE, PALE, PALE, BLUE, BLUE, INK,  null, null, null, null],
      [null, INK,  INK,  BLUE, BLUE, PALE, PALE, PALE, PALE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null],
      [null, INK,  BLUE, BLUE, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, BLUE, BLUE, INK,  null, null],
      [null, null, INK,  INK,  null, INK,  INK,  INK,  INK,  INK,  null, INK,  INK,  null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  bus: {
    label: 'Public bus',
    grid: [
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, WHITE,WHITE,WHITE,GREY, GREY, WHITE,WHITE,WHITE,GREY, INK,  null, null, null],
      [null, INK,  GREY, WHITE,WHITE,WHITE,GREY, GREY, WHITE,WHITE,WHITE,GREY, INK,  null, null, null],
      [null, INK,  GREY, WHITE,WHITE,WHITE,GREY, GREY, WHITE,WHITE,WHITE,GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, WHITE,WHITE,GREY, GREY, GREY, GREY, WHITE,WHITE,GREY, INK,  null, null, null],
      [null, INK,  GREY, WHITE,WHITE,GREY, GREY, GREY, GREY, WHITE,WHITE,GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, INK,  null, INK,  INK,  null, null, INK,  INK,  null, INK,  null, null, null, null],
      [null, null, INK,  null, INK,  null, null, null, null, INK,  null, INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  rail: {
    label: 'High-speed rail',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [INK,  BLUE, WHITE,WHITE,WHITE,BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [INK,  BLUE, WHITE,WHITE,WHITE,BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  INK],
      [null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [INK,  null, null, INK,  null, null, INK,  null, null, INK,  null, null, INK,  null, null, null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  bicycle: {
    label: 'Bicycle',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, null, null, BLUE, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  null, null, INK,  INK,  INK,  null, null, null, null],
      [null, null, null, INK,  null, null, BLUE, null, null, BLUE, null, null, INK,  null, null, null],
      [null, null, INK,  null, null, BLUE, null, null, BLUE, null, null, null, null, INK,  null, null],
      [null, null, INK,  null, BLUE, null, null, INK,  null, null, BLUE, null, null, INK,  null, null],
      [null, null, INK,  null, BLUE, null, INK,  null, INK,  null, BLUE, null, null, INK,  null, null],
      [null, null, INK,  null, null, INK,  null, null, null, INK,  null, null, null, INK,  null, null],
      [null, null, null, INK,  null, null, null, null, null, null, null, null, INK,  null, null, null],
      [null, null, null, null, INK,  INK,  null, null, null, INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  pedestrian: {
    label: 'Pedestrian / walking',
    grid: [
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  WHITE,WHITE,INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  WHITE,WHITE,INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, null, null, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, INK,  null, null, INK,  BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  null, null, null, null, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  flight: {
    label: 'Air travel / flight',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, INK,  BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, INK,  INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [INK,  PALE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [null, INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── CATEGORY 03: Energy & Building ─────────────────────────────────────────

  'grid-bolt': {
    label: 'Grid power / electricity',
    grid: [
      [null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null],
      [null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  solar: {
    label: 'Solar array',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [null, null, BLUE, null, null, BLUE, null, null, BLUE, null, null, BLUE, null, null, null, null],
      [null, null, null, BLUE, BLUE, null, null, null, null, BLUE, BLUE, null, null, null, null, null],
      [BLUE, BLUE, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, BLUE, BLUE, null],
      [null, null, null, null, INK,  PALE, PALE, PALE, PALE, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  PALE, BLUE, PALE, PALE, INK,  null, null, null, null, null, null],
      [BLUE, BLUE, null, null, INK,  PALE, PALE, PALE, PALE, INK,  null, null, null, BLUE, BLUE, null],
      [null, null, BLUE, null, INK,  PALE, PALE, PALE, PALE, INK,  null, null, BLUE, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  home: {
    label: 'Home utility',
    grid: [
      [null, null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null],
      [null, null, INK,  INK,  INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  INK,  INK,  null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, PALE, PALE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, PALE, PALE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  bulb: {
    label: 'Efficiency bulb',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  INK,  PALE, PALE, PALE, PALE, INK,  INK,  null, null, null, null, null],
      [null, null, INK,  PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, INK,  null, null, null, null],
      [null, INK,  PALE, PALE, PALE, PALE, BLUE, PALE, PALE, PALE, PALE, PALE, INK,  null, null, null],
      [null, INK,  PALE, PALE, PALE, BLUE, BLUE, BLUE, PALE, PALE, PALE, PALE, INK,  null, null, null],
      [null, INK,  PALE, PALE, BLUE, BLUE, BLUE, BLUE, BLUE, PALE, PALE, PALE, INK,  null, null, null],
      [null, INK,  PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, INK,  null, null, null],
      [null, INK,  PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, INK,  null, null, null],
      [null, null, INK,  PALE, PALE, PALE, PALE, PALE, PALE, PALE, PALE, INK,  null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  thermostat: {
    label: 'Thermostat',
    grid: [
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── CATEGORY 04: Dietary & Food ────────────────────────────────────────────

  'plant-diet': {
    label: 'Plant-based diet',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, BLUE, PALE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [null, null, null, BLUE, BLUE, BLUE, PALE, PALE, PALE, BLUE, BLUE, BLUE, null, null, null, null],
      [null, null, null, BLUE, BLUE, PALE, PALE, PALE, PALE, PALE, BLUE, BLUE, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, PALE, PALE, PALE, BLUE, BLUE, null, null, null, null, null],
      [null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  plate: {
    label: 'Portion plate',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  GREY, GREY, GREY, GREY, GREY, INK,  INK,  null, null, null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, INK,  GREY, GREY, BLUE, BLUE, BLUE, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, BLUE, BLUE, BLUE, BLUE, BLUE, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, BLUE, BLUE, BLUE, BLUE, BLUE, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, BLUE, BLUE, BLUE, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null],
      [null, null, null, INK,  INK,  GREY, GREY, GREY, GREY, GREY, INK,  INK,  null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  utensils: {
    label: 'Utensils / food log',
    grid: [
      [null, INK,  null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null],
      [null, INK,  null, null, null, null, null, INK,  null, INK,  null, null, null, null, null, null],
      [null, INK,  null, null, null, null, null, INK,  null, null, INK,  null, null, null, null, null],
      [null, INK,  null, null, null, null, null, INK,  null, null, null, INK,  null, null, null, null],
      [null, INK,  null, null, null, null, null, INK,  null, null, null, INK,  null, null, null, null],
      [null, INK,  INK,  INK,  null, null, null, INK,  null, null, INK,  null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, INK,  null, INK,  null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, INK,  null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  meat: {
    label: 'Meat / livestock factor',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, INK,  null, null, null, null, null, null, null, null],
      [null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  GREY, GREY, GREY, GREY, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'local-produce': {
    label: 'Local produce',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, BLUE, PALE, PALE, PALE, PALE, PALE, BLUE, null, null, null, null, null, null],
      [null, null, null, BLUE, PALE, PALE, PALE, PALE, PALE, BLUE, null, null, null, null, null, null],
      [null, null, null, null, BLUE, PALE, PALE, PALE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, INK,  INK,  null, null, null, null, INK,  INK,  null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── CATEGORY 05: Logging & Statistical Engine ───────────────────────────────

  'daily-log': {
    label: 'Daily log / diary',
    grid: [
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  INK,  null, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  null, null, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  null, null, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  BLUE, BLUE, BLUE, BLUE, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  null, null, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  BLUE, BLUE, BLUE, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  null, null, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, INK,  BLUE, BLUE, null, null, null, null, GREY, INK,  null, null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, INK,  null, null, null, null],
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  calendar: {
    label: 'Calendar / date',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, INK,  BLUE, BLUE, null, null, BLUE, BLUE, null, null, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, null, GREY, null, GREY, null, GREY, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, null, GREY, null, GREY, null, GREY, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, null, GREY, null, GREY, null, GREY, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, GREY, GREY, GREY, GREY, GREY, GREY, GREY, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, null, GREY, null, INK,  INK,  GREY, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, GREY, GREY, GREY, INK,  INK,  GREY, GREY, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, GREY, null, GREY, null, INK,  INK,  GREY, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null],
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'trend-graph': {
    label: 'Trend graph / data',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [INK,  null, null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null],
      [INK,  null, null, null, null, null, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [INK,  null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [INK,  null, null, BLUE, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [INK,  null, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, null, BLUE, null, null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, BLUE, BLUE, null, null, null, null, null],
      [INK,  null, null, null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null],
      [INK,  null, null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [INK,  null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [INK,  null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'anomaly-flag': {
    label: 'Z-anomaly flag',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, BLUE, BLUE, BLUE, BLUE, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, BLUE, BLUE, BLUE, BLUE, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, BLUE, BLUE, BLUE, BLUE, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, BLUE, BLUE, BLUE, BLUE, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, GREY, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'step-verified': {
    label: 'Step verified / confirmed',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, null, null, null, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, null, INK,  null, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, INK,  INK,  null, null, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'audit-engine': {
    label: 'Audit engine',
    grid: [
      [null, null, INK,  null, null, INK,  null, null, null, INK,  null, null, INK,  null, null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, null, INK,  INK,  INK,  INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  null, INK,  GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, BLUE, BLUE, GREY, INK,  null, INK,  GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, BLUE, BLUE, GREY, INK,  null, INK,  GREY, BLUE, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  null, INK,  GREY, GREY, GREY, GREY, INK,  null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, null, INK,  INK,  INK,  INK,  null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, INK,  null, null, INK,  null, null, null, INK,  null, null, INK,  null, null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, null, INK,  INK,  INK,  INK,  null, null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  null, INK,  GREY, GREY, GREY, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  null, INK,  GREY, BLUE, BLUE, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, BLUE, GREY, INK,  null, INK,  GREY, BLUE, BLUE, GREY, INK,  null, null],
      [null, INK,  GREY, GREY, GREY, GREY, INK,  null, INK,  GREY, GREY, GREY, GREY, INK,  null, null],
      [null, null, INK,  INK,  INK,  INK,  null, null, null, INK,  INK,  INK,  INK,  null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── CATEGORY 06: Intelligence & Optimization ────────────────────────────────

  coach: {
    label: 'Carbon coach',
    grid: [
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, PALE, BLUE, BLUE, PALE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, PALE, PALE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, INK,  BLUE, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, INK,  null, INK,  null, null, null, null, null, null, null, null, null],
      [null, null, null, INK,  INK,  null, INK,  null, null, INK,  INK,  null, null, null, null, null],
      [null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  'unit-fit': {
    label: 'Unit-fit control / simulator',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  null, BLUE, BLUE, BLUE, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  null, BLUE, BLUE, BLUE, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, BLUE, BLUE, BLUE, null, null, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, BLUE, BLUE, BLUE, null, null, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [INK,  null, null, null, null, null, null, null, null, null, null, INK,  null, null, null, null],
      [INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  knapsack: {
    label: 'Knapsack / reduction plan',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, INK,  INK,  null, null, INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, INK,  INK,  BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, INK,  INK,  INK,  INK,  INK,  INK,  BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, INK,  PALE, PALE, PALE, PALE, INK,  BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, INK,  PALE, PALE, PALE, PALE, INK,  BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, INK,  PALE, PALE, PALE, PALE, INK,  BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, INK,  INK,  INK,  INK,  INK,  INK,  BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  INK,  INK,  INK,  INK,  INK,  INK,  INK,  null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  delta: {
    label: 'Delta compare / week-over-week',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, null, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, null, null, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, BLUE, null, null, null, BLUE, null, null, null, null, null, null, null],
      [null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  INK,  null, null, INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  null, INK,  INK,  null, INK,  null, null, null, null, null, null, null],
      [null, null, null, INK,  null, null, null, null, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  recycle: {
    label: 'Circular loop / recycle / sustainability',
    grid: [
      [null, null, null, null, null, INK,  INK,  INK,  INK,  INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, null, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, null, null, null, null, null, null, BLUE, INK,  null, null, null],
      [null, INK,  BLUE, BLUE, null, null, null, null, null, null, null, BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, null, null, null, null, null, null, null, null, null, BLUE, INK,  null, null],
      [null, INK,  BLUE, BLUE, null, null, null, null, null, null, null, BLUE, BLUE, INK,  null, null],
      [null, INK,  BLUE, BLUE, BLUE, null, null, null, null, null, BLUE, BLUE, INK,  null, null, null],
      [null, null, INK,  BLUE, BLUE, null, null, null, null, null, BLUE, INK,  null, null, null, null],
      [null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  INK,  INK,  INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },

  // ── STREAK ICON ─────────────────────────────────────────────────────────────

  streak: {
    label: 'Logging streak / flame',
    grid: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, BLUE, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, BLUE, BLUE, BLUE, null, null, null, null, null, null, null],
      [null, null, null, null, null, BLUE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null, null],
      [null, null, null, null, BLUE, BLUE, PALE, BLUE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [null, null, null, null, BLUE, PALE, PALE, PALE, BLUE, BLUE, BLUE, null, null, null, null, null],
      [null, null, null, INK,  BLUE, PALE, PALE, PALE, PALE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, PALE, PALE, PALE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, PALE, PALE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, PALE, BLUE, INK,  null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, INK,  BLUE, BLUE, BLUE, BLUE, INK,  null, null, null, null, null, null],
      [null, null, null, null, null, INK,  BLUE, BLUE, INK,  null, null, null, null, null, null, null],
      [null, null, null, null, null, null, INK,  INK,  null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
  },
};

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export type PixelIconName = keyof typeof ICONS;

export interface PixelIconProps {
  /** Icon identifier */
  name: PixelIconName;
  /** Rendered size in px (applied as width & height). Default 24. */
  size?: number;
  /** Optional CSS class */
  className?: string;
}

/**
 * Render a single pixel art icon from the OFFSET.IO Stitch system.
 *
 * @example
 * <PixelIcon name="footprint" size={24} />
 * <PixelIcon name="streak"    size={16} />
 */
export function PixelIcon({ name, size = 24, className }: PixelIconProps) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      aria-hidden="true"
    >
      <PixelGrid grid={icon.grid} size={size} label={icon.label} />
    </span>
  );
}

export { ICONS as PIXEL_ICON_REGISTRY };
