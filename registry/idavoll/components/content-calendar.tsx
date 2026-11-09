"use client";

import {
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarRange,
  Camera,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Dumbbell,
  Flag,
  Flame,
  Gift,
  Heart,
  Leaf,
  List,
  Mic,
  Moon,
  Music,
  Orbit,
  PartyPopper,
  PenLine,
  Plane,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  SunMoon,
  Video,
} from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { SegmentedControl } from "@/components/idavoll/segmented-control";
import { platformColor, SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  /** Unique id. */
  id: string;
  /** The day, as "YYYY-MM-DD". */
  date: string;
  /** Short title shown on the day. */
  title: string;
  /** Time of day as "HH:MM" (24-hour). Shown in week and agenda views, and used to order a day's events. */
  time?: string;
  /** One line of detail for week and agenda views, e.g. "Scheduled" or "12.4K views". */
  description?: string;
  /** Shows the platform's icon and color. */
  platform?: SocialPlatform;
  /** Color when there's no platform, e.g. "#7c3aed". Defaults to the category's color. */
  color?: string;
  /** Icon when there's no platform, from CALENDAR_ICONS. Defaults to the category's icon. */
  icon?: CalendarIconName;
  /** Id of one of `categories`, for the viewer's own events. */
  category?: string;
  /** Faded, for drafts or plans that aren't confirmed. */
  tentative?: boolean;
}

/** A viewer-defined kind of event, e.g. "Filming" or "Family", with its own color and icon. */
export interface CalendarCategory {
  /** Unique id. */
  id: string;
  /** Name shown in the filter menu and the entry form. */
  name: string;
  /** Color as a hex code, e.g. "#0d9488", so icons can pick readable contrast. */
  color: string;
  /** Icon from CALENDAR_ICONS. */
  icon?: CalendarIconName;
}

/** Icons people can pick for their own events and categories. Stored by name, so they save as plain text. */
export const CALENDAR_ICONS = {
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  camera: Camera,
  video: Video,
  mic: Mic,
  music: Music,
  pen: PenLine,
  book: BookOpen,
  coffee: Coffee,
  dumbbell: Dumbbell,
  leaf: Leaf,
  moon: Moon,
  sun: Sun,
  flame: Flame,
  plane: Plane,
  gift: Gift,
  briefcase: Briefcase,
  party: PartyPopper,
  flag: Flag,
};
export type CalendarIconName = keyof typeof CALENDAR_ICONS;

