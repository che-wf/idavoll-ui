// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { CalendarDayDetails } from "@/components/idavoll/calendar-day-details";
import type { CalendarCategory, CalendarEvent, CalendarMarker } from "@/components/idavoll/content-calendar";

const today = new Date().toLocaleDateString("en-CA");

const categories: CalendarCategory[] = [{ id: "filming", name: "Filming", color: "#0d9488", icon: "camera" }];
const events: CalendarEvent[] = [
  { id: "1", date: today, title: "Desk build #4", platform: "tiktok", time: "18:00" },
  { id: "2", date: today, title: "Desk build #4", platform: "youtube", time: "18:30" },
  { id: "3", date: today, title: "Batch-film the lamp repair", time: "10:00", category: "filming" },
  { id: "4", date: today, title: "Call Mum", icon: "heart", color: "#db2777", description: "Ask about the workshop" },
];
const markers: CalendarMarker[] = [
  { date: today, name: "Full Moon in Taurus", time: "05:13", group: "Astrology", icon: "moon", tone: "violet" },
];

export default function CalendarDayDetailsDemo() {
  return (
    <CalendarDayDetails
      className="max-w-sm"
      date={today}
      events={events}
      markers={markers}
      categories={categories}
      dayLabel={() => "Challenge day 37"}
      onEventClick={() => undefined}
      onAddEvent={() => undefined}
    />
  );
}
