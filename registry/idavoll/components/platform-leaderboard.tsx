"use client";

import { AnimatedNumber, formatCompact } from "@/components/idavoll/animated-number";
import { platformColor, SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { cn } from "@/lib/utils";

export interface PlatformSeries {
  /** Which platform. */
  platform: SocialPlatform;
  /** Follower count (or any value) by challenge day, oldest first. */
  data: { day: number; value: number }[];
  /** Value to reach by the last day. Adds an ahead/behind label. */
  goal?: number;
  /** Name to show instead of the platform name, e.g. a handle. */
  label?: string;
  /** Line color. Defaults to the platform's brand color. */
  color?: string;
}

export type LeaderboardSort = "growth" | "gain" | "followers";

export interface PlatformLeaderboardProps {
  /** One entry per platform. */
  platforms: PlatformSeries[];
  /**
   * How to rank platforms. "growth" is % growth since day 1 (fairest across platforms of
   * different sizes), "gain" is new followers in the last `periodDays`, "followers" is the total.
   * Defaults to "growth".
   */
  sortBy?: LeaderboardSort;
  /** Length of the "recent gain" window in days. Defaults to 7. */
  periodDays?: number;
  /** Length of the challenge in days, used for the ahead/behind label. Defaults to 90. */
  totalDays?: number;
  /** Header for the number column. Defaults to "Followers". */
  valueLabel?: string;
  /** How to show numbers. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /** Show the small trend line on each row. Defaults to true. */
  showSparkline?: boolean;
  /** Name of the table for screen readers. Defaults to "Platform leaderboard". */
  label?: string;
  className?: string;
}

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 0, signDisplay: "always" });

function summarize(series: PlatformSeries, periodDays: number, totalDays: number) {
  const points = [...series.data].sort((a, b) => a.day - b.day);
  const first = points[0];
  const last = points.at(-1);
  const current = last?.value ?? 0;
  const start = first?.value ?? 0;
  const periodStart = [...points].reverse().find((p) => last && p.day <= last.day - periodDays) ?? first;
  const gain = current - (periodStart?.value ?? 0);
  const growth = start > 0 ? (current - start) / start : 0;

  let pace: "ahead" | "on-pace" | "behind" | null = null;
  if (series.goal !== undefined && last && series.goal > start) {
    const goalFraction = (current - start) / (series.goal - start);
    const timeFraction = last.day / totalDays;
    const diff = goalFraction - timeFraction;
    pace = diff > 0.05 ? "ahead" : diff < -0.05 ? "behind" : "on-pace";
  }
  return { points, current, gain, growth, pace };
}

function Sparkline({ points, color }: { points: { day: number; value: number }[]; color: string }) {
  if (points.length < 2) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const first = points[0]?.day ?? 0;
  const span = (points.at(-1)?.day ?? 1) - first || 1;
  const path = points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${(((p.day - first) / span) * 100).toFixed(2)},${(28 - ((p.value - min) / range) * 24).toFixed(2)}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden className="h-8 w-24">
      <path d={path} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const PACE_STYLE = {
  ahead: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "on-pace": "bg-muted text-muted-foreground",
  behind: "bg-red-500/15 text-red-700 dark:text-red-400",
} as const;
const PACE_LABEL = { ahead: "Ahead", "on-pace": "On pace", behind: "Behind" } as const;

/** Ranks platforms side by side: followers, recent gain, % growth, a trend line and pace. */
export function PlatformLeaderboard({
  platforms,
  sortBy = "growth",
  periodDays = 7,
  totalDays = 90,
  valueLabel = "Followers",
  formatValue = formatCompact,
  showSparkline = true,
  label = "Platform leaderboard",
  className,
}: PlatformLeaderboardProps) {
  const rows = platforms
    .map((series) => ({ series, ...summarize(series, periodDays, totalDays) }))
    .sort((a, b) =>
      sortBy === "followers" ? b.current - a.current : sortBy === "gain" ? b.gain - a.gain : b.growth - a.growth,
    );

  return (
    // Focusable so keyboard users can scroll it sideways on narrow screens.
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be reachable by keyboard.
      tabIndex={0}
      className={cn(
        "overflow-x-auto rounded-xl border bg-card focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="text-muted-foreground text-xs">
          <tr className="border-b">
            <th scope="col" className="w-8 py-2 pl-4 text-left font-medium">
              #
            </th>
            <th scope="col" className="py-2 text-left font-medium">
              Platform
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              {valueLabel}
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Last {periodDays}d
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Growth
            </th>
            {showSparkline && (
              <th scope="col" className="hidden py-2 pl-4 text-left font-medium sm:table-cell">
                Trend
              </th>
            )}
            <th scope="col" className="py-2 pr-4 text-right font-medium">
              <span className="sr-only">Pace</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ series, points, current, gain, growth, pace }, i) => (
            <tr key={series.platform} className="border-b transition-colors last:border-b-0 hover:bg-muted/40">
              <td className="py-3 pl-4 font-heading font-semibold text-muted-foreground tabular-nums">{i + 1}</td>
              <th scope="row" className="py-3 text-left font-medium">
                <span className="flex items-center gap-2">
                  <SocialIcon platform={series.platform} variant="tile" label="" className="size-7" />
                  {series.label ?? SOCIAL_ICONS[series.platform].name}
                </span>
              </th>
              <td className="py-3 text-right font-heading font-semibold">
                <AnimatedNumber value={current} formatValue={formatValue} highlightChange />
              </td>
              <td className="py-3 pl-3 text-right text-muted-foreground tabular-nums">
                {gain >= 0 ? "+" : "−"}
                {formatValue(Math.abs(gain))}
              </td>
              <td
                className={cn(
                  "py-3 pl-3 text-right font-medium tabular-nums",
                  growth > 0 && "text-emerald-700 dark:text-emerald-400",
                  growth < 0 && "text-red-700 dark:text-red-400",
                )}
              >
                {percent.format(growth)}
              </td>
              {showSparkline && (
                <td className="hidden py-3 pl-4 sm:table-cell">
                  <Sparkline points={points} color={series.color ?? platformColor(series.platform)} />
                </td>
              )}
              <td className="py-3 pr-4 pl-3 text-right">
                {pace && (
                  <span
                    className={cn("whitespace-nowrap rounded-full px-2 py-0.5 font-medium text-xs", PACE_STYLE[pace])}
                  >
                    {PACE_LABEL[pace]}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