/** Black or white, whichever reads better on a hex color. Other color formats get white. */
export function readableOn(color: string) {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (!hex) return "#fff";
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((i) => {
    const c = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.18 ? "#000" : "#fff";
}

const MARKER_ICONS = {
  ...CALENDAR_ICONS,
  eclipse: SunMoon,
  planet: Orbit,
  retrograde: RotateCcw,
  sparkles: Sparkles,
};

const TONES = {
  amber: "text-amber-800 dark:text-amber-300",
  violet: "text-violet-700 dark:text-violet-300",
  sky: "text-sky-800 dark:text-sky-300",
  rose: "text-rose-700 dark:text-rose-300",
  emerald: "text-emerald-800 dark:text-emerald-300",
};

/**
 * Something that happens on a day but isn't a post: a holiday, a full Moon, a launch.
 * usHolidays() and astroEvents() return markers ready to pass in.
 */
export interface CalendarMarker {
  /** The day, as "YYYY-MM-DD". */
  date: string;
  /** Name shown on the day, e.g. "Thanksgiving" or "Full Moon in Taurus". */
  name: string;
  /** Time as "HH:MM" (24-hour), shown in week and agenda views. */
  time?: string;
  /** One line of detail for week and agenda views, e.g. "Beaver Moon". */
  description?: string;
  /** Section in the filter menu, e.g. "Holidays" or "Astrology". Defaults to "Other". */
  group?: string;
  /** Option in the filter menu, e.g. "Moon phases". Defaults to the group. */
  category?: string;
  /** A built-in icon name, or your own icon. Defaults to "sparkles". */
  icon?: keyof typeof MARKER_ICONS | ReactNode;
  /** Text color. Defaults to "amber". */
  tone?: keyof typeof TONES;
}

export type CalendarView = "month" | "week" | "agenda";

export interface ContentCalendarProps {
  /** Things to show on each day, e.g. posts. */
  events: CalendarEvent[];
  /**
   * Holidays, Moon phases and other non-post days to mark, e.g.
   * [...usHolidays(2026), ...astroEvents(2026)].
   */
  markers?: CalendarMarker[];
  /** Show a "Show" menu to hide platforms and marker types. Defaults to true. */
  filterable?: boolean;
  /**
   * Filter options that are switched off, when you control them. Platforms are
   * "platform:tiktok"; markers are "Group:Category", e.g. "Astrology:Retrogrades".
   */
  hidden?: string[];
  /** Starting hidden options when you don't control `hidden`. */
  defaultHidden?: string[];
  /** Called when the viewer changes the filters. Save it to remember their choice. */
  onHiddenChange?: (hidden: string[]) => void;
  /** Most markers named in a month-view day before "+1 more". Defaults to 2. */
  maxMarkers?: number;
  /** The viewer's own event categories, each with a color and icon. Each gets a filter option. */
  categories?: CalendarCategory[];
  /** Shows an "Add" button, called with the selected day (or today). Open your entry form here. */
  onAddEvent?: (date: string) => void;
  /** Makes events in week and agenda views clickable, e.g. to edit the viewer's own entries. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Which view to show, when you control it. */
  view?: CalendarView;
  /** Starting view when you don't control `view`. Defaults to "month". */
  defaultView?: CalendarView;
  /** Called when the viewer switches view. */
  onViewChange?: (view: CalendarView) => void;
  /** Views offered in the switcher. One view hides the switcher. Defaults to all three. */
  views?: CalendarView[];
  /** The day the view is showing (its month or week), when you control it. */
  date?: string;
  /** Starting day when you don't control `date`. Defaults to `selected`, then `today`. */
  defaultDate?: string;
  /** Called when the viewer moves to another day, week or month. */
  onDateChange?: (date: string) => void;
  /** The selected day, when you control it. */
  selected?: string;
  /** Starting selected day when you don't control `selected`. */
  defaultSelected?: string;
  /** Called when the viewer picks a day. Use it to show that day's details. */
  onSelect?: (date: string) => void;
  /** Today's date as "YYYY-MM-DD". Defaults to the viewer's today. */
  today?: string;
  /** 0 for Sunday, 1 for Monday. Defaults to 1. */
  weekStartsOn?: 0 | 1;
  /** Most events listed in a month-view day before "+2 more". Defaults to 3. */
  maxEvents?: number;
  /** Small text beside a day's date, e.g. the challenge day number. */
  dayLabel?: (date: string) => ReactNode;
  /** Extra classes for a day, e.g. to tint the days inside the challenge. */
  dayClassName?: (date: string) => string | undefined;
  /** Locale for month, weekday and time formats. Defaults to the browser's. */
  locale?: string;
  /** Heading level for the month or week title. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Describes a day's event count for screen readers. Defaults to "2 posts". */
  countLabel?: (count: number) => string;
  /** Shown in agenda view when the month has nothing. Defaults to "Nothing planned this month." */
  emptyMessage?: ReactNode;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key: string) => {
  const [y = 1970, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (key: string, days: number) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
};
/** Same day of the month in another month, clamped to that month's length. */
const addMonths = (key: string, months: number) => {
  const d = fromKey(key);
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), last));
  return toKey(target);
};
const sameMonth = (a: string, b: string) => a.slice(0, 7) === b.slice(0, 7);
const monthStart = (key: string) => `${key.slice(0, 7)}-01`;

/** The day a month-grid key press moves to, or undefined for other keys. */
function nextDay(pressed: string, key: string, weekday: number) {
  switch (pressed) {
    case "ArrowLeft":
      return addDays(key, -1);
    case "ArrowRight":
      return addDays(key, 1);
    case "ArrowUp":
      return addDays(key, -7);
    case "ArrowDown":
      return addDays(key, 7);
    case "Home":
      return addDays(key, -weekday);
    case "End":
      return addDays(key, 6 - weekday);
    case "PageUp":
      return addMonths(key, -1);
    case "PageDown":
      return addMonths(key, 1);
  }
}

