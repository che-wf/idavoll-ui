import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateBadges } from "../registry/idavoll/components/challenge-badges.ts";

const byId = (s: ReturnType<typeof evaluateBadges>) => Object.fromEntries(s.map((x) => [x.badge.id, x]));
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

test("nothing earned before the first post", () => {
  const s = byId(evaluateBadges({ postedDays: [], today: 3 }));
  assert.equal(s["first-post"]?.earned, false);
  assert.deepEqual(s["first-post"]?.progress, { done: 0, total: 1 });
});
test("first post and first week", () => {
  const s = byId(evaluateBadges({ postedDays: [1, 2, 2, 4, 5, 6, 8, 9], today: 9 }));
  assert.equal(s["first-post"]?.earnedOnDay, 1);
  assert.equal(s["first-week"]?.earnedOnDay, 9);
});
test("steady needs four 5-day weeks in a row", () => {
  const fiveADay = range(1, 28).filter((d) => d % 7 !== 6 && d % 7 !== 0);
  assert.equal(byId(evaluateBadges({ postedDays: fiveADay, today: 28 })).steady?.earnedOnDay, 28);
  const brokenWeek = fiveADay.filter((d) => d < 15 || d > 18);
  const s = byId(evaluateBadges({ postedDays: brokenWeek, today: 28 }));
  assert.equal(s.steady?.earned, false);
  assert.ok((s.steady?.progress?.done ?? 0) >= 1);
});
test("halfway needs a post in the week before day 45", () => {
  assert.equal(byId(evaluateBadges({ postedDays: [1, 40], today: 50 })).halfway?.earnedOnDay, 45);
  assert.equal(byId(evaluateBadges({ postedDays: [1, 30], today: 50 })).halfway?.earned, false);
});
test("comeback is a surprise: no progress shown, earned after a 3-day break", () => {
  const before = byId(evaluateBadges({ postedDays: [1, 2, 3], today: 5 }));
  assert.equal(before.comeback?.earned, false);
  assert.equal(before.comeback?.progress, undefined);
  assert.equal(byId(evaluateBadges({ postedDays: [1, 2, 6], today: 6 })).comeback?.earnedOnDay, 6);
  assert.equal(byId(evaluateBadges({ postedDays: [1, 2, 5], today: 6 })).comeback?.earned, false);
});
test("finisher needs day 90 and half the days posted", () => {
  const half = range(1, 90).filter((d) => d % 2 === 0);
  assert.equal(byId(evaluateBadges({ postedDays: half, today: 90 })).finisher?.earnedOnDay, 90);
  assert.equal(byId(evaluateBadges({ postedDays: half.slice(1), today: 90 })).finisher?.earned, false);
  assert.equal(byId(evaluateBadges({ postedDays: range(1, 89), today: 89 })).finisher?.earned, false);
});
test("earned badges stay earned as days pass", () => {
  const early = byId(evaluateBadges({ postedDays: range(1, 7), today: 7 }));
  const later = byId(evaluateBadges({ postedDays: range(1, 7), today: 60 }));
  assert.equal(early["first-week"]?.earnedOnDay, later["first-week"]?.earnedOnDay);
});
test("breakout comes from the app", () => {
  assert.equal(byId(evaluateBadges({ postedDays: [1], today: 10, breakoutDay: 4 })).breakout?.earnedOnDay, 4);
});
