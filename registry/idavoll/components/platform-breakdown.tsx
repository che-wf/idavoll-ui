"use client";

import { Cell, Pie, PieChart } from "recharts";
import { AnimatedNumber, formatCompact } from "@/components/idavoll/animated-number";
import { platformColor, SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface PlatformShare {
  /** Which platform. */
  platform: SocialPlatform;
  /** That platform's number, e.g. followers. */
  value: number;
  /** Name to show instead of the platform name. */
  label?: string;
  /** Slice color. Defaults to the platform's brand color. */
  color?: string;
}

export interface PlatformBreakdownProps {
  /** One entry per platform. */
  platforms: PlatformShare[];
  /** "donut" shows a ring with the total in the middle; "bar" shows one stacked bar. Defaults to "donut". */
  variant?: "donut" | "bar";
  /** What the numbers are, shown under the total. Defaults to "Followers". */
  valueLabel?: string;
  /** How to show numbers. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /** Ring thickness as a fraction of its radius, 0.1 to 0.9. Defaults to 0.28. */
  thickness?: number;
  /** Classes for the donut, e.g. "size-56". Defaults to size-44. */
  chartClassName?: string;
  className?: string;
}

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 0 });

/** Where the audience is: each platform's share of the total, as a donut or a stacked bar, with a list. */
export function PlatformBreakdown({
  platforms,
  variant = "donut",
  valueLabel = "Followers",
  formatValue = formatCompact,
  thickness = 0.28,
  chartClassName,
  className,
}: PlatformBreakdownProps) {
  const total = platforms.reduce((sum, p) => sum + Math.max(0, p.value), 0);
  const slices = [...platforms]
    .sort((a, b) => b.value - a.value)
    .map((p) => ({
      ...p,
      name: p.label ?? SOCIAL_ICONS[p.platform].name,
      fill: p.color ?? platformColor(p.platform),
      share: total > 0 ? Math.max(0, p.value) / total : 0,
    }));
  // Platforms that share a color (e.g. black brands) get lighter shades so they stay apart.
  const colorUses = new Map<string, number>();
  const shades = slices.map((s) => {
    const use = colorUses.get(s.fill) ?? 0;
    colorUses.set(s.fill, use + 1);
    return [1, 0.55, 0.3][use % 3] ?? 1;
  });
  const config = Object.fromEntries(slices.map((s) => [s.platform, { label: s.name, color: s.fill }])) as ChartConfig;
  const inner = Math.round(100 * (1 - Math.min(0.9, Math.max(0.1, thickness))));

  const list = (
    <ul className="flex-1 space-y-2.5 text-sm">
      {slices.map((s) => (
        <li key={s.platform} className="flex items-center gap-2">
          <SocialIcon platform={s.platform} variant="tile" label="" className="size-6" />
          <span className="flex-1 font-medium">{s.name}</span>
          <AnimatedNumber value={s.value} formatValue={formatValue} className="text-muted-foreground" />
          <span className="w-10 text-right font-semibold tabular-nums">{percent.format(s.share)}</span>
        </li>
      ))}
    </ul>
  );

  if (variant === "bar") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber value={total} formatValue={formatValue} className="font-heading text-3xl font-bold" />
          <span className="text-muted-foreground text-sm">{valueLabel}</span>
        </div>
        <div aria-hidden className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
          {slices.map((s, i) => (
            <div
              key={s.platform}
              className="h-full transition-[flex-grow] duration-700 first:rounded-l-full last:rounded-r-full"
              style={{ flexGrow: s.share, background: s.fill, opacity: shades[i] }}
            />
          ))}
        </div>
        {list}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row", className)}>
      <div className={cn("relative size-44 shrink-0", chartClassName)}>
        <ChartContainer config={config} className="aspect-square size-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">{config[name as string]?.label ?? name}</span>
                      <span className="font-mono tabular-nums">{formatValue(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="platform"
              innerRadius={`${inner}%`}
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              strokeWidth={0}
            >
              {slices.map((s, i) => (
                <Cell key={s.platform} fill={s.fill} fillOpacity={shades[i]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={total} formatValue={formatValue} className="font-heading text-2xl font-bold" />
          <span className="text-muted-foreground text-xs">{valueLabel}</span>
        </div>
      </div>
      {list}
    </div>
  );
}
