// Stress page (?stress): every component with awkward data, such as long text with no spaces,
// empty lists, zeros and huge numbers. scripts/a11y.mjs loads it and fails on crashes,
// sideways scrolling and accessibility problems. Not part of the registry.
import { Component, type ReactNode, useState } from "react";
import { BadgeShelf, evaluateBadges } from "../registry/idavoll/components/achievement-badge";
import { AnimatedNumber } from "../registry/idavoll/components/animated-number";
import { BigThree } from "../registry/idavoll/components/big-three";
import { CalendarCategoryManager } from "../registry/idavoll/components/calendar-category-manager";
import { CalendarDayDetails } from "../registry/idavoll/components/calendar-day-details";
import { ChallengeChart } from "../registry/idavoll/components/challenge-chart";
import { ChallengeProgress } from "../registry/idavoll/components/challenge-progress";
import { CommentList } from "../registry/idavoll/components/comment-list";
import { ConnectedAccounts } from "../registry/idavoll/components/connected-accounts";
import { type CalendarCategory, ContentCalendar } from "../registry/idavoll/components/content-calendar";
import { CopyField } from "../registry/idavoll/components/copy-field";
import { DataTable } from "../registry/idavoll/components/data-table";
import { DateField } from "../registry/idavoll/components/date-field";
import { EmptyState } from "../registry/idavoll/components/empty-state";
import { GuideSteps } from "../registry/idavoll/components/guide-steps";
import { MetricTabs } from "../registry/idavoll/components/metric-tabs";
import { MilestoneEditor } from "../registry/idavoll/components/milestone-editor";
import { NextMilestone } from "../registry/idavoll/components/next-milestone";
import { NotificationPreferences } from "../registry/idavoll/components/notification-preferences";
import { PlatformBadge } from "../registry/idavoll/components/platform-badge";
import { PlatformBreakdown } from "../registry/idavoll/components/platform-breakdown";
import { PlatformGrowthChart } from "../registry/idavoll/components/platform-growth-chart";
import { PlatformLeaderboard } from "../registry/idavoll/components/platform-leaderboard";
import { PlatformPicker } from "../registry/idavoll/components/platform-picker";
import { PostCard } from "../registry/idavoll/components/post-card";
import { PostLinkInput } from "../registry/idavoll/components/post-link-input";
import { ProfileStats } from "../registry/idavoll/components/profile-stats";
import { ProgressChart } from "../registry/idavoll/components/progress-chart";
import { SegmentedControl } from "../registry/idavoll/components/segmented-control";
import { SettingsGroup, SettingsRow, SettingsSwitch } from "../registry/idavoll/components/settings-group";
import { ShimmerBorder } from "../registry/idavoll/components/shimmer-border";
import { SOCIAL_ICONS, type SocialPlatform } from "../registry/idavoll/components/social-icon";
import { SourceBadge } from "../registry/idavoll/components/source-badge";
import { StatCard } from "../registry/idavoll/components/stat-card";
import { StatusBanner } from "../registry/idavoll/components/status-banner";
import { SyncStatus } from "../registry/idavoll/components/sync-status";
import { VideoPlatformChart } from "../registry/idavoll/components/video-platform-chart";
import { WizardSteps } from "../registry/idavoll/components/wizard-steps";
import { Button } from "./components/ui/button";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeControls } from "./theme-controls";

const LONG =
  "An extraordinarily long title that keeps going well past what anyone would sensibly write, just to see where it wraps or clamps";
const UNBROKEN = `https://example.com/${"averyveryverylongpathsegment".repeat(5)}?utm_source=${"x".repeat(40)}`;
const NAME = "Maximiliana Wolfeschlegelsteinhausenbergerdorff-Ramírez";
const HANDLE = `@creator_with_a_very_long_handle_${"x".repeat(30)}`;
const ALL = Object.keys(SOCIAL_ICONS) as SocialPlatform[];
const HUGE = 9_876_543_210;
const today = new Date().toISOString().slice(0, 10);

