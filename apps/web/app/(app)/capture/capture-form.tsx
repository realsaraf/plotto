'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  FileIcon,
  ImageIcon,
  PhoneIcon,
  SparkleIcon,
  VideoIcon,
  XIcon,
} from '@/components/icons';

type PlottoPreview = {
  event_id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  importance: string;
  confidence: number;
  clarifyingQuestion: string | null;
  people: { name: string; role: string | null }[];
  meetingLinks: { type: string; url: string; label: string | null }[];
  phoneNumbers: { number: string; label: string | null }[];
  conflictsWithWorkSchedule: boolean;
};

type Warning = {
  event_id: string;
  title: string;
  startsAt: string;
  kind: 'work_schedule';
};

type Attachment = {
  kind: 'image' | 'doc';
  file: File;
  previewUrl?: string;
  originalBytes: number;
  finalBytes: number;
  filename: string;
};

const MAX_DOC_BYTES = 1 * 1024 * 1024; // 1 MB hard cap for PDF/DOCX/TXT
const ACCEPTED_DOC_MIMES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
]);
const ACCEPTED_IMAGE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif',
]);

const IMAGE_MAX_DIMENSION = 1600; // px on longest edge
const IMAGE_QUALITY = 0.82;
const IMAGE_MAX_OUTPUT_BYTES = 800 * 1024; // try to land under ~800 KB

function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Client-side image compression. Loads the image, scales the longest edge
 * down to IMAGE_MAX_DIMENSION, then re-encodes as WebP. If the encoder
 * isn't available (Safari < 14), falls back to JPEG.
 */
