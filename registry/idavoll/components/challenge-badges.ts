// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
/**
 * Badges for a posting challenge, following the research on rewards:
 * - They reward effort people control (days posted), never follower counts.
 * - "Surprise" badges stay hidden until earned, because unexpected recognition doesn't
 *   undermine motivation the way expected prizes can.
 * - Once earned, a badge is never taken away. The earned day is worked out from history,
 *   so it can't change later; still, store awarded badges and never revoke them.
 * - There are few of them on purpose.
 */

export type BadgeIcon = "sprout" | "calendar" | "flag" | "repeat" | "comeback" | "trophy" | "sparkles";

export interface BadgeDefinition {
  /** Stable id, safe to store. */
  id: string;
  /** Short name, e.g. "First week". */
  name: string;
  /** What it recognises, written as feedback about the person's effort. */
  description: string;
  /** Icon name for the badge components. */
  icon: BadgeIcon;
  /** "effort" badges can be shown ahead as a next step; "surprise" badges stay hidden until earned. */
  kind: "effort" | "surprise";
}

export const CHALLENGE_BADGES: BadgeDefinition[] = [
  {
    id: "first-post",
    name: "First post",
    description: "You started. That's the hardest part.",
    icon: "sprout",
    kind: "effort",
  },
  {
    id: "first-week",
    name: "First week",
    description: "Posted on 7 different days.",
    icon: "calendar",
    kind: "effort",
  },
  {
    id: "steady",
    name: "Steady",
    description: "Posted at least 5 days a week, 4 weeks in a row.",
    icon: "repeat",
    kind: "effort",
  },
  {
    id: "halfway",
    name: "Halfway",
    description: "Reached the halfway point and kept posting.",
    icon: "flag",
    kind: "effort",
  },
  {
    id: "comeback",
    name: "Comeback",
    description: "Came back after a break. Coming back is what counts.",
    icon: "comeback",
    kind: "surprise",
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Your best-performing video of the challenge so far.",
    icon: "sparkles",
    kind: "surprise",
  },
  {
    id: "finisher",
    name: "Finisher",
    description: "Showed up for the whole challenge.",
    icon: "trophy",
    kind: "effort",
  },
];

export interface BadgeInput {
  /** Challenge day numbers (1, 2, 3…) with at least one post. Order and repeats don't matter. */
  postedDays: number[];
  /** Today's challenge day. */
  today: number;
  /** Challenge length. Defaults to 90. */
  totalDays?: number;
  /** Days posted needed for Finisher. Defaults to half the challenge. */
  finisherMinDays?: number;
  /** A break this many days long or longer, followed by a post, earns Comeback. Defaults to 3. */
  comebackGap?: number;
  /** The challenge day of a breakout video, if the app has spotted one. */
  breakoutDay?: number;
}

export interface BadgeStatus {
  badge: BadgeDefinition;
  earned: boolean;
  /** The challenge day it was earned. */
  earnedOnDay?: number;
  /** For effort badges not yet earned: how close. */
  progress?: { done: number; total: number };
}

/** Works out which badges are earned and how close the rest are. Pure, so the server can use it too. */
export function evaluateBadges(input: BadgeInput): BadgeStatus[] {
  const total = input.totalDays ?? 90;
  const today = Math.min(input.today, total);
  const days = [...new Set(input.postedDays)].filter((d) => d >= 1 && d <= today).sort((a, b) => a - b);
  const finisherMin = input.finisherMinDays ?? Math.ceil(total / 2);
  const gap = input.comebackGap ?? 3;
  const halfway = Math.ceil(total / 2);

  const nth = (n: number) => days[n - 1];

  // Steady: 4 consecutive challenge weeks (days 1–7, 8–14…) with 5+ posting days.
  let steadyDay: number | undefined;
  let run = 0;
  let bestRun = 0;
  for (let week = 0; week * 7 + 7 <= today; week++) {
    const count = days.filter((d) => d > week * 7 && d <= week * 7 + 7).length;
    run = count >= 5 ? run + 1 : 0;
    bestRun = Math.max(bestRun, run);
    if (run >= 4 && steadyDay === undefined) steadyDay = week * 7 + 7;
  }
  // The current, unfinished week counts toward progress if it's already at 5.
  const partialWeek = Math.floor(today / 7);
  const partialCount = days.filter((d) => d > partialWeek * 7).length;
  const steadyProgress = Math.min(4, Math.max(bestRun, today % 7 && partialCount >= 5 ? run + 1 : run));

  // Halfway: still posting in the week leading up to the halfway day.
  const halfwayDay = today >= halfway && days.some((d) => d > halfway - 7 && d <= halfway) ? halfway : undefined;

  // Comeback: a post after a break of `gap` or more days.
  const comebackDay = days.find((d, i) => i > 0 && d - (days[i - 1] as number) - 1 >= gap);

  const finisherDay = today >= total && days.length >= finisherMin ? total : undefined;

  const result: Record<string, { day?: number; progress?: { done: number; total: number } }> = {
    "first-post": { day: nth(1), progress: { done: Math.min(1, days.length), total: 1 } },
    "first-week": { day: nth(7), progress: { done: Math.min(7, days.length), total: 7 } },
    steady: { day: steadyDay, progress: { done: steadyProgress, total: 4 } },
    halfway: { day: halfwayDay, progress: { done: Math.min(today, halfway), total: halfway } },
    comeback: { day: comebackDay },
    breakout: { day: input.breakoutDay && input.breakoutDay <= today ? input.breakoutDay : undefined },
    finisher: { day: finisherDay, progress: { done: Math.min(today, total), total } },
  };

  return CHALLENGE_BADGES.map((badge) => {
    const r = result[badge.id] ?? {};
    const earned = r.day !== undefined;
    return {
      badge,
      earned,
      earnedOnDay: r.day,
      progress: earned || badge.kind === "surprise" ? undefined : r.progress,
    };
  });
}
