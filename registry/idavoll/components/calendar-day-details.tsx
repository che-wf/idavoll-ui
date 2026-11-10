// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { ChevronRight, Pencil, Plus } from "lucide-react";
import type { ReactNode } from "react";
import {
  type CalendarCategory,
  type CalendarEvent,
  type CalendarMarker,
  EventIcon,
  isEventHidden,
  MARKER_TONES,
  MarkerIcon,
  markerKey,
  withCategory,
} from "@/components/idavoll/content-calendar";
import { SOCIAL_ICONS } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarDayDetailsProps {
  /** The day to show, as "YYYY-MM-DD". */
  date: string;
  /** All events; only this day's are listed. */
  events: CalendarEvent[];
  /** All markers (holidays, Moon phases…); only this day's are listed. */
  markers?: CalendarMarker[];
  /** The viewer's categories, for names, colors and icons. */
  categories?: CalendarCategory[];
  /** The same hidden keys as ContentCalendar's `hidden`, so both show the same things. */
  hidden?: string[];
  /** Small text under the date, e.g. "Challenge day 12". */
  dayLabel?: (date: string) => ReactNode;
  /** Makes each event a button: posts open, the viewer's own entries show a pencil to edit. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Shows an "Add to this day" button. */
  onAddEvent?: (date: string) => void;
  /** Shown when the day has nothing. A function gets the date. Defaults to "Nothing planned yet." */
  emptyMessage?: ReactNode | ((date: string) => ReactNode);
  /** Locale for the date and times. Defaults to the browser's. */
  locale?: string;
  /** Heading level for the date. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const byTime = (a: { time?: string }, b: { time?: string }) => (a.time ?? "").localeCompare(b.time ?? "");

/**
 * Everything on one day: the date, markers such as holidays and Moon phases, posts and
 * the viewer's own entries, with an "Add to this day" button. Put it beside a month
 * calendar on wide screens and below it on narrow ones, and pass the calendar's
 * selected day as `date`. When the day changes, the new date is announced politely.
 */
export function CalendarDayDetails({
  date,
  events,
  markers = [],
  categories = [],
  hidden: hiddenList = [],
  dayLabel,
  onEventClick,
  onAddEvent,
  emptyMessage = "Nothing planned yet.",
  locale,
  headingLevel = 3,
  className,
}: CalendarDayDetailsProps) {
  const Heading = `h${headingLevel}` as const;
  const hidden = new Set(hiddenList);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const dayEvents = events
    .filter((e) => e.date === date && !isEventHidden(e, hidden))
    .map((e) => withCategory(e, categoryById))
    .sort(byTime);
  const dayMarkers = markers.filter((m) => m.date === date && !hidden.has(markerKey(m))).sort(byTime);
  const parsed = new Date(`${date}T12:00`);
  const valid = !Number.isNaN(parsed.getTime());
  const longDate = valid
    ? new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(parsed)
    : date;
  const timeFormat = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" });
  const formatTime = (time: string) => {
    const t = new Date(`2000-01-01T${time}`);
    return Number.isNaN(t.getTime()) ? time : timeFormat.format(t);
  };
  const label = dayLabel?.(date);
  const empty = typeof emptyMessage === "function" ? emptyMessage(date) : emptyMessage;

  return (
    <div className={cn("min-w-0 space-y-3 rounded-xl border bg-card p-4 text-card-foreground", className)}>
      {/* Only the date is announced when the day changes, not the whole list. */}
      <div className="min-w-0" aria-live="polite" aria-atomic="true">
        <Heading className="font-semibold">{longDate}</Heading>
        {label ? <p className="text-foreground/70 text-sm">{label}</p> : null}
      </div>

      {dayMarkers.length > 0 && (
        <ul className="space-y-1">
          {dayMarkers.map((m) => (
            <li
              key={`${markerKey(m)}:${m.name}`}
              className={cn("flex min-w-0 items-start gap-1.5 text-sm", MARKER_TONES[m.tone ?? "amber"])}
            >
              <MarkerIcon marker={m} className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {m.name}
                {m.time && <span className="text-foreground/70"> · {formatTime(m.time)}</span>}
                {m.description && <span className="block text-foreground/70 text-xs">{m.description}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {dayEvents.length > 0 ? (
        <ul className="-mx-2 space-y-0.5">
          {dayEvents.map((e) => {
            const category = e.category ? categoryById.get(e.category) : undefined;
            const own = !e.platform;
            const detail = e.platform
              ? [SOCIAL_ICONS[e.platform].name, e.time && formatTime(e.time), e.tentative ? "Scheduled" : null]
                  .filter(Boolean)
                  .join(" · ")
              : [e.time && formatTime(e.time), category?.name].filter(Boolean).join(" · ") || "Your entry";
            const content = (
              <>
                <EventIcon event={e} className="size-6 rounded-md" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium [overflow-wrap:anywhere]">{e.title}</span>
                  <span className="block text-foreground/70 text-xs [overflow-wrap:anywhere]">{detail}</span>
                  {e.description && (
                    <span className="mt-0.5 line-clamp-2 block text-foreground/70 text-xs [overflow-wrap:anywhere]">
                      {e.description}
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <li key={e.id}>
                {onEventClick ? (
                  <button
                    type="button"
                    onClick={() => onEventClick(e)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {content}
                    {own ? (
                      <Pencil aria-hidden className="size-3.5 shrink-0 text-foreground/60" />
                    ) : (
                      <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground/60" />
                    )}
                    <span className="sr-only">{own ? "Edit" : "Open"}</span>
                  </button>
                ) : (
                  <div className="flex min-w-0 items-center gap-2 px-2 py-1.5 text-sm">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-foreground/70 text-sm">{empty}</p>
      )}

      {onAddEvent && (
        <Button variant="outline" size="sm" className="w-full cursor-pointer" onClick={() => onAddEvent(date)}>
          <Plus aria-hidden />
          Add to this day
        </Button>
      )}
    </div>
  );
}
