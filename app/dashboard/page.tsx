'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { classifyDashboardResponse, type DashboardViewState } from '@/lib/dashboard-state';

interface DashboardData {
  footprint: {
    totalAnnualEmissionsKg: number;
    totalAnnualEmissionsTonnes: number;
    totalMonthlyEmissionsKg: number;
    totalDailyEmissionsKg: number;
    largestCategory: string;
    calculations?: Array<{
      category: string;
      activityType: string;
      subtype: string;
    }>;
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
  const [viewState, setViewState] = useState<DashboardViewState>('loading');
  const [activePulseLayer, setActivePulseLayer] = useState<'all' | 'transit' | 'energy' | 'diet' | 'goods'>('all');

  const loadDashboard = () => {
    setViewState('loading');
    fetch('/api/dashboard')
      .then(async (res) => {
        let payload: DashboardData | null = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        setData(payload);
        setViewState(classifyDashboardResponse(res.status, payload));
      })
      .catch(() => {
        setData(null);
        setViewState('error');
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (viewState === 'loading') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" aria-hidden="true" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          Loading your footprint…
        </span>
      </div>
    );
  }

  if (viewState === 'unauthorized') {
    return (
      <div className="w-full max-w-4xl mx-auto my-space-xl p-space-xl border border-on-surface bg-surface-container-lowest text-center space-y-space-md">
        <span className="font-label-caps-md uppercase text-on-surface-variant font-bold">You&apos;re signed out</span>
        <h2 className="font-headline text-headline-lg uppercase font-bold">Please sign in to see your footprint</h2>
        <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
          Your data is safe. Sign back in to pick up where you left off.
        </p>
        <div className="pt-space-md">
          <Link
            href="/auth/login"
            className="inline-block min-h-[44px] px-space-lg py-space-md bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
          >
            Sign in →
          </Link>
        </div>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="w-full max-w-4xl mx-auto my-space-xl p-space-xl border border-on-surface bg-surface-container-lowest text-center space-y-space-md">
        <span className="font-label-caps-md uppercase text-error font-bold">Something went wrong</span>
        <h2 className="font-headline text-headline-lg uppercase font-bold">We couldn&apos;t load your footprint</h2>
        <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
          Check your connection and try again. Your saved activities are safe.
        </p>
        <div className="pt-space-md">
          <button
            type="button"
            onClick={loadDashboard}
            className="min-h-[44px] px-space-lg py-space-md bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (viewState === 'empty' || !data || !data.footprint) {
    return (
      <div className="w-full max-w-4xl mx-auto my-space-xl p-space-xl border border-on-surface bg-surface-container-lowest text-center space-y-space-md">
        <span className="font-label-caps-md uppercase text-on-surface-variant font-bold">No activities yet</span>
        <h2 className="font-headline text-headline-lg uppercase font-bold">Let&apos;s set up your footprint</h2>
        <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
          Answer 5 quick questions about how you travel, power your home, eat, and handle waste. It takes about two minutes.
        </p>
        <div className="pt-space-md">
          <Link
            href="/onboarding"
            className="inline-block min-h-[44px] px-space-lg py-space-md bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
          >
            Start my footprint →
          </Link>
        </div>
      </div>
    );
  }

  const { footprint, uncertainty, goal, progress, insights, recommendations } = data;
  const breakdown = footprint.categoryBreakdown || {};

  // Only real data — a category with no activities shows 0, never a placeholder.
  const transitData = breakdown.TRANSPORTATION || { annualEmissionsKg: 0, percentage: 0 };
  const energyData = breakdown.ENERGY || { annualEmissionsKg: 0, percentage: 0 };
  const foodData = breakdown.FOOD || { annualEmissionsKg: 0, percentage: 0 };
  const goodsData = breakdown.CONSUMPTION || breakdown.WASTE || { annualEmissionsKg: 0, percentage: 0 };

  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  const annualTonnes = footprint.totalAnnualEmissionsTonnes;
  const targetCapKg = goal?.targetAnnualEmissionsKg ?? 4000;
  const currentTotalKg = footprint.totalAnnualEmissionsKg;
  const targetTonnes = (targetCapKg / 1000).toFixed(2);
  const activityCount = footprint.calculations?.length ?? 0;

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* 1. Status band */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Your footprint · updates when your activities change
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            <span className="text-primary font-bold">{annualTonnes} t CO₂e / yr</span> • Goal: &lt; {targetTonnes} t CO₂e
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Confidence: {uncertainty?.overallConfidence || 'MEDIUM'} ({uncertainty?.minAnnualTonnes}–{uncertainty?.maxAnnualTonnes} t)
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">verified</span>
        </div>
      </section>

      {/* 2. THE EDITORIAL DASHBOARD SPREAD */}
      <section className="w-full border-b border-on-surface bg-surface-container-lowest">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
          {/* Box 1 (7 cols): Main footprint number */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
                <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface font-bold tracking-wider">
                  Your current footprint
                </span>
                <span className="px-space-xs py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps-sm text-label-caps-sm uppercase font-bold">
                  Based on {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
                </span>
              </div>
              <div className="py-space-md">
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant mb-space-xs font-bold">
                  Estimated for the year
                </div>
                <div className="flex flex-wrap items-baseline gap-space-sm">
                  <span className="font-display text-[clamp(3rem,12vw,6.875rem)] leading-none tracking-tighter text-on-surface font-bold">
                    {annualTonnes}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline text-headline-md uppercase text-on-surface font-bold">
                      t CO₂e / year
                    </span>
                    <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
                      About {(currentTotalKg / 365).toFixed(1)} kg per day
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-space-md border-t border-on-surface flex flex-wrap items-center justify-between gap-space-sm">
              <div className="inline-flex items-center space-x-space-xs px-space-sm py-space-xs bg-surface-container border border-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">trending_down</span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                  {progress?.status === 'over'
                    ? `${Math.round(progress.kgDifference)} kg over your goal`
                    : progress?.status === 'at'
                      ? 'Right on your goal'
                      : `${Math.round(progress?.kgDifference ?? 0)} kg under your goal`}
                </span>
              </div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Likely range: {uncertainty?.minAnnualTonnes}–{uncertainty?.maxAnnualTonnes} t ({uncertainty?.overallConfidence} confidence)
              </span>
            </div>
          </div>

          {/* Box 2 (5 cols): Top suggestion */}
          <div className="lg:col-span-5 bg-coral-accent text-on-surface p-space-lg md:p-space-xl flex flex-col justify-between border-b lg:border-b-0">
            {topRec ? (
              <>
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                      Biggest opportunity
                    </span>
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">crisis_alert</span>
                  </div>
                  <div className="pt-space-md">
                    <h2 className="font-headline text-headline-xl uppercase font-bold leading-tight tracking-tight mt-1">
                      {topRec.title}
                    </h2>
                  </div>
                  <div className="py-space-sm flex items-baseline space-x-space-xs">
                    <span className="font-display text-[clamp(2.5rem,6vw,3.5rem)] font-bold leading-none">
                      −{Math.round(topRec.estimatedReductionKg / 12)}
                    </span>
                    <span className="font-headline text-headline-sm uppercase font-bold">
                      kg CO₂e / month
                    </span>
                  </div>
                  <p className="font-body-md text-body-md leading-snug">
                    {topRec.explanation}
                  </p>
                </div>

                <div className="pt-space-lg">
                  <Link
                    href="/reduction-plan"
                    className="min-h-[44px] w-full py-space-sm px-space-md bg-surface-container-lowest text-on-surface border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between"
                  >
                    <span>Build a reduction plan</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-space-sm">
                <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                  Looking good
                </span>
                <h2 className="font-headline text-headline-xl uppercase font-bold leading-tight tracking-tight pt-space-md">
                  No big reductions left to suggest
                </h2>
                <p className="font-body-md text-body-md leading-snug">
                  Your footprint is already low across every category. Keep logging daily activities to hold this level.
                </p>
                <div className="pt-space-lg">
                  <Link
                    href="/diary"
                    className="min-h-[44px] w-full py-space-sm px-space-md bg-surface-container-lowest text-on-surface border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-surface-container-lowest transition-none flex items-center justify-between"
                  >
                    <span>Log today&apos;s activities</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Category breakdown */}
        <div className="w-full p-space-lg md:p-space-xl border-b border-on-surface bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg border-b border-on-surface pb-space-sm gap-space-sm">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
                Where it comes from
              </div>
              <h2 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
                Your breakdown
              </h2>
            </div>

            {/* Category filter buttons */}
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Highlight a category in the chart">
              {[
                { key: 'all' as const, label: 'All' },
                { key: 'transit' as const, label: `Transport (${transitData.percentage.toFixed(0)}%)` },
                { key: 'energy' as const, label: `Energy (${energyData.percentage.toFixed(0)}%)` },
                { key: 'diet' as const, label: `Food (${foodData.percentage.toFixed(0)}%)` },
                { key: 'goods' as const, label: `Goods (${goodsData.percentage.toFixed(0)}%)` },
              ].map((layer) => (
                <button
                  key={layer.key}
                  onClick={() => setActivePulseLayer(layer.key)}
                  aria-pressed={activePulseLayer === layer.key}
                  className={`min-h-[44px] px-space-sm py-1 font-label-caps-sm text-label-caps-sm uppercase font-bold border border-on-surface transition-none ${
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
            {/* Category rings chart (decorative — values are listed beside it) */}
            <div className="lg:col-span-6 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col items-center justify-center relative min-h-[340px]">
              <svg className="w-full max-w-[320px] h-auto text-on-surface" fill="none" viewBox="0 0 340 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chart showing your footprint split across transport, energy, food, and goods">
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="340" y1="170" y2="170"></line>
                <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="170" x2="170" y1="0" y2="340"></line>
                <circle cx="170" cy="170" fill="none" r="50" stroke="#001fce" strokeDasharray="4 4" strokeWidth="2"></circle>
                <text fill="#001fce" fontFamily="'Space Grotesk', sans-serif" fontSize="8" fontWeight="700" x="175" y="116">
                  Your goal: {targetTonnes}t
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
                {activityCount} {activityCount === 1 ? 'activity' : 'activities'} counted
              </div>
            </div>

            {/* Real-time Category Breakdown Bar */}
            <div className="lg:col-span-6 p-space-lg flex flex-col justify-between bg-surface-container-lowest">
              <div className="space-y-space-md">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1">
                      <span className="w-3 h-3 bg-cyan-accent border border-on-surface inline-block"></span>
                      <span>Transport</span>
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
                      <span>Home energy</span>
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
                      <span>Food</span>
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
                      <span>Goods &amp; waste</span>
                    </span>
                    <span>{Math.round(goodsData.annualEmissionsKg)} kg CO₂e ({goodsData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-yellow-accent border-r border-on-surface" style={{ width: `${Math.min(100, goodsData.percentage)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                <span>Total: {Math.round(currentTotalKg).toLocaleString('en-US')} kg CO₂e</span>
                <Link href="/calculate" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
                  How we calculate this →
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
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">directions_subway</span>
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
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bolt</span>
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
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">restaurant</span>
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
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">inventory_2</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Goal progress & insights */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
        {/* Left: Goal progress */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Your goal progress
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                {progress?.status === 'over' ? 'Over goal' : 'On track'}
              </span>
            </div>

            <div className="py-space-md">
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Your yearly goal
              </span>
              <div className="flex items-baseline space-x-space-sm">
                <span className="font-display text-[clamp(2.75rem,9vw,4.5rem)] font-bold text-on-surface leading-none">
                  {Math.round(targetCapKg).toLocaleString('en-US')}
                </span>
                <span className="font-headline text-headline-sm uppercase font-bold text-on-surface">
                  kg CO₂e
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
                <span className="text-on-surface font-bold">{Math.round(currentTotalKg).toLocaleString('en-US')} kg used</span>
                <span>{Math.round(targetCapKg).toLocaleString('en-US')} kg goal</span>
              </div>
            </div>

            <div className="p-space-md border border-on-surface bg-surface-container-low mt-space-lg space-y-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  What this means
                </span>
                <span className={`px-space-xs py-0.5 font-label-caps-sm text-label-caps-sm uppercase font-bold ${
                  currentTotalKg <= targetCapKg ? 'bg-primary text-on-primary' : 'bg-coral-accent text-on-surface'
                }`}>
                  {currentTotalKg <= targetCapKg ? 'On track' : 'Over goal'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                Your current pace lands at <strong className="text-primary font-bold">{Math.round(currentTotalKg).toLocaleString('en-US')} kg CO₂e</strong>.
                {currentTotalKg <= targetCapKg
                  ? ` That's ${Math.round(targetCapKg - currentTotalKg).toLocaleString('en-US')} kg under your goal.`
                  : ` That's ${Math.round(currentTotalKg - targetCapKg).toLocaleString('en-US')} kg over your goal — a reduction plan can help close the gap.`}
              </p>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
            <span>Goal updates everywhere automatically</span>
            <Link href="/goals" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
              Change my goal →
            </Link>
          </div>
        </div>

        {/* Right: Latest insights */}
        <div className="lg:col-span-6 p-space-lg md:p-space-xl bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Latest insights
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                {insights?.length || 0} notes
              </span>
            </div>

            <div className="space-y-space-xs">
              {insights && insights.length > 0 ? (
                insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="p-space-sm border border-on-surface bg-surface-container-lowest flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-space-sm">
                      <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 ${
                        ins.isAnomaly ? 'bg-coral-accent text-on-surface' : 'bg-primary text-white'
                      }`} aria-hidden="true">
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
                    Nothing unusual in your recent log. Keep logging to spot patterns.
                  </span>
                </div>
              )}
            </div>

            <div className="mt-space-lg">
              <blockquote className="p-space-md bg-surface-container border-l-4 border-on-surface">
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  How sure are we? {uncertainty?.explanation} Likely range: {uncertainty?.minAnnualTonnes}–{uncertainty?.maxAnnualTonnes} tonnes per year.
                </p>
                <cite className="block mt-space-xs font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant not-italic font-bold">
                  — Confidence {uncertainty?.overallConfidence} ({uncertainty?.confidenceScorePct}%)
                </cite>
              </blockquote>
            </div>
          </div>

          <div className="pt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
            <span>New notes appear as you log</span>
            <Link href="/coach" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
              Ask the coach →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
