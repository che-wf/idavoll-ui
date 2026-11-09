import assert from "node:assert/strict";
import { test } from "node:test";
import { milestoneProgress, suggestMilestones } from "../registry/idavoll/components/milestones.ts";

test("suggests round 2.5K steps between 2,000 and 12,000", () => {
  assert.deepEqual(suggestMilestones(2000, 12000), [2500, 5000, 7500, 10000]);
});
test("never more than max milestones", () => {
  for (const [start, goal] of [
    [0, 1_000_000],
    [137, 9_420],
    [12, 13],
    [950, 1_050_000],
  ]) {
    const m = suggestMilestones(start as number, goal as number);
    assert.ok(m.length <= 6, `${start}→${goal}: ${m}`);
    assert.ok(m.every((v) => v > (start as number) && v < (goal as number)));
  }
});
test("uses 1, 2.5 and 5 steps", () => {
  assert.deepEqual(suggestMilestones(0, 1000), [250, 500, 750]);
  assert.deepEqual(suggestMilestones(0, 30000), [5000, 10000, 15000, 20000, 25000]);
  assert.deepEqual(suggestMilestones(400, 1000), [500, 600, 700, 800, 900]);
});
test("handles a goal below the start, and empty ranges", () => {
  assert.deepEqual(suggestMilestones(10000, 2000), [7500, 5000, 2500]);
  assert.deepEqual(suggestMilestones(5000, 5000), []);
  assert.deepEqual(suggestMilestones(Number.NaN, 5000), []);
});

test("first half talks about progress made", () => {
  const p = milestoneProgress(4100, [2500, 5000, 7500, 10000], 12000, 2000);
  assert.equal(p.previous, 2500);
  assert.equal(p.next, 5000);
  assert.equal(p.done, 1600);
  assert.equal(p.span, 2500);
  assert.equal(p.half, "second");
  const q = milestoneProgress(3000, [2500, 5000], 12000, 2000);
  assert.equal(q.half, "first");
  assert.equal(q.done, 500);
});
test("after the last milestone, the goal is next", () => {
  const p = milestoneProgress(11000, [2500, 5000, 7500, 10000], 12000, 2000);
  assert.equal(p.next, 12000);
  assert.equal(p.isGoal, true);
  assert.equal(p.previous, 10000);
  assert.equal(p.remaining, 1000);
});
test("reached goal", () => {
  const p = milestoneProgress(12500, [5000, 10000], 12000, 2000);
  assert.equal(p.reached, true);
  assert.equal(p.fraction, 1);
  assert.equal(p.remaining, 0);
});
test("before the first milestone, starts from the start value", () => {
  const p = milestoneProgress(2100, [2500, 5000], 12000, 2000);
  assert.equal(p.previous, 2000);
  assert.equal(p.next, 2500);
  assert.equal(p.remaining, 400);
});
