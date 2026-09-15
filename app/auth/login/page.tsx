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
      setError('Connection problem — please check your connection and try again.');
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
            <span className="w-8 h-8 bg-primary flex items-center justify-center text-on-primary font-bold text-sm" aria-hidden="true">O</span>
          </div>
          <div className="p-space-md flex-1">
            <div className="font-label-caps-md text-label-caps-md uppercase font-bold text-on-surface">
              Welcome back
            </div>
            <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold mt-0.5">
              Sign in to see your footprint
            </div>
          </div>
          <div className="p-space-md border-l border-on-surface bg-secondary-fixed flex items-center">
            <span className="material-symbols-outlined text-on-secondary-fixed text-[20px]" aria-hidden="true">lock</span>
          </div>
        </div>

        {/* Quick Demo Credentials */}
        <div className="border-b border-on-surface bg-surface-container p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant mb-space-sm">
            Try the demo (fills the form for you)
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
          {error && (
            <div className="border border-error bg-error/10 p-space-sm flex items-center gap-space-sm" role="alert">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0" aria-hidden="true">error</span>
              <span className="font-body-sm text-body-sm font-bold text-error">
                {error}
              </span>
            </div>
          )}

          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
              <label htmlFor="login-email" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                Email address
              </label>
            </div>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          <div className="border border-on-surface">
            <div className="border-b border-on-surface p-space-sm bg-surface-container-low">
              <label htmlFor="login-password" className="font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant">
                Password
              </label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="min-h-[44px] w-full px-space-md py-space-sm bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-low"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full py-space-sm bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase font-bold border border-on-surface hover:bg-primary transition-none disabled:opacity-50 flex items-center justify-center gap-space-xs"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {loading ? 'hourglass_top' : 'login'}
            </span>
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
          </button>

          <div className="pt-space-xs border-t border-on-surface flex items-center justify-between font-label-caps-sm text-label-caps-sm uppercase font-bold">
            <span className="text-on-surface-variant">New here?</span>
            <Link
              href="/auth/register"
              className="min-h-[44px] inline-flex items-center text-primary hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-on-surface bg-surface-container-low p-space-md">
          <div className="font-label-caps-sm text-label-caps-sm uppercase text-on-surface-variant font-bold text-center">
            Passwords are hashed · sessions expire after 7 days
          </div>
        </div>
      </div>
    </div>
  );
}
