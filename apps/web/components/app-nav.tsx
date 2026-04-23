'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SignOutButton from '../app/(app)/sign-out-button';

const NAV = [
  { href: '/timeline', label: 'Timeline' },
  { href: '/people', label: 'People' },
  { href: '/settings', label: 'Settings' },
];

export default function AppNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 text-sm sm:flex">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-lg px-3 py-1.5 font-medium ${
              isActive(n.href)
                ? 'bg-white text-ink-900'
                : 'text-ink-700 hover:bg-white hover:text-ink-900'
            }`}
          >
            {n.label}
          </Link>
        ))}
        <Link
          href="/capture"
          className="ml-1 rounded-lg bg-ink-900 px-3 py-1.5 font-medium text-white hover:bg-ink-800"
        >
          + Capture
        </Link>
        {email && (
          <span className="ml-2 hidden text-xs text-ink-500 md:inline">{email}</span>
        )}
        <SignOutButton />
      </nav>

      {/* Mobile: capture CTA + hamburger */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <Link
          href="/capture"
          className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800"
        >
          + Capture
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-ink-700 hover:text-ink-900"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-ink-100 bg-paper-50 shadow-sm sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(n.href)
                    ? 'bg-white text-ink-900'
                    : 'text-ink-700 hover:bg-white hover:text-ink-900'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2">
              {email && <span className="truncate text-xs text-ink-500">{email}</span>}
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
