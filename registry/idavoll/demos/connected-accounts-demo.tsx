// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { type ConnectedAccount, ConnectedAccounts } from "@/components/idavoll/connected-accounts";
import type { SocialPlatform } from "@/components/idavoll/social-icon";

const START: ConnectedAccount[] = [
  { platform: "tiktok", status: "connected", handle: "@maya.makes", detail: "Synced 5 min ago" },
  { platform: "instagram", status: "connected", handle: "@maya.makes", detail: "Synced 12 min ago" },
  { platform: "youtube", status: "error", handle: "Maya Makes", detail: "Login expired 2 days ago" },
  { platform: "threads", status: "disconnected" },
  { platform: "twitch", status: "disconnected" },
];

export default function ConnectedAccountsDemo() {
  const [accounts, setAccounts] = useState(START);
  const [pending, setPending] = useState<SocialPlatform[]>([]);

  // Pretend to talk to the platform for a moment, then flip the status.
  const update = (platform: SocialPlatform, status: ConnectedAccount["status"]) => {
    setPending((p) => [...p, platform]);
    setTimeout(() => {
      setAccounts((list) =>
        list.map((a) =>
          a.platform === platform
            ? {
                ...a,
                status,
                handle: a.handle ?? "@maya.makes",
                detail: status === "connected" ? "Synced just now" : undefined,
              }
            : a,
        ),
      );
      setPending((p) => p.filter((x) => x !== platform));
    }, 1200);
  };

  return (
    <ConnectedAccounts
      accounts={accounts}
      pending={pending}
      onConnect={(p) => update(p, "connected")}
      onDisconnect={(p) => update(p, "disconnected")}
      className="max-w-xl"
    />
  );
}
