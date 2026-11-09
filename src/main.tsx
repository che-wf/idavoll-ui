// Preview gallery, published with the registry on GitHub Pages.
import "./index.css";
import { type ComponentType, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AnimatedNumberDemo from "../registry/idavoll/demos/animated-number-demo";
import ChallengeChartDemo from "../registry/idavoll/demos/challenge-chart-demo";
import ChallengeProgressDemo from "../registry/idavoll/demos/challenge-progress-demo";
import ConnectedAccountsDemo from "../registry/idavoll/demos/connected-accounts-demo";
import MetricTabsDemo from "../registry/idavoll/demos/metric-tabs-demo";
import NotificationPreferencesDemo from "../registry/idavoll/demos/notification-preferences-demo";
import PlatformBadgeDemo from "../registry/idavoll/demos/platform-badge-demo";
import PlatformBreakdownDemo from "../registry/idavoll/demos/platform-breakdown-demo";
import PlatformGrowthChartDemo from "../registry/idavoll/demos/platform-growth-chart-demo";
import PlatformLeaderboardDemo from "../registry/idavoll/demos/platform-leaderboard-demo";
import ProfileStatsDemo from "../registry/idavoll/demos/profile-stats-demo";
import SegmentedControlDemo from "../registry/idavoll/demos/segmented-control-demo";
import SettingsGroupDemo from "../registry/idavoll/demos/settings-group-demo";
import ShimmerBorderDemo from "../registry/idavoll/demos/shimmer-border-demo";
import SocialIconDemo from "../registry/idavoll/demos/social-icon-demo";
import StatCardDemo from "../registry/idavoll/demos/stat-card-demo";
import { ThemeControls } from "./theme-controls";

const sections: { name: string; title: string; Demo: ComponentType }[] = [
  { name: "shimmer-border", title: "Shimmer Border", Demo: ShimmerBorderDemo },
  { name: "profile-stats", title: "Profile Stats", Demo: ProfileStatsDemo },
  { name: "metric-tabs", title: "Metric Tabs", Demo: MetricTabsDemo },
  { name: "platform-leaderboard", title: "Platform Leaderboard", Demo: PlatformLeaderboardDemo },
  { name: "platform-growth-chart", title: "Platform Growth Chart", Demo: PlatformGrowthChartDemo },
  { name: "platform-breakdown", title: "Platform Breakdown", Demo: PlatformBreakdownDemo },
  { name: "settings-group", title: "Settings Group", Demo: SettingsGroupDemo },
  { name: "segmented-control", title: "Segmented Control", Demo: SegmentedControlDemo },
  { name: "connected-accounts", title: "Connected Accounts", Demo: ConnectedAccountsDemo },
  { name: "notification-preferences", title: "Notification Preferences", Demo: NotificationPreferencesDemo },
  { name: "animated-number", title: "Animated Number", Demo: AnimatedNumberDemo },
  { name: "social-icon", title: "Social Icon", Demo: SocialIconDemo },
  { name: "challenge-chart", title: "Challenge Chart", Demo: ChallengeChartDemo },
  { name: "challenge-progress", title: "Challenge Progress", Demo: ChallengeProgressDemo },
  { name: "stat-card", title: "Stat Card", Demo: StatCardDemo },
  { name: "platform-badge", title: "Platform Badge", Demo: PlatformBadgeDemo },
];

function Gallery() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <span className="font-heading font-bold text-lg tracking-tight">idavoll-ui</span>
          <ThemeControls />
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <div className="space-y-3">
          <h1 className="font-heading text-5xl font-bold tracking-tight">Components for creators</h1>
          <p className="text-muted-foreground">
            Free, open-source React components built on shadcn/ui. Install them with the shadcn CLI; the code lands in
            your project and is yours to change.
          </p>
          <pre
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be reachable by keyboard.
            tabIndex={0}
            className="overflow-x-auto rounded-lg bg-muted p-3 text-sm focus-visible:outline-2 focus-visible:outline-ring"
          >
            npx shadcn@latest registry add @idavoll=https://che-wf.github.io/idavoll-ui/r/{"{name}"}.json
          </pre>
        </div>
        {sections.map(({ name, title, Demo }) => (
          <section key={name} id={name} className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-2xl font-semibold">{title}</h2>
              <code className="text-muted-foreground text-sm">npx shadcn@latest add @idavoll/{name}</code>
            </div>
            <Demo />
          </section>
        ))}
      </main>
    </>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");
createRoot(root).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
