'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface DiaryEntry {
  id: string;
  date: string;
  category: string;
  activityType: string;
  subtype: string;
  quantity: number;
  unit: string;
  emissionsKg: number;
  notes?: string;
}

const CATEGORY_DEFAULTS: Record<string, { activityType: string; subtype: string; unit: string; quantity: number }> = {
  TRANSPORTATION: { activityType: 'car', subtype: 'petrol', unit: 'km', quantity: 15 },
  ENERGY: { activityType: 'electricity', subtype: 'grid_us', unit: 'kWh', quantity: 10 },
  FOOD: { activityType: 'diet', subtype: 'mixed', unit: 'day', quantity: 1 },
  CONSUMPTION: { activityType: 'clothing', subtype: 'general', unit: 'item', quantity: 1 },
  WASTE: { activityType: 'waste', subtype: 'landfill', unit: 'kg', quantity: 1 },
};

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [anomalyInfo, setAnomalyInfo] = useState<{
    hasAnomaly: boolean;
    anomalyEntries?: { reason: string; emissionsKg: number }[];
    meanKg?: number;
    stdDevKg?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('TRANSPORTATION');
  const [activityType, setActivityType] = useState('car');
  const [subtype, setSubtype] = useState('petrol');
  const [quantity, setQuantity] = useState(15);
  const [unit, setUnit] = useState('km');
  const [notes, setNotes] = useState('');

  const fetchDiary = useCallback(() => {
    fetch('/api/diary')
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setEntries(data.entries);
        if (data.anomalyResult) setAnomalyInfo(data.anomalyResult);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          category,
          activityType,
          subtype,
          quantity: Number(quantity),
          unit,
          notes,
        }),
      });

      if (res.ok) {
        setNotes('');
        fetchDiary();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error === 'EMISSION_FACTOR_NOT_FOUND' ? 'No matching emission factor is available for this activity. Choose a supported type, subtype, and unit.' : 'Unable to save this activity. Please check the values and try again.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await fetch(`/api/diary?id=${id}`, { method: 'DELETE' });
      fetchDiary();
    } catch (err) {
      console.error(err);
    }
  };

  const totalLoggedKg = entries.reduce((acc, curr) => acc + curr.emissionsKg, 0);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            CARBON DIARY // ACTIVITY LOG &amp; LEDGER
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            CHRONOLOGICAL ACTIVITY STREAM • TOTAL LOGGED: <span className="text-primary font-bold">{totalLoggedKg.toFixed(1)} kg CO₂e</span>
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            ENTRIES: {entries.length} LOGGED
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm">
          <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
            REAL-TIME ACTIVITY LEDGER
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            CARBON DIARY &amp; ANOMALY AUDIT
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Record specific everyday actions and monitor daily emissions against rolling statistical variance thresholds.
          </p>
        </div>

        {/* Anomaly Detection Alert */}
        {anomalyInfo && anomalyInfo.hasAnomaly && (
          <div className="p-space-md border border-on-surface bg-coral-accent text-white flex items-start justify-between gap-4">
            <div className="flex items-start space-x-space-sm">
              <span className="w-8 h-8 bg-surface-container-lowest text-on-surface flex items-center justify-center font-bold text-base shrink-0">
                !
              </span>
              <div>
                <div className="font-label-caps-md uppercase font-bold">
                  STATISTICAL ANOMALY DETECTED IN LOGGED ACTIVITY
                </div>
                <p className="font-body-sm mt-1 text-white/95">
                  {anomalyInfo.anomalyEntries?.[0]?.reason || 'A single-day activity spike exceeded +2 standard deviations from your baseline.'} Mean: {anomalyInfo.meanKg?.toFixed(1)} kg/day (std dev: {anomalyInfo.stdDevKg?.toFixed(1)}).
                </p>
              </div>
            </div>
            <Link
              href="/insights"
              className="px-space-sm py-1 bg-surface-container-lowest text-on-surface font-label-caps-sm uppercase font-bold hover:bg-on-surface hover:text-white shrink-0"
            >
              INSPECT SPIKE →
            </Link>
          </div>
        )}

        {/* Form and Entries Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Form (5 cols) */}
          <form onSubmit={handleAddEntry} className="lg:col-span-5 p-space-md md:p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low space-y-space-md">
            <div className="border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold">
              LOG NEW ACTIVITY DISPATCH
            </div>

            <div className="space-y-space-sm">
              <div>
                <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  Activity Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-on-surface p-space-xs font-mono text-sm bg-surface-container-lowest uppercase"
                />
              </div>

              <div>
                <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  Sector / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const defaults = CATEGORY_DEFAULTS[e.target.value];
                    setActivityType(defaults.activityType);
                    setSubtype(defaults.subtype);
                    setUnit(defaults.unit);
                    setQuantity(defaults.quantity);
                  }}
                  className="w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest font-bold cursor-pointer"
                >
                  <option value="TRANSPORTATION">TRANSPORTATION</option>
                  <option value="ENERGY">ENERGY &amp; RESIDENTIAL</option>
                  <option value="FOOD">FOOD &amp; DIET</option>
                  <option value="CONSUMPTION">GOODS &amp; CONSUMPTION</option>
                  <option value="WASTE">WASTE</option>
                </select>
              </div>

              {formError && <p role="alert" className="border border-error p-space-xs text-sm text-error font-bold">{formError}</p>}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Activity Type
                  </label>
                  <input
                    type="text"
                    required
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest"
                  />
                </div>
                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Subtype / Spec
                  </label>
                  <input
                    type="text"
                    required
                    value={subtype}
                    onChange={(e) => setSubtype(e.target.value)}
                    className="w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-on-surface p-space-xs font-headline text-headline-sm font-bold bg-surface-container-lowest"
                  />
                </div>
                <div>
                  <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  Optional Notes / Reference
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.G. 'COMMUTE TO DOWNTOWN VIA S-7'"
                  className="w-full border border-on-surface p-space-xs font-body text-sm bg-surface-container-lowest uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none"
            >
              COMMIT ENTRY TO LEDGER
            </button>
          </form>

          {/* Ledger Table (7 cols) */}
          <div className="lg:col-span-7 p-space-md md:p-space-lg bg-surface-container-lowest flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold flex justify-between">
                <span>CHRONOLOGICAL AUDIT LEDGER ({entries.length})</span>
                <span className="text-primary">ISO 14064-1 DISPATCH</span>
              </div>

              {loading ? (
                <div className="text-center py-space-lg font-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Loading ledger entries...
                </div>
              ) : entries.length > 0 ? (
                <div className="divide-y divide-on-surface border border-on-surface font-label-caps-sm uppercase">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-space-sm bg-surface-container-lowest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-surface-container-low transition-none"
                    >
                      <div className="flex items-center space-x-space-sm">
                        <span className="font-mono text-xs font-bold text-on-surface-variant w-24">
                          {entry.date}
                        </span>
                        <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-bold">
                          {entry.category}
                        </span>
                        <div>
                          <div className="font-bold text-on-surface">
                            {entry.activityType} ({entry.subtype})
                          </div>
                          {entry.notes && (
                            <div className="font-body-sm lowercase text-on-surface-variant italic font-normal">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-space-md w-full sm:w-auto justify-between border-t sm:border-t-0 pt-1 sm:pt-0">
                        <span className="font-mono text-xs font-normal">
                          {entry.quantity} {entry.unit}
                        </span>
                        <span className="font-display font-bold text-coral-accent text-sm">
                          +{entry.emissionsKg.toFixed(2)} kg CO₂e
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-error hover:underline font-bold text-[11px]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-space-lg border border-on-surface bg-surface-container-low text-center font-body-md text-on-surface-variant font-bold">
                  No diary entries logged yet. Record your daily commute or meal above to begin live tracking.
                </div>
              )}
            </div>

            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm uppercase font-bold text-on-surface-variant">
              <span>STORAGE: SQLITE LEDGER / LOCAL-FIRST</span>
              <span className="text-on-surface">EXPORT FORMAT: CSV / JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
