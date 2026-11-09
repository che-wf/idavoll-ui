// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { BadgeCheck, PencilLine } from "lucide-react";
import { SOCIAL_ICONS, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  verified: "Verified",
  selfReported: "Self-reported",
  /** {platform} becomes e.g. "YouTube". */
  verifiedFrom: "Pulled from {platform} automatically.",
  verifiedHelp: "Pulled from the platform automatically.",
  selfReportedHelp: "Typed in by you.",
};

export interface SourceBadgeProps {
  /** "verified" for numbers from a platform's API; "self-reported" for numbers typed in by hand. */
  source: "verified" | "self-reported";
  /** The platform a verified number came from, for the explanation. */
  platform?: SocialPlatform;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Says where a number came from: "Verified" (check icon, pulled from a platform) or
 * "Self-reported" (pencil icon, typed in). Words, not just an icon or color. Small enough for
 * a table cell. Hover or focus shows a one-sentence explanation, which screen readers also get.
 * Needs a TooltipProvider somewhere above it (shadcn's tooltip setup).
 */
export function SourceBadge({ source, platform, labels: labelOverrides, className }: SourceBadgeProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const verified = source === "verified";
  const Icon = verified ? BadgeCheck : PencilLine;
  const help = verified
    ? platform
      ? labels.verifiedFrom.replace("{platform}", SOCIAL_ICONS[platform].name)
      : labels.verifiedHelp
    : labels.selfReportedHelp;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          // biome-ignore lint/a11y/noNoninteractiveTabindex: focusable so keyboard users can see the explanation.
          tabIndex={0}
          className={cn(
            "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 font-medium text-xs focus-visible:outline-2 focus-visible:outline-ring",
            verified
              ? "border-emerald-600/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-dashed border-foreground/30 text-foreground/80",
            className,
          )}
        >
          <Icon aria-hidden className="size-3.5" />
          {verified ? labels.verified : labels.selfReported}
          <span className="sr-only">. {help}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent aria-hidden>{help}</TooltipContent>
    </Tooltip>
  );
}
