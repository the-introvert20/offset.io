'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/auth/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/calculate', label: "How it's calculated" },
    { href: '/simulator', label: 'Try changes' },
    { href: '/scenarios', label: 'Scenarios' },
    { href: '/reduction-plan', label: 'My plan' },
    { href: '/diary', label: 'Daily log' },
    { href: '/insights', label: 'Insights' },
    { href: '/coach', label: 'Coach' },
    { href: '/goals', label: 'Goals' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Factors (admin)' });
  }

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-on-surface">
      <div className="h-14 w-full flex items-stretch">
        {/* Logo Cell */}
        <div className="flex items-center px-space-md border-r border-on-surface bg-surface-container-lowest shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-primary inline-flex items-center justify-center text-white text-[11px] font-bold tracking-tighter">O</span>
            <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface font-bold">
              offset.io
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-stretch overflow-x-auto flex-1 bg-surface-container-lowest">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-space-md border-r border-on-surface uppercase font-label-caps-md text-label-caps-md whitespace-nowrap transition-none select-none ${
                  isActive
                    ? 'bg-on-surface text-surface-container-lowest font-bold'
                    : 'text-on-surface hover:bg-on-surface hover:text-surface-container-lowest'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Trigger */}
        <div className="flex lg:hidden flex-1 items-center justify-end px-space-sm border-r border-on-surface">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface hover:bg-surface-container flex items-center justify-center border border-on-surface"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Right Utility Actions */}
        <div className="hidden sm:flex items-stretch shrink-0">
          <div className="flex items-center px-space-md border-l border-on-surface bg-surface-container-lowest">
            <Link
              href="/diary"
              className="px-space-md py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase border border-on-surface hover:bg-primary hover:text-on-primary transition-none font-bold whitespace-nowrap"
            >
              Log activity
            </Link>
          </div>

          {/* User Account / Sign In */}
          <div className="flex items-center px-space-md border-l border-on-surface bg-surface-container-lowest">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs hover:opacity-90"
                  title={`${user.name} (${user.role})`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] text-[11px] uppercase font-label font-bold text-on-surface-variant hover:text-error ml-1"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="min-h-[44px] inline-flex items-center font-label-caps-sm text-label-caps-sm uppercase font-bold text-primary hover:underline whitespace-nowrap"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-on-surface bg-surface-container-lowest divide-y divide-on-surface">
          <div className="grid grid-cols-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-space-md uppercase font-label-caps-md text-label-caps-md border-r border-b border-on-surface flex items-center justify-between ${
                    isActive ? 'bg-on-surface text-surface-container-lowest font-bold' : 'text-on-surface'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
                </Link>
              );
            })}
          </div>

          <div className="p-space-md flex items-center justify-between bg-surface-container-low">
            <Link
              href="/diary"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] inline-flex items-center px-space-md py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md uppercase font-bold"
            >
              Log activity
            </Link>
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-[44px] inline-flex items-center font-label-caps-sm uppercase font-bold text-on-surface underline"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] inline-flex items-center font-label-caps-sm uppercase font-bold text-error"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] inline-flex items-center font-label-caps-md uppercase font-bold text-primary"
              >
                Sign in →
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
