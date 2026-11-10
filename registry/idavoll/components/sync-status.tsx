// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { CircleAlert, CircleCheck, CircleDashed, Clock, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  syncing: "Syncing…",
  /** {done} and {total} are replaced with numbers. */
  progress: "{done} of {total} posts",
  /** {time} becomes "5 minutes ago". */
  lastSynced: "Last synced {time}",
  never: "Not synced yet",
  upToDate: "Up to date",
  justNow: "just now",
  /** {time} becomes a time like "6:00 AM". */
  nextSync: "Next sync {time}",
  error: "Sync failed",
  list: "Sync status",
};

export type SyncState = "syncing" | "ok" | "stale" | "error" | "never";

export interface SyncItem {
  /** Which platform. */
  platform: SocialPlatform;
  /** Where the sync is: "syncing", "ok", "stale" (overdue), "error" or "never". */
  state: SyncState;
  /** When the last successful sync finished. */
  lastSyncedAt?: Date | string;
  /** When the next sync is due. */
  nextSyncAt?: Date | string;
  /** How far a running sync has got. */
  progress?: { done: number; total: number };
  /** Error text, e.g. "Login expired". Shown in the error state. */
  message?: string;
  /**
   * A button for the error state, e.g. { label: "Reconnect", onClick }. In the compact
   * variant the platform's icon becomes that button.
   */
  action?: { label: string; onClick: () => void };
}

