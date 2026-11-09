import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/idavoll/animated-number";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const full = new Intl.NumberFormat();

export default function AnimatedNumberDemo() {
  const [followers, setFollowers] = useState(12480);
  const [views, setViews] = useState(483200);

  // Simulate a live follower counter.
  useEffect(() => {
    const timer = setInterval(() => setFollowers((f) => f + Math.ceil(Math.random() * 9)), 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            Live followers (roll)
          </CardDescription>
          <CardTitle className="font-heading text-4xl font-bold tracking-tight">
            <AnimatedNumber value={followers} variant="roll" formatValue={full.format} from={0} />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Views (count)</CardDescription>
          <CardTitle className="font-heading text-4xl font-bold tracking-tight">
            <AnimatedNumber value={views} from={0} highlightChange />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setViews((v) => v + 125000)}>
            +125K
          </Button>
          <Button size="sm" variant="outline" onClick={() => setViews((v) => Math.max(0, v - 40000))}>
            −40K
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
