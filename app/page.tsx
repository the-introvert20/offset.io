'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  // Live What-If Simulator State on Landing Page
  const [driveKm, setDriveKm] = useState(240);
  const [tempDelta, setTempDelta] = useState(0);
  const [dietDays, setDietDays] = useState(3);

  // Rapid Calculator State
  const [calcMode, setCalcMode] = useState<'car' | 'ev' | 'transit' | 'active'>('car');
  const [calcDistance, setCalcDistance] = useState(240);
  const [calcDiet, setCalcDiet] = useState<'high_meat' | 'mixed' | 'vegetarian' | 'plant_based'>('mixed');

  // (The old decorative filter bar was removed — section links below do the navigating.)

  // Simulator math (illustrative example — signed-in calculation uses the factor database)
  const baseEmissionsTonnes = 4.82;
  const driveDiffKg = (driveKm - 240) * 52 * 0.192;
  const tempDiffKg = -(tempDelta * 120);
  const dietDiffKg = -(dietDays - 3) * 92;
  const totalDiffKg = driveDiffKg + tempDiffKg + dietDiffKg;
  const netTonnes = Math.max(1.8, +(baseEmissionsTonnes + totalDiffKg / 1000).toFixed(2));
  const netSavingsKg = -totalDiffKg;
  const percentReduction = (((baseEmissionsTonnes - netTonnes) / baseEmissionsTonnes) * 100);

  // Quick Calculator estimated annual tons (illustrative example factors)
  const transitFactors = { car: 0.192, ev: 0.053, transit: 0.089, active: 0.0 };
  const dietFactors = { high_meat: 2628, mixed: 2044, vegetarian: 1387, plant_based: 912 };
  const calcAnnualTonnes = +(
    ((calcDistance * 52 * transitFactors[calcMode]) + 1156 + dietFactors[calcDiet] + 385) / 1000
  ).toFixed(2);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* 1. Top status band */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-coral-accent animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            ISSUE 04 // 2026 BENCHMARK
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            EXAMPLE BENCHMARK: <span className="text-primary font-bold">under 2.30 t CO₂e / yr</span> · this page shows example numbers
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            ILLUSTRATIVE PREVIEW • CREATE AN ACCOUNT FOR PERSONAL RESULTS
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">sensors</span>
        </div>
      </section>

      {/* 2. HERO TWO-COLUMN BLOCK (Direct visual fidelity to Stitch reference) */}
      <section className="w-full border-b border-on-surface grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Bold Saturated Color Block */}
        <div className="lg:col-span-5 bg-secondary-container p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between text-on-secondary-container">
          <div className="space-y-space-md">
            <div className="inline-block border border-on-secondary-container bg-surface-container-lowest px-space-xs py-0.5 text-on-surface font-label-caps-sm text-label-caps-sm tracking-widest uppercase font-bold">
              PERSONAL CARBON INTELLIGENCE &amp; REDUCTION
            </div>
            <h1 className="font-display text-headline-xl lg:text-display-hero uppercase leading-[0.9] tracking-tighter text-on-surface">
              KNOW YOUR<br />CARBON<br />FOOTPRINT.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface font-normal pt-space-xs leading-relaxed max-w-lg">
              offset.io turns everyday travel, home energy, food, and shopping into a clear yearly estimate — then helps you try changes, build a plan, and track progress.
            </p>
          </div>

          <div className="pt-space-xl space-y-space-md">
            <div className="flex flex-col sm:flex-row items-stretch gap-0">
              <Link
                href="/auth/register"
                className="min-h-[44px] px-space-lg py-space-md bg-on-surface text-surface-container-lowest border border-on-surface font-label-caps-md text-label-caps-md uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-none flex items-center justify-center space-x-space-xs font-bold"
              >
                <span>Start my footprint — it&apos;s free</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
              </Link>
              <a
                href="#calculator"
                className="min-h-[44px] px-space-md py-space-md bg-surface-container-lowest text-on-surface border-t sm:border-t border-b sm:border-b-0 sm:border-r border-l border-on-surface font-label-caps-md text-label-caps-md uppercase tracking-wider hover:bg-surface-container-high transition-none flex items-center justify-center font-bold"
              >
                Try the example calculator
              </a>
            </div>
            <div className="pt-space-xs flex items-center space-x-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">verified</span>
              <span>Everything below is an example — your account uses your answers and sourced factors</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Graphic Artwork Frame */}
        <div className="lg:col-span-7 relative flex flex-col justify-between bg-surface-container-low min-h-[420px] lg:min-h-full">
          <div className="w-full h-full flex items-center justify-center p-space-md md:p-space-lg overflow-hidden bg-[#eaf4fa]">
            {/* SVG Editorial Art Plate */}
            <div className="w-full max-w-2xl bg-surface-container-lowest border border-on-surface p-space-md md:p-space-lg relative shadow-hard-offset-sm">
              <div className="flex items-center justify-between border-b border-on-surface pb-2 mb-4 font-label-caps-sm text-label-caps-sm uppercase font-bold">
                <span className="text-primary">SECTOR INTERPOLATION GRID</span>
                <span>ILLUSTRATIVE SECTOR VIEW</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 h-64 border border-on-surface bg-surface-container-low p-2">
                <div className="col-span-2 bg-[#00B2FE] border border-on-surface p-4 flex flex-col justify-between text-on-surface">
                  <span className="font-label-caps-sm uppercase font-bold">01 · Getting around (example)</span>
                  <div className="font-display text-4xl font-bold">2,506 <span className="text-sm font-normal">kg CO₂e</span></div>
                  <div className="text-xs uppercase font-label font-bold">Car + rail emissions</div>
                </div>
                <div className="col-span-1 bg-primary text-white border border-on-surface p-4 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold text-primary-fixed">02 · Home power</span>
                  <div className="font-display text-2xl font-bold">1,156 <span className="text-xs">kg</span></div>
                  <div className="text-xs uppercase font-label font-bold">Example units</div>
                </div>
                <div className="col-span-1 bg-coral-accent text-on-surface border border-on-surface p-3 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold">03 · Food</span>
                  <div className="font-display text-xl font-bold">772 <span className="text-xs">kg</span></div>
                </div>
                <div className="col-span-2 bg-yellow-accent text-on-surface border border-on-surface p-3 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold">04 · Shopping &amp; waste</span>
                  <div className="font-display text-xl font-bold">385 <span className="text-xs">kg</span></div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant">
                <span>Example mix of four everyday areas</span>
                <span className="text-primary font-bold">Example numbers</span>
              </div>
            </div>
          </div>

          <div className="w-full border-t border-on-surface bg-surface-container-lowest px-space-md py-space-xs flex items-center justify-between text-on-surface-variant font-label-caps-sm text-label-caps-sm uppercase">
            <span className="flex items-center space-x-space-xs">
              <span className="w-1.5 h-1.5 bg-primary rounded-none inline-block"></span>
              <span>PLATE 04 / URBAN INFRASTRUCTURE &amp; MOBILITY VECTORS</span>
            </span>
            <span className="text-on-surface font-bold">© offset.io Intelligence Lab</span>
          </div>
        </div>
      </section>

      {/* 3. SECTION SHORTCUTS — honest anchor navigation */}
      <nav aria-label="Page sections" className="w-full border-b border-on-surface bg-surface-container-lowest py-space-sm px-space-md md:px-space-lg">
        <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm border border-on-surface p-space-xs bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface px-space-xs font-bold">
            Explore this page:
          </span>
          <div className="flex flex-wrap items-center gap-space-xs">
            <a href="#what-if" className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-surface-container-lowest border border-on-surface font-label-caps-sm text-label-caps-sm uppercase text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none font-bold">
              Try changes
            </a>
            <a href="#calculator" className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-surface-container-lowest border border-on-surface font-label-caps-sm text-label-caps-sm uppercase text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none font-bold">
              Example calculator
            </a>
            <a href="#plan-preview" className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-surface-container-lowest border border-on-surface font-label-caps-sm text-label-caps-sm uppercase text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none font-bold">
              Reduction ideas
            </a>
            <a href="#diary-preview" className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-surface-container-lowest border border-on-surface font-label-caps-sm text-label-caps-sm uppercase text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none font-bold">
              Daily tracking
            </a>
          </div>
        </div>
      </nav>

      {/* 4. THE EDITORIAL DASHBOARD SPREAD */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
          {/* Box 1 (7 cols): Main Signal */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
                <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface font-bold tracking-wider">
                  Example footprint
                </span>
                <span className="px-space-xs py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps-sm text-label-caps-sm uppercase font-bold">
                  STATUS: ILLUSTRATIVE
                </span>
              </div>
              <div className="py-space-md">
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant mb-space-xs font-bold">
                  ESTIMATED ROLLING ANNUAL INTENSITY
                </div>
                <div className="flex flex-wrap items-baseline gap-space-sm">
                  <span className="font-display text-[clamp(3rem,12vw,6.875rem)] leading-none tracking-tighter text-on-surface font-bold">
                    4.82
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline text-headline-md uppercase text-on-surface font-bold">
                      t CO₂e / year
                    </span>
                    <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
                      METRIC TONS EQUIVALENT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md border-t border-on-surface flex flex-wrap items-center justify-between gap-space-sm">
              <div className="inline-flex items-center space-x-space-xs px-space-sm py-space-xs bg-surface-container border border-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">trending_down</span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                  Example: below a typical average
                </span>
              </div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Example gap to 2.3 t benchmark: +2.52 t
              </span>
            </div>
          </div>

          {/* Box 2 (5 cols): Example highlight */}
          <div className="lg:col-span-5 bg-coral-accent text-on-surface p-space-lg md:p-space-xl flex flex-col justify-between border-b lg:border-b-0">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                  Example idea
                </span>
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">crisis_alert</span>
              </div>
              <div className="pt-space-md">
                <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
                  Biggest slice in this example: travel
                </span>
                <h2 className="font-headline text-headline-xl uppercase font-bold leading-none tracking-tight mt-1">
                  TRANSPORTATION
                </h2>
              </div>
              <div className="py-space-sm flex items-baseline space-x-space-xs">
                <span className="font-display text-[clamp(2.5rem,8vw,3.5rem)] font-bold text-on-surface leading-none">−180</span>
                <span className="font-headline text-headline-sm uppercase text-surface-container-lowest font-bold">
                  kg CO₂e / month
                </span>
              </div>
              <p className="font-body-md text-body-md leading-snug">
                Example: switching two weekly drives to the train saves roughly this much in the example above.
              </p>
            </div>

            <div className="pt-space-lg">
              <Link
                href="/auth/register"
                className="min-h-[44px] w-full py-space-sm px-space-md bg-surface-container-lowest text-on-surface border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between"
              >
                <span>Get suggestions for my life</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add_circle</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5. THE CARBON PULSE */}
        <div className="w-full p-space-lg md:p-space-xl border-b border-on-surface bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg border-b border-on-surface pb-space-sm gap-space-sm">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
                SPECTRAL EMISSIONS MATRIX
              </div>
              <h2 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
                THE CARBON PULSE
              </h2>
            </div>
            <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant flex items-center space-x-space-md font-bold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-cyan-accent inline-block border border-on-surface"></span>
                <span>Transit (52%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-primary inline-block border border-on-surface"></span>
                <span>Energy (24%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-coral-accent inline-block border border-on-surface"></span>
                <span>Diet (16%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-yellow-accent inline-block border border-on-surface"></span>
                <span>Goods (8%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-on-surface">
            {/* Left: SVG Rings */}
            <div className="lg:col-span-6 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col items-center justify-center relative min-h-[340px]">
              <svg className="w-full max-w-[320px] h-auto text-on-surface" fill="none" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg">
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="340" y1="170" y2="170"></line>
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="170" x2="170" y1="0" y2="340"></line>
                <circle cx="170" cy="170" fill="none" r="50" stroke="#001fce" strokeDasharray="4 4" strokeWidth="2"></circle>
                <text fill="#001fce" fontFamily="'Space Grotesk', sans-serif" fontSize="8" fontWeight="700" x="175" y="116">
                  EXAMPLE 2.30t BENCHMARK
                </text>
                <circle cx="170" cy="170" fill="none" r="85" stroke="#1c1b1b" strokeWidth="1"></circle>
                <circle cx="170" cy="170" fill="none" r="120" stroke="#1c1b1b" strokeWidth="1"></circle>
                <circle cx="170" cy="170" fill="none" r="155" stroke="#1c1b1b" strokeDasharray="3 3" strokeWidth="1"></circle>
                <path d="M 170,30 A 140,140 0 0,1 306.8,200.7" fill="none" stroke="#00B2FE" strokeWidth="12"></path>
                <path d="M 306.8,200.7 A 140,140 0 0,1 199.1,306.9" fill="none" stroke="#001fce" strokeWidth="12"></path>
                <path d="M 199.1,306.9 A 140,140 0 0,1 78.4,275.6" fill="none" stroke="#FF5938" strokeWidth="12"></path>
                <path d="M 78.4,275.6 A 140,140 0 0,1 42.6,227.8" fill="none" stroke="#FFDE38" strokeWidth="12"></path>
                <circle cx="170" cy="170" fill="#1c1b1b" r="14"></circle>
                <circle cx="170" cy="170" fill="#ffffff" r="5"></circle>
                <text fill="#ffffff" fontFamily="'Space Grotesk', sans-serif" fontSize="9" fontWeight="700" textAnchor="middle" x="170" y="173">
                  OFT
                </text>
              </svg>
              <div className="absolute bottom-space-sm left-space-sm font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Example chart · your account shows your real mix
              </div>
            </div>

            {/* Right: Bar breakdown */}
            <div className="lg:col-span-6 p-space-lg flex flex-col justify-between bg-surface-container-lowest">
              <div className="space-y-space-md">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-cyan-accent border border-on-surface inline-block"></span>
                      <span>01 // MOBILITY &amp; COMMUTE</span>
                    </span>
                    <span>2,506 kg CO₂e (52.0%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-cyan-accent border-r border-on-surface" style={{ width: '52%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-primary border border-on-surface inline-block"></span>
                      <span>02 // RESIDENTIAL &amp; HEATING</span>
                    </span>
                    <span>1,156 kg CO₂e (24.0%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-primary border-r border-on-surface" style={{ width: '24%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-coral-accent border border-on-surface inline-block"></span>
                      <span>03 // FOOD SYSTEMS &amp; NUTRITION</span>
                    </span>
                    <span>772 kg CO₂e (16.0%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-coral-accent border-r border-on-surface" style={{ width: '16%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-yellow-accent border border-on-surface inline-block"></span>
                      <span>04 // GOODS &amp; CONSUMPTION</span>
                    </span>
                    <span>385 kg CO₂e (8.0%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-yellow-accent border-r border-on-surface" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                <span>Example total: 4,819 kg CO₂e</span>
                <a href="#calculator" className="text-primary hover:underline">
                  Try the example calculator →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 4-COLUMN SECTOR GRID */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-space-lg border-b lg:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-cyan-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 01</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">TRANSPORTATION</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">2,506</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • 52.0% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Dominant parameter: 380 km weekly highway commute via petrol vehicle. Air travel: 1 short-haul return trip.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">Example saving: −45%</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">directions_subway</span>
            </div>
          </div>

          <div className="p-space-lg border-b lg:border-b-0 md:border-r lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-primary mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 02</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">ENERGY &amp; UTILITIES</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">1,156</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • 24.0% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Grid blend: 64% clean source. Residential heating baseline: natural gas hydronic loop with standard thermal envelope.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">Example saving: −28%</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bolt</span>
            </div>
          </div>

          <div className="p-space-lg border-b md:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-coral-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 03</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">FOOD &amp; DIET</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">772</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • 16.0% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Ruminant animal protein logged 3x/week. Regional dairy consumption accounts for 38% of food-related Scope 3 emissions.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">Example saving: −19%</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">restaurant</span>
            </div>
          </div>

          <div className="p-space-lg bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-yellow-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 04</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">GOODS &amp; SERVICES</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">385</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • 8.0% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Amortized consumer electronics, apparel lifecycle cycles, and cloud SaaS infrastructure allocation.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">Example saving: −12%</span>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">inventory_2</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Interactive "what if" example */}
      <section className="w-full border-b border-on-surface bg-surface-container-low" id="what-if">
        <div className="p-space-lg md:p-space-xl border-b border-on-surface bg-surface-container-lowest">
          <div className="max-w-4xl">
            <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
              Interactive example
            </span>
            <h2 className="font-headline text-headline-xl uppercase text-on-surface font-bold tracking-tight mt-1">
              What if you changed something?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs leading-relaxed">
              Move the sliders to see how small changes move an example footprint. Your free account does the same math with your real answers.
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-12">
          {/* Sliders (5 cols) */}
          <div className="lg:col-span-5 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest space-y-space-lg">
            {/* Slider 1 */}
            <div className="space-y-space-xs border border-on-surface p-space-md bg-surface-container-low">
              <div className="flex items-center justify-between">
                <label className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface" htmlFor="sliderDrive">
                  WEEKLY DRIVING DISTANCE
                </label>
                <span className="font-headline text-headline-sm font-bold text-primary">
                  {driveKm} km
                </span>
              </div>
              <input
                id="sliderDrive"
                type="range"
                min="0"
                max="500"
                step="10"
                value={driveKm}
                onChange={(e) => setDriveKm(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest rounded-none"
              />
              <div className="flex justify-between font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase pt-1 font-bold">
                <span>0 km (Full Transit)</span>
                <span>Baseline (240 km)</span>
                <span>500 km</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-space-xs border border-on-surface p-space-md bg-surface-container-low">
              <div className="flex items-center justify-between">
                <label className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface" htmlFor="sliderTemp">
                  HOME THERMOSTAT DELTA
                </label>
                <span className="font-headline text-headline-sm font-bold text-secondary">
                  {tempDelta >= 0 ? `+${tempDelta.toFixed(1)}` : tempDelta.toFixed(1)} °C
                </span>
              </div>
              <input
                id="sliderTemp"
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={tempDelta}
                onChange={(e) => setTempDelta(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest rounded-none"
              />
              <div className="flex justify-between font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase pt-1 font-bold">
                <span>−3.0°C (Winter Eco)</span>
                <span>0.0° (Neutral)</span>
                <span>+3.0°C (Summer Eco)</span>
              </div>
            </div>

            {/* Slider 3 */}
            <div className="space-y-space-xs border border-on-surface p-space-md bg-surface-container-low">
              <div className="flex items-center justify-between">
                <label className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface" htmlFor="sliderDiet">
                  Plant-based days / week
                </label>
                <span className="font-headline text-headline-sm font-bold text-primary">
                  {dietDays} days
                </span>
              </div>
              <input
                id="sliderDiet"
                type="range"
                min="0"
                max="7"
                step="1"
                value={dietDays}
                onChange={(e) => setDietDays(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest rounded-none"
              />
              <div className="flex justify-between font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase pt-1 font-bold">
                <span>0 days</span>
                <span>Current (3)</span>
                <span>7 days (100% Plant)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDriveKm(240);
                setTempDelta(0);
                setDietDays(3);
              }}
              className="min-h-[44px] w-full py-space-xs bg-surface-container border border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              Reset example
            </button>
          </div>

          {/* Dynamic Trajectory Results (7 cols) */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-lg">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  Example result
                </span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase bg-cyan-accent text-on-surface font-bold px-space-xs py-0.5 border border-on-surface">
                  Updates live
                </span>
              </div>

              {/* Display Result Box */}
              <div className="p-space-lg bg-surface-container-low border border-on-surface mb-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                    Example yearly total
                  </div>
                  <div className="flex items-baseline space-x-space-xs">
                    <span className="font-display text-[clamp(2.75rem,8vw,4rem)] font-bold leading-none text-on-surface">
                      {netTonnes.toFixed(2)}
                    </span>
                    <span className="font-headline text-headline-md uppercase font-bold text-on-surface">
                      t CO₂e
                    </span>
                  </div>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-on-surface pt-space-sm sm:pt-0 sm:pl-space-lg space-y-1">
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                    Difference vs example start
                  </div>
                  <div className={`font-headline text-headline-lg font-bold leading-none ${netSavingsKg >= 0 ? 'text-primary' : 'text-error'}`}>
                    {netSavingsKg >= 0 ? `−${Math.round(netSavingsKg)} kg / yr` : `+${Math.round(-netSavingsKg)} kg / yr`}
                  </div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                    {netSavingsKg >= 0 ? `${Math.abs(percentReduction).toFixed(1)}% REDUCTION` : `+${Math.abs(percentReduction).toFixed(1)}% INCREASE`}
                  </div>
                </div>
              </div>

              {/* Fixed example comparisons */}
              <div className="space-y-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold">
                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32">Example start</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-on-surface relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface"></div>
                    </div>
                  </div>
                  <span className="font-headline text-headline-sm text-on-surface font-bold">4.82 t</span>
                </div>

                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32 text-secondary">Drive half as much</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-secondary-container relative">
                      <div className="absolute right-[22%] top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-accent border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="text-secondary font-bold">4.31 t (−10.5%)</span>
                </div>

                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32 text-primary">Bus + greener eating</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-primary-fixed relative">
                      <div className="absolute right-[36%] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="text-primary font-bold">3.96 t (−17.8%)</span>
                </div>

                <div className="p-space-sm bg-yellow-accent border border-on-surface flex items-center justify-between text-on-surface">
                  <span className="w-32">Ambitious example</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-on-surface relative">
                      <div className="absolute right-[48%] top-1/2 -translate-y-1/2 w-3 h-3 bg-coral-accent border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="font-bold">3.71 t (−23.0%)</span>
                </div>
              </div>
            </div>

          <div className="mt-space-lg pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase">
            <span>Example only — your account uses sourced factors for your region</span>
            <Link href="/auth/register" className="min-h-[44px] inline-flex items-center text-on-surface font-bold hover:underline">
              Get my real numbers →
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* 8. EXAMPLE CALCULATOR IN 3 STEPS */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest p-space-lg md:p-space-xl" id="calculator">
        <div className="flex flex-col md:flex-row md:items-end justify-between max-w-7xl mb-space-lg border-b border-on-surface pb-space-sm gap-4">
          <div>
            <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
              Example · no account needed
            </span>
            <h2 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
              Try a 3-step example
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Play with travel and food to see how the math works. Your account uses your real answers and region-specific factors.
            </p>
          </div>
          <div className="p-space-sm bg-surface-container border border-on-surface text-right">
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant block font-bold">
              INSTANT ESTIMATE
            </span>
            <span className="font-display text-3xl font-bold text-primary">
              {calcAnnualTonnes} <span className="text-sm font-headline">t CO₂e/yr</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 border border-on-surface">
          {/* STEP 01 */}
          <div className="p-space-md border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary mb-space-xs">
                Step 1 · How you get around
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                How you get around
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { mode: 'car' as const, label: 'Petrol car' },
                  { mode: 'ev' as const, label: 'Electric car' },
                  { mode: 'transit' as const, label: 'Bus / train' },
                  { mode: 'active' as const, label: 'Bike / walking' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setCalcMode(item.mode)}
                    className={`p-space-sm border border-on-surface text-left font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center justify-between transition-none ${
                      calcMode === item.mode
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{item.label}</span>
                    {calcMode === item.mode && <span className="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-space-md font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
              FACTOR: {transitFactors[calcMode].toFixed(3)} kg CO₂e/km
            </div>
          </div>

          {/* STEP 02 */}
          <div className="p-space-md border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary mb-space-xs">
                Step 2 · Weekly distance
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                Weekly distance
              </div>
              <div className="border border-on-surface p-space-sm bg-surface-container-low mb-space-sm">
                <label className="block font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant mb-1 font-bold" htmlFor="customDistance">
                  ENTER WEEKLY COMMUTE
                </label>
                <div className="flex items-center">
                  <input
                    id="customDistance"
                    type="number"
                    min="0"
                    max="2000"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-on-surface px-space-sm py-1 font-headline text-headline-md font-bold text-on-surface focus:outline-none"
                  />
                  <span className="px-space-sm font-label-caps-md text-label-caps-md uppercase text-on-surface font-bold">
                    KM
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[80, 240, 500].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setCalcDistance(km)}
                    className={`p-1 border border-on-surface text-center font-label-caps-sm text-label-caps-sm uppercase font-bold ${
                      calcDistance === km ? 'bg-surface-container' : 'hover:bg-surface-container-high'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-space-md font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
              ILLUSTRATIVE ROAD-TRAVEL INPUT
            </div>
          </div>

          {/* STEP 03 */}
          <div className="p-space-md bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary mb-space-xs">
                Step 3 · Food
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                Eating habits
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { diet: 'high_meat' as const, label: 'HIGH-MEAT DIET' },
                  { diet: 'mixed' as const, label: 'MIXED DIET' },
                  { diet: 'vegetarian' as const, label: 'VEGETARIAN (DAIRY / EGGS)' },
                  { diet: 'plant_based' as const, label: 'PLANT-BASED' },
                ].map((item) => (
                  <button
                    key={item.diet}
                    type="button"
                    onClick={() => setCalcDiet(item.diet)}
                    className={`p-space-sm border border-on-surface text-left font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center justify-between transition-none ${
                      calcDiet === item.diet
                        ? 'bg-on-surface text-surface-container-lowest'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{item.label}</span>
                    {calcDiet === item.diet && <span className="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-space-md font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
              POORE &amp; NEMECEK (SCIENCE) 2018
            </div>
          </div>
        </div>

        <div className="mt-space-md flex flex-col sm:flex-row items-center justify-between gap-4 p-space-md bg-surface-container border border-on-surface">
          <span className="font-body-md text-body-md font-medium">
            Like this example? Create a free account and we&apos;ll build the same estimate from your real life.
          </span>
          <Link
            href="/auth/register"
            className="min-h-[44px] inline-flex items-center px-space-lg py-space-sm bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface hover:text-white whitespace-nowrap"
          >
            Create a free account →
          </Link>
        </div>
      </section>

      {/* 9. EXAMPLE REDUCTION IDEAS */}
      <section className="w-full border-b border-on-surface grid grid-cols-1 lg:grid-cols-12" id="plan-preview">
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <div>
                <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
                  Example ideas
                </span>
                <h3 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
                  Small changes, real savings.
                </h3>
              </div>
              <div className="px-space-sm py-space-xs bg-coral-accent text-on-surface font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface">
                Example
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              The kind of ranked suggestions your account builds from your own numbers:
            </p>

            <div className="space-y-space-xs">
              <div className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center space-x-space-sm">
                  <span className="w-8 h-8 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-caps-sm font-bold">01</span>
                  <div>
                    <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">DRIVE LESS (2 DAYS TRANSIT)</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Switch Tuesday &amp; Thursday commutes to rail line S-7</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-space-xs py-0.5 bg-cyan-accent text-on-surface font-label-caps-sm uppercase font-bold border border-on-surface">−8.0%</span>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface mt-1">385 kg CO₂e</div>
                </div>
              </div>

              <div className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center space-x-space-sm">
                  <span className="w-8 h-8 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-caps-sm font-bold">02</span>
                  <div>
                    <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">ELECTRIC APPLIANCE AUDIT</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Shift heat-pump cycle to off-peak wind production hours</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-space-xs py-0.5 bg-primary-fixed text-on-primary font-label-caps-sm uppercase font-bold border border-on-surface">−5.0%</span>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface mt-1">241 kg CO₂e</div>
                </div>
              </div>

              <div className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center space-x-space-sm">
                  <span className="w-8 h-8 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-caps-sm font-bold">03</span>
                  <div>
                    <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">THERMOSTAT OPTIMIZATION</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Lower baseline radiator setpoint by 1.2°C at night</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-space-xs py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps-sm uppercase font-bold border border-on-surface">−4.0%</span>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface mt-1">192 kg CO₂e</div>
                </div>
              </div>

              <div className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center space-x-space-sm">
                  <span className="w-8 h-8 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-caps-sm font-bold">04</span>
                  <div>
                    <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">DIETARY SHIFT (PLANT-FORWARD)</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">Substitute red ruminant meats with local legumes on weekdays</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-space-xs py-0.5 bg-yellow-accent text-on-surface font-label-caps-sm uppercase font-bold border border-on-surface">−3.0%</span>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface mt-1">144 kg CO₂e</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-lg">
            <Link
              href="/auth/register"
              className="min-h-[44px] w-full py-space-sm px-space-md bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-primary transition-none flex items-center justify-center"
            >
              Get ideas for my life →
            </Link>
          </div>
        </div>

        {/* 2026 CALENDAR BUDGET AUDIT */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                2026 CALENDAR BUDGET AUDIT
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                DAY 84 OF 365
              </span>
            </div>

            <div className="py-space-md">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Example yearly goal
              </span>
              <div className="flex items-baseline space-x-space-sm">
                <span className="font-display text-[clamp(2.75rem,9vw,4.5rem)] font-bold text-on-surface leading-none">
                  4,000
                </span>
                <span className="font-headline text-headline-sm uppercase font-bold text-on-surface">
                  kg CO₂e CAP
                </span>
              </div>
            </div>

            {/* Segmented Heavy Bar Visual */}
            <div className="space-y-space-xs my-space-md">
              <div className="w-full h-10 border border-on-surface flex">
                <div className="h-full bg-on-surface flex items-center justify-center text-surface-container-lowest font-label-caps-sm text-label-caps-sm font-bold" style={{ width: '71%' }}>
                  2,840 kg USED (71%)
                </div>
                <div className="h-full bg-yellow-accent flex items-center justify-center text-on-surface font-label-caps-sm text-label-caps-sm font-bold" style={{ width: '29%' }}>
                  1,160 kg LEFT
                </div>
              </div>
              <div className="flex justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>0 kg</span>
                <span className="text-on-surface font-bold">2,840 kg EXPENDED</span>
                <span>4,000 kg LIMIT</span>
              </div>
            </div>

            {/* Forecast Card */}
            <div className="p-space-md border border-on-surface bg-surface-container-low mt-space-lg space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  What this example shows
                </span>
                <span className="px-space-xs py-0.5 bg-primary text-on-primary font-label-caps-sm text-label-caps-sm uppercase font-bold">
                  ON TRACK
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                This preview uses illustrative values only. Your authenticated dashboard calculates estimates from your saved activities, selected region, and the matched emission-factor metadata.
              </p>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
            <span>Example only — your goal is yours to set</span>
            <span className="text-on-surface font-bold">Updated when you log</span>
          </div>
        </div>
      </section>

      {/* 10. EXAMPLE DIARY & INSIGHTS */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface" id="diary-preview">
        {/* Example diary */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Example daily log
            </span>
            <Link href="/auth/register" className="min-h-[44px] inline-flex items-center font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
              Start logging →
            </Link>
          </div>

          <div className="divide-y divide-on-surface border border-on-surface font-label-caps-sm text-label-caps-sm uppercase">
            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center space-x-space-sm">
                <span className="font-bold text-on-surface-variant w-14">09:20</span>
                <span className="px-space-xs py-0.5 bg-surface-container border border-on-surface font-bold">TRANSPORT</span>
                <span className="font-bold text-on-surface">COMBUSTION CAR (12 km commute)</span>
              </div>
              <div className="font-bold text-error">+2.52 kg CO₂e</div>
            </div>

            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center space-x-space-sm">
                <span className="font-bold text-on-surface-variant w-14">12:40</span>
                <span className="px-space-xs py-0.5 bg-surface-container border border-on-surface font-bold">TRANSIT</span>
                <span className="font-bold text-on-surface">METRO SYSTEM (6 km crosstown)</span>
              </div>
              <div className="font-bold text-primary">+0.48 kg CO₂e</div>
            </div>

            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center space-x-space-sm">
                <span className="font-bold text-on-surface-variant w-14">18:10</span>
                <span className="px-space-xs py-0.5 bg-surface-container border border-on-surface font-bold">ENERGY</span>
                <span className="font-bold text-on-surface">RESIDENTIAL GRID (4.2 kWh meter read)</span>
              </div>
              <div className="font-bold text-on-surface">+1.81 kg CO₂e</div>
            </div>

            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center space-x-space-sm">
                <span className="font-bold text-on-surface-variant w-14">21:00</span>
                <span className="px-space-xs py-0.5 bg-surface-container border border-on-surface font-bold">FOOD</span>
                <span className="font-bold text-on-surface">LOCAL GRAIN &amp; VEGETABLE BOWL</span>
              </div>
              <div className="font-bold text-secondary">+0.32 kg CO₂e</div>
            </div>
          </div>

          <div className="mt-space-md border border-on-surface p-space-md bg-surface-container-low flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              In your account this becomes a real daily log with estimates for everything you enter.
            </p>
            <Link
              href="/auth/register"
              className="min-h-[44px] px-space-md py-1 bg-on-surface text-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase font-bold border-l border-on-surface hover:bg-primary transition-none whitespace-nowrap inline-flex items-center justify-center"
            >
              Start my log
            </Link>
          </div>
        </div>

        {/* Editorial Insights */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Example insights
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Illustrative
              </span>
            </div>

            <blockquote className="p-space-md bg-surface-container border-l-4 border-on-surface mb-space-lg">
              <p className="font-headline text-headline-md uppercase text-on-surface font-bold leading-tight">
                &ldquo;An example weekly note: driving less for two weeks in a row would show up here.&rdquo;
              </p>
              <cite className="block mt-space-sm font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant not-italic font-bold">
                — the kind of note your account generates from your log
              </cite>
            </blockquote>

            <div className="space-y-space-xs">
              <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                How sure are the estimates?
              </div>
              <div className="border border-on-surface p-space-sm bg-surface-container-lowest flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase">
                <span className="font-bold">Example confidence</span>
                <span className="px-space-xs py-0.5 bg-primary text-on-primary font-bold">
                  Medium-high (range shown with every result)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 font-label-caps-sm text-label-caps-sm uppercase">
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">Electricity</div>
                  <div className="font-bold text-primary mt-0.5">Higher · bill-based</div>
                </div>
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">Transport</div>
                  <div className="font-bold text-primary mt-0.5">Higher · distance-based</div>
                </div>
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">Food / goods</div>
                  <div className="font-bold text-on-surface mt-0.5">Medium · pattern-based</div>
                </div>
              </div>
            </div>

            <div className="mt-space-md p-space-sm border border-on-surface bg-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-mono">
              <div className="text-on-surface font-bold mb-1">How the math works:</div>
              <code>your amount × published factor = estimated emissions</code>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
            <span>Every result links its sources after sign-in</span>
            <Link href="/auth/register" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
              See my real insights →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
