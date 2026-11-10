// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Plus, Sparkles, X } from "lucide-react";
import { useId } from "react";
import { formatCompact } from "@/components/idavoll/animated-number";
import { DateField } from "@/components/idavoll/date-field";
import { suggestMilestones } from "@/components/idavoll/milestones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export { suggestMilestones };

const DEFAULT_LABELS = {
  title: "Milestones",
  suggest: "Suggest milestones",
  add: "Add milestone",
  value: "Target",
  date: "By (optional)",
  label: "Name (optional)",
  labelPlaceholder: "e.g. Halfway",
  remove: "Remove milestone",
  /** {min} and {max} are replaced with the start and goal. */
  outOfRange: "Pick a number between {min} and {max}.",
  duplicate: "This milestone is already in the list.",
  empty: "No milestones yet. Suggest some, or add your own.",
  preview: "Milestones between start and goal",
};

export interface MilestoneEntry {
  /** The target number, e.g. 5000. */
  value: number;
  /** Optional target date, "YYYY-MM-DD". */
  date?: string;
  /** Optional name, e.g. "Halfway". */
  label?: string;
}

export interface MilestoneEditorProps {
  /** Starting value, e.g. followers on day 1. */
  start: number;
  /** The 90-day goal. */
  goal: number;
  /** The milestones. */
  value: MilestoneEntry[];
  /** Called with the new list, sorted by value once a number is finished. A new row's value is NaN until a number is typed. */
  onChange: (value: MilestoneEntry[]) => void;
  /** What's counted, e.g. "followers". */
  metricLabel?: string;
  /** How to show numbers. Defaults to full numbers like 12,000. */
  formatValue?: (value: number) => string;
  /** Show a number line from start to goal with each milestone. Defaults to true. */
  showPreview?: boolean;
  /** Earliest and latest allowed target dates, "YYYY-MM-DD". */
  minDate?: string;
  maxDate?: string;
  /** Most milestones "Suggest" fills in. Defaults to 6. */
  maxSuggestions?: number;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

const full = new Intl.NumberFormat();

/**
 * Set milestones between the start value and the goal. "Suggest milestones" fills in round
 * numbers (steps of 1, 2.5 or 5 times a power of ten, at most 6). Each milestone has a
 * target, an optional date and an optional name. Numbers outside the range or repeated are
 * flagged inline, and the list sorts itself when a number is finished.
 */
export function MilestoneEditor({
  start,
  goal,
  value,
  onChange,
  metricLabel = "",
  formatValue = full.format,
  showPreview = true,
  minDate,
  maxDate,
  maxSuggestions = 6,
  labels: labelOverrides,
  className,
}: MilestoneEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const low = Math.min(start, goal);
  const high = Math.max(start, goal);

  const problem = (m: MilestoneEntry, i: number) => {
    // A new row stays quiet until a number is typed.
    if (Number.isNaN(m.value)) return undefined;
    if (!Number.isFinite(m.value) || m.value <= low || m.value >= high) {
      return labels.outOfRange.replace("{min}", formatValue(low)).replace("{max}", formatValue(high));
    }
    if (value.findIndex((o) => o.value === m.value) !== i) return labels.duplicate;
    return undefined;
  };
  // Empty rows (NaN) stay at the end.
  const sortList = (list: MilestoneEntry[]) =>
    [...list].sort((a, b) =>
      Number.isNaN(a.value) ? 1 : Number.isNaN(b.value) ? -1 : start <= goal ? a.value - b.value : b.value - a.value,
    );
  const update = (i: number, patch: Partial<MilestoneEntry>) =>
    onChange(value.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  const valid = value.filter((m, i) => !Number.isNaN(m.value) && !problem(m, i));

  return (
    <div className={cn("@container space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <span className="font-semibold tabular-nums">{formatValue(start)}</span>
          <span aria-hidden> → </span>
          <span className="sr-only"> to </span>
          <span className="font-semibold tabular-nums">{formatValue(goal)}</span>
          {metricLabel && <span className="text-foreground/70"> {metricLabel}</span>}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(suggestMilestones(start, goal, maxSuggestions).map((v) => ({ value: v })))}
        >
          <Sparkles aria-hidden />
          {labels.suggest}
        </Button>
      </div>

      {showPreview && high > low && (
        <div aria-hidden className="px-2 pt-1 pb-6">
          <div className="relative h-2 rounded-full bg-muted">
            {valid.map((m, i) => {
              const at = ((m.value - start) / (goal - start)) * 100;
              // Skip a label that would collide with a neighbour or the ends; the dot still shows.
              const near = (x: number) => Math.abs(x - at) < 8;
              const prev = valid[i - 1];
              const crowded =
                near(0) || near(100) || (prev !== undefined && near(((prev.value - start) / (goal - start)) * 100));
              return (
                <span
                  key={m.value}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${at}%` }}
                >
                  <span className="block size-3 rounded-full border-2 border-background bg-primary" />
                  {!crowded && (
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] text-foreground/70 tabular-nums">
                      {formatCompact(m.value)}
                    </span>
                  )}
                </span>
              );
            })}
            <span className="absolute top-4 left-0 -translate-x-1/2 text-[0.65rem] text-foreground/70">
              {formatCompact(start)}
            </span>
            <span className="absolute top-4 right-0 translate-x-1/2 font-semibold text-[0.65rem]">
              {formatCompact(goal)}
            </span>
          </div>
        </div>
      )}

      <fieldset className="space-y-3">
        <legend className="sr-only">{labels.title}</legend>
        {value.length === 0 && <p className="text-foreground/70 text-sm">{labels.empty}</p>}
        <ol className="space-y-3">
          {value.map((m, i) => {
            const error = problem(m, i);
            const rowId = `${id}-${i}`;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are edited in place; values can repeat while typing.
              <li key={i} className="rounded-xl border p-3">
                <div className="grid items-start gap-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                  <div className="space-y-1.5">
                    <Label htmlFor={`${rowId}-value`}>
                      {labels.value} {i + 1}
                    </Label>
                    <Input
                      id={`${rowId}-value`}
                      type="number"
                      inputMode="numeric"
                      value={Number.isFinite(m.value) ? m.value : ""}
                      onChange={(e) =>
                        update(i, { value: e.target.value === "" ? Number.NaN : Number(e.target.value) })
                      }
                      onBlur={() => onChange(sortList(value))}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? `${rowId}-error` : undefined}
                      className="tabular-nums"
                    />
                  </div>
                  <DateField
                    id={`${rowId}-date`}
                    label={labels.date}
                    value={m.date ?? ""}
                    onChange={(date) => update(i, { date: date || undefined })}
                    min={minDate}
                    max={maxDate}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`${rowId}-label`}>{labels.label}</Label>
                    <Input
                      id={`${rowId}-label`}
                      value={m.label ?? ""}
                      placeholder={labels.labelPlaceholder}
                      onChange={(e) => update(i, { label: e.target.value || undefined })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="@lg:mt-6"
                    aria-label={`${labels.remove} ${i + 1}`}
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
                {error && (
                  <p id={`${rowId}-error`} className="mt-2 text-destructive text-sm">
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onChange([...value, { value: Number.NaN }]);
            // Focus the new row's number after it renders.
            requestAnimationFrame(() => document.getElementById(`${id}-${value.length}-value`)?.focus());
          }}
        >
          <Plus aria-hidden />
          {labels.add}
        </Button>
      </fieldset>
    </div>
  );
}