async function compressImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Could not decode image'));
      i.src = url;
    });

    const longest = Math.max(img.width, img.height);
    const scale = longest > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / longest : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.drawImage(img, 0, 0, w, h);

    // Try WebP, then JPEG, dropping quality if still too large.
    let blob: Blob | null = null;
    let quality = IMAGE_QUALITY;
    for (let attempt = 0; attempt < 3; attempt++) {
      blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, 'image/webp', quality),
      );
      if (!blob) {
        // WebP not supported — fall back to JPEG once.
        blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, 'image/jpeg', quality),
        );
      }
      if (blob && blob.size <= IMAGE_MAX_OUTPUT_BYTES) break;
      quality -= 0.15;
      if (quality < 0.4) break;
    }
    if (!blob) throw new Error('Compression failed');

    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.${ext}`, { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function CaptureForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [loading, setLoading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<null | {
    capture_id: string;
    plottos: PlottoPreview[];
    warnings: Warning[];
  }>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function clearAttachment() {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleImagePick(file: File) {
    if (!ACCEPTED_IMAGE_MIMES.has(file.type)) {
      setError(`Unsupported image type: ${file.type || 'unknown'}`);
      return;
    }
    setError(null);
    setAttaching(true);
    try {
      const original = file.size;
      // HEIC can't be decoded by canvas; send as-is (server will OCR via OpenAI).
      const compressed =
        file.type === 'image/heic' || file.type === 'image/heif'
          ? file
          : await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      setAttachment({
        kind: 'image',
        file: compressed,
        previewUrl,
        originalBytes: original,
        finalBytes: compressed.size,
        filename: compressed.name,
      });
    } catch (e) {
      setError(`Could not process image: ${(e as Error).message}`);
    } finally {
      setAttaching(false);
    }
  }

  function handleDocPick(file: File) {
    if (!ACCEPTED_DOC_MIMES.has(file.type)) {
      setError(`Only PDF, DOCX, or TXT files are accepted (got ${file.type || 'unknown'})`);
      return;
    }
    if (file.size > MAX_DOC_BYTES) {
      setError(`File too large (${bytes(file.size)}). Hard cap is 1 MB.`);
      return;
    }
    setError(null);
    setAttachment({
      kind: 'doc',
      file,
      originalBytes: file.size,
      finalBytes: file.size,
      filename: file.name,
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim() && !attachment) return;
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      let res: Response;
      if (attachment) {
        const fd = new FormData();
        fd.set('rawContent', content);
        fd.set('timezone', tz);
        fd.set('source', attachment.kind === 'image' ? 'screenshot' : 'email');
        fd.set('file', attachment.file, attachment.filename);
        res = await fetch('/api/extract', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent: content, source: 'manual', timezone: tz }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
      } else {
        setPreview({
          capture_id: data.capture_id,
          plottos: data.plottos ?? [],
          warnings: data.warnings ?? [],
        });
        setContent('');
        clearAttachment();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const submitDisabled = loading || attaching || (!content.trim() && !attachment);

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="rounded-2xl border border-line bg-card focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste an email, describe what's coming up, or attach a screenshot/doc…"
            rows={6}
            className="w-full resize-none rounded-2xl bg-transparent p-4 text-[15px] text-fg placeholder:text-fg-subtle focus:outline-none"
            autoFocus
          />
          {attachment && (
            <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-line bg-surface-sunken p-2.5">
              {attachment.kind === 'image' && attachment.previewUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={attachment.previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-card text-fg-muted">
                  <FileIcon size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{attachment.filename}</p>
                <p className="text-[11px] text-fg-subtle">
                  {attachment.kind === 'image'
                    ? `Compressed: ${bytes(attachment.originalBytes)} → ${bytes(attachment.finalBytes)}`
                    : bytes(attachment.finalBytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearAttachment}
                aria-label="Remove attachment"
                className="icon-btn"
              >
                <XIcon size={16} />
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-1 border-t border-line px-2 py-2">
            <input
              ref={imageInputRef}
              type="file"
              accept={[...ACCEPTED_IMAGE_MIMES].join(',')}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImagePick(f);
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDocPick(f);
              }}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={!!attachment || attaching}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg disabled:opacity-50"
            >
              <ImageIcon size={14} /> {attaching ? 'Compressing…' : 'Photo'}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!attachment || attaching}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:bg-surface-sunken hover:text-fg disabled:opacity-50"
            >
              <FileIcon size={14} /> File
            </button>
            <span className="ml-auto pr-1 text-[11px] text-fg-subtle">
              {content.length} chars
            </span>
            <button
              type="submit"
              disabled={submitDisabled}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-accent-fg shadow-sm hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SparkleIcon size={14} />
              {loading ? 'Plotting…' : 'Plot it'}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-fg-subtle">
          Photos are compressed in your browser before upload. Files are capped
          at 1 MB. PDF, DOCX, TXT supported.
        </p>
      </form>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {preview && preview.plottos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-fg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Added {preview.plottos.length}{' '}
              {preview.plottos.length === 1 ? 'plotto' : 'plottos'}
            </div>
            <button
              onClick={() => router.push('/timeline')}
              className="inline-flex items-center gap-1 rounded-lg bg-fg px-3 py-1.5 text-xs font-medium text-surface hover:opacity-90"
            >
              See timeline →
            </button>
          </div>

          {preview.warnings.length > 0 && (
            <div className="rounded-xl border border-warn/30 bg-warn-soft p-3 text-sm text-warn-fg">
              <p className="font-medium">
                Heads up — {preview.warnings.length}{' '}
                {preview.warnings.length === 1 ? 'plotto falls' : 'plottos fall'} inside
                your work schedule:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {preview.warnings.map((w) => (
                  <li key={w.event_id}>{w.title}</li>
                ))}
              </ul>
            </div>
          )}

          {preview.plottos.map((p) => (
            <div key={p.event_id} className="card p-5">
              <h3 className="text-lg font-semibold text-fg">{p.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">
                {new Date(p.startsAt).toLocaleString()}
                {p.endsAt ? ` → ${new Date(p.endsAt).toLocaleString()}` : ''}
              </p>
              {p.location && (
                <p className="mt-0.5 text-sm text-fg-subtle">📍 {p.location}</p>
              )}
              {p.description && (
                <p className="mt-2 text-sm text-fg-muted">{p.description}</p>
              )}
              {p.people.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.people.map((person) => (
                    <span
                      key={person.name}
                      className="inline-flex items-center rounded-full border border-coral-200 bg-accent-soft px-2 py-0.5 text-xs font-medium text-coral-800 dark:border-coral-900 dark:bg-coral-950 dark:text-coral-300"
                    >
                      {person.name}
                    </span>
                  ))}
                </div>
              )}
              {(p.meetingLinks.length > 0 || p.phoneNumbers.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.meetingLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-fg px-2.5 py-1 text-xs font-medium text-surface hover:opacity-90"
                    >
                      <VideoIcon size={12} /> {link.label ?? `Join ${link.type}`}
                    </a>
                  ))}
                  {p.phoneNumbers.map((ph) => (
                    <a
                      key={ph.number}
                      href={`tel:${ph.number.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 rounded-md border border-line bg-card px-2.5 py-1 text-xs font-medium text-fg hover:border-line-strong"
                    >
                      <PhoneIcon size={12} /> {ph.label ?? ph.number}
                    </a>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-fg-subtle">
                Confidence: {Math.round(p.confidence * 100)}% · importance: {p.importance}
                {p.conflictsWithWorkSchedule && (
                  <span className="ml-2 rounded bg-warn-soft px-1.5 py-0.5 text-warn-fg">
                    in work hours
                  </span>
                )}
              </p>
              {p.clarifyingQuestion && (
                <p className="mt-2 rounded-lg bg-accent-soft p-3 text-sm text-accent">
                  ❓ {p.clarifyingQuestion}
                </p>
              )}
              <div className="mt-3">
                <button
                  onClick={() => router.push(`/event/${p.event_id}`)}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-medium text-fg hover:border-line-strong"
                >
                  Edit details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
