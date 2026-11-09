"use client";

import { CalendarDays } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  placeholder: "e.g. Nov 9, 2026",
  choose: "Choose date",
  invalid: "Enter a date like Nov 9, 2026 or 2026-11-09.",
  /** {date} becomes the earliest allowed date. */
  tooEarly: "Pick {date} or later.",
  /** {date} becomes the latest allowed date. */
  tooLate: "Pick {date} or earlier.",
};

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (key: string) => {
  const [y = 1970, m = 1, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Reads a typed date: "2026-11-09", "11/9/2026", "Nov 9, 2026", "9 November 2026". Returns "YYYY-MM-DD" or null. */
export function parseTypedDate(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return d.getMonth() === Number(iso[2]) - 1 ? toKey(d) : null;
  }
  const slash = t.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (slash) {
    // Month first, as US dates are written.
    const d = new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2]));
    return d.getMonth() === Number(slash[1]) - 1 ? toKey(d) : null;
  }
  const parsed = new Date(t);
  return /[a-z]/i.test(t) && !Number.isNaN(parsed.getTime()) ? toKey(parsed) : null;
}

export interface DateFieldProps {
  /** The date as "YYYY-MM-DD", or "" for none. Dates are plain days; the app does any time-zone math. */
  value: string;
  /** Called with "YYYY-MM-DD", or "" when cleared. */
  onChange: (value: string) => void;
  /** Field label. */
  label?: ReactNode;
  /** One line under the field. */
  hint?: ReactNode;
  /** Earliest allowed date, "YYYY-MM-DD". */
  min?: string;
  /** Latest allowed date, "YYYY-MM-DD". */
  max?: string;
  /** Marks the field required. */
  required?: boolean;
  /** Locale for showing the date. Defaults to the browser's. */
  locale?: string;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  id?: string;
  className?: string;
}

/**
 * A date you can type ("Nov 9, 2026" or "2026-11-09") or pick from a calendar. Values go in
 * and out as "YYYY-MM-DD" strings. Dates outside min and max are greyed out in the calendar,
 * and typed ones get an error message.
 */
export function DateField({
  value,
  onChange,
  label,
  hint,
  min,
  max,
  required,
  locale,
  labels: labelOverrides,
  id: idProp,
  className,
}: DateFieldProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const autoId = useId();
  const id = idProp ?? autoId;
  const format = (key: string) =>
    key
      ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(fromKey(key))
      : "";
  const [text, setText] = useState(format(value));
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState(false);

  // Show outside changes to the value.
  // biome-ignore lint/correctness/useExhaustiveDependencies: format only depends on locale.
  useEffect(() => {
    setText(format(value));
    setError(undefined);
  }, [value, locale]);

  const commit = (key: string | null) => {
    if (key === null) {
      setError(labels.invalid);
      return;
    }
    if (min && key < min) return setError(labels.tooEarly.replace("{date}", format(min)));
    if (max && key > max) return setError(labels.tooLate.replace("{date}", format(max)));
    setError(undefined);
    setText(format(key));
    if (key !== value) onChange(key);
  };

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex gap-2">
        <Input
          id={id}
          value={text}
          required={required}
          placeholder={labels.placeholder}
          autoComplete="off"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (!text.trim()) {
              setError(undefined);
              if (value) onChange("");
              return;
            }
            commit(parseTypedDate(text));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(parseTypedDate(text));
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label={labels.choose} className="shrink-0">
              <CalendarDays aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value ? fromKey(value) : undefined}
              defaultMonth={value ? fromKey(value) : min ? fromKey(min) : undefined}
              disabled={[...(min ? [{ before: fromKey(min) }] : []), ...(max ? [{ after: fromKey(max) }] : [])]}
              onSelect={(day) => {
                if (!day) return;
                commit(toKey(day));
                setOpen(false);
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-foreground/70 text-xs">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
