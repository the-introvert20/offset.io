'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GoogleSignInButton from '@/components/GoogleSignInButton';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('US');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (!errorParam) return;

    switch (errorParam) {
      case 'google_not_configured':
        setError('Google Sign-Up is not configured yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
        break;
      case 'cancelled':
        setError('Google sign-up was cancelled.');
        break;
      case 'invalid_state':
        setError('Authentication session expired or was invalid. Please try again.');
        break;
      case 'oauth_error':
        setError('Google authentication failed. Please try again.');
        break;
      default:
        setError('Authentication error: ' + errorParam);
    }
  }, [searchParams]);

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
      setError('Connection problem — please check your connection and try again.');
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
            <span className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-sm" aria-hidden="true">O</span>
          </div>
          <div className="p-space-md flex-1">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Create your account
            </div>
            <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-0.5">
              Free · takes a minute
            </div>
          </div>
          <div className="p-space-md border-l border-on-surface bg-secondary-fixed flex items-center">
            <span className="material-symbols-outlined text-on-secondary-fixed text-[20px]" aria-hidden="true">person_add</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="border-b border-on-surface bg-surface-container p-space-md">
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0" aria-hidden="true">info</span>
            <p className="font-body-sm text-body-sm text-on-surface">
              After signing up, you&apos;ll answer 5 quick questions so we can estimate your footprint.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-space-lg space-y-space-md bg-surface-container-lowest">
          {error && (
            <div className="border border-error bg-error/10 p-space-sm flex items-center gap-space-sm" role="alert">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0" aria-hidden="true">error</span>
              <span className="font-body-sm text-body-sm font-bold text-error">
                {error}
              </span>
            </div>
          )}

          {/* Google Sign Up Button */}
          <div>
            <GoogleSignInButton
              label="Sign up with Google"
              redirectPath="/onboarding"
            />
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-on-surface/40"></div>
            <span className="flex-shrink mx-3 font-label-caps-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              OR REGISTER WITH EMAIL
            </span>
            <div className="flex-grow border-t border-on-surface/40"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-space-md">
            {/* Name */}
            <div className="border border-on-surface">
              <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                <label htmlFor="register-name" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Your name
                </label>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">person</span>
              </div>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
              />
            </div>

            {/* Email */}
            <div className="border border-on-surface">
              <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                <label htmlFor="register-email" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Email address
                </label>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">mail</span>
              </div>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
              />
            </div>

            {/* Password */}
            <div className="border border-on-surface">
              <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                <label htmlFor="register-password" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                  Password (at least 6 characters)
                </label>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">key</span>
              </div>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
              />
            </div>

            {/* Region */}
            <div className="border border-on-surface">
              <div className="border-b border-on-surface p-space-sm bg-surface-container-low flex items-center justify-between">
                <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant" id="register-region-label">
                  Where do you live?
                </label>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant" aria-hidden="true">language</span>
              </div>
              <p className="px-space-md pt-space-xs font-body-sm text-body-sm text-on-surface-variant">
                Sets your electricity factor. You can change it later.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 p-space-sm" role="group" aria-labelledby="register-region-label">
                {regions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRegion(r.value)}
                    aria-pressed={region === r.value}
                    className={`min-h-[44px] p-space-sm text-left border-b border-r border-on-surface font-label-caps-sm text-label-caps-sm uppercase font-bold transition-none ${
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
              className="min-h-[44px] w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none disabled:opacity-50 flex items-center justify-center gap-space-xs"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {loading ? 'hourglass_top' : 'person_add'}
              </span>
              <span>{loading ? 'Creating your account…' : 'Create account →'}</span>
            </button>
          </form>

          <div className="pt-space-xs border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
            <span className="text-on-surface-variant">Already have an account?</span>
            <Link
              href="/auth/login"
              className="min-h-[44px] inline-flex items-center text-primary hover:underline"
            >
              Sign in →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-on-surface bg-surface-container-low p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold text-center">
            We store your profile and activities on this server to compute your footprint
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[80vh] flex items-center justify-center bg-surface-container-lowest">
        <div className="font-label-caps-md uppercase font-bold text-on-surface">Loading…</div>
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
