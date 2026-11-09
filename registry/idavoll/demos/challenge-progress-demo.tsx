// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { ChallengeProgress } from "@/components/idavoll/challenge-progress";

export default function ChallengeProgressDemo() {
  return (
    <ChallengeProgress
      title="90-day video challenge"
      day={37}
      goal={{ label: "Followers", start: 2000, current: 6100, target: 10000 }}
      className="max-w-md"
    />
  );
}
