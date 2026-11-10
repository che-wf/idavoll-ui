// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  legend: "Platforms to track",
  connected: "Already connected",
  soon: "Coming soon",
};

export interface PlatformChoice<P extends SocialPlatform = SocialPlatform> {
  /** Which platform. */
  platform: P;
  /** One line under the name, e.g. "Needs a Business or Creator account". */
  note?: ReactNode;
  /**
   * "available" can be picked; "connected" is shown ticked and can't be changed;
   * "soon" is shown but can't be picked. Defaults to "available".
   */
  state?: "available" | "connected" | "soon";
}

export interface PlatformPickerProps<P extends SocialPlatform = SocialPlatform> {
  /** The platforms to offer, in order. */
  platforms: PlatformChoice<P>[];
  /** The picked platforms. */
  value: P[];
  /** Called with the new list when a card is ticked or unticked. */
  onChange: (value: P[]) => void;
  /** Show the legend ("Platforms to track") on screen. It's always there for screen readers. Defaults to false. */
  showLegend?: boolean;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Large toggle cards for picking several platforms. Each card is a real checkbox: Tab moves
 * between cards and Space ticks one. Picked cards show a check and a thicker border, not
 * just a color change. Two columns on phones, four on wide containers.
 */
export function PlatformPicker<P extends SocialPlatform = SocialPlatform>({
  platforms,
  value,
  onChange,
  showLegend = false,
  labels: labelOverrides,
  className,
}: PlatformPickerProps<P>) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const toggle = (platform: P, on: boolean) =>
    onChange(on ? [...value.filter((p) => p !== platform), platform] : value.filter((p) => p !== platform));

  return (
    <fieldset className={cn("@container", className)}>
      <legend className={cn("mb-3 font-medium text-sm", !showLegend && "sr-only")}>{labels.legend}</legend>
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
        {platforms.map(({ platform, note, state = "available" }) => {
          const connected = state === "connected";
          const soon = state === "soon";
          const checked = connected || value.includes(platform);
          return (
            <label
              key={platform}
              className={cn(
                "relative flex min-w-0 cursor-pointer flex-col items-start gap-2 rounded-xl border-2 border-border p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring has-[:focus-visible]:outline-offset-2",
                checked && !soon && "border-primary bg-primary/5",
                !checked && !soon && "hover:border-foreground/30",
                (connected || soon) && "cursor-not-allowed",
                soon && "border-dashed bg-muted/30",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={connected || soon}
                onChange={(e) => toggle(platform, e.target.checked)}
                aria-describedby={note || connected || soon ? `${id}-${platform}-note` : undefined}
              />
              <span className="flex w-full items-start justify-between gap-2">
                <SocialIcon
                  platform={platform}
                  variant="tile"
                  label=""
                  className={cn("size-10", soon && "grayscale")}
                />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-5 place-items-center rounded-full border-2",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-foreground/40",
                  )}
                >
                  {checked && <Check className="size-3" strokeWidth={3.5} />}
                </span>
              </span>
              <span className="font-medium text-sm">{SOCIAL_ICONS[platform].name}</span>
              {(note || connected || soon) && (
                <span
                  id={`${id}-${platform}-note`}
                  className="max-w-full text-foreground/70 text-xs leading-snug [overflow-wrap:anywhere]"
                >
                  {connected ? labels.connected : soon ? labels.soon : note}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
