// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import type { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { formatCompact } from "@/components/idavoll/animated-number";
import { DataTable, DataTableColumnHeader } from "@/components/idavoll/data-table";
import { SOCIAL_ICONS, SocialIcon, type SocialPlatform } from "@/components/idavoll/social-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  day: number;
  title: string;
  platform: SocialPlatform;
  format: "Video" | "Short" | "Photo" | "Carousel";
  status: "Published" | "Scheduled" | "Draft";
  views: number;
  engagement: number;
}

// Made-up posts for a creator on day 37 of a 90-day challenge. A seeded random keeps them stable.
let seed = 7;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)] as T;
const topics = [
  "Desk build",
  "Lamp repair",
  "Workshop tour",
  "Tool review",
  "Shelf in a day",
  "Q&A",
  "Behind the scenes",
];
const platforms: SocialPlatform[] = ["tiktok", "instagram", "youtube", "threads"];
const formats: Partial<Record<SocialPlatform, Post["format"][]>> = {
  tiktok: ["Short"],
  instagram: ["Short", "Photo", "Carousel"],
  youtube: ["Video", "Short"],
  threads: ["Photo"],
};

const posts: Post[] = Array.from({ length: 46 }, (_, i) => {
  const day = Math.min(42, Math.floor(i * 0.92) + 1);
  const platform = pick(platforms);
  const options: Post["format"][] = formats[platform] ?? ["Short"];
  const status: Post["status"] = day > 37 ? "Scheduled" : random() < 0.06 ? "Draft" : "Published";
  return {
    id: `post-${i}`,
    day,
    title: `${pick(topics)} #${Math.floor(random() * 20) + 1}`,
    platform,
    format: pick(options),
    status,
    views: status === "Published" ? Math.round(400 + random() ** 3 * 90000) : 0,
    engagement: status === "Published" ? 0.01 + random() * 0.09 : 0,
  };
});

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });

const STATUS_DOT: Record<Post["status"], string> = {
  Published: "bg-emerald-500",
  Scheduled: "bg-sky-500",
  Draft: "bg-foreground/40",
};

const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "day",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Day" />,
    cell: ({ row }) => <span className="tabular-nums">Day {row.original.day}</span>,
    meta: { label: "Day" },
  },
  {
    accessorKey: "title",
    header: "Post",
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <SocialIcon platform={row.original.platform} variant="tile" label="" className="size-5" />
        {SOCIAL_ICONS[row.original.platform].name}
      </span>
    ),
    enableGlobalFilter: false,
  },
  { accessorKey: "format", header: "Format" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span aria-hidden className={cn("size-2 rounded-full", STATUS_DOT[row.original.status])} />
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "views",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => (row.original.views ? formatCompact(row.original.views) : "—"),
    meta: { label: "Views", className: "text-right tabular-nums" },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "engagement",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Engagement" />,
    cell: ({ row }) => (row.original.engagement ? percent.format(row.original.engagement) : "—"),
    meta: { label: "Engagement", className: "text-right tabular-nums" },
    enableGlobalFilter: false,
  },
];

// Videos: one row per video, with its per-platform posts as sub-rows.
interface VideoRow {
  id: string;
  title: string;
  day: number;
  platform?: SocialPlatform;
  views: number;
  likes: number;
  subRows?: VideoRow[];
}

const videoTitles = ["Desk build", "Lamp repair", "Workshop tour", "Tool review", "Shelf in a day", "Q&A"];
const videos: VideoRow[] = Array.from({ length: 9 }, (_, i) => {
  const day = 37 - i * 4;
  const on = platforms.filter(() => random() > 0.3);
  const subRows = (on.length ? on : ["tiktok" as SocialPlatform]).map((platform) => {
    const views = Math.round(500 + random() ** 2 * 40000);
    return {
      id: `v${i}-${platform}`,
      title: SOCIAL_ICONS[platform].name,
      day,
      platform,
      views,
      likes: Math.round(views * (0.03 + random() * 0.06)),
    };
  });
  return {
    id: `v${i}`,
    title: `${pick(videoTitles)} #${9 - i}`,
    day,
    views: subRows.reduce((sum, r) => sum + r.views, 0),
    likes: subRows.reduce((sum, r) => sum + r.likes, 0),
    subRows,
  };
});

const videoColumns: ColumnDef<VideoRow>[] = [
  {
    accessorKey: "title",
    header: "Video",
    cell: ({ row }) =>
      row.original.platform ? (
        <span className="flex items-center gap-2 font-normal">
          <SocialIcon platform={row.original.platform} variant="tile" label="" className="size-5" />
          {row.original.title}
        </span>
      ) : (
        row.original.title
      ),
  },
  {
    accessorKey: "day",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Day" />,
    cell: ({ row }) => (row.depth === 0 ? <span className="tabular-nums">Day {row.original.day}</span> : null),
  },
  {
    id: "platforms",
    header: "Platforms",
    // Collapsed rows summarize their posts as an icon cluster.
    cell: ({ row }) =>
      row.depth === 0 ? (
        <span className="flex -space-x-1">
          {row.subRows.map((r) => (
            <SocialIcon
              key={r.id}
              platform={r.original.platform ?? "tiktok"}
              variant="tile"
              className="size-5 ring-2 ring-background"
            />
          ))}
        </span>
      ) : null,
  },
  {
    accessorKey: "views",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => formatCompact(row.original.views),
    meta: { label: "Views", className: "text-right tabular-nums" },
    enableGlobalFilter: false,
  },
  {
    accessorKey: "likes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Likes" />,
    cell: ({ row }) => formatCompact(row.original.likes),
    meta: { label: "Likes", className: "text-right tabular-nums" },
    enableGlobalFilter: false,
  },
];

export default function DataTableDemo() {
  return (
    <div className="space-y-10">
      <VideosTable />
      <PostsTable />
    </div>
  );
}

/** Expandable rows that link to a detail page. */
function VideosTable() {
  return (
    <div className="space-y-2">
      <h3 className="font-heading font-semibold">Videos, with each platform's post</h3>
      <DataTable
        label="Videos"
        columns={videoColumns}
        data={videos}
        getRowId={(v) => v.id}
        getSubRows={(v) => v.subRows}
        subRowsLabel={(v, n) => `Show ${n} platform posts for ${v.title}`}
        getRowHref={(v) => (v.platform ? undefined : `#video-${v.id}`)}
        initialSorting={[{ id: "day", desc: true }]}
        pageSize={5}
        searchPlaceholder="Search videos…"
        countLabel={(n) => (n === 1 ? "1 video" : `${n} videos`)}
      />
    </div>
  );
}

/** Search, filters, sorting, a column menu and pages. */
function PostsTable() {
  return (
    <div className="space-y-2">
      <h3 className="font-heading font-semibold">Every post, with filters</h3>
      <DataTable
        label="Posts"
        columns={columns}
        data={posts}
        getRowId={(post) => post.id}
        searchPlaceholder="Search posts…"
        initialSorting={[{ id: "day", desc: true }]}
        pageSize={8}
        columnToggle
        countLabel={(n) => (n === 1 ? "1 post" : `${n} posts`)}
        filters={[
          {
            column: "platform",
            title: "Platform",
            options: platforms.map((p) => ({
              value: p,
              label: SOCIAL_ICONS[p].name,
              icon: <SocialIcon platform={p} variant="tile" label="" className="size-4" />,
            })),
          },
          { column: "format", title: "Format" },
          { column: "status", title: "Status" },
        ]}
        toolbar={
          <Button variant="outline" size="sm">
            <Download aria-hidden />
            Export
          </Button>
        }
      />
    </div>
  );
}
