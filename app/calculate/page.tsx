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
  const [selectedCalc, setSelectedCalc] = useState<SingleCalc | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        if (d.footprint?.calculations) {
          setCalculations(d.footprint.calculations);
          if (d.footprint.calculations.length > 0) {
            setSelectedCalc(d.footprint.calculations[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          LOADING CALCULATION AUDIT SPECIFICATIONS...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Band */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            CALCULATION PROTOCOL // ISO 14064-1
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            MATHEMATICAL AUDIT TRAIL • ZERO-ASSUMPTION DISCLOSURE
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
            EMPIRICAL CARBON ENGINE
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            CALCULATION ENGINE &amp; TRANSPARENCY AUDIT
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Inspect exact mathematical formulas, emission factor coefficients, confidence bounds, and scientific methodology behind every lifestyle parameter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Left Column: Activity List */}
          <div className="lg:col-span-5 p-space-md border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
            <div className="pb-space-sm mb-space-xs flex items-center justify-between font-label-caps-md uppercase font-bold text-on-surface">
              <span>ACTIVE PARAMETERS ({calculations.length})</span>
              <Link href="/onboarding" className="text-primary hover:underline">
                + RECALIBRATE
              </Link>
            </div>

            {calculations.length > 0 ? (
              calculations.map((calc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCalc(calc)}
                  className={`w-full text-left p-space-sm border-l-4 transition-none flex flex-col justify-between ${
                    selectedCalc === calc
                      ? 'border-primary bg-primary-fixed text-on-primary-fixed font-bold'
                      : 'border-transparent hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex justify-between items-center font-label-caps-sm uppercase font-bold mb-1">
                    <span className="text-primary">{calc.category}</span>
                    <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container-lowest font-mono">
                      {calc.confidenceLevel} CONFIDENCE
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
                <p className="font-body-md text-on-surface-variant">No active baseline calculation parameters logged.</p>
                <Link
                  href="/onboarding"
                  className="px-space-md py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold inline-block"
                >
                  INITIALIZE BASELINE AUDIT
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
                    <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold block">ANNUAL INTENSITY</span>
                    <span className="font-display text-4xl font-bold text-primary">
                      {Math.round(selectedCalc.annualEmissionsKg)} <span className="text-sm font-headline">kg CO₂e</span>
                    </span>
                  </div>
                </div>

                {/* Mathematical Equation Box */}
                <div className="border border-on-surface bg-surface-container-lowest p-space-md space-y-2">
                  <span className="font-label-caps-md uppercase font-bold text-on-surface block">
                    MATHEMATICAL CALCULATION DISCLOSURE
                  </span>
                  <div className="p-space-sm bg-surface-container-high border border-on-surface font-mono text-sm text-on-surface font-bold">
                    {selectedCalc.formula || `E = ${selectedCalc.quantity} ${selectedCalc.unit} × ${selectedCalc.factorUsed} kg CO₂e/${selectedCalc.unit}`}
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 font-label-caps-sm uppercase text-on-surface-variant">
                    <div>QTY: <strong className="text-on-surface">{selectedCalc.quantity} {selectedCalc.unit}</strong></div>
                    <div>COEFF: <strong className="text-on-surface">{selectedCalc.factorUsed} kg/{selectedCalc.unit}</strong></div>
                    <div>CADENCE: <strong className="text-on-surface">{selectedCalc.frequency}</strong></div>
                  </div>
                </div>

                {/* Emission Factor Metadata */}
                <div className="border border-on-surface bg-surface-container-lowest p-space-md space-y-space-sm">
                  <span className="font-label-caps-md uppercase font-bold text-on-surface block">
                    EMISSION FACTOR PROVENANCE &amp; CITATION
                  </span>
                  <div className="divide-y divide-on-surface font-body-sm">
                    <div className="py-1 flex justify-between">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Factor Registry Name:</span>
                      <span className="font-bold">{selectedCalc.factorMetadata?.name || `${selectedCalc.subtype} Factor`}</span>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Primary Source Authority:</span>
                      <span className="font-bold text-primary">{selectedCalc.factorMetadata?.source || 'DEFRA 2025 / EPA eGRID'}</span>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span className="font-bold text-on-surface-variant uppercase font-label">Confidence Grading:</span>
                      <span className="font-bold">{selectedCalc.confidenceLevel}</span>
                    </div>
                    <div className="py-1">
                      <span className="font-bold text-on-surface-variant uppercase font-label block mb-1">Methodology Note:</span>
                      <p className="text-on-surface">
                        {selectedCalc.factorMetadata?.methodologyNote ||
                          'Factor applies lifecycle Scope 1 direct combustion and Scope 3 upstream fuel production emissions under IPCC AR6 100-year GWP coefficients.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-space-xl">
                <p className="font-body-md text-on-surface-variant font-bold">Select an activity parameter from the left ledger to audit.</p>
              </div>
            )}

            <div className="mt-space-lg pt-space-sm border-t border-on-surface flex items-center justify-between font-label-caps-sm uppercase font-bold">
              <span>PROTOCOL: ISO 14064-1:2018 SPECIFICATION</span>
              <Link href="/admin" className="text-primary hover:underline">
                EXPLORE FULL FACTOR REGISTRY →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
