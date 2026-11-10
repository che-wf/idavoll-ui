// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { type ReactNode, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface NotificationChannel {
  /** Key used in the value, e.g. "push". */
  id: string;
  /** Column heading, e.g. "Push". */
  label: string;
  /** Small icon next to the heading. */
  icon?: ReactNode;
}

export interface NotificationEvent {
  /** Key used in the value, e.g. "milestone". */
  id: string;
  /** Row name, e.g. "Milestones". */
  label: string;
  /** One line explaining when it's sent. */
  description?: string;
}

/** Which channels are on for each event: { milestone: ["push", "email"] }. */
export type NotificationValue = Record<string, string[]>;

export interface NotificationPreferencesProps {
  /** The columns, e.g. Push and Email. */
  channels: NotificationChannel[];
  /** The rows, one per kind of notification. */
  events: NotificationEvent[];
  /** Current choices, when you control them. */
  value?: NotificationValue;
  /** Starting choices when you don't control them. */
  defaultValue?: NotificationValue;
  /** Called with the full new value after any change. */
  onValueChange?: (value: NotificationValue) => void;
  /** Greys everything out, e.g. while notifications are paused. */
  disabled?: boolean;
  /** Name of the grid for screen readers. Defaults to "Notification preferences". */
  label?: string;
  className?: string;
}

/** A grid of checkboxes: which notifications to get, on which channel. */
export function NotificationPreferences({
  channels,
  events,
  value,
  defaultValue = {},
  onValueChange,
  disabled,
  label = "Notification preferences",
  className,
}: NotificationPreferencesProps) {
  const [inner, setInner] = useState<NotificationValue>(defaultValue);
  const current = value ?? inner;

  const set = (eventId: string, channelId: string, on: boolean) => {
    const was = current[eventId] ?? [];
    const next = {
      ...current,
      [eventId]: on ? [...new Set([...was, channelId])] : was.filter((c) => c !== channelId),
    };
    setInner(next);
    onValueChange?.(next);
  };

  return (
    // Focusable so keyboard users can scroll it sideways on narrow screens.
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be reachable by keyboard.
      tabIndex={0}
      className={cn(
        "overflow-x-auto rounded-xl border bg-card text-card-foreground focus-visible:outline-2 focus-visible:outline-ring",
        disabled && "opacity-60",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-xs">
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              Notify me about
            </th>
            {channels.map((c) => (
              <th key={c.id} scope="col" className="w-20 px-2 py-2.5 font-medium">
                <span className="inline-flex items-center gap-1 [&_svg]:size-3.5">
                  {c.icon}
                  {c.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {events.map((e) => (
            <tr key={e.id}>
              <th scope="row" className="px-4 py-3 text-left font-normal">
                <span className="block font-medium">{e.label}</span>
                {e.description && (
                  <span className="block text-muted-foreground text-xs leading-relaxed">{e.description}</span>
                )}
              </th>
              {channels.map((c) => (
                <td key={c.id} className="px-2 py-3 text-center">
                  <Checkbox
                    checked={current[e.id]?.includes(c.id) ?? false}
                    onCheckedChange={(on) => set(e.id, c.id, on === true)}
                    disabled={disabled}
                    aria-label={`${e.label} by ${c.label}`}
                    className="cursor-pointer disabled:cursor-not-allowed mx-auto size-5 rounded-md border-foreground/45 [&_svg]:size-4"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
