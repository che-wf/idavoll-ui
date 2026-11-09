import type { ComponentProps, CSSProperties } from "react";
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
  backdrop = "var(--background)",
  className,
  style,
  children,
  ...props
}: ShimmerBorderProps) {
  return (
    <div
      className={cn(
        "relative isolate inline-flex overflow-hidden rounded-[calc(var(--sb-r)+var(--sb-w))] p-(--sb-w)",
        // The wrapped element sits on top, fills the frame and drops its own border.
        "[&>:not([data-shimmer])]:relative [&>:not([data-shimmer])]:z-10 [&>:not([data-shimmer])]:flex-1",
        "[&>:not([data-shimmer])]:rounded-(--sb-r) [&>:not([data-shimmer])]:border-0 [&>:not([data-shimmer])]:ring-0",
        className,
      )}
      style={{ "--sb-w": `${width}px`, "--sb-r": radius, background: borderColor, ...style } as CSSProperties}
      {...props}
    >
      <span data-shimmer aria-hidden className="pointer-events-none absolute inset-0 [container-type:size]">
        {/* A square larger than the frame's diagonal, so the gradient reaches every corner as it turns. */}
        <span className="absolute top-1/2 left-1/2 aspect-square w-[calc(100cqw+100cqh)] -translate-x-1/2 -translate-y-1/2">
          <span
            className="block size-full animate-spin motion-reduce:animate-none"
            style={{
              background: shimmerGradient(color, borderColor, beams, length),
              animationDuration: `${duration}s`,
              animationDirection: reverse ? "reverse" : "normal",
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
