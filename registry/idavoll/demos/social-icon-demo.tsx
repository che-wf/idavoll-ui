import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";

const platforms = Object.keys(SOCIAL_ICONS) as SocialPlatform[];

export default function SocialIconDemo() {
  return (
    <div className="space-y-6">
      {(["tile", "brand", "mono"] as const).map((variant) => (
        <div key={variant} className="space-y-2">
          <p className="font-medium text-muted-foreground text-sm">variant="{variant}"</p>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <SocialIcon key={platform} platform={platform} variant={variant} className="size-8" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