const defaultCount = (n: number) => (n === 1 ? "1 post" : `${n} posts`);

const VIEW_OPTIONS = [
  { value: "month", label: "Month", icon: <CalendarDays /> },
  { value: "week", label: "Week", icon: <CalendarRange /> },
  { value: "agenda", label: "Agenda", icon: <List /> },
] as const;

function eventColor(e: CalendarEvent) {
  return e.color ?? (e.platform ? platformColor(e.platform) : "var(--primary)");
}

function EventIcon({ event, className }: { event: CalendarEvent; className?: string }) {
  if (event.platform) {
    return <SocialIcon platform={event.platform} variant="tile" className={cn("shrink-0", className)} />;
  }
  const Icon = event.icon ? CALENDAR_ICONS[event.icon] : undefined;
  if (!Icon) {
    return <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: eventColor(event) }} />;
  }
  const color = eventColor(event);
  return (
    <span
      aria-hidden
      className={cn("grid shrink-0 place-items-center rounded-[25%]", className)}
      style={{ background: color, color: readableOn(color) }}
    >
      <Icon className="size-[70%]" strokeWidth={2.5} />
    </span>
  );
}

/** A light wash of the event's own color, for the viewer's entries. */
const tint = (e: CalendarEvent) =>
  !e.platform && e.color ? { background: `color-mix(in oklab, ${e.color} 14%, transparent)` } : undefined;

const markerGroup = (m: CalendarMarker) => m.group ?? "Other";
const markerKey = (m: CalendarMarker) => `${markerGroup(m)}:${m.category ?? markerGroup(m)}`;

function MarkerIcon({ marker, className }: { marker: CalendarMarker; className?: string }) {
  const icon = marker.icon ?? "sparkles";
  if (typeof icon === "string" && icon in MARKER_ICONS) {
    const Icon = MARKER_ICONS[icon as keyof typeof MARKER_ICONS];
    return <Icon aria-hidden className={cn("size-3 shrink-0", className)} />;
  }
  return (
    <span aria-hidden className={cn("shrink-0", className)}>
      {icon}
    </span>
  );
}

