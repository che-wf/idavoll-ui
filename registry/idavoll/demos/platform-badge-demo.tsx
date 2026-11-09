// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { PlatformBadge } from "@/components/idavoll/platform-badge";

export default function PlatformBadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="youtube" />
      <PlatformBadge platform="tiktok" />
      <PlatformBadge platform="instagram" />
      <PlatformBadge platform="threads" label="@yourhandle" />
    </div>
  );
}
