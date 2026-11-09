// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { BigThree } from "@/components/idavoll/big-three";
import { ProfileStats } from "@/components/idavoll/profile-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileStatsDemo() {
  const [tiktok, setTiktok] = useState(6120);
  const [paused, setPaused] = useState(false);

  // Simulate followers arriving. Anything that updates by itself needs a pause (WCAG 2.2.2).
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setTiktok((f) => f + Math.ceil(Math.random() * 40)), 2500);
    return () => clearInterval(timer);
  }, [paused]);

  const youtube = 2310;
  const instagram = 4050;

  return (
    <Card>
      <CardContent>
        <ProfileStats
          name="Riley Park"
          handle="@rileymakes"
          bio="Posting one build video a day for 90 days. Follow along!"
          extra={<BigThree signs={{ sun: "Leo", moon: "Pisces", rising: "Virgo" }} />}
          active
          ringColors={["#f9ce34", "#ee2a7b", "#6228d7"]}
          day={37}
          stats={[
            { label: "Posts", value: 37 },
            { label: "Followers", value: tiktok + youtube + instagram },
            { label: "Views", value: 1_284_000 },
          ]}
          platforms={[
            { platform: "tiktok", followers: tiktok, href: "https://www.tiktok.com/@example" },
            { platform: "instagram", followers: instagram },
            { platform: "youtube", followers: youtube, handle: "subscribers" },
          ]}
        />
        <Button size="sm" variant="ghost" className="mt-4" onClick={() => setPaused((p) => !p)}>
          {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
          {paused ? "Resume live updates" : "Pause live updates"}
        </Button>
      </CardContent>
    </Card>
  );
}
