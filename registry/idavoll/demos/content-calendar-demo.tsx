// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { Pencil } from "lucide-react";
import { useMemo, useState } from "react";
import { astroEvents } from "@/components/idavoll/astro-events";
import { CalendarEntryDialog } from "@/components/idavoll/calendar-entry-dialog";
import {
  CALENDAR_ICONS,
  type CalendarCategory,
  type CalendarEvent,
  type CalendarView,
  ContentCalendar,
  readableOn,
} from "@/components/idavoll/content-calendar";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { usHolidays } from "@/components/idavoll/us-holidays";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toKey(d);
};

// Today is day 37 of a 90-day challenge. Days 1–37 have posts (with a few rest days);
// the next week is planned.
const TODAY_DAY = 37;
const dayToDate = (day: number) => dayOffset(day - TODAY_DAY);
const challengeDay = (date: string) => {
  const ms = new Date(`${date}T12:00`).getTime() - new Date(`${dayToDate(1)}T12:00`).getTime();
  return Math.round(ms / 86_400_000) + 1;
};

const topics = ["Desk build", "Lamp repair", "Workshop tour", "Tool review", "Q&A", "Shelf in a day"];
const rotation: SocialPlatform[] = ["tiktok", "instagram", "youtube", "tiktok", "threads"];
const restDays = new Set([7, 14, 22, 29, 36]);
const times = ["07:30", "12:00", "18:00", "20:30"];

const events: CalendarEvent[] = Array.from({ length: TODAY_DAY + 7 }, (_, i) => i + 1).flatMap((day) => {
  if (restDays.has(day)) return [];
  const count = day % 3 === 0 ? 2 : day % 8 === 0 ? 4 : 1;
  return Array.from({ length: count }, (_, n) => ({
    id: `${day}-${n}`,
    date: dayToDate(day),
    title: `${topics[(day + n) % topics.length]} #${Math.ceil(day / 6)}`,
    platform: rotation[(day + n) % rotation.length],
    time: times[(day + n * 2) % times.length],
    description: day > TODAY_DAY ? "Scheduled" : `${(((day * 7919 + n * 104729) % 480) / 10 + 1).toFixed(1)}K views`,
    tentative: day > TODAY_DAY,
  }));
});

/** Holidays and astrology for the years a view of this day can show. Astrology is computed on demand. */
function markersAround(date: string) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const years = [month === 1 ? year - 1 : null, year, month === 12 ? year + 1 : null].filter((y) => y !== null);
  return years.flatMap((y) => [...usHolidays(y), ...astroEvents(y)]);
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const formatTime = (time: string) => timeFormat.format(new Date(`2000-01-01T${time}`));

// The creator's own categories and entries. In the app these would be saved to the database.
const starterCategories: CalendarCategory[] = [
  { id: "filming", name: "Filming", color: "#0d9488", icon: "camera" },
  { id: "rest", name: "Rest", color: "#7c3aed", icon: "leaf" },
  { id: "deals", name: "Brand deals", color: "#d97706", icon: "briefcase" },
];
const starterEntries: CalendarEvent[] = [
  { id: "custom-1", date: dayToDate(TODAY_DAY + 2), title: "Batch-film week 7", time: "10:00", category: "filming" },
  { id: "custom-2", date: dayToDate(TODAY_DAY + 6), title: "Spa day", category: "rest", icon: "heart" },
  {
    id: "custom-3",
    date: dayToDate(TODAY_DAY + 4),
    title: "Pitch to Lumen Tools",
    time: "14:30",
    category: "deals",
    description: "Send media kit first",
  },
  { id: "custom-4", date: dayToDate(TODAY_DAY - 3), title: "Coffee with Sam", icon: "coffee", color: "#db2777" },
];

const longDate = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });

