// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { RadioGroup } from "radix-ui";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string = string> {
  /** Value passed to onValueChange. */
  value: T;
  /** Visible text. */
  label: ReactNode;
  /** Icon shown before the label. */
  icon?: ReactNode;
  /** Name for screen readers when the label is only an icon. */
  ariaLabel?: string;
  /** Stops this option being picked. */
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  /** The choices, shown left to right. Two to five work best. */
  options: SegmentedOption<T>[];
  /** Picked value, when you control it. */
  value?: T;
  /** Starting value when you don't control it. Defaults to the first option. */
  defaultValue?: T;
  /** Called with the new value. */
  onValueChange?: (value: T) => void;
  /** Name for screen readers, e.g. "Chart range". */
  label: string;
  /** "sm" for toolbars, "default" for forms. */
  size?: "sm" | "default";
  /** Stretch to fill the width of the parent. Defaults to false. */
  fullWidth?: boolean;
  /** Greys the control out and stops changes. */
  disabled?: boolean;
  /** Form field name, if the control is inside a form. */
  name?: string;
  className?: string;
}

/** Pick one of a few options, with a pill that slides to the chosen one. Arrow keys move between options. */
export function SegmentedControl<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  size = "default",
  fullWidth = false,
  disabled,
  name,
  className,
}: SegmentedControlProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  );

  return (
    <RadioGroup.Root
      aria-label={label}
      value={current}
      onValueChange={(v) => {
        setInner(v as T);
        onValueChange?.(v as T);
      }}
      orientation="horizontal"
      disabled={disabled}
      name={name}
      className={cn(
        "relative isolate grid max-w-full auto-cols-fr grid-flow-col rounded-lg bg-muted p-0.5 text-foreground/70",
        fullWidth ? "w-full" : "w-fit",
        disabled && "opacity-50",
        className,
      )}
    >
      {/* The sliding pill: one option wide, moved by whole option widths. */}
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 -z-10 rounded-md bg-background shadow-xs ring-1 ring-foreground/5 transition-transform duration-300 ease-out motion-reduce:transition-none dark:bg-input"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <RadioGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          aria-label={o.ariaLabel}
          className={cn(
            "cursor-pointer data-disabled:cursor-not-allowed inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:text-foreground [&_svg]:shrink-0",
            size === "sm" ? "h-7 px-2.5 text-xs [&_svg]:size-3.5" : "h-8 px-3 text-sm [&_svg]:size-4",
          )}
        >
          {o.icon}
          {/* Too-long labels are cut short rather than pushing past the screen; hover shows them. */}
          {o.label && (
            <span className="truncate" title={typeof o.label === "string" ? o.label : undefined}>
              {o.label}
            </span>
          )}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
