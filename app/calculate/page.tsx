'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SingleCalc {
  activityId?: string;
  category: string;
  activityType: string;
  subtype: string;
  quantity: number;
  unit: string;
  frequency: string;
  annualEmissionsKg: number;
  monthlyEmissionsKg: number;
  dailyEmissionsKg: number;
  factorUsed: number;
  formula: string;
  confidenceLevel: string;
  factorMetadata?: {
    name: string;
    source: string;
    sourceUrl: string | null;
    methodologyNote: string | null;
    unit: string;
    confidenceLevel: string;
  };
}

export default function CalculatePage() {
  const [calculations, setCalculations] = useState<SingleCalc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCalc, setSelectedCalc] = useState<SingleCalc | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (res.status === 401) {
          setLoadError('signed-out');
          return null;
        }
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((d) => {
        if (d?.footprint?.calculations) {
          setCalculations(d.footprint.calculations);
          if (d.footprint.calculations.length > 0) {
            setSelectedCalc(d.footprint.calculations[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadError('error');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" aria-hidden="true" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          Loading the math behind your numbers…
        </span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full max-w-4xl mx-auto my-space-xl p-space-xl border border-on-surface bg-surface-container-lowest text-center space-y-space-md">
        <h2 className="font-headline text-headline-lg uppercase font-bold">
          {loadError === 'signed-out' ? 'Please sign in' : 'We couldn’t load the details'}
        </h2>
        <p className="font-body-md text-on-surface-variant max-w-lg mx-auto">
          {loadError === 'signed-out'
            ? 'Your session expired. Sign back in to inspect your calculations.'
            : 'Check your connection and try again — your data is safe.'}
        </p>
        <div className="pt-space-md">
          <Link
            href={loadError === 'signed-out' ? '/auth/login' : '/calculate'}
            className="inline-block min-h-[44px] px-space-lg py-space-md bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary"
          >
            {loadError === 'signed-out' ? 'Sign in →' : 'Try again'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Band */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            How every number is calculated
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Input × factor = result · sources shown
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            DATA SOURCES: DEFRA / EPA / IPCC AR6
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm">
          <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
            Full transparency
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            How your footprint is calculated
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Pick any activity to see the exact math: your input, the emission factor used, the result — plus the source, region, and confidence behind it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Left Column: Activity List */}
          <div className="lg:col-span-5 p-space-md border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
            <div className="pb-space-sm mb-space-xs flex items-center justify-between font-label-caps-md uppercase font-bold text-on-surface">
              <span>Your activities ({calculations.length})</span>
              <Link href="/onboarding" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
                + Update my answers
              </Link>
            </div>

            {calculations.length > 0 ? (
              calculations.map((calc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCalc(calc)}
                  aria-pressed={selectedCalc === calc}
                  className={`min-h-[44px] w-full text-left p-space-sm border-l-4 transition-none flex flex-col justify-between ${
                    selectedCalc === calc
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed font-bold'
                      : 'border-transparent hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex justify-between items-center font-label-caps-sm uppercase font-bold mb-1">
                    <span className="text-primary">{calc.category}</span>
                    <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container-lowest font-mono">
                      {calc.confidenceLevel} confidence
                    </span>
                  </div>
                  <div className="font-headline text-headline-sm uppercase font-bold">
                    {calc.activityType} ({calc.subtype})
                  </div>
                  <div className="font-label-caps-sm uppercase text-on-surface-variant pt-1 flex justify-between">
                    <span>{calc.quantity} {calc.unit} / {calc.frequency.toLowerCase()}</span>
                    <span className="font-bold text-on-surface">{Math.round(calc.annualEmissionsKg)} kg CO₂e/yr</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-space-lg text-center space-y-space-md">
                <p className="font-body-md text-on-surface-variant">No activities yet — set up your footprint to see the math here.</p>
                <Link
                  href="/onboarding"
                  className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold"
                >
                  Set up my footprint
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Calculation Audit Inspection */}
          <div className="lg:col-span-7 p-space-lg md:p-space-xl bg-surface-container-low flex flex-col justify-between">
            {selectedCalc ? (
              <div className="space-y-space-lg">
                <div className="flex items-center justify-between border-b border-on-surface pb-space-sm">
                  <div>
                    <span className="font-label-caps-sm uppercase font-bold text-primary">{selectedCalc.category}</span>
                    <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                      {selectedCalc.activityType} ({selectedCalc.subtype})
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold block">Per year</span>
                    <span className="font-display text-4xl font-bold text-primary">
                      {Math.round(selectedCalc.annualEmissionsKg)} <span className="text-sm font-headline">kg CO₂e</span>
                    </span>
                  </div>
                </div>

                {/* Equation Box */}
                <div className="border border-on-surface bg-surface-container-lowest p-space-md space-y-2">
                  <span className="font-label-caps-md uppercase font-bold text-on-surface block">
                    The math
                  </span>
                  <div className="p-space-sm bg-surface-container-high border border-on-surface font-mono text-sm text-on-surface font-bold">
                    {selectedCalc.formula || `E = ${selectedCalc.quantity} ${selectedCalc.unit} × ${selectedCalc.factorUsed} kg CO₂e/${selectedCalc.unit}`}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Your amount × the emission factor for one {selectedCalc.unit}, scaled to a full year.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 font-label-caps-sm uppercase text-on-surface-variant">
                    <div>Amount: <strong className="text-on-surface">{selectedCalc.quantity} {selectedCalc.unit}</strong></div>
                    <div>Factor: <strong className="text-on-surface">{selectedCalc.factorUsed} kg/{selectedCalc.unit}</strong></div>
                    <div>How often: <strong className="text-on-surface">{selectedCalc.frequency}</strong></div>
                  </div>
                </div>

                {/* Emission Factor Metadata */}
                <div className="border border-on-surface bg-surface-container-lowest p-space-md space-y-space-sm">
                  <span className="font-label-caps-md uppercase font-bold text-on-surface block">
                    Where the factor comes from
                  </span>
                  <div className="divide-y divide-on-surface font-body-sm">
                    <div className="py-1 flex justify-between gap-4">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Factor:</span>
                      <span className="font-bold text-right">{selectedCalc.factorMetadata?.name || `${selectedCalc.subtype} factor`}</span>
                    </div>
                    <div className="py-1 flex justify-between gap-4">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Source:</span>
                      <span className="font-bold text-primary text-right">
                        {selectedCalc.factorMetadata?.sourceUrl ? (
                          <a href={selectedCalc.factorMetadata.sourceUrl} target="_blank" rel="noreferrer" className="hover:underline">
                            {selectedCalc.factorMetadata?.source} ↗
                          </a>
                        ) : (
                          selectedCalc.factorMetadata?.source || 'See factor database'
                        )}
                      </span>
                    </div>
                    <div className="py-1 flex justify-between gap-4">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Confidence:</span>
                      <span className="font-bold">{selectedCalc.confidenceLevel} (±{selectedCalc.confidenceLevel === 'HIGH' ? '5' : selectedCalc.confidenceLevel === 'MEDIUM' ? '15' : '30'}%)</span>
                    </div>
                    <div className="py-1">
                      <span className="font-bold text-on-surface-variant uppercase font-label block mb-1">How it was estimated:</span>
                      <p className="text-on-surface">
                        {selectedCalc.factorMetadata?.methodologyNote ||
                          'Standard published conversion factor for this activity.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-space-xl">
                <p className="font-body-md text-on-surface-variant font-bold">Select an activity on the left to see exactly how we calculated it.</p>
              </div>
            )}

            <div className="mt-space-lg pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm uppercase font-bold">
              <span>Estimates, not certified measurements</span>
              <Link href="/dashboard" className="min-h-[44px] inline-flex items-center text-primary hover:underline">
                Back to overview →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
