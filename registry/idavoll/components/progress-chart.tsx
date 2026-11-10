// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { useEffect, useId, useState } from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceLine, Scatter, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/components/idavoll/animated-number";
import { SegmentedControl } from "@/components/idavoll/segmented-control";
import { platformColor, SOCIAL_ICONS, type SocialPlatform } from "@/components/idavoll/social-icon";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** A value on a challenge day. Days can be fractional: 5.5 is noon on day 5. */
export interface ProgressPoint {
  day: number;
  value: number;
}

export interface ProgressSeries {
  /** Which platform. */
  platform: SocialPlatform;
  /** Its values over time. */
  data: ProgressPoint[];
  /** Name to show instead of the platform name. */
  label?: string;
  /** Line color. Defaults to the platform's brand color. */
  color?: string;
}

export interface ProgressPost {
  /** Unique id, passed back to onSelectPost. */
  id: string;
  /** Platform it was posted on; the dot sits on that platform's line. */
  platform: SocialPlatform;
  /** Challenge day it went up (fractional for the time of day). */
  day: number;
  /** What was posted, e.g. the video title. */
  label: string;
}

export type ProgressZoom = "progress" | "challenge";
export type ProgressShow = "combined" | "platforms";

const DEFAULT_LABELS = {
  zoom: "Chart range",
  progress: "How far you've come",
  challenge: "Whole challenge",
  soFar: "So far",
  show: "Lines to show",
  combined: "Combined",
  platforms: "By platform",
  posts: "Posts",
  day: "Day",
  today: "Today",
  pace: "Steady pace",
  /** {value} is replaced with a number. */
  paceToday: "Steady pace today: {value}",
  /** {value} is replaced with a number. */
  youToday: "You: {value}",
  postedThen: "Posted then",
  /** {platform} and {label} are filled in. */
  openPost: "Open the {platform} post: {label}",
  /** {platform} is filled in. */
  postKey: "{platform} post",
};

export interface ProgressChartProps {
  /** The total over time. Leave out to add up `platforms` (each carries its last value forward). */
  combined?: ProgressPoint[];
  /** The same measure per platform, for the "By platform" view and post dots. */
  platforms?: ProgressSeries[];
  /** The challenge goal. Adds the steady-pace line and the "Whole challenge" climb to it. */
  goal?: number;
  /** Where the pace line starts. Defaults to the first combined value. */
  start?: number;
  /** Challenge length in days. Defaults to 90. */
  totalDays?: number;
  /** Today's challenge day (fractional for the time). Draws a Today line. */
  today?: number;
  /** Milestone values, drawn as faint lines when in range. */
  milestones?: number[];
  /** Posts to mark on the lines. */
  posts?: ProgressPost[];
  /** Called when a post dot is clicked or pressed. */
  onSelectPost?: (post: ProgressPost) => void;
  /** What's measured, e.g. "Followers". */
  valueLabel?: string;
  /** How to show numbers. Defaults to compact like 12.4K. */
  formatValue?: (value: number) => string;
  /** "progress" fits your data up to today; "challenge" shows day 1 to the end and 0 to the goal. */
  zoom?: ProgressZoom;
  defaultZoom?: ProgressZoom;
  onZoomChange?: (zoom: ProgressZoom) => void;
  /** One combined line, or one line per platform. */
  show?: ProgressShow;
  defaultShow?: ProgressShow;
  onShowChange?: (show: ProgressShow) => void;
  /** Whether post dots show. */
  showPosts?: boolean;
  defaultShowPosts?: boolean;
  onShowPostsChange?: (on: boolean) => void;
  /** Remembers this chart's zoom, lines and posts choices on this device, under this key. */
  storageKey?: string;
  /** Use an hourly axis when the data spans fewer than this many days. Defaults to 3. */
  hourlyUnder?: number;
  /** Classes for the chart area. Defaults to h-80. */
  chartClassName?: string;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/** A remembered choice: controlled if `value` is given, else stored under `storageKey`. */
function useChoice<T extends string | boolean>(
  value: T | undefined,
  initial: T,
  onChange: ((v: T) => void) | undefined,
  storageKey: string | undefined,
  name: string,
): [T, (v: T) => void] {
  const key = storageKey ? `idavoll.progress-chart.${storageKey}.${name}` : undefined;
  const [state, setState] = useState<T>(() => {
    if (!key) return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Not important if it can't be remembered.
    }
  }, [key, state]);
  return [
    value ?? state,
    (v: T) => {
      setState(v);
      onChange?.(v);
    },
  ];
}

