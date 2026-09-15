'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmButton from '@/components/ConfirmButton';
import Notice from '@/components/Notice';
import { formatCurrency, formatMonthlyDelta, currencySymbol } from '@/lib/format';
import { loadSimulatorSnapshot, clearSimulatorSnapshot, type SimulatorSnapshot } from '@/lib/simulator-snapshot';

interface Scenario {
  id: string;
  name: string;
  description: string;
  totalAnnualEmissionsKg: number;
  estimatedCostDeltaMonthly: number;
  createdAt: string;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [baselineKg, setBaselineKg] = useState<number | null>(null);
  const [goalKg, setGoalKg] = useState<number | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [baselineActivities, setBaselineActivities] = useState<Array<{ category: string; activityType: string; subtype: string; frequency: string; quantity: number; unit: string; region?: string }>>([]);
  const [loadError, setLoadError] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SimulatorSnapshot | null>(null);

  // New scenario modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costDelta, setCostDelta] = useState(0);

  const fetchScenarios = useCallback(() => {
    fetch('/api/scenarios')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.scenarios) setScenarios(data.scenarios);
      })
      .catch(() => setLoadError(true));

    fetch('/api/dashboard')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.footprint?.totalAnnualEmissionsKg) {
          setBaselineKg(data.footprint.totalAnnualEmissionsKg);
          setBaselineActivities(data.footprint.calculations.map((calculation: { category: string; activityType: string; subtype: string; frequency: string; quantity: number; unit: string; region?: string }) => ({
            category: calculation.category, activityType: calculation.activityType, subtype: calculation.subtype, frequency: calculation.frequency, quantity: calculation.quantity, unit: calculation.unit, region: calculation.region,
          })));
        }
        if (data?.goal?.targetAnnualEmissionsKg) setGoalKg(data.goal.targetAnnualEmissionsKg);
      })
      .catch(() => {
        setLoadError(true);
      });

    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.currency) setCurrency(data.profile.currency);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchScenarios();
    // If the user arrived from the simulator, offer their exact settings.
    try {
      if (typeof window !== 'undefined' && window.location.search.includes('from=simulator')) {
        const snap = loadSimulatorSnapshot();
        if (snap) {
          setSnapshot(snap);
          setShowModal(true);
        }
      }
    } catch {
      // ignore malformed URLs
    }
  }, [fetchScenarios]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowModal(false);
        setSnapshot(null);
        setCreateError(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    const activities = snapshot?.activities ?? baselineActivities;
    if (!activities || activities.length === 0) {
      setCreateError('There are no activities to base this scenario on yet. Finish setup first, or come back from the simulator.');
      return;
    }
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          estimatedCostDeltaMonthly: Number(costDelta),
          activities,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        setCostDelta(0);
        setSnapshot(null);
        clearSimulatorSnapshot();
        fetchScenarios();
      } else {
        const data = await res.json().catch(() => null);
        setCreateError(
          data?.error === 'EMISSION_FACTOR_NOT_FOUND'
            ? 'We couldn’t price one of these activities with our current factors.'
            : 'We couldn’t save that scenario. Check the details and try again.'
        );
      }
    } catch {
      setCreateError('Connection problem. Your scenarios are safe — try again in a moment.');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/scenarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchScenarios();
      } else {
        setDeleteError('We couldn’t delete that scenario. Try again.');
      }
    } catch {
      setDeleteError('Connection problem. Try again in a moment.');
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            My scenarios
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Compare different versions of your lifestyle
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Today: {baselineKg !== null ? `${(baselineKg / 1000).toFixed(2)} t CO₂e / yr` : '…'}
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              What-if versions of your life
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              My scenarios
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Save different versions of your setup — for example “bus instead of car” — and compare them side by side on emissions and monthly cost.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setSnapshot(null); setCreateError(null); setShowModal(true); }}
            className="min-h-[44px] px-space-lg py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center space-x-1"
          >
            <span>+ New scenario</span>
          </button>
        </div>

        {loadError && (
          <Notice tone="error">
            We couldn&apos;t load your scenarios. Check your connection and refresh the page — your saved scenarios are safe.
          </Notice>
        )}
        {deleteError && (
          <Notice tone="error">{deleteError}</Notice>
        )}

        {/* Comparison table */}
        <div className="border border-on-surface overflow-x-auto bg-surface-container-lowest">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-on-surface font-label-caps-sm uppercase text-on-surface">
                <th scope="col" className="p-space-sm border-r border-on-surface font-bold">Scenario</th>
                <th scope="col" className="p-space-sm border-r border-on-surface font-bold">Per year</th>
                <th scope="col" className="p-space-sm border-r border-on-surface font-bold">Vs today</th>
                <th scope="col" className="p-space-sm border-r border-on-surface font-bold">Monthly cost change</th>
                <th scope="col" className="p-space-sm border-r border-on-surface font-bold">Vs my goal</th>
                <th scope="col" className="p-space-sm font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface font-body-sm text-on-surface">
              {/* Baseline Row */}
              <tr className="bg-surface-container-lowest font-bold">
                <td className="p-space-sm border-r border-on-surface">
                  <div className="font-label-caps-md uppercase text-on-surface">Your setup today</div>
                  <div className="font-body-sm text-on-surface-variant font-normal">Your saved activities</div>
                </td>
                <td className="p-space-sm border-r border-on-surface font-display text-lg font-bold">
                  {baselineKg !== null ? `${(baselineKg / 1000).toFixed(2)} t` : '…'}
                </td>
                <td className="p-space-sm border-r border-on-surface font-mono">0 kg (0.0%)</td>
                <td className="p-space-sm border-r border-on-surface font-mono">{formatCurrency(0, currency)}</td>
                <td className="p-space-sm border-r border-on-surface">
                  {baselineKg !== null && goalKg !== null ? (
                    <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-label-caps-sm uppercase">
                      {baselineKg <= goalKg ? 'Under goal' : 'Over goal'}
                    </span>
                  ) : (
                    <span className="font-label-caps-sm uppercase text-on-surface-variant">…</span>
                  )}
                </td>
                <td className="p-space-sm text-right font-label-caps-sm uppercase text-on-surface-variant">
                  Current
                </td>
              </tr>

              {/* Custom Scenarios */}
              {scenarios.map((sc) => {
                const redKg = baselineKg !== null ? baselineKg - sc.totalAnnualEmissionsKg : 0;
                const redPct = baselineKg ? ((redKg / baselineKg) * 100).toFixed(1) : '0.0';
                const underGoal = goalKg !== null && sc.totalAnnualEmissionsKg <= goalKg;
                return (
                  <tr key={sc.id} className="hover:bg-surface-container-low transition-none">
                    <td className="p-space-sm border-r border-on-surface">
                      <div className="font-label-caps-md uppercase font-bold text-on-surface">{sc.name}</div>
                      <div className="font-body-sm text-on-surface-variant">{sc.description}</div>
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-display text-lg font-bold text-primary">
                      {(sc.totalAnnualEmissionsKg / 1000).toFixed(2)} t
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-mono font-bold text-primary">
                      {baselineKg !== null
                        ? (redKg >= 0 ? `−${Math.round(redKg).toLocaleString('en-US')} kg (${redPct}%)` : `+${Math.round(-redKg).toLocaleString('en-US')} kg`)
                        : '…'}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-mono">
                      {formatMonthlyDelta(sc.estimatedCostDeltaMonthly, currency)}
                    </td>
                    <td className="p-space-sm border-r border-on-surface">
                      {goalKg !== null ? (
                        <span className={`px-space-xs py-0.5 border border-on-surface font-label-caps-sm uppercase font-bold ${
                          underGoal ? 'bg-primary text-on-primary' : 'bg-yellow-accent text-on-surface'
                        }`}>
                          {underGoal ? 'Under goal' : 'Over goal'}
                        </span>
                      ) : (
                        <span className="font-label-caps-sm uppercase text-on-surface-variant">Set a goal first</span>
                      )}
                    </td>
                    <td className="p-space-sm text-right space-x-2">
                      <ConfirmButton
                        label="Delete"
                        confirmLabel="Confirm delete"
                        ariaLabel={`Delete scenario ${sc.name}`}
                        onConfirm={() => handleDeleteScenario(sc.id)}
                        className="font-label-caps-sm uppercase font-bold text-error hover:underline"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loadError && baselineKg !== null && scenarios.length === 0 && (
          <Notice tone="info">
            No scenarios yet. Create one from your current setup, or tune the controls in <Link href="/simulator" className="underline font-bold">Try changes</Link> and choose “Save as scenario” there.
          </Notice>
        )}

        {/* Modal for Creating New Scenario */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="scenario-modal-title"
              className="w-full max-w-lg border border-on-surface bg-surface-container-lowest p-space-lg space-y-space-md shadow-hard-offset"
            >
              <div className="flex items-center justify-between border-b border-on-surface pb-space-xs">
                <span id="scenario-modal-title" className="font-label-caps-md uppercase font-bold text-on-surface">New scenario</span>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setSnapshot(null); setCreateError(null); }}
                  aria-label="Close dialog"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center font-bold text-on-surface hover:text-error"
                >
                  ✕
                </button>
              </div>

              {snapshot ? (
                <Notice tone="info">
                  Using your simulator settings ({snapshot.summary}). Give it a name to save it.
                </Notice>
              ) : (
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  This saves a copy of your current setup ({baselineActivities.length} {baselineActivities.length === 1 ? 'activity' : 'activities'}). Totals are recalculated on save.
                </p>
              )}
              {createError && <Notice tone="error">{createError}</Notice>}

              <form onSubmit={handleCreateScenario} className="space-y-space-sm">
                <div>
                  <label htmlFor="scenario-name" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Scenario name
                  </label>
                  <input
                    id="scenario-name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. bus to work + greener power"
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="scenario-desc" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    What changes in this version? (optional)
                  </label>
                  <textarea
                    id="scenario-desc"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short note about the assumptions…"
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="scenario-cost" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Monthly cost change ({currencySymbol(currency)}) — use a minus for savings
                  </label>
                  <input
                    id="scenario-cost"
                    type="number"
                    value={costDelta}
                    onChange={(e) => setCostDelta(Number(e.target.value))}
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface focus:outline-none"
                  />
                </div>

                <div className="pt-space-sm flex justify-end space-x-2 border-t border-on-surface">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setSnapshot(null); setCreateError(null); }}
                    className="min-h-[44px] px-space-md py-space-xs border border-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-space-lg py-space-xs bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface"
                  >
                    Save scenario
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
