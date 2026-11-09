// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { type ParsedPostUrl, PostLinkInput, PostLinkList } from "@/components/idavoll/post-link-input";
import { SOCIAL_ICONS } from "@/components/idavoll/social-icon";

export default function PostLinkInputDemo() {
  const [one, setOne] = useState("");
  const [parsed, setParsed] = useState<ParsedPostUrl | null>(null);
  const [links, setLinks] = useState(["https://youtu.be/dQw4w9WgXcQ", ""]);
  const [group, setGroup] = useState<ParsedPostUrl[]>([]);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="space-y-3">
        <h3 className="font-heading font-semibold">Add a post the sync missed</h3>
        <PostLinkInput value={one} onChange={setOne} onParsed={setParsed} />
        <p className="text-foreground/70 text-sm">
          {parsed
            ? `Will look up ${SOCIAL_ICONS[parsed.platform].name} post ${parsed.id}.`
            : "Try a YouTube Shorts or TikTok link."}
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="font-heading font-semibold">Group the same video</h3>
        <p className="text-foreground/70 text-sm">Paste the link from each platform you posted it on.</p>
        <PostLinkList value={links} onChange={setLinks} onParsed={setGroup} />
        <p className="text-foreground/70 text-sm" aria-live="polite">
          {group.length} {group.length === 1 ? "post" : "posts"} recognised
        </p>
      </div>
    </div>
  );
}
