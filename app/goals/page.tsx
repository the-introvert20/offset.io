'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notice from '@/components/Notice';

export default function GoalsPage() {
  const [goal, setGoal] = useState<{
    targetAnnualEmissionsKg: number;
    reductionPercentage: number;
    targetYear: number;
    targetMonthlyEmissionsKg?: number;
  } | null>(null);
  const [targetKg, setTargetKg] = useState(3800);
  const [reductionPct, setReductionPct] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchGoal = () => {
    fetch('/api/goals')
      .then((res) => res.json())
      .then((data) => {
        if (data.goal) {
          setGoal(data.goal);
          setTargetKg(data.goal.targetAnnualEmissionsKg);
          setReductionPct(data.goal.reductionPercentage);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchGoal();
  }, []);

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAnnualEmissionsKg: Number(targetKg),
          reductionPercentage: Number(reductionPct),
          targetYear: 2026,
        }),
      });

      if (res.ok) {
        fetchGoal();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError('We couldn’t save that goal. Check the values and try again.');
      }
    } catch {
      setSaveError('Connection problem. Your current goal is unchanged — try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" aria-hidden="true" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          Loading your goal…
        </span>
      </div>
    );
  }

  const monthlyBudgetKg = Math.round(targetKg / 12);
  const dailyBudgetKg = (targetKg / 365).toFixed(1);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Your carbon goal
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Goal: {(targetKg / 1000).toFixed(2)} t CO₂e / yr • −{reductionPct}%
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            {monthlyBudgetKg} kg / month
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">track_changes</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              Your ceiling for the year
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              Goals
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Set the yearly total you&apos;re aiming for. Your overview, plan, and scenarios all measure against it.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/reduction-plan"
              className="px-space-md py-space-xs bg-surface-container border border-on-surface font-label-caps-md uppercase font-bold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              REDUCTION PLAN →
            </Link>
          </div>
        </div>

        {/* Current Goal KPI Row */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 border border-on-surface">
          <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold block">
              ANNUAL TARGET CEILING
            </span>
            <div className="font-display text-4xl font-bold mt-1 text-on-surface">
              {(targetKg / 1000).toFixed(2)} <span className="text-sm font-headline uppercase">t CO₂e</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              {targetKg.toLocaleString()} KG GROSS
            </span>
          </div>

          <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold block">
              MONTHLY BUDGET
            </span>
            <div className="font-display text-4xl font-bold mt-1 text-primary">
              {monthlyBudgetKg} <span className="text-sm font-headline uppercase">kg</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              {dailyBudgetKg} kg per day
            </span>
          </div>

          <div className="p-space-md bg-surface-container-lowest">
            <span className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold block">
              Reduction aim
            </span>
            <div className="font-display text-4xl font-bold mt-1 text-primary">
              −{reductionPct}<span className="text-sm font-headline">%</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              Compared with where you started
            </span>
          </div>
        </div>

        {/* Two-column layout: Current Goal + Edit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Current Active Goal */}
          <div className="lg:col-span-5 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low">
            <div className="flex items-center justify-between border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Your current goal
              </span>
              <span className="px-space-xs py-0.5 bg-primary text-on-primary font-label-caps-sm text-label-caps-sm uppercase font-bold">
                {goal ? 'Set' : 'Not set yet'}
              </span>
            </div>

            {goal ? (
              <div className="space-y-space-md">
                <div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mb-space-xs">
                    ANNUAL TARGET
                  </div>
                    <div className="font-display text-[clamp(2.5rem,8vw,3.5rem)] font-bold text-on-surface leading-none">
                      {(goal.targetAnnualEmissionsKg / 1000).toFixed(2)}
                    </div>
                  <div className="font-headline text-headline-md uppercase text-on-surface font-bold">
                    t CO₂e / YEAR
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-space-sm border-t border-on-surface pt-space-md">
                  <div className="border border-on-surface p-space-sm bg-surface-container-lowest">
                    <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                      MONTHLY
                    </div>
                    <div className="font-headline text-headline-md font-bold text-on-surface mt-0.5">
                      {Math.round(goal.targetAnnualEmissionsKg / 12)} kg
                    </div>
                  </div>
                  <div className="border border-on-surface p-space-sm bg-surface-container-lowest">
                    <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold">
                      REDUCTION
                    </div>
                    <div className="font-headline text-headline-md font-bold text-primary mt-0.5">
                      −{goal.reductionPercentage}%
                    </div>
                  </div>
                </div>

                <div className="p-space-sm border border-on-surface bg-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Target year: {goal.targetYear || 2026} • applies to your whole footprint
                </div>
              </div>
            ) : (
              <div className="text-center py-space-xl">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant block mb-space-sm" aria-hidden="true">
                  track_changes
                </span>
                <span className="font-label-caps-md uppercase font-bold text-on-surface-variant">
                  No goal set yet
                </span>
                <p className="font-body-sm text-on-surface-variant mt-2">
                  Pick a yearly total with the form — for example 20% below where you are now.
                </p>
              </div>
            )}
          </div>

          {/* Update Form */}
          <div className="lg:col-span-7 p-space-lg bg-surface-container-lowest">
            <div className="border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Change my goal
              </span>
            </div>

            <form onSubmit={handleUpdateGoal} className="space-y-space-md">
              {/* Target Kg Slider */}
              <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
                <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                  <label htmlFor="goal-target">Yearly total</label>
                  <span className="text-primary font-headline text-headline-sm">{targetKg.toLocaleString()} kg</span>
                </div>
                <input
                  id="goal-target"
                  type="range"
                  min="1000"
                  max="10000"
                  step="100"
                  value={targetKg}
                  onChange={(e) => setTargetKg(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>1,000 kg (very low)</span>
                  <span>2,300 kg</span>
                  <span>10,000 kg</span>
                </div>
              </div>

              {/* Reduction % Slider */}
              <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
                <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                  <label htmlFor="goal-reduction">Reduction aim</label>
                  <span className="text-primary font-headline text-headline-sm">−{reductionPct}%</span>
                </div>
                <input
                  id="goal-reduction"
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={reductionPct}
                  onChange={(e) => setReductionPct(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>−5% (gentle)</span>
                  <span>−20% (typical)</span>
                  <span>−60% (ambitious)</span>
                </div>
              </div>

              {/* Preview */}
              <div className="border border-on-surface p-space-sm bg-surface-container-low grid grid-cols-3 gap-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold">
                <div>
                  <div className="text-on-surface-variant">MONTHLY CAP</div>
                  <div className="font-headline text-headline-sm text-on-surface mt-0.5">{monthlyBudgetKg} kg</div>
                </div>
                <div>
                  <div className="text-on-surface-variant">DAILY BUDGET</div>
                  <div className="font-headline text-headline-sm text-on-surface mt-0.5">{dailyBudgetKg} kg</div>
                </div>
                <div>
                  <div className="text-on-surface-variant">Yearly goal</div>
                  <div className="font-headline text-headline-sm text-on-surface mt-0.5">{targetKg.toLocaleString()} kg</div>
                </div>
              </div>

              {saveError && <Notice tone="error">{saveError}</Notice>}

              <button
                type="submit"
                disabled={saving}
                className={`min-h-[44px] w-full py-space-sm px-space-lg font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface flex items-center justify-center gap-space-xs transition-none ${
                  saved
                    ? 'bg-primary text-on-primary'
                    : 'bg-on-surface text-surface-container-lowest hover:bg-primary'
                } disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {saved ? 'check' : 'save'}
                </span>
                <span>
                  {saving ? 'Saving…' : saved ? 'Goal saved' : 'Save goal →'}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-on-surface pt-space-md flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
          <span>Saving updates your overview automatically</span>
          <Link href="/dashboard" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
            See my progress →
          </Link>
        </div>
      </div>
    </div>
  );
}
