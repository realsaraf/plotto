import CaptureForm from './capture-form';

export const metadata = { title: 'New capture · Plotto' };

export default function CapturePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New capture</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Paste an email, type what&apos;s on your mind, attach a screenshot,
          or upload a PDF — Plotto turns it into something you can place on
          your timeline.
        </p>
      </div>
      <CaptureForm />
    </div>
  );
}
