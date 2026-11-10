// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { ProgressChart, type ProgressPost, type ProgressSeries } from "@/components/idavoll/progress-chart";
import { SOCIAL_ICONS } from "@/components/idavoll/social-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Day 37 of a 90-day challenge, four platforms, with a few days of missing data.
let seed = 5;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const grow = (startAt: number, perDay: number, missing: number[]) =>
  Array.from({ length: 37 }, (_, i) => i + 1)
    .filter((day) => !missing.includes(day))
    .map((day) => ({ day, value: Math.round(startAt + perDay * day * (0.8 + random() * 0.4) + day ** 1.6) }));

const platforms: ProgressSeries[] = [
  { platform: "tiktok", data: grow(900, 95, [12, 13]) },
  { platform: "instagram", data: grow(700, 55, [20]) },
  { platform: "youtube", data: grow(300, 30, []) },
  { platform: "threads", data: grow(100, 12, [5, 6, 7]) },
];
const titles = ["Desk build", "Lamp repair", "Workshop tour", "Tool review", "Q&A"];
const posts: ProgressPost[] = Array.from({ length: 14 }, (_, i) => {
  const platform = platforms[i % platforms.length]?.platform ?? "tiktok";
  return { id: `p${i}`, platform, day: 2 + i * 2.5, label: `${titles[i % titles.length]} #${i + 1}` };
});

// Day 2 of a brand-new challenge: hourly points, a high goal and few followers.
const early: ProgressSeries[] = [
  {
    platform: "tiktok",
    data: Array.from({ length: 30 }, (_, i) => ({
      day: 1 + i / 24,
      value: 20 + Math.round(i * 1.2 + (i > 14 ? (i - 14) ** 1.5 : 0)),
    })),
  },
];
const earlyPosts: ProgressPost[] = [{ id: "e1", platform: "tiktok", day: 1 + 14 / 24, label: "My first build video" }];

export default function ProgressChartDemo() {
  const [opened, setOpened] = useState<ProgressPost>();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Followers, day 37 of 90</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart
            platforms={platforms}
            goal={25000}
            totalDays={90}
            today={37}
            milestones={[5000, 10000, 20000]}
            posts={posts}
            onSelectPost={setOpened}
            storageKey="demo-followers"
          />
          <p className="mt-2 text-foreground/70 text-sm" aria-live="polite">
            {opened ? `Opened ${SOCIAL_ICONS[opened.platform].name}: ${opened.label}` : "Click a post dot to open it."}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Day 2: the climb after the first post, by the hour</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressChart platforms={early} goal={100000} today={2.2} posts={earlyPosts} chartClassName="h-64" />
        </CardContent>
      </Card>
    </div>
  );
}
