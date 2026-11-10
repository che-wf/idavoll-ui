// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Flag, PartyPopper, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber, formatCompact } from "@/components/idavoll/animated-number";
import { milestoneProgress } from "@/components/idavoll/milestones";
import { ShimmerBorder } from "@/components/idavoll/shimmer-border";
import { cn } from "@/lib/utils";

export { milestoneProgress };

const DEFAULT_LABELS = {
  next: "Next milestone",
  goal: "Your goal",
  /** First half: {next} and {metric} are filled in, e.g. "of 2,500 toward 5K followers". */
  ofToward: "of {span} toward {next} {metric}",
  /** Second half, e.g. "to 10K followers". */
  toTarget: "to {next} {metric}",
  /** {days} becomes e.g. "6 days". */
  pace: "At your current pace: about {days}",
  paceToday: "At your current pace: today",
  paceLong: "At your current pace: more than a year",
  noGoal: "Set a goal to see your next milestone.",
  /** {goal} and {metric} are filled in. */
  reached: "You reached {goal} {metric}!",
  reachedNote: "Every milestone done. Take a moment to enjoy it.",
  progress: "Progress to the next milestone",
};

export interface NextMilestoneProps {
  /** The number now, e.g. today's followers. */
  current: number;
  /** Milestone values between start and goal. */
  milestones: number[];
  /** The main goal. Shown once every milestone is passed. */
  goal: number;
  /** Where the challenge started; the first bar runs from here. Defaults to 0. */
  start?: number;
  /** What's counted, e.g. "followers". */
  metricLabel: string;
  /** Average gain per day, for "At your current pace: about 6 days". */
  dailyRate?: number;
  /** How to show the milestone and goal. Defaults to compact like 10K. */
  formatValue?: (value: number) => string;
  /** Show the celebration when the goal is reached (plays once, wrapped in shimmer-border). Defaults to true. */
  celebrate?: boolean;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** Extra content under the bar, e.g. a link to the challenge page. */
  children?: ReactNode;
  className?: string;
}

const full = new Intl.NumberFormat();

/**
 * Always shows the next goal and how far away it is. Before halfway it counts progress made
 * ("1,600 of 2,500 toward 5K followers"); after halfway it counts what's left ("312 to 10K
 * followers"), because people push harder as a goal gets close. After the last milestone it
 * shows the main goal, and when that's reached, a one-time celebration.
 */
export function NextMilestone({
  current,
  milestones,
  goal,
  start = 0,
  metricLabel,
  dailyRate,
  formatValue = formatCompact,
  celebrate = true,
  labels: labelOverrides,
  children,
  className,
}: NextMilestoneProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const p = milestoneProgress(current, milestones, goal, start);
  const fill = (text: string) =>
    text
      .replace("{span}", full.format(p.span))
      .replace("{next}", formatValue(p.next))
      .replace("{goal}", formatValue(goal))
      .replace("{metric}", metricLabel)
      .trim();

  // No real goal yet (zero, or not above the start): nothing to count toward.
  if (!(goal > start)) {
    return (
      <div className={cn("rounded-xl border border-dashed bg-card p-4 text-foreground/75 text-sm", className)}>
        {labels.noGoal}
        {children}
      </div>
    );
  }

  if (p.reached) {
    const card = (
      <div className={cn("flex items-center gap-4 rounded-xl border bg-card p-4", className)}>
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-lg">{fill(labels.reached)}</p>
          <p className="text-foreground/70 text-sm">{labels.reachedNote}</p>
          {children}
        </div>
      </div>
    );
    return celebrate ? (
      <ShimmerBorder radius="calc(var(--radius) * 1.4)" className="flex w-full">
        {card}
      </ShimmerBorder>
    ) : (
      card
    );
  }

  const days = dailyRate && dailyRate > 0 ? Math.ceil(p.remaining / dailyRate) : undefined;
  const dayText =
    days !== undefined
      ? new Intl.NumberFormat(undefined, { style: "unit", unit: "day", unitDisplay: "long" }).format(days)
      : "";
  const Icon = p.isGoal ? Trophy : Flag;

  return (
    <div className={cn("space-y-3 rounded-xl border bg-card p-4 text-card-foreground", className)}>
      <p className="flex items-center gap-1.5 text-foreground/70 text-sm">
        <Icon aria-hidden className="size-4" />
        {p.isGoal ? labels.goal : labels.next}
      </p>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <AnimatedNumber
          value={p.half === "first" ? p.done : p.remaining}
          formatValue={full.format}
          className="font-heading font-bold text-3xl tracking-tight"
        />
        <span className="text-foreground/80">{fill(p.half === "first" ? labels.ofToward : labels.toTarget)}</span>
      </p>
      <div>
        <div
          role="progressbar"
          aria-label={labels.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(p.fraction * 100)}
          aria-valuetext={`${full.format(p.done)} of ${full.format(p.span)}`}
          className="h-2.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${p.fraction * 100}%` }}
          />
        </div>
        <div aria-hidden className="mt-1 flex justify-between text-foreground/70 text-xs tabular-nums">
          <span>{formatValue(p.previous)}</span>
          <span className="font-medium text-foreground">{formatValue(p.next)}</span>
        </div>
      </div>
      {days !== undefined && (
        <p className="text-foreground/70 text-sm">
          {days <= 1 && p.remaining <= (dailyRate ?? 0)
            ? labels.paceToday
            : days > 365
              ? labels.paceLong
              : labels.pace.replace("{days}", dayText)}
        </p>
      )}
      {children}
    </div>
  );
}
