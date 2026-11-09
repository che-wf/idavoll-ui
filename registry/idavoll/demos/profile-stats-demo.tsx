import { useEffect, useState } from "react";
import { ProfileStats } from "@/components/idavoll/profile-stats";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileStatsDemo() {
  const [tiktok, setTiktok] = useState(6120);

  // Simulate followers arriving.
  useEffect(() => {
    const timer = setInterval(() => setTiktok((f) => f + Math.ceil(Math.random() * 40)), 2500);
    return () => clearInterval(timer);
  }, []);

  const youtube = 2310;
  const instagram = 4050;

  return (
    <Card>
      <CardContent>
        <ProfileStats
          name="Riley Park"
          handle="@rileymakes"
          bio="Posting one build video a day for 90 days. Follow along!"
          active
          ringColors={["#f9ce34", "#ee2a7b", "#6228d7"]}
          day={37}
          stats={[
            { label: "Posts", value: 37 },
            { label: "Followers", value: tiktok + youtube + instagram },
            { label: "Views", value: 1_284_000 },
          ]}
          platforms={[
            { platform: "tiktok", followers: tiktok },
            { platform: "instagram", followers: instagram },
            { platform: "youtube", followers: youtube, handle: "subscribers" },
          ]}
        />
      </CardContent>
    </Card>
  );
}
