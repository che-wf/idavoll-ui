"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";
import type { CSSProperties } from "react";
import { AnimatedNumber, formatCompact } from "@/components/idavoll/animated-number";
import {
  ChallengeChart,
  type ChallengeChartStyle,
  type ChallengeMilestone,
  type ChallengePoint,
} from "@/components/idavoll/challenge-chart";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Metric {
  /** Unique id, used to pick the tab. */
  id: string;
  /** Tab name, e.g. "Views". */
  label: string;
  /** Headline number on the tab. Animates when it changes. */
  value: number;
  /** Change as a fraction: 0.12 means up 12%, -0.05 means down 5%. */
  change?: number;
  /** Daily values for the chart. */
  data: ChallengePoint[];
  /** Value to reach by the last day; draws the dashed "on pace" line. */
  goal: number;
  /** Milestones for this metric's chart. */
  milestones?: ChallengeMilestone[];
  /** How to show numbers. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /** Line color for this metric's chart and its tab marker. Defaults to `chart.color` or var(--primary). */
  color?: string;
}

/** Extra classes for the parts inside MetricTabs. */
export interface MetricTabsClassNames {
  /** The row of tabs. */
  list?: string;
  /** Each tab. */
  tab?: string;
  /** The number on each tab. */
  value?: string;
  /** The area around the chart. */
  content?: string;
}

export interface MetricTabsProps {
  /** The metrics to switch between, in tab order. */
  metrics: Metric[];
  /** The selected metric id, when you control it yourself. */
  value?: string;
  /** Called with the metric id when the viewer picks a tab. */
  onValueChange?: (id: string) => void;
  /** The metric shown first when you don't control `value`. Defaults to the first one. */
  defaultValue?: string;
  /** Length of the challenge in days. Defaults to 90. */
  totalDays?: number;
  /** Today's challenge day; draws a "Today" marker. */
  today?: number;
  /** Text after the change, e.g. "vs last week". */
  changeLabel?: string;
  /** Name for the group of tabs, read by screen readers. Defaults to "Metrics". */
  label?: string;
  /** Chart look: color, paceColor, strokeWidth, curve, showGrid, showPace, className (e.g. "h-96"). */
  chart?: ChallengeChartStyle;
  /** Extra classes for inner parts: list, tab, value, content. */
  classNames?: MetricTabsClassNames;
  className?: string;
}

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });

function Change({ change, changeLabel }: { change: number; changeLabel?: string }) {
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 font-medium text-xs",
        direction === "up" && "text-emerald-700 dark:text-emerald-400",
        direction === "down" && "text-red-700 dark:text-red-400",
        direction === "flat" && "text-muted-foreground",
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      <span className="sr-only">{direction === "up" ? "Up" : direction === "down" ? "Down" : "No change"}</span>
      {percent.format(Math.abs(change))}
      {changeLabel && <span className="sr-only"> {changeLabel}</span>}
    </span>
  );
}

/** A row of clickable metric cards (views, followers, watch time…) that switch the challenge chart below them. */
export function MetricTabs({
  metrics,
  value,
  onValueChange,
  defaultValue,
  totalDays = 90,
  today,
  changeLabel,
  label = "Metrics",
  chart,
  classNames,
  className,
}: MetricTabsProps) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <TabsPrimitive.Root value={value} onValueChange={onValueChange} defaultValue={defaultValue ?? metrics[0]?.id}>
        <TabsPrimitive.List
          aria-label={label}
          className={cn("grid auto-cols-[minmax(9rem,1fr)] grid-flow-col overflow-x-auto border-b", classNames?.list)}
        >
          {metrics.map((m) => (
            <TabsPrimitive.Trigger
              key={m.id}
              value={m.id}
              className={cn(
                "relative flex flex-col items-start gap-1 border-r px-5 py-4 text-left outline-none transition-colors last:border-r-0",
                "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                "after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:bg-(--tab-accent,var(--primary)) after:opacity-0 after:transition-opacity",
                "data-[state=active]:bg-muted/60 data-[state=active]:after:opacity-100",
                classNames?.tab,
              )}
              style={m.color ? ({ "--tab-accent": m.color } as CSSProperties) : undefined}
            >
              <span className="text-muted-foreground text-sm">{m.label}</span>
              <AnimatedNumber
                value={m.value}
                from={0}
                formatValue={m.formatValue ?? formatCompact}
                className={cn("font-heading text-2xl font-bold tracking-tight", classNames?.value)}
                highlightChange
              />
              {m.change !== undefined && <Change change={m.change} changeLabel={changeLabel} />}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {metrics.map((m) => (
          <TabsPrimitive.Content key={m.id} value={m.id} className={cn("p-4 outline-none", classNames?.content)}>
            <ChallengeChart
              data={m.data}
              goal={m.goal}
              totalDays={totalDays}
              today={today}
              milestones={m.milestones}
              valueLabel={m.label}
              formatValue={m.formatValue}
              {...chart}
              color={m.color ?? chart?.color}
            />
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    </Card>
  );
}
