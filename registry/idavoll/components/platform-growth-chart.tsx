"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { formatCompact } from "@/components/idavoll/animated-number";
import { platformColor, SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface PlatformSeries {
  /** Which platform. */
  platform: SocialPlatform;
  /** Follower count (or any value) by challenge day. */
  data: { day: number; value: number }[];
  /** Name to show instead of the platform name. */
  label?: string;
  /** Line color. Defaults to the platform's brand color. */
  color?: string;
}

export type GrowthMode = "total" | "growth";

export interface PlatformGrowthChartProps {
  /** One entry per platform. */
  platforms: PlatformSeries[];
  /**
   * "total" plots raw numbers. "growth" plots % change since each platform's first day,
   * which compares big and small platforms fairly. Leave unset to let the viewer switch.
   */
  mode?: GrowthMode;
  /** Starting mode when you don't control `mode`. Defaults to "growth". */
  defaultMode?: GrowthMode;
  /** Called when the viewer switches mode. */
  onModeChange?: (mode: GrowthMode) => void;
  /** Show the Total / % growth switch. Defaults to true. */
  showModeSwitch?: boolean;
  /** Show the platform legend; clicking a platform hides or shows its line. Defaults to true. */
  showLegend?: boolean;
  /** Length of the challenge in days. Defaults to 90. */
  totalDays?: number;
  /** Today's challenge day; draws a "Today" marker. */
  today?: number;
  /** Name of the value in "total" mode, for the tooltip. Defaults to "Followers". */
  valueLabel?: string;
  /** How to show numbers in "total" mode. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /** Line thickness in pixels. Defaults to 2.5. */
  strokeWidth?: number;
  /** Line shape. Defaults to "monotone" (smooth). */
  curve?: "monotone" | "linear" | "step";
  /** Show horizontal grid lines. Defaults to true. */
  showGrid?: boolean;
  /** Classes for the chart area, e.g. "h-96". Defaults to h-72. */
  chartClassName?: string;
  className?: string;
}

const percent = new Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

// Platforms that share a color (e.g. black brands) get different dash patterns.
const DASHES = [undefined, "6 3", "2 3", "10 3 2 3"];

/** Compares platforms over the challenge: one line per platform, as totals or % growth. */
export function PlatformGrowthChart({
  platforms,
  mode: modeProp,
  defaultMode = "growth",
  onModeChange,
  showModeSwitch = true,
  showLegend = true,
  totalDays = 90,
  today,
  valueLabel = "Followers",
  formatValue = formatCompact,
  strokeWidth = 2.5,
  curve = "monotone",
  showGrid = true,
  chartClassName,
  className,
}: PlatformGrowthChartProps) {
  const [modeState, setModeState] = useState<GrowthMode>(defaultMode);
  const mode = modeProp ?? modeState;
  const setMode = (next: GrowthMode) => {
    setModeState(next);
    onModeChange?.(next);
  };
  const [hidden, setHidden] = useState<Set<SocialPlatform>>(new Set());
  const toggle = (p: SocialPlatform) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const colorUses = new Map<string, number>();
  const lines = platforms.map((s) => {
    const color = s.color ?? platformColor(s.platform);
    const use = colorUses.get(color) ?? 0;
    colorUses.set(color, use + 1);
    const sorted = [...s.data].sort((a, b) => a.day - b.day);
    return {
      ...s,
      color,
      dash: DASHES[use % DASHES.length],
      name: s.label ?? SOCIAL_ICONS[s.platform].name,
      start: sorted[0]?.value ?? 0,
      byDay: new Map(sorted.map((p) => [p.day, p.value])),
    };
  });

  const rows = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const row: Record<string, number | null> = { day };
    for (const line of lines) {
      const v = line.byDay.get(day);
      row[line.platform] =
        v === undefined ? null : mode === "growth" ? (line.start > 0 ? (v - line.start) / line.start : 0) : v;
    }
    return row;
  });

  const config = Object.fromEntries(lines.map((l) => [l.platform, { label: l.name, color: l.color }])) as ChartConfig;
  const show = (v: number) => (mode === "growth" ? percent.format(v) : formatValue(v));
  const ticks = [1, ...Array.from({ length: Math.floor(totalDays / 15) }, (_, i) => (i + 1) * 15)].filter(
    (t) => t <= totalDays,
  );

  return (
    <div className={cn("space-y-3", className)}>
      {(showModeSwitch || showLegend) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showLegend ? (
            <ul className="flex flex-wrap gap-1.5">
              {lines.map((l) => {
                const off = hidden.has(l.platform);
                return (
                  <li key={l.platform}>
                    <button
                      type="button"
                      aria-pressed={!off}
                      onClick={() => toggle(l.platform)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-0.5 text-xs transition-opacity hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring",
                        off && "opacity-40",
                      )}
                    >
                      <SocialIcon platform={l.platform} variant="tile" label="" className="size-5 rounded-full" />
                      {l.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <span />
          )}
          {showModeSwitch && modeProp === undefined && (
            <fieldset className="inline-flex rounded-lg border-0 bg-muted p-0.5 text-xs">
              <legend className="sr-only">Chart values</legend>
              {(["total", "growth"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium text-foreground/70 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    mode === m && "bg-background text-foreground shadow-xs",
                  )}
                >
                  {m === "total" ? "Total" : "% growth"}
                </button>
              ))}
            </fieldset>
          )}
        </div>
      )}
      <ChartContainer config={config} className={cn("aspect-auto h-72 w-full", chartClassName)}>
        <LineChart data={rows} margin={{ top: 16, right: 16, bottom: 0, left: 0 }} accessibilityLayer>
          {showGrid && <CartesianGrid vertical={false} />}
          <XAxis
            dataKey="day"
            type="number"
            domain={[1, totalDays]}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            tickFormatter={(d: number) => `Day ${d}`}
          />
          <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(v: number) => show(v)} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => `Day ${payload?.[0]?.payload?.day ?? ""}`}
                formatter={(value, name, item) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span aria-hidden className="size-2 rounded-full" style={{ background: item.color }} />
                      {config[name as string]?.label ?? name}
                    </span>
                    <span className="font-mono tabular-nums">{show(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          {mode === "growth" && <ReferenceLine y={0} stroke="var(--border)" />}
          {today !== undefined && (
            <ReferenceLine
              x={today}
              stroke="var(--foreground)"
              strokeDasharray="2 2"
              label={{ value: "Today", position: "top", fontSize: 11, fill: "var(--foreground)" }}
            />
          )}
          {lines.map((l) => (
            <Line
              key={l.platform}
              type={curve}
              dataKey={l.platform}
              name={l.platform}
              stroke={`var(--color-${l.platform})`}
              strokeWidth={strokeWidth}
              strokeDasharray={l.dash}
              dot={false}
              hide={hidden.has(l.platform)}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
      <p className="sr-only">
        {valueLabel} by platform.{" "}
        {lines
          .map((l) => {
            const last = [...l.byDay.entries()].at(-1)?.[1] ?? 0;
            const growth = l.start > 0 ? (last - l.start) / l.start : 0;
            return `${l.name}: ${formatValue(last)}, ${percent.format(growth)} since day 1.`;
          })
          .join(" ")}
      </p>
    </div>
  );
}
