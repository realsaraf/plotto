"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  AppBrand,
  BottomTabBar,
  BulbGlyph,
  CalendarIcon,
  CartGlyph,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIconButton,
  ClockIcon,
  DirectionsIcon,
  EnvelopeGlyph,
  FilterIcon,
  FloatingMicButton,
  InboxIcon,
  LocationIcon,
  MessageGlyph,
  PeopleIcon,
  PhoneGlyph,
  SearchIcon,
  SettingsIcon,
  SparkleIcon,
  TicketGlyph,
  TimelineIcon,
  ToothGlyph,
  UserAvatar,
  VideoGlyph,
} from "@/components/mobile-ui";

type ToatKind = "task" | "event" | "meeting" | "errand" | "deadline" | "idea";
type ToatTier = "urgent" | "important" | "regular";

interface TimelineToat {
  id: string;
  kind: ToatKind;
  tier: ToatTier;
  title: string;
  datetime: string | null;
  endDatetime: string | null;
  location: string | null;
  link: string | null;
  people: string[];
  notes: string | null;
  status: string;
  captureId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DayGroup {
  key: string;
  title: string;
  subtitle: string;
  toats: TimelineToat[];
}

interface TimeSection {
  label: string;
  toats: TimelineToat[];
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatRailTime(date: Date) {
  const text = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  const [time, period] = text.split(" ");
  return { time, period: period ?? "" };
}

function formatSecondaryDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function relativeDayLabel(date: Date, now: Date) {
  const today = startOfDay(now).getTime();
  const target = startOfDay(date).getTime();
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function buildDayGroups(toats: TimelineToat[], now: Date): DayGroup[] {
  const buckets = new Map<string, TimelineToat[]>();

  for (const toat of toats) {
    const key = toat.datetime ? startOfDay(new Date(toat.datetime)).toISOString() : "undated";
    const existing = buckets.get(key) ?? [];
    existing.push(toat);
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([leftKey], [rightKey]) => {
      if (leftKey === "undated") return 1;
      if (rightKey === "undated") return -1;
      return new Date(leftKey).getTime() - new Date(rightKey).getTime();
    })
    .map(([key, groupToats]) => {
      if (key === "undated") {
        return { key, title: "Someday", subtitle: "Whenever you get to it", toats: sortToats(groupToats) };
      }

      const groupDate = new Date(key);
      return {
        key,
        title: relativeDayLabel(groupDate, now),
        subtitle: formatSecondaryDate(groupDate),
        toats: sortToats(groupToats),
      };
    });
}

function sortToats(toats: TimelineToat[]) {
  return [...toats].sort((left, right) => {
    if (!left.datetime && !right.datetime) return left.createdAt.localeCompare(right.createdAt);
    if (!left.datetime) return 1;
    if (!right.datetime) return -1;
    return new Date(left.datetime).getTime() - new Date(right.datetime).getTime();
  });
}

function buildSections(toats: TimelineToat[]): TimeSection[] {
  const sections = new Map<string, TimelineToat[]>();

  for (const toat of toats) {
    if (!toat.datetime) {
      const undated = sections.get("Any time") ?? [];
      undated.push(toat);
      sections.set("Any time", undated);
      continue;
    }

    const hour = new Date(toat.datetime).getHours();
    const label = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    const existing = sections.get(label) ?? [];
    existing.push(toat);
    sections.set(label, existing);
  }

  return Array.from(sections.entries()).map(([label, sectionToats]) => ({ label, toats: sectionToats }));
}

function formatMinutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function extractPhone(toat: TimelineToat) {
  const match = `${toat.title} ${toat.notes ?? ""}`.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return match ? match[1] : null;
}

function mapHref(location: string | null) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function normalizeKeywords(text: string) {
  return text.toLowerCase();
}

function getToatVisual(toat: TimelineToat) {
  const text = normalizeKeywords(`${toat.title} ${toat.notes ?? ""}`);

  if (/dentist|doctor|clinic|appointment|check-up/.test(text)) {
    return {
      label: "Appointment",
      cardGradient: "linear-gradient(135deg, #7C3AED, #5B3DF5)",
      iconTint: "#8B5CF6",
      softTint: "rgba(139,92,246,0.12)",
      actionText: "Directions",
      actionBackground: "rgba(123,92,246,0.12)",
      actionColor: "#6D28D9",
      Icon: ToothGlyph,
    };
  }

  if (toat.kind === "meeting" || /meet|standup|sync|zoom|google meet|call with/.test(text)) {
    return {
      label: "Meeting",
      cardGradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
      iconTint: "#3B82F6",
      softTint: "rgba(59,130,246,0.12)",
      actionText: "Join",
      actionBackground: "rgba(59,130,246,0.12)",
      actionColor: "#2563EB",
      Icon: VideoGlyph,
    };
  }

  if (/call /.test(text) || /phone/.test(text)) {
    return {
      label: "Call",
      cardGradient: "linear-gradient(135deg, #F43F5E, #EC4899)",
      iconTint: "#EC4899",
      softTint: "rgba(236,72,153,0.12)",
      actionText: "Call",
      actionBackground: "rgba(236,72,153,0.12)",
      actionColor: "#DB2777",
      Icon: PhoneGlyph,
    };
  }

  if (/email|send|deck|message/.test(text)) {
    return {
      label: "Task",
      cardGradient: "linear-gradient(135deg, #F97316, #FB923C)",
      iconTint: "#F97316",
      softTint: "rgba(249,115,22,0.12)",
      actionText: "Message",
      actionBackground: "rgba(249,115,22,0.12)",
      actionColor: "#EA580C",
      Icon: EnvelopeGlyph,
    };
  }

  if (/grocer|shopping|buy /.test(text)) {
    return {
      label: "Errand",
      cardGradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
      iconTint: "#8B5CF6",
      softTint: "rgba(139,92,246,0.12)",
      actionText: "Directions",
      actionBackground: "rgba(139,92,246,0.12)",
      actionColor: "#6D28D9",
      Icon: CartGlyph,
    };
  }

  if (toat.kind === "event") {
    return {
      label: "Event",
      cardGradient: "linear-gradient(135deg, #7C3AED, #5B3DF5)",
      iconTint: "#7C3AED",
      softTint: "rgba(124,58,237,0.12)",
      actionText: "Tickets",
      actionBackground: "rgba(124,58,237,0.12)",
      actionColor: "#6D28D9",
      Icon: TicketGlyph,
    };
  }

  if (toat.kind === "idea" || /read|idea|brainstorm|note/.test(text)) {
    return {
      label: "Idea",
      cardGradient: "linear-gradient(135deg, #F59E0B, #FBBF24)",
      iconTint: "#F59E0B",
      softTint: "rgba(245,158,11,0.12)",
      actionText: "Open",
      actionBackground: "rgba(245,158,11,0.12)",
      actionColor: "#D97706",
      Icon: BulbGlyph,
    };
  }

  return {
    label: toat.kind === "deadline" ? "Deadline" : "Task",
    cardGradient: "linear-gradient(135deg, #8B5CF6, #EC4899)",
    iconTint: "#8B5CF6",
    softTint: "rgba(139,92,246,0.12)",
    actionText: "Open",
    actionBackground: "rgba(139,92,246,0.12)",
    actionColor: "#6D28D9",
    Icon: MessageGlyph,
  };
}

function getCountdownLabel(toat: TimelineToat, now: Date) {
  if (!toat.datetime) return "Any time";

  const start = new Date(toat.datetime);
  const end = toat.endDatetime ? new Date(toat.endDatetime) : null;
  const diffMinutes = Math.round((start.getTime() - now.getTime()) / 60000);

  if (end && now >= start && now <= end) return "Happening now";
  if (diffMinutes > 0 && diffMinutes <= 15) return `Leave in ${formatMinutesLabel(diffMinutes)}`;
  if (diffMinutes > 15) return `Starting in ${formatMinutesLabel(diffMinutes)}`;
  if (diffMinutes <= 0 && (!end || now > end)) return "Past due";
  return formatTime(start);
}

function getPrimaryAction(toat: TimelineToat) {
  const visual = getToatVisual(toat);
  const phone = extractPhone(toat);
  const directions = mapHref(toat.location);

  if ((toat.kind === "meeting" || visual.actionText === "Join") && toat.link) {
    return { label: "Join", href: toat.link, external: true };
  }

  if (visual.actionText === "Call" && phone) {
    return { label: "Call", href: `tel:${phone.replace(/\s+/g, "")}`, external: true };
  }

  if (visual.actionText === "Message" && toat.link) {
    return { label: "Message", href: toat.link, external: true };
  }

  if (directions && (visual.actionText === "Directions" || toat.location)) {
    return { label: "Directions", href: directions, external: true };
  }

  if (toat.kind === "event" && toat.link) {
    return { label: "Tickets", href: toat.link, external: true };
  }

  return { label: visual.actionText, href: `/toats/${toat.id}`, external: false };
}

function getUpNext(toats: TimelineToat[], now: Date) {
  return [...toats]
    .filter((toat) => toat.datetime && toat.status === "active")
    .sort((left, right) => new Date(left.datetime!).getTime() - new Date(right.datetime!).getTime())
    .find((toat) => {
      const start = new Date(toat.datetime!);
      const end = toat.endDatetime ? new Date(toat.endDatetime) : null;
      if (end && now > end) return false;
      return start >= new Date(now.getTime() - 15 * 60000);
    });
}

function EmptyTimeline({ onCapture }: { onCapture: () => void }) {
  return (
    <section style={styles.emptyCard}>
      <div style={styles.emptySun} />
      <div style={styles.emptyGlow} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={styles.emptyBadgeWrap}>
          <span style={styles.emptyBadge}><SparkleIcon size={18} /></span>
        </div>
        <h2 style={styles.emptyTitle}>You&apos;re all clear.</h2>
        <p style={styles.emptyBody}>Tap the mic and say what needs to happen next. Toatre will turn it into toats and drop them into your timeline.</p>
        <button type="button" onClick={onCapture} style={styles.emptyCaptureButton}>Start capturing</button>
      </div>
      <div style={styles.landscape}>
        <div style={styles.sunDisc} />
        <div style={styles.hillOne} />
        <div style={styles.hillTwo} />
      </div>
    </section>
  );
}

export default function TimelinePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [toats, setToats] = useState<TimelineToat[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showOnlyTimed, setShowOnlyTimed] = useState(false);

  const now = new Date();
  const openCapture = () => router.push("/capture?autostart=1");

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/toats?range=all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to load timeline (${response.status})`);
        }

        const data = (await response.json()) as { toats?: TimelineToat[] };
        if (!cancelled) {
          setToats(sortToats(data.toats ?? []));
        }
      } catch (error) {
        console.error("[timeline]", error);
      } finally {
        if (!cancelled) {
          setHasLoadedData(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const groups = buildDayGroups(toats, now);
  const resolvedSelectedDayKey = selectedDayKey && groups.some((group) => group.key === selectedDayKey)
    ? selectedDayKey
    : (groups.find((group) => group.title === "Today") ?? groups[0])?.key ?? null;
  const activeGroup = groups.find((group) => group.key === resolvedSelectedDayKey) ?? groups[0] ?? null;
  const visibleToats = (activeGroup?.toats ?? []).filter((toat) => (showOnlyTimed ? Boolean(toat.datetime) : true));
  const sections = buildSections(visibleToats);
  const upNext = getUpNext(toats, new Date());
  const lastToat = visibleToats[visibleToats.length - 1] ?? null;
  const loading = authLoading || (Boolean(user) && !hasLoadedData);

  return (
    <div style={styles.page}>
      <div style={styles.backgroundHaloOne} />
      <div style={styles.backgroundHaloTwo} />
      <div style={styles.backgroundHaloThree} />

      <main style={styles.main}>
        <section style={styles.topRow}>
          <AppBrand />
          <UserAvatar user={user} />
        </section>

        <section style={styles.headingRow}>
          <div style={{ position: "relative", flex: 1 }}>
            <button type="button" onClick={() => setPickerOpen((value) => !value)} style={styles.dayButton}>
              <span style={styles.dayButtonLabel}>{activeGroup?.title ?? "Timeline"}</span>
              <ChevronDownIcon size={22} />
            </button>
            <p style={styles.dayButtonSubtitle}>{activeGroup?.subtitle ?? "Your next toats"}</p>

            {pickerOpen ? (
              <div style={styles.dayPicker}>
                {groups.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setSelectedDayKey(group.key);
                      setPickerOpen(false);
                    }}
                    style={{
                      ...styles.dayPickerItem,
                      background: group.key === activeGroup?.key ? "rgba(91,61,245,0.10)" : "transparent",
                    }}
                  >
                    <span>
                      <span style={styles.dayPickerTitle}>{group.title}</span>
                      <span style={styles.dayPickerSubtitle}>{group.subtitle}</span>
                    </span>
                    <span style={styles.dayPickerCount}>{group.toats.length}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div style={styles.headerActions}>
            <CircleIconButton label="Choose day" onClick={() => setPickerOpen((value) => !value)}>
              <CalendarIcon size={26} />
            </CircleIconButton>
            <CircleIconButton
              label="Filter timed toats"
              active={showOnlyTimed}
              onClick={() => setShowOnlyTimed((value) => !value)}
            >
              <FilterIcon size={26} />
            </CircleIconButton>
          </div>
        </section>

        {loading ? (
          <section style={styles.loadingCard}>
            <div style={styles.loadingSpinner} className="animate-spin" />
            <p style={styles.loadingText}>Loading your timeline…</p>
          </section>
        ) : null}

        {!loading && upNext ? <UpNextCard toat={upNext} /> : null}

        {!loading && visibleToats.length > 0 ? (
          <section>
            {sections.map((section) => (
              <div key={section.label} style={styles.sectionBlock}>
                <h2 style={styles.sectionTitle}>{section.label}</h2>
                <div style={styles.sectionRows}>
                  {section.toats.map((toat) => (
                    <TimelineRow key={toat.id} toat={toat} onOpen={() => router.push(`/toats/${toat.id}`)} />
                  ))}
                </div>
              </div>
            ))}

            <section style={styles.clearCard}>
              <div style={styles.clearTextWrap}>
                <span style={styles.clearSparkle}><SparkleIcon size={18} /></span>
                <div>
                  <p style={styles.clearHeadline}>
                    {lastToat?.datetime ? `You’re all clear after ${formatTime(new Date(lastToat.datetime))}` : "You’re all clear."}
                  </p>
                  <p style={styles.clearSub}>Enjoy your {lastToat?.datetime && new Date(lastToat.datetime).getHours() < 17 ? "evening" : "day"}.</p>
                </div>
              </div>
              <div style={styles.clearScene}>
                <div style={styles.clearSceneSun} />
                <div style={styles.clearSceneHillOne} />
                <div style={styles.clearSceneHillTwo} />
              </div>
            </section>
          </section>
        ) : null}

        {!loading && !toats.length ? <EmptyTimeline onCapture={openCapture} /> : null}

        <div style={{ height: 220 }} />
      </main>

      <FloatingMicButton onClick={openCapture} />

      <BottomTabBar
        items={[
          { label: "Timeline", icon: <TimelineIcon />, href: "/timeline", active: true },
          { label: "Search", icon: <SearchIcon /> },
          { label: "People", icon: <PeopleIcon /> },
          { label: "Inbox", icon: <InboxIcon /> },
          { label: "Settings", icon: <SettingsIcon /> },
        ]}
      />
    </div>
  );
}

function UpNextCard({ toat }: { toat: TimelineToat }) {
  const router = useRouter();
  const visual = getToatVisual(toat);
  const Icon = visual.Icon;
  const action = getPrimaryAction(toat);
  const time = toat.datetime ? formatTime(new Date(toat.datetime)) : "Any time";

  const openAction = () => {
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(action.href);
  };

  return (
    <section style={styles.upNextCard} className="animate-fade-up">
      <div style={styles.upNextMetaRow}>
        <span style={styles.upNextBadge}><SparkleIcon size={16} /> UP NEXT</span>
        <span style={styles.upNextTimePill}><ClockIcon size={18} /> {time}</span>
      </div>

      <div style={styles.upNextBody}>
        <div style={{ ...styles.iconPanel, background: visual.cardGradient }}>
          <Icon size={34} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={styles.upNextTitle}>{toat.title}</h3>
          {toat.location ? (
            <p style={styles.upNextLocation}><LocationIcon size={18} /> {toat.location}</p>
          ) : null}
          <p style={{ ...styles.upNextCountdown, color: visual.actionColor }}>{getCountdownLabel(toat, new Date())}</p>
        </div>

        <button type="button" onClick={openAction} style={{ ...styles.primaryPillButton, background: visual.cardGradient }}>
          <DirectionsIcon size={18} /> {action.label === "Open" ? "View details" : action.label}
        </button>
      </div>
    </section>
  );
}

function TimelineRow({ toat, onOpen }: { toat: TimelineToat; onOpen: () => void }) {
  const visual = getToatVisual(toat);
  const Icon = visual.Icon;
  const action = getPrimaryAction(toat);

  const runAction = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
      return;
    }

    onOpen();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const railTime = toat.datetime ? formatRailTime(new Date(toat.datetime)) : { time: "Any", period: "time" };

  return (
    <div style={styles.timelineRow}>
      <div style={styles.timeRailColumn}>
        <p style={styles.timeRailTime}>{railTime.time}</p>
        <p style={styles.timeRailPeriod}>{railTime.period}</p>
      </div>

      <div style={styles.railTrackWrap}>
        <div style={styles.railLine} />
        <span style={{ ...styles.railDot, background: visual.iconTint }} />
      </div>

      <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={onKeyDown} style={styles.toatCard}>
        <div style={{ ...styles.iconPanel, width: 92, height: 92, borderRadius: 28, background: visual.cardGradient, boxShadow: `0 26px 44px ${visual.softTint}` }}>
          <Icon size={36} />
        </div>

        <div style={styles.cardBody}>
          <div style={styles.cardHeader}>
            <div style={{ minWidth: 0 }}>
              <p style={styles.cardTitle}>{toat.title}</p>
              {toat.location ? (
                <p style={styles.cardMeta}><LocationIcon size={18} /> {toat.location}</p>
              ) : toat.people.length ? (
                <p style={styles.cardMeta}><PeopleIcon size={18} /> {toat.people.join(", ")}</p>
              ) : (
                <p style={styles.cardMeta}>{getCountdownLabel(toat, new Date())}</p>
              )}
            </div>
            <span style={{ color: "#9CA3AF", flexShrink: 0 }}><ChevronRightIcon /></span>
          </div>

          <div style={styles.cardFooter}>
            <span style={{ ...styles.kindPill, color: visual.actionColor, background: visual.softTint }}>{visual.label}</span>
            <button type="button" onClick={runAction} style={{ ...styles.cardActionButton, color: visual.actionColor, background: visual.actionBackground }}>
              <DirectionsIcon size={18} /> {action.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #FBFAFF 0%, #F7F5FF 52%, #FBFAFF 100%)",
    position: "relative",
    overflowX: "clip",
  },
  backgroundHaloOne: {
    position: "absolute",
    top: -120,
    left: -160,
    width: 420,
    height: 420,
    background: "radial-gradient(circle, rgba(249,168,212,0.20), rgba(249,168,212,0))",
    filter: "blur(20px)",
  },
  backgroundHaloTwo: {
    position: "absolute",
    top: 140,
    right: -140,
    width: 420,
    height: 420,
    background: "radial-gradient(circle, rgba(191,219,254,0.22), rgba(191,219,254,0))",
    filter: "blur(26px)",
  },
  backgroundHaloThree: {
    position: "absolute",
    bottom: 140,
    left: "25%",
    width: 340,
    height: 340,
    background: "radial-gradient(circle, rgba(253,224,71,0.12), rgba(253,224,71,0))",
    filter: "blur(24px)",
  },
  main: {
    width: "min(calc(100vw - 24px), 860px)",
    margin: "0 auto",
    padding: "24px 0 0",
    position: "relative",
    zIndex: 1,
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 34,
  },
  headingRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    marginBottom: 28,
    position: "relative",
  },
  dayButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "none",
    padding: 0,
    fontSize: 66,
    lineHeight: 0.96,
    fontWeight: 800,
    color: "#0F1B4C",
    cursor: "pointer",
    letterSpacing: "-0.05em",
  },
  dayButtonLabel: {
    transform: "translateY(2px)",
  },
  dayButtonSubtitle: {
    marginTop: 10,
    fontSize: 24,
    color: "#6B7280",
    fontWeight: 500,
  },
  dayPicker: {
    position: "absolute",
    top: 112,
    left: 0,
    width: 300,
    padding: 10,
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.92)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.86))",
    boxShadow: "0 28px 70px rgba(31,41,55,0.13)",
    backdropFilter: "blur(18px)",
    zIndex: 10,
  },
  dayPickerItem: {
    width: "100%",
    border: "none",
    borderRadius: 18,
    background: "transparent",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    textAlign: "left",
  },
  dayPickerTitle: {
    display: "block",
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  dayPickerSubtitle: {
    display: "block",
    fontSize: 13,
    color: "#6B7280",
  },
  dayPickerCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 999,
    background: "rgba(91,61,245,0.12)",
    color: "#5B3DF5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
  },
  headerActions: {
    display: "flex",
    gap: 14,
    flexShrink: 0,
    paddingTop: 8,
  },
  loadingCard: {
    minHeight: 220,
    borderRadius: 34,
    background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.76))",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 28px 80px rgba(31,41,55,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginBottom: 28,
  },
  loadingSpinner: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "3px solid rgba(91,61,245,0.12)",
    borderTopColor: "#5B3DF5",
  },
  loadingText: {
    fontSize: 17,
    color: "#6B7280",
    fontWeight: 500,
  },
  upNextCard: {
    borderRadius: 36,
    padding: "24px 28px 30px",
    marginBottom: 24,
    background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,247,255,0.84))",
    border: "1px solid rgba(248,212,255,0.72)",
    boxShadow: "0 32px 90px rgba(31,41,55,0.08)",
    backdropFilter: "blur(20px)",
  },
  upNextMetaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  upNextBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 999,
    background: "rgba(91,61,245,0.08)",
    color: "#5B3DF5",
    fontSize: 17,
    fontWeight: 700,
  },
  upNextTimePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.86)",
    color: "#374151",
    fontSize: 17,
    fontWeight: 600,
  },
  upNextBody: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  iconPanel: {
    width: 104,
    height: 104,
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  upNextTitle: {
    fontSize: 28,
    fontWeight: 800,
    lineHeight: 1.06,
    color: "#0F1B4C",
    marginBottom: 12,
  },
  upNextLocation: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 20,
    color: "#6B7280",
    marginBottom: 10,
  },
  upNextCountdown: {
    fontSize: 22,
    fontWeight: 600,
  },
  primaryPillButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 66,
    minWidth: 230,
    padding: "0 26px",
    border: "none",
    borderRadius: 22,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 22px 44px rgba(91,61,245,0.24)",
  },
  sectionBlock: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#6B7280",
    marginBottom: 12,
    paddingLeft: 116,
  },
  sectionRows: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  timelineRow: {
    display: "grid",
    gridTemplateColumns: "82px 20px minmax(0, 1fr)",
    gap: 16,
    alignItems: "stretch",
  },
  timeRailColumn: {
    paddingTop: 18,
    textAlign: "left",
  },
  timeRailTime: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
    marginBottom: 8,
  },
  timeRailPeriod: {
    fontSize: 16,
    fontWeight: 500,
    color: "#6B7280",
    lineHeight: 1,
  },
  railTrackWrap: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  railLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    background: "linear-gradient(180deg, rgba(209,213,219,0.2), rgba(209,213,219,0.9), rgba(209,213,219,0.2))",
    borderRadius: 999,
  },
  railDot: {
    position: "absolute",
    top: 40,
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,0.96)",
    boxShadow: "0 10px 20px rgba(91,61,245,0.18)",
  },
  toatCard: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    minHeight: 142,
    padding: "22px 26px",
    borderRadius: 34,
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.84))",
    border: "1px solid rgba(255,255,255,0.94)",
    boxShadow: "0 26px 80px rgba(31,41,55,0.08)",
    cursor: "pointer",
    outline: "none",
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0F172A",
    lineHeight: 1.1,
    marginBottom: 10,
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    color: "#6B7280",
    lineHeight: 1.3,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  kindPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 15,
    fontWeight: 700,
  },
  cardActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 56,
    minWidth: 176,
    padding: "0 18px",
    border: "none",
    borderRadius: 18,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  },
  clearCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "24px 30px",
    borderRadius: 32,
    background: "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,247,239,0.86))",
    border: "1px solid rgba(255,255,255,0.92)",
    boxShadow: "0 28px 80px rgba(31,41,55,0.08)",
    overflow: "hidden",
  },
  clearTextWrap: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 0,
  },
  clearSparkle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "rgba(91,61,245,0.08)",
    color: "#5B3DF5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  clearHeadline: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: 6,
  },
  clearSub: {
    fontSize: 17,
    color: "#6B7280",
  },
  clearScene: {
    position: "relative",
    width: 210,
    height: 80,
    flexShrink: 0,
  },
  clearSceneSun: {
    position: "absolute",
    right: 62,
    bottom: 12,
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "radial-gradient(circle, #FDBA74, #F59E0B)",
    boxShadow: "0 0 0 18px rgba(251,191,36,0.12)",
  },
  clearSceneHillOne: {
    position: "absolute",
    left: 28,
    right: 0,
    bottom: 0,
    height: 32,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 80,
    background: "linear-gradient(90deg, rgba(244,114,182,0.32), rgba(139,92,246,0.26))",
  },
  clearSceneHillTwo: {
    position: "absolute",
    left: 72,
    right: -18,
    bottom: 0,
    height: 22,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 90,
    background: "linear-gradient(90deg, rgba(139,92,246,0.2), rgba(56,189,248,0.16))",
  },
  emptyCard: {
    position: "relative",
    minHeight: 440,
    borderRadius: 40,
    padding: "38px 38px 30px",
    overflow: "hidden",
    background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,252,0.84))",
    border: "1px solid rgba(255,255,255,0.9)",
    boxShadow: "0 30px 90px rgba(31,41,55,0.08)",
  },
  emptyBadgeWrap: {
    marginBottom: 20,
  },
  emptyBadge: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "rgba(91,61,245,0.10)",
    color: "#5B3DF5",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 42,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#0F1B4C",
    marginBottom: 16,
  },
  emptyBody: {
    maxWidth: 540,
    fontSize: 19,
    lineHeight: 1.55,
    color: "#6B7280",
    marginBottom: 26,
  },
  emptyCaptureButton: {
    minHeight: 58,
    padding: "0 22px",
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #5B3DF5, #7C3AED)",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 22px 44px rgba(91,61,245,0.22)",
  },
  emptySun: {
    position: "absolute",
    top: -30,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(253,224,71,0.18), rgba(253,224,71,0))",
  },
  emptyGlow: {
    position: "absolute",
    left: -60,
    bottom: 40,
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(249,168,212,0.18), rgba(249,168,212,0))",
  },
  landscape: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  sunDisc: {
    position: "absolute",
    right: 92,
    bottom: 46,
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: "linear-gradient(180deg, #FDBA74, #FB923C)",
  },
  hillOne: {
    position: "absolute",
    left: -30,
    right: 100,
    bottom: -18,
    height: 88,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    background: "linear-gradient(90deg, rgba(244,114,182,0.26), rgba(139,92,246,0.28))",
  },
  hillTwo: {
    position: "absolute",
    left: 120,
    right: -10,
    bottom: -12,
    height: 72,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
    background: "linear-gradient(90deg, rgba(139,92,246,0.22), rgba(56,189,248,0.18))",
  },
};
