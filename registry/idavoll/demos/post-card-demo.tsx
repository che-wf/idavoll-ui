import { PostCard } from "@/components/idavoll/post-card";

/** A made-up thumbnail: a soft gradient, as an inline SVG so the demo needs no image files. */
const thumb = (from: string, to: string, portrait = false) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${portrait ? "90 160" : "160 90"}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${portrait ? 45 : 80}" cy="${portrait ? 80 : 45}" r="14" fill="white" fill-opacity=".85"/><path d="M${portrait ? 41 : 76} ${portrait ? 73 : 38}l12 7-12 7z" fill="${to}"/></svg>`,
  )}`;

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export default function PostCardDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <PostCard
        className="col-span-2"
        title="I built a standing desk from one sheet of plywood (no fancy tools)"
        thumbnailUrl={thumb("#f59e0b", "#b45309")}
        day={37}
        publishedAt={daysAgo(0)}
        platforms={["youtube", "instagram"]}
        stats={[
          { label: "Views", value: 48210 },
          { label: "Likes", value: 3120 },
          { label: "Engagement", value: "7.1%" },
        ]}
        badge="Breakout: 3× your usual"
        href="#post-card"
      />
      <PostCard
        aspect="portrait"
        title="Lamp repair in 60 seconds"
        thumbnailUrl={thumb("#06b6d4", "#4338ca", true)}
        day={36}
        publishedAt={daysAgo(1)}
        platforms={["tiktok", "instagram", "youtube"]}
        stats={[
          { label: "Views", value: 12400 },
          { label: "Likes", value: 980 },
        ]}
        onClick={() => {}}
      />
      <PostCard
        aspect="portrait"
        title="Workshop tour, part 2: the wall of clamps"
        day={35}
        publishedAt={daysAgo(2)}
        platforms={["threads"]}
        stats={[
          { label: "Views", value: 2310 },
          { label: "Likes", value: 140 },
        ]}
      />
    </div>
  );
}
