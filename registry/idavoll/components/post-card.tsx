"use client";

import { Film } from "lucide-react";
import { type ElementType, type ReactNode, useState } from "react";
import { formatCompact } from "@/components/idavoll/animated-number";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { cn } from "@/lib/utils";

const full = new Intl.NumberFormat();

export interface PostStat {
  /** What the number is, e.g. "Views". */
  label: string;
  /** The number, or text such as "4.2%". Numbers show compact ("12.4K") with the full number for screen readers. */
  value: number | string;
}

export interface PostCardProps {
  /** Title or caption. Shown on two lines at most. */
  title: string;
  /** Thumbnail image. A neutral placeholder shows if it's missing or fails to load. */
  thumbnailUrl?: string;
  /** "landscape" (16:9, e.g. YouTube videos) or "portrait" (9:16, e.g. Shorts, Reels, TikToks). Defaults to "landscape". */
  aspect?: "landscape" | "portrait";
  /** Challenge day, shown as "Day 23". */
  day?: number;
  /** When it was posted. */
  publishedAt: Date | string;
  /** Platforms it's posted on. */
  platforms: SocialPlatform[];
  /** Two to four headline numbers, e.g. views, likes and engagement. */
  stats?: PostStat[];
  /** A small label over the thumbnail, e.g. "Breakout: 3× your usual". */
  badge?: ReactNode;
  /** Makes the whole card a link. */
  href?: string;
  /** Link component for href, e.g. your router's Link. Defaults to <a>. */
  linkComponent?: ElementType;
  /** Makes the whole card a button (when there's no href). */
  onClick?: () => void;
  /** Locale for the date. Defaults to the browser's. */
  locale?: string;
  className?: string;
}

/**
 * A post or video at a glance: thumbnail, title, challenge day, date, platforms and a few
 * headline numbers. With href or onClick the whole card is clickable, with one link or
 * button inside it (the title) so screen readers hear it once.
 */
export function PostCard({
  title,
  thumbnailUrl,
  aspect = "landscape",
  day,
  publishedAt,
  platforms,
  stats = [],
  badge,
  href,
  linkComponent: Link = "a",
  onClick,
  locale,
  className,
}: PostCardProps) {
  const [broken, setBroken] = useState(false);
  const date = new Date(publishedAt);
  const dateText = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
  const showImage = thumbnailUrl && !broken;
  // The title is the card's one control; its ::after stretches over the whole card.
  const stretch = "text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
        (href || onClick) &&
          "transition-colors hover:border-foreground/30 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-offset-2",
        className,
      )}
    >
      <div className={cn("relative bg-muted", aspect === "portrait" ? "aspect-[9/16]" : "aspect-video")}>
        {showImage ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            onError={() => setBroken(true)}
            className="size-full object-cover"
          />
        ) : (
          <div aria-hidden className="grid size-full place-items-center text-foreground/40">
            <Film className="size-8" />
          </div>
        )}
        {badge && (
          <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 font-medium text-xs shadow-sm backdrop-blur">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 font-medium text-sm leading-snug">
          {href ? (
            <Link href={href} className={stretch}>
              {title}
            </Link>
          ) : onClick ? (
            <button type="button" onClick={onClick} className={stretch}>
              {title}
            </button>
          ) : (
            title
          )}
        </h3>
        <div className="flex items-center justify-between gap-2 text-foreground/70 text-xs">
          <span>
            {day !== undefined && <>Day {day} · </>}
            <time dateTime={date.toISOString()}>{dateText}</time>
          </span>
          <span className="flex -space-x-1">
            {platforms.map((p) => (
              <SocialIcon key={p} platform={p} variant="tile" label="" className="size-5 ring-2 ring-card" />
            ))}
            <span className="sr-only">On {platforms.map((p) => SOCIAL_ICONS[p].name).join(", ")}</span>
          </span>
        </div>
        {stats.length > 0 && (
          <dl
            className="mt-auto grid gap-2 border-t pt-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, minmax(0, 1fr))` }}
          >
            {stats.slice(0, 4).map((s) => (
              <div key={s.label} className="flex min-w-0 flex-col-reverse">
                <dt className="truncate text-foreground/70 text-xs">{s.label}</dt>
                <dd className="font-semibold text-sm tabular-nums">
                  {typeof s.value === "number" ? (
                    <>
                      <span aria-hidden>{formatCompact(s.value)}</span>
                      <span className="sr-only">{full.format(s.value)}</span>
                    </>
                  ) : (
                    s.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
