'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('IN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, region }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      router.push('/onboarding');
    } catch {
      setError('SYSTEM ERROR: REGISTRATION ENDPOINT UNREACHABLE');
      setLoading(false);
    }
  };

  const regions = [
    { value: 'IN', label: 'India (CEA Grid)' },
    { value: 'US', label: 'United States (EPA eGRID)' },
    { value: 'EU', label: 'European Union (EEA Grid)' },
    { value: 'UK', label: 'United Kingdom (DEFRA Grid)' },
    { value: 'GLOBAL', label: 'Global Default Average' },
  ];

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-surface-container-lowest">
      <div className="w-full max-w-lg border border-on-surface">
        {/* Panel Header */}
        <div className="border-b border-on-surface bg-surface-container-low flex items-stretch">
          <div className="p-space-md border-r border-on-surface flex items-center">
            <span className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-sm">O</span>
          </div>
          <div className="p-space-md flex-1">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              offset.io // CARBON INTELLIGENCE PLATFORM
            </div>
            <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-0.5">
              CREATE PERSONAL CARBON LEDGER ACCOUNT
            </div>
          </div>
          <div className="p-space-md border-l border-on-surface bg-secondary-fixed flex items-center">
            <span className="material-symbols-outlined text-on-secondary-fixed text-[20px]">person_add</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="border-b border-on-surface bg-surface-container p-space-md">
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">info</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              Register to initialize your personal carbon intelligence ledger. After sign-up, complete the onboarding baseline assessment to calibrate your emissions profile.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md bg-surface-container-lowest">
          <div>
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface-variant block mb-space-sm">
              ACCOUNT PARAMETERS
            </span>
          </div>

          {error && (
            <div className="border border-coral-accent bg-coral-accent/10 p-space-sm flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-coral-accent text-[18px] shrink-0">error</span>
              <span className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-coral-accent">
                {error}
              </span>
            </div>
          )}

          {/* Name */}
          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                FULL NAME
              </label>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          {/* Email */}
          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                EMAIL ADDRESS
              </label>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">mail</span>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          {/* Password */}
          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                PASSWORD
              </label>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">key</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          {/* Region */}
          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                GRID REGION / COUNTRY
              </label>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">language</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {regions.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRegion(r.value)}
                  className={`p-space-sm text-left border-b border-r border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold transition-none ${
                    region === r.value
                      ? 'bg-on-surface text-surface-container-lowest'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none disabled:opacity-50 flex items-center justify-center gap-space-xs"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? 'hourglass_top' : 'person_add'}
            </span>
            <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE CARBON LEDGER ACCOUNT →'}</span>
          </button>

          <div className="pt-space-xs border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
            <span className="text-on-surface-variant">EXISTING ACCOUNT?</span>
            <Link
              href="/auth/login"
              className="text-primary hover:underline"
            >
              SIGN IN →
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-on-surface bg-surface-container-low p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold text-center">
            PERSONAL DATA STORED LOCALLY • ISO 14064-1 FRAMEWORK • ZERO TRACKING
          </div>
        </div>
      </div>
    </div>
  );
}
