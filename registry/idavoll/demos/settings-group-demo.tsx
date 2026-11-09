import { CalendarDays, Eye, Flame, Globe, Hash, Languages, LogOut, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { SegmentedControl } from "@/components/idavoll/segmented-control";
import { SettingsGroup, SettingsRow, SettingsSwitch } from "@/components/idavoll/settings-group";

export default function SettingsGroupDemo() {
  const [publicProfile, setPublicProfile] = useState(true);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-8">
        <SettingsGroup
          title="Profile"
          footer={publicProfile ? "Anyone with your link can see your challenge page." : "Only you can see your stats."}
        >
          <SettingsSwitch
            icon={<Globe />}
            iconColor="#3b82f6"
            label="Public challenge page"
            description="Share your 90-day progress with a link."
            checked={publicProfile}
            onCheckedChange={setPublicProfile}
          />
          <SettingsSwitch
            icon={<Hash />}
            iconColor="#8b5cf6"
            label="Show follower counts"
            defaultChecked
            disabled={!publicProfile}
          />
          <SettingsSwitch icon={<Eye />} iconColor="#64748b" label="Hide from search" />
        </SettingsGroup>

        <SettingsGroup title="Challenge">
          <SettingsSwitch
            icon={<Flame />}
            iconColor="#f97316"
            label="Streak reminders"
            description="A nudge at 8 pm if you haven't posted today."
            defaultChecked
          />
          <SettingsRow icon={<CalendarDays />} iconColor="#10b981" label="Week starts on">
            <SegmentedControl
              label="Week starts on"
              size="sm"
              options={[
                { value: "sun", label: "Sun" },
                { value: "mon", label: "Mon" },
              ]}
              defaultValue="mon"
            />
          </SettingsRow>
          <SettingsRow icon={<Languages />} label="Language" value="English" onClick={() => {}} />
        </SettingsGroup>
      </div>

      <div className="space-y-8">
        <SettingsGroup title="Plan">
          <SettingsRow
            icon={<Sparkles />}
            iconColor="oklch(0.75 0.15 80)"
            label="Creator Pro"
            description="Renews Dec 8"
            value="Manage"
            onClick={() => {}}
          />
        </SettingsGroup>

        <SettingsGroup title="Account" description="These can't be undone.">
          <SettingsRow icon={<LogOut />} label="Log out of all devices" onClick={() => {}} />
          <SettingsRow
            icon={<Trash2 />}
            iconColor="var(--destructive)"
            label="Reset challenge"
            description="Clears all 90 days of stats and starts again from day 1."
            destructive
            onClick={() => {}}
          />
        </SettingsGroup>
      </div>
    </div>
  );
}
