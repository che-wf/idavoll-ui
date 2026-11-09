// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { ChallengeChart } from "@/components/idavoll/challenge-chart";

// Example data: 37 days of follower counts, growing unevenly.
const data = Array.from({ length: 37 }, (_, i) => ({
  day: i + 1,
  value: Math.round(2000 + i * 105 + Math.sin(i / 3) * 180 + (i > 25 ? (i - 25) * 40 : 0)),
}));

export default function ChallengeChartDemo() {
  return (
    <ChallengeChart
      data={data}
      goal={10000}
      today={37}
      valueLabel="Followers"
      milestones={[
        { day: 30, label: "5K" },
        { day: 60, label: "7.5K" },
      ]}
    />
  );
}