export interface SyncStatusProps {
  /** One row per platform. */
  items: SyncItem[];
  /** "list" shows full rows; "compact" shows icons with a status mark, for a header. Defaults to "list". */
  variant?: "list" | "compact";
  /** The time to measure "5 minutes ago" from. Defaults to now, updated every minute. */
  now?: Date;
  /** Announce changes to screen readers. Turn off on a second view of the same data. Defaults to true. */
  announce?: boolean;
  /** Locale for times. Defaults to the browser's. */
  locale?: string;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

const STATE_STYLE: Record<SyncState, { icon: typeof Clock; className: string }> = {
  syncing: { icon: Loader2, className: "text-foreground/70" },
  ok: { icon: CircleCheck, className: "text-emerald-700 dark:text-emerald-400" },
  stale: { icon: Clock, className: "text-amber-700 dark:text-amber-400" },
  error: { icon: CircleAlert, className: "text-red-700 dark:text-red-400" },
  never: { icon: CircleDashed, className: "text-foreground/70" },
};

/** A valid Date, or undefined for missing or unreadable values (a bad date from an API shouldn't crash the page). */
const toDate = (d: Date | string | undefined) => {
  if (d === undefined) return undefined;
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

function relative(from: Date, now: Date, locale: string | undefined, justNow: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const seconds = (from.getTime() - now.getTime()) / 1000;
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return justNow;
}

/** Re-renders every minute so "5 minutes ago" stays true. */
function useNow(fixed?: Date) {
  const [now, setNow] = useState(() => fixed ?? new Date());
  useEffect(() => {
    if (fixed) {
      setNow(fixed);
      return;
    }
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [fixed]);
  return now;
}

/**
 * Sync health per platform: syncing, up to date, overdue, failed or never synced. Every
 * state has words and an icon, not just a color. Changes are announced politely; a new
 * failure is announced right away. The "compact" variant fits in a dashboard header.
 */
export function SyncStatus({
  items,
  variant = "list",
  now: nowProp,
  announce = true,
  locale,
  labels: labelOverrides,
  className,
}: SyncStatusProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const now = useNow(nowProp);
  const full = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const timeOnly = new Intl.DateTimeFormat(locale, { timeStyle: "short" });
  const dayAndTime = new Intl.DateTimeFormat(locale, { weekday: "short", hour: "numeric", minute: "2-digit" });

  const describe = (item: SyncItem) => {
    const last = toDate(item.lastSyncedAt);
    switch (item.state) {
      case "syncing":
        // Only show progress that makes sense (a total above zero, done no more than total).
        return item.progress && item.progress.total > 0 && item.progress.done <= item.progress.total
          ? `${labels.syncing} ${labels.progress.replace("{done}", String(item.progress.done)).replace("{total}", String(item.progress.total))}`
          : labels.syncing;
      case "error":
        return item.message ?? labels.error;
      case "never":
        return labels.never;
      default:
        if (last) return labels.lastSynced.replace("{time}", relative(last, now, locale, labels.justNow));
        // An ok sync without a readable time is still up to date; a stale one just says it's overdue.
        return item.state === "ok" ? labels.upToDate : labels.never;
    }
  };

  // Announce changes: politely for most, right away for a new failure.
  const [polite, setPolite] = useState("");
  const [urgent, setUrgent] = useState("");
  const previous = useRef(new Map(items.map((i) => [i.platform, i.state])));
  const describeRef = useRef(describe);
  describeRef.current = describe;
  useEffect(() => {
    const changes: string[] = [];
    const failures: string[] = [];
    for (const item of items) {
      const before = previous.current.get(item.platform);
      if (before !== undefined && before !== item.state) {
        const text = `${SOCIAL_ICONS[item.platform].name}: ${describeRef.current(item)}`;
        (item.state === "error" ? failures : changes).push(text);
      }
    }
    previous.current = new Map(items.map((i) => [i.platform, i.state]));
    if (changes.length) setPolite(changes.join(". "));
    if (failures.length) setUrgent(failures.join(". "));
  }, [items]);

  const announcers = announce && (
    <>
      <p className="sr-only" aria-live="polite">
        {polite}
      </p>
      <p className="sr-only" role="alert">
        {urgent}
      </p>
    </>
  );

  if (variant === "compact") {
    return (
      <div className={className}>
        {announcers}
        <ul aria-label={labels.list} className="flex items-center gap-2">
          {items.map((item) => {
            const { icon: Icon, className: tone } = STATE_STYLE[item.state];
            const text = `${SOCIAL_ICONS[item.platform].name}: ${describe(item)}`;
            const action = item.state === "error" ? item.action : undefined;
            const mark = (
              <>
                <SocialIcon platform={item.platform} variant="tile" label="" className="size-7" />
                <span
                  aria-hidden
                  className={cn(
                    "absolute -right-1.5 -bottom-1.5 grid place-items-center rounded-full bg-background",
                    tone,
                  )}
                >
                  <Icon
                    className={cn("size-3.5", item.state === "syncing" && "animate-spin motion-reduce:animate-none")}
                    strokeWidth={2.5}
                  />
                </span>
              </>
            );
            return (
              <li key={item.platform} className="relative">
                {action ? (
                  <button
                    type="button"
                    onClick={action.onClick}
                    title={`${text}. ${action.label}`}
                    className="relative block cursor-pointer rounded-[22%] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
                  >
                    {mark}
                    <span className="sr-only">{`${text}. ${action.label}`}</span>
                  </button>
                ) : (
                  <span title={text} className="relative block">
                    {mark}
                    <span className="sr-only">{text}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className={className}>
      {announcers}
      <ul aria-label={labels.list} className="divide-y rounded-xl border">
        {items.map((item) => {
          const { icon: Icon, className: tone } = STATE_STYLE[item.state];
          const last = toDate(item.lastSyncedAt);
          const next = toDate(item.nextSyncAt);
          const showTime = (item.state === "ok" || item.state === "stale") && last;
          const sameDay = next && next.toDateString() === now.toDateString();
          return (
            <li key={item.platform} className="flex flex-wrap items-center gap-3 p-3">
              <SocialIcon platform={item.platform} variant="tile" label="" className="size-8" />
              {/* Keeps a readable width; the action button drops below on narrow screens. */}
              <div className="min-w-[min(100%,14rem)] flex-1">
                <p className="font-medium text-sm">{SOCIAL_ICONS[item.platform].name}</p>
                <p className={cn("flex items-center gap-1.5 text-sm", tone)}>
                  <Icon
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0",
                      item.state === "syncing" && "animate-spin motion-reduce:animate-none",
                    )}
                  />
                  {showTime ? (
                    <time dateTime={last.toISOString()} title={full.format(last)}>
                      {describe(item)}
                      <span className="sr-only"> ({full.format(last)})</span>
                    </time>
                  ) : (
                    <span className="min-w-0 [overflow-wrap:anywhere]">{describe(item)}</span>
                  )}
                </p>
                {item.state === "syncing" && item.progress && item.progress.total > 0 && (
                  <div aria-hidden className="mt-1.5 h-1 max-w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                      style={{ width: `${Math.min(100, (item.progress.done / item.progress.total) * 100)}%` }}
                    />
                  </div>
                )}
                {next && item.state !== "syncing" && (
                  <p className="text-foreground/70 text-xs">
                    {labels.nextSync.replace("{time}", (sameDay ? timeOnly : dayAndTime).format(next))}
                  </p>
                )}
              </div>
              {item.state === "error" && item.action && (
                <Button size="sm" variant="outline" onClick={item.action.onClick}>
                  {item.action.label}
                  <span className="sr-only"> {SOCIAL_ICONS[item.platform].name}</span>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
