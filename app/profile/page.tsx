'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Notice from '@/components/Notice';
import { formatCurrency } from '@/lib/format';

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    user?: {
      name?: string;
      email?: string;
      role?: string;
      image?: string | null;
      googleId?: string | null;
    };
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
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setSaveError(null);
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
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError('We couldn’t save those settings. Try again.');
      }
    } catch {
      setSaveError('Connection problem. Your settings are unchanged — try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-space-xl text-on-surface">
        <div className="w-12 h-12 border-2 border-on-surface border-t-primary animate-spin mb-space-md" aria-hidden="true" />
        <span className="font-label-caps-md uppercase tracking-wider font-bold">
          Loading your profile…
        </span>
      </div>
    );
  }

  // Grid factors mirror the seeded emission factors (kg CO₂e per kWh).
  const regions = [
    { value: 'IN', label: 'India', factor: '0.71 kg CO₂e/kWh' },
    { value: 'US', label: 'United States', factor: '0.39 kg CO₂e/kWh' },
    { value: 'EU', label: 'European Union', factor: '0.23 kg CO₂e/kWh' },
    { value: 'UK', label: 'United Kingdom', factor: '0.21 kg CO₂e/kWh' },
    { value: 'GLOBAL', label: 'Somewhere else (global average)', factor: '0.45 kg CO₂e/kWh' },
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
  const userImage = profile?.user?.image || null;
  const isGoogleLinked = Boolean(profile?.user?.googleId);
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col w-full text-on-surface bg-surface-container-lowest">
      {/* Ticker Header */}
      <section className="w-full bg-surface-container-low border-b border-on-surface flex flex-col md:flex-row items-stretch justify-between text-on-surface select-none">
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center space-x-space-sm bg-surface-container-lowest">
          <span className="w-2.5 h-2.5 bg-primary animate-pulse" aria-hidden="true"></span>
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wider text-on-surface font-bold">
            Profile &amp; settings
          </span>
        </div>
        <div className="px-space-md py-space-xs border-b md:border-b-0 md:border-r border-on-surface flex items-center flex-1 justify-center bg-surface-container-lowest">
          <span className="font-label-caps-md text-label-caps-md uppercase tracking-wide text-on-surface">
            {userName} • {region} • {currency}
          </span>
        </div>
        <div className="px-space-md py-space-xs flex items-center justify-between md:justify-end space-x-space-md bg-secondary-fixed text-on-secondary-fixed">
          <span className="font-label-caps-sm text-label-caps-sm uppercase tracking-widest font-bold">
            Signed in
          </span>
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">manage_accounts</span>
        </div>
      </section>

      {/* Main Body */}
      <div className="p-space-lg md:p-space-xl space-y-space-lg">

        {/* Header */}
        <div className="border-b border-on-surface pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-label-caps-sm uppercase text-primary font-bold tracking-widest">
              Your details
            </span>
            <h1 className="font-headline text-headline-xl uppercase font-bold tracking-tight mt-1">
              Profile &amp; settings
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-3xl mt-1">
              Your region chooses the electricity factor for your estimates, and your currency is used for every cost shown across the app.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-surface-container border border-on-surface font-label-caps-md uppercase font-bold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest transition-none whitespace-nowrap"
          >
            ← Back to overview
          </Link>
        </div>

        {/* User Identity Card + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-on-surface">
          {/* Identity Panel */}
          <div className="lg:col-span-4 p-space-lg border-b lg:border-b-0 lg:border-r border-on-surface bg-surface-container-low flex flex-col justify-between">
            <div>
              <div className="border-b border-on-surface pb-space-sm mb-space-md">
                <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                  Your account
                </span>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center text-center py-space-lg">
                <div className="w-20 h-20 bg-on-surface text-surface-container-lowest flex items-center justify-center font-display text-headline-xl font-bold mb-space-md overflow-hidden border-2 border-on-surface">
                  {userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="font-headline text-headline-md uppercase font-bold text-on-surface">
                  {userName}
                </div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-1">
                  {userEmail}
                </div>

                {/* Account Type & Google Badge */}
                <div className="mt-space-sm flex flex-wrap gap-1 justify-center">
                  <span className="px-space-sm py-0.5 border border-on-surface bg-surface-container font-label-caps-sm text-label-caps-sm uppercase font-bold">
                    {userRole} ACCOUNT
                  </span>
                  {isGoogleLinked ? (
                    <span className="px-space-sm py-0.5 border border-on-surface bg-primary text-on-primary font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Google Linked
                    </span>
                  ) : (
                    <a
                      href="/api/auth/google?redirect=/profile"
                      className="px-space-sm py-0.5 border border-on-surface bg-surface-container-high hover:bg-on-surface hover:text-surface-container-lowest font-label-caps-sm text-label-caps-sm uppercase font-bold flex items-center gap-1 transition-none"
                    >
                      + Link Google
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-on-surface pt-space-md space-y-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
              <div className="flex justify-between">
                <span>Region</span>
                <span className="text-on-surface">{region}</span>
              </div>
              <div className="flex justify-between">
                <span>Currency</span>
                <span className="text-on-surface">{currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly budget</span>
                <span className="text-primary">{formatCurrency(budget, currency)}/mo</span>
              </div>
            </div>
          </div>

          {/* Settings Form */}
          <div className="lg:col-span-8 p-space-lg bg-surface-container-lowest">
            <div className="border-b border-on-surface pb-space-sm mb-space-md">
              <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
                Change settings
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-space-md">
              {saveError && <Notice tone="error">{saveError}</Notice>}
              {/* Region Selection */}
              <div>
                <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-xs">
                  Where you live — sets your electricity factor
                </div>
                <div className="border border-on-surface">
                  {regions.map((r, i) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRegion(r.value)}
                      aria-pressed={region === r.value}
                      className={`min-h-[44px] w-full p-space-sm text-left flex items-center justify-between border-b border-on-surface last:border-b-0 transition-none ${
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
                  <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-xs" id="profile-currency-label">
                    Currency for all costs
                  </div>
                  <div className="border border-on-surface grid grid-cols-2" role="group" aria-labelledby="profile-currency-label">
                    {currencies.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCurrency(c.value)}
                        aria-pressed={currency === c.value}
                        className={`min-h-[44px] p-space-sm font-label-caps-sm text-label-caps-sm uppercase font-bold border-r border-b border-on-surface last:border-r-0 transition-none ${
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
                    Monthly budget for green actions
                  </div>
                  <div className="border border-on-surface">
                    <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                      <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">Limit</span>
                      <span className="font-headline text-headline-sm font-bold text-primary">{formatCurrency(budget, currency)}</span>
                    </div>
                    <input
                      id="profile-budget"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      min={0}
                      step={100}
                      aria-label="Monthly budget in your currency"
                      className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:outline-none focus:bg-surface-container-low"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`min-h-[44px] w-full py-space-sm px-space-lg font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface flex items-center justify-center gap-space-xs transition-none ${
                  saved
                    ? 'bg-primary text-on-primary'
                    : 'bg-on-surface text-surface-container-lowest hover:bg-primary'
                } disabled:opacity-50`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {saved ? 'check' : 'save'}
                </span>
                <span>
                  {saving ? 'Saving…' : saved ? 'Settings saved' : 'Save changes →'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
