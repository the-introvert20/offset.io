'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notice from '@/components/Notice';
import { formatCurrency } from '@/lib/format';

interface OptimizationResponse {
  currentAnnualKg: number;
  optimization: {
    targetEmissionsKg: number;
    targetReductionKg: number;
    projectedEmissionsKg: number;
    achievedReductionKg: number;
    achievedReductionPct: number;
    totalMonthlyCost: number;
    isTargetAchieved: boolean;
    selectedActions: {
      id: string;
      title: string;
      explanation: string;
      category: string;
      estimatedReductionKg: number;
      estimatedCostMonthly: number;
      difficulty: string;
      priority: string;
    }[];
    unselectedActions: {
      id: string;
      title: string;
      explanation: string;
      category: string;
      estimatedReductionKg: number;
      estimatedCostMonthly: number;
      difficulty: string;
      priority: string;
    }[];
    explanation: string;
    algorithmNote: string;
  };
}

export default function ReductionPlanPage() {
  const [targetPct, setTargetPct] = useState(20);
  const [budget, setBudget] = useState(100);
  const [currency, setCurrency] = useState('USD');
  const [prefilled, setPrefilled] = useState(false);
  const [excludeCategories, setExcludeCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResponse | null>(null);

  // Prefill the target when arriving from the simulator (?target=15).
  // Also load the profile currency so all money uses the user's setting.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const target = Number(params.get('target'));
      if (Number.isFinite(target) && target >= 5 && target <= 60) {
        setTargetPct(Math.round(target));
        setPrefilled(true);
      }
    } catch {
      // ignore malformed URLs
    }
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.currency) setCurrency(data.profile.currency);
        if (typeof data?.profile?.monthlyBudget === 'number') setBudget(data.profile.monthlyBudget);
      })
      .catch(() => {});
  }, []);

  const toggleCategory = (cat: string) => {
    if (excludeCategories.includes(cat)) {
      setExcludeCategories(excludeCategories.filter((c) => c !== cat));
    } else {
      setExcludeCategories([...excludeCategories, cat]);
    }
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPlanError(null);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetReductionPct: targetPct,
          maxMonthlyBudget: budget,
          forbiddenCategories: excludeCategories,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setResult(data);
      } else {
        setPlanError('We couldn’t build that plan. Try a smaller target or a larger budget.');
      }
    } catch {
      setPlanError('Connection problem. Your data is safe — try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const costLabel = (monthly: number) => {
    if (monthly < 0) return `Saves ${formatCurrency(monthly, currency)}/mo`;
    if (monthly === 0) return 'Free';
    return `${formatCurrency(monthly, currency)}/mo`;
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-coral-accent animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            My reduction plan
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            The most effective actions for your budget
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Goal: −{targetPct}% CO₂e
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm">
          <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
            Step 3 · Build a plan
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            Make a dent: your reduction plan
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Tell us how much you want to cut and what you can spend each month. We&apos;ll pick the combination of actions that saves the most emissions for that budget.
          </p>
          {prefilled && (
            <p className="font-body-sm text-body-sm text-primary font-bold mt-2">
              We carried over your simulator result as the target — adjust it freely.
            </p>
          )}
        </div>

        {/* Form and Controls */}
        <form onSubmit={handleOptimize} className="border border-on-surface p-space-md bg-surface-container-low space-y-space-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Target Slider */}
            <div className="border border-on-surface p-space-sm bg-surface-container-lowest space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <label htmlFor="plan-target">How much to cut</label>
                <span className="text-primary font-headline text-headline-sm">−{targetPct}%</span>
              </div>
              <input
                id="plan-target"
                type="range"
                min="5"
                max="60"
                step="5"
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>−5% (gentle)</span>
                <span>−20% (typical)</span>
                <span>−60% (ambitious)</span>
              </div>
            </div>

            {/* Budget Slider */}
            <div className="border border-on-surface p-space-sm bg-surface-container-lowest space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <label htmlFor="plan-budget">Monthly budget</label>
                <span className="text-secondary font-headline text-headline-sm">{formatCurrency(budget, currency)} / mo</span>
              </div>
              <input
                id="plan-budget"
                type="range"
                min="0"
                max="5000"
                step="100"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>{formatCurrency(0, currency)} (free only)</span>
                <span>{formatCurrency(1000, currency)}</span>
                <span>{formatCurrency(5000, currency)}</span>
              </div>
            </div>

            {/* Excluded Sectors */}
            <div className="border border-on-surface p-space-sm bg-surface-container-lowest space-y-1">
              <span className="font-label-caps-md uppercase font-bold block mb-1" id="plan-exclude-label">
                Leave out (optional)
              </span>
              <div className="grid grid-cols-2 gap-1 font-label-caps-sm uppercase font-bold" role="group" aria-labelledby="plan-exclude-label">
                {['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    aria-pressed={excludeCategories.includes(cat)}
                    className={`min-h-[44px] p-1 border border-on-surface text-center truncate ${
                      excludeCategories.includes(cat) ? 'bg-coral-accent text-on-surface' : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    {excludeCategories.includes(cat) ? `Skip ${cat.toLowerCase()}` : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              Free and money-saving actions are always preferred
            </span>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-space-xl py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center space-x-1"
            >
              <span>{loading ? 'Building…' : 'Build my plan →'}</span>
            </button>
          </div>
          {planError && <Notice tone="error">{planError}</Notice>}
        </form>

        {/* Optimization Output */}
        {result && (
          <div className="space-y-space-lg">
            {/* KPI Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 border border-on-surface">
              <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
                <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold block">BASE EMISSIONS</span>
                <div className="font-display text-3xl font-bold mt-1">
                  {(result.currentAnnualKg / 1000).toFixed(2)} <span className="text-sm font-headline">t CO₂e</span>
                </div>
              </div>

              <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
                <span className="font-label-caps-sm uppercase text-primary font-bold block">PROJECTED EMISSIONS</span>
                <div className="font-display text-3xl font-bold mt-1 text-primary">
                  {(result.optimization.projectedEmissionsKg / 1000).toFixed(2)} <span className="text-sm font-headline">t CO₂e</span>
                </div>
              </div>

              <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-cyan-accent text-on-surface">
                <span className="font-label-caps-sm uppercase font-bold block">You&apos;d save</span>
                <div className="font-display text-3xl font-bold mt-1">
                  −{Math.round(result.optimization.achievedReductionKg).toLocaleString('en-US')} <span className="text-sm font-headline">kg/yr</span>
                </div>
                <span className="font-label-caps-sm uppercase font-bold">
                  ({result.optimization.achievedReductionPct.toFixed(1)}% less)
                </span>
              </div>

              <div className="p-space-md bg-yellow-accent text-on-surface">
                <span className="font-label-caps-sm uppercase font-bold block">Monthly cost</span>
                <div className="font-display text-3xl font-bold mt-1">
                  {formatCurrency(result.optimization.totalMonthlyCost, currency)} <span className="text-sm font-headline">/ mo</span>
                </div>
                <span className="font-label-caps-sm uppercase font-bold">
                  Of {formatCurrency(budget, currency)} budget
                </span>
              </div>
            </div>

            {/* Selected Interventions Grid */}
            <div className="border border-on-surface bg-surface-container-lowest p-space-lg space-y-space-md">
              <div className="flex items-center justify-between border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold">
                <span>Suggested actions ({result.optimization.selectedActions.length})</span>
                <span className="text-primary font-bold">{result.optimization.isTargetAchieved ? 'Reaches your target' : 'Partial — see note below'}</span>
              </div>

              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                {result.optimization.explanation}
              </p>

              <div className="space-y-space-xs">
                {result.optimization.selectedActions.map((action, idx) => (
                  <div
                    key={action.id || idx}
                    className="p-space-md border border-on-surface bg-surface-container-lowest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-surface-container-low transition-none"
                  >
                    <div className="flex items-start space-x-space-md">
                      <span className="w-8 h-8 bg-on-surface text-surface-container-lowest flex items-center justify-center font-label-caps-sm font-bold shrink-0">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-label-caps-md uppercase font-bold text-on-surface">{action.title}</span>
                          <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-label-caps-sm uppercase font-bold">
                            {action.category}
                          </span>
                        </div>
                        <p className="font-body-sm text-on-surface-variant mt-1">{action.explanation}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="px-space-xs py-0.5 bg-cyan-accent text-on-surface font-label-caps-sm uppercase font-bold border border-on-surface">
                        −{Math.round(action.estimatedReductionKg).toLocaleString('en-US')} kg CO₂e
                      </span>
                      <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                        {costLabel(action.estimatedCostMonthly)} • {action.difficulty.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-space-md p-space-sm bg-surface-container border border-on-surface font-label-caps-sm uppercase text-on-surface-variant">
                <strong>How we chose these:</strong> {result.optimization.algorithmNote || 'Actions are ranked by emissions saved per unit of money spent.'}
              </div>

              {result.optimization.unselectedActions.length > 0 && (
                <details className="mt-space-md border border-on-surface bg-surface-container-low">
                  <summary className="min-h-[44px] p-space-sm font-label-caps-sm uppercase font-bold cursor-pointer">
                    {result.optimization.unselectedActions.length} more ideas that didn&apos;t fit this budget
                  </summary>
                  <div className="p-space-sm space-y-space-xs border-t border-on-surface">
                    {result.optimization.unselectedActions.map((action, idx) => (
                      <div key={action.id || idx} className="font-body-sm text-body-sm text-on-surface-variant">
                        <strong className="text-on-surface">{action.title}</strong>
                        {' '}— saves ≈{Math.round(action.estimatedReductionKg).toLocaleString('en-US')} kg/yr · {costLabel(action.estimatedCostMonthly)}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
