// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { Bell, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { NotificationPreferences } from "@/components/idavoll/notification-preferences";
import { SettingsGroup, SettingsSwitch } from "@/components/idavoll/settings-group";

export default function NotificationPreferencesDemo() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="max-w-xl space-y-4">
      <SettingsGroup>
        <SettingsSwitch
          icon={<Bell />}
          iconColor="#ef4444"
          label="Pause all notifications"
          description="Take a break. Your streak is safe while paused."
          checked={paused}
          onCheckedChange={setPaused}
        />
      </SettingsGroup>
      <NotificationPreferences
        disabled={paused}
        channels={[
          { id: "push", label: "Push", icon: <Smartphone /> },
          { id: "email", label: "Email", icon: <Mail /> },
        ]}
        events={[
          { id: "milestone", label: "Milestones", description: "When you pass 1K, 10K, 100K…" },
          { id: "streak", label: "Streak at risk", description: "If you haven't posted by 8 pm." },
          { id: "recap", label: "Weekly recap", description: "Your best posts and growth, every Monday." },
          { id: "spike", label: "Growth spikes", description: "When a post takes off." },
          { id: "news", label: "Product news" },
        ]}
        defaultValue={{
          milestone: ["push", "email"],
          streak: ["push"],
          recap: ["email"],
          spike: ["push"],
        }}
      />
    </div>
  );
}
