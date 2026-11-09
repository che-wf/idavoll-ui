import { useState } from "react";
import { PlatformPicker } from "@/components/idavoll/platform-picker";
import { SOCIAL_ICONS, type SocialPlatform } from "@/components/idavoll/social-icon";

export default function PlatformPickerDemo() {
  const [picked, setPicked] = useState<SocialPlatform[]>(["tiktok"]);
  return (
    <div className="space-y-3">
      <PlatformPicker
        showLegend
        value={picked}
        onChange={setPicked}
        platforms={[
          { platform: "youtube", state: "connected" },
          { platform: "tiktok", note: "Needs a free TikTok developer app" },
          { platform: "instagram", note: "Needs a Business or Creator account" },
          { platform: "threads", note: "Uses your Instagram login" },
          { platform: "x", state: "soon" },
          { platform: "bluesky", state: "soon" },
        ]}
      />
      <p className="text-foreground/70 text-sm" aria-live="polite">
        {picked.length === 0 ? "Nothing picked yet." : `Picked: ${picked.map((p) => SOCIAL_ICONS[p].name).join(", ")}`}
      </p>
    </div>
  );
}
