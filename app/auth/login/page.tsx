'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('SYSTEM ERROR: UNABLE TO REACH AUTHENTICATION SERVER');
      setLoading(false);
    }
  };

  const fillDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center bg-surface-container-lowest">
      <div className="w-full max-w-lg border border-on-surface">
        {/* Auth Panel Header */}
        <div className="border-b border-on-surface bg-surface-container-low flex items-stretch">
          <div className="p-space-md border-r border-on-surface flex items-center">
            <span className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-sm">O</span>
          </div>
          <div className="p-space-md flex-1">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              offset.io // CARBON INTELLIGENCE PLATFORM
            </div>
            <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-0.5">
              AUTHENTICATED SESSION REQUIRED
            </div>
          </div>
          <div className="p-space-md border-l border-on-surface bg-secondary-fixed flex items-center">
            <span className="material-symbols-outlined text-on-secondary-fixed text-[20px]">lock</span>
          </div>
        </div>

        {/* Quick Demo Credentials */}
        <div className="border-b border-on-surface bg-surface-container p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-sm">
            QUICK DEMO ACCESS
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => fillDemoUser('demo@offset.io')}
              className="p-space-sm border border-on-surface bg-surface-container-lowest text-left hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-inherit">DEMO ACCOUNT</div>
              <div className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">demo@offset.io</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('admin@offset.io')}
              className="p-space-sm border border-on-surface bg-surface-container-lowest text-left hover:bg-on-surface hover:text-surface-container-lowest transition-none"
            >
              <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-inherit">ADMIN ACCOUNT</div>
              <div className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">admin@offset.io</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md bg-surface-container-lowest">
          <div>
            <span className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface-variant block mb-space-sm">
              AUTHENTICATION CREDENTIALS
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

          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                EMAIL ADDRESS
              </label>
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@offset.io"
              className="w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
              <label className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                PASSWORD
              </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none disabled:opacity-50 flex items-center justify-center gap-space-xs"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? 'hourglass_top' : 'login'}
            </span>
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO CARBON LEDGER'}</span>
          </button>

          <div className="pt-space-xs border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
            <span className="text-on-surface-variant">NO ACCOUNT?</span>
            <Link
              href="/auth/register"
              className="text-primary hover:underline"
            >
              CREATE ACCOUNT →
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-on-surface bg-surface-container-low p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold text-center">
            SECURE SESSION • DATA ENCRYPTED AT REST • ISO 14064-1 COMPLIANT
          </div>
        </div>
      </div>
    </div>
  );
}