/** Catches a crash in one case so the rest still render; the check script looks for data-stress-error. */
class Guard extends Component<{ name: string; children: ReactNode }, { error?: string }> {
  state: { error?: string } = {};
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  render() {
    return this.state.error ? (
      <p data-stress-error={this.props.name} className="rounded-md border border-destructive p-3 text-destructive">
        {this.props.name} crashed: {this.state.error}
      </p>
    ) : (
      this.props.children
    );
  }
}

function Case({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section id={`stress-${name}`} aria-label={name} className="space-y-3 border-t pt-6">
      <h2 className="font-heading font-semibold text-lg">{name}</h2>
      <Guard name={name}>{children}</Guard>
    </section>
  );
}

function Stateful({ children }: { children: (s: [string[], (v: string[]) => void]) => ReactNode }) {
  const state = useState<string[]>([]);
  return <>{children(state)}</>;
}

export function StressPage() {
  const [link, setLink] = useState(UNBROKEN);
  const [date, setDate] = useState("");
  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <h1 className="font-heading font-bold">idavoll-ui stress test</h1>
        <ThemeControls />
      </header>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <p className="text-foreground/75">Every component with awkward data. Nothing here should overflow or crash.</p>

        <Case name="stat-card">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label={LONG} value={HUGE} change={123.45} changeLabel="vs. the previous extremely long period" />
            <StatCard label="Zero" value={0} change={0} />
            <StatCard label="Negative" value={-4200} change={-1} />
          </div>
        </Case>

        <Case name="animated-number">
          <p className="text-4xl">
            <AnimatedNumber value={HUGE} formatValue={(v) => v.toLocaleString()} />
          </p>
        </Case>

        <Case name="profile-stats">
          <ProfileStats
            name={NAME}
            handle={HANDLE}
            bio={`${LONG} ${UNBROKEN}`}
            extra={<BigThree signs={{ sun: "Sagittarius", moon: "Capricorn", rising: "Sagittarius" }} />}
            day={90}
            stats={[
              { label: "Posts", value: HUGE },
              { label: "Followers with a long label", value: HUGE },
              { label: "Views", value: 0 },
            ]}
            platforms={ALL.slice(0, 9).map((platform, i) => ({ platform, followers: i * HUGE }))}
          />
        </Case>

        <Case name="platform-badge">
          <PlatformBadge platform="youtube" label={HANDLE} />
        </Case>

        <Case name="challenge-progress">
          <div className="grid gap-3 sm:grid-cols-3">
            <ChallengeProgress day={0} goal={{ label: LONG, current: 0, target: 0 }} />
            <ChallengeProgress day={120} totalDays={90} goal={{ label: "Over goal", current: 25000, target: 10000 }} />
            <ChallengeProgress day={45} goal={{ label: "Below start", current: 100, target: 1000, start: 500 }} />
          </div>
        </Case>

        <Case name="challenge-chart">
          <div className="grid gap-3 sm:grid-cols-2">
            <ChallengeChart data={[]} goal={0} />
            <ChallengeChart data={[{ day: 1, value: HUGE }]} goal={HUGE * 2} today={1} />
          </div>
        </Case>

        <Case name="metric-tabs">
          <MetricTabs
            metrics={[
              { id: "a", label: LONG, value: HUGE, data: [], goal: 0 },
              { id: "b", label: "Zero", value: 0, change: 0, data: [{ day: 1, value: 0 }], goal: 10 },
              ...ALL.slice(0, 4).map((p) => ({ id: p, label: SOCIAL_ICONS[p].name, value: 10, data: [], goal: 1 })),
            ]}
          />
        </Case>

        <Case name="platform-leaderboard">
          <div className="space-y-3">
            <PlatformLeaderboard platforms={[]} label="Empty leaderboard" />
            <PlatformLeaderboard
              label="Busy leaderboard"
              platforms={ALL.slice(0, 6).map((platform, i) => ({
                platform,
                label: i === 0 ? HANDLE : undefined,
                data:
                  i === 1
                    ? []
                    : [
                        { day: 1, value: i * 10 },
                        { day: 2, value: i === 2 ? 0 : HUGE },
                      ],
              }))}
            />
          </div>
        </Case>

        <Case name="platform-growth-chart">
          <div className="space-y-3">
            <PlatformGrowthChart platforms={[]} />
            <PlatformGrowthChart
              platforms={ALL.slice(0, 8).map((platform, i) => ({
                platform,
                data:
                  i % 2
                    ? []
                    : [
                        { day: 1, value: i === 0 ? 0 : 10 },
                        { day: 5, value: HUGE },
                      ],
              }))}
            />
          </div>
        </Case>

        <Case name="platform-breakdown">
          <div className="grid gap-3 sm:grid-cols-3">
            <PlatformBreakdown platforms={[]} />
            <PlatformBreakdown platforms={ALL.slice(0, 4).map((platform) => ({ platform, value: 0 }))} variant="bar" />
            <PlatformBreakdown
              platforms={ALL.map((platform, i) => ({
                platform,
                value: i === 0 ? HUGE : i,
                label: i === 1 ? LONG : undefined,
              }))}
            />
          </div>
        </Case>

        <Case name="settings-group">
          <SettingsGroup title={`Settings: ${LONG}`} description={LONG} footer={UNBROKEN}>
            <SettingsSwitch label={LONG} description={UNBROKEN} defaultChecked />
            <SettingsRow label={NAME} value={UNBROKEN} onClick={() => {}} />
            <SettingsRow label="Control" description={LONG}>
              <SegmentedControl
                label="Five long options"
                options={["Every single day", "Weekdays only", "Weekends", "Whenever", "Never ever"].map((l) => ({
                  value: l,
                  label: l,
                }))}
              />
            </SettingsRow>
          </SettingsGroup>
        </Case>

        <Case name="connected-accounts">
          <ConnectedAccounts
            accounts={[
              { platform: "youtube", status: "connected", handle: HANDLE, detail: LONG },
              { platform: "tiktok", status: "error", handle: NAME },
              { platform: "instagram", status: "disconnected" },
            ]}
          />
        </Case>

        <Case name="notification-preferences">
          <NotificationPreferences
            channels={["Push", "Email", "SMS", "Discord", "Slack", "Carrier pigeon"].map((l) => ({ id: l, label: l }))}
            events={[
              { id: "a", label: LONG, description: UNBROKEN },
              { id: "b", label: "Milestone" },
            ]}
          />
        </Case>

        <Case name="data-table">
          <div className="space-y-6">
            <DataTable label="Empty" columns={[{ accessorKey: "a", header: "A" }]} data={[]} />
            <DataTable
              label="Long cells"
              columns={[
                { accessorKey: "title", header: "Title", meta: { lines: 2, minWidth: "12rem" } },
                { accessorKey: "url", header: "Link" },
                { accessorKey: "views", header: "Views", meta: { nowrap: true, className: "text-right" } },
              ]}
              data={[
                { title: LONG, url: UNBROKEN, views: HUGE },
                { title: NAME, url: "short", views: 0 },
              ]}
              filters={[{ column: "views", title: "Views" }]}
            />
          </div>
        </Case>

        <Case name="content-calendar">
          <ContentCalendar
            today={today}
            events={[
              { id: "1", date: today, title: LONG, platform: "youtube", time: "09:00", description: UNBROKEN },
              ...Array.from({ length: 8 }, (_, i) => ({
                id: `m${i}`,
                date: today,
                title: `Post ${i}`,
                platform: ALL[i],
              })),
            ]}
            markers={[{ date: today, name: LONG, group: "Holidays", tone: "amber" as const }]}
            categories={[{ id: "c", name: NAME, color: "#fde047", icon: "sun" as const }]}
            onAddEvent={() => {}}
          />
        </Case>

        <Case name="calendar-day-details">
          <CalendarDayDetails
            date={today}
            events={[
              { id: "1", date: today, title: LONG, platform: "youtube", time: "09:00", description: UNBROKEN },
              { id: "2", date: today, title: UNBROKEN, category: "c", time: "25:99" },
              { id: "3", date: today, title: HANDLE, icon: "heart", color: "#fde047" },
            ]}
            markers={[{ date: today, name: LONG, description: UNBROKEN, group: "Holidays", tone: "amber" as const }]}
            categories={[{ id: "c", name: `${"Long".repeat(15)}`, color: "#fde047", icon: "sun" as const }]}
            dayLabel={() => LONG}
            onEventClick={() => {}}
            onAddEvent={() => {}}
          />
          <CalendarDayDetails date="not-a-date" events={[]} />
        </Case>

        <Case name="calendar-category-manager">
          <ManagerCase />
        </Case>

        <Case name="wizard-steps">
          <WizardSteps
            steps={Array.from({ length: 8 }, (_, i) => ({
              id: `s${i}`,
              title: i === 2 ? LONG : `Step ${i + 1}`,
              optional: i % 2 === 0,
            }))}
            current="s2"
            status={{ s0: "done", s1: "skipped" }}
            onBack={() => {}}
            onSkip={() => {}}
            onNext={() => {}}
            nextLabel="A very long next button label"
          >
            <p>{UNBROKEN}</p>
          </WizardSteps>
        </Case>

        <Case name="platform-picker">
          <Stateful>
            {([value, set]) => (
              <PlatformPicker
                value={value as SocialPlatform[]}
                onChange={set}
                platforms={ALL.map((platform, i) => ({
                  platform,
                  note: i === 0 ? UNBROKEN : LONG,
                  state: i === 1 ? "soon" : undefined,
                }))}
              />
            )}
          </Stateful>
        </Case>

        <Case name="copy-field">
          <CopyField label={LONG} value={UNBROKEN} hint={LONG} />
        </Case>

        <Case name="guide-steps">
          <GuideSteps
            checkable
            steps={[
              { title: LONG, body: UNBROKEN, href: UNBROKEN, copyValue: UNBROKEN },
              { title: "Short", tone: "warning" },
            ]}
          />
        </Case>

        <Case name="sync-status">
          <div className="space-y-3">
            <SyncStatus items={[]} />
            <SyncStatus
              items={[
                {
                  platform: "youtube",
                  state: "error",
                  message: `${LONG} ${UNBROKEN}`,
                  action: { label: "Reconnect now please", onClick: () => {} },
                },
                { platform: "tiktok", state: "syncing", progress: { done: HUGE, total: 0 } },
                { platform: "instagram", state: "ok", lastSyncedAt: "not a date" },
              ]}
            />
          </div>
        </Case>

        <Case name="post-card">
          <div className="grid gap-3 sm:grid-cols-3">
            <PostCard
              title={LONG}
              publishedAt={today}
              platforms={ALL.slice(0, 8)}
              day={999}
              badge={LONG}
              stats={[
                { label: LONG, value: HUGE },
                { label: "B", value: HUGE },
                { label: "C", value: UNBROKEN },
                { label: "D", value: 0 },
              ]}
              href="#"
            />
            <PostCard
              title={UNBROKEN}
              aspect="portrait"
              publishedAt="not a date"
              platforms={[]}
              thumbnailUrl="https://invalid.example/missing.jpg"
            />
          </div>
        </Case>

        <Case name="comment-list">
          <div className="space-y-3">
            <CommentList comments={[]} unavailablePlatforms={["tiktok", "instagram", "threads"]} />
            <CommentList
              comments={[
                {
                  id: "1",
                  platform: "youtube",
                  author: HANDLE,
                  text: `${UNBROKEN}\n\n${LONG}`,
                  publishedAt: today,
                  likes: HUGE,
                },
                { id: "2", platform: "youtube", author: NAME, text: "Reply", publishedAt: "not a date", parentId: "1" },
                {
                  id: "3",
                  platform: "instagram",
                  author: "Orphan",
                  text: "Parent is missing",
                  publishedAt: today,
                  parentId: "nope",
                },
              ]}
            />
          </div>
        </Case>

        <Case name="post-link-input">
          <PostLinkInput value={link} onChange={setLink} error={LONG} />
        </Case>

        <Case name="video-platform-chart">
          <div className="space-y-3">
            <VideoPlatformChart videos={[]} label="No videos" />
            <VideoPlatformChart
              label="One video"
              videos={[{ id: "1", label: LONG, day: 1, views: { youtube: HUGE, tiktok: 0 } }]}
            />
          </div>
        </Case>

        <Case name="date-field">
          <DateField label={LONG} value={date} onChange={setDate} hint={UNBROKEN} min="2030-01-01" />
        </Case>

        <Case name="milestone-editor">
          <div className="space-y-3">
            <MilestoneEditor start={5000} goal={5000} value={[]} onChange={() => {}} />
            <MilestoneEditor
              start={0}
              goal={HUGE}
              metricLabel={LONG}
              value={[{ value: HUGE * 2, label: LONG }, { value: 5 }, { value: 5 }]}
              onChange={() => {}}
            />
          </div>
        </Case>

        <Case name="next-milestone">
          <div className="grid gap-3 sm:grid-cols-3">
            <NextMilestone current={0} milestones={[]} goal={0} metricLabel="followers" />
            <NextMilestone
              current={-50}
              start={100}
              milestones={[50, 50, 5000]}
              goal={HUGE}
              metricLabel={LONG}
              dailyRate={0.0001}
            />
            <NextMilestone current={HUGE} milestones={[10]} goal={100} metricLabel={LONG} celebrate={false} />
          </div>
        </Case>

        <Case name="source-badge">
          <SourceBadge source="verified" platform="youtube" />
        </Case>

        <Case name="status-banner">
          <StatusBanner
            tone="error"
            platform="tiktok"
            title={`Banner: ${LONG}`}
            description={UNBROKEN}
            action={{ label: "Reconnect your account", onClick: () => {} }}
            onDismiss={() => {}}
          />
        </Case>

        <Case name="empty-state">
          <EmptyState title={LONG} description={UNBROKEN} action={<Button>Sync now</Button>} />
        </Case>

        <Case name="progress-chart">
          <div className="space-y-6">
            <ProgressChart combined={[]} goal={0} />
            <ProgressChart
              combined={[{ day: 1, value: 55 }]}
              goal={HUGE}
              today={1}
              posts={[{ id: "x", platform: "tiktok", day: 40, label: LONG }]}
            />
            <ProgressChart
              platforms={ALL.slice(0, 6).map((platform, i) => ({
                platform,
                label: i === 0 ? LONG : undefined,
                data:
                  i % 2
                    ? []
                    : [
                        { day: 1.25, value: i },
                        { day: 1.75, value: HUGE },
                        { day: 3, value: HUGE / 2 },
                      ],
              }))}
              today={2}
              posts={[{ id: "y", platform: "youtube", day: 1.5, label: UNBROKEN }]}
              onSelectPost={() => {}}
              defaultShow="platforms"
            />
          </div>
        </Case>

        <Case name="content-calendar-fill">
          <div className="h-[36rem]">
            <ContentCalendar today={today} fillHeight events={[{ id: "f", date: today, title: LONG }]} />
          </div>
        </Case>

        <Case name="achievement-badge">
          <BadgeShelf
            statuses={evaluateBadges({
              postedDays: Array.from({ length: 90 }, (_, i) => i + 1),
              today: 90,
              breakoutDay: 3,
            })}
          />
        </Case>

        <Case name="shimmer-border">
          <ShimmerBorder className="w-full">
            <div className="rounded-lg bg-card p-4">{`${LONG} ${UNBROKEN}`}</div>
          </ShimmerBorder>
        </Case>
      </main>
    </TooltipProvider>
  );
}

/** The category manager is a dialog, so it opens from a button: 40 categories, a 60-character name. */
function ManagerCase() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CalendarCategory[]>(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: `c${i}`,
      name: i === 0 ? "x".repeat(60) : `${NAME} ${i}`,
      color: i % 2 ? "#fde047" : "#0f172a",
      icon: "sparkles",
    })),
  );
  return (
    <>
      <Button className="cursor-pointer" onClick={() => setOpen(true)}>
        Open category manager
      </Button>
      <CalendarCategoryManager
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        entryCounts={{ c0: 999, c1: 1 }}
        onSave={(c) => setCategories((list) => list.map((x) => (x.id === c.id ? { ...x, ...c } : x)))}
        onDelete={(id) => setCategories((list) => list.filter((x) => x.id !== id))}
      />
    </>
  );
}
