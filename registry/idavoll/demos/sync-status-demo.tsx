// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { type SyncItem, SyncStatus } from "@/components/idavoll/sync-status";
import { Button } from "@/components/ui/button";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);
const tomorrowAt6 = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(6, 0, 0, 0);
  return d;
};

export default function SyncStatusDemo() {
  const [youtube, setYoutube] = useState<SyncItem>({
    platform: "youtube",
    state: "ok",
    lastSyncedAt: minutesAgo(5),
    nextSyncAt: tomorrowAt6(),
  });

  // "Sync now" runs a short fake sync (under 5 seconds), then finishes.
  const running = youtube.state === "syncing";
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setYoutube((y) => {
        const done = (y.progress?.done ?? 0) + 8;
        return done >= 40
          ? { platform: "youtube", state: "ok", lastSyncedAt: new Date(), nextSyncAt: tomorrowAt6() }
          : { ...y, progress: { done, total: 40 } };
      });
    }, 600);
    return () => clearInterval(timer);
  }, [running]);

  const items: SyncItem[] = [
    youtube,
    { platform: "tiktok", state: "stale", lastSyncedAt: minutesAgo(60 * 50), nextSyncAt: tomorrowAt6() },
    {
      platform: "instagram",
      state: "error",
      lastSyncedAt: minutesAgo(60 * 26),
      message: "Login expired",
      action: { label: "Reconnect", onClick: () => {} },
    },
    { platform: "threads", state: "never" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SyncStatus items={items} variant="compact" announce={false} />
        <Button
          size="sm"
          variant="outline"
          disabled={running}
          onClick={() => setYoutube((y) => ({ ...y, state: "syncing", progress: { done: 0, total: 40 } }))}
        >
          <RefreshCw aria-hidden />
          Sync YouTube now
        </Button>
      </div>
      <SyncStatus items={items} />
    </div>
  );
}
