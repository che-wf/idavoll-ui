// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Heart, MessageCircleOff } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/idavoll/segmented-control";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  all: "All",
  platformFilter: "Show comments from",
  sort: "Sort comments",
  newest: "Newest",
  mostLiked: "Most liked",
  empty: "No comments yet",
  /** {platforms} becomes e.g. "TikTok". */
  unavailable: "Comment text from {platforms} isn't shared with this app, so those comments aren't shown here.",
  showMore: "Show more",
  showLess: "Show less",
  /** {count} is replaced with a number. */
  loadMore: "Show more comments ({count} left)",
  /** {count} is replaced with a number. */
  count: "{count} comments",
  likes: "likes",
  replies: "Replies",
};

export interface CommentItem {
  /** Unique id. */
  id: string;
  /** Platform it was posted on. */
  platform: SocialPlatform;
  /** Display name of the person who wrote it. */
  author: string;
  /** Their profile picture. Initials show if missing. */
  avatarUrl?: string;
  /** The comment, as plain text. It is never treated as HTML. */
  text: string;
  /** When it was posted. */
  publishedAt: Date | string;
  /** Like count. */
  likes?: number;
  /** Id of the comment this replies to. Replies show one level deep under their thread. */
  parentId?: string;
}

export interface CommentListProps {
  /** The comments, replies included, in any order. */
  comments: CommentItem[];
  /** Platforms that don't share comment text (e.g. TikTok without a Business account). Explained in a note. */
  unavailablePlatforms?: SocialPlatform[];
  /** Threads shown before "Show more comments". Defaults to 50. */
  pageSize?: number;
  /** The time to measure "2 hours ago" from. Defaults to now. */
  now?: Date;
  /** Locale for times and numbers. Defaults to the browser's. */
  locale?: string;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

const initials = (name: string) =>
  name
    .replace(/^@/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function relative(date: Date, now: Date, locale?: string) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const seconds = (date.getTime() - now.getTime()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "second");
}

/** Comment text clamped to 4 lines, with Show more when it's longer. */
function ClampedText({ text, labels }: { text: string; labels: typeof DEFAULT_LABELS }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [open]);
  return (
    <div>
      <p ref={ref} className={cn("whitespace-pre-line break-words text-sm leading-relaxed", !open && "line-clamp-4")}>
        {text}
      </p>
      {(overflows || open) && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="mt-0.5 rounded-sm font-medium text-foreground/70 text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {open ? labels.showLess : labels.showMore}
        </button>
      )}
    </div>
  );
}

/**
 * Comments on a post, with replies one level deep, platform filter chips, sorting by newest
 * or most liked, long comments clamped to 4 lines, and "Show more comments" past the page
 * size. Text is always plain text, never HTML, because comments come from strangers.
 */
