import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { BadgeShelf, evaluateBadges } from "@/components/idavoll/achievement-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A made-up posting history: steady at first, a 4-day break in week 3, then back at it.
const posted = Array.from({ length: 90 }, (_, i) => i + 1).filter(
  (d) => !(d >= 16 && d <= 19) && d % 7 !== 0 && !(d > 60 && d % 3 === 0),
);

export default function AchievementBadgeDemo() {
  const [today, setToday] = useState(20);
  const statuses = useMemo(() => evaluateBadges({ postedDays: posted, today, breakoutDay: 33 }), [today]);

  // Badges earned since the previous step shimmer once.
  const seen = useRef(new Set(statuses.filter((s) => s.earned).map((s) => s.badge.id)));
  const newIds = statuses.filter((s) => s.earned && !seen.current.has(s.badge.id)).map((s) => s.badge.id);
  const go = (next: number) => {
    for (const s of statuses) if (s.earned) seen.current.add(s.badge.id);
    setToday(Math.min(90, Math.max(1, next)));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle>Badges</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Back a week"
            onClick={() => go(today - 7)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <span className="min-w-16 text-center text-sm tabular-nums" aria-live="polite">
            Day {today}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Forward a week"
            onClick={() => go(today + 7)}
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => go(90)}>
            Day 90
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <BadgeShelf
          statuses={statuses}
          newIds={newIds}
          finisherAction={
            <Button size="sm" variant="outline">
              Start your next chapter
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
