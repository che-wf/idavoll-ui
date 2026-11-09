import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePostUrl } from "../registry/idavoll/components/post-url.ts";

const cases: [string, ReturnType<typeof parsePostUrl>][] = [
  // YouTube
  ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["https://youtube.com/watch?feature=share&v=dQw4w9WgXcQ&t=42", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["https://youtu.be/dQw4w9WgXcQ?si=abc123", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["youtu.be/dQw4w9WgXcQ", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/shorts/aBcDeFgHiJk", { platform: "youtube", id: "aBcDeFgHiJk" }],
  ["https://www.youtube.com/live/aBcDeFgHiJk?feature=share", { platform: "youtube", id: "aBcDeFgHiJk" }],
  ["  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ", { platform: "youtube", id: "dQw4w9WgXcQ" }],
  ["https://www.youtube.com/@somechannel", null],
  ["https://www.youtube.com/watch?v=short", null],
  ["https://www.youtube.com/playlist?list=PL123", null],
  // TikTok
  ["https://www.tiktok.com/@maya.makes/video/7301234567890123456", { platform: "tiktok", id: "7301234567890123456" }],
  [
    "https://www.tiktok.com/@maya.makes/video/7301234567890123456?is_from_webapp=1",
    { platform: "tiktok", id: "7301234567890123456" },
  ],
  ["tiktok.com/@maya/photo/7301234567890123456", { platform: "tiktok", id: "7301234567890123456" }],
  ["https://www.tiktok.com/@maya.makes", null],
  ["https://www.tiktok.com/video/7301234567890123456", null],
  // Instagram
  ["https://www.instagram.com/p/C1a2B3c4D5e/", { platform: "instagram", id: "C1a2B3c4D5e" }],
  ["https://www.instagram.com/reel/C1a2B3c4D5e/?igsh=xyz", { platform: "instagram", id: "C1a2B3c4D5e" }],
  ["https://instagram.com/reels/C1a2B3c4D5e", { platform: "instagram", id: "C1a2B3c4D5e" }],
  ["https://www.instagram.com/maya.makes/p/C1a2B3c4D5e/", { platform: "instagram", id: "C1a2B3c4D5e" }],
  ["https://www.instagram.com/maya.makes/", null],
  // Threads
  ["https://www.threads.net/@maya.makes/post/C1a2B3c4D5e", { platform: "threads", id: "C1a2B3c4D5e" }],
  ["https://www.threads.com/@maya.makes/post/C1a2B3c4D5e?xmt=abc", { platform: "threads", id: "C1a2B3c4D5e" }],
  ["https://www.threads.net/@maya.makes", null],
  // Not post links
  ["", null],
  ["hello", null],
  ["javascript:alert(1)", null],
  ["ftp://youtube.com/watch?v=dQw4w9WgXcQ", null],
  ["https://example.com/watch?v=dQw4w9WgXcQ", null],
  ["https://notyoutube.com/watch?v=dQw4w9WgXcQ", null],
];

for (const [input, expected] of cases) {
  test(`parsePostUrl(${JSON.stringify(input)})`, () => {
    assert.deepEqual(parsePostUrl(input), expected);
  });
}