export function CommentList({
  comments,
  unavailablePlatforms = [],
  pageSize = 50,
  now: nowProp,
  locale,
  labels: labelOverrides,
  className,
}: CommentListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const [platform, setPlatform] = useState<"all" | SocialPlatform>("all");
  const [sort, setSort] = useState<"newest" | "liked">("newest");
  const [shown, setShown] = useState(pageSize);
  const [now, setNow] = useState(() => nowProp ?? new Date());
  useEffect(() => {
    if (nowProp) setNow(nowProp);
  }, [nowProp]);
  const numbers = new Intl.NumberFormat(locale);
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  const { threads, platforms } = useMemo(() => {
    const byId = new Map(comments.map((c) => [c.id, c]));
    // Replies to replies attach to the top of their thread.
    const root = (c: CommentItem): CommentItem => {
      let current = c;
      const seen = new Set<string>();
      while (current.parentId && byId.has(current.parentId) && !seen.has(current.id)) {
        seen.add(current.id);
        current = byId.get(current.parentId) as CommentItem;
      }
      return current;
    };
    const replies = new Map<string, CommentItem[]>();
    const tops: CommentItem[] = [];
    for (const c of comments) {
      const top = root(c);
      if (top.id === c.id) tops.push(c);
      else replies.set(top.id, [...(replies.get(top.id) ?? []), c]);
    }
    const time = (c: CommentItem) => new Date(c.publishedAt).getTime();
    for (const list of replies.values()) list.sort((a, b) => time(a) - time(b));
    return {
      threads: tops.map((c) => ({ comment: c, replies: replies.get(c.id) ?? [] })),
      platforms: [...new Set(comments.map((c) => c.platform))],
    };
  }, [comments]);

  const visible = threads
    .filter((t) => platform === "all" || t.comment.platform === platform)
    .sort((a, b) =>
      sort === "liked"
        ? (b.comment.likes ?? 0) - (a.comment.likes ?? 0)
        : new Date(b.comment.publishedAt).getTime() - new Date(a.comment.publishedAt).getTime(),
    );
  const total = visible.reduce((n, t) => n + 1 + t.replies.length, 0);

  const renderComment = (c: CommentItem, reply = false) => {
    const date = new Date(c.publishedAt);
    return (
      <article className="flex gap-3">
        <Avatar className={reply ? "size-7" : "size-9"}>
          {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt="" />}
          <AvatarFallback className="text-foreground/75 text-xs">{initials(c.author)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            <span className="font-semibold text-foreground text-sm">{c.author}</span>
            <span className="flex items-center gap-1 text-foreground/70">
              <SocialIcon platform={c.platform} variant="tile" label="" className="size-3.5" />
              {SOCIAL_ICONS[c.platform].name}
            </span>
            <time dateTime={date.toISOString()} title={fullDate.format(date)} className="text-foreground/70">
              {relative(date, now, locale)}
            </time>
          </p>
          <ClampedText text={c.text} labels={labels} />
          {c.likes !== undefined && c.likes > 0 && (
            <p className="flex items-center gap-1 text-foreground/70 text-xs">
              <Heart aria-hidden className="size-3.5" />
              {numbers.format(c.likes)}
              <span className="sr-only"> {labels.likes}</span>
            </p>
          )}
        </div>
      </article>
    );
  };

  const unavailableNote = unavailablePlatforms.length > 0 && (
    <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-foreground/80 text-sm">
      <MessageCircleOff aria-hidden className="mt-0.5 size-4 shrink-0" />
      {labels.unavailable.replace(
        "{platforms}",
        new Intl.ListFormat(locale, { type: "conjunction" }).format(
          unavailablePlatforms.map((p) => SOCIAL_ICONS[p].name),
        ),
      )}
    </p>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {comments.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {platforms.length > 1 ? (
            <fieldset className="flex flex-wrap gap-1.5">
              <legend className="sr-only">{labels.platformFilter}</legend>
              {(["all", ...platforms] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={platform === p}
                  onClick={() => {
                    setPlatform(p);
                    setShown(pageSize);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    platform === p ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
                  )}
                >
                  {p !== "all" && <SocialIcon platform={p} variant="tile" label="" className="size-4" />}
                  {p === "all" ? labels.all : SOCIAL_ICONS[p].name}
                </button>
              ))}
            </fieldset>
          ) : (
            <span />
          )}
          <SegmentedControl
            label={labels.sort}
            size="sm"
            value={sort}
            onValueChange={setSort}
            options={[
              { value: "newest", label: labels.newest },
              { value: "liked", label: labels.mostLiked },
            ]}
          />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {comments.length > 0 ? labels.count.replace("{count}", String(total)) : ""}
      </p>

      {visible.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">{labels.empty}</p>
          {unavailableNote}
        </div>
      ) : (
        <>
          <ul className="space-y-5">
            {visible.slice(0, shown).map(({ comment, replies }) => (
              <li key={comment.id} className="space-y-3">
                {renderComment(comment)}
                {replies.length > 0 && (
                  <ul aria-label={labels.replies} className="ml-12 space-y-3 border-l pl-4">
                    {replies.map((r) => (
                      <li key={r.id}>{renderComment(r, true)}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {visible.length > shown && (
            <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + pageSize)}>
              {labels.loadMore.replace("{count}", String(visible.length - shown))}
            </Button>
          )}
          {unavailableNote}
        </>
      )}
    </div>
  );
}