function MarkerTag({
  marker,
  className,
  formatTime,
}: {
  marker: CalendarMarker;
  className?: string;
  /** Pass to show the time and description too. */
  formatTime?: (time: string) => string;
}) {
  return (
    <span className={cn("flex min-w-0 items-start gap-1", TONES[marker.tone ?? "amber"], className)}>
      <MarkerIcon marker={marker} className="mt-[0.2em]" />
      <span className="min-w-0">
        <span className="block truncate">{marker.name}</span>
        {formatTime && (marker.time || marker.description) && (
          <span className="block text-foreground/70 text-xs">
            {[marker.time && formatTime(marker.time), marker.description].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </span>
  );
}

/** A full event row for week and agenda views. */
function EventRow({
  event,
  formatTime,
  onClick,
}: {
  event: CalendarEvent;
  formatTime: (time: string) => string;
  onClick?: (event: CalendarEvent) => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button" as const, onClick: () => onClick(event) } : {})}
      style={tint(event)}
      className={cn(
        "flex w-full items-start gap-2 rounded-md border bg-card p-2 text-left text-xs",
        onClick && "transition-colors hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-ring",
        event.tentative && "border-dashed bg-transparent",
      )}
    >
      <EventIcon event={event} className="mt-px size-4" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-sm leading-snug">{event.title}</p>
        {(event.time || event.description || event.platform) && (
          <p className="flex flex-wrap gap-x-2 text-foreground/70">
            {event.time && <span className="tabular-nums">{formatTime(event.time)}</span>}
            <span>{event.description ?? (event.platform && SOCIAL_ICONS[event.platform].name)}</span>
          </p>
        )}
      </div>
    </Tag>
  );
}

/**
 * A calendar for planning and reviewing content, with month, week and agenda views.
 * Days list their posts with platform icons, plus markers such as holidays and Moon phases.
 * A "Show" menu hides platforms and marker types, and picking a day lets
 * you show its details. In month view, arrow keys move between days and Page Up and
 * Page Down change month; on narrow screens posts shrink to colored dots.
 */
export function ContentCalendar({
  events,
  markers = [],
  filterable = true,
  hidden: hiddenProp,
  defaultHidden = [],
  onHiddenChange,
  maxMarkers = 2,
  categories = [],
  onAddEvent,
  onEventClick,
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ["month", "week", "agenda"],
  date: dateProp,
  defaultDate,
  onDateChange,
  selected: selectedProp,
  defaultSelected,
  onSelect,
  today: todayProp,
  weekStartsOn = 1,
  maxEvents = 3,
  dayLabel,
  dayClassName,
  locale,
  headingLevel = 3,
  countLabel = defaultCount,
  emptyMessage = "Nothing planned this month.",
  className,
}: ContentCalendarProps) {
  const headingId = useId();
  const today = todayProp ?? toKey(new Date());
  const [viewState, setViewState] = useState<CalendarView>(defaultView);
  const view = viewProp ?? viewState;
  const [selectedState, setSelectedState] = useState(defaultSelected);
  const selected = selectedProp ?? selectedState;
  // The day the view is built around. In month view it is also the grid's one Tab stop.
  const [cursorState, setCursorState] = useState(defaultDate ?? selected ?? today);
  const cursor = dateProp ?? cursorState;
  const [hiddenState, setHiddenState] = useState(defaultHidden);
  const hidden = new Set(hiddenProp ?? hiddenState);
  const setHidden = (next: Set<string>) => {
    setHiddenState([...next]);
    onHiddenChange?.([...next]);
  };
  const toggleHidden = (key: string, show: boolean) => {
    const next = new Set(hidden);
    if (show) next.delete(key);
    else next.add(key);
    setHidden(next);
  };
  const moveFocus = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const goTo = (key: string) => {
    if (key === cursor) return;
    setCursorState(key);
    onDateChange?.(key);
  };
  const select = (key: string) => {
    setSelectedState(key);
    goTo(key);
    onSelect?.(key);
  };
  const setView = (next: CalendarView) => {
    setViewState(next);
    onViewChange?.(next);
  };

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    bodyRef.current?.querySelector<HTMLButtonElement>(`[data-date="${cursor}"]`)?.focus();
  }, [cursor]);

  const onGridKeyDown = (event: KeyboardEvent<HTMLButtonElement>, key: string) => {
    const weekday = (fromKey(key).getDay() - weekStartsOn + 7) % 7;
    const next = nextDay(event.key, key, weekday);
    if (!next) return;
    event.preventDefault();
    moveFocus.current = true;
    goTo(next);
  };

  // Filter options: one per platform in the events, then one per marker group and category.
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const resolved = events.map((e) => {
    const category = e.category ? categoryById.get(e.category) : undefined;
    return category ? { ...e, color: e.color ?? category.color, icon: e.icon ?? category.icon } : e;
  });
  const usedCategories = categories.filter((c) => events.some((e) => e.category === c.id));
  const platformOptions = [...new Set(events.map((e) => e.platform).filter((p): p is SocialPlatform => !!p))].sort(
    (a, b) => SOCIAL_ICONS[a].name.localeCompare(SOCIAL_ICONS[b].name),
  );
  const markerGroups = new Map<string, Map<string, CalendarMarker>>();
  for (const m of markers) {
    const group = markerGroups.get(markerGroup(m)) ?? new Map<string, CalendarMarker>();
    if (!group.has(markerKey(m))) group.set(markerKey(m), m);
    markerGroups.set(markerGroup(m), group);
  }
  const showFilters = filterable && platformOptions.length + usedCategories.length + markers.length > 0;

  // Visible events and markers by day, untimed first, then by time.
  const byTime = (a: { time?: string }, b: { time?: string }) => (a.time ?? "").localeCompare(b.time ?? "");
  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of resolved) {
    if (e.platform && hidden.has(`platform:${e.platform}`)) continue;
    if (e.category && hidden.has(`category:${e.category}`)) continue;
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  }
  for (const list of byDay.values()) list.sort(byTime);
  const markersByDay = new Map<string, CalendarMarker[]>();
  for (const m of markers) {
    if (hidden.has(markerKey(m))) continue;
    markersByDay.set(m.date, [...(markersByDay.get(m.date) ?? []), m]);
  }
  for (const list of markersByDay.values()) list.sort(byTime);

  const weekStart = addDays(cursor, -((fromKey(cursor).getDay() - weekStartsOn + 7) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const month = monthStart(cursor);
  const first = fromKey(month);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const gridStart = addDays(month, -offset);
  const weeks = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  );
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => addDays(month, i));

  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const fullDate = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" });
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  const formatTime = (time: string) => {
    const [h = 0, m = 0] = time.split(":").map(Number);
    return timeFormat.format(new Date(2000, 0, 1, h, m));
  };
  const title =
    view === "week"
      ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).formatRange(
          fromKey(weekDays[0] ?? cursor),
          fromKey(weekDays[6] ?? cursor),
        )
      : new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(first);
  const step = view === "week" ? (n: number) => addDays(cursor, n * 7) : (n: number) => addMonths(cursor, n);
  const unit = view === "week" ? "week" : "month";
  const Heading = `h${headingLevel}` as const;

  /** The date part of a day header: weekday, date number (circled for today) and the day label. */
  const dayHeader = (key: string, showWeekday: boolean, labelClassName?: string) => (
    <>
      <span className="sr-only">{fullDate.format(fromKey(key))}</span>
      <span aria-hidden className="flex items-center gap-1.5">
        {showWeekday && <span className="text-foreground/70 text-xs">{weekdayShort.format(fromKey(key))}</span>}
        <span
          className={cn(
            "grid size-6 place-items-center rounded-full text-xs tabular-nums",
            key === today && "bg-primary font-semibold text-primary-foreground",
          )}
        >
          {fromKey(key).getDate()}
        </span>
      </span>
      {dayLabel && (
        <span className={cn("truncate text-[0.65rem] text-foreground/70", labelClassName)}>
          <span className="sr-only">, </span>
          {dayLabel(key)}
        </span>
      )}
    </>
  );

  return (
    <div className={cn("@container space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Heading id={headingId} aria-live="polite" className="mr-auto font-heading font-semibold text-lg">
          {title}
        </Heading>
        {views.length > 1 && (
          <SegmentedControl
            label="Calendar view"
            size="sm"
            value={view}
            onValueChange={setView}
            options={VIEW_OPTIONS.filter((o) => views.includes(o.value))}
          />
        )}
        <div className="flex items-center gap-2">
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal aria-hidden />
                  Show
                  {hidden.size > 0 && (
                    <span className="rounded-sm bg-primary px-1.5 font-semibold text-primary-foreground text-xs tabular-nums">
                      <span className="sr-only">, </span>
                      {hidden.size}
                      <span className="sr-only"> hidden</span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-(--radix-dropdown-menu-content-available-height) min-w-56"
              >
                {platformOptions.length > 0 && (
                  <>
                    <DropdownMenuLabel>Platforms</DropdownMenuLabel>
                    {platformOptions.map((p) => (
                      <DropdownMenuCheckboxItem
                        key={p}
                        checked={!hidden.has(`platform:${p}`)}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(on) => toggleHidden(`platform:${p}`, on)}
                      >
                        <SocialIcon platform={p} variant="tile" label="" className="size-4" />
                        {SOCIAL_ICONS[p].name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
                {usedCategories.length > 0 && (
                  <>
                    {platformOptions.length > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>Your categories</DropdownMenuLabel>
                    {usedCategories.map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={!hidden.has(`category:${c.id}`)}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(on) => toggleHidden(`category:${c.id}`, on)}
                      >
                        <EventIcon
                          event={{ id: c.id, date: "", title: c.name, color: c.color, icon: c.icon ?? "sparkles" }}
                          className="size-4"
                        />
                        {c.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </>
                )}
                {[...markerGroups].map(([group, categories], i) => (
                  <div key={group} role="none">
                    {(i > 0 || platformOptions.length + usedCategories.length > 0) && <DropdownMenuSeparator />}
                    <DropdownMenuLabel>{group}</DropdownMenuLabel>
                    {[...categories]
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([key, sample]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={!hidden.has(key)}
                          onSelect={(event) => event.preventDefault()}
                          onCheckedChange={(on) => toggleHidden(key, on)}
                        >
                          <MarkerIcon marker={sample} className={cn("size-4", TONES[sample.tone ?? "amber"])} />
                          {sample.category ?? group}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </div>
                ))}
                {hidden.size > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setHidden(new Set())} className="justify-center">
                      Show everything
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onAddEvent && (
            <Button size="sm" onClick={() => onAddEvent(selected ?? today)}>
              <Plus aria-hidden />
              Add
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => select(today)}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={`Previous ${unit}`}
            onClick={() => goTo(step(-1))}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={`Next ${unit}`}
            onClick={() => goTo(step(1))}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <div ref={bodyRef}>
        {view === "month" && (
          <table aria-labelledby={headingId} className="w-full table-fixed border-collapse text-sm">
            <thead>
              <tr>
                {(weeks[0] ?? []).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    abbr={weekdayLong.format(fromKey(key))}
                    className="pb-2 font-medium text-foreground/70 text-xs"
                  >
                    {weekdayShort.format(fromKey(key))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0]}>
                  {week.map((key) => {
                    const dayEvents = byDay.get(key) ?? [];
                    const dayMarkers = markersByDay.get(key) ?? [];
                    const isSelected = key === selected;
                    const extra = dayEvents.length - maxEvents;
                    return (
                      <td key={key} className="border p-0 align-top">
                        <button
                          type="button"
                          data-date={key}
                          tabIndex={key === cursor ? 0 : -1}
                          aria-current={key === today ? "date" : undefined}
                          aria-pressed={isSelected}
                          onClick={() => select(key)}
                          onKeyDown={(event) => onGridKeyDown(event, key)}
                          className={cn(
                            "flex size-full min-h-14 flex-col gap-1 p-1 text-left transition-colors hover:bg-muted/60 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2 @xl:min-h-24 @xl:p-1.5",
                            !sameMonth(key, month) && "bg-muted/30 text-foreground/70",
                            isSelected && "bg-primary/10 hover:bg-primary/15",
                            dayClassName?.(key),
                          )}
                        >
                          {/* The button's name is built from its text: date, day label, holidays, count, posts. */}
                          <span className="flex w-full items-center justify-between gap-1">
                            {dayHeader(key, false, "hidden @xl:inline")}
                          </span>
                          {dayMarkers.length > 0 && (
                            <>
                              {/* Narrow: icons only, with names for screen readers. */}
                              <span className="flex flex-wrap gap-0.5 px-0.5 @xl:hidden">
                                {dayMarkers.map((m) => (
                                  <span key={`${m.name}${m.time}`} className={TONES[m.tone ?? "amber"]}>
                                    <span className="sr-only">, {m.name}</span>
                                    <MarkerIcon marker={m} />
                                  </span>
                                ))}
                              </span>
                              {/* Wide: names, up to maxMarkers. */}
                              <span className="hidden w-full flex-col text-[0.65rem] leading-tight @xl:flex">
                                {dayMarkers
                                  .slice(0, dayMarkers.length > maxMarkers ? maxMarkers - 1 : maxMarkers)
                                  .map((m) => (
                                    <span key={`${m.name}${m.time}`}>
                                      <span className="sr-only">, </span>
                                      <MarkerTag marker={m} />
                                    </span>
                                  ))}
                                {dayMarkers.length > maxMarkers && (
                                  <span className="text-foreground/70">
                                    <span className="sr-only">, </span>+{dayMarkers.length - maxMarkers + 1} more
                                    <span className="sr-only">
                                      :{" "}
                                      {dayMarkers
                                        .slice(maxMarkers - 1)
                                        .map((m) => m.name)
                                        .join(", ")}
                                    </span>
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                          <span className="sr-only">, {countLabel(dayEvents.length)}</span>

                          {dayEvents.length > 0 && (
                            <>
                              {/* Narrow: one dot per event. */}
                              <span aria-hidden className="flex flex-wrap gap-0.5 px-1 @xl:hidden">
                                {dayEvents.slice(0, 4).map((e) => (
                                  <span
                                    key={e.id}
                                    className={cn("size-1.5 rounded-full", e.tentative && "opacity-40")}
                                    style={{ background: eventColor(e) }}
                                  />
                                ))}
                              </span>
                              {/* Wide: a chip per event. */}
                              <span className="hidden w-full flex-col gap-0.5 @xl:flex">
                                {dayEvents.slice(0, extra > 0 ? maxEvents - 1 : maxEvents).map((e) => (
                                  <span
                                    key={e.id}
                                    style={tint(e)}
                                    className={cn(
                                      "flex items-center gap-1 rounded-sm bg-muted px-1 py-0.5 text-xs",
                                      e.tentative && "border border-dashed bg-transparent text-foreground/70",
                                    )}
                                  >
                                    <span className="sr-only">, </span>
                                    <EventIcon event={e} className="size-3.5" />
                                    <span className="truncate">
                                      {e.platform && <span className="sr-only">: </span>}
                                      {e.title}
                                    </span>
                                  </span>
                                ))}
                                {extra > 0 && (
                                  <span className="px-1 text-foreground/70 text-xs">
                                    <span className="sr-only">, </span>+{extra + 1} more
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "week" && (
          <ol aria-labelledby={headingId} className="grid gap-2 @3xl:grid-cols-7 @3xl:gap-1.5">
            {weekDays.map((key) => {
              const dayEvents = byDay.get(key) ?? [];
              const dayMarkers = markersByDay.get(key) ?? [];
              const isSelected = key === selected;
              return (
                <li
                  key={key}
                  className={cn(
                    "grid min-w-0 content-start gap-1.5 rounded-lg border p-1.5 @md:grid-cols-[8rem_1fr] @3xl:min-h-64 @3xl:grid-cols-1",
                    isSelected && "border-primary/40 bg-primary/5",
                    dayClassName?.(key),
                  )}
                >
                  <button
                    type="button"
                    data-date={key}
                    aria-current={key === today ? "date" : undefined}
                    aria-pressed={isSelected}
                    onClick={() => select(key)}
                    className="flex w-full flex-wrap items-center justify-between gap-x-1 self-start rounded-md p-1 text-left hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {dayHeader(key, true)}
                  </button>
                  <div className="min-w-0 space-y-1">
                    {dayMarkers.map((m) => (
                      <MarkerTag
                        key={`${m.name}${m.time}`}
                        marker={m}
                        formatTime={formatTime}
                        className="px-1 text-xs"
                      />
                    ))}
                    {dayEvents.length ? (
                      <ul className="grid gap-1 @lg:grid-cols-2 @3xl:grid-cols-1">
                        {dayEvents.map((e) => (
                          <li key={e.id}>
                            <EventRow event={e} formatTime={formatTime} onClick={onEventClick} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-1 py-1 text-foreground/70 text-xs">{countLabel(0)}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {view === "agenda" &&
          (() => {
            const days = monthDays.filter((key) => byDay.has(key) || markersByDay.has(key));
            if (!days.length)
              return <p className="rounded-lg border p-6 text-center text-foreground/70">{emptyMessage}</p>;
            return (
              <ol aria-labelledby={headingId} className="divide-y rounded-lg border">
                {days.map((key) => {
                  const isSelected = key === selected;
                  return (
                    <li
                      key={key}
                      className={cn(
                        "grid gap-2 p-2 @md:grid-cols-[9rem_1fr] @md:gap-4",
                        isSelected && "bg-primary/5",
                        dayClassName?.(key),
                      )}
                    >
                      <button
                        type="button"
                        data-date={key}
                        aria-current={key === today ? "date" : undefined}
                        aria-pressed={isSelected}
                        onClick={() => select(key)}
                        className="flex items-center gap-2 self-start rounded-md p-1 text-left hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {dayHeader(key, true)}
                      </button>
                      <div className="min-w-0 space-y-1">
                        {(markersByDay.get(key) ?? []).map((m) => (
                          <MarkerTag
                            key={`${m.name}${m.time}`}
                            marker={m}
                            formatTime={formatTime}
                            className="py-1 text-sm"
                          />
                        ))}
                        {(byDay.get(key) ?? []).length > 0 && (
                          <ul className="grid gap-1 @lg:grid-cols-2">
                            {(byDay.get(key) ?? []).map((e) => (
                              <li key={e.id}>
                                <EventRow event={e} formatTime={formatTime} onClick={onEventClick} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            );
          })()}
      </div>
    </div>
  );
}
