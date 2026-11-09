import { PlatformBreakdown } from "@/components/idavoll/platform-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const followers = [
  { platform: "tiktok", value: 6120 },
  { platform: "instagram", value: 4050 },
  { platform: "youtube", value: 2310 },
  { platform: "threads", value: 1540 },
  // Small platforms are grouped into "Other".
  { platform: "bluesky", value: 210 },
  { platform: "pinterest", value: 140 },
] as const;

export default function PlatformBreakdownDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Where your followers are</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformBreakdown platforms={[...followers]} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Same data as a bar</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformBreakdown platforms={[...followers]} variant="bar" />
        </CardContent>
      </Card>
    </div>
  );
}
