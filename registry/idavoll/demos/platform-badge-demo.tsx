import { PlatformBadge } from "@/components/idavoll/platform-badge";

export default function PlatformBadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <PlatformBadge platform="youtube" />
      <PlatformBadge platform="tiktok" />
      <PlatformBadge platform="instagram" />
      <PlatformBadge platform="threads" label="@yourhandle" />
    </div>
  );
}
