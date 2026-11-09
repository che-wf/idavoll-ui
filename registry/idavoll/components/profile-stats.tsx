// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import type { ReactNode } from "react";
import { AnimatedNumber, formatCompact } from "@/components/idavoll/animated-number";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface ProfileStat {
  /** What the number counts, e.g. "Followers". */
  label: string;
  /** The current value. Animates when it changes. */
  value: number;
  /** How to show the value. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
}

export interface ProfilePlatform {
  /** Which platform. */
  platform: SocialPlatform;
  /** Follower count on that platform. Animates when it changes. */
  followers: number;
  /** Handle on that platform, if different from the main one. */
  handle?: string;
  /** Link to the profile on that platform. Makes the chip a link that opens in a new tab. */
  href?: string;
}

/** Extra classes for the parts inside ProfileStats. */
export interface ProfileStatsClassNames {
  /** The profile photo, e.g. "size-32" for a bigger one. */
  avatar?: string;
  /** The row of headline numbers. */
  stats?: string;
  /** Each headline number. */
  value?: string;
  /** Each label under a number. */
  label?: string;
  /** The name. */
  name?: string;
  /** The "Day 37 of 90" pill. */
  pill?: string;
  /** Each platform chip. */
  chip?: string;
}

export interface ProfileStatsProps {
  /** Display name. */
  name: string;
  /** Handle shown under the name, e.g. "@yourname". */
  handle?: string;
  /** Profile photo URL. Falls back to initials. */
  avatarUrl?: string;
  /** Short bio under the name. */
  bio?: ReactNode;
  /** Extra content under the bio, e.g. the big-three signs. */
  extra?: ReactNode;
  /** Draws the colorful ring around the photo, like an unseen story. Use it for "posted today". */
  active?: boolean;
  /** Text read by screen readers for the ring. Defaults to "Posted today". */
  activeLabel?: string;
  /** Colors for the ring, blended in order. Defaults to the theme's chart colors. */
  ringColors?: string[];
  /** Today's challenge day; shows a "Day 37 of 90" pill. */
  day?: number;
  /** Length of the challenge in days. Defaults to 90. */
  totalDays?: number;
  /** The row of headline numbers, e.g. posts, followers, views. */
  stats: ProfileStat[];
  /** Follower counts per platform, shown as chips with the platform logo. */
  platforms?: ProfilePlatform[];
  /** Count numbers up from zero when the header first appears. Defaults to true. */
  countUp?: boolean;
  /** Thickness of the ring around the photo in pixels. Defaults to 3. */
  ringWidth?: number;
  /** Extra classes for inner parts: avatar, stats, value, label, name, pill, chip. */
  classNames?: ProfileStatsClassNames;
  className?: string;
}

const DEFAULT_RING = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/** A creator profile header: photo with a "posted today" ring, headline numbers and per-platform followers. */
export function ProfileStats({
  name,
  handle,
  avatarUrl,
  bio,
  extra,
  active = false,
  activeLabel = "Posted today",
  ringColors = DEFAULT_RING,
  day,
  totalDays = 90,
  stats,
  platforms = [],
  countUp = true,
  ringWidth = 3,
  classNames,
  className,
}: ProfileStatsProps) {
  const ring = `conic-gradient(from 220deg, ${[...ringColors, ringColors[0]].join(", ")})`;

  return (
    <section className={cn("space-y-5", className)} aria-label={`${name} profile stats`}>
      <div className="flex items-center gap-5 sm:gap-8">
        <div
          className={cn("shrink-0 rounded-full", !active && "bg-border")}
          style={{ padding: ringWidth, background: active ? ring : undefined }}
        >
          <div className="rounded-full bg-background" style={{ padding: ringWidth }}>
            <Avatar className={cn("size-20 sm:size-24", classNames?.avatar)}>
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="font-heading text-foreground/75 text-xl font-semibold">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
          </div>
          {active && <span className="sr-only">{activeLabel}</span>}
        </div>

        <dl
          className={cn("grid flex-1 gap-2 text-center", classNames?.stats)}
          style={{ gridTemplateColumns: `repeat(${Math.max(stats.length, 1)}, minmax(0, 1fr))` }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className={cn("text-muted-foreground text-xs sm:text-sm", classNames?.label)}>{stat.label}</dt>
              <dd className={cn("font-heading text-xl font-bold tracking-tight sm:text-2xl", classNames?.value)}>
                <AnimatedNumber
                  value={stat.value}
                  from={countUp ? 0 : undefined}
                  formatValue={stat.formatValue ?? formatCompact}
                  highlightChange
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className={cn("font-heading text-lg font-semibold", classNames?.name)}>{name}</h3>
          {day !== undefined && (
            <span
              className={cn(
                "rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground text-xs tabular-nums",
                classNames?.pill,
              )}
            >
              Day {day} of {totalDays}
            </span>
          )}
        </div>
        {handle && <p className="text-muted-foreground text-sm">{handle}</p>}
        {bio && <p className="text-sm">{bio}</p>}
        {extra}
      </div>

      {platforms.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {platforms.map((p) => {
            const chip = cn(
              "flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm shadow-xs",
              classNames?.chip,
            );
            const content = (
              <>
                <SocialIcon platform={p.platform} variant="tile" className="size-6 rounded-full" />
                <AnimatedNumber
                  value={p.followers}
                  from={countUp ? 0 : undefined}
                  className="font-semibold"
                  highlightChange
                />
                <span className="text-muted-foreground">{p.handle ?? "followers"}</span>
              </>
            );
            return (
              <li key={p.platform} className={p.href ? undefined : chip}>
                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      chip,
                      "transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    )}
                  >
                    {content}
                    <span className="sr-only">on {SOCIAL_ICONS[p.platform].name} (opens in a new tab)</span>
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
