"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";

type CaptureStatus = "idle" | "listening" | "processing" | "done" | "error";

const WAVEFORM_BARS = 20;

export default function CapturePage() {
  const router = useRouter();
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(WAVEFORM_BARS).fill(8)
  );

  // Refs for audio processing
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    mediaRecorderRef.current?.stop();
    audioCtxRef.current?.close();
    cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setBarHeights(Array(WAVEFORM_BARS).fill(8));
  };

  const startWaveform = (stream: MediaStream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = WAVEFORM_BARS * 4;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      analyser.getByteFrequencyData(data);
      const heights = Array.from({ length: WAVEFORM_BARS }, (_, i) => {
        const v = (data[Math.floor((i / WAVEFORM_BARS) * data.length)] ?? 0) / 255;
        return Math.max(6, v * 56 + 6);
      });
      setBarHeights(heights);
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const startCapture = async () => {
    setTranscript("");
    setElapsed(0);
    setStatus("listening");
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startWaveform(stream);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
        setBarHeights(Array(WAVEFORM_BARS).fill(8));
        setStatus("processing");
        // Phase 2: send to /api/transcribe and /api/extract
        // For now, simulate a short delay and show a demo transcript
        await new Promise((r) => setTimeout(r, 1400));
        setTranscript(
          "Dentist appointment tomorrow at 9am at Smile Care Clinic. Then team standup at 11am on Google Meet. Also remind me to call Mom this afternoon."
        );
        setStatus("done");
      };

      recorder.start();

      timerRef.current = setInterval(() => {
        setElapsed((n) => n + 1);
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
      setStatus("error");
    }
  };

  const stopCapture = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    audioCtxRef.current?.close();
  };

  const handleCancel = () => {
    stopAll();
    router.back();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isActive = status === "listening";
  const isProcessing = status === "processing";
  const isDone = status === "done";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav />

      <main style={styles.main}>
        {/* ── Page header ── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Capture</h1>
            <p style={styles.pageSubtitle}>
              {isActive
                ? "Tap the mic to stop when you're done."
                : isDone
                ? "Here's what I heard. Review and add to your timeline."
                : "Tap the mic and tell me what's on your mind."}
            </p>
          </div>
          {/* "Toatre listens, you live." pill */}
          <div style={styles.pill}>
            <span>✨</span> Toatre listens, you live.
          </div>
        </div>

        {/* ── Waveform + mic ── */}
        <div style={styles.waveformSection}>
          {/* Status label */}
          <div style={styles.statusLabel}>
            {isActive && (
              <>
                <span style={styles.statusDot} />
                <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Listening…
                </span>
              </>
            )}
            {isProcessing && (
              <>
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 14 14"
                  fill="none"
                  className="animate-spin"
                  aria-hidden
                >
                  <circle
                    cx={7}
                    cy={7}
                    r={5}
                    stroke="rgba(99,102,241,0.3)"
                    strokeWidth={2}
                  />
                  <path
                    d="M7 2a5 5 0 0 1 5 5"
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
                  Thinking…
                </span>
              </>
            )}
            {isDone && (
              <span style={{ color: "#22C55E", fontWeight: 600 }}>
                ✓ Got it
              </span>
            )}
            {status === "idle" && (
              <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                Ready when you are
              </span>
            )}
            {status === "error" && (
              <span style={{ color: "var(--color-error)", fontWeight: 600 }}>
                Couldn't hear you. Try again.
              </span>
            )}
          </div>

          {/* Waveform row */}
          <div style={styles.waveformRow}>
            {/* Left bars */}
            <div style={styles.barGroup}>
              {barHeights.slice(0, WAVEFORM_BARS / 2).map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bar,
                    height: h,
                    background: `linear-gradient(to top, #6366F1, #8B5CF6)`,
                    opacity: isActive ? 1 : 0.25,
                    animationDelay: `${i * 60}ms`,
                    animation: isActive
                      ? `waveform ${0.6 + (i % 3) * 0.15}s ease-in-out infinite alternate`
                      : "none",
                  }}
                />
              ))}
            </div>

            {/* Mic button */}
            <button
              onClick={isActive ? stopCapture : startCapture}
              disabled={isProcessing}
              style={{
                ...styles.micBtn,
                ...(isActive ? styles.micBtnActive : {}),
              }}
              aria-label={isActive ? "Stop recording" : "Start recording"}
            >
              <div
                style={{
                  ...styles.micRing,
                  ...(isActive ? { animation: "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite" } : {}),
                }}
              />
              {isActive ? (
                /* Stop square */
                <div style={styles.stopSquare} />
              ) : (
                /* Mic icon */
                <MicIcon />
              )}
            </button>

            {/* Right bars */}
            <div style={styles.barGroup}>
              {barHeights.slice(WAVEFORM_BARS / 2).map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bar,
                    height: h,
                    background: `linear-gradient(to top, #F59E0B, #EC4899)`,
                    opacity: isActive ? 1 : 0.25,
                    animation: isActive
                      ? `waveform ${0.5 + (i % 4) * 0.12}s ease-in-out infinite alternate`
                      : "none",
                    animationDelay: `${i * 55}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          {(isActive || isDone) && (
            <p style={styles.timer}>{formatTime(elapsed)}</p>
          )}
        </div>

        {/* ── Transcript card ── */}
        {(isActive || isDone || isProcessing) && (
          <div style={styles.transcriptCard} className="animate-fade-up">
            <div style={styles.transcriptHeader}>
              {isDone ? (
                <span style={{ color: "#22C55E", fontSize: 13, fontWeight: 600 }}>
                  ● Transcribed
                </span>
              ) : (
                <span style={{ color: "var(--color-primary)", fontSize: 13, fontWeight: 600 }}>
                  ● Transcribing…
                </span>
              )}
            </div>
            {transcript ? (
              <p style={styles.transcriptText}>
                <HighlightedTranscript text={transcript} />
              </p>
            ) : (
              <p style={{ ...styles.transcriptText, color: "var(--color-text-muted)", fontStyle: "italic" }}>
                Listening…
              </p>
            )}
          </div>
        )}

        {/* ── Privacy badge ── */}
        {isActive && (
          <div style={styles.privacyBadge}>
            <svg width={13} height={13} viewBox="0 0 13 13" fill="none" aria-hidden>
              <rect x={1} y={5} width={11} height={8} rx={2} stroke="#6B7280" strokeWidth={1.2} />
              <path d="M4 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#6B7280" strokeWidth={1.2} strokeLinecap="round" />
            </svg>
            Server-side transcription
          </div>
        )}

        {/* ── Controls ── */}
        <div style={styles.controls}>
          <button
            onClick={handleCancel}
            style={styles.controlBtn}
            aria-label="Cancel"
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="#6B7280" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
            <span style={styles.controlLabel}>Cancel</span>
          </button>

          {/* Centre: primary action */}
          {isDone ? (
            <button
              onClick={() => router.push("/timeline")}
              style={styles.addToTimelineBtn}
            >
              <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 9l4 4 8-8" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Add to timeline
            </button>
          ) : (
            <button
              onClick={isActive ? stopCapture : startCapture}
              disabled={isProcessing}
              style={{
                ...styles.mainControlBtn,
                opacity: isProcessing ? 0.7 : 1,
              }}
              aria-label={isActive ? "Stop" : "Record"}
            >
              {isActive ? (
                <div style={styles.stopSquareSmall} />
              ) : isProcessing ? (
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  className="animate-spin"
                  aria-hidden
                >
                  <circle cx={10} cy={10} r={8} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  <path d="M10 2a8 8 0 0 1 8 8" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
                </svg>
              ) : (
                <MicIcon color="#fff" size={22} />
              )}
            </button>
          )}

          <button
            onClick={() => {
              stopAll();
              /* Phase 2: open text input modal */
            }}
            style={styles.controlBtn}
            aria-label="Type instead"
          >
            <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden>
              <rect x={2} y={4} width={16} height={12} rx={2} stroke="#6B7280" strokeWidth={1.5} />
              <line x1={5} y1={9} x2={9} y2={9} stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={5} y1={13} x2={14} y2={13} stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={11} y1={9} x2={15} y2={9} stroke="#6B7280" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
            <span style={styles.controlLabel}>Type instead</span>
          </button>
        </div>

        {/* ── Tip ── */}
        {!isDone && (
          <div style={styles.tip}>
            <span style={{ fontSize: 16 }}>💡</span>
            <span>
              Tip: You can say multiple things. I&apos;ll organise them for you.
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Highlighted transcript (bold time/place entities) ─────────────────── */

function HighlightedTranscript({ text }: { text: string }) {
  // Very simple highlight — bold the first part, muted the trailing part
  const pivot = text.indexOf(". Also");
  if (pivot < 0) return <>{text}</>;
  return (
    <>
      <strong>{text.slice(0, pivot + 1)}</strong>
      <span style={{ color: "var(--color-text-secondary)" }}>
        {text.slice(pivot + 1)}
      </span>
    </>
  );
}

/* ─── Mic SVG ─────────────────────────────────────────────────────────────── */

function MicIcon({ color, size = 28 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="mic-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color ?? "#8B5CF6"} />
          <stop offset="100%" stopColor={color ?? "#EC4899"} />
        </linearGradient>
      </defs>
      <rect x={10} y={2} width={8} height={14} rx={4} fill={color ? color : "url(#mic-grad)"} />
      <path
        d="M5 13a9 9 0 0 0 18 0"
        stroke={color ?? "#8B5CF6"}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line x1={14} y1={22} x2={14} y2={26} stroke={color ?? "#8B5CF6"} strokeWidth={2} strokeLinecap="round" />
      <line x1={10} y1={26} x2={18} y2={26} stroke={color ?? "#8B5CF6"} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "28px 20px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 32,
    flexWrap: "wrap",
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: "var(--color-text)",
    marginBottom: 6,
    lineHeight: 1.15,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "var(--color-text-secondary)",
    lineHeight: 1.5,
    maxWidth: 280,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    background: "var(--color-card)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-primary)",
    flexShrink: 0,
    boxShadow: "0 1px 6px rgba(99,102,241,0.10)",
    alignSelf: "flex-start",
  },
  waveformSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    marginBottom: 28,
  },
  statusLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    minHeight: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--color-primary)",
    animation: "pulse-ring 1.2s ease-in-out infinite",
  },
  waveformRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    justifyContent: "center",
  },
  barGroup: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    height: 64,
  },
  bar: {
    width: 4,
    borderRadius: 3,
    transition: "height 0.08s ease",
    transformOrigin: "center",
  },
  micBtn: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: "50%",
    background: "#fff",
    border: "3px solid transparent",
    backgroundClip: "padding-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "0 4px 24px rgba(99,102,241,0.18), 0 0 0 3px rgba(99,102,241,0.25)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  micBtnActive: {
    boxShadow: "0 4px 24px rgba(99,102,241,0.25), 0 0 0 6px rgba(99,102,241,0.15)",
    transform: "scale(1.04)",
  },
  micRing: {
    position: "absolute",
    inset: -6,
    borderRadius: "50%",
    border: "3px solid transparent",
    background:
      "linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6366F1, #F59E0B) border-box",
    pointerEvents: "none",
  },
  stopSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "linear-gradient(135deg, #EC4899, #8B5CF6)",
  },
  timer: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-primary)",
    letterSpacing: "0.05em",
    fontVariantNumeric: "tabular-nums",
  },
  transcriptCard: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 20,
    padding: "18px 20px",
    marginBottom: 16,
    boxShadow: "0 2px 12px rgba(99,102,241,0.06)",
  },
  transcriptHeader: {
    marginBottom: 10,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 1.65,
    color: "var(--color-text)",
    fontWeight: 500,
  },
  privacyBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--color-text-muted)",
    marginBottom: 28,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  controlBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: 12,
  },
  controlLabel: {
    fontSize: 12,
    color: "var(--color-text-muted)",
    fontWeight: 500,
  },
  mainControlBtn: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366F1, #EC4899)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(99,102,241,0.30)",
    transition: "transform 0.15s, opacity 0.15s",
    flexShrink: 0,
  },
  stopSquareSmall: {
    width: 22,
    height: 22,
    borderRadius: 5,
    background: "#fff",
  },
  addToTimelineBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 24px",
    background: "linear-gradient(135deg, #22C55E, #16A34A)",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(34,197,94,0.30)",
  },
  tip: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    background: "var(--color-bg-elevated)",
    borderRadius: 14,
    fontSize: 13,
    color: "var(--color-text-secondary)",
    lineHeight: 1.5,
  },
};
