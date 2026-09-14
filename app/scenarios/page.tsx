'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
  const [baselineKg, setBaselineKg] = useState(4800);
  const [baselineActivities, setBaselineActivities] = useState<Array<{ category: string; activityType: string; subtype: string; frequency: string; quantity: number; unit: string; region?: string }>>([]);
  const [loading, setLoading] = useState(true);

  // New scenario modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [costDelta, setCostDelta] = useState(0);

  const fetchScenarios = useCallback(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => {
        if (data.scenarios) setScenarios(data.scenarios);
      })
      .catch(() => {});

    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.footprint?.totalAnnualEmissionsKg) {
          setBaselineKg(data.footprint.totalAnnualEmissionsKg);
          setBaselineActivities(data.footprint.calculations.map((calculation: { category: string; activityType: string; subtype: string; frequency: string; quantity: number; unit: string; region?: string }) => ({
            category: calculation.category, activityType: calculation.activityType, subtype: calculation.subtype, frequency: calculation.frequency, quantity: calculation.quantity, unit: calculation.unit, region: calculation.region,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          estimatedCostDeltaMonthly: Number(costDelta),
          // A scenario begins as an explicit snapshot of the user's current
          // baseline; editing activity assumptions can be added without hidden defaults.
          activities: baselineActivities,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        setDescription('');
        setCostDelta(0);
        fetchScenarios();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    try {
      await fetch(`/api/scenarios?id=${id}`, { method: 'DELETE' });
      fetchScenarios();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            SCENARIOS &amp; MULTI-CRITERIA MATRIX
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            SIDE-BY-SIDE LIFESTYLE INTERVENTION COMPARISONS
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            BASELINE: {(baselineKg / 1000).toFixed(2)} t CO₂e / YR
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              LIFESTYLE TRANSFORMATIONS
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              SCENARIOS MATRIX
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Compare saved transformation plans side-by-side on emissions reduction, budgetary impact, and trajectory slope.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-space-lg py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center space-x-1"
          >
            <span>+ NEW SCENARIO</span>
          </button>
        </div>

        {/* Matrix Table */}
        <div className="border border-on-surface overflow-x-auto bg-surface-container-lowest">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-on-surface font-label-caps-sm uppercase text-on-surface">
                <th className="p-space-sm border-r border-on-surface font-bold">SCENARIO IDENTIFIER</th>
                <th className="p-space-sm border-r border-on-surface font-bold">ANNUAL EMISSIONS</th>
                <th className="p-space-sm border-r border-on-surface font-bold">NET REDUCTION</th>
                <th className="p-space-sm border-r border-on-surface font-bold">MONTHLY COST DELTA</th>
                <th className="p-space-sm border-r border-on-surface font-bold">PARIS STATUS</th>
                <th className="p-space-sm font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-on-surface font-body-sm text-on-surface">
              {/* Baseline Row */}
              <tr className="bg-surface-container-lowest font-bold">
                <td className="p-space-sm border-r border-on-surface">
                  <div className="font-label-caps-md uppercase text-on-surface">CURRENT BASELINE</div>
                  <div className="font-body-sm text-on-surface-variant font-normal">Active lifestyle parameters</div>
                </td>
                <td className="p-space-sm border-r border-on-surface font-display text-lg font-bold">
                  {(baselineKg / 1000).toFixed(2)} t
                </td>
                <td className="p-space-sm border-r border-on-surface font-mono">0 kg (0.0%)</td>
                <td className="p-space-sm border-r border-on-surface font-mono">₹0 / mo</td>
                <td className="p-space-sm border-r border-on-surface">
                  <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-label-caps-sm uppercase">
                    {baselineKg <= 2300 ? 'COMPLIANT' : 'DEFICIT'}
                  </span>
                </td>
                <td className="p-space-sm text-right font-label-caps-sm uppercase text-on-surface-variant">
                  CURRENT
                </td>
              </tr>

              {/* Custom Scenarios */}
              {scenarios.map((sc) => {
                const redKg = baselineKg - sc.totalAnnualEmissionsKg;
                const redPct = ((redKg / baselineKg) * 100).toFixed(1);
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
                      {redKg >= 0 ? `−${redKg} kg (${redPct}%)` : `+${-redKg} kg`}
                    </td>
                    <td className="p-space-sm border-r border-on-surface font-mono">
                      {sc.estimatedCostDeltaMonthly > 0
                        ? `+₹${sc.estimatedCostDeltaMonthly}/mo`
                        : sc.estimatedCostDeltaMonthly < 0
                        ? `−₹${Math.abs(sc.estimatedCostDeltaMonthly)}/mo`
                        : '₹0'}
                    </td>
                    <td className="p-space-sm border-r border-on-surface">
                      <span className={`px-space-xs py-0.5 border border-on-surface font-label-caps-sm uppercase font-bold ${
                        sc.totalAnnualEmissionsKg <= 2300 ? 'bg-primary text-on-primary' : 'bg-yellow-accent text-on-surface'
                      }`}>
                        {sc.totalAnnualEmissionsKg <= 2300 ? 'PARIS ALIGNED' : 'INTERMEDIATE'}
                      </span>
                    </td>
                    <td className="p-space-sm text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteScenario(sc.id)}
                        className="font-label-caps-sm uppercase font-bold text-error hover:underline"
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal for Creating New Scenario */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-lg border border-on-surface bg-surface-container-lowest p-space-lg space-y-space-md shadow-hard-offset">
              <div className="flex items-center justify-between border-b border-on-surface pb-space-xs">
                <span className="font-label-caps-md uppercase font-bold text-on-surface">CREATE NEW SCENARIO</span>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="font-bold text-on-surface hover:text-error"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateScenario} className="space-y-space-sm">
                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Scenario Title
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G. 'TRANSIT COMMUTE + 50% SOLAR'"
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface uppercase focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Description / Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of lifestyle assumptions..."
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Estimated Monthly Financial Delta (₹)
                  </label>
                  <input
                    type="number"
                    value={costDelta}
                    onChange={(e) => setCostDelta(Number(e.target.value))}
                    className="w-full border border-on-surface p-space-xs font-body text-on-surface focus:outline-none"
                  />
                </div>

                <div className="pt-space-sm flex justify-end space-x-2 border-t border-on-surface">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-space-md py-space-xs border border-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-space-lg py-space-xs bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface"
                  >
                    SAVE SCENARIO
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
