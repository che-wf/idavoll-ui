import { useState } from "react";
import { GuideSteps } from "@/components/idavoll/guide-steps";
import { PlatformPicker } from "@/components/idavoll/platform-picker";
import type { SocialPlatform } from "@/components/idavoll/social-icon";
import { SyncStatus } from "@/components/idavoll/sync-status";
import { WizardSteps } from "@/components/idavoll/wizard-steps";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { id: "welcome", title: "Welcome" },
  { id: "platforms", title: "Pick platforms" },
  { id: "connect", title: "Connect YouTube", optional: true },
  { id: "challenge", title: "Set up the challenge", optional: true },
  { id: "sync", title: "First sync" },
];

export default function WizardStepsDemo() {
  const [current, setCurrent] = useState("welcome");
  const [status, setStatus] = useState<Record<string, "done" | "skipped">>({});
  const [busy, setBusy] = useState(false);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const index = steps.findIndex((s) => s.id === current);
  const go = (offset: number) =>
    setCurrent(steps[Math.min(steps.length - 1, Math.max(0, index + offset))]?.id ?? current);

  return (
    <Card>
      <CardContent>
        <WizardSteps
          steps={steps}
          current={current}
          status={status}
          busy={busy}
          nextDisabled={current === "platforms" && platforms.length === 0}
          onBack={() => go(-1)}
          onSkip={() => {
            setStatus((s) => ({ ...s, [current]: "skipped" }));
            go(1);
          }}
          onNext={() => {
            // Pretend to save the step.
            setBusy(true);
            setTimeout(() => {
              setBusy(false);
              setStatus((s) => ({ ...s, [current]: "done" }));
              if (index === steps.length - 1) setCurrent("welcome");
              else go(1);
            }, 600);
          }}
        >
          {current === "welcome" && (
            <p className="max-w-prose text-foreground/80">
              In a few steps you'll pick your platforms, connect them, and set your 90-day goal. You can skip anything
              and finish it later in Settings.
            </p>
          )}
          {current === "platforms" && (
            <PlatformPicker
              value={platforms}
              onChange={setPlatforms}
              platforms={[
                { platform: "youtube" },
                { platform: "tiktok", note: "Needs a free developer app" },
                { platform: "instagram", note: "Needs a Business or Creator account" },
                { platform: "threads" },
              ]}
            />
          )}
          {current === "connect" && (
            <GuideSteps
              steps={[
                {
                  title: "Create a Google Cloud project",
                  href: "https://console.cloud.google.com/",
                  linkLabel: "Open Google Cloud Console",
                },
                {
                  title: "Add the redirect URL",
                  copyValue: "https://myserver.example.ts.net/api/connect/youtube/callback",
                  copyLabel: "Redirect URL",
                },
              ]}
            />
          )}
          {current === "challenge" && <p className="text-foreground/80">Start date, goal and milestones go here.</p>}
          {current === "sync" && (
            <SyncStatus
              items={[
                { platform: "youtube", state: "syncing", progress: { done: 12, total: 40 } },
                { platform: "tiktok", state: "never" },
              ]}
            />
          )}
        </WizardSteps>
      </CardContent>
    </Card>
  );
}
