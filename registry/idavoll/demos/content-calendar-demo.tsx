// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useMemo, useState } from "react";
import { astroEvents } from "@/components/idavoll/astro-events";
import { CalendarCategoryManager } from "@/components/idavoll/calendar-category-manager";
import { CalendarDayDetails } from "@/components/idavoll/calendar-day-details";
import { CalendarEntryDialog } from "@/components/idavoll/calendar-entry-dialog";
import {
  type CalendarCategory,
  type CalendarEvent,
  type CalendarView,
  ContentCalendar,
} from "@/components/idavoll/content-calendar";
import type { SocialPlatform } from "@/components/idavoll/social-icon";
import { usHolidays } from "@/components/idavoll/us-holidays";
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

export default function ContentCalendarDemo() {
  const today = dayToDate(TODAY_DAY);
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<CalendarView>("month");
  const [shown, setShown] = useState(today);
  const [hidden, setHidden] = useState<string[]>([]);
  const markers = useMemo(() => markersAround(shown), [shown]);
  const [categories, setCategories] = useState(starterCategories);
  const [entries, setEntries] = useState(starterEntries);
  const [editing, setEditing] = useState<{ open: boolean; entry?: CalendarEvent; date?: string }>({ open: false });
  const [managing, setManaging] = useState(false);
  const allEvents = useMemo(() => [...events, ...entries], [entries]);
  const isEntry = (e: CalendarEvent) => entries.some((x) => x.id === e.id);
  const challengeLabel = (date: string) => {
    const n = challengeDay(date);
    return n >= 1 && n <= 90 ? `Day ${n}` : null;
  };
  const counts = Object.fromEntries(categories.map((c) => [c.id, entries.filter((e) => e.category === c.id).length]));

  return (
    // Month view: the selected day's details sit beside the grid on wide screens and
    // below it on narrow ones. Week and agenda views already list everything.
    <div className={cn("grid gap-4", view === "month" && "lg:grid-cols-[minmax(0,1fr)_18rem]")}>
      <ContentCalendar
        events={allEvents}
        markers={markers}
        categories={categories}
        categoriesLabel="Your calendars"
        uncategorizedLabel="No calendar"
        onManageCategories={() => setManaging(true)}
        manageCategoriesLabel="Manage calendars…"
        hidden={hidden}
        onHiddenChange={setHidden}
        onAddEvent={(date) => setEditing({ open: true, date })}
        onEventClick={(e) => isEntry(e) && setEditing({ open: true, entry: entries.find((x) => x.id === e.id) })}
        date={shown}
        onDateChange={setShown}
        view={view}
        onViewChange={setView}
        today={today}
        selected={selected}
        onSelect={setSelected}
        dayLabel={challengeLabel}
      />
      {view === "month" && (
        <CalendarDayDetails
          className="self-start"
          date={selected}
          events={allEvents}
          markers={markersAround(selected)}
          categories={categories}
          hidden={hidden}
          dayLabel={(date) => {
            const label = challengeLabel(date);
            return label ? `Challenge ${label.toLowerCase()}` : null;
          }}
          onEventClick={(e) => isEntry(e) && setEditing({ open: true, entry: entries.find((x) => x.id === e.id) })}
          onAddEvent={(date) => setEditing({ open: true, date })}
          emptyMessage={(date) => {
            const day = challengeDay(date);
            return day >= 1 && day <= TODAY_DAY ? "Rest day. Part of the plan." : "Nothing planned yet.";
          }}
        />
      )}
      <CalendarEntryDialog
        open={editing.open}
        onOpenChange={(open) => setEditing((s) => ({ ...s, open }))}
        entry={editing.entry}
        defaultDate={editing.date ?? selected}
        categories={categories}
        onCreateCategory={(c) => setCategories((list) => [...list, c])}
        onSave={(entry) => {
          setEntries((list) => [...list.filter((x) => x.id !== entry.id), entry]);
          setSelected(entry.date);
          setShown(entry.date);
        }}
        onDelete={(id) => setEntries((list) => list.filter((x) => x.id !== id))}
      />
      <CalendarCategoryManager
        open={managing}
        onOpenChange={setManaging}
        categories={categories}
        entryCounts={counts}
        labels={{ title: "Your calendars", noun: "calendar" }}
        onSave={(c) =>
          setCategories((list) =>
            list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c],
          )
        }
        onDelete={(id) => {
          setCategories((list) => list.filter((x) => x.id !== id));
          setEntries((list) => list.map((e) => (e.category === id ? { ...e, category: undefined } : e)));
        }}
      />
    </div>
  );
}
