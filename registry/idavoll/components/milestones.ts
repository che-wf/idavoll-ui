// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
/**
 * Round-number milestones between a start value and a goal, using steps of 1, 2.5 or 5
 * times a power of ten (round numbers pull harder as goals). Picks the smallest step that
 * gives at most `max` milestones, strictly between start and goal.
 *
 * @example suggestMilestones(2000, 12000) // [2500, 5000, 7500, 10000]
 */
export function suggestMilestones(start: number, goal: number, max = 6): number[] {
  const low = Math.min(start, goal);
  const high = Math.max(start, goal);
  if (!Number.isFinite(low) || !Number.isFinite(high) || high - low <= 0 || max < 1) return [];
  const between = (step: number) => {
    const values: number[] = [];
    for (let v = (Math.floor(low / step) + 1) * step; v < high; v += step) values.push(Math.round(v * 1e6) / 1e6);
    return values;
  };
  for (let power = Math.floor(Math.log10(high - low)) - 2; power <= Math.ceil(Math.log10(high)) + 1; power++) {
    for (const factor of [1, 2.5, 5]) {
      const step = factor * 10 ** power;
      const values = between(step);
      if (values.length <= max) return start <= goal ? values : values.reverse();
    }
  }
  return [];
}

export interface MilestoneProgress {
  /** The milestone (or start value) already passed. */
  previous: number;
  /** The next target: the next milestone, or the goal once every milestone is passed. */
  next: number;
  /** True when `next` is the main goal. */
  isGoal: boolean;
  /** True when the goal is reached. */
  reached: boolean;
  /** Progress made since `previous`. */
  done: number;
  /** Distance from `previous` to `next`. */
  span: number;
  /** Still to go to `next`. */
  remaining: number;
  /** done / span, from 0 to 1. */
  fraction: number;
  /** "first" before halfway (talk about progress made), "second" after (talk about what's left). */
  half: "first" | "second";
}

/** Where `current` sits between the milestones on the way to `goal`. Assumes the number should go up. */
export function milestoneProgress(current: number, milestones: number[], goal: number, start = 0): MilestoneProgress {
  const targets = [...new Set(milestones)].filter((m) => m > start && m < goal).sort((a, b) => a - b);
  const reached = current >= goal;
  const nextMilestone = targets.find((m) => m > current);
  const next = reached ? goal : (nextMilestone ?? goal);
  const passed = targets.filter((m) => m <= current);
  const previous = reached ? (targets.at(-1) ?? start) : (passed.at(-1) ?? start);
  const span = Math.max(0, next - previous);
  const done = Math.min(span, Math.max(0, current - previous));
  const fraction = reached ? 1 : span > 0 ? done / span : 0;
  return {
    previous,
    next,
    isGoal: next === goal,
    reached,
    done,
    span,
    remaining: Math.max(0, next - current),
    fraction,
    half: fraction < 0.5 ? "first" : "second",
  };
}
