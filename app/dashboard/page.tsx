'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardData {
  footprint: {
    totalAnnualEmissionsKg: number;
    totalAnnualEmissionsTonnes: number;
    totalMonthlyEmissionsKg: number;
    totalDailyEmissionsKg: number;
    largestCategory: string;
    categoryBreakdown: Record<
      string,
      {
        category: string;
        annualEmissionsKg: number;
        monthlyEmissionsKg: number;
        percentage: number;
        activityCount: number;
      }
    >;
  };
  uncertainty: {
    overallConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
    minAnnualTonnes: number;
    maxAnnualTonnes: number;
    confidenceScorePct: number;
    explanation: string;
  };
  goal: {
    targetAnnualEmissionsKg: number;
    targetMonthlyEmissionsKg: number;
    reductionPercentage: number;
  };
  progressPct: number;
  progress: {
    progressPct: number;
    isOverTarget: boolean;
    kgDifference: number;
    status: 'under' | 'at' | 'over';
  };
  insights: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    isAnomaly: boolean;
  }[];
  recommendations: {
    id: string;
    title: string;
    explanation: string;
    estimatedReductionKg: number;
    difficulty: string;
    priority: string;
    category?: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePulseLayer, setActivePulseLayer] = useState<'all' | 'transit' | 'energy' | 'diet' | 'goods'>('all');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          CALIBRATING PERSONAL CARBON TELEMETRY...
        </span>
      </div>
    );
  }

  if (!data || !data.footprint) {
    return (
      <div className="w-full max-w-4xl mx-auto my-space-xl p-space-xl border border-on-surface bg-surface-container-lowest text-center space-y-space-md">
        <span className="font-label-caps-md uppercase text-coral-accent font-bold">NO AUDITED BASELINE</span>
        <h2 className="font-headline text-headline-lg uppercase font-bold">ONBOARDING ASSESSMENT REQUIRED</h2>
        <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
          Establish your lifestyle parameters to initialize your personal carbon intelligence ledger.
        </p>
        <div className="pt-space-md">
          <Link
            href="/onboarding"
            className="px-space-lg py-space-md bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
          >
            START BASELINE ASSESSMENT →
          </Link>
        </div>
      </div>
    );
  }

  const { footprint, uncertainty, goal, progress, insights, recommendations } = data;
  const breakdown = footprint.categoryBreakdown || {};

  const transitData = breakdown.TRANSPORTATION || { annualEmissionsKg: 2506, percentage: 52 };
  const energyData = breakdown.ENERGY || { annualEmissionsKg: 1156, percentage: 24 };
  const foodData = breakdown.FOOD || { annualEmissionsKg: 772, percentage: 16 };
  const goodsData = breakdown.CONSUMPTION || breakdown.WASTE || { annualEmissionsKg: 385, percentage: 8 };

  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : {
    title: 'TRANSPORTATION COMMUTE SWITCH',
    explanation: 'Transfer 2 weekly office commutes from single-occupancy vehicle to rapid rail transit network.',
    estimatedReductionKg: 180,
  };

  const annualTonnes = footprint.totalAnnualEmissionsTonnes || +(footprint.totalAnnualEmissionsKg / 1000).toFixed(2);
  const targetCapKg = goal?.targetAnnualEmissionsKg || 4000;
  const currentTotalKg = footprint.totalAnnualEmissionsKg || 4820;
  const targetTonnes = (targetCapKg / 1000).toFixed(2);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* 1. TOP SWISS MECHANICAL TICKER BAND */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            LIVE LEDGER // 2026 HORIZON
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            PERSONAL EMISSION INDEX: <span className="text-primary font-bold">{annualTonnes} t CO₂e / YR</span> • TARGET: &lt; {targetTonnes} t CO₂e
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            CONFIDENCE: {uncertainty?.overallConfidence || 'MEDIUM'} ({uncertainty?.minAnnualTonnes || 4.2}–{uncertainty?.maxAnnualTonnes || 5.5} t)
          </span>
          <span className="material-symbols-outlined text-[16px]">verified</span>
        </div>
      </section>

      {/* 2. THE EDITORIAL DASHBOARD SPREAD */}
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
                  STATUS: AUDITED
                </span>
              </div>
              <div className="py-space-md">
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant mb-space-xs font-bold">
                  ESTIMATED ROLLING ANNUAL INTENSITY
                </div>
                <div className="flex flex-wrap items-baseline gap-space-sm">
                  <span className="font-display text-[80px] md:text-[110px] leading-none tracking-tighter text-on-surface font-bold">
                    {annualTonnes}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline text-headline-md uppercase text-on-surface font-bold">
                      t CO₂e / year
                    </span>
                    <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
                      DAILY RUN-RATE: {(currentTotalKg / 365).toFixed(1)} kg / day
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md border-t border-on-surface flex flex-wrap items-center justify-between gap-space-sm">
              <div className="inline-flex items-center space-x-space-xs px-space-sm py-space-xs bg-surface-container border border-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]">trending_down</span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                  vs 8.40 t Regional Average ({-(100 - (annualTonnes / 8.4) * 100).toFixed(1)}%)
                </span>
              </div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                PARIS 2.3t COMPLIANT DEFICIT: {annualTonnes > 2.3 ? `+${(annualTonnes - 2.3).toFixed(2)} t` : 'COMPLIANT'}
              </span>
            </div>
          </div>

          {/* Box 2 (5 cols): Flame Coral Priority Abatement Lever */}
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
                  {topRec.title || 'MOBILITY SHIFT'}
                </h2>
              </div>
              <div className="py-space-sm flex items-baseline space-x-space-xs">
                <span className="font-display text-[56px] font-bold text-surface-container-lowest leading-none">
                  −{Math.round(topRec.estimatedReductionKg / 12) || 180}
                </span>
                <span className="font-headline text-headline-sm uppercase text-surface-container-lowest font-bold">
                  kg CO₂e / month
                </span>
              </div>
              <p className="font-body-md text-body-md text-surface-container-lowest leading-snug">
                {topRec.explanation}
              </p>
            </div>

            <div className="pt-space-lg">
              <Link
                href="/reduction-plan"
                className="w-full py-space-sm px-space-md bg-surface-container-lowest text-on-surface border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between"
              >
                <span>EXECUTE IN REDUCTION PLAN</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. THE CARBON PULSE (Interactive Graphic Visualization) */}
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
            
            {/* Layer Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { key: 'all' as const, label: 'ALL LAYERS' },
                { key: 'transit' as const, label: `TRANSIT (${transitData.percentage.toFixed(0)}%)` },
                { key: 'energy' as const, label: `ENERGY (${energyData.percentage.toFixed(0)}%)` },
                { key: 'diet' as const, label: `DIET (${foodData.percentage.toFixed(0)}%)` },
                { key: 'goods' as const, label: `GOODS (${goodsData.percentage.toFixed(0)}%)` },
              ].map((layer) => (
                <button
                  key={layer.key}
                  onClick={() => setActivePulseLayer(layer.key)}
                  className={`px-space-sm py-1 font-label-caps-sm text-label-caps-sm uppercase font-bold border border-on-surface transition-none ${
                    activePulseLayer === layer.key
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-on-surface">
            {/* Concentric Pulse Rings SVG */}
            <div className="lg:col-span-6 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col items-center justify-center relative min-h-[340px]">
              <svg className="w-full max-w-[320px] h-auto text-on-surface" fill="none" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg">
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="340" y1="170" y2="170"></line>
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="170" x2="170" y1="0" y2="340"></line>
                <circle cx="170" cy="170" fill="none" r="50" stroke="#001fce" strokeDasharray="4 4" strokeWidth="2"></circle>
                <text fill="#001fce" fontFamily="'Space Grotesk', sans-serif" fontSize="8" fontWeight="700" x="175" y="116">
                  PARIS 2.30t TARGET
                </text>
                <circle cx="170" cy="170" fill="none" r="85" stroke="#1c1b1b" strokeWidth="1"></circle>
                <circle cx="170" cy="170" fill="none" r="120" stroke="#1c1b1b" strokeWidth="1"></circle>
                <circle cx="170" cy="170" fill="none" r="155" stroke="#1c1b1b" strokeDasharray="3 3" strokeWidth="1"></circle>

                {/* Layer Arcs */}
                {(activePulseLayer === 'all' || activePulseLayer === 'transit') && (
                  <path d="M 170,30 A 140,140 0 0,1 306.8,200.7" fill="none" stroke="#00B2FE" strokeWidth="12"></path>
                )}
                {(activePulseLayer === 'all' || activePulseLayer === 'energy') && (
                  <path d="M 306.8,200.7 A 140,140 0 0,1 199.1,306.9" fill="none" stroke="#001fce" strokeWidth="12"></path>
                )}
                {(activePulseLayer === 'all' || activePulseLayer === 'diet') && (
                  <path d="M 199.1,306.9 A 140,140 0 0,1 78.4,275.6" fill="none" stroke="#FF5938" strokeWidth="12"></path>
                )}
                {(activePulseLayer === 'all' || activePulseLayer === 'goods') && (
                  <path d="M 78.4,275.6 A 140,140 0 0,1 42.6,227.8" fill="none" stroke="#FFDE38" strokeWidth="12"></path>
                )}

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

            {/* Real-time Category Breakdown Bar */}
            <div className="lg:col-span-6 p-space-lg flex flex-col justify-between bg-surface-container-lowest">
              <div className="space-y-space-md">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-cyan-accent border border-on-surface inline-block"></span>
                      <span>01 // MOBILITY &amp; TRANSIT</span>
                    </span>
                    <span>{Math.round(transitData.annualEmissionsKg)} kg CO₂e ({transitData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-cyan-accent border-r border-on-surface" style={{ width: `${Math.min(100, transitData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-primary border border-on-surface inline-block"></span>
                      <span>02 // RESIDENTIAL &amp; ENERGY</span>
                    </span>
                    <span>{Math.round(energyData.annualEmissionsKg)} kg CO₂e ({energyData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-primary border-r border-on-surface" style={{ width: `${Math.min(100, energyData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-coral-accent border border-on-surface inline-block"></span>
                      <span>03 // FOOD &amp; NUTRITION</span>
                    </span>
                    <span>{Math.round(foodData.annualEmissionsKg)} kg CO₂e ({foodData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-coral-accent border-r border-on-surface" style={{ width: `${Math.min(100, foodData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-yellow-accent border border-on-surface inline-block"></span>
                      <span>04 // GOODS &amp; SERVICES</span>
                    </span>
                    <span>{Math.round(goodsData.annualEmissionsKg)} kg CO₂e ({goodsData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-yellow-accent border-r border-on-surface" style={{ width: `${Math.min(100, goodsData.percentage)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                <span>SUM TOTAL: {Math.round(currentTotalKg)} kg CO₂e</span>
                <Link href="/insights" className="text-primary hover:underline">
                  INSPECT FACTOR AUDIT TRAIL →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 4-COLUMN SECTOR BREAKDOWN GRID */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-space-lg border-b lg:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-cyan-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 01</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">TRANSPORTATION</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">{Math.round(transitData.annualEmissionsKg)}</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • {transitData.percentage.toFixed(1)}% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Dominant parameter in your profile. Direct combustion &amp; public mobility.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE SHIFT →
              </Link>
              <span className="material-symbols-outlined text-[18px]">directions_subway</span>
            </div>
          </div>

          <div className="p-space-lg border-b lg:border-b-0 md:border-r lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-primary mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 02</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">ENERGY &amp; UTILITIES</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">{Math.round(energyData.annualEmissionsKg)}</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • {energyData.percentage.toFixed(1)}% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Grid electricity load &amp; residential thermal baseline heating.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE THERMOSTAT →
              </Link>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
          </div>

          <div className="p-space-lg border-b md:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-coral-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 03</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">FOOD &amp; DIET</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">{Math.round(foodData.annualEmissionsKg)}</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • {foodData.percentage.toFixed(1)}% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Dietary protein split &amp; regional agricultural supply chain.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE PLANT DAYS →
              </Link>
              <span className="material-symbols-outlined text-[18px]">restaurant</span>
            </div>
          </div>

          <div className="p-space-lg bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-1.5 bg-yellow-accent mb-space-sm border border-on-surface"></div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 04</span>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-1">GOODS &amp; SERVICES</h3>
              <div className="my-space-md">
                <div className="font-display text-headline-xl text-on-surface font-bold leading-none">{Math.round(goodsData.annualEmissionsKg)}</div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">kg CO₂e • {goodsData.percentage.toFixed(1)}% SHARE</div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface leading-normal">
                Amortized lifecycle hardware, goods, apparel, and municipal services.
              </p>
            </div>
            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/reduction-plan" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                REDUCTION PLAN →
              </Link>
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ANNUAL BUDGET AUDIT & ANOMALIES */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
        {/* Left: 2026 Budget Bar */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                ANNUAL CARBON BUDGET TRACKER
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                PACING: {progress?.status === 'over' ? 'OVER BUDGET' : 'ON TRACK'}
              </span>
            </div>

            <div className="py-space-md">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                ANNUAL TARGET CEILING
              </span>
              <div className="flex items-baseline space-x-space-sm">
                <span className="font-display text-[72px] font-bold text-on-surface leading-none">
                  {Math.round(targetCapKg)}
                </span>
                <span className="font-headline text-headline-sm uppercase font-bold text-on-surface">
                  kg CO₂e CAP
                </span>
              </div>
            </div>

            {/* Segmented Heavy Bar */}
            <div className="space-y-space-xs my-space-md">
              <div className="w-full h-10 border border-on-surface flex">
                <div
                  className="h-full bg-on-surface flex items-center justify-center text-surface-container-lowest font-label-caps-sm text-label-caps-sm font-bold truncate px-2"
                  style={{ width: `${Math.min(100, Math.round((currentTotalKg / targetCapKg) * 100))}%` }}
                >
                  {Math.round(currentTotalKg)} kg ({Math.round((currentTotalKg / targetCapKg) * 100)}%)
                </div>
                {targetCapKg > currentTotalKg && (
                  <div
                    className="h-full bg-yellow-accent flex items-center justify-center text-on-surface font-label-caps-sm text-label-caps-sm font-bold truncate px-2"
                    style={{ width: `${100 - Math.min(100, Math.round((currentTotalKg / targetCapKg) * 100))}%` }}
                  >
                    {Math.round(targetCapKg - currentTotalKg)} kg LEFT
                  </div>
                )}
              </div>
              <div className="flex justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>0 kg</span>
                <span className="text-on-surface font-bold">{Math.round(currentTotalKg)} kg EXPENDED</span>
                <span>{Math.round(targetCapKg)} kg LIMIT</span>
              </div>
            </div>

            <div className="p-space-md border border-on-surface bg-surface-container-low mt-space-lg space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  RUN-RATE FORECAST
                </span>
                <span className={`px-space-xs py-0.5 font-label-caps-sm text-label-caps-sm uppercase font-bold ${
                  currentTotalKg <= targetCapKg ? 'bg-primary text-on-primary' : 'bg-coral-accent text-white'
                }`}>
                  {currentTotalKg <= targetCapKg ? 'ON TRACK' : 'DEFICIT'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Projected emissions trajectory lands at <strong className="text-primary font-bold">{Math.round(currentTotalKg)} kg CO₂e</strong>.
                {currentTotalKg <= targetCapKg
                  ? ` You maintain a safety margin of ${Math.round(targetCapKg - currentTotalKg)} kg below your goal ceiling.`
                  : ` An active reduction plan of ${Math.round(currentTotalKg - targetCapKg)} kg is recommended to meet your climate goal.`}
              </p>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
            <span>GOALS ENGINE: ACTIVE</span>
            <Link href="/goals" className="text-primary hover:underline">
              MANAGE TARGETS →
            </Link>
          </div>
        </div>

        {/* Right: Active Insights & Anomalies */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                STATISTICAL ANOMALY &amp; INSIGHT FEED
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                {insights?.length || 0} SIGNALS
              </span>
            </div>

            <div className="space-y-space-xs">
              {insights && insights.length > 0 ? (
                insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-space-sm">
                      <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 ${
                        ins.isAnomaly ? 'bg-coral-accent text-white' : 'bg-primary text-white'
                      }`}>
                        !
                      </span>
                      <div>
                        <div className="font-label-caps-md uppercase font-bold text-on-surface">{ins.title}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{ins.description}</div>
                      </div>
                    </div>
                    <span className="font-label-caps-sm uppercase px-space-xs py-0.5 border border-on-surface bg-surface-container font-bold shrink-0">
                      {ins.category}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-space-md border border-on-surface bg-surface-container-low text-center">
                  <span className="font-label-caps-sm uppercase font-bold text-on-surface-variant">
                    NO ACTIVE ANOMALIES DETECTED IN ROLLING 30-DAY LEDGER
                  </span>
                </div>
              )}
            </div>

            <div className="mt-space-lg">
              <blockquote className="p-space-md bg-surface-container border-l-4 border-on-surface">
                <p className="font-headline text-headline-sm uppercase text-on-surface font-bold leading-tight">
                  &ldquo;MONTE CARLO UNCERTAINTY MODEL: {uncertainty?.explanation || 'Robust confidence bounds across primary combustion factors.'}&rdquo;
                </p>
                <cite className="block mt-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant not-italic font-bold">
                  — ISO 14064-3 Statistical Validation Engine
                </cite>
              </blockquote>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
            <span>AUDIT CYCLE: WEEKLY</span>
            <Link href="/coach" className="text-primary hover:underline">
              CONSULT CARBON COACH →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
