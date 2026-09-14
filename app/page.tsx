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
  const [calcDiet, setCalcDiet] = useState<'omnivore' | 'pescatarian' | 'vegetarian' | 'vegan'>('omnivore');

  // Filter Bar State
  const [filterSector, setFilterSector] = useState('all');
  const [filterFreq, setFilterFreq] = useState('annual');
  const [filterScope, setFilterScope] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulator math
  const baseEmissionsTonnes = 4.82;
  const driveDiffKg = (driveKm - 240) * 52 * 0.210;
  const tempDiffKg = -(tempDelta * 120);
  const dietDiffKg = -(dietDays - 3) * 92;
  const totalDiffKg = driveDiffKg + tempDiffKg + dietDiffKg;
  const netTonnes = Math.max(1.8, +(baseEmissionsTonnes + totalDiffKg / 1000).toFixed(2));
  const netSavingsKg = -totalDiffKg;
  const percentReduction = (((baseEmissionsTonnes - netTonnes) / baseEmissionsTonnes) * 100);

  // Quick Calculator estimated annual tons
  const transitFactors = { car: 0.210, ev: 0.065, transit: 0.040, active: 0.0 };
  const dietFactors = { omnivore: 2200, pescatarian: 1600, vegetarian: 1200, vegan: 800 };
  const calcAnnualTonnes = +(
    ((calcDistance * 52 * transitFactors[calcMode]) + 1156 + dietFactors[calcDiet] + 385) / 1000
  ).toFixed(2);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* 1. STRICT SWISS MECHANICAL HEADER BAND (TICKER) */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-coral-accent animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            ISSUE 04 // 2026 BENCHMARK
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            GLOBAL PERSONAL TARGET CEILING: <span className="text-primary font-bold">&lt; 2.30 t CO₂e / YR</span> • 1.5°C CLIMATE BUDGET
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            ILLUSTRATIVE PREVIEW • CREATE AN ACCOUNT FOR PERSONAL RESULTS
          </span>
          <span className="material-symbols-outlined text-[16px]">sensors</span>
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
              YOUR<br />CARBON<br />HAS A<br />
              <span className="text-surface-container-lowest underline decoration-4 decoration-on-surface">SIGNAL.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface font-normal pt-space-xs leading-relaxed max-w-lg">
              offset.io transforms everyday movement, residential energy, dietary choices, and supply consumption into an empirical, living baseline. Measure real signals. Decarbonize deterministic trajectories.
            </p>
          </div>

          <div className="pt-space-xl space-y-space-md">
            <div className="flex flex-col sm:flex-row items-stretch gap-0">
              <Link
                href="/calculate"
                className="px-space-lg py-space-md bg-on-surface text-surface-container-lowest border border-on-surface font-label-caps-md text-label-caps-md uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-none flex items-center justify-center space-x-space-xs font-bold"
              >
                <span>CALCULATE MY FOOTPRINT</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                href="/simulator"
                className="px-space-md py-space-md bg-surface-container-lowest text-on-surface border-t sm:border-t border-b sm:border-b-0 sm:border-r border-l border-on-surface font-label-caps-md text-label-caps-md uppercase tracking-wider hover:bg-surface-container-high transition-none flex items-center justify-center font-bold"
              >
                EXPLORE SCENARIOS
              </Link>
            </div>
            <div className="pt-space-xs flex items-center space-x-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>ILLUSTRATIVE EXAMPLE — PERSONAL RESULTS USE YOUR SAVED ACTIVITIES AND FACTORS</span>
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
                  <span className="font-label-caps-sm uppercase font-bold text-white">01 // TRANSIT VECTOR</span>
                  <div className="font-display text-4xl font-bold">2,506 <span className="text-sm font-normal">kg CO₂e</span></div>
                  <div className="text-xs uppercase font-label font-bold text-white/90">HIGHWAY + RAIL EMISSIONS</div>
                </div>
                <div className="col-span-1 bg-primary text-white border border-on-surface p-4 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold text-primary-fixed">02 // GRID</span>
                  <div className="font-display text-2xl font-bold">1,156 <span className="text-xs">kg</span></div>
                  <div className="text-[10px] uppercase font-label">KWH LOAD</div>
                </div>
                <div className="col-span-1 bg-coral-accent text-white border border-on-surface p-3 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold">03 // DIET</span>
                  <div className="font-display text-xl font-bold">772 <span className="text-xs">kg</span></div>
                </div>
                <div className="col-span-2 bg-yellow-accent text-on-surface border border-on-surface p-3 flex flex-col justify-between">
                  <span className="font-label-caps-sm uppercase font-bold">04 // GOODS &amp; LIFE-CYCLE</span>
                  <div className="font-display text-xl font-bold">385 <span className="text-xs">kg</span></div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant">
                <span>GEO: 52°31&apos;N 13°24&apos;E</span>
                <span className="text-primary font-bold">ILLUSTRATIVE EMISSION MODEL</span>
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

      {/* 3. FILTER & LOCATOR INTERACTION BAR */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest py-space-sm px-space-md md:px-space-lg">
        <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center gap-space-sm border border-on-surface p-space-xs bg-surface-container-lowest">
          {/* Search Box */}
          <div className="flex items-stretch flex-1 border border-on-surface">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH SECTOR, ACTIVITY, COMMUTER CORRIDOR, FLIGHT..."
              className="w-full px-space-md py-space-xs text-body-sm font-body bg-surface-container-lowest text-on-surface focus:outline-none placeholder:text-outline uppercase"
            />
            <button
              type="button"
              className="px-space-md bg-surface-container-high border-l border-on-surface flex items-center justify-center text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>

          {/* Controls group */}
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface px-space-xs font-bold">
              FILTER:
            </span>

            {/* Region Dropdown */}
            <div className="relative border border-on-surface bg-surface-container-lowest flex items-center">
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="appearance-none bg-transparent pl-space-sm pr-space-lg py-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface focus:outline-none cursor-pointer font-bold"
              >
                <option value="all">Region: Global Median</option>
                <option value="na">Region: North America (US/CA)</option>
                <option value="eu">Region: Western Europe (EU-27)</option>
                <option value="apac">Region: Asia Pacific Metro</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 text-[16px]">unfold_more</span>
            </div>

            {/* Frequency Dropdown */}
            <div className="relative border border-on-surface bg-surface-container-lowest flex items-center">
              <select
                value={filterFreq}
                onChange={(e) => setFilterFreq(e.target.value)}
                className="appearance-none bg-transparent pl-space-sm pr-space-lg py-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface focus:outline-none cursor-pointer font-bold"
              >
                <option value="annual">Interval: Annual Rolling (2026)</option>
                <option value="monthly">Interval: Monthly Aggregate</option>
                <option value="weekly">Interval: Weekly Horizon</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 text-[16px]">unfold_more</span>
            </div>

            {/* Scope Dropdown */}
            <div className="relative border border-on-surface bg-surface-container-lowest flex items-center">
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="appearance-none bg-transparent pl-space-sm pr-space-lg py-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface focus:outline-none cursor-pointer font-bold"
              >
                <option value="all">Scopes: All (Scope 1, 2, 3)</option>
                <option value="scope1">Direct: Scope 1 (Combustion)</option>
                <option value="scope2">Purchased: Scope 2 (Grid)</option>
                <option value="scope3">Upstream: Scope 3 (Supply Chain)</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1 text-[16px]">unfold_more</span>
            </div>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterSector('all');
                setFilterFreq('annual');
                setFilterScope('all');
              }}
              className="px-space-md py-space-xs bg-surface-container border border-on-surface font-label-caps-sm text-label-caps-sm uppercase text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none font-bold"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* 4. THE EDITORIAL DASHBOARD SPREAD */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
          {/* Box 1 (7 cols): Main Signal */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
                <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface font-bold tracking-wider">
                  YOUR CURRENT SIGNAL • SERIAL #OFT-2026-901
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
                  <span className="font-display text-[80px] md:text-[110px] leading-none tracking-tighter text-on-surface font-bold">
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
                <span className="material-symbols-outlined text-primary text-[18px]">trending_down</span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                  vs 8.40 t Regional Average (−42.6%)
                </span>
              </div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                ILLUSTRATIVE TARGET GAP: +2.52 t
              </span>
            </div>
          </div>

          {/* Box 2 (5 cols): Flame Coral Priority Lever */}
          <div className="lg:col-span-5 bg-coral-accent text-on-surface p-space-lg md:p-space-xl flex flex-col justify-between border-b lg:border-b-0">
            <div className="space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                  CRITICAL PRIORITY
                </span>
                <span className="material-symbols-outlined text-[24px] text-surface-container-lowest">crisis_alert</span>
              </div>
              <div className="pt-space-md">
                <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-surface-container-lowest font-bold">
                  PRIMARY ABATEMENT OPPORTUNITY
                </span>
                <h2 className="font-headline text-headline-xl uppercase text-surface-container-lowest font-bold leading-none tracking-tight mt-1">
                  TRANSPORTATION
                </h2>
              </div>
              <div className="py-space-sm flex items-baseline space-x-space-xs">
                <span className="font-display text-[56px] font-bold text-surface-container-lowest leading-none">−180</span>
                <span className="font-headline text-headline-sm uppercase text-surface-container-lowest font-bold">
                  kg CO₂e / month
                </span>
              </div>
              <p className="font-body-md text-body-md text-surface-container-lowest leading-snug">
                Immediate actionable switch: Transfer 2 weekly office commutes from single-occupancy combustion vehicle to regional rapid transit network.
              </p>
            </div>

            <div className="pt-space-lg">
              <Link
                href="/reduction-plan"
                className="w-full py-space-sm px-space-md bg-surface-container-lowest text-on-surface border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between"
              >
                <span>COMMIT COMMUTE SWITCH</span>
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
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
                  PARIS 2.30t BUDGET BOUNDARY
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
                COORDINATE: 52°31&apos;N 13°24&apos;E • ISO 14064-1
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
                <span>SUM TOTAL: 4,819 kg CO₂e</span>
                <Link href="/insights" className="text-primary hover:underline">
                  EXPLORE DEFRA EMISSION FACTORS →
                </Link>
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
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">ABATEMENT: −45%</span>
              <span className="material-symbols-outlined text-[18px]">directions_subway</span>
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
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">ABATEMENT: −28%</span>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
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
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">ABATEMENT: −19%</span>
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
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
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold">ABATEMENT: −12%</span>
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. "WHAT IF?" MARGINAL ABATEMENT INTERACTIVE SIMULATOR */}
      <section className="w-full border-b border-on-surface bg-surface-container-low" id="what-if">
        <div className="p-space-lg md:p-space-xl border-b border-on-surface bg-surface-container-lowest">
          <div className="max-w-4xl">
            <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
              PREDICTIVE MARGINAL ABATEMENT
            </span>
            <h2 className="font-headline text-headline-xl uppercase text-on-surface font-bold tracking-tight mt-1">
              WHAT HAPPENS IF YOU TWEAK YOUR LIFE?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs leading-relaxed">
              An illustrative calculator for exploring how lifestyle changes can affect estimated emissions. Sign in to use your saved activities and sourced factors.
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
                  PLANT-FORWARD DAYS / WEEK
                </label>
                <span className="font-headline text-headline-sm font-bold text-coral-accent">
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
              className="w-full py-space-xs bg-surface-container border border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              RESET SIMULATION TO CURRENT BASELINE
            </button>
          </div>

          {/* Dynamic Trajectory Results (7 cols) */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl flex flex-col justify-between bg-surface-container-lowest">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-lg">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  SIMULATED TRAJECTORY PROJECTION
                </span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase bg-cyan-accent text-on-surface font-bold px-space-xs py-0.5 border border-on-surface">
                  DYNAMIC RUNTIME
                </span>
              </div>

              {/* Display Result Box */}
              <div className="p-space-lg bg-surface-container-low border border-on-surface mb-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                    PREDICTED ANNUAL RUN-RATE
                  </div>
                  <div className="flex items-baseline space-x-space-xs">
                    <span className="font-display text-[64px] font-bold leading-none text-on-surface">
                      {netTonnes.toFixed(2)}
                    </span>
                    <span className="font-headline text-headline-md uppercase font-bold text-on-surface">
                      t CO₂e
                    </span>
                  </div>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-on-surface pt-space-sm sm:pt-0 sm:pl-space-lg space-y-1">
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                    NET MARGINAL SAVINGS
                  </div>
                  <div className={`font-headline text-headline-lg font-bold leading-none ${netSavingsKg >= 0 ? 'text-primary' : 'text-error'}`}>
                    {netSavingsKg >= 0 ? `−${Math.round(netSavingsKg)} kg / yr` : `+${Math.round(-netSavingsKg)} kg / yr`}
                  </div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                    {netSavingsKg >= 0 ? `${Math.abs(percentReduction).toFixed(1)}% REDUCTION` : `+${Math.abs(percentReduction).toFixed(1)}% INCREASE`}
                  </div>
                </div>
              </div>

              {/* Trajectory Branches */}
              <div className="space-y-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold">
                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32">BASELINE (CURRENT)</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-on-surface relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface"></div>
                    </div>
                  </div>
                  <span className="font-headline text-headline-sm text-on-surface font-bold">4.82 t</span>
                </div>

                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32 text-secondary">LESS DRIVING (−50%)</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-secondary-container relative">
                      <div className="absolute right-[22%] top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-accent border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="text-secondary font-bold">4.31 t (−10.5%)</span>
                </div>

                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-32 text-primary">FULL TRANSIT + DIET</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-primary-fixed relative">
                      <div className="absolute right-[36%] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="text-primary font-bold">3.96 t (−17.8%)</span>
                </div>

                <div className="p-space-sm bg-yellow-accent border border-on-surface flex items-center justify-between text-on-surface">
                  <span className="w-32">STRETCH TARGET</span>
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
              <span>ILLUSTRATIVE LIFESTYLE-CHANGE EXAMPLE</span>
              <Link href="/simulator" className="text-on-surface font-bold hover:underline">
                OPEN FULL SIMULATOR →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RAPID FOOTPRINT BENCHMARK / 3-STEP CALCULATOR */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest p-space-lg md:p-space-xl" id="calculator">
        <div className="flex flex-col md:flex-row md:items-end justify-between max-w-7xl mb-space-lg border-b border-on-surface pb-space-sm gap-4">
          <div>
            <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
              CALCULATION PROTOCOL
            </span>
            <h2 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
              RAPID FOOTPRINT BENCHMARK
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Recalibrate your base parameters in 3 steps without logging in.
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
                01 // HOW DO YOU MOVE?
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                PRIMARY TRANSIT VECTOR
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { mode: 'car' as const, label: 'SOLO COMBUSTION CAR' },
                  { mode: 'ev' as const, label: 'ELECTRIC VEHICLE (EV)' },
                  { mode: 'transit' as const, label: 'METRO, RAIL & BUS' },
                  { mode: 'active' as const, label: 'ACTIVE (BIKE / WALK)' },
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
                    {calcMode === item.mode && <span className="material-symbols-outlined text-[16px]">check</span>}
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
                02 // WEEKLY DISTANCE
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                COMMUTER HORIZON
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
                03 // HOME DIET MATRIX
              </div>
              <div className="font-label-caps-md text-label-caps-md uppercase font-bold mb-space-sm">
                FOOD CARBON PROFILE
              </div>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { diet: 'omnivore' as const, label: 'OMNIVORE (REGULAR MEAT)' },
                  { diet: 'pescatarian' as const, label: 'PESCATARIAN (FISH / DAIRY)' },
                  { diet: 'vegetarian' as const, label: 'VEGETARIAN (DAIRY / EGGS)' },
                  { diet: 'vegan' as const, label: '100% VEGAN / PLANT BASED' },
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
                    {calcDiet === item.diet && <span className="material-symbols-outlined text-[16px]">check</span>}
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
            Save this baseline to your official personal ledger to begin automated anomaly tracking.
          </span>
          <Link
            href="/onboarding"
            className="px-space-lg py-space-sm bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface hover:text-white whitespace-nowrap"
          >
            START OFFICIAL AUDIT →
          </Link>
        </div>
      </section>

      {/* 9. REDUCTION PLAN & BUDGET AUDIT */}
      <section className="w-full border-b border-on-surface grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <div>
                <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
                  REDUCTION ROADMAP
                </span>
                <h3 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
                  MAKE A DENT.
                </h3>
              </div>
              <div className="px-space-sm py-space-xs bg-coral-accent text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface">
                TARGET: −20% BY Q4
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              Four mathematically ranked interventions tailored to your specific infrastructure bottlenecks:
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
              href="/reduction-plan"
              className="w-full py-space-sm px-space-md bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-primary transition-none flex items-center justify-center"
            >
              CUSTOMIZE WITH OPTIMIZATION ENGINE →
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
                ANNUAL ALLOWABLE CEILING
              </span>
              <div className="flex items-baseline space-x-space-sm">
                <span className="font-display text-[72px] font-bold text-on-surface leading-none">
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
                  RUN-RATE FORECAST
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
            <span>ILLUSTRATIVE PREVIEW — NOT A VERIFIED INVENTORY</span>
            <span className="text-on-surface font-bold">NEXT RECONCILIATION: 7 DAYS</span>
          </div>
        </div>
      </section>

      {/* 10. RECENT ACTIVITY DIARY & EDITORIAL INSIGHTS */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
        {/* Activity Diary */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              CARBON DIARY // RECENT AUDIT LEDGER
            </span>
            <Link href="/diary" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
              VIEW ALL ENTRIES →
            </Link>
          </div>

          <div className="divide-y divide-on-surface border border-on-surface font-label-caps-sm text-label-caps-sm uppercase">
            <div className="p-space-sm bg-surface-container-lowest flex items-center justify-between">
              <div className="flex items-center space-x-space-sm">
                <span className="font-bold text-on-surface-variant w-14">09:20</span>
                <span className="px-space-xs py-0.5 bg-surface-container border border-on-surface font-bold">TRANSPORT</span>
                <span className="font-bold text-on-surface">COMBUSTION CAR (12 km commute)</span>
              </div>
              <div className="font-bold text-coral-accent">+2.52 kg CO₂e</div>
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

          <div className="mt-space-md border border-on-surface p-space-xs bg-surface-container-low flex items-stretch">
            <input
              type="text"
              placeholder="QUICK-LOG ACTIVITY (E.G. 'FLIGHT FRA-LHR' OR '10KM BIKE')..."
              className="w-full px-space-sm py-1 bg-surface-container-lowest text-body-sm font-body text-on-surface focus:outline-none uppercase"
            />
            <Link
              href="/diary"
              className="px-space-md py-1 bg-on-surface text-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase font-bold border-l border-on-surface hover:bg-primary transition-none whitespace-nowrap flex items-center"
            >
              LOG ENTRY
            </Link>
          </div>
        </div>

        {/* Editorial Insights */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                EDITORIAL INTELLIGENCE REPORT
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                VOL. 26 // ISSUE 11
              </span>
            </div>

            <blockquote className="p-space-md bg-surface-container border-l-4 border-on-surface mb-space-lg">
              <p className="font-headline text-headline-md uppercase text-on-surface font-bold leading-tight">
                &ldquo;YOUR LOWEST-CARBON WEEK IN 2026 OCCURRED MARCH 8–14: −14% BELOW YOUR ROLLING 90-DAY BASELINE.&rdquo;
              </p>
              <cite className="block mt-space-sm font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant not-italic font-bold">
                — offset.io Automated Ledger Analysis Engine
              </cite>
            </blockquote>

            <div className="space-y-space-xs">
              <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                DATA CONFIDENCE SPREAD
              </div>
              <div className="border border-on-surface p-space-sm bg-surface-container-lowest flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase">
                <span className="font-bold">OVERALL SIGNAL CONFIDENCE</span>
                <span className="px-space-xs py-0.5 bg-primary text-on-primary font-bold">
                  MEDIUM-HIGH (4.2 – 5.5 t 90% CONFIDENCE)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 font-label-caps-sm text-label-caps-sm uppercase">
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">ELECTRICITY</div>
                  <div className="font-bold text-primary mt-0.5">HIGH • API SYNC</div>
                </div>
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">TRANSPORT</div>
                  <div className="font-bold text-primary mt-0.5">HIGH • GPS TELEMATICS</div>
                </div>
                <div className="p-space-xs border border-on-surface bg-surface-container-low">
                  <div className="text-on-surface-variant font-bold">FOOD / GOODS</div>
                  <div className="font-bold text-secondary mt-0.5">MEDIUM • OCR INVOICE</div>
                </div>
              </div>
            </div>

            <div className="mt-space-md p-space-sm border border-on-surface bg-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-mono">
              <div className="text-on-surface font-bold mb-1">TRANSPARENT CALCULATION DISCLOSURE:</div>
              <code>Illustrative formula: distance × example factor = estimated emissions</code>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
            <span>VIEW SAVED-FACTOR METADATA AFTER SIGN-IN</span>
            <Link href="/insights" className="text-primary hover:underline">
              DISCOVER FULL INSIGHTS →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
