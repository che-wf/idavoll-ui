"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/idavoll/animated-number";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  /** What the number is, e.g. "Followers". */
  label: string;
  /** The current value. */
  value: number;
  /** How to show the value. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /** Change as a fraction: 0.12 means up 12%, -0.05 means down 5%. */
  change?: number;
  /** What the change is compared with, e.g. "vs last week". */
  changeLabel?: string;
  /** Small text under the value. */
  hint?: ReactNode;
  /** Optional icon shown next to the label. */
  icon?: ReactNode;
  /** Count up from zero when the card first appears. Changes always animate. Defaults to false. */
  countUp?: boolean;
  /** Extra classes for inner parts: value (the big number), label. */
  classNames?: { value?: string; label?: string };
  className?: string;
}

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });

/** One headline number with an optional up/down change. */
export function StatCard({
  label,
  value,
  formatValue = (v) => compact.format(v),
  change,
  changeLabel,
  hint,
  icon,
  countUp = false,
  classNames,
  className,
}: StatCardProps) {
  const direction = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  const ChangeIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <Card className={cn("gap-2", className)}>
      <CardHeader>
        <CardDescription className={cn("flex items-center gap-2", classNames?.label)}>
          {icon}
          {label}
        </CardDescription>
        <CardTitle className={cn("font-heading text-3xl", classNames?.value)}>
          <AnimatedNumber value={value} formatValue={formatValue} from={countUp ? 0 : undefined} highlightChange />
        </CardTitle>
      </CardHeader>
      {(direction || hint) && (
        <CardContent className="space-y-1 text-sm">
          {direction && change !== undefined && (
            <p
              className={cn(
                "flex items-center gap-1 font-medium",
                direction === "up" && "text-emerald-700 dark:text-emerald-400",
                direction === "down" && "text-red-700 dark:text-red-400",
                direction === "flat" && "text-muted-foreground",
              )}
            >
              <ChangeIcon aria-hidden className="size-4" />
              <span className="sr-only">{direction === "up" ? "Up" : direction === "down" ? "Down" : "No change"}</span>
              {percent.format(Math.abs(change))}
              {changeLabel && <span className="font-normal text-muted-foreground">{changeLabel}</span>}
            </p>
          )}
          {hint && <p className="text-muted-foreground">{hint}</p>}
        </CardContent>
      )}
    </Card>
  );
}
