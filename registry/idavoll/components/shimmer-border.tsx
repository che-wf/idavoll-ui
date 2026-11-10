// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { type ComponentProps, type CSSProperties, useState } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerBorderProps extends ComponentProps<"div"> {
  /**
   * Shimmer color. Any CSS color or variable. Defaults to var(--shimmer-border, gold), so you can
   * set --shimmer-border in your theme to change it everywhere.
   */
  color?: string;
  /** Color of the rest of the border. Defaults to var(--border). */
  borderColor?: string;
  /** Number of shimmers, spread evenly around the border. 2 puts them on opposite sides. Defaults to 2. */
  beams?: number;
  /** Seconds for one full trip around. Defaults to 4. */
  duration?: number;
  /** Border thickness in pixels. Defaults to 1. */
  width?: number;
  /** Length of each shimmer's fading tail, in degrees of the trip (10 to 170). Defaults to 70. */
  length?: number;
  /** Corner radius of the wrapped element, e.g. "var(--radius)" for a button. Defaults to var(--radius). */
  radius?: string;
  /** Travel counter-clockwise. Defaults to false. */
  reverse?: boolean;
  /**
   * Trips around the border before the shimmer rests. Defaults to 1, so it stops within 5 seconds
   * (WCAG 2.2.2). Pass Infinity to keep it going, only where people can pause or hide it.
   */
  loops?: number;
  /** Play again when the pointer moves over it or it gets keyboard focus. Defaults to true. */
  replayOnHover?: boolean;
  /**
   * Solid color behind the wrapped element, so see-through buttons (like outline buttons in dark
   * mode) don't show the shimmer through their middle. Defaults to var(--background).
   */
  backdrop?: string;
}

const DEFAULT_COLOR = "var(--shimmer-border, oklch(0.84 0.15 85))";

/** A conic gradient with `beams` evenly spaced streaks that fade in toward a bright head. */
function shimmerGradient(color: string, borderColor: string, beams: number, length: number) {
  const count = Math.max(1, Math.round(beams));
  const gap = 360 / count;
  const tail = Math.min(Math.max(length, 10), gap - 2);
  const head = `color-mix(in oklab, ${color} 50%, white)`;
  const stops = Array.from({ length: count }, (_, i) => {
    const start = i * gap;
    return [
      `${borderColor} ${start}deg`,
      `${color} ${start + tail * 0.85}deg`,
      `${head} ${start + tail}deg`,
      `${borderColor} ${start + tail + 1}deg`,
    ].join(", ");
  });
  return `conic-gradient(from 0deg, ${stops.join(", ")}, ${borderColor} 360deg)`;
}

/**
 * Wraps a button or card and becomes its border, with a gold shimmer that moves along the edge.
 * The wrapped element's own border and ring are turned off so only this border shows.
 * It plays once and rests, then plays again on hover or focus. Use it on one thing at a time.
 * The shimmer is decorative: hidden from screen readers and still for reduced motion.
 */
export function ShimmerBorder({
  color = DEFAULT_COLOR,
  borderColor = "var(--border)",
  beams = 2,
  duration = 4,
  width = 1,
  length = 70,
  radius = "var(--radius)",
  reverse = false,
  loops = 1,
  replayOnHover = true,
  backdrop = "var(--background)",
  className,
  style,
  children,
  onPointerEnter,
  onFocus,
  ...props
}: ShimmerBorderProps) {
  // Each play remounts the spinning layer, which restarts its CSS animation.
  const [play, setPlay] = useState({ id: 0, running: true });
  const replay = () => {
    if (replayOnHover && !play.running) setPlay({ id: play.id + 1, running: true });
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover and focus only replay the decoration; the wrapped element is the control.
    <div
      className={cn(
        "relative isolate inline-flex max-w-full overflow-hidden rounded-[calc(var(--sb-r)+var(--sb-w))] p-(--sb-w)",
        // The wrapped element sits on top, fills the frame and drops its own border.
        "[&>:not([data-shimmer])]:relative [&>:not([data-shimmer])]:z-10 [&>:not([data-shimmer])]:flex-1",
        "[&>:not([data-shimmer])]:rounded-(--sb-r) [&>:not([data-shimmer])]:border-0 [&>:not([data-shimmer])]:ring-0",
        className,
      )}
      style={{ "--sb-w": `${width}px`, "--sb-r": radius, background: borderColor, ...style } as CSSProperties}
      {...props}
      onPointerEnter={(event) => {
        replay();
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        replay();
        onFocus?.(event);
      }}
    >
      <span data-shimmer aria-hidden className="pointer-events-none absolute inset-0 [container-type:size]">
        {/* A square larger than the frame's diagonal, so the gradient reaches every corner as it turns. */}
        <span className="absolute top-1/2 left-1/2 aspect-square w-[calc(100cqw+100cqh)] -translate-x-1/2 -translate-y-1/2">
          <span
            key={play.id}
            className="block size-full animate-spin motion-reduce:animate-none"
            onAnimationEnd={() => setPlay((p) => ({ ...p, running: false }))}
            style={{
              background: shimmerGradient(color, borderColor, beams, length),
              animationDuration: `${duration}s`,
              animationDirection: reverse ? "reverse" : "normal",
              animationIterationCount: Number.isFinite(loops) ? Math.max(1, loops) : "infinite",
            }}
          />
        </span>
      </span>
      <span
        data-shimmer
        aria-hidden
        className="pointer-events-none absolute inset-(--sb-w) z-[5] rounded-(--sb-r)"
        style={{ background: backdrop }}
      />
      {children}
    </div>
  );
}
