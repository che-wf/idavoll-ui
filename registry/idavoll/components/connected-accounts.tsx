"use client";

import { Loader2 } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConnectedAccount {
  /** Which platform. */
  platform: SocialPlatform;
  /** "connected", "disconnected", or "error" when the login expired and needs reconnecting. */
  status: "connected" | "disconnected" | "error";
  /** The account's handle, e.g. "@maya.makes". */
  handle?: string;
  /** Extra text after the status, e.g. "Synced 5 min ago". */
  detail?: ReactNode;
}

export interface ConnectedAccountsProps {
  /** One entry per platform. */
  accounts: ConnectedAccount[];
  /** Called when the viewer clicks Connect or Reconnect. */
  onConnect?: (platform: SocialPlatform) => void;
  /** Called when the viewer clicks Disconnect. */
  onDisconnect?: (platform: SocialPlatform) => void;
  /** Platforms waiting on a connect or disconnect; their button shows a spinner. */
  pending?: SocialPlatform[];
  /** Button and status text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

const DEFAULT_LABELS = {
  connect: "Connect",
  disconnect: "Disconnect",
  reconnect: "Reconnect",
  connected: "Connected",
  disconnected: "Not connected",
  error: "Needs reconnecting",
};

const DOT = {
  connected: "bg-emerald-500",
  disconnected: "bg-muted-foreground/40",
  error: "bg-amber-500",
} as const;

/** The platforms a creator has linked, with connect, disconnect and reconnect buttons. */
export function ConnectedAccounts({
  accounts,
  onConnect,
  onDisconnect,
  pending = [],
  labels: labelOverrides,
  className,
}: ConnectedAccountsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };

  // Tell screen readers when a platform's status changes, e.g. "TikTok: Connected".
  const [announcement, setAnnouncement] = useState("");
  const previous = useRef(new Map(accounts.map((a) => [a.platform, a.status])));
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  useEffect(() => {
    const changed = accounts.filter((a) => {
      const was = previous.current.get(a.platform);
      return was !== undefined && was !== a.status;
    });
    previous.current = new Map(accounts.map((a) => [a.platform, a.status]));
    if (changed.length) {
      setAnnouncement(
        changed.map((a) => `${SOCIAL_ICONS[a.platform].name}: ${labelsRef.current[a.status]}`).join(". "),
      );
    }
  }, [accounts]);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <ul className={cn("divide-y overflow-hidden rounded-xl border bg-card text-card-foreground", className)}>
        {accounts.map((a) => {
          const name = SOCIAL_ICONS[a.platform].name;
          const busy = pending.includes(a.platform);
          const action =
            a.status === "connected" ? labels.disconnect : a.status === "error" ? labels.reconnect : labels.connect;
          return (
            <li key={a.platform} className="flex items-center gap-3 px-4 py-3">
              <SocialIcon
                platform={a.platform}
                variant="tile"
                label=""
                className={cn("size-9 transition", a.status === "disconnected" && "opacity-50 grayscale")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">
                  {name}
                  {a.handle && a.status !== "disconnected" && (
                    <span className="ml-1.5 font-normal text-muted-foreground">{a.handle}</span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT[a.status])} />
                  <span className={cn(a.status === "error" && "text-amber-700 dark:text-amber-400")}>
                    {labels[a.status]}
                  </span>
                  {a.detail && a.status !== "disconnected" && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="truncate">{a.detail}</span>
                    </>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                variant={a.status === "connected" ? "outline" : "default"}
                // aria-disabled rather than disabled, so keyboard focus stays on the button while busy.
                aria-disabled={busy || undefined}
                aria-busy={busy || undefined}
                aria-label={`${action} ${name}`}
                onClick={() => {
                  if (!busy) (a.status === "connected" ? onDisconnect : onConnect)?.(a.platform);
                }}
                className="min-w-24 aria-disabled:cursor-wait aria-disabled:opacity-70"
              >
                {busy && <Loader2 aria-hidden className="animate-spin" />}
                {action}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
