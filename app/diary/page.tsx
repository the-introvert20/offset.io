'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ConfirmButton from '@/components/ConfirmButton';
import Notice from '@/components/Notice';
import {
  DIARY_CATALOG,
  getDiaryCategory,
  getDiaryActivity,
  getDiarySubtype,
  estimateDiaryEmissions,
  diaryDisplayLabels,
} from '@/lib/diary-options';

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

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [anomalyInfo, setAnomalyInfo] = useState<{
    hasAnomaly: boolean;
    anomalyEntries?: { reason: string; emissionsKg: number }[];
    meanKg?: number;
    stdDevKg?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state — category → activity → subtype pickers; unit follows automatically.
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('TRANSPORTATION');
  const [activity, setActivity] = useState('car');
  const [subtype, setSubtype] = useState('petrol');
  const [quantity, setQuantity] = useState(15);
  const [notes, setNotes] = useState('');

  const categoryObj = getDiaryCategory(category);
  const activityObj = getDiaryActivity(category, activity) ?? categoryObj?.activities[0];
  const subtypeObj = getDiarySubtype(category, activityObj?.activity ?? '', subtype) ?? activityObj?.subtypes[0];
  const unit = subtypeObj?.unit ?? '';
  const previewKg = subtypeObj ? estimateDiaryEmissions(Number(quantity), subtypeObj.factor) : 0;

  const pickCategory = (next: string) => {
    const cat = getDiaryCategory(next);
    if (!cat) return;
    const firstActivity = cat.activities[0];
    setCategory(next);
    setActivity(firstActivity.activity);
    setSubtype(firstActivity.subtypes[0].subtype);
    setQuantity(firstActivity.subtypes[0].defaultQty);
  };

  const pickActivity = (next: string) => {
    const act = getDiaryActivity(category, next);
    if (!act) return;
    setActivity(next);
    setSubtype(act.subtypes[0].subtype);
    setQuantity(act.subtypes[0].defaultQty);
  };

  const fetchDiary = useCallback(() => {
    fetch('/api/diary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setLoadError(true);
        } else {
          if (data.entries) setEntries(data.entries);
          if (data.anomalyResult) setAnomalyInfo(data.anomalyResult);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveSuccess(false);
    if (!activityObj || !subtypeObj) {
      setFormError('Pick an activity and type first.');
      return;
    }
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          category,
          activityType: activityObj.activity,
          subtype: subtypeObj.subtype,
          quantity: Number(quantity),
          unit,
          notes,
        }),
      });

      if (res.ok) {
        setNotes('');
        setSaveSuccess(true);
        fetchDiary();
      } else {
        const data = await res.json().catch(() => null);
        setFormError(data?.error === 'EMISSION_FACTOR_NOT_FOUND' ? 'We couldn’t price that combination with our current factors. Try a different option.' : 'We couldn’t save that activity. Check the values and try again.');
      }
    } catch {
      setFormError('Connection problem. Your logged activities are safe — try again in a moment.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/diary?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDiary();
      } else {
        setFormError('We couldn’t delete that entry. Try again.');
      }
    } catch {
      setFormError('Connection problem. Try again in a moment.');
    }
  };

  const formatEntryDate = (iso: string) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalLoggedKg = entries.reduce((acc, curr) => acc + curr.emissionsKg, 0);

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Daily log
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            Step 4 · Track progress • Logged so far: <span className="text-primary font-bold">{totalLoggedKg.toFixed(1)} kg CO₂e</span>
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </section>

      {/* Main Container */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">
        <div className="border-b border-on-surface pb-space-sm">
          <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
            Step 4 · Track progress
          </span>
          <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
            Daily log
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
            Log what you did today — a drive, a meal, your power use. We estimate the emissions and flag days that look unusual compared to your normal.
          </p>
        </div>

        {loadError && (
          <Notice tone="error">
            We couldn&apos;t load your log. Check your connection and refresh — your entries are safe.
          </Notice>
        )}

        {/* Unusual-day alert */}
        {anomalyInfo && anomalyInfo.hasAnomaly && (
          <div className="p-space-md border border-on-surface bg-coral-accent text-on-surface flex items-start justify-between gap-4">
            <div className="flex items-start space-x-space-sm">
              <span className="w-8 h-8 min-w-[2rem] min-h-[2rem] bg-surface-container-lowest text-on-surface flex items-center justify-center font-bold text-base shrink-0" aria-hidden="true">
                !
              </span>
              <div>
                <div className="font-label-caps-md uppercase font-bold">
                  An unusual day in your log
                </div>
                <p className="font-body-sm mt-1">
                  {anomalyInfo.anomalyEntries?.[0]?.reason || 'One day was much higher than your usual (over 2× the typical variation).'} Usual: {anomalyInfo.meanKg?.toFixed(1)} kg/day.
                </p>
              </div>
            </div>
            <Link
              href="/insights"
              className="min-h-[44px] inline-flex items-center px-space-sm py-1 bg-surface-container-lowest text-on-surface font-label-caps-sm uppercase font-bold hover:bg-on-surface hover:text-white shrink-0"
            >
              See why →
            </Link>
          </div>
        )}

        {/* Form and Entries Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Form (5 cols) */}
          <form onSubmit={handleAddEntry} className="lg:col-span-5 p-space-md md:p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low space-y-space-md">
            <div className="border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold">
              Log something you did
            </div>

            {formError && <Notice tone="error">{formError}</Notice>}
            {saveSuccess && <Notice tone="success">Activity logged — nice work keeping track.</Notice>}

            <div className="space-y-space-sm">
              <div>
                <label htmlFor="diary-date" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  Date
                </label>
                <input
                  id="diary-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-on-surface p-space-xs font-mono text-sm bg-surface-container-lowest"
                />
              </div>

              <div>
                <label htmlFor="diary-category" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  What kind of activity?
                </label>
                <select
                  id="diary-category"
                  value={category}
                  onChange={(e) => pickCategory(e.target.value)}
                  className="min-h-[44px] w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest font-bold cursor-pointer"
                >
                  {DIARY_CATALOG.map((c) => (
                    <option key={c.category} value={c.category}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="diary-activity" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Activity
                  </label>
                  <select
                    id="diary-activity"
                    value={activityObj?.activity ?? ''}
                    onChange={(e) => pickActivity(e.target.value)}
                    className="min-h-[44px] w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest"
                  >
                    {categoryObj?.activities.map((a) => (
                      <option key={a.activity} value={a.activity}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="diary-subtype" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    Type
                  </label>
                  <select
                    id="diary-subtype"
                    value={subtypeObj?.subtype ?? ''}
                    onChange={(e) => {
                      setSubtype(e.target.value);
                      const next = getDiarySubtype(category, activityObj?.activity ?? '', e.target.value);
                      if (next) setQuantity(next.defaultQty);
                    }}
                    className="min-h-[44px] w-full border border-on-surface p-space-xs font-label-caps-sm uppercase bg-surface-container-lowest"
                  >
                    {activityObj?.subtypes.map((s) => (
                      <option key={s.subtype} value={s.subtype}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="diary-qty" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                    How much? ({unit})
                  </label>
                  <input
                    id="diary-qty"
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="min-h-[44px] w-full border border-on-surface p-space-xs font-headline text-headline-sm font-bold bg-surface-container-lowest"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full border border-on-surface p-space-xs bg-surface-container-lowest" aria-live="polite">
                    <div className="font-label-caps-sm uppercase font-bold text-on-surface-variant">Estimate</div>
                    <div className="font-headline text-headline-sm font-bold text-primary">≈ {previewKg.toFixed(2)} kg CO₂e</div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="diary-notes" className="font-label-caps-sm uppercase font-bold text-on-surface block mb-1">
                  Note (optional)
                </label>
                <input
                  id="diary-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. drive to work"
                  maxLength={200}
                  className="min-h-[44px] w-full border border-on-surface p-space-xs font-body text-sm bg-surface-container-lowest"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[44px] w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none"
            >
              Log activity
            </button>
          </form>

          {/* Entries (7 cols) */}
          <div className="lg:col-span-7 p-space-md md:p-space-lg bg-surface-container-lowest flex flex-col justify-between">
            <div className="space-y-space-sm">
              <div className="border-b border-on-surface pb-space-xs font-label-caps-md uppercase font-bold flex justify-between">
                <span>Your entries ({entries.length})</span>
                <span className="text-primary">Newest first</span>
              </div>

              {loading ? (
                <div className="text-center py-space-lg font-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Loading your log…
                </div>
              ) : entries.length > 0 ? (
                <div className="divide-y divide-on-surface border border-on-surface font-label-caps-sm uppercase">
                  {entries.map((entry) => {
                    const labels = diaryDisplayLabels(entry.category, entry.activityType, entry.subtype);
                    return (
                    <div
                      key={entry.id}
                      className="p-space-sm bg-surface-container-lowest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-surface-container-low transition-none"
                    >
                      <div className="flex items-center space-x-space-sm">
                        <span className="font-mono text-xs font-bold text-on-surface-variant w-24 shrink-0">
                          {formatEntryDate(entry.date)}
                        </span>
                        <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-bold">
                          {labels.categoryLabel}
                        </span>
                        <div>
                          <div className="font-bold text-on-surface">
                            {labels.activityLabel}
                            {' · '}
                            {labels.subtypeLabel}
                          </div>
                          {entry.notes && (
                            <div className="font-body-sm text-body-sm text-on-surface-variant italic font-normal normal-case">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-space-md w-full sm:w-auto justify-between border-t sm:border-t-0 pt-1 sm:pt-0">
                        <span className="font-mono text-xs font-normal">
                          {entry.quantity} {entry.unit}
                        </span>
                        <span className="font-display font-bold text-error text-sm">
                          +{entry.emissionsKg.toFixed(2)} kg CO₂e
                        </span>
                        <ConfirmButton
                          label="✕"
                          confirmLabel="Delete?"
                          ariaLabel={`Delete entry from ${formatEntryDate(entry.date)}`}
                          onConfirm={() => handleDeleteEntry(entry.id)}
                          className="text-error hover:underline font-bold text-xs"
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-space-lg border border-on-surface bg-surface-container-low text-center font-body-md text-on-surface-variant">
                  <p className="font-bold text-on-surface mb-1">Nothing logged yet</p>
                  <p>Log your first activity on the left — for example today&apos;s drive or lunch — and it will appear here with its estimate.</p>
                </div>
              )}
            </div>

            <div className="pt-space-md mt-space-md border-t border-on-surface flex items-center justify-between font-label-caps-sm uppercase font-bold text-on-surface-variant">
              <span>Unusual days are flagged automatically</span>
              <Link href="/insights" className="min-h-[44px] inline-flex items-center text-on-surface hover:underline">See insights →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
