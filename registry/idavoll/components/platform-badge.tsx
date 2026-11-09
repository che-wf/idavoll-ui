// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Platform = "youtube" | "tiktok" | "instagram" | "threads";

export const PLATFORM_LABELS: Record<Platform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  threads: "Threads",
};

const DOT_CLASS: Record<Platform, string> = {
  youtube: "bg-red-600",
  tiktok: "bg-cyan-500",
  instagram: "bg-pink-500",
  threads: "bg-foreground",
};

export interface PlatformBadgeProps extends Omit<ComponentProps<typeof Badge>, "children"> {
  /** Which platform to show. */
  platform: Platform;
  /** Replace the platform name, e.g. with a handle like "@yourname". */
  label?: string;
}

/** A small label naming a social platform, with a color dot to tell platforms apart at a glance. */
export function PlatformBadge({ platform, label, variant = "outline", className, ...props }: PlatformBadgeProps) {
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)} {...props}>
      <span aria-hidden className={cn("size-2 rounded-full", DOT_CLASS[platform])} />
      {label ?? PLATFORM_LABELS[platform]}
    </Badge>
  );
}