const sorted = (points: ProgressPoint[]) =>
  [...points].filter((p) => Number.isFinite(p.day) && Number.isFinite(p.value)).sort((a, b) => a.day - b.day);

/** The value on a line at `day`, straight between its neighbours; undefined outside its data. */
function valueAt(points: ProgressPoint[], day: number): number | undefined {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last || day < first.day) return undefined;
  if (day >= last.day) return last.value;
  for (let i = 1; i < points.length; i++) {
    const b = points[i] as ProgressPoint;
    const a = points[i - 1] as ProgressPoint;
    if (day <= b.day) return a.value + ((b.value - a.value) * (day - a.day)) / (b.day - a.day || 1);
  }
  return last.value;
}

/** Round axis ends and about `count` round ticks (steps of 1, 2, 2.5 or 5 times a power of ten). */
function niceTicks(lo: number, hi: number, count = 5): number[] {
  const range = hi - lo || Math.abs(hi) || 1;
  const raw = range / count;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].map((f) => f * power).find((s) => s >= raw) ?? 10 * power) || 1;
  const first = Math.floor(lo / step) * step;
  const last = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = first; t <= last + step / 2; t += step) ticks.push(Math.round(t * 1e6) / 1e6);
  return ticks;
}

/** Adds platforms up over time, each carrying its last value forward. */
function combine(series: ProgressSeries[]): ProgressPoint[] {
  const lines = series.map((s) => sorted(s.data));
  const days = [...new Set(lines.flatMap((l) => l.map((p) => p.day)))].sort((a, b) => a - b);
  return days.map((day) => ({
    day,
    value: lines.reduce((sum, l) => {
      let v: number | undefined;
      for (const p of l) {
        if (p.day > day) break;
        v = p.value;
      }
      return sum + (v ?? 0);
    }, 0),
  }));
}

/**
 * Progress toward a challenge goal over time, for a home page or audience page. Lines join
 * across days with no data; post dots sit on the line in their platform's color (hover to
 * see what was posted, click or press to open it); the dashed steady-pace line runs from
 * the start to the goal, with today's pace shown in words when it's off the chart. Zoom to
 * "How far you've come" or the "Whole challenge", switch between one combined line and one
 * per platform, and early on the axis counts hours instead of days.
 */
