// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { CalendarCheck, Flag, Repeat, RotateCcw, Sparkles, Sprout, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import {
  type BadgeDefinition,
  type BadgeIcon,
  type BadgeStatus,
  CHALLENGE_BADGES,
  evaluateBadges,
} from "@/components/idavoll/challenge-badges";
import { ShimmerBorder } from "@/components/idavoll/shimmer-border";
import { cn } from "@/lib/utils";

export type { BadgeDefinition, BadgeStatus };
export { CHALLENGE_BADGES, evaluateBadges };

const ICONS: Record<BadgeIcon, typeof Trophy> = {
  sprout: Sprout,
  calendar: CalendarCheck,
  flag: Flag,
  repeat: Repeat,
  comeback: RotateCcw,
  trophy: Trophy,
  sparkles: Sparkles,
};

const DEFAULT_LABELS = {
  /** {day} becomes the challenge day. */
  earnedOn: "Day {day}",
  /** {done} and {total} are replaced with numbers. */
  progress: "{done} of {total}",
  nextUp: "Next up",
  earned: "Earned",
  /** {name} becomes the badge name. */
  isNew: "New badge: {name}",
  empty: "Your first badge arrives with your first post.",
};

export interface AchievementBadgeProps {
  /** The badge to show. */
  badge: BadgeDefinition;
  /** Earned badges show in color with the day they were earned. */
  earned?: boolean;
  /** Challenge day it was earned. */
  earnedOnDay?: number;
  /** How close an unearned badge is. */
  progress?: { done: number; total: number };
  /** Just earned: plays the shimmer once. */
  isNew?: boolean;
  /** "md" for a shelf, "sm" for a profile row. Defaults to "md". */
  size?: "sm" | "md";
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/** One badge: a medallion with its icon, name and what it recognises. Unearned badges are muted, with progress. */
export function AchievementBadge({
  badge,
  earned = false,
  earnedOnDay,
  progress,
  isNew,
  size = "md",
  labels: labelOverrides,
  className,
}: AchievementBadgeProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const Icon = ICONS[badge.icon];
  const small = size === "sm";
  const medal = (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full",
        small ? "size-9" : "size-14",
        earned
          ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
          : "border-2 border-foreground/25 border-dashed text-foreground/50",
      )}
    >
      <Icon className={small ? "size-4" : "size-6"} strokeWidth={2.25} />
    </span>
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {isNew && earned ? (
        <ShimmerBorder radius="9999px" width={2} className="shrink-0 rounded-full">
          {medal}
        </ShimmerBorder>
      ) : (
        medal
      )}
      <div className="min-w-0">
        <p className={cn("font-semibold", small ? "text-sm" : "text-base", !earned && "text-foreground/80")}>
          {badge.name}
          {!earned && <span className="sr-only"> (not earned yet)</span>}
        </p>
        {!small && <p className="text-foreground/75 text-sm leading-snug">{badge.description}</p>}
        {earned && earnedOnDay !== undefined && (
          <p className="text-foreground/70 text-xs">{labels.earnedOn.replace("{day}", String(earnedOnDay))}</p>
        )}
        {!earned && progress && (
          <div className="mt-1 flex items-center gap-2">
            <div aria-hidden className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (progress.done / progress.total) * 100)}%` }}
              />
            </div>
            <span className="text-foreground/70 text-xs tabular-nums">
              {labels.progress.replace("{done}", String(progress.done)).replace("{total}", String(progress.total))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export interface BadgeShelfProps {
  /** Badge statuses, e.g. from evaluateBadges(). */
  statuses: BadgeStatus[];
  /** Ids of badges earned since the person last looked; they shimmer once and are announced. */
  newIds?: string[];
  /** How many unearned effort badges to show as "Next up". Defaults to 1. Surprise badges never show early. */
  showNext?: number;
  /** Extra content under the finisher badge, e.g. a "Start your next chapter" button. */
  finisherAction?: ReactNode;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Earned badges, newest first, plus the next effort badge with its progress. Surprise
 * badges stay hidden until earned, and a badge once earned always shows. New badges
 * shimmer once and are announced politely.
 */
export function BadgeShelf({
  statuses,
  newIds = [],
  showNext = 1,
  finisherAction,
  labels: labelOverrides,
  className,
}: BadgeShelfProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const earned = statuses.filter((s) => s.earned).sort((a, b) => (b.earnedOnDay ?? 0) - (a.earnedOnDay ?? 0));
  const next = statuses.filter((s) => !s.earned && s.badge.kind === "effort").slice(0, showNext);
  const announced = earned
    .filter((s) => newIds.includes(s.badge.id))
    .map((s) => labels.isNew.replace("{name}", s.badge.name));

  return (
    <div className={cn("@container space-y-4", className)}>
      <p className="sr-only" aria-live="polite">
        {announced.join(". ")}
      </p>
      {earned.length === 0 ? (
        <p className="text-foreground/75 text-sm">{labels.empty}</p>
      ) : (
        <ul aria-label={labels.earned} className="grid gap-4 @xl:grid-cols-2">
          {earned.map((s) => (
            <li key={s.badge.id}>
              <AchievementBadge
                badge={s.badge}
                earned
                earnedOnDay={s.earnedOnDay}
                isNew={newIds.includes(s.badge.id)}
                labels={labelOverrides}
              />
              {s.badge.id === "finisher" && finisherAction && <div className="mt-2 ml-17">{finisherAction}</div>}
            </li>
          ))}
        </ul>
      )}
      {next.length > 0 && (
        <div className="space-y-3 border-t pt-4">
          <p className="font-medium text-foreground/70 text-xs uppercase tracking-wide">{labels.nextUp}</p>
          <ul className="grid gap-4 @xl:grid-cols-2">
            {next.map((s) => (
              <li key={s.badge.id}>
                <AchievementBadge badge={s.badge} progress={s.progress} labels={labelOverrides} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
