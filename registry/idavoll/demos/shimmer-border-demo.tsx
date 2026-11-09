// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { Crown, Sparkles } from "lucide-react";
import { AnimatedNumber } from "@/components/idavoll/animated-number";
import { ShimmerBorder } from "@/components/idavoll/shimmer-border";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShimmerBorderDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Cards use rounded-xl, which is var(--radius) * 1.4. */}
      <ShimmerBorder radius="calc(var(--radius) * 1.4)" className="flex">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Crown className="size-4 text-amber-500" aria-hidden />
              Milestone unlocked
            </CardDescription>
            <CardTitle className="font-heading text-4xl font-bold tracking-tight">
              <AnimatedNumber value={10000} from={0} /> followers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">Day 52 of 90, 38 days ahead of pace.</CardContent>
        </Card>
      </ShimmerBorder>

      <div className="flex flex-col items-start justify-center gap-5">
        <ShimmerBorder>
          <Button size="lg">
            <Sparkles aria-hidden />
            Share my progress
          </Button>
        </ShimmerBorder>
        <ShimmerBorder beams={1} duration={3} width={2}>
          <Button size="lg" variant="outline">
            One shimmer, thicker
          </Button>
        </ShimmerBorder>
        <ShimmerBorder color="oklch(0.78 0.15 210)" beams={3} length={45} reverse>
          <Button size="lg" variant="outline">
            Any color, three shimmers
          </Button>
        </ShimmerBorder>
      </div>
    </div>
  );
}
