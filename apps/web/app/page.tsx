export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex flex-col items-center">
        <h1 className="text-6xl font-bold tracking-tight text-ink-900">Plotto</h1>
        <p className="mt-2 text-lg text-ink-500">Your life, plotted out.</p>
        <div className="mt-8 h-1 w-16 rounded-full bg-coral-500" />
        <p className="mt-8 text-sm text-ink-400">Phase 0 · Hello.</p>
      </div>
    </main>
  );
}
