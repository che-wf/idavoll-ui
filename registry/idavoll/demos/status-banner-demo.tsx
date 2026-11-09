// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { StatusBanner } from "@/components/idavoll/status-banner";
import { Button } from "@/components/ui/button";

export default function StatusBannerDemo() {
  const [tipShown, setTipShown] = useState(true);
  return (
    <div className="space-y-3">
      <StatusBanner
        tone="error"
        platform="tiktok"
        title="Your TikTok login expired"
        description="Reconnect so today's numbers aren't lost. They can't be fetched later."
        action={{ label: "Reconnect", onClick: () => {} }}
      />
      <StatusBanner
        tone="warning"
        title="The last sync was 2 days ago"
        description="Your server may be asleep. Check that it's running."
        action={{ label: "Sync now", onClick: () => {} }}
      />
      {tipShown ? (
        <StatusBanner
          tone="info"
          title="Tip: group the same video across platforms"
          description="Paste each platform's link on the video page to see combined views."
          onDismiss={() => setTipShown(false)}
        />
      ) : (
        <Button size="sm" variant="outline" onClick={() => setTipShown(true)}>
          Show the tip again
        </Button>
      )}
    </div>
  );
}
