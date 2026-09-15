'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Notice from '@/components/Notice';
import { DIET_OPTIONS } from '@/lib/diet-options';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  // Form State
  const [region, setRegion] = useState('US');
  const [hasVehicle, setHasVehicle] = useState(true);
  const [vehicleType, setVehicleType] = useState('petrol');
  const [vehicleKmMonth, setVehicleKmMonth] = useState(390);
  const [electricityKwhMonth, setElectricityKwhMonth] = useState(320);
  const [dietPattern, setDietPattern] = useState('mixed');
  const [flightKmYear, setFlightKmYear] = useState(1500);
  const [wasteKgMonth, setWasteKgMonth] = useState(45);

  // If the user already has activities, submitting replaces them — warn first.
  useEffect(() => {
    fetch('/api/simulator')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.activities) && data.activities.length > 0) {
          setHasExisting(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    setSubmissionError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          dietPattern,
          hasVehicle,
          vehicleType: hasVehicle ? vehicleType : undefined,
          vehicleDistanceKmMonth: hasVehicle ? vehicleKmMonth : 0,
          electricityKwhMonth,
          flightKmYear,
          wasteKgMonth,
        }),
      });

      if (res.ok) {
        router.refresh();
        router.push('/dashboard');
      } else {
        const data = await res.json().catch(() => null);
        setSubmissionError(
          data?.error === 'EMISSION_FACTOR_NOT_FOUND'
            ? 'We couldn’t price one of those choices with our current factors. Try a different region, vehicle, or diet option.'
            : 'We couldn’t build your footprint. Check your connection and try again.'
        );
      }
    } catch {
      setSubmissionError('Connection problem. Nothing was changed — try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    // Two-click confirmation when this would wipe an existing setup.
    if (hasExisting && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    handleComplete();
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest min-h-[calc(100vh-56px)]">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Set up your footprint · Step {step} of 5
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Step 1 · See your footprint — about 2 minutes
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Travel · Home · Food · Flights · Waste
          </span>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto w-full p-space-lg md:p-space-xl space-y-space-lg my-space-md">
          {/* Progress Keyline Indicator */}
          <div className="border border-on-surface bg-surface-container-low p-space-xs">
            <div
              className="w-full bg-surface-container-highest h-3 border border-on-surface"
              role="progressbar"
              aria-valuenow={step}
              aria-valuemin={1}
              aria-valuemax={5}
              aria-label={`Step ${step} of 5`}
            >
              <div
                className="bg-primary h-full transition-all duration-300 border-r border-on-surface"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant pt-1 font-bold">
              <span>01 Travel</span>
              <span>02 Home</span>
              <span>03 Food</span>
              <span>04 Flights</span>
              <span>05 Waste</span>
            </div>
          </div>

        {/* Step Card */}
        <div className="border border-on-surface bg-surface-container-lowest p-space-lg md:p-space-xl space-y-space-lg shadow-hard-offset-sm">
          {/* STEP 1: TRANSPORTATION */}
          {step === 1 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">Step 1 · Getting around</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  How do you get around?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Travel is the biggest slice for most people. Start with your car — or skip it if you don&apos;t drive.
                </p>
              </div>

              <div className="space-y-space-sm">
                <span className="font-label-caps-md uppercase font-bold text-on-surface block" id="ob-vehicle-label">
                  Do you regularly drive a car?
                </span>
                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="ob-vehicle-label">
                  <button
                    type="button"
                    onClick={() => setHasVehicle(true)}
                    aria-pressed={hasVehicle}
                    className={`min-h-[44px] p-space-md border border-on-surface font-label-caps-md uppercase font-bold text-left flex items-center justify-between ${
                      hasVehicle ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span>Yes, I drive</span>
                    {hasVehicle && <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasVehicle(false)}
                    aria-pressed={!hasVehicle}
                    className={`min-h-[44px] p-space-md border border-on-surface font-label-caps-md uppercase font-bold text-left flex items-center justify-between ${
                      !hasVehicle ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span>No — bus, train, bike, or walking</span>
                    {!hasVehicle && <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check</span>}
                  </button>
                </div>
              </div>

              {hasVehicle && (
                <div className="space-y-space-md pt-space-sm border-t border-on-surface">
                  <div>
                    <span className="font-label-caps-md uppercase font-bold text-on-surface block mb-space-xs" id="ob-fuel-label">
                      What fuel does it use?
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-labelledby="ob-fuel-label">
                      {[
                        { id: 'petrol', label: 'Petrol' },
                        { id: 'diesel', label: 'Diesel' },
                        { id: 'hybrid', label: 'Hybrid' },
                        { id: 'ev', label: 'Electric' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setVehicleType(type.id)}
                          aria-pressed={vehicleType === type.id}
                          className={`min-h-[44px] p-space-sm border border-on-surface font-label-caps-sm uppercase font-bold text-center ${
                            vehicleType === type.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="vehicleKm">
                        Driving per month
                      </label>
                      <span className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="3000"
                          step="10"
                          value={vehicleKmMonth}
                          onChange={(e) => setVehicleKmMonth(Math.max(0, Number(e.target.value) || 0))}
                          aria-label="Driving distance in kilometres per month"
                          className="w-24 border border-on-surface px-space-xs py-1 font-headline font-bold text-on-surface bg-surface-container-lowest focus:outline-none text-right"
                        />
                        <span className="font-headline text-headline-sm font-bold text-primary">km</span>
                      </span>
                    </div>
                    <input
                      id="vehicleKm"
                      type="range"
                      min="0"
                      max="3000"
                      step="20"
                      value={vehicleKmMonth}
                      onChange={(e) => setVehicleKmMonth(Number(e.target.value))}
                      className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                    />
                    <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                      <span>0 km</span>
                      <span>390 km (typical)</span>
                      <span>3000 km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: RESIDENTIAL ENERGY */}
          {step === 2 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">Step 2 · Home energy</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  How much power does your home use?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Your region picks the electricity factor we use — cleaner grids mean lower estimates for the same usage. Find your monthly kWh on any power bill.
                </p>
              </div>

              <div>
                <span className="font-label-caps-md uppercase font-bold text-on-surface block mb-space-xs" id="ob-region-label">
                  Where do you live?
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-labelledby="ob-region-label">
                  {[
                    { id: 'IN', label: 'India' },
                    { id: 'US', label: 'United States' },
                    { id: 'EU', label: 'Europe' },
                    { id: 'UK', label: 'United Kingdom' },
                    { id: 'GLOBAL', label: 'Somewhere else' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegion(r.id)}
                      aria-pressed={region === r.id}
                      className={`min-h-[44px] p-space-sm border border-on-surface font-label-caps-sm uppercase font-bold text-center ${
                        region === r.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="electricityKwh">
                    Electricity per month
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1500"
                      step="10"
                      value={electricityKwhMonth}
                      onChange={(e) => setElectricityKwhMonth(Math.max(0, Number(e.target.value) || 0))}
                      aria-label="Electricity usage in kilowatt-hours per month"
                      className="w-24 border border-on-surface px-space-xs py-1 font-headline font-bold text-on-surface bg-surface-container-lowest focus:outline-none text-right"
                    />
                    <span className="font-headline text-headline-sm font-bold text-primary">kWh</span>
                  </span>
                </div>
                <input
                  id="electricityKwh"
                  type="range"
                  min="0"
                  max="1500"
                  step="10"
                  value={electricityKwhMonth}
                  onChange={(e) => setElectricityKwhMonth(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>0 kWh</span>
                  <span>320 kWh (typical)</span>
                  <span>1500 kWh</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FOOD & DIET */}
          {step === 3 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">Step 3 · Food</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  What do you usually eat?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Pick the closest match. Meat — especially beef and lamb — carries the biggest share.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="group" aria-label="Diet pattern">
                {DIET_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDietPattern(d.value)}
                    aria-pressed={dietPattern === d.value}
                    className={`min-h-[44px] p-space-md border border-on-surface text-left font-label-caps-sm uppercase font-bold flex flex-col justify-between ${
                      dietPattern === d.value ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-xs text-primary pt-2 font-mono">{d.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: AVIATION */}
          {step === 4 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">Step 4 · Flights</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  How much do you fly?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Rough total distance per year. A short return trip is about 1,500 km — set 0 if you don&apos;t fly.
                </p>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="flightKm">
                    Flight distance per year
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="25000"
                      step="100"
                      value={flightKmYear}
                      onChange={(e) => setFlightKmYear(Math.max(0, Number(e.target.value) || 0))}
                      aria-label="Flight distance in kilometres per year"
                      className="w-24 border border-on-surface px-space-xs py-1 font-headline font-bold text-on-surface bg-surface-container-lowest focus:outline-none text-right"
                    />
                    <span className="font-headline text-headline-sm font-bold text-primary">km</span>
                  </span>
                </div>
                <input
                  id="flightKm"
                  type="range"
                  min="0"
                  max="25000"
                  step="500"
                  value={flightKmYear}
                  onChange={(e) => setFlightKmYear(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>0 km (no flights)</span>
                  <span>1,500 km (one short trip)</span>
                  <span>25,000 km (frequent flyer)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WASTE */}
          {step === 5 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">Step 5 · Waste</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  How much do you throw away?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Landfill waste releases methane as it breaks down. Set 0 if you compost or produce almost none.
                </p>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="wasteKg">
                    Landfill waste per month
                  </label>
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="120"
                      step="5"
                      value={wasteKgMonth}
                      onChange={(e) => setWasteKgMonth(Math.max(0, Number(e.target.value) || 0))}
                      aria-label="Landfill waste in kilograms per month"
                      className="w-24 border border-on-surface px-space-xs py-1 font-headline font-bold text-on-surface bg-surface-container-lowest focus:outline-none text-right"
                    />
                    <span className="font-headline text-headline-sm font-bold text-primary">kg</span>
                  </span>
                </div>
                <input
                  id="wasteKg"
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={wasteKgMonth}
                  onChange={(e) => setWasteKgMonth(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>0 kg (almost none)</span>
                  <span>45 kg (typical)</span>
                  <span>120 kg</span>
                </div>
              </div>

              {hasExisting && (
                <Notice tone="info">
                  Submitting will <strong>replace your current activities</strong> with these answers. Scenarios, goals, and your daily log are kept.
                </Notice>
              )}
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="pt-space-md border-t border-on-surface flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => { setStep(step - 1); setConfirmReplace(false); }}
                className="min-h-[44px] px-space-md py-space-xs border border-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high transition-none"
              >
                ← Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="min-h-[44px] px-space-lg py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center space-x-1"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinalSubmit}
                className="min-h-[44px] px-space-xl py-space-sm bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface transition-none flex items-center space-x-2"
              >
                <span>{loading ? 'Building…' : hasExisting && !confirmReplace ? 'Review my answers →' : hasExisting ? 'Yes, replace my activities →' : 'See my footprint →'}</span>
              </button>
            )}
          </div>
          {submissionError && <Notice tone="error">{submissionError}</Notice>}
        </div>
      </div>
    </div>
  );
}
