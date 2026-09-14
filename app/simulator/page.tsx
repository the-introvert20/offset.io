'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

export default function SimulatorPage() {
  const [carKmMonthly, setCarKmMonthly] = useState(390);
  const [vehicleSubtype, setVehicleSubtype] = useState('petrol');
  const [electricityKwhMonthly, setElectricityKwhMonthly] = useState(320);
  const [renewablePct, setRenewablePct] = useState(0);
  const [dietPattern, setDietPattern] = useState('mixed');
  const [flightKmYearly, setFlightKmYearly] = useState(1500);
  const [wasteKgMonthly, setWasteKgMonthly] = useState(45);

  const [simResult, setSimResult] = useState<{
    baselineAnnualKg: number;
    simulatedAnnualKg: number;
    reductionKg: number;
    reductionPct: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const baselineRef = useRef({ carKmMonthly: 390, vehicleSubtype: 'petrol', electricityKwhMonthly: 320, renewablePct: 0, dietPattern: 'mixed', flightKmYearly: 1500, wasteKgMonthly: 45 });
  const requestRef = useRef<AbortController | null>(null);

  const runSimulation = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carKmMonthly,
          vehicleSubtype,
          electricityKwhMonthly,
          renewablePct,
          dietPattern,
          flightKmYearly,
          wasteKgMonthly,
        }),
        signal,
      });

      const data = await res.json();
      if (res.ok) {
        setSimResult(data);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    } finally {
      setLoading(false);
    }
  }, [carKmMonthly, vehicleSubtype, electricityKwhMonthly, renewablePct, dietPattern, flightKmYearly, wasteKgMonthly]);

  useEffect(() => {
    fetch('/api/simulator').then((res) => res.ok ? res.json() : null).then((data) => {
      if (!data) return;
      const get = (activityType: string) => data.activities.find((activity: { activityType: string }) => activity.activityType === activityType);
      const car = get('car'); const electricity = get('electricity'); const flight = get('flight'); const waste = get('waste');
      const baseline = { carKmMonthly: car?.quantity ?? 0, vehicleSubtype: car?.subtype ?? 'petrol', electricityKwhMonthly: electricity?.quantity ?? 0, renewablePct: 0, dietPattern: get('diet')?.subtype ?? data.profile?.dietPattern?.toLowerCase() ?? 'mixed', flightKmYearly: flight?.quantity ?? 0, wasteKgMonthly: waste?.quantity ?? 0 };
      baselineRef.current = baseline;
      setCarKmMonthly(baseline.carKmMonthly); setVehicleSubtype(baseline.vehicleSubtype); setElectricityKwhMonthly(baseline.electricityKwhMonthly); setRenewablePct(0); setDietPattern(baseline.dietPattern); setFlightKmYearly(baseline.flightKmYearly); setWasteKgMonthly(baseline.wasteKgMonthly);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      requestRef.current?.abort();
      const controller = new AbortController(); requestRef.current = controller;
      runSimulation(controller.signal);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [runSimulation]);

  const baselineTonnes = simResult ? +(simResult.baselineAnnualKg / 1000).toFixed(2) : 4.82;
  const simTonnes = simResult ? +(simResult.simulatedAnnualKg / 1000).toFixed(2) : 4.82;
  const reductionKg = simResult ? simResult.reductionKg : 0;
  const reductionPct = simResult ? simResult.reductionPct : 0;

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            PREDICTIVE MARGINAL ABATEMENT SIMULATOR
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            REAL-TIME BEHAVIORAL SHIFT COEFFICIENTS // IPCC AR6 CHAPTER 5
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            RUNTIME STATUS: {loading ? 'CALCULATING...' : 'LIVE ACTIVE'}
          </span>
        </div>
      </section>

      {/* Simulator Hero & Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              MARGINAL DISPLACEMENT MODEL
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              WHAT IF? SCENARIO SIMULATOR
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Adjust your operational lifestyle levers below to compute real-time structural net displacement before committing changes to your official ledger.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/scenarios"
              className="px-space-md py-space-xs bg-surface-container border border-on-surface font-label-caps-md uppercase font-bold hover:bg-on-surface hover:text-white"
            >
              SAVED SCENARIOS MATRIX →
            </Link>
          </div>
        </div>

        {/* Dynamic Trajectory KPI Spread */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-on-surface">
          <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold block">01 // CURRENT BASELINE</span>
            <div className="font-display text-4xl font-bold mt-1 text-on-surface">
              {baselineTonnes} <span className="text-sm font-headline">t CO₂e/yr</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              {simResult?.baselineAnnualKg || 4820} kg GROSS
            </span>
          </div>

          <div className="p-space-md border-b sm:border-b-0 lg:border-r border-on-surface bg-surface-container-low">
            <span className="font-label-caps-sm uppercase text-primary font-bold block">02 // SIMULATED RUN-RATE</span>
            <div className="font-display text-4xl font-bold mt-1 text-primary">
              {simTonnes} <span className="text-sm font-headline">t CO₂e/yr</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              {simResult?.simulatedAnnualKg || 4820} kg PROJECTED
            </span>
          </div>

          <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-lowest">
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold block">03 // MARGINAL DELTA</span>
            <div className={`font-display text-4xl font-bold mt-1 ${reductionKg >= 0 ? 'text-primary' : 'text-error'}`}>
              {reductionKg >= 0 ? `−${reductionKg}` : `+${-reductionKg}`} <span className="text-sm font-headline">kg/yr</span>
            </div>
            <span className="font-label-caps-sm uppercase text-on-surface-variant font-bold">
              {(reductionKg / 12).toFixed(0)} kg / MONTH
            </span>
          </div>

          <div className="p-space-md bg-yellow-accent text-on-surface">
            <span className="font-label-caps-sm uppercase font-bold block">04 // PERCENT DISPLACEMENT</span>
            <div className="font-display text-4xl font-bold mt-1">
              {reductionKg >= 0 ? `−${reductionPct.toFixed(1)}%` : `+${Math.abs(reductionPct).toFixed(1)}%`}
            </div>
            <span className="font-label-caps-sm uppercase font-bold">
              {reductionKg >= 0 ? 'NET DECARBONIZATION' : 'EMISSIONS SURGE'}
            </span>
          </div>
        </div>

        {/* Sliders Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Left Column: Interactive Sliders (6 cols) */}
          <div className="lg:col-span-6 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-lowest space-y-space-md">
            <div className="flex items-center justify-between border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold">
              <span>PRIMARY LIFESTYLE LEVERS</span>
              <button
                type="button"
                onClick={() => {
                  const baseline = baselineRef.current;
                  setCarKmMonthly(baseline.carKmMonthly); setVehicleSubtype(baseline.vehicleSubtype); setElectricityKwhMonthly(baseline.electricityKwhMonthly); setRenewablePct(baseline.renewablePct); setDietPattern(baseline.dietPattern); setFlightKmYearly(baseline.flightKmYearly); setWasteKgMonthly(baseline.wasteKgMonthly);
                }}
                className="text-primary hover:underline text-xs"
              >
                RESET TO BASELINE
              </button>
            </div>

            {/* Lever 1: Driving Distance */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>01 // MONTHLY DRIVING DISTANCE</span>
                <span className="text-primary font-headline text-headline-sm">{carKmMonthly} KM</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="25"
                value={carKmMonthly}
                onChange={(e) => setCarKmMonthly(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>0 km (Full transit)</span>
                <span>390 km (Baseline)</span>
                <span>2500 km</span>
              </div>
            </div>

            {/* Lever 2: Vehicle Powertrain */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-2">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>02 // VEHICLE POWERTRAIN ARCHETYPE</span>
                <span className="text-secondary font-bold font-mono">{vehicleSubtype.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 font-label-caps-sm uppercase font-bold">
                {['petrol', 'diesel', 'hybrid', 'ev'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setVehicleSubtype(sub)}
                    className={`p-1 border border-on-surface text-center ${
                      vehicleSubtype === sub ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Lever 3: Electricity Usage */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>03 // RESIDENTIAL GRID USAGE</span>
                <span className="text-primary font-headline text-headline-sm">{electricityKwhMonthly} kWh</span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="25"
                value={electricityKwhMonthly}
                onChange={(e) => setElectricityKwhMonthly(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>50 kWh</span>
                <span>320 kWh (Baseline)</span>
                <span>1200 kWh</span>
              </div>
            </div>

            {/* Lever 4: Renewable Grid Share */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>04 // CLEAN / SOLAR TARIFF SHARE</span>
                <span className="text-primary font-headline text-headline-sm">{renewablePct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={renewablePct}
                onChange={(e) => setRenewablePct(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>0% Grid</span>
                <span>50%</span>
                <span>100% Green Tariff</span>
              </div>
            </div>

            {/* Lever 5: Diet Profile */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-2">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>05 // DIETARY MATRIX</span>
                <span className="text-coral-accent font-bold font-mono">{dietPattern.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 font-label-caps-sm uppercase font-bold">
                {[
                  { id: 'mixed', label: 'OMNIVORE' },
                  { id: 'low_meat', label: 'LOW MEAT' },
                  { id: 'vegetarian', label: 'VEG' },
                  { id: 'vegan', label: '100% VEGAN' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietPattern(d.id)}
                    className={`p-1 border border-on-surface text-center ${
                      dietPattern === d.id ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lever 6: Aviation Distance */}
            <div className="border border-on-surface p-space-sm bg-surface-container-low space-y-1">
              <div className="flex justify-between items-center font-label-caps-md uppercase font-bold">
                <span>06 // ANNUAL AVIATION FLIGHTS</span>
                <span className="text-primary font-headline text-headline-sm">{flightKmYearly} KM</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="500"
                value={flightKmYearly}
                onChange={(e) => setFlightKmYearly(Number(e.target.value))}
                className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
              />
              <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                <span>0 km (No flight)</span>
                <span>1500 km (Baseline)</span>
                <span>20,000 km</span>
              </div>
            </div>
          </div>

          {/* Right Column: Trajectory Projection & Branches (6 cols) */}
          <div className="lg:col-span-6 p-space-lg md:p-space-xl flex flex-col justify-between bg-surface-container-low">
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold flex justify-between">
                <span>PROJECTED TRAJECTORY COMPARISON</span>
                <span className="text-primary">PARIS 2.30t BENCHMARK</span>
              </div>

              {/* Trajectory Branches */}
              <div className="space-y-space-xs font-label-caps-sm uppercase font-bold">
                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-40">CURRENT BASELINE</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-on-surface relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-on-surface"></div>
                    </div>
                  </div>
                  <span className="font-headline text-headline-sm font-bold">{baselineTonnes} t</span>
                </div>

                <div className="p-space-sm bg-surface-container-lowest border border-on-surface flex items-center justify-between">
                  <span className="w-40 text-primary">LIVE SIMULATION</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-primary relative">
                      <div className="absolute right-[25%] top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="text-primary font-bold">{simTonnes} t ({reductionPct.toFixed(1)}%)</span>
                </div>

                <div className="p-space-sm bg-cyan-accent text-on-surface border border-on-surface flex items-center justify-between">
                  <span className="w-40">PARIS 1.5°C CEILING</span>
                  <div className="flex-1 mx-space-md hidden sm:flex items-center">
                    <div className="w-full h-0.5 bg-on-surface relative">
                      <div className="absolute right-[50%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border border-on-surface"></div>
                    </div>
                  </div>
                  <span className="font-bold">2.30 t</span>
                </div>
              </div>

              {/* Simulation Insights Box */}
              <div className="p-space-md bg-surface-container-lowest border border-on-surface space-y-2">
                <span className="font-label-caps-md uppercase font-bold text-on-surface block">
                  ALGORITHMIC IMPACT DISCLOSURE
                </span>
                <p className="font-body-md text-on-surface leading-relaxed">
                  Under your active slider configurations, your annualized footprint shifts from <strong className="text-on-surface font-bold">{baselineTonnes} t</strong> to <strong className="text-primary font-bold">{simTonnes} t CO₂e</strong>.
                  {reductionKg >= 0 ? (
                    <span> This eliminates <strong className="text-primary font-bold">{reductionKg} kg CO₂e</strong> per year ({reductionPct.toFixed(1)}% reduction).</span>
                  ) : (
                    <span className="text-error font-bold"> This increases emissions by {Math.abs(reductionKg)} kg CO₂e.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-space-lg border-t border-on-surface flex flex-col sm:flex-row items-center justify-between gap-2">
              <Link
                href="/reduction-plan"
                className="w-full sm:w-auto px-space-lg py-space-xs bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface"
              >
                APPLY TO REDUCTION PLAN →
              </Link>
              <Link
                href="/scenarios"
                className="w-full sm:w-auto px-space-md py-space-xs bg-surface-container-lowest text-on-surface font-label-caps-md uppercase font-bold border border-on-surface hover:bg-surface-container-high"
              >
                SAVE AS SCENARIO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
