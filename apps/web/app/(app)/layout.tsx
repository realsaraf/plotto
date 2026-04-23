import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PlottoMark from '@/components/plotto-mark';
import AppNav from '@/components/app-nav';
import { supabaseServer } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-paper-50/80 backdrop-blur">
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <Link href="/timeline" className="flex shrink-0 items-center gap-2">
            <PlottoMark className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">Plotto</span>
          </Link>
          <AppNav email={user.email ?? null} />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5">{children}</div>
    </div>
  );
}
