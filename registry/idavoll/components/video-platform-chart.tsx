// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/components/idavoll/animated-number";
import { SegmentedControl } from "@/components/idavoll/segmented-control";
import { platformColor, SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export type VideoChartMode = "total" | "48h" | "7d";

const DEFAULT_LABELS = {
  mode: "Views to show",
  total: "Total",
  "48h": "At 48 hours",
  "7d": "At 7 days",
  notYet: "Not old enough yet",
  /** {shown} and {total} are replaced with numbers. */
  showing: "Showing the latest {shown} of {total} videos.",
  day: "Day",
  axis: "Challenge day",
  totalViews: "Total",
  table: "Show as table",
  video: "Video",
};

export interface VideoViews {
  /** Unique id, passed to onSelect. */
  id: string;
  /** Video name, for the tooltip and table. */
  label: string;
  /** Challenge day it was posted. Bars are ordered by day. */
  day: number;
  /** Total views so far, per platform. */
  views: Partial<Record<SocialPlatform, number>>;
  /** Views when the video was 48 hours and 7 days old, per platform. */
  viewsAt?: Partial<Record<"48h" | "7d", Partial<Record<SocialPlatform, number>>>>;
  /** How old the video is now, in hours. Videos younger than the chosen age show a "not yet" bar. */
  ageHours?: number;
}

export interface VideoPlatformChartProps {
  /** One entry per video. */
  videos: VideoViews[];
  /** "total", or views at a fixed age so new and old videos compare fairly. Leave unset to let the viewer switch. */
  mode?: VideoChartMode;
  /** Starting mode when you don't control `mode`. Defaults to "total". */
  defaultMode?: VideoChartMode;
  /** Called when the viewer switches mode. */
  onModeChange?: (mode: VideoChartMode) => void;
  /** Called with a video's id when its bar (or table row) is picked. */
  onSelect?: (id: string) => void;
  /** Most bars to show; the latest videos are kept. Defaults to 30. */
  maxBars?: number;
  /** Name of the chart for screen readers; give each chart on a page its own. Defaults to "Views by video". */
  label?: string;
  /** Classes for the chart area. Defaults to h-72. */
  chartClassName?: string;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

const MIN_AGE: Record<VideoChartMode, number> = { total: 0, "48h": 48, "7d": 168 };
const full = new Intl.NumberFormat();

/**
 * Each video's views split by platform, as stacked bars ordered by challenge day. Switch
 * between total views and views at 48 hours or 7 days old; videos too young for the chosen
 * age show a striped "not yet" bar instead of zero. Legend chips hide platforms, the tooltip
 * names every platform, and "Show as table" gives the same numbers as a table.
 */
export function VideoPlatformChart({
  videos,
  mode: modeProp,
  defaultMode = "total",
  onModeChange,
  onSelect,
  maxBars = 30,
  label = "Views by video",
  chartClassName,
  labels: labelOverrides,
  className,
}: VideoPlatformChartProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const patternId = useId().replace(/:/g, "");
  const [modeState, setModeState] = useState<VideoChartMode>(defaultMode);
  const mode = modeProp ?? modeState;
  const [hidden, setHidden] = useState<Set<SocialPlatform>>(new Set());

  const sorted = [...videos].sort((a, b) => a.day - b.day);
  const shown = sorted.slice(-maxBars);
  // Platforms in a stable order: the legend, the stack and the tooltip all follow it.
  const platforms = (Object.keys(SOCIAL_ICONS) as SocialPlatform[]).filter((p) =>
    videos.some((v) => (v.views[p] ?? 0) > 0),
  );
  const visible = platforms.filter((p) => !hidden.has(p));

  const valuesFor = (v: VideoViews) => {
    if (mode === "total") return v.views;
    if ((v.ageHours ?? Number.POSITIVE_INFINITY) < MIN_AGE[mode]) return null;
    return v.viewsAt?.[mode] ?? null;
  };
  const rows = shown.map((v) => {
    const values = valuesFor(v);
    const row: Record<string, number | string | null> = { id: v.id, day: v.day, label: v.label };
    let total = 0;
    for (const p of visible) {
      const n = values?.[p] ?? 0;
      row[p] = values ? n : null;
      total += values ? n : 0;
    }
    row.total = values ? total : null;
    row.pending = values ? null : 0;
    return row;
  });
  const max = Math.max(1, ...rows.map((r) => (typeof r.total === "number" ? r.total : 0)));
  for (const r of rows) if (r.pending === 0) r.pending = max;

  const config = Object.fromEntries(
    platforms.map((p) => [p, { label: SOCIAL_ICONS[p].name, color: platformColor(p) }]),
  ) as ChartConfig;
  const setMode = (next: VideoChartMode) => {
    setModeState(next);
    onModeChange?.(next);
  };
  const byId = new Map(shown.map((v) => [v.id, v]));

  return (
    <div className={cn("space-y-3", className)}>
      <svg aria-hidden className="absolute size-0">
        <defs>
          <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="var(--muted)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="3" />
          </pattern>
        </defs>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-1.5">
          {platforms.map((p) => {
            const off = hidden.has(p);
            return (
              <li key={p}>
                <button
                  type="button"
                  aria-pressed={!off}
                  onClick={() =>
                    setHidden((prev) => {
                      const next = new Set(prev);
                      if (next.has(p)) next.delete(p);
                      else next.add(p);
                      return next;
                    })
                  }
                  className={cn(
                    "cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-xs transition-opacity hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring",
                    off && "opacity-40",
                  )}
                >
                  <SocialIcon platform={p} variant="tile" label="" className="size-5 rounded-full" />
                  {SOCIAL_ICONS[p].name}
                </button>
              </li>
            );
          })}
        </ul>
        {modeProp === undefined && (
          <SegmentedControl
            label={labels.mode}
            size="sm"
            value={mode}
            onValueChange={setMode}
            options={(["total", "48h", "7d"] as const).map((m) => ({ value: m, label: labels[m] }))}
          />
        )}
      </div>

      {/* Bars keep a usable width; many videos scroll sideways instead of turning into slivers. */}
      <section
        aria-label={label}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be focusable.
        tabIndex={0}
        className="overflow-x-auto rounded-md focus-visible:outline-2 focus-visible:outline-ring"
      >
        <ChartContainer
          config={config}
          className={cn("aspect-auto h-72 w-full", chartClassName)}
          style={{ minWidth: `${Math.max(320, shown.length * 22 + 60)}px` }}
        >
          <BarChart
            data={rows}
            margin={{ top: 8, right: 8, bottom: 16, left: 0 }}
            accessibilityLayer
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              label={{
                value: labels.axis,
                position: "insideBottom",
                offset: -12,
                fontSize: 11,
                fill: "var(--foreground)",
              }}
            />
            <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => formatCompact(v)} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Record<string, number | string | null> | undefined;
                if (!active || !row) return null;
                const pending = row.total === null;
                return (
                  // Capped width: long titles wrap to two lines, then end with "…" (the table shows them in full).
                  <div className="w-max min-w-44 max-w-64 space-y-1.5 rounded-lg border bg-background p-2.5 text-xs shadow-lg">
                    <div>
                      <p className="text-foreground/70">
                        {labels.day} {row.day}
                      </p>
                      <p className="line-clamp-2 font-medium [overflow-wrap:anywhere]">{row.label}</p>
                    </div>
                    {pending ? (
                      <p className="text-foreground/70">{labels.notYet}</p>
                    ) : (
                      <>
                        {[...visible].reverse().map((p) => (
                          <p key={p} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-foreground/70">
                              <span
                                aria-hidden
                                className="size-2 rounded-full"
                                style={{ background: platformColor(p) }}
                              />
                              {SOCIAL_ICONS[p].name}
                            </span>
                            <span className="font-mono tabular-nums">{full.format(Number(row[p] ?? 0))}</span>
                          </p>
                        ))}
                        <p className="flex justify-between gap-4 border-t pt-1.5 font-medium">
                          {labels.totalViews}
                          <span className="font-mono tabular-nums">{full.format(Number(row.total))}</span>
                        </p>
                      </>
                    )}
                  </div>
                );
              }}
            />
            {visible.map((p, i) => (
              <Bar
                key={p}
                dataKey={p}
                stackId="views"
                fill={`var(--color-${p})`}
                radius={i === visible.length - 1 ? [3, 3, 0, 0] : 0}
                onClick={(data: { payload?: { id?: string } }) => data.payload?.id && onSelect?.(data.payload.id)}
                className={onSelect ? "cursor-pointer" : undefined}
              />
            ))}
            <Bar dataKey="pending" stackId="views" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {rows.map((r) => (
                <Cell key={String(r.id)} fill={`url(#${patternId})`} stroke="var(--border)" />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </section>

      {sorted.length > shown.length && (
        <p className="text-foreground/70 text-xs">
          {labels.showing.replace("{shown}", String(shown.length)).replace("{total}", String(sorted.length))}
        </p>
      )}

      <details className="text-sm">
        <summary className="w-fit cursor-pointer rounded-sm text-foreground/70 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
          {labels.table}
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-foreground/70">
                <th scope="col" className="py-1.5 pr-3 font-medium">
                  {labels.video}
                </th>
                {visible.map((p) => (
                  <th key={p} scope="col" className="px-2 py-1.5 text-right font-medium">
                    {SOCIAL_ICONS[p].name}
                  </th>
                ))}
                <th scope="col" className="py-1.5 pl-2 text-right font-medium">
                  {labels.totalViews}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const video = byId.get(String(r.id));
                const name = `${labels.day} ${r.day} · ${r.label}`;
                return (
                  <tr key={String(r.id)} className="border-b last:border-0">
                    <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                      {onSelect && video ? (
                        <button
                          type="button"
                          onClick={() => onSelect(video.id)}
                          className="cursor-pointer disabled:cursor-not-allowed rounded-sm text-left underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          {name}
                        </button>
                      ) : (
                        name
                      )}
                    </th>
                    {visible.map((p) => (
                      <td key={p} className="px-2 py-1.5 text-right tabular-nums">
                        {r.total === null ? "—" : full.format(Number(r[p] ?? 0))}
                      </td>
                    ))}
                    <td className="py-1.5 pl-2 text-right tabular-nums">
                      {r.total === null ? labels.notYet : full.format(Number(r.total))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
