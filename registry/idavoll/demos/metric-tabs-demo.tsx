import { MetricTabs } from "@/components/idavoll/metric-tabs";

// Example data: 37 days of a 90-day challenge.
const days = Array.from({ length: 37 }, (_, i) => i + 1);
const followers = days.map((day) => ({ day, value: Math.round(2000 + day * 105 + Math.sin(day / 3) * 180) }));
const views = days.map((day) => ({ day, value: Math.round(day * 34000 + Math.cos(day / 2) * 22000 + day ** 2 * 120) }));
const watchHours = days.map((day) => ({ day, value: Math.round(day * 62 + Math.sin(day / 4) * 40) }));

export default function MetricTabsDemo() {
  return (
    <MetricTabs
      today={37}
      changeLabel="vs last week"
      metrics={[
        {
          id: "followers",
          label: "Followers",
          value: followers.at(-1)?.value ?? 0,
          change: 0.124,
          data: followers,
          goal: 15000,
          milestones: [{ day: 30, label: "5K" }],
        },
        { id: "views", label: "Views", value: views.at(-1)?.value ?? 0, change: 0.31, data: views, goal: 3_000_000 },
        {
          id: "watch",
          label: "Watch time (hours)",
          value: watchHours.at(-1)?.value ?? 0,
          change: -0.04,
          data: watchHours,
          goal: 6000,
        },
      ]}
    />
  );
}
