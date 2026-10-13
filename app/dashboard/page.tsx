'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { classifyDashboardResponse, type DashboardViewState } from '@/lib/dashboard-state';
import { getUnifiedCategoryBreakdown, type UnifiedCategoryKey } from '@/lib/taxonomy';
import { getComparisons } from '@/lib/comparisons';
import { PixelIcon, PixelCharacter, resolveCharacterState, PixelEarthAnimated } from '@/components/pixel';
import SectorBadge, { SECTOR_STYLES } from '@/components/SectorBadge';

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
    isIncomplete?: boolean;
    missingCategories?: string[];
  };
  goal: {
    targetAnnualEmissionsKg: number;
    targetMonthlyEmissionsKg: number;
    reductionPercentage: number;
  } | null;
  progressPct: number | null;
  progress: {
    progressPct: number;
    isOverTarget: boolean;
    kgDifference: number;
    status: 'under' | 'at' | 'over';
  } | null;
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
  weekDelta: number | null;
  streak: { current: number; longest: number };
  weeklyReport: {
    totalKg: number;
    entriesCount: number;
    vsGoalKg: number | null;
    bestDay: { date: string; kg: number; category: string } | null;
    worstDay: { date: string; kg: number; category: string } | null;
    tip: string;
  } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [viewState, setViewState] = useState<DashboardViewState>('loading');
  const [activePulseLayer, setActivePulseLayer] = useState<'all' | UnifiedCategoryKey>('all');
  const [unitTooltipOpen, setUnitTooltipOpen] = useState(false);
  const [confidenceTooltipOpen, setConfidenceTooltipOpen] = useState(false);
  const [breakdownView, setBreakdownView] = useState<'radial' | 'bars'>('radial');
  const [reportOpen, setReportOpen] = useState(false);

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

  const { footprint, uncertainty, goal, progress, insights, recommendations, weekDelta, streak, weeklyReport } = data;
  const unifiedBreakdown = getUnifiedCategoryBreakdown(footprint as any);

  const transitData = unifiedBreakdown.transport;
  const energyData = unifiedBreakdown.energy;
  const foodData = unifiedBreakdown.food;
  const goodsData = unifiedBreakdown.goods;

  const topRec = recommendations && recommendations.length > 0 ? recommendations[0] : null;

  const annualTonnes = footprint.totalAnnualEmissionsTonnes;
  const currentTotalKg = footprint.totalAnnualEmissionsKg;
  const hasGoal = Boolean(goal && goal.targetAnnualEmissionsKg > 0);
  const targetCapKg = goal?.targetAnnualEmissionsKg ?? null;
  const targetTonnes = targetCapKg ? (targetCapKg / 1000).toFixed(2) : null;
  const activityCount = footprint.calculations?.length ?? 0;

  return (
    <div className="flex flex-col w-full text-on-surface bg-background pb-20 md:pb-28">
      {/* 1. Streamlined Active Sub-Header Bar (Core Metrics: Streak & Goal Summary) */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        {/* Left: Active Tracker Label */}
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest shrink-0">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Live Tracker
          </span>
        </div>

        {/* Center: Core Active Metrics — Current Streak & Goal Summary */}
        <div className="flex-1 flex flex-wrap items-center divide-y sm:divide-y-0 sm:divide-x divide-on-surface bg-surface-container-lowest">
          {/* Active Metric A: Current Streak */}
          <div className="px-space-md py-space-xs flex items-center gap-2">
            <PixelIcon name="streak" size={18} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                {streak.current > 0 ? `${streak.current}-Day Streak` : '0-Day Streak'}
              </span>
              {streak.current > 0 ? (
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-semibold">
                  (Best: {streak.longest})
                </span>
              ) : (
                <Link
                  href="/diary"
                  className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary hover:underline"
                >
                  Log today →
                </Link>
              )}
            </div>
          </div>

          {/* Active Metric B: Goal Summary */}
          <div className="px-space-md py-space-xs flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
              flag
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2 font-label-caps-md text-label-caps-md uppercase font-bold">
              <span className="text-on-surface">
                Pace: <span className="text-primary">{annualTonnes} t</span>
              </span>
              <span className="text-on-surface-variant font-normal">/</span>
              {hasGoal ? (
                <span className="text-on-surface">
                  Goal: &lt;{targetTonnes} t
                  {progress && (
                    <span
                      className={`ml-1.5 font-label-caps-sm px-1.5 py-0.5 border border-on-surface ${
                        progress.status === 'over'
                          ? 'bg-[#FF4D30] text-on-surface'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {progress.status === 'over'
                        ? `+${Math.round(progress.kgDifference)} kg over`
                        : 'On track'}
                    </span>
                  )}
                </span>
              ) : (
                <Link href="/goals" className="text-primary hover:underline font-bold text-xs">
                  Set target goal →
                </Link>
              )}
            </div>
          </div>

          {/* Weekly Report trigger shortcut if available */}
          {weeklyReport && (
            <div className="px-space-md py-space-xs flex items-center">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface hover:text-primary flex items-center gap-1 transition-none"
              >
                <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
                  calendar_view_week
                </span>
                <span>Last week: {weeklyReport.totalKg} kg</span>
                <span className="text-xs text-primary font-bold">→</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Low-Priority Metadata Relocated to Interactive Tooltip */}
        <div className="relative border-t md:border-t-0 md:border-l border-on-surface flex items-center bg-surface-container-low px-space-sm py-1 shrink-0">
          <button
            type="button"
            onClick={() => setConfidenceTooltipOpen((v) => !v)}
            onBlur={() => setTimeout(() => setConfidenceTooltipOpen(false), 250)}
            aria-expanded={confidenceTooltipOpen}
            aria-label="View calculation confidence and variance bounds"
            className="min-h-[32px] inline-flex items-center gap-1.5 px-2 py-1 bg-surface-container-lowest hover:bg-surface-container-high border border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface transition-none shadow-[1px_1px_0px_#1c1b1b]"
          >
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
              tune
            </span>
            <span>Confidence:</span>
            <span className="px-1 py-0.5 bg-[#0022CC] text-white text-[10px] font-bold">
              {uncertainty?.overallConfidence || 'MEDIUM'}
            </span>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
              info
            </span>
          </button>

          {/* Interactive Confidence Tooltip Popover */}
          {confidenceTooltipOpen && (
            <div
              role="tooltip"
              className="absolute right-2 top-full mt-1.5 z-40 w-72 sm:w-80 bg-surface-container-lowest border-2 border-on-surface p-space-sm shadow-hard-offset text-left space-y-2 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-on-surface pb-1">
                <span className="font-label-caps-sm uppercase font-bold text-primary flex items-center gap-1">
                  <PixelIcon name="audit-meter" size={14} />
                  <span>Uncertainty Audit</span>
                </span>
                <span className="px-1.5 py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps-sm font-bold uppercase text-[10px]">
                  {uncertainty?.confidenceScorePct ?? 75}% verified
                </span>
              </div>
              <div className="space-y-1">
                <div className="font-label-caps-sm uppercase text-on-surface-variant font-bold text-[10px]">
                  Likely Annual Range
                </div>
                <div className="font-display font-bold text-base text-on-surface">
                  {uncertainty?.minAnnualTonnes} – {uncertainty?.maxAnnualTonnes} t CO₂e
                </div>
              </div>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                {uncertainty?.explanation ||
                  'Quantitative bounds calculated from activity completeness and regional factor uncertainty bands.'}
              </p>
              <div className="pt-1 border-t border-on-surface/30 text-[10px] uppercase font-label-caps-sm text-on-surface-variant font-bold">
                Level: {uncertainty?.overallConfidence} Confidence
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Weekly Report Card Modal */}
      {reportOpen && weeklyReport && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Last week's carbon report"
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/60 p-space-md"
          onClick={(e) => { if (e.target === e.currentTarget) setReportOpen(false); }}
        >
          <div className="w-full max-w-lg bg-surface-container-lowest border border-on-surface text-on-surface">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-on-surface px-space-lg py-space-md">
              <div>
                <span className="font-label-caps-sm uppercase font-bold text-primary tracking-widest">Weekly carbon report</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold tracking-tight">Last week</h2>
              </div>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                aria-label="Close report"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-surface-container transition-none"
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="p-space-lg space-y-space-md">
              {/* Total */}
              <div className="flex items-baseline gap-space-sm border-b border-on-surface pb-space-md">
                <span className="font-display text-5xl font-bold leading-none">{weeklyReport.totalKg}</span>
                <div className="flex flex-col">
                  <span className="font-headline text-headline-sm uppercase font-bold">kg CO₂e</span>
                  <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">last 7 days · {weeklyReport.entriesCount} entries logged</span>
                </div>
                {weeklyReport.vsGoalKg !== null && (
                  <span className={`ml-auto font-label-caps-md uppercase font-bold px-space-sm py-0.5 border border-on-surface ${weeklyReport.vsGoalKg > 0 ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                    {weeklyReport.vsGoalKg > 0 ? '+' : ''}{weeklyReport.vsGoalKg} kg vs goal
                  </span>
                )}
              </div>

              {/* Best / Worst */}
              <div className="grid grid-cols-2 gap-space-sm">
                {weeklyReport.bestDay && (
                  <div className="border border-on-surface p-space-sm bg-surface-container-low">
                    <div className="font-label-caps-sm uppercase font-bold text-primary mb-1">Best day</div>
                    <div className="font-headline text-headline-sm uppercase font-bold">{weeklyReport.bestDay.kg} kg</div>
                    <div className="font-label-caps-sm uppercase text-on-surface-variant font-bold">{weeklyReport.bestDay.category}</div>
                    <div className="font-label-caps-sm uppercase text-on-surface-variant">{new Date(weeklyReport.bestDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  </div>
                )}
                {weeklyReport.worstDay && (
                  <div className="border border-on-surface p-space-sm bg-surface-container-low">
                    <div className="font-label-caps-sm uppercase font-bold text-error mb-1">Highest day</div>
                    <div className="font-headline text-headline-sm uppercase font-bold">{weeklyReport.worstDay.kg} kg</div>
                    <div className="font-label-caps-sm uppercase text-on-surface-variant font-bold">{weeklyReport.worstDay.category}</div>
                    <div className="font-label-caps-sm uppercase text-on-surface-variant">{new Date(weeklyReport.worstDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="border-l-4 border-primary pl-space-md py-space-xs bg-surface-container-low">
                <div className="font-label-caps-sm uppercase font-bold text-primary mb-0.5">This week&apos;s tip</div>
                <p className="font-body-md text-body-md text-on-surface">{weeklyReport.tip}</p>
              </div>

              {/* Tangible comparison for weekly total */}
              {(() => {
                const [c] = getComparisons(weeklyReport.totalKg, 1);
                return c ? (
                  <div className="flex items-start gap-space-sm bg-surface-container p-space-sm border border-on-surface">
                    <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Your {weeklyReport.totalKg} kg last week is <strong className="text-on-surface">{c.fullText}</strong>.
                    </p>
                  </div>
                ) : null;
              })()}

              {/* Actions */}
              <div className="flex gap-space-sm pt-space-xs">
                <Link
                  href="/diary"
                  onClick={() => setReportOpen(false)}
                  className="flex-1 min-h-[44px] flex items-center justify-center bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none"
                >
                  Log this week →
                </Link>
                <Link
                  href="/simulator"
                  onClick={() => setReportOpen(false)}
                  className="flex-1 min-h-[44px] flex items-center justify-center bg-surface-container-lowest text-on-surface font-label-caps-md uppercase font-bold border border-on-surface hover:bg-surface-container-low transition-none"
                >
                  Try changes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE EDITORIAL DASHBOARD SPREAD */}
      <section className="w-full border-b border-on-surface bg-background">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-on-surface">
          {/* Box 1 (6 cols): Main footprint number */}
          <div className="lg:col-span-6 bg-surface-container-lowest p-space-md md:p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-on-surface pb-space-xs mb-space-sm">
                <span className="font-label-caps-md text-label-caps-md uppercase text-on-surface font-bold tracking-wider flex items-center gap-space-xs">
                  <PixelIcon name="footprint" size={16} />
                  Your current footprint
                </span>
                <span className="px-space-xs py-0.5 bg-secondary-fixed text-on-secondary-fixed font-label-caps-sm text-label-caps-sm uppercase font-bold">
                  Based on {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
                </span>
              </div>
              <div className="py-space-xs">
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant mb-1 font-bold">
                  Estimated for the year
                </div>
                <div className="flex flex-wrap items-baseline gap-space-sm">
                  <span className="font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-none tracking-tighter text-on-surface font-bold">
                    {annualTonnes}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-headline text-headline-md uppercase text-on-surface font-bold">
                      t CO₂e / year
                    </span>
                    <span className="font-label-caps-sm text-label-caps-sm text-on-surface-variant uppercase font-bold">
                      About {(currentTotalKg / 365).toFixed(1)} kg per day
                    </span>
                    <span className="relative font-label-caps-sm text-label-caps-sm text-on-surface-variant font-normal normal-case mt-0.5">
                      <button
                        type="button"
                        onClick={() => setUnitTooltipOpen((v) => !v)}
                        onBlur={() => setUnitTooltipOpen(false)}
                        aria-expanded={unitTooltipOpen}
                        aria-label="What does t CO₂e mean?"
                        className="border-b border-dashed border-on-surface-variant cursor-pointer focus:outline-none focus:border-primary"
                      >
                        t CO₂e
                      </button>
                      {' '}= tonnes of carbon dioxide equivalent
                      {unitTooltipOpen && (
                        <span
                          role="tooltip"
                          className="absolute left-0 top-full mt-1 z-10 w-72 bg-on-surface text-surface-container-lowest font-body-sm text-body-sm p-space-sm border border-on-surface shadow-lg normal-case"
                        >
                          <strong className="font-bold uppercase font-label-caps-sm block mb-1">What is t CO₂e?</strong>
                          A tonne of CO₂ equivalent (t CO₂e) is a single unit that combines all greenhouse gases — CO₂, methane, nitrous oxide — by how much warming they cause relative to CO₂. 1 t = 1,000 kg.
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Footprint Comparison Context - Structured Neo-Brutalist Metric Badges */}
                <div className="mt-space-md pt-space-sm border-t border-on-surface space-y-space-xs">
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold flex items-center justify-between">
                    <span>Context &amp; Equivalencies</span>
                    <span className="text-xs normal-case text-on-surface-variant font-normal">Real-world comparisons</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* Driving Equiv Badge Card */}
                    <div className="p-2.5 bg-surface-container border border-on-surface flex items-start gap-2.5">
                      <div className="p-1.5 bg-[#00B0FF] text-on-surface border border-on-surface shrink-0">
                        <PixelIcon name="petrol-car" size={18} />
                      </div>
                      <div>
                        <div className="font-label-caps-sm uppercase font-bold text-on-surface-variant text-[10px]">Driving Equivalent</div>
                        <div className="font-display font-bold text-sm text-on-surface">
                          {Math.round((currentTotalKg / 0.192) / 1000).toLocaleString('en-US')} km
                        </div>
                        <div className="text-[11px] text-on-surface-variant">Petrol vehicle travel</div>
                      </div>
                    </div>

                    {/* 1.5°C Benchmark Badge Card */}
                    <div className="p-2.5 bg-surface-container border border-on-surface flex items-start gap-2.5">
                      <div className={`p-1.5 border border-on-surface shrink-0 font-bold ${annualTonnes <= 2.3 ? 'bg-primary text-white' : 'bg-[#FF4D30] text-on-surface'}`}>
                        <span className="material-symbols-outlined text-[18px]">
                          {annualTonnes <= 2.3 ? 'verified' : 'warning'}
                        </span>
                      </div>
                      <div>
                        <div className="font-label-caps-sm uppercase font-bold text-on-surface-variant text-[10px]">1.5°C Paris Benchmark</div>
                        <div className="font-display font-bold text-sm text-on-surface">
                          {annualTonnes <= 2.3 ? (
                            <span className="text-primary">On Track (≤ 2.3 t)</span>
                          ) : (
                            <span className="text-[#FF4D30]">{(annualTonnes - 2.3).toFixed(1)} t over</span>
                          )}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">Target: 2.3 t • Avg: 4.0 t</div>
                      </div>
                    </div>

                    {/* Tangible Comparisons */}
                    {getComparisons(currentTotalKg, 2).map((c, i) => (
                      <div key={i} className="p-2.5 bg-surface-container border border-on-surface flex items-start gap-2.5">
                        <span className="text-xl p-1 bg-surface-container-lowest border border-on-surface shrink-0 leading-none" aria-hidden="true">{c.emoji}</span>
                        <div>
                          <div className="font-label-caps-sm uppercase font-bold text-on-surface-variant text-[10px]">Tangible Scale</div>
                          <div className="font-body-sm text-xs font-semibold text-on-surface leading-tight">
                            {c.fullText}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-space-md pt-space-sm border-t border-on-surface flex flex-wrap items-center justify-between gap-space-sm">
              <div className="inline-flex items-center space-x-space-xs px-space-sm py-space-xs bg-surface-container border border-on-surface">
                <span className="material-symbols-outlined text-primary text-[18px]" aria-hidden="true">
                  {hasGoal ? 'trending_down' : 'flag'}
                </span>
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                  {hasGoal && progress
                    ? progress.status === 'over'
                      ? `${Math.round(progress.kgDifference)} kg over your goal`
                      : progress.status === 'at'
                        ? 'Right on your goal'
                        : `${Math.round(progress.kgDifference)} kg under your goal`
                    : 'No target goal set yet'}
                </span>
              </div>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                Likely range: {uncertainty?.minAnnualTonnes}–{uncertainty?.maxAnnualTonnes} t ({uncertainty?.overallConfidence} confidence)
              </span>
            </div>
          </div>

          {/* Box 2 (6 cols): Top suggestion - Clean brutalist card with framed pixel-art Earth */}
          <div className="lg:col-span-6 bg-surface-container text-on-surface p-space-md md:p-space-lg flex flex-col justify-between border-b lg:border-b-0">
            {topRec ? (
              <>
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between border-b border-on-surface pb-space-xs">
                    <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                      Top opportunity
                    </span>
                    {topRec.category?.toLowerCase().includes('food') || topRec.category?.toLowerCase().includes('diet') ? (
                      <SectorBadge category="food" />
                    ) : topRec.category?.toLowerCase().includes('transport') || topRec.category?.toLowerCase().includes('travel') ? (
                      <SectorBadge category="transport" />
                    ) : topRec.category?.toLowerCase().includes('energy') || topRec.category?.toLowerCase().includes('home') ? (
                      <SectorBadge category="energy" />
                    ) : (
                      <SectorBadge category="waste" />
                    )}
                  </div>

                  {/* Clean Framed Pixel Earth Container */}
                  <div className="flex flex-col items-center justify-center p-space-md bg-surface-container-lowest border-2 border-on-surface shadow-[3px_3px_0px_#1c1b1b] my-space-xs">
                    <PixelEarthAnimated size={144} loopSeconds={12} />
                    <span className="mt-2 font-label-caps-sm text-[10px] uppercase text-on-surface-variant font-bold tracking-widest">
                      Planetary Impact Potential
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-headline text-headline-lg uppercase font-bold leading-tight tracking-tight">
                      {topRec.title}
                    </h2>
                    <div className="py-1 flex items-baseline space-x-space-xs">
                      <span className="font-display text-[clamp(2.25rem,4vw,3.25rem)] font-bold leading-none text-primary">
                        −{Math.round(topRec.estimatedReductionKg / 12)}
                      </span>
                      <span className="font-headline text-headline-sm uppercase font-bold text-on-surface">
                        kg CO₂e / month
                      </span>
                    </div>
                    <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                      {topRec.explanation}
                    </p>
                  </div>
                </div>

                <div className="pt-space-md">
                  <Link
                    href="/reduction-plan"
                    className="min-h-[44px] w-full py-space-sm px-space-md bg-on-surface text-surface-container-lowest border-2 border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-primary transition-all shadow-[2px_2px_0px_#1c1b1b] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-between"
                  >
                    <span>Build a reduction plan</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-space-xs">
                <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider px-space-xs py-0.5 bg-surface-container-lowest text-on-surface border border-on-surface font-bold">
                  Looking good
                </span>
                <div className="flex justify-center py-space-xs">
                  <PixelEarthAnimated size={160} loopSeconds={12} />
                </div>
                <h2 className="font-headline text-headline-lg uppercase font-bold leading-tight tracking-tight pt-space-xs">
                  No big reductions left to suggest
                </h2>
                <p className="font-body-md text-body-md leading-snug text-on-surface-variant">
                  Your footprint is already low across every category. Keep logging daily activities to hold this level.
                </p>
                <div className="pt-space-md">
                  <Link
                    href="/diary"
                    className="min-h-[44px] w-full py-space-sm px-space-md bg-on-surface text-surface-container-lowest border border-on-surface font-label-caps-md text-label-caps-md uppercase font-bold hover:bg-primary transition-none flex items-center justify-between"
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
        <div className="w-full p-space-md md:p-space-lg border-b border-on-surface bg-surface-container-lowest">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-md border-b border-on-surface pb-space-xs gap-space-sm">
            <div>
              <div className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest text-primary font-bold">
                Where it comes from
              </div>
              <h2 className="font-headline text-headline-lg uppercase text-on-surface font-bold tracking-tight">
                Your breakdown
              </h2>
            </div>

            {/* View Mode Toggle & Category Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Radial vs Bar Chart Toggle */}
              <div className="flex items-center border-2 border-on-surface bg-surface-container-lowest shadow-[2px_2px_0px_#1c1b1b]">
                <button
                  type="button"
                  onClick={() => setBreakdownView('radial')}
                  aria-pressed={breakdownView === 'radial'}
                  className={`min-h-[38px] px-3 py-1 font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center gap-1.5 transition-none border-r border-on-surface ${
                    breakdownView === 'radial'
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  <span>Radial View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownView('bars')}
                  aria-pressed={breakdownView === 'bars'}
                  className={`min-h-[38px] px-3 py-1 font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center gap-1.5 transition-none ${
                    breakdownView === 'bars'
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                  <span>Horizontal Bars</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Highlight a category in the chart">
                {[
                  { key: 'all' as const, label: 'All' },
                  { key: 'transport' as const, label: `Transport (${transitData.percentage.toFixed(0)}%)` },
                  { key: 'energy' as const, label: `Energy (${energyData.percentage.toFixed(0)}%)` },
                  { key: 'food' as const, label: `Food (${foodData.percentage.toFixed(0)}%)` },
                  { key: 'goods' as const, label: `Waste (${goodsData.percentage.toFixed(0)}%)` },
                ].map((layer) => (
                  <button
                    key={layer.key}
                    onClick={() => setActivePulseLayer(layer.key)}
                    aria-pressed={activePulseLayer === layer.key}
                    className={`min-h-[38px] px-space-sm py-1 font-label-caps-sm text-label-caps-sm uppercase font-bold border border-on-surface transition-none ${
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-on-surface">
            {/* Visual Breakdown Diagram (Radial or Bar Chart View) */}
            <div className="lg:col-span-6 p-space-md border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col items-center justify-center relative min-h-[320px]">
              {breakdownView === 'radial' ? (
                <>
                  <svg
                    className="w-full max-w-[320px] h-auto text-on-surface"
                    fill="none"
                    viewBox="0 0 340 340"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Circular emissions chart showing footprint split across transport, home energy, food, and goods and waste"
                  >
                    <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="0" x2="340" y1="170" y2="170"></line>
                    <line stroke="currentColor" strokeDasharray="2 3" strokeWidth="1" x1="170" x2="170" y1="0" y2="340"></line>

                    {hasGoal && (
                      <>
                        <circle cx="170" cy="170" fill="none" r="50" stroke="#001fce" strokeDasharray="4 4" strokeWidth="2"></circle>
                        <text fill="#001fce" fontFamily="'Space Grotesk', sans-serif" fontSize="8" fontWeight="700" x="175" y="112">
                          Goal: {targetTonnes}t
                        </text>
                      </>
                    )}

                    <circle cx="170" cy="170" fill="none" r="85" stroke="#1c1b1b" strokeWidth="1"></circle>
                    <circle cx="170" cy="170" fill="none" r="120" stroke="#1c1b1b" strokeWidth="1"></circle>
                    <circle cx="170" cy="170" fill="none" r="155" stroke="#1c1b1b" strokeDasharray="3 3" strokeWidth="1"></circle>

                    {/* Layer Arcs with Standard Unified Colors */}
                    {(activePulseLayer === 'all' || activePulseLayer === 'transport') && (
                      <path d="M 170,30 A 140,140 0 0,1 306.8,200.7" fill="none" stroke="#00B0FF" strokeWidth="14"></path>
                    )}
                    {(activePulseLayer === 'all' || activePulseLayer === 'energy') && (
                      <path d="M 306.8,200.7 A 140,140 0 0,1 199.1,306.9" fill="none" stroke="#0022CC" strokeWidth="14"></path>
                    )}
                    {(activePulseLayer === 'all' || activePulseLayer === 'food') && (
                      <path d="M 199.1,306.9 A 140,140 0 0,1 78.4,275.6" fill="none" stroke="#FF4D30" strokeWidth="14"></path>
                    )}
                    {(activePulseLayer === 'all' || activePulseLayer === 'goods') && (
                      <path d="M 78.4,275.6 A 140,140 0 0,1 42.6,227.8" fill="none" stroke="#FFC700" strokeWidth="14"></path>
                    )}

                    {/* In-Chart Category Labels */}
                    <text fill="#00B0FF" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="700" x="250" y="70">
                      Transport {transitData.percentage.toFixed(0)}%
                    </text>
                    <text fill="#0022CC" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="700" x="260" y="270">
                      Energy {energyData.percentage.toFixed(0)}%
                    </text>
                    <text fill="#FF4D30" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="700" x="70" y="315">
                      Food {foodData.percentage.toFixed(0)}%
                    </text>
                    <text fill="#1c1b1b" fontFamily="'Space Grotesk', sans-serif" fontSize="10" fontWeight="700" x="15" y="225">
                      Waste {goodsData.percentage.toFixed(0)}%
                    </text>

                    <circle cx="170" cy="170" fill="#1c1b1b" r="16"></circle>
                    <circle cx="170" cy="170" fill="#ffffff" r="6"></circle>
                    <text fill="#ffffff" fontFamily="'Space Grotesk', sans-serif" fontSize="9" fontWeight="700" textAnchor="middle" x="170" y="173">
                      OFT
                    </text>
                  </svg>
                  <div className="w-full flex items-center justify-between pt-2 px-2 text-xs font-label-caps-sm uppercase font-bold text-on-surface-variant">
                    <span>{activityCount} {activityCount === 1 ? 'activity' : 'activities'} counted</span>
                    <span>100% total coverage</span>
                  </div>
                </>
              ) : (
                /* Alternate Horizontal Bar View */
                <div className="w-full h-full flex flex-col justify-center p-space-sm space-y-space-md">
                  <div className="border-b border-on-surface pb-1 flex items-center justify-between font-label-caps-sm uppercase font-bold">
                    <span className="text-primary">Horizontal Comparative View</span>
                    <span>{Math.round(currentTotalKg).toLocaleString('en-US')} kg total</span>
                  </div>
                  <div className="space-y-3 w-full">
                    <div>
                      <div className="flex justify-between text-xs font-bold font-label-caps-sm uppercase mb-1">
                        <span className="flex items-center gap-1.5 text-on-surface">
                          <span className="w-2.5 h-2.5 bg-[#00B0FF] border border-on-surface inline-block" />
                          Transport
                        </span>
                        <span>{Math.round(transitData.annualEmissionsKg)} kg ({transitData.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-6 bg-surface-container border-2 border-on-surface">
                        <div className="h-full bg-[#00B0FF]" style={{ width: `${Math.max(4, Math.min(100, transitData.percentage))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold font-label-caps-sm uppercase mb-1">
                        <span className="flex items-center gap-1.5 text-on-surface">
                          <span className="w-2.5 h-2.5 bg-[#0022CC] border border-on-surface inline-block" />
                          Home Energy
                        </span>
                        <span>{Math.round(energyData.annualEmissionsKg)} kg ({energyData.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-6 bg-surface-container border-2 border-on-surface">
                        <div className="h-full bg-[#0022CC]" style={{ width: `${Math.max(4, Math.min(100, energyData.percentage))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold font-label-caps-sm uppercase mb-1">
                        <span className="flex items-center gap-1.5 text-on-surface">
                          <span className="w-2.5 h-2.5 bg-[#FF4D30] border border-on-surface inline-block" />
                          Food
                        </span>
                        <span>{Math.round(foodData.annualEmissionsKg)} kg ({foodData.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-6 bg-surface-container border-2 border-on-surface">
                        <div className="h-full bg-[#FF4D30]" style={{ width: `${Math.max(4, Math.min(100, foodData.percentage))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold font-label-caps-sm uppercase mb-1">
                        <span className="flex items-center gap-1.5 text-on-surface">
                          <span className="w-2.5 h-2.5 bg-[#FFC700] border border-on-surface inline-block" />
                          Goods &amp; Waste
                        </span>
                        <span>{Math.round(goodsData.annualEmissionsKg)} kg ({goodsData.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-6 bg-surface-container border-2 border-on-surface">
                        <div className="h-full bg-[#FFC700]" style={{ width: `${Math.max(4, Math.min(100, goodsData.percentage))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Real-time Category Breakdown Bar & Metric Legend */}
            <div className="lg:col-span-6 p-space-md flex flex-col justify-between bg-surface-container-lowest">
              <div className="space-y-space-sm">
                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#00B0FF] border border-on-surface inline-block"></span>
                      <span>Transport</span>
                    </span>
                    <span className="font-mono">{Math.round(transitData.annualEmissionsKg).toLocaleString('en-US')} kg CO₂e ({transitData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-[#00B0FF] border-r border-on-surface" style={{ width: `${Math.min(100, transitData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#0022CC] border border-on-surface inline-block"></span>
                      <span>Home energy</span>
                    </span>
                    <span className="font-mono">{Math.round(energyData.annualEmissionsKg).toLocaleString('en-US')} kg CO₂e ({energyData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-[#0022CC] border-r border-on-surface" style={{ width: `${Math.min(100, energyData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#FF4D30] border border-on-surface inline-block"></span>
                      <span>Food</span>
                    </span>
                    <span className="font-mono">{Math.round(foodData.annualEmissionsKg).toLocaleString('en-US')} kg CO₂e ({foodData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-[#FF4D30] border-r border-on-surface" style={{ width: `${Math.min(100, foodData.percentage)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-3 h-3 bg-[#FFC700] border border-on-surface inline-block"></span>
                      <span>Goods &amp; waste</span>
                    </span>
                    <span className="font-mono">{Math.round(goodsData.annualEmissionsKg).toLocaleString('en-US')} kg CO₂e ({goodsData.percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full h-5 bg-surface-container border border-on-surface">
                    <div className="h-full bg-[#FFC700] border-r border-on-surface" style={{ width: `${Math.min(100, goodsData.percentage)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-space-md pt-space-xs border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                <span>Total: {Math.round(currentTotalKg).toLocaleString('en-US')} kg CO₂e (100.0%)</span>
                <Link href="/calculate" className="min-h-[44px] inline-flex items-center text-primary hover:underline font-bold">
                  How we calculate this →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 4-COLUMN SECTOR BREAKDOWN GRID (Standardized Sector Badges & Clear Display Numbers) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-on-surface">
          {/* Sector 1: Transport */}
          <div className="p-space-md md:p-space-lg border-b lg:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-2 bg-[#00B0FF] mb-space-sm border border-on-surface"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 01</span>
                <SectorBadge category="transport" />
              </div>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-2">TRANSPORT</h3>
              <div className="my-space-md">
                <div className="font-display text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-none">
                  {Math.round(transitData.annualEmissionsKg).toLocaleString('en-US')}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  kg CO₂e • {transitData.percentage.toFixed(1)}% SHARE
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Direct vehicle travel, flights, and public mobility footprint.
              </p>
            </div>
            <div className="pt-space-sm mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE SHIFT →
              </Link>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">directions_subway</span>
            </div>
          </div>

          {/* Sector 2: Home Energy */}
          <div className="p-space-md md:p-space-lg border-b lg:border-b-0 md:border-r lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-2 bg-[#0022CC] mb-space-sm border border-on-surface"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 02</span>
                <SectorBadge category="energy" />
              </div>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-2">HOME ENERGY</h3>
              <div className="my-space-md">
                <div className="font-display text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-none">
                  {Math.round(energyData.annualEmissionsKg).toLocaleString('en-US')}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  kg CO₂e • {energyData.percentage.toFixed(1)}% SHARE
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Grid electricity load and residential thermal baseline heating power.
              </p>
            </div>
            <div className="pt-space-sm mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE SOLAR →
              </Link>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">bolt</span>
            </div>
          </div>

          {/* Sector 3: Food */}
          <div className="p-space-md md:p-space-lg border-b md:border-b-0 border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-2 bg-[#FF4D30] mb-space-sm border border-on-surface"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 03</span>
                <SectorBadge category="food" />
              </div>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-2">FOOD</h3>
              <div className="my-space-md">
                <div className="font-display text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-none">
                  {Math.round(foodData.annualEmissionsKg).toLocaleString('en-US')}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  kg CO₂e • {foodData.percentage.toFixed(1)}% SHARE
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Dietary protein patterns and agricultural supply chain footprint.
              </p>
            </div>
            <div className="pt-space-sm mt-space-md border-t border-on-surface flex items-center justify-between">
              <Link href="/simulator" className="font-label-caps-sm text-label-caps-sm uppercase text-primary font-bold hover:underline">
                SIMULATE PLANT DAYS →
              </Link>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">restaurant</span>
            </div>
          </div>

          {/* Sector 4: Goods & Waste */}
          <div className="p-space-md md:p-space-lg bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <div className="w-full h-2 bg-[#FFC700] mb-space-sm border border-on-surface"></div>
              <div className="flex items-center justify-between">
                <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">SECTOR 04</span>
                <SectorBadge category="waste" />
              </div>
              <h3 className="font-headline text-headline-sm uppercase text-on-surface font-bold mt-2">GOODS &amp; WASTE</h3>
              <div className="my-space-md">
                <div className="font-display text-4xl lg:text-5xl text-on-surface font-bold tracking-tight leading-none">
                  {Math.round(goodsData.annualEmissionsKg).toLocaleString('en-US')}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  kg CO₂e • {goodsData.percentage.toFixed(1)}% SHARE
                </div>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Municipal landfill waste, recycling diversion, and consumer goods.
              </p>
            </div>
            <div className="pt-space-sm mt-space-md border-t border-on-surface flex items-center justify-between">
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
        <div className="lg:col-span-6 p-space-md md:p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-xs mb-space-sm">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Your goal progress
              </span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface font-bold">
                {hasGoal ? (progress?.status === 'over' ? 'Over goal' : 'On track') : 'No goal set'}
              </span>
            </div>

            {hasGoal && targetCapKg ? (
              <>
                <div className="py-space-sm">
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
                <div className="space-y-space-xs my-space-sm">
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

                <div className="p-space-sm border border-on-surface bg-surface-container-low mt-space-md space-y-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                      What this means
                    </span>
                    <span className={`px-space-xs py-0.5 font-label-caps-sm text-label-caps-sm uppercase font-bold ${currentTotalKg <= targetCapKg ? 'bg-primary text-on-primary' : 'bg-coral-accent text-on-surface'
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
              </>
            ) : (
              <div className="py-space-lg text-center space-y-space-sm">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant block" aria-hidden="true">
                  track_changes
                </span>
                <div className="font-headline text-headline-md uppercase font-bold">
                  No Goal Set Yet
                </div>
                <p className="font-body-md text-on-surface-variant max-w-sm mx-auto">
                  Set a carbon reduction ceiling to measure progress across your daily log and reduction plan.
                </p>
                <div className="pt-space-md">
                  <Link
                    href="/goals"
                    className="inline-block min-h-[44px] px-space-md py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
                  >
                    Set a yearly goal →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
            <span>Goal updates everywhere automatically</span>
            <Link href="/goals" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
              {hasGoal ? 'Change my goal →' : 'Set a goal →'}
            </Link>
          </div>
        </div>

        {/* Right: Latest insights */}
        <div className="lg:col-span-6 p-space-md md:p-space-lg bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-on-surface pb-space-xs mb-space-sm">
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
                      <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs shrink-0 ${ins.isAnomaly ? 'bg-coral-accent text-on-surface' : 'bg-primary text-white'
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

            <div className="mt-space-md">
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

          <div className="pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
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
