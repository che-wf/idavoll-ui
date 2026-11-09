// Preview gallery, published with the registry on GitHub Pages.
import "./index.css";
import { type ComponentType, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AchievementBadgeDemo from "../registry/idavoll/demos/achievement-badge-demo";
import AnimatedNumberDemo from "../registry/idavoll/demos/animated-number-demo";
import BigThreeDemo from "../registry/idavoll/demos/big-three-demo";
import ChallengeChartDemo from "../registry/idavoll/demos/challenge-chart-demo";
import ChallengeProgressDemo from "../registry/idavoll/demos/challenge-progress-demo";
import CommentListDemo from "../registry/idavoll/demos/comment-list-demo";
import ConnectedAccountsDemo from "../registry/idavoll/demos/connected-accounts-demo";
import ContentCalendarDemo from "../registry/idavoll/demos/content-calendar-demo";
import CopyFieldDemo from "../registry/idavoll/demos/copy-field-demo";
import DataTableDemo from "../registry/idavoll/demos/data-table-demo";
import DateFieldDemo from "../registry/idavoll/demos/date-field-demo";
import EmptyStateDemo from "../registry/idavoll/demos/empty-state-demo";
import GuideStepsDemo from "../registry/idavoll/demos/guide-steps-demo";
import MetricTabsDemo from "../registry/idavoll/demos/metric-tabs-demo";
import MilestoneEditorDemo from "../registry/idavoll/demos/milestone-editor-demo";
import NextMilestoneDemo from "../registry/idavoll/demos/next-milestone-demo";
import NotificationPreferencesDemo from "../registry/idavoll/demos/notification-preferences-demo";
import PlatformBadgeDemo from "../registry/idavoll/demos/platform-badge-demo";
import PlatformBreakdownDemo from "../registry/idavoll/demos/platform-breakdown-demo";
import PlatformGrowthChartDemo from "../registry/idavoll/demos/platform-growth-chart-demo";
import PlatformLeaderboardDemo from "../registry/idavoll/demos/platform-leaderboard-demo";
import PlatformPickerDemo from "../registry/idavoll/demos/platform-picker-demo";
import PostCardDemo from "../registry/idavoll/demos/post-card-demo";
import PostLinkInputDemo from "../registry/idavoll/demos/post-link-input-demo";
import ProfileStatsDemo from "../registry/idavoll/demos/profile-stats-demo";
import SegmentedControlDemo from "../registry/idavoll/demos/segmented-control-demo";
import SettingsGroupDemo from "../registry/idavoll/demos/settings-group-demo";
import ShimmerBorderDemo from "../registry/idavoll/demos/shimmer-border-demo";
import SocialIconDemo from "../registry/idavoll/demos/social-icon-demo";
import SourceBadgeDemo from "../registry/idavoll/demos/source-badge-demo";
import StatCardDemo from "../registry/idavoll/demos/stat-card-demo";
import StatusBannerDemo from "../registry/idavoll/demos/status-banner-demo";
import SyncStatusDemo from "../registry/idavoll/demos/sync-status-demo";
import VideoPlatformChartDemo from "../registry/idavoll/demos/video-platform-chart-demo";
import WizardStepsDemo from "../registry/idavoll/demos/wizard-steps-demo";
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
  { name: "data-table", title: "Data Table", Demo: DataTableDemo },
  { name: "content-calendar", title: "Content Calendar", Demo: ContentCalendarDemo },
  { name: "animated-number", title: "Animated Number", Demo: AnimatedNumberDemo },
  { name: "social-icon", title: "Social Icon", Demo: SocialIconDemo },
  { name: "challenge-chart", title: "Challenge Chart", Demo: ChallengeChartDemo },
  { name: "challenge-progress", title: "Challenge Progress", Demo: ChallengeProgressDemo },
  { name: "stat-card", title: "Stat Card", Demo: StatCardDemo },
  { name: "platform-badge", title: "Platform Badge", Demo: PlatformBadgeDemo },
  { name: "wizard-steps", title: "Wizard Steps", Demo: WizardStepsDemo },
  { name: "platform-picker", title: "Platform Picker", Demo: PlatformPickerDemo },
  { name: "copy-field", title: "Copy Field", Demo: CopyFieldDemo },
  { name: "guide-steps", title: "Guide Steps", Demo: GuideStepsDemo },
  { name: "sync-status", title: "Sync Status", Demo: SyncStatusDemo },
  { name: "post-card", title: "Post Card", Demo: PostCardDemo },
  { name: "comment-list", title: "Comment List", Demo: CommentListDemo },
  { name: "post-link-input", title: "Post Link Input", Demo: PostLinkInputDemo },
  { name: "video-platform-chart", title: "Video Platform Chart", Demo: VideoPlatformChartDemo },
  { name: "date-field", title: "Date Field", Demo: DateFieldDemo },
  { name: "milestone-editor", title: "Milestone Editor", Demo: MilestoneEditorDemo },
  { name: "next-milestone", title: "Next Milestone", Demo: NextMilestoneDemo },
  { name: "source-badge", title: "Source Badge", Demo: SourceBadgeDemo },
  { name: "status-banner", title: "Status Banner", Demo: StatusBannerDemo },
  { name: "empty-state", title: "Empty State", Demo: EmptyStateDemo },
  { name: "achievement-badge", title: "Achievement Badge", Demo: AchievementBadgeDemo },
  { name: "big-three", title: "Big Three", Demo: BigThreeDemo },
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
