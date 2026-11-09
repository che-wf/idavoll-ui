import assert from "node:assert/strict";
import { test } from "node:test";
import { ascendantLongitude, bigThree, zonedTime } from "../registry/idavoll/components/birth-chart.ts";

test("time zones convert wall-clock birth times to UTC, including daylight saving", () => {
  assert.equal(zonedTime("2000-01-01", "12:00", "UTC").toISOString(), "2000-01-01T12:00:00.000Z");
  assert.equal(zonedTime("2020-07-01", "08:00", "America/New_York").toISOString(), "2020-07-01T12:00:00.000Z");
  assert.equal(zonedTime("2020-01-15", "08:00", "America/New_York").toISOString(), "2020-01-15T13:00:00.000Z");
});
test("ascendant formula: at the equator with the meridian at 0° Aries, Cancer rises", () => {
  assert.ok(Math.abs(ascendantLongitude(0, 0, 23.44) - 90) < 1e-9);
  assert.ok(Math.abs(ascendantLongitude(90, 0, 23.44) - 180) < 1e-9);
  assert.ok(Math.abs(ascendantLongitude(180, 0, 23.44) - 270) < 1e-9);
});
test("sun signs from dates", () => {
  assert.equal(bigThree({ date: "2000-01-01", timeZone: "UTC" }).sun, "Capricorn");
  assert.equal(bigThree({ date: "1990-07-14", timeZone: "UTC" }).sun, "Cancer");
  assert.equal(bigThree({ date: "1985-11-05", timeZone: "UTC" }).sun, "Scorpio");
});
test("J2000: Moon in Scorpio at noon on 1 Jan 2000 (UTC)", () => {
  assert.equal(bigThree({ date: "2000-01-01", time: "12:00", timeZone: "UTC" }).moon, "Scorpio");
});
test("rising needs time and place; result changes through the day", () => {
  const noPlace = bigThree({ date: "2000-01-01", time: "12:00", timeZone: "UTC" });
  assert.equal(noPlace.rising, undefined);
  const risings = new Set(
    ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map(
      (time) =>
        bigThree({ date: "2000-01-01", time, timeZone: "Europe/London", latitude: 51.5, longitude: -0.13 }).rising,
    ),
  );
  assert.ok(risings.size >= 5, [...risings].join(","));
});
test("without a time, an unclear Moon gives two options", () => {
  const days = Array.from({ length: 10 }, (_, i) => `2024-03-${String(i + 1).padStart(2, "0")}`).map((date) =>
    bigThree({ date, timeZone: "UTC" }),
  );
  assert.ok(days.some((d) => d.moonOptions));
  assert.ok(days.every((d) => d.moon || d.moonOptions));
});

test("when the Sun's centre is on the horizon, the rising degree matches the Sun's longitude", async () => {
  const { Body, e_tilt, MakeTime, Observer, SearchAltitude, SiderealTime, SunPosition } = await import(
    "astronomy-engine"
  );
  const places = [
    { lat: 51.5, lon: -0.13 },
    { lat: 40.7, lon: -74 },
    { lat: -33.9, lon: 151.2 },
    { lat: 1.3, lon: 103.8 },
  ];
  for (const { lat, lon } of places) {
    for (const start of ["2024-01-10", "2024-04-10", "2024-07-10", "2024-10-10"]) {
      // The moment the Sun's centre crosses the horizon (no refraction).
      const rise = SearchAltitude(Body.Sun, new Observer(lat, lon, 0), +1, new Date(`${start}T00:00:00Z`), 2, 0);
      assert.ok(rise);
      const t = MakeTime(rise.date);
      const asc = ascendantLongitude((((SiderealTime(t) * 15 + lon) % 360) + 360) % 360, lat, e_tilt(t).tobl);
      const sun = SunPosition(rise.date).elon;
      const diff = Math.abs(((asc - sun + 540) % 360) - 180);
      assert.ok(diff < 0.5, `lat ${lat} ${start}: asc ${asc.toFixed(1)} vs sun ${sun.toFixed(1)}`);
    }
  }
});
