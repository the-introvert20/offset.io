'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    user?: { name?: string; email?: string; role?: string };
    region?: string;
    currency?: string;
    monthlyBudget?: number;
  } | null>(null);
  const [region, setRegion] = useState('IN');
  const [currency, setCurrency] = useState('INR');
  const [budget, setBudget] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchProfile = () => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setRegion(data.profile.region || 'IN');
          setCurrency(data.profile.currency || 'INR');
          setBudget(data.profile.monthlyBudget || 2000);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          currency,
          monthlyBudget: Number(budget),
        }),
      });
      if (res.ok) {
        fetchProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          LOADING USER PROFILE...
        </span>
      </div>
    );
  }

  const regions = [
    { value: 'IN', label: 'India (CEA Grid)', factor: '0.82 kg CO₂e/kWh' },
    { value: 'US', label: 'United States (EPA eGRID)', factor: '0.39 kg CO₂e/kWh' },
    { value: 'EU', label: 'European Union (EEA Grid)', factor: '0.27 kg CO₂e/kWh' },
    { value: 'UK', label: 'United Kingdom (DEFRA)', factor: '0.21 kg CO₂e/kWh' },
    { value: 'GLOBAL', label: 'Global Default Average', factor: '0.50 kg CO₂e/kWh' },
  ];

  const currencies = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const userName = profile?.user?.name || 'USER';
  const userEmail = profile?.user?.email || '';
  const userRole = profile?.user?.role || 'USER';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            USER PROFILE // GRID SETTINGS
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            {userName.toUpperCase()} • {userRole} • REGION: {region}
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            SESSION: ACTIVE
          </span>
          <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              ACCOUNT PARAMETERS
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              PROFILE & REGIONAL SETTINGS
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Configure region-specific grid emission factors, currency preferences, and monthly action budget. These parameters propagate across all calculation engines.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-space-md py-space-xs bg-surface-container border border-on-surface font-label-caps-md uppercase font-bold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none whitespace-nowrap"
          >
            ← OVERVIEW
          </Link>
        </div>

        {/* User Identity Card + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Identity Panel */}
          <div className="lg:col-span-4 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col justify-between">
            <div>
              <div className="border-b border-on-surface pb-space-sm mb-space-md">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  LEDGER ACCOUNT
                </span>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center text-center py-space-lg">
                <div className="w-20 h-20 bg-on-surface text-surface-container-lowest flex items-center justify-center font-display text-headline-xl font-bold mb-space-md">
                  {userInitial}
                </div>
                <div className="font-headline text-headline-md uppercase font-bold text-on-surface">
                  {userName}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  {userEmail}
                </div>
                <div className="mt-space-sm px-space-sm py-0.5 border border-on-surface bg-surface-container font-label-caps-sm text-label-caps-sm uppercase font-bold">
                  {userRole} ACCOUNT
                </div>
              </div>
            </div>

            <div className="border-t border-on-surface pt-space-md space-y-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
              <div className="flex justify-between">
                <span>FRAMEWORK</span>
                <span className="text-on-surface">ISO 14064-1</span>
              </div>
              <div className="flex justify-between">
                <span>GRID REGION</span>
                <span className="text-on-surface">{region}</span>
              </div>
              <div className="flex justify-between">
                <span>CURRENCY</span>
                <span className="text-on-surface">{currency}</span>
              </div>
              <div className="flex justify-between">
                <span>ACTION BUDGET</span>
                <span className="text-primary">{currency === 'INR' ? '₹' : '$'}{budget}/mo</span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-8 p-space-lg bg-surface-container-lowest">
            <div className="border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                UPDATE PARAMETERS
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-space-md">
              {/* Region Selection */}
              <div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-xs">
                  01 // GRID EMISSION FACTOR REGION
                </div>
                <div className="border border-on-surface">
                  {regions.map((r, i) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRegion(r.value)}
                      className={`w-full p-space-sm text-left flex items-center justify-between border-b border-on-surface last:border-b-0 transition-none ${
                        region === r.value
                          ? 'bg-on-surface text-surface-container-lowest'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold">
                        {String(i + 1).padStart(2, '0')}{' // '}{r.label}
                      </span>
                      <span className={`font-label-caps-sm text-label-caps-sm uppercase font-bold ${region === r.value ? 'text-surface-container-lowest' : 'text-on-surface-variant'}`}>
                        {r.factor}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-xs">
                    02 // CURRENCY
                  </div>
                  <div className="border border-on-surface grid grid-cols-2">
                    {currencies.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCurrency(c.value)}
                        className={`p-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold border-r border-b border-on-surface last:border-r-0 transition-none ${
                          currency === c.value
                            ? 'bg-on-surface text-surface-container-lowest'
                            : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-xs">
                    03 // MONTHLY ACTION BUDGET
                  </div>
                  <div className="border border-on-surface">
                    <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                      <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">LIMIT</span>
                      <span className="font-headline text-headline-sm font-bold text-primary">{currency === 'INR' ? '₹' : '$'}{budget}</span>
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={0}
                      step={100}
                      className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-low"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-space-sm px-space-lg font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface flex items-center justify-center gap-space-xs transition-none ${
                  saved
                    ? 'bg-primary text-on-primary'
                    : 'bg-on-surface text-surface-container-lowest hover:bg-primary'
                } disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {saved ? 'check' : 'save'}
                </span>
                <span>
                  {saving ? 'SAVING...' : saved ? 'PROFILE SAVED' : 'SAVE PROFILE PARAMETERS →'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
