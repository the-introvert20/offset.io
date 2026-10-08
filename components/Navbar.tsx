'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavGroup {
  label: string;
  href: string;
  sublinks?: { href: string; label: string }[];
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email?: string; image?: string | null } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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

  const navGroups: NavGroup[] = [
    { href: '/dashboard', label: 'Overview' },
    {
      href: '/simulator',
      label: 'Explore',
      sublinks: [
        { href: '/simulator', label: 'Try changes' },
        { href: '/scenarios', label: 'Scenarios' },
      ],
    },
    {
      href: '/reduction-plan',
      label: 'Plan',
      sublinks: [
        { href: '/reduction-plan', label: 'My plan' },
        { href: '/goals', label: 'Goals' },
      ],
    },
    {
      href: '/diary',
      label: 'Log',
      sublinks: [
        { href: '/diary', label: 'Daily log' },
        { href: '/insights', label: 'Insights' },
      ],
    },
    { href: '/coach', label: 'Coach' },
  ];

  if (user?.role === 'ADMIN') {
    navGroups.push({ href: '/admin', label: 'Factors (admin)' });
  }

  const isGroupActive = (group: NavGroup) => {
    if (pathname === group.href) return true;
    if (group.sublinks?.some((sub) => pathname === sub.href)) return true;
    return false;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest border-b border-on-surface">
      <div className="h-14 w-full flex items-stretch">
        {/* Logo Cell */}
        <div className="flex items-center px-space-md border-r border-on-surface bg-surface-container-lowest shrink-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="w-5 h-5 bg-primary inline-flex items-center justify-center text-white text-[11px] font-bold tracking-tighter" aria-hidden="true">
              O
            </span>
            <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-on-surface font-bold">
              offset.io
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-stretch flex-1 bg-surface-container-lowest" aria-label="Main navigation">
          {navGroups.map((group) => {
            const active = isGroupActive(group);
            const hasSub = group.sublinks && group.sublinks.length > 0;

            if (!hasSub) {
              return (
                <Link
                  key={group.href}
                  href={group.href}
                  className={`flex items-center px-space-md border-r border-on-surface uppercase font-label-caps-md text-label-caps-md whitespace-nowrap transition-none select-none ${
                    active
                      ? 'bg-on-surface text-surface-container-lowest font-bold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {group.label}
                </Link>
              );
            }

            return (
              <div
                key={group.label}
                className="relative flex items-stretch border-r border-on-surface"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <Link
                  href={group.href}
                  className={`flex items-center gap-1 px-space-md uppercase font-label-caps-md text-label-caps-md whitespace-nowrap transition-none select-none ${
                    active
                      ? 'bg-on-surface text-surface-container-lowest font-bold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span>{group.label}</span>
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                    arrow_drop_down
                  </span>
                </Link>

                {openGroup === group.label && (
                  <div className="absolute top-14 left-0 min-w-[160px] bg-surface-container-lowest border border-on-surface shadow-md divide-y divide-on-surface z-50">
                    {group.sublinks!.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setOpenGroup(null)}
                        className={`block px-space-md py-space-sm uppercase font-label-caps-sm text-label-caps-sm whitespace-nowrap transition-none ${
                          pathname === sub.href
                            ? 'bg-on-surface text-surface-container-lowest font-bold'
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Mobile Hamburger Trigger */}
        <div className="flex md:hidden flex-1 items-center justify-end px-space-sm border-r border-on-surface">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="min-h-[44px] min-w-[44px] p-2 text-on-surface hover:bg-surface-container flex items-center justify-center border border-on-surface"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
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
              className="min-h-[36px] inline-flex items-center px-space-md py-space-xs bg-on-surface text-surface-container-lowest font-label-caps-md text-label-caps-md uppercase border border-on-surface hover:bg-primary hover:text-on-primary transition-none font-bold whitespace-nowrap"
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
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs hover:opacity-90 overflow-hidden border border-on-surface"
                  title={`${user.name} (${user.role})`}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] inline-flex items-center px-space-xs font-label-caps-sm text-label-caps-sm uppercase font-bold text-on-surface-variant hover:text-error transition-none"
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-on-surface bg-surface-container-lowest divide-y divide-on-surface max-h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-space-md space-y-space-md">
            {navGroups.map((group) => {
              const active = isGroupActive(group);
              return (
                <div key={group.label} className="border border-on-surface">
                  <Link
                    href={group.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[44px] p-space-md uppercase font-label-caps-md text-label-caps-md flex items-center justify-between border-b border-on-surface last:border-b-0 ${
                      active ? 'bg-on-surface text-surface-container-lowest font-bold' : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <span>{group.label}</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                  </Link>
                  {group.sublinks && (
                    <div className="grid grid-cols-2 divide-x divide-on-surface bg-surface-container-lowest">
                      {group.sublinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`min-h-[44px] p-space-sm uppercase font-label-caps-sm text-label-caps-sm flex items-center justify-between ${
                            pathname === sub.href ? 'bg-on-surface text-surface-container-lowest font-bold' : 'text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