export function ProgressChart({
  combined: combinedProp,
  platforms = [],
  goal,
  start: startProp,
  totalDays = 90,
  today,
  milestones = [],
  posts = [],
  onSelectPost,
  valueLabel = "Followers",
  formatValue = formatCompact,
  zoom: zoomProp,
  defaultZoom = "progress",
  onZoomChange,
  show: showProp,
  defaultShow = "combined",
  onShowChange,
  showPosts: showPostsProp,
  defaultShowPosts = true,
  onShowPostsChange,
  storageKey,
  hourlyUnder = 3,
  chartClassName,
  labels: labelOverrides,
  className,
}: ProgressChartProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const [zoom, setZoom] = useChoice(zoomProp, defaultZoom, onZoomChange, storageKey, "zoom");
  const [showPref, setShow] = useChoice(showProp, defaultShow, onShowChange, storageKey, "show");
  const [postsOn, setPostsOn] = useChoice(showPostsProp, defaultShowPosts, onShowPostsChange, storageKey, "posts");

  const platformLines = platforms
    .map((s) => ({
      key: s.platform,
      platform: s.platform as SocialPlatform | undefined,
      label: s.label ?? SOCIAL_ICONS[s.platform].name,
      color: s.color ?? platformColor(s.platform),
      points: sorted(s.data),
    }))
    .filter((l) => l.points.length > 0);
  const combined = sorted(combinedProp ?? combine(platforms));
  const canSplit = platformLines.length > 1;
  const show: ProgressShow = canSplit ? showPref : "combined";
  const lines =
    show === "platforms"
      ? platformLines
      : [{ key: "combined", platform: undefined, label: valueLabel, color: "var(--primary)", points: combined }];
  const start = startProp ?? combined[0]?.value ?? 0;
  const hasGoal = goal !== undefined && Number.isFinite(goal);

  // Ranges for each zoom.
  const allDays = lines.flatMap((l) => l.points.map((p) => p.day));
  const firstDay = allDays.length ? Math.min(...allDays) : 1;
  const lastDay = Math.max(allDays.length ? Math.max(...allDays) : 1, today ?? 0);
  const xDomain: [number, number] =
    zoom === "challenge"
      ? [1, Math.max(totalDays, lastDay)]
      : [Math.min(firstDay, lastDay), Math.max(lastDay, Math.min(firstDay, lastDay) + 1 / 24)];
  const span = xDomain[1] - xDomain[0];
  const hourly = span < hourlyUnder;

  const inRange = lines.flatMap((l) =>
    l.points.filter((p) => p.day >= xDomain[0] && p.day <= xDomain[1]).map((p) => p.value),
  );
  const lo = inRange.length ? Math.min(...inRange) : start;
  const hi = inRange.length ? Math.max(...inRange) : start;
  const pad = hi === lo ? Math.max(2, Math.abs(hi) * 0.1) : (hi - lo) * 0.15;
  const rawY: [number, number] =
    zoom === "challenge"
      ? [Math.max(0, Math.min(lo, start)), Math.max(hasGoal ? (goal as number) : hi, hi)]
      : [Math.max(0, lo - pad), hi + pad];
  // Round numbers on the axis.
  const yTicks = niceTicks(rawY[0], rawY[1]);
  const yDomain: [number, number] = [Math.max(0, yTicks[0] ?? rawY[0]), yTicks.at(-1) ?? rawY[1]];
  // Counts stay whole numbers when they're read between two points.
  const whole = lines.every((l) => l.points.every((p) => Number.isInteger(p.value)));
  const show1 = (v: number) => formatValue(whole ? Math.round(v) : v);

  // The steady pace: a straight line from the start on day 1 to the goal on the last day.
  const paceAt = (day: number) =>
    hasGoal
      ? totalDays > 1
        ? start + (((goal as number) - start) * (day - 1)) / (totalDays - 1)
        : (goal as number)
      : 0;

  // Rows: every data point's day, plus the range edges so the pace line spans the chart.
  const xs = [...new Set([...lines.flatMap((l) => l.points.map((p) => p.day)), xDomain[0], xDomain[1]])].sort(
    (a, b) => a - b,
  );
  const rows = xs.map((day) => {
    const row: Record<string, number | null> = { day };
    for (const l of lines) row[l.key] = l.points.find((p) => p.day === day)?.value ?? null;
    if (hasGoal) row.pace = paceAt(day);
    return row;
  });

  // Post dots, grouped per platform and time, sitting on the line they belong to.
  const postDots = new Map<string, { day: number; y: number; posts: ProgressPost[] }[]>();
  const visiblePosts = postsOn ? posts.filter((p) => p.day >= xDomain[0] && p.day <= xDomain[1]) : [];
  for (const p of visiblePosts) {
    const line = show === "platforms" ? lines.find((l) => l.key === p.platform) : lines[0];
    const y = line ? valueAt(line.points, p.day) : undefined;
    if (y === undefined) continue;
    const list = postDots.get(p.platform) ?? [];
    const same = list.find((d) => Math.abs(d.day - p.day) < 1e-6);
    if (same) same.posts.push(p);
    else list.push({ day: p.day, y, posts: [p] });
    postDots.set(p.platform, list);
  }

  const hourFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric" });
  const dayLabel = (d: number) => {
    if (!hourly) return `${labels.day} ${Math.floor(d + 1e-9)}`;
    const whole = Math.floor(d + 1e-9);
    const hour = Math.round((d - whole) * 24) % 24;
    return `${labels.day} ${whole}, ${hourFormat.format(new Date(2000, 0, 1, hour))}`;
  };
  const ticks = hourly
    ? (() => {
        const step = span <= 1 ? 0.25 : 0.5;
        const list: number[] = [];
        for (let t = Math.ceil(xDomain[0] / step) * step; t <= xDomain[1] + 1e-9; t += step) list.push(t);
        return list;
      })()
    : [
        ...new Set([
          Math.ceil(xDomain[0]),
          ...Array.from({ length: 5 }, (_, i) => Math.round(xDomain[0] + ((i + 1) * span) / 5)),
        ]),
      ].filter((t) => t >= xDomain[0] && t <= xDomain[1]);

  const config = Object.fromEntries([
    ...lines.map((l) => [l.key, { label: l.label, color: l.color }]),
    ["pace", { label: labels.pace, color: "var(--muted-foreground)" }],
  ]) satisfies ChartConfig;

  const nowDay = today ?? lastDay;
  const latest = valueAt(combined, nowDay);
  const pacePastTop = hasGoal && paceAt(nowDay) > yDomain[1];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <SegmentedControl
          label={labels.zoom}
          size="sm"
          value={zoom}
          onValueChange={setZoom}
          options={[
            { value: "progress", label: hasGoal ? labels.progress : labels.soFar },
            { value: "challenge", label: labels.challenge },
          ]}
        />
        {canSplit && (
          <SegmentedControl
            label={labels.show}
            size="sm"
            value={show}
            onValueChange={setShow}
            options={[
              { value: "combined", label: labels.combined },
              { value: "platforms", label: labels.platforms },
            ]}
          />
        )}
        {posts.length > 0 && (
          <div className="flex items-center gap-2">
            <Switch
              id={`${id}-posts`}
              checked={postsOn}
              onCheckedChange={setPostsOn}
              className="cursor-pointer data-disabled:cursor-not-allowed"
            />
            <Label htmlFor={`${id}-posts`} className="cursor-pointer font-normal text-sm">
              {labels.posts}
            </Label>
          </div>
        )}
      </div>

      <ChartContainer config={config} className={cn("aspect-auto h-80 w-full", chartClassName)}>
        <ComposedChart data={rows} margin={{ top: 12, right: 16, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            type="number"
            domain={xDomain}
            allowDataOverflow
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tickFormatter={dayLabel}
            minTickGap={16}
          />
          <YAxis
            type="number"
            domain={yDomain}
            ticks={yTicks.filter((t) => t >= yDomain[0])}
            allowDataOverflow
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v: number) => formatValue(v)}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, label }) => {
              if (!active || typeof label !== "number") return null;
              const near = (d: number) =>
                hourly ? Math.abs(d - label) <= 1 / 24 : Math.floor(d) === Math.floor(label);
              const posted = visiblePosts.filter((p) => near(p.day));
              return (
                <div className="grid w-max min-w-44 max-w-64 gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-lg">
                  <p className="font-medium">{dayLabel(label)}</p>
                  {lines.map((l) => {
                    const v = valueAt(l.points, label);
                    return v === undefined ? null : (
                      <p key={l.key} className="flex items-center justify-between gap-4">
                        <span className="flex min-w-0 items-center gap-1.5 text-foreground/70">
                          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: l.color }} />
                          <span className="truncate">{l.label}</span>
                        </span>
                        <span className="font-medium tabular-nums">{show1(v)}</span>
                      </p>
                    );
                  })}
                  {hasGoal && (
                    <p className="flex justify-between gap-4 text-foreground/70">
                      <span>{labels.pace}</span>
                      <span className="tabular-nums">{show1(paceAt(label))}</span>
                    </p>
                  )}
                  {posted.length > 0 && (
                    <div className="mt-1 border-t pt-1.5">
                      <p className="mb-1 text-foreground/70">{labels.postedThen}</p>
                      {posted.slice(0, 4).map((p) => (
                        <p key={p.id} className="flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className="size-2 shrink-0 rounded-full"
                            style={{ background: platformColor(p.platform) }}
                          />
                          <span className="line-clamp-2 [overflow-wrap:anywhere]">{p.label}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {milestones
            .filter((m) => m > yDomain[0] && m < yDomain[1])
            .map((m) => (
              <ReferenceLine
                key={m}
                y={m}
                stroke="var(--muted-foreground)"
                strokeOpacity={0.35}
                strokeDasharray="2 4"
                label={{
                  value: formatValue(m),
                  position: "insideTopLeft",
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
            ))}
          {today !== undefined && today >= xDomain[0] && today <= xDomain[1] && (
            <ReferenceLine
              x={today}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              label={{ value: labels.today, position: "insideTopRight", fontSize: 10, fill: "var(--muted-foreground)" }}
            />
          )}
          {hasGoal && (
            <Line
              dataKey="pace"
              type="linear"
              stroke="var(--color-pace)"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={false}
            />
          )}
          {lines.map((l) => (
            <Line
              key={l.key}
              dataKey={l.key}
              name={l.label}
              type="monotone"
              stroke={`var(--color-${l.key})`}
              strokeWidth={2.5}
              dot={l.points.length < 3 ? { r: 3 } : false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
          {[...postDots.entries()].map(([platform, dots]) => (
            <Scatter
              key={platform}
              name={`${SOCIAL_ICONS[platform as SocialPlatform].name} ${labels.posts}`}
              data={dots}
              dataKey="y"
              fill={platformColor(platform as SocialPlatform)}
              isAnimationActive={false}
              shape={(props: { cx?: number; cy?: number; payload?: { posts: ProgressPost[] } }) => {
                const first = props.payload?.posts[0];
                const dot = (
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5.5}
                    fill={platformColor(platform as SocialPlatform)}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                );
                if (!onSelectPost || !first) return dot;
                const open = () => onSelectPost(first);
                return (
                  // biome-ignore lint/a11y/useSemanticElements: an SVG mark can't be a <button>; role and keys make it one.
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={labels.openPost
                      .replace("{platform}", SOCIAL_ICONS[platform as SocialPlatform].name)
                      .replace("{label}", first.label)}
                    className="cursor-pointer outline-none [&:focus-visible_circle]:stroke-ring [&:focus-visible_circle]:stroke-[3]"
                    onClick={open}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        open();
                      }
                    }}
                  >
                    {dot}
                  </g>
                );
              }}
            />
          ))}
        </ComposedChart>
      </ChartContainer>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-foreground/75 text-xs">
        {show === "platforms" &&
          lines.map((l) => (
            <span key={l.key} className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        {hasGoal && (
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="w-4 border-foreground/50 border-t-2 border-dashed" />
            {labels.pace}
          </span>
        )}
        {postsOn &&
          [...new Set(visiblePosts.map((p) => p.platform))].map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: platformColor(p) }} />
              {labels.postKey.replace("{platform}", SOCIAL_ICONS[p].name)}
            </span>
          ))}
        {/* Today's pace in words, especially when the pace line runs off the top of the zoomed chart. */}
        {hasGoal && (
          <span className={cn("ml-auto tabular-nums", pacePastTop && "font-medium text-foreground")}>
            {labels.paceToday.replace("{value}", show1(paceAt(nowDay)))}
            {latest !== undefined && ` · ${labels.youToday.replace("{value}", show1(latest))}`}
          </span>
        )}
      </div>
    </div>
  );
}
