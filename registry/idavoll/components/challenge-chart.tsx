import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export interface ChallengePoint {
  /** Challenge day, starting at 1. */
  day: number;
  /** The measured value on that day. */
  value: number;
}

export interface ChallengeMilestone {
  day: number;
  label: string;
}

export interface ChallengeChartProps {
  /** Measured values so far. Days without a value are left as gaps. */
  data: ChallengePoint[];
  /** Value to reach by the last day. Draws the dashed "on pace" line. */
  goal: number;
  /** Length of the challenge in days. Defaults to 90. */
  totalDays?: number;
  /** Value on day 1. Defaults to the first data point, or 0. */
  startValue?: number;
  /** Today's challenge day; draws a "Today" marker. */
  today?: number;
  /** Milestones drawn as labeled vertical lines. */
  milestones?: ChallengeMilestone[];
  /** Name of the measured value, shown in the tooltip. Defaults to "Progress". */
  valueLabel?: string;
  /** How to show numbers on the axis and tooltip. Defaults to compact (12.4K). */
  formatValue?: (value: number) => string;
  className?: string;
}

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** The 90-day challenge graph: actual progress against a straight line to the goal. */
export function ChallengeChart({
  data,
  goal,
  totalDays = 90,
  startValue,
  today,
  milestones = [],
  valueLabel = "Progress",
  formatValue = (v) => compact.format(v),
  className,
}: ChallengeChartProps) {
  const start = startValue ?? data[0]?.value ?? 0;
  const byDay = new Map(data.map((p) => [p.day, p.value]));
  const rows = Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    return {
      day,
      actual: byDay.get(day) ?? null,
      pace: totalDays > 1 ? start + ((goal - start) * (day - 1)) / (totalDays - 1) : goal,
    };
  });

  const config = {
    actual: { label: valueLabel, color: "var(--primary)" },
    pace: { label: "On pace", color: "var(--muted-foreground)" },
  } satisfies ChartConfig;

  const ticks = [1, ...Array.from({ length: Math.floor(totalDays / 15) }, (_, i) => (i + 1) * 15)].filter(
    (t) => t <= totalDays,
  );

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-72 w-full", className)}>
      <LineChart data={rows} margin={{ top: 16, right: 16, bottom: 0, left: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          type="number"
          domain={[1, totalDays]}
          ticks={ticks}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d: number) => `Day ${d}`}
        />
        <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => formatValue(v)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => `Day ${payload?.[0]?.payload?.day ?? ""}`}
              formatter={(value, name) => (
                <div className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? name}</span>
                  <span className="font-mono tabular-nums">{formatValue(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        {milestones.map((m) => (
          <ReferenceLine
            key={`${m.day}-${m.label}`}
            x={m.day}
            stroke="var(--border)"
            label={{ value: m.label, position: "insideTopLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
          />
        ))}
        {today !== undefined && (
          <ReferenceLine
            x={today}
            stroke="var(--foreground)"
            strokeDasharray="2 2"
            label={{ value: "Today", position: "top", fontSize: 11, fill: "var(--foreground)" }}
          />
        )}
        <Line
          dataKey="pace"
          stroke="var(--color-pace)"
          strokeDasharray="6 4"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line dataKey="actual" stroke="var(--color-actual)" strokeWidth={2.5} dot={false} connectNulls={false} />
      </LineChart>
    </ChartContainer>
  );
}
