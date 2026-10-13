'use client';

/**
 * OFFSET.IO Animated Pixel Earth
 *
 * Ported from the "OFFSET.IO Animated Pixel Earth Component (Dynamic Day/Night)"
 * Google Stitch design (project 14933487728423117148, screen d94d130fa3db427daac14d37bbb97350).
 *
 * Engine:
 *  - 32×32 discrete cylindrical orthographic projector
 *  - 8× integer upscaling via CSS (imageRendering: pixelated)
 *  - Procedural continent + cloud + city-light bitmap
 *  - Dynamic solar palette: local-time sinusoidal day/night curve
 *    · 06:00–18:00  full daylight saturation
 *    · 17:00–19:00  dusk/sunset golden transition
 *    · 05:00–07:00  dawn/sunrise golden transition
 *    · 19:00–05:00  radiant navy night (never pure black)
 *  - Warm amber city lights that fade in at night
 *  - Floating cloud layer (moves slightly faster than surface)
 *  - 1-px stepped ink outline rim
 *  - prefers-reduced-motion: halts rotation, keeps last frame
 *  - Pauses when page is hidden (visibilitychange)
 *  - Zero external dependencies
 *
 * Props
 * ─────────────────────────────────────────────────────────────
 *   size          CSS display size in px.  Default: 200
 *   loopSeconds   Full rotation period.    Default: 12
 *   className     Optional wrapper class
 *
 * To adjust:
 *   size={240}          → bigger globe
 *   loopSeconds={20}    → slower rotation
 *   Change solar palette constants (OCEAN_DAY etc.) below.
 */

import { useEffect, useRef } from 'react';

// ── Dimensions ────────────────────────────────────────────────
const WORLD_W = 64;
const WORLD_H = 32;
const CANVAS  = 32;      // always 32×32 pixels; CSS scales it up
const R       = 13.8;    // sphere radius in 32-pixel space
const CX      = 15.5;
const CY      = 15.5;

// ── Solar palette  (no pure black anywhere) ───────────────────
const OCEAN_NIGHT  = '#192C78';  // radiant navy
const OCEAN_DAY    = '#1238D4';  // cobalt blue
const LAND_NIGHT   = '#156C47';  // deep forest emerald
const LAND_DAY     = '#22C55E';  // vivid green
const LANDHI_NIGHT = '#238C5E';  // highland night
const LANDHI_DAY   = '#4ADE80';  // highland day
const CLOUD_NIGHT  = '#B9C6E8';  // moonlit periwinkle
const CLOUD_DAY    = '#FFFFFF';  // crisp white
const CITY_COLOR   = '#FFDD33';  // warm amber city lights
const INK_RIM      = '#171717';  // near-black outline (not pure #000)

