"use client";

import { Link2, Plus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { type ParsedPostUrl, type PostUrlPlatform, parsePostUrl } from "@/components/idavoll/post-url";
import { SOCIAL_ICONS, SocialIcon } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export { type ParsedPostUrl, type PostUrlPlatform, parsePostUrl };

const DEFAULT_LABELS = {
  label: "Post link",
  placeholder: "Paste a link to the post",
  /** {platforms} becomes e.g. "YouTube, TikTok, Instagram or Threads". */
  invalid: "That doesn't look like a {platforms} post link.",
  /** {platform} becomes e.g. "YouTube". */
  recognised: "{platform} post",
  /** {platforms} becomes the allowed list. */
  notAllowed: "Only {platforms} links can be added here.",
  duplicate: "That post is already in the list.",
  /** {n} is replaced with a number. */
  linkN: "Link {n}",
  remove: "Remove",
  addAnother: "Add another link",
};

const ALL: PostUrlPlatform[] = ["youtube", "tiktok", "instagram", "threads"];
const orList = (platforms: PostUrlPlatform[]) =>
  new Intl.ListFormat(undefined, { type: "disjunction" }).format(platforms.map((p) => SOCIAL_ICONS[p].name));

/** Works out the message for a value. Errors only show once `touched`. */
function check(value: string, allowed: PostUrlPlatform[], labels: typeof DEFAULT_LABELS) {
  const parsed = parsePostUrl(value);
  if (!value.trim()) return { parsed: null, problem: undefined };
  if (!parsed) return { parsed, problem: labels.invalid.replace("{platforms}", orList(allowed)) };
  if (!allowed.includes(parsed.platform)) {
    return { parsed: null, problem: labels.notAllowed.replace("{platforms}", orList(allowed)) };
  }
  return { parsed, problem: undefined };
}

export interface PostLinkInputProps {
  /** The text in the field. */
  value: string;
  /** Called as the person types or pastes. */
  onChange: (value: string) => void;
  /** Called with the recognised post, or null, whenever that changes. The app looks the post up; this fetches nothing. */
  onParsed?: (result: ParsedPostUrl | null) => void;
  /** Platforms to accept. Defaults to YouTube, TikTok, Instagram and Threads. */
  allowed?: PostUrlPlatform[];
  /** An error from the app (e.g. "We couldn't find that post"). Replaces the built-in message. */
  error?: string;
  /** Hide the label visually (it stays for screen readers). */
  hideLabel?: boolean;
  /** Text, for translation. `label` names the field. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * A field for pasting a post link. It recognises YouTube, TikTok, Instagram and Threads links
 * as you type and shows the platform's icon inside the field. Links it can't read get a
 * clear message once you leave the field or paste, linked with aria-describedby.
 * The matcher is also exported as parsePostUrl() for server use.
 */
export function PostLinkInput({
  value,
  onChange,
  onParsed,
  allowed = ALL,
  error,
  hideLabel,
  labels: labelOverrides,
  className,
}: PostLinkInputProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const [touched, setTouched] = useState(false);
  const { parsed, problem } = check(value, allowed, labels);
  const message = error ?? (touched ? problem : undefined);

  const parsedKey = parsed ? `${parsed.platform}:${parsed.id}` : "";
  const onParsedRef = useRef(onParsed);
  onParsedRef.current = onParsed;
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (lastKey.current === parsedKey) return;
    lastKey.current = parsedKey;
    const [platform, postId] = parsedKey.split(":");
    onParsedRef.current?.(parsedKey ? { platform: platform as PostUrlPlatform, id: postId ?? "" } : null);
  }, [parsedKey]);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className={cn(hideLabel && "sr-only")}>
        {labels.label}
      </Label>
      <div className="relative">
        <span aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2">
          {parsed ? (
            <SocialIcon platform={parsed.platform} variant="tile" label="" className="size-5" />
          ) : (
            <Link2 className="size-4 opacity-60" />
          )}
        </span>
        <Input
          id={id}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={labels.placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          onPaste={() => setTouched(true)}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : parsed ? `${id}-ok` : undefined}
          className="pl-10"
        />
      </div>
      {message ? (
        <p id={`${id}-error`} className="text-destructive text-sm">
          {message}
        </p>
      ) : (
        parsed && (
          <p id={`${id}-ok`} className="text-foreground/70 text-xs">
            {labels.recognised.replace("{platform}", SOCIAL_ICONS[parsed.platform].name)}
          </p>
        )
      )}
    </div>
  );
}

export interface PostLinkListProps {
  /** One string per field. */
  value: string[];
  /** Called with the new list. */
  onChange: (value: string[]) => void;
  /** Called with every recognised, distinct post in the list. */
  onParsed?: (results: ParsedPostUrl[]) => void;
  /** Platforms to accept. */
  allowed?: PostUrlPlatform[];
  /** Most fields. Defaults to the number of allowed platforms. */
  max?: number;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/** Several post-link fields, e.g. one per platform, with "Add another link". Flags the same post pasted twice. */
export function PostLinkList({
  value,
  onChange,
  onParsed,
  allowed = ALL,
  max = allowed.length,
  labels: labelOverrides,
  className,
}: PostLinkListProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const fields = value.length ? value : [""];
  const keys = fields.map((v) => {
    const p = parsePostUrl(v);
    return p ? `${p.platform}:${p.id}` : "";
  });

  const parsedKey = [...new Set(keys.filter(Boolean))].join("|");
  const onParsedRef = useRef(onParsed);
  onParsedRef.current = onParsed;
  useEffect(() => {
    onParsedRef.current?.(
      parsedKey
        ? parsedKey.split("|").map((k) => {
            const [platform, id] = k.split(":");
            return { platform: platform as PostUrlPlatform, id: id ?? "" };
          })
        : [],
    );
  }, [parsedKey]);

  // Focus a newly added field.
  const listRef = useRef<HTMLUListElement>(null);
  const added = useRef(false);
  useEffect(() => {
    if (!added.current) return;
    added.current = false;
    listRef.current?.querySelector<HTMLInputElement>("li:last-child input")?.focus();
  });

  return (
    <div className={cn("space-y-2", className)}>
      <ul ref={listRef} className="space-y-3">
        {fields.map((v, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fields have no identity apart from their position.
          <li key={i} className="flex items-start gap-2">
            <PostLinkInput
              className="flex-1"
              value={v}
              allowed={allowed}
              onChange={(next) => onChange(fields.map((f, j) => (j === i ? next : f)))}
              error={keys[i] && keys.indexOf(keys[i] as string) !== i ? labels.duplicate : undefined}
              labels={{ ...labels, label: labels.linkN.replace("{n}", String(i + 1)) }}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6 shrink-0"
                aria-label={`${labels.remove} ${labels.linkN.replace("{n}", String(i + 1)).toLowerCase()}`}
                onClick={() => onChange(fields.filter((_, j) => j !== i))}
              >
                <X aria-hidden />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {fields.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            added.current = true;
            onChange([...fields, ""]);
          }}
        >
          <Plus aria-hidden />
          {labels.addAnother}
        </Button>
      )}
    </div>
  );
}
