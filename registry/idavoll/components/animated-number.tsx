// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** Formats a number the way social apps do: 950, 12.4K, 1.2M. */
export function formatCompact(value: number) {
  return compact.format(value);
}

export interface AnimatedNumberProps extends Omit<ComponentProps<"span">, "children"> {
  /** The number to show. When it changes, the display animates to the new value. */
  value: number;
  /** How to show the number. Defaults to a compact number like 12.4K. */
  formatValue?: (value: number) => string;
  /**
   * "count" ticks through the numbers in between (good for counting up from zero).
   * "roll" slides each digit like an odometer (good for live counters).
   * Defaults to "count".
   */
  variant?: "count" | "roll";
  /** Animation length in milliseconds when the value changes. Defaults to 400. */
  duration?: number;
  /** Animation length in milliseconds for the first count up from `from`. Defaults to 900. */
  revealDuration?: number;
  /** Animate from this value when the number first appears. Leave unset to show `value` right away. */
  from?: number;
  /** Briefly color the number green when it goes up and red when it goes down. */
  highlightChange?: boolean;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Tweens from the last shown value to the new one with requestAnimationFrame. */
function useTweenedValue(value: number, durations: [number, number], from: number | undefined, enabled: boolean) {
  const [shown, setShown] = useState(from ?? value);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const revealed = useRef(false);
  const [revealDuration, updateDuration] = durations;

  useEffect(() => {
    const start = shownRef.current;
    const duration = revealed.current ? updateDuration : revealDuration;
    revealed.current = true;
    if (!enabled || start === value) {
      setShown(value);
      return;
    }
    let frame = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      // rAF timestamps can be slightly earlier than startTime; clamp so the easing stays in range.
      const t = Math.min(1, Math.max(0, (now - startTime) / duration));
      const next = start + (value - start) * easeOutCubic(t);
      setShown(t === 1 ? value : Number.isInteger(value) ? Math.round(next) : next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, revealDuration, updateDuration, enabled]);

  return shown;
}

/** Remembers whether the value last went up or down, for a short time after it changes. */
function useChangeDirection(value: number, enabled: boolean, holdMs: number) {
  const previous = useRef(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (!enabled || value === previous.current) return;
    setDirection(value > previous.current ? "up" : "down");
    previous.current = value;
    const timer = setTimeout(() => setDirection(null), holdMs);
    return () => clearTimeout(timer);
  }, [value, enabled, holdMs]);
  return direction;
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function RollingDigit({ digit, duration }: { digit: number; duration: number }) {
  return (
    <span className="relative inline-block h-[1lh] overflow-hidden">
      <span
        className="flex flex-col transition-transform ease-out"
        style={{ transform: `translateY(-${digit * 10}%)`, transitionDuration: `${duration}ms` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1lh]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function RollingText({ text, duration }: { text: string; duration: number }) {
  const chars = [...text];
  return (
    <>
      {chars.map((char, i) => {
        // Key by position from the right so the ones digit stays the ones digit when the length changes.
        const place = chars.length - i;
        return /\d/.test(char) ? (
          <RollingDigit key={`d${place}`} digit={Number(char)} duration={duration} />
        ) : (
          <span key={`s${place}-${char}`}>{char}</span>
        );
      })}
    </>
  );
}

/**
 * A number that animates when it changes, by counting or rolling digits.
 * Screen readers get the final value only, not every in-between number.
 * Animation is skipped when the viewer has asked for reduced motion.
 */
export function AnimatedNumber({
  value,
  formatValue = formatCompact,
  variant = "count",
  duration = 400,
  revealDuration = 900,
  from,
  highlightChange = false,
  className,
  ...props
}: AnimatedNumberProps) {
  const reducedMotion = usePrefersReducedMotion();
  const animate = !reducedMotion;
  const tweened = useTweenedValue(
    value,
    [revealDuration, duration],
    variant === "count" ? from : undefined,
    animate && variant === "count",
  );

  // The roll variant starts at `from` and rolls to `value` after the first paint.
  const [rollValue, setRollValue] = useState(from ?? value);
  const [rolled, setRolled] = useState(false);
  useEffect(() => {
    setRollValue(value);
  }, [value]);
  useEffect(() => {
    const timer = setTimeout(() => setRolled(true), revealDuration);
    return () => clearTimeout(timer);
  }, [revealDuration]);

  const direction = useChangeDirection(value, highlightChange, duration + 600);
  const finalText = formatValue(value);

  return (
    <span
      className={cn(
        "inline-flex tabular-nums",
        highlightChange && "transition-colors duration-500",
        direction === "up" && "text-emerald-700 dark:text-emerald-400",
        direction === "down" && "text-red-700 dark:text-red-400",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="inline-flex items-start whitespace-pre">
        {variant === "roll" && animate ? (
          <RollingText text={formatValue(rollValue)} duration={rolled ? duration : revealDuration} />
        ) : (
          formatValue(variant === "count" ? tweened : value)
        )}
      </span>
      <span className="sr-only">{finalText}</span>
    </span>
  );
}