// ── Continent bitmap seed ─────────────────────────────────────
// fillRect operations on the 64×32 toroidal equirectangular map.
// 0 = ocean, 1 = land, 2 = highland/ice, 3 = cloud (separate buf)
function buildWorld(): {
  worldData:  Uint8Array;
  citiesData: Uint8Array;
  cloudsData: Uint8Array;
} {
  const worldData  = new Uint8Array(WORLD_W * WORLD_H);
  const citiesData = new Uint8Array(WORLD_W * WORLD_H);
  const cloudsData = new Uint8Array(WORLD_W * WORLD_H);

  const fill = (buf: Uint8Array, x0: number, y0: number, w: number, h: number, val: number) => {
    for (let y = y0; y < y0 + h; y++) {
      if (y < 0 || y >= WORLD_H) continue;
      for (let x = x0; x < x0 + w; x++) {
        buf[y * WORLD_W + ((x + WORLD_W) % WORLD_W)] = val;
      }
    }
  };

  // ── Americas (x: 8–22) ──────────────────────────────────────
  // North America
  fill(worldData, 10, 5,  8, 4, 1);
  fill(worldData,  8, 7, 10, 5, 1);
  fill(worldData, 11,12,  4, 3, 1);
  fill(worldData, 13,14,  2, 2, 1); // Central America
  // South America
  fill(worldData, 14,16,  7, 5, 1);
  fill(worldData, 15,20,  5, 5, 1);
  fill(worldData, 16,24,  3, 4, 1);
  // Greenland & Arctic ice
  fill(worldData, 18, 3,  4, 2, 2);

  // ── Europe & Africa (x: 28–40) ───────────────────────────────
  fill(worldData, 30, 6,  7, 4, 1); // Europe
  fill(worldData, 29, 8,  8, 3, 1);
  fill(worldData, 28, 7,  2, 2, 1); // British Isles
  fill(worldData, 30,12,  9, 6, 1); // North Africa
  fill(worldData, 31,18,  7, 6, 1); // Sub-Saharan Africa
  fill(worldData, 32,24,  5, 3, 1); // Southern Africa
  fill(worldData, 39,21,  2, 3, 1); // Madagascar

  // ── Asia (x: 37–56) ─────────────────────────────────────────
  fill(worldData, 37, 5, 16, 5, 1);
  fill(worldData, 38, 9, 15, 5, 1);
  fill(worldData, 42,13,  8, 4, 1); // India / SE Asia
  fill(worldData, 50,12,  5, 5, 1); // China / Far East
  fill(worldData, 55, 9,  2, 5, 2); // Japan (highland)
  fill(worldData, 48,18,  4, 2, 1); // Indonesia

  // ── Australia (x: 50–58) ────────────────────────────────────
  fill(worldData, 51,21,  7, 5, 1);
  fill(worldData, 52,25,  5, 2, 1);
  fill(worldData, 58,25,  2, 3, 2); // New Zealand

  // ── City lights ──────────────────────────────────────────────
  const cityCoords: [number, number][] = [
    [13, 8], [11, 9], [15, 8], [14,11],  // US East/West/Mid
    [17,18], [18,22], [16,21],           // Brazil, Argentina
    [31, 7], [33, 7], [35, 8],           // London, Paris, Berlin
    [31,14], [34,18], [33,25],           // Cairo, Lagos, Johannesburg
    [44,14], [46,13], [52,13], [54,11],  // Delhi, Mumbai, Shanghai, Tokyo
    [54,23], [55,24],                    // Sydney, Melbourne
  ];
  cityCoords.forEach(([cx2, cy2]) => {
    if (cy2 < WORLD_H) citiesData[cy2 * WORLD_W + cx2] = 1;
  });

  // ── Cloud clusters ────────────────────────────────────────────
  fill(cloudsData, 17, 6, 4, 1, 3); // North Atlantic
  fill(cloudsData, 16, 7, 5, 1, 3);
  fill(cloudsData,  2,15, 5, 1, 3); // Equatorial Pacific
  fill(cloudsData,  1,16, 4, 1, 3);
  fill(cloudsData, 41,18, 4, 1, 3); // Indian Ocean
  fill(cloudsData, 25,26, 6, 1, 3); // Southern Ocean
  fill(cloudsData, 50,27, 5, 1, 3);

  return { worldData, citiesData, cloudsData };
}

// ── Colour helpers ────────────────────────────────────────────
function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ── Solar ratio: 0.0 (midnight) → 1.0 (noon) ─────────────────
function getSolarRatio(): number {
  const now  = new Date();
  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  // Daytime 06:00 (360) → 18:00 (1080): sinusoidal bell curve
  if (mins >= 360 && mins <= 1080) {
    const progress = (mins - 360) / 720; // 0 → 1
    return Math.sin(progress * Math.PI);  // 0→1→0 (peaks at 12:00)
  }
  return 0; // nighttime
}

// ── Component ─────────────────────────────────────────────────
export interface PixelEarthAnimatedProps {
  /** CSS display size in px (canvas stays 32×32). Default: 200 */
  size?: number;
  /** Full rotation period in seconds. Default: 12 */
  loopSeconds?: number;
  /** Optional wrapper className */
  className?: string;
}

