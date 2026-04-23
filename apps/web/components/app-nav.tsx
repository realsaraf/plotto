'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SignOutButton from '../app/(app)/sign-out-button';
import { ThemeToggle } from './theme-toggle';
import { PlusIcon } from './icons';

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
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              isActive(n.href)
                ? 'bg-card text-fg shadow-sm'
                : 'text-fg-muted hover:bg-card hover:text-fg'
            }`}
          >
            {n.label}
          </Link>
        ))}
        <Link
          href="/capture"
          className="ml-1 inline-flex items-center gap-1 rounded-lg bg-fg px-3 py-1.5 font-medium text-surface hover:opacity-90"
        >
          <PlusIcon size={14} /> Capture
        </Link>
        <ThemeToggle className="ml-2" />
        {email && (
          <span className="ml-2 hidden max-w-[14ch] truncate text-xs text-fg-subtle md:inline">
            {email}
          </span>
        )}
        <SignOutButton />
      </nav>

      {/* Mobile: capture CTA + hamburger */}
      <div className="flex items-center gap-1.5 sm:hidden">
        <Link
          href="/capture"
          className="inline-flex items-center gap-1 rounded-lg bg-fg px-3 py-1.5 text-sm font-medium text-surface hover:opacity-90"
        >
          <PlusIcon size={14} /> Capture
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-fg-muted hover:text-fg"
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
        <div className="absolute inset-x-0 top-full border-b border-line bg-surface shadow-sm sm:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive(n.href)
                    ? 'bg-card text-fg'
                    : 'text-fg-muted hover:bg-card hover:text-fg'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-3">
              <ThemeToggle />
              {email && <span className="ml-auto truncate text-xs text-fg-subtle">{email}</span>}
            </div>
            <div className="mt-2 flex justify-end">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
