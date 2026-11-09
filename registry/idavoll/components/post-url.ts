export type PostUrlPlatform = "youtube" | "tiktok" | "instagram" | "threads";

export interface ParsedPostUrl {
  /** Which platform the link is from. */
  platform: PostUrlPlatform;
  /** The post's id on that platform: YouTube video id, TikTok video id, Instagram or Threads shortcode. */
  id: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const SHORTCODE = /^[A-Za-z0-9_-]{5,}$/;

/**
 * Recognises a link to a single post and returns its platform and id, or null.
 * Pure and dependency-free, so a server can reuse it. Accepts links with or without
 * "https://", "www." or "m.", and ignores tracking parameters.
 *
 * - YouTube: youtube.com/watch?v=…, youtu.be/…, youtube.com/shorts/…, youtube.com/live/…
 * - TikTok: tiktok.com/@user/video/… (and /photo/…)
 * - Instagram: instagram.com/p/…, /reel/…, /reels/…, /tv/… (optionally after a username)
 * - Threads: threads.net/@user/post/… and threads.com/@user/post/…
 */
export function parsePostUrl(input: string): ParsedPostUrl | null {
  const text = input.trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtube.com" || host === "music.youtube.com") {
    if (parts[0] === "watch") {
      const id = url.searchParams.get("v") ?? "";
      return YOUTUBE_ID.test(id) ? { platform: "youtube", id } : null;
    }
    if ((parts[0] === "shorts" || parts[0] === "live" || parts[0] === "embed") && YOUTUBE_ID.test(parts[1] ?? "")) {
      return { platform: "youtube", id: parts[1] as string };
    }
    return null;
  }
  if (host === "youtu.be") {
    return YOUTUBE_ID.test(parts[0] ?? "") ? { platform: "youtube", id: parts[0] as string } : null;
  }
  if (host === "tiktok.com") {
    const [user, kind, id] = parts;
    if (user?.startsWith("@") && (kind === "video" || kind === "photo") && /^\d{6,}$/.test(id ?? "")) {
      return { platform: "tiktok", id: id as string };
    }
    return null;
  }
  if (host === "instagram.com") {
    // instagram.com/p/CODE or instagram.com/username/p/CODE
    const at = parts.findIndex((p) => p === "p" || p === "reel" || p === "reels" || p === "tv");
    const id = at >= 0 && at <= 1 ? parts[at + 1] : undefined;
    return id && SHORTCODE.test(id) ? { platform: "instagram", id } : null;
  }
  if (host === "threads.net" || host === "threads.com") {
    const [user, kind, id] = parts;
    if (user?.startsWith("@") && kind === "post" && SHORTCODE.test(id ?? "")) {
      return { platform: "threads", id: id as string };
    }
    return null;
  }
  return null;
}
