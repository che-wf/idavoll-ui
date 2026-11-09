// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONES = {
  info: { icon: Info, className: "border-sky-600/30 bg-sky-500/10", iconClass: "text-sky-700 dark:text-sky-300" },
  success: {
    icon: CircleCheck,
    className: "border-emerald-600/30 bg-emerald-500/10",
    iconClass: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-600/40 bg-amber-500/10",
    iconClass: "text-amber-700 dark:text-amber-300",
  },
  error: {
    icon: CircleAlert,
    className: "border-red-600/40 bg-red-500/10",
    iconClass: "text-red-700 dark:text-red-300",
  },
};

export interface StatusBannerProps {
  /** "info", "success", "warning" or "error". Each has its own icon as well as color. Defaults to "warning". */
  tone?: keyof typeof TONES;
  /** Shows the platform's icon instead of the tone icon, e.g. for "Your TikTok login expired". */
  platform?: SocialPlatform;
  /** The headline, e.g. "Your TikTok login expired". */
  title: ReactNode;
  /** One or two sentences, e.g. "Reconnect so today's numbers aren't lost." */
  description?: ReactNode;
  /** The fix, e.g. { label: "Reconnect", onClick }. */
  action?: { label: string; onClick: () => void };
  /** Shows a close button. Leave unset for problems that must be fixed. */
  onDismiss?: () => void;
  /**
   * Announce the banner to screen readers when it appears (role="alert"). Use for new
   * problems only; a banner that stays on every page shouldn't interrupt each time.
   * Defaults to false.
   */
  announce?: boolean;
  className?: string;
}

/**
 * A banner across the app for something that needs attention, such as an expired platform
 * login. Built on shadcn's Alert, with a tone icon or platform icon, an action button and an
 * optional close button.
 */
export function StatusBanner({
  tone = "warning",
  platform,
  title,
  description,
  action,
  onDismiss,
  announce = false,
  className,
}: StatusBannerProps) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <Alert
      role={announce ? "alert" : "region"}
      aria-label={announce ? undefined : typeof title === "string" ? title : undefined}
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 has-[>svg]:grid-cols-none",
        t.className,
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3">
        {platform ? (
          <span className="relative mt-0.5 shrink-0">
            <SocialIcon platform={platform} variant="tile" label="" className="size-6" />
            <Icon
              aria-hidden
              className={cn("absolute -right-1.5 -bottom-1.5 size-3.5 rounded-full bg-background", t.iconClass)}
            />
          </span>
        ) : (
          <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", t.iconClass)} />
        )}
        <span className="min-w-0">
          <AlertTitle className="font-medium text-foreground">{title}</AlertTitle>
          {description && <AlertDescription className="text-foreground/80">{description}</AlertDescription>}
        </span>
      </span>
      {(action || onDismiss) && (
        <span className="ml-auto flex items-center gap-1">
          {action && (
            <Button size="sm" variant={tone === "error" ? "default" : "outline"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {onDismiss && (
            <Button size="icon" variant="ghost" className="size-8" aria-label="Dismiss" onClick={onDismiss}>
              <X aria-hidden />
            </Button>
          )}
        </span>
      )}
    </Alert>
  );
}
