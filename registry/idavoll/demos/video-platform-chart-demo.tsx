import { useState } from "react";
import type { SocialPlatform } from "@/components/idavoll/social-icon";
import { VideoPlatformChart, type VideoViews } from "@/components/idavoll/video-platform-chart";

// 37 days of made-up videos, one a day. A seeded random keeps them stable.
let seed = 11;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const names = ["Desk build", "Lamp repair", "Workshop tour", "Tool review", "Shelf in a day", "Q&A"];
const scale = (views: Partial<Record<SocialPlatform, number>>, f: number) =>
  Object.fromEntries(Object.entries(views).map(([p, v]) => [p, Math.round((v ?? 0) * f)]));

const videos: VideoViews[] = Array.from({ length: 37 }, (_, i) => {
  const day = i + 1;
  const growth = 1 + day / 12;
  const views = {
    tiktok: Math.round(800 * growth * (0.5 + random() * 2)),
    instagram: Math.round(500 * growth * (0.4 + random() * 1.6)),
    youtube: day % 3 === 0 ? Math.round(1500 * growth * (0.3 + random() * 2.5)) : 0,
    threads: Math.round(120 * growth * random()),
  };
  return {
    id: `video-${day}`,
    label: `${names[day % names.length]} #${Math.ceil(day / 6)}`,
    day,
    views,
    viewsAt: { "48h": scale(views, 0.55 + random() * 0.2), "7d": scale(views, 0.85 + random() * 0.1) },
    ageHours: (37 - day) * 24 + 10,
  };
});

export default function VideoPlatformChartDemo() {
  const [picked, setPicked] = useState<string>();
  const video = videos.find((v) => v.id === picked);
  return (
    <div className="space-y-3">
      <VideoPlatformChart videos={videos} onSelect={setPicked} maxBars={30} />
      <p className="text-foreground/70 text-sm" aria-live="polite">
        {video ? `Opened day ${video.day}: ${video.label}` : "Click a bar to open that video."}
      </p>
    </div>
  );
}