export default function ContentCalendarDemo() {
  const today = dayToDate(TODAY_DAY);
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<CalendarView>("month");
  const [shown, setShown] = useState(today);
  const markers = useMemo(() => markersAround(shown), [shown]);
  const [categories, setCategories] = useState(starterCategories);
  const [entries, setEntries] = useState(starterEntries);
  const [editing, setEditing] = useState<{ open: boolean; entry?: CalendarEvent }>({ open: false });
  const allEvents = useMemo(() => [...events, ...entries], [entries]);
  const isEntry = (e: CalendarEvent) => entries.some((x) => x.id === e.id);
  const dayPosts = allEvents.filter((e) => e.date === selected);
  const dayMarkers = markersAround(selected).filter((m) => m.date === selected);
  const day = challengeDay(selected);

  return (
    // The day panel sits beside the month grid; week and agenda views get the full width.
    <div className={cn("grid gap-4", view === "month" && "lg:grid-cols-[1fr_16rem]")}>
      <ContentCalendar
        events={allEvents}
        markers={markers}
        categories={categories}
        onAddEvent={() => setEditing({ open: true })}
        onEventClick={(e) => isEntry(e) && setEditing({ open: true, entry: entries.find((x) => x.id === e.id) })}
        date={shown}
        onDateChange={setShown}
        view={view}
        onViewChange={setView}
        today={today}
        selected={selected}
        onSelect={setSelected}
        dayLabel={(date) => {
          const n = challengeDay(date);
          return n >= 1 && n <= 90 ? `Day ${n}` : null;
        }}
      />
      <Card className="self-start">
        <CardContent className="space-y-3">
          <div>
            <p className="font-semibold">{longDate.format(new Date(`${selected}T12:00`))}</p>
            {day >= 1 && day <= 90 && <p className="text-foreground/70 text-sm">Challenge day {day}</p>}
            {dayMarkers.map((m) => (
              <p
                key={m.name}
                className={cn(
                  "text-sm",
                  m.group === "Astrology"
                    ? "text-violet-700 dark:text-violet-300"
                    : "text-amber-800 dark:text-amber-300",
                )}
              >
                {m.name}
                {"time" in m && <span className="text-foreground/70"> · {formatTime(m.time)}</span>}
              </p>
            ))}
          </div>
          {dayPosts.length ? (
            <ul className="space-y-2">
              {dayPosts.map((e) => {
                const category = categories.find((c) => c.id === e.category);
                const color = e.color ?? category?.color ?? "#475569";
                const Icon = CALENDAR_ICONS[e.icon ?? category?.icon ?? "sparkles"];
                return (
                  <li key={e.id} className="flex items-center gap-2 text-sm">
                    {e.platform ? (
                      <SocialIcon platform={e.platform} variant="tile" label="" className="size-6" />
                    ) : (
                      <span
                        aria-hidden
                        className="grid size-6 shrink-0 place-items-center rounded-md"
                        style={{ background: color, color: readableOn(color) }}
                      >
                        <Icon className="size-3.5" strokeWidth={2.5} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{e.title}</span>
                      <span className="text-foreground/70 text-xs">
                        {e.platform
                          ? `${SOCIAL_ICONS[e.platform].name} · ${e.tentative ? "Scheduled" : "Posted"}`
                          : [e.time && formatTime(e.time), category?.name].filter(Boolean).join(" · ") || "Your entry"}
                      </span>
                    </span>
                    {isEntry(e) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`Edit ${e.title}`}
                        onClick={() => setEditing({ open: true, entry: e })}
                      >
                        <Pencil aria-hidden />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-foreground/70 text-sm">
              {day >= 1 && day <= TODAY_DAY ? "Rest day. Part of the plan." : "Nothing planned yet."}
            </p>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => setEditing({ open: true })}>
            Add to this day
          </Button>
        </CardContent>
      </Card>
      <CalendarEntryDialog
        open={editing.open}
        onOpenChange={(open) => setEditing((s) => ({ ...s, open }))}
        entry={editing.entry}
        defaultDate={selected}
        categories={categories}
        onCreateCategory={(c) => setCategories((list) => [...list, c])}
        onSave={(entry) => {
          setEntries((list) => [...list.filter((x) => x.id !== entry.id), entry]);
          setSelected(entry.date);
          setShown(entry.date);
        }}
        onDelete={(id) => setEntries((list) => list.filter((x) => x.id !== id))}
      />
    </div>
  );
}
