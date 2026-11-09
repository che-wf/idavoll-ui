// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { type CommentItem, CommentList } from "@/components/idavoll/comment-list";

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000);

const comments: CommentItem[] = [
  {
    id: "1",
    platform: "youtube",
    author: "Priya Shah",
    text: "The way you hid the cable tray is genius. What router bit did you use for the slots?",
    publishedAt: ago(42),
    likes: 128,
  },
  {
    id: "1a",
    platform: "youtube",
    author: "Riley Park",
    text: "A 1/4 inch straight bit, two passes. I'll put it in the description!",
    publishedAt: ago(30),
    likes: 40,
    parentId: "1",
  },
  {
    id: "1b",
    platform: "youtube",
    author: "Priya Shah",
    text: "Legend, thank you 🙏",
    publishedAt: ago(25),
    likes: 3,
    parentId: "1a",
  },
  {
    id: "2",
    platform: "instagram",
    author: "tomas.builds",
    text: "Day 37 already?! The consistency is inspiring. I started my own challenge because of you.",
    publishedAt: ago(60 * 5),
    likes: 56,
  },
  {
    id: "3",
    platform: "youtube",
    author: "Gwen Alder",
    text: "Long comment incoming. I've been following since day 1 and wanted to say how much I appreciate that you show the mistakes too. The bit where the glue-up went wrong and you just laughed and fixed it made me less scared to start my own projects.\n\nAlso: a question about finish. Did you use hardwax oil or poly on the top? I'm worried about coffee rings.\n\nAnyway, keep going. 53 days to go!",
    publishedAt: ago(60 * 26),
    likes: 212,
  },
  {
    id: "4",
    platform: "instagram",
    author: "Dana Reyes",
    text: 'Tip: 1/4" ply > 1/2" for drawer bottoms & sides. Lighter, and the dados are easier <3',
    publishedAt: ago(60 * 24 * 3),
    likes: 2,
  },
  { id: "5", platform: "threads", author: "Sam Okafor", text: "Plywood desk gang 🙌", publishedAt: ago(60 * 24 * 6) },
];

export default function CommentListDemo() {
  return <CommentList comments={comments} unavailablePlatforms={["tiktok"]} pageSize={4} />;
}