export function PixelEarthAnimated({
  size = 200,
  loopSeconds = 12,
  className = '',
}: PixelEarthAnimatedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Build world data once
    const { worldData, citiesData, cloudsData } = buildWorld();

    // Reduced-motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => { reducedMotion = e.matches; };
    mq.addEventListener('change', onMqChange);

    let rafId: number | null = null;
    let lastTime = performance.now();
    let rotAngle  = 0;
    let cloudOff  = 0;

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (!reducedMotion) {
        rotAngle  += (delta / loopSeconds) * Math.PI * 2;
        cloudOff  += (delta / (loopSeconds * 0.8)) * Math.PI * 2;
      }

      const dayRatio = getSolarRatio();

      // Dynamic palette
      const oceanColor  = lerpHex(OCEAN_NIGHT,  OCEAN_DAY,   dayRatio);
      const landColor   = lerpHex(LAND_NIGHT,   LAND_DAY,    dayRatio);
      const landHiColor = lerpHex(LANDHI_NIGHT, LANDHI_DAY,  dayRatio);
      const cloudColor  = lerpHex(CLOUD_NIGHT,  CLOUD_DAY,   dayRatio);
      const cityAlpha   = Math.max(0, 1.0 - dayRatio * 1.5);

      ctx.clearRect(0, 0, CANVAS, CANVAS);

      // ── Spherical orthographic projection ───────────────────
      for (let py = 0; py < CANVAS; py++) {
        const dy = py - CY;
        if (Math.abs(dy) > R) continue;

        const halfSpan = Math.sqrt(R * R - dy * dy);
        const minX = Math.floor(CX - halfSpan);
        const maxX = Math.ceil(CX + halfSpan);

        for (let px = minX; px <= maxX; px++) {
          const dx = px - CX;
          const distSq = dx * dx + dy * dy;
          if (distSq > R * R) continue;

          // Orthographic normal
          const nx = dx / R;
          const ny = dy / R;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

          // Lat/lon → equirectangular map coords
          const lat = Math.asin(ny);
          const lon = Math.atan2(nx, nz);

          const mapY = Math.min(WORLD_H - 1, Math.max(0,
            Math.floor(((lat + Math.PI / 2) / Math.PI) * WORLD_H),
          ));

          const rotLon  = ((lon + rotAngle)  % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const mapX    = Math.floor((rotLon / (Math.PI * 2)) * WORLD_W) % WORLD_W;

          const cloudLon = ((lon + cloudOff) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
          const cloudX   = Math.floor((cloudLon / (Math.PI * 2)) * WORLD_W) % WORLD_W;

          const landTile = worldData [mapY * WORLD_W + mapX];
          const isCity   = citiesData[mapY * WORLD_W + mapX];
          const isCloud  = cloudsData [mapY * WORLD_W + cloudX];

          // Pixel colour
          if (isCloud === 3 && distSq < (R - 0.5) * (R - 0.5)) {
            ctx.fillStyle = cloudColor;
          } else if (landTile === 1) {
            if (isCity === 1 && cityAlpha > 0.35) {
              ctx.fillStyle = CITY_COLOR;
            } else {
              ctx.fillStyle = landColor;
            }
          } else if (landTile === 2) {
            ctx.fillStyle = landHiColor;
          } else {
            ctx.fillStyle = oceanColor;
          }
          ctx.fillRect(px, py, 1, 1);

          // Atmospheric limb tint (no black — soft twilight rim)
          if (nz < 0.28) {
            ctx.fillStyle = dayRatio > 0.5
              ? 'rgba(220,240,255,0.28)'
              : 'rgba(80,110,220,0.35)';
            ctx.fillRect(px, py, 1, 1);
          }
        }
      }

      // ── 1-px stepped ink outline ────────────────────────────
      ctx.fillStyle = INK_RIM;
      for (let py = 0; py < CANVAS; py++) {
        const dy = py - CY;
        if (Math.abs(dy) > R + 1) continue;
        const hs  = Math.sqrt(Math.max(0, R * R - dy * dy));
        const lx  = Math.floor(CX - hs);
        const rx  = Math.ceil(CX + hs);
        if (lx >= 0)    ctx.fillRect(lx, py, 1, 1);
        if (rx < CANVAS) ctx.fillRect(rx, py, 1, 1);
      }
      for (let px = 0; px < CANVAS; px++) {
        const dx = px - CX;
        if (Math.abs(dx) > R + 1) continue;
        const hs  = Math.sqrt(Math.max(0, R * R - dx * dx));
        const ty  = Math.floor(CY - hs);
        const by  = Math.ceil(CY + hs);
        if (ty >= 0)     ctx.fillRect(px, ty, 1, 1);
        if (by < CANVAS) ctx.fillRect(px, by, 1, 1);
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    // Pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
      } else {
        lastTime = performance.now();
        if (rafId === null) rafId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      mq.removeEventListener('change', onMqChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loopSeconds]);

  return (
    <span
      className={className}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        width={CANVAS}
        height={CANVAS}
        style={{
          width:          `${size}px`,
          height:         `${size}px`,
          imageRendering: 'pixelated',
          display:        'block',
        }}
      />
    </span>
  );
}
