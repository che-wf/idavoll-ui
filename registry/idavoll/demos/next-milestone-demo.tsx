import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { NextMilestone } from "@/components/idavoll/next-milestone";
import { Button } from "@/components/ui/button";

const milestones = [2500, 5000, 7500, 10000];

export default function NextMilestoneDemo() {
  const [followers, setFollowers] = useState(5900);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <NextMilestone
          current={followers}
          start={2000}
          milestones={milestones}
          goal={12000}
          metricLabel="followers"
          dailyRate={84}
        />
        <NextMilestone current={12140} start={2000} milestones={milestones} goal={12000} metricLabel="followers" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setFollowers((f) => Math.max(2000, f - 500))}>
          <Minus aria-hidden />
          500 followers
        </Button>
        <Button size="sm" variant="outline" onClick={() => setFollowers((f) => f + 500)}>
          <Plus aria-hidden />
          500 followers
        </Button>
        <span className="text-foreground/70 text-sm">Watch the wording flip at halfway.</span>
      </div>
    </div>
  );
}
