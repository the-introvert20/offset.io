'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ANOMALY_Z_SCORE_THRESHOLD } from '@/lib/engine/anomaly';

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  isAnomaly: boolean;
  anomalyScore: number;
  createdAt: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'anomaly' | 'insight'>('all');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        if (d.insights) setInsights(d.insights);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = insights.filter((ins) => {
    if (filter === 'anomaly') return ins.isAnomaly;
    if (filter === 'insight') return !ins.isAnomaly;
    return true;
  });

  const anomalyCount = insights.filter((i) => i.isAnomaly).length;
  const insightCount = insights.filter((i) => !i.isAnomaly).length;

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          SCANNING ANOMALY DETECTION ENGINE...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            STATISTICAL ANOMALY FEED // ISO 14064-3
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            {anomalyCount} ANOMALY SIGNALS • {insightCount} TREND INSIGHTS ACTIVE
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            AUDIT: ROLLING 30-DAY
          </span>
          <span className="material-symbols-outlined text-[16px]">analytics</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Page Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              PATTERN RECOGNITION LAYER
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              INSIGHTS & ANOMALY DETECTION
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Continuous statistical monitoring of your carbon telemetry. Anomalies represent deviations exceeding {ANOMALY_Z_SCORE_THRESHOLD}× standard deviation from your rolling mean.
            </p>
          </div>
          <div className="flex items-center space-x-2 font-label-caps-sm uppercase font-bold">
            <Link
              href="/dashboard"
              className="px-space-md py-space-xs bg-surface-container border border-on-surface text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              ← OVERVIEW
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center border border-on-surface w-fit">
          {[
            { key: 'all' as const, label: `ALL (${insights.length})` },
            { key: 'anomaly' as const, label: `ANOMALIES (${anomalyCount})` },
            { key: 'insight' as const, label: `INSIGHTS (${insightCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-space-md py-space-xs font-label-caps-md text-label-caps-md uppercase font-bold border-r border-on-surface last:border-r-0 transition-none ${
                filter === tab.key
                  ? 'bg-on-surface text-surface-container-lowest'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Insights Feed */}
        {filtered.length === 0 ? (
          <div className="border border-on-surface p-space-xl bg-surface-container-low text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-space-sm">check_circle</span>
            <span className="font-label-caps-md uppercase font-bold text-on-surface-variant block">
              NO ACTIVE SIGNALS IN THIS CATEGORY
            </span>
            <p className="font-body-md text-on-surface-variant mt-2">
              Continue logging activity entries to generate statistical patterns.
            </p>
          </div>
        ) : (
          <div className="space-y-space-xs">
            {filtered.map((ins, idx) => (
              <div
                key={ins.id}
                className={`border border-on-surface flex flex-col sm:flex-row items-start sm:items-stretch bg-surface-container-lowest ${
                  ins.isAnomaly ? 'border-l-4 border-l-coral-accent' : 'border-l-4 border-l-primary'
                }`}
              >
                {/* Index Column */}
                <div className="p-space-md border-b sm:border-b-0 sm:border-r border-on-surface bg-surface-container-low flex items-center justify-center min-w-[80px] shrink-0">
                  <div className="text-center">
                    <div className="font-display text-headline-lg font-bold text-on-surface">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <div className={`font-label-caps-sm text-label-caps-sm uppercase font-bold mt-0.5 ${ins.isAnomaly ? 'text-coral-accent' : 'text-primary'}`}>
                      {ins.isAnomaly ? 'ALERT' : 'SIGNAL'}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-space-md flex flex-col justify-between gap-space-sm">
                  <div>
                    <div className="flex flex-wrap items-center gap-space-sm mb-1">
                      <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                        {ins.title}
                      </span>
                      {ins.isAnomaly && (
                        <span className="px-space-xs py-0.5 bg-coral-accent text-white font-label-caps-sm text-label-caps-sm uppercase font-bold">
                          ANOMALY DETECTED
                        </span>
                      )}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                      {ins.description}
                    </p>
                  </div>

                  {ins.isAnomaly && ins.anomalyScore > 0 && (
                    <div className="p-space-sm bg-coral-accent/10 border border-coral-accent font-label-caps-sm text-label-caps-sm uppercase font-bold text-coral-accent">
                      STATISTICAL DEVIATION: {ins.anomalyScore.toFixed(2)}× STANDARD DEVIATION • THRESHOLD: {ANOMALY_Z_SCORE_THRESHOLD.toFixed(1)}×
                    </div>
                  )}
                </div>

                {/* Meta Column */}
                <div className="p-space-md border-t sm:border-t-0 sm:border-l border-on-surface bg-surface-container-low flex flex-col items-end justify-between min-w-[160px] shrink-0">
                  <span className="px-space-xs py-0.5 border border-on-surface bg-surface-container font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    {ins.category}
                  </span>
                  <div className="text-right mt-auto">
                    <div className={`font-label-caps-sm uppercase font-bold ${ins.severity === 'HIGH' ? 'text-coral-accent' : ins.severity === 'MEDIUM' ? 'text-yellow-accent' : 'text-primary'}`}>
                      SEVERITY: {ins.severity}
                    </div>
                    <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-0.5">
                      {new Date(ins.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer CTA Row */}
        <div className="border-t border-on-surface pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
          <span>DATA SOURCE: PERSONAL CARBON LEDGER • Z-SCORE THRESHOLD: {ANOMALY_Z_SCORE_THRESHOLD.toFixed(1)}</span>
          <Link href="/diary" className="text-primary hover:underline">
            LOG ACTIVITY TO GENERATE MORE SIGNALS →
          </Link>
        </div>
      </div>
    </div>
  );
}
