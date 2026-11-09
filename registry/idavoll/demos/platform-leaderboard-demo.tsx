// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { PlatformLeaderboard } from "@/components/idavoll/platform-leaderboard";

// Example data: 37 days of followers on four platforms that grow at different speeds.
const grow = (start: number, perDay: number, wobble: number) =>
  Array.from({ length: 37 }, (_, i) => ({
    day: i + 1,
    value: Math.round(start + perDay * i * (1 + i / 60) + Math.sin(i / 2.5) * wobble),
  }));

export default function PlatformLeaderboardDemo() {
  return (
    <PlatformLeaderboard
      platforms={[
        { platform: "tiktok", data: grow(2400, 85, 120), goal: 12000 },
        { platform: "instagram", data: grow(2900, 28, 40), goal: 6000 },
        { platform: "youtube", data: grow(450, 38, 25), goal: 4000 },
        { platform: "threads", data: grow(1300, 6, 15), goal: 3000 },
      ]}
    />
  );
}
