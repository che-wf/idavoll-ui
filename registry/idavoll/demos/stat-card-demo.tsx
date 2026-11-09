import { Users } from "lucide-react";
import { StatCard } from "@/components/idavoll/stat-card";

export default function StatCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Followers"
        value={12480}
        countUp
        change={0.124}
        changeLabel="vs last week"
        icon={<Users className="size-4" />}
      />
      <StatCard label="Views" value={483200} countUp change={-0.031} changeLabel="vs last week" />
      <StatCard label="Saves" value={1890} hint="Across all platforms" />
    </div>
  );
}
