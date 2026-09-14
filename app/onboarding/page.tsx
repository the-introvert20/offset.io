'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [region, setRegion] = useState('US');
  const [hasVehicle, setHasVehicle] = useState(true);
  const [vehicleType, setVehicleType] = useState('petrol');
  const [vehicleKmMonth, setVehicleKmMonth] = useState(390);
  const [electricityKwhMonth, setElectricityKwhMonth] = useState(320);
  const [dietPattern, setDietPattern] = useState('mixed');
  const [flightKmYear, setFlightKmYear] = useState(1500);
  const [wasteKgMonth, setWasteKgMonth] = useState(45);

  const handleComplete = async () => {
    setLoading(true);
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
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest min-h-[calc(100vh-56px)]">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            BASELINE ASSESSMENT PROTOCOL // STEP {step} OF 5
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            INITIALIZING OFFICIAL ISO 14064 PERSONAL LEDGER
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            STANDARD: GHG PROTOCOL SCOPES 1, 2, 3
          </span>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-4xl mx-auto w-full p-space-lg md:p-space-xl space-y-space-lg my-space-md">
        {/* Progress Keyline Indicator */}
        <div className="border border-on-surface bg-surface-container-low p-space-xs">
          <div className="w-full bg-surface-container-highest h-3 border border-on-surface">
            <div
              className="bg-primary h-full transition-all duration-300 border-r border-on-surface"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant pt-1 font-bold">
            <span>01 TRANSIT</span>
            <span>02 ENERGY</span>
            <span>03 DIET</span>
            <span>04 AVIATION</span>
            <span>05 WASTE</span>
          </div>
        </div>

        {/* Step Card */}
        <div className="border border-on-surface bg-surface-container-lowest p-space-lg md:p-space-xl space-y-space-lg shadow-hard-offset-sm">
          {/* STEP 1: TRANSPORTATION */}
          {step === 1 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">SECTOR 01 // MOBILITY</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  HOW DO YOU COMMUTE &amp; TRAVEL?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Configure your primary road transit vector to evaluate Scope 1 &amp; 3 commuter emissions.
                </p>
              </div>

              <div className="space-y-space-sm">
                <label className="font-label-caps-md uppercase font-bold text-on-surface block">
                  Do you regularly drive a personal motor vehicle?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHasVehicle(true)}
                    className={`p-space-md border border-on-surface font-label-caps-md uppercase font-bold text-left flex items-center justify-between ${
                      hasVehicle ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span>YES, I DRIVE</span>
                    {hasVehicle && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasVehicle(false)}
                    className={`p-space-md border border-on-surface font-label-caps-md uppercase font-bold text-left flex items-center justify-between ${
                      !hasVehicle ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                    }`}
                  >
                    <span>NO (TRANSIT / ACTIVE ONLY)</span>
                    {!hasVehicle && <span className="material-symbols-outlined text-[18px]">check</span>}
                  </button>
                </div>
              </div>

              {hasVehicle && (
                <div className="space-y-space-md pt-space-sm border-t border-on-surface">
                  <div>
                    <label className="font-label-caps-md uppercase font-bold text-on-surface block mb-space-xs">
                      Powertrain / Fuel Archetype
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'petrol', label: 'PETROL / GAS' },
                        { id: 'diesel', label: 'DIESEL' },
                        { id: 'hybrid', label: 'HYBRID' },
                        { id: 'ev', label: 'BATTERY EV' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setVehicleType(type.id)}
                          className={`p-space-sm border border-on-surface font-label-caps-sm uppercase font-bold text-center ${
                            vehicleType === type.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="vehicleKm">
                        MONTHLY DRIVING DISTANCE
                      </label>
                      <span className="font-headline text-headline-sm font-bold text-primary">
                        {vehicleKmMonth} KM / MONTH
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
                      <span>390 km (Median)</span>
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
                <span className="font-label-caps-sm uppercase text-primary font-bold">SECTOR 02 // ENERGY &amp; GRID</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  RESIDENTIAL POWER CONSUMPTION
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Location-based Scope 2 electricity grid intensity coefficients.
                </p>
              </div>

              <div>
                <label className="font-label-caps-md uppercase font-bold text-on-surface block mb-space-xs">
                  Regional Grid Jurisdiction
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'US', label: 'UNITED STATES (EPA)' },
                    { id: 'EU', label: 'WESTERN EUROPE (EEA)' },
                    { id: 'UK', label: 'UNITED KINGDOM (DEFRA)' },
                    { id: 'GLOBAL', label: 'GLOBAL MEDIAN (IEA)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegion(r.id)}
                      className={`p-space-sm border border-on-surface font-label-caps-sm uppercase font-bold text-center ${
                        region === r.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest hover:bg-surface-container-high'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="electricityKwh">
                    MONTHLY ELECTRICITY USAGE
                  </label>
                  <span className="font-headline text-headline-sm font-bold text-primary">
                    {electricityKwhMonth} kWh / MO
                  </span>
                </div>
                <input
                  id="electricityKwh"
                  type="range"
                  min="50"
                  max="1500"
                  step="10"
                  value={electricityKwhMonth}
                  onChange={(e) => setElectricityKwhMonth(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>50 kWh (Apartment)</span>
                  <span>320 kWh (Standard)</span>
                  <span>1500 kWh</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FOOD & DIET */}
          {step === 3 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">SECTOR 03 // FOOD SYSTEMS</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  HOUSEHOLD DIETARY PATTERN
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Empirical lifecycle agricultural coefficients according to Poore &amp; Nemecek (2018).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'mixed', label: 'OMNIVORE (REGULAR RED MEAT & POULTRY)', factor: '~2,200 kg CO₂e/yr' },
                  { id: 'low_meat', label: 'MEDITERRANEAN / LOW-MEAT', factor: '~1,700 kg CO₂e/yr' },
                  { id: 'pescatarian', label: 'PESCATARIAN (FISH + DAIRY)', factor: '~1,500 kg CO₂e/yr' },
                  { id: 'vegetarian', label: 'VEGETARIAN (DAIRY + EGGS)', factor: '~1,200 kg CO₂e/yr' },
                  { id: 'vegan', label: '100% PLANT-BASED / VEGAN', factor: '~800 kg CO₂e/yr' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDietPattern(d.id)}
                    className={`p-space-md border border-on-surface text-left font-label-caps-sm uppercase font-bold flex flex-col justify-between ${
                      dietPattern === d.id ? 'bg-on-surface text-surface-container-lowest' : 'bg-surface-container-lowest hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span>{d.label}</span>
                    <span className="text-xs text-primary pt-2 font-mono">{d.factor}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: AVIATION */}
          {step === 4 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">SECTOR 04 // AVIATION</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  LONG-DISTANCE AIR FLIGHTS
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  High-altitude radiative forcing index calculation (DEFRA 2025 Aviation Module).
                </p>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="flightKm">
                    ESTIMATED ANNUAL FLIGHT DISTANCE
                  </label>
                  <span className="font-headline text-headline-sm font-bold text-primary">
                    {flightKmYear} KM / YEAR
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
                  <span>0 km (No flights)</span>
                  <span>1,500 km (1 short-haul)</span>
                  <span>25,000 km (Frequent long-haul)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WASTE */}
          {step === 5 && (
            <div className="space-y-space-md">
              <div className="border-b border-on-surface pb-space-sm">
                <span className="font-label-caps-sm uppercase text-primary font-bold">SECTOR 05 // WASTE &amp; MATERIALS</span>
                <h2 className="font-headline text-headline-lg uppercase font-bold mt-1">
                  MUNICIPAL SOLID WASTE &amp; CONSUMPTION
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Landfill methane degradation and packaging lifecycle allocation.
                </p>
              </div>

              <div className="border border-on-surface p-space-md bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-label-caps-md uppercase font-bold text-on-surface" htmlFor="wasteKg">
                    ESTIMATED MONTHLY WASTE EXPENDITURE
                  </label>
                  <span className="font-headline text-headline-sm font-bold text-primary">
                    {wasteKgMonth} KG / MONTH
                  </span>
                </div>
                <input
                  id="wasteKg"
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={wasteKgMonth}
                  onChange={(e) => setWasteKgMonth(Number(e.target.value))}
                  className="w-full accent-on-surface cursor-pointer h-2 bg-surface-container-highest"
                />
                <div className="flex justify-between font-label-caps-sm uppercase text-on-surface-variant font-bold">
                  <span>5 kg (Zero-waste)</span>
                  <span>45 kg (Median)</span>
                  <span>120 kg</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="pt-space-md border-t border-on-surface flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-space-md py-space-xs border border-on-surface font-label-caps-md uppercase font-bold hover:bg-surface-container-high transition-none"
              >
                ← PREVIOUS
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-space-lg py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none flex items-center space-x-1"
              >
                <span>NEXT STEP</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleComplete}
                className="px-space-xl py-space-sm bg-primary text-on-primary font-label-caps-md uppercase font-bold border border-on-surface hover:bg-on-surface transition-none flex items-center space-x-2"
              >
                <span>{loading ? 'AUDITING...' : 'GENERATE PERSONAL LEDGER →'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
