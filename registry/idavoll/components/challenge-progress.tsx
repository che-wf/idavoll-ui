"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ChallengeGoal {
  /** What's being measured, e.g. "Followers". */
  label: string;
  /** Where things stand now. */
  current: number;
  /** The number to reach by the last day. */
  target: number;
  /** Where things stood on day 1. Defaults to 0. */
  start?: number;
  /** How to show numbers. Defaults to a plain number with separators. */
  formatValue?: (value: number) => string;
}

export interface ChallengeProgressProps {
  /** Today's day of the challenge (1 on the first day). */
  day: number;
  /** Length of the challenge in days. Defaults to 90. */
  totalDays?: number;
  /** Challenge name shown as the title. */
  title?: string;
  /** Optional goal; adds a progress bar and an on-pace label. */
  goal?: ChallengeGoal;
  className?: string;
}

export type PaceStatus = "ahead" | "on-pace" | "behind";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const plain = new Intl.NumberFormat();

/** Compares goal progress with time elapsed. Within 5 points counts as on pace. */
export function paceStatus(goalFraction: number, timeFraction: number): PaceStatus {
  const diff = goalFraction - timeFraction;
  if (diff > 0.05) return "ahead";
  if (diff < -0.05) return "behind";
  return "on-pace";
}

const PACE_LABEL: Record<PaceStatus, string> = { ahead: "Ahead of pace", "on-pace": "On pace", behind: "Behind pace" };

/** "Day 37 of 90" with time and goal progress bars. */
export function ChallengeProgress({
  day,
  totalDays = 90,
  title = "Your challenge",
  goal,
  className,
}: ChallengeProgressProps) {
  const shownDay = Math.min(Math.max(day, 0), totalDays);
  const timeFraction = clamp(shownDay / totalDays);
  const format = goal?.formatValue ?? ((v: number) => plain.format(v));
  const start = goal?.start ?? 0;
  const goalFraction = goal ? clamp((goal.current - start) / Math.max(goal.target - start, 1)) : 0;
  const pace = goal ? paceStatus(goalFraction, timeFraction) : null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-heading text-2xl">
          Day {shownDay} <span className="text-muted-foreground font-normal">of {totalDays}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Time</span>
            <span className="text-muted-foreground tabular-nums">{Math.round(timeFraction * 100)}%</span>
          </div>
          <Progress value={timeFraction * 100} aria-label="Share of the challenge completed" />
        </div>
        {goal && pace && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{goal.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {format(goal.current)} / {format(goal.target)}
              </span>
            </div>
            <Progress value={goalFraction * 100} aria-label={`${goal.label} progress toward the goal`} />
            <Badge
              variant="secondary"
              className={cn(
                pace === "ahead" && "text-emerald-700 dark:text-emerald-400",
                pace === "behind" && "text-amber-700 dark:text-amber-400",
              )}
            >
              {PACE_LABEL[pace]}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
