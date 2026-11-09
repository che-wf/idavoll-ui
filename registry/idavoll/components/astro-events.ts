// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import {
  Body,
  Ecliptic,
  EclipticGeoMoon,
  GeoVector,
  NextGlobalSolarEclipse,
  NextLunarEclipse,
  SearchGlobalSolarEclipse,
  SearchLunarEclipse,
  SearchMoonPhase,
  Seasons,
  SunPosition,
} from "astronomy-engine";

export type AstroKind = "moon" | "eclipse" | "season" | "ingress" | "retrograde";

export interface AstroEvent {
  /** Local day, as "YYYY-MM-DD". */
  date: string;
  /** Local time, as "HH:MM" (24-hour). */
  time: string;
  /** E.g. "Full Moon in Taurus" or "Mercury stations retrograde in Sagittarius". */
  name: string;
  /** Extra detail, e.g. "Beaver Moon" or "Scorpio season begins". */
  description?: string;
  /** What sort of event it is. */
  kind: AstroKind;
  /** Zodiac sign involved, if any. */
  sign?: ZodiacSign;
  /** Filter group, for content-calendar markers. Always "Astrology". */
  group: "Astrology";
  /** Filter option, for content-calendar markers, e.g. "Moon phases". */
  category: string;
  /** Icon name, for content-calendar markers. */
  icon: "moon" | "eclipse" | "sun" | "planet" | "retrograde";
  /** Color, for content-calendar markers. */
  tone: "violet";
}

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];
export type AstroPlanet = "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";

export interface AstroOptions {
  /** Which kinds of events to include. Defaults to all. */
  kinds?: AstroKind[];
  /** Planets to track for sign changes and retrogrades. Defaults to Mercury through Pluto. */
  planets?: AstroPlanet[];
  /** Also include first and last quarter Moons. Defaults to false. */
  moonQuarters?: boolean;
  /** Names equinoxes and solstices for this hemisphere ("Spring equinox" in March up north). Defaults to "north". */
  hemisphere?: "north" | "south";
}

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

/** Traditional (Old Farmer's Almanac) full Moon names, by month. */
const FULL_MOON_NAMES = [
  "Wolf Moon",
  "Snow Moon",
  "Worm Moon",
  "Pink Moon",
  "Flower Moon",
  "Strawberry Moon",
  "Buck Moon",
  "Sturgeon Moon",
  "Corn Moon",
  "Hunter's Moon",
  "Beaver Moon",
  "Cold Moon",
];

const CATEGORY: Record<AstroKind, string> = {
  moon: "Moon phases",
  eclipse: "Eclipses",
  season: "Seasons and Sun signs",
  ingress: "Planets changing sign",
  retrograde: "Retrogrades",
};
const ICON: Record<AstroKind, AstroEvent["icon"]> = {
  moon: "moon",
  eclipse: "eclipse",
  season: "sun",
  ingress: "planet",
  retrograde: "retrograde",
};

const PLANETS: AstroPlanet[] = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");
const norm = (deg: number) => ((deg % 360) + 360) % 360;
/** Smallest signed change from a to b, in degrees. */
const turn = (a: number, b: number) => ((b - a + 540) % 360) - 180;
const signOf = (lon: number) => ZODIAC_SIGNS[Math.floor(norm(lon) / 30)] as ZodiacSign;

/** Geocentric apparent ecliptic longitude of date (the tropical zodiac astrologers use). */
function longitude(body: Body, at: Date) {
  if (body === Body.Sun) return SunPosition(at).elon;
  if (body === Body.Moon) return EclipticGeoMoon(at).lon;
  return Ecliptic(GeoVector(body, at, true)).elon;
}

/** Narrows a time window until `changed` flips, to about a minute. */
function refine(lo: number, hi: number, changed: (t: number) => boolean) {
  while (hi - lo > 60_000) {
    const mid = (lo + hi) / 2;
    if (changed(mid)) hi = mid;
    else lo = mid;
  }
  return new Date(hi);
}

function event(kind: AstroKind, at: Date, name: string, extra: Partial<AstroEvent> = {}): AstroEvent {
  return {
    date: `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`,
    time: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
    name,
    kind,
    group: "Astrology",
    category: CATEGORY[kind],
    icon: ICON[kind],
    tone: "violet",
    ...extra,
  };
}

const cache = new Map<string, AstroEvent[]>();

/**
 * Astrological and astronomical events for a calendar year, in the viewer's time zone:
 * new and full Moons (with sign and traditional name), eclipses, equinoxes and solstices,
 * the Sun and planets changing sign, and retrograde and direct stations.
 * Computed offline with astronomy-engine (accurate to about a minute of arc), so it needs no API.
 *
 * @example
 * <ContentCalendar markers={[...astroEvents(2026), ...usHolidays(2026)]} … />
 */
export function astroEvents(year: number, options: AstroOptions = {}): AstroEvent[] {
  const {
    kinds = ["moon", "eclipse", "season", "ingress", "retrograde"],
    planets = PLANETS,
    moonQuarters = false,
    hemisphere = "north",
  } = options;
  const cacheKey = JSON.stringify([year, kinds, planets, moonQuarters, hemisphere]);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const inYear = (d: Date) => d >= start && d < end;
  const events: AstroEvent[] = [];
  const want = new Set(kinds);

  if (want.has("moon")) {
    const phases: [number, string][] = [
      [0, "New Moon"],
      [180, "Full Moon"],
    ];
    if (moonQuarters) phases.push([90, "First Quarter Moon"], [270, "Last Quarter Moon"]);
    const fulls: AstroEvent[] = [];
    for (const [target, label] of phases) {
      let from = new Date(start.getTime() - 2 * DAY);
      for (;;) {
        const found = SearchMoonPhase(target, from, 40);
        if (!found || found.date >= end) break;
        if (inYear(found.date)) {
          const sign = signOf(longitude(Body.Moon, found.date));
          const e = event("moon", found.date, `${label} in ${sign}`, { sign });
          events.push(e);
          if (target === 180) fulls.push(e);
        }
        from = new Date(found.date.getTime() + DAY);
      }
    }
    // Full Moon names: by month, with the Harvest Moon nearest the September equinox,
    // the Hunter's Moon after it, and a Blue Moon for a month's second full Moon.
    fulls.sort((a, b) => a.date.localeCompare(b.date));
    const equinox = Seasons(year).sep_equinox.date.getTime();
    const at = (e: AstroEvent) => new Date(`${e.date}T${e.time}`).getTime();
    const harvest = fulls.reduce<AstroEvent | undefined>(
      (best, e) => (!best || Math.abs(at(e) - equinox) < Math.abs(at(best) - equinox) ? e : best),
      undefined,
    );
    fulls.forEach((e, i) => {
      const month = Number(e.date.slice(5, 7)) - 1;
      const previous = fulls[i - 1];
      e.description =
        e === harvest
          ? "Harvest Moon"
          : previous === harvest && previous
            ? "Hunter's Moon"
            : previous?.date.slice(0, 7) === e.date.slice(0, 7)
              ? "Blue Moon"
              : FULL_MOON_NAMES[month];
    });
  }

  if (want.has("eclipse")) {
    const kindName = (k: string) => k.charAt(0).toUpperCase() + k.slice(1);
    for (let e = SearchLunarEclipse(new Date(start.getTime() - DAY)); e.peak.date < end; e = NextLunarEclipse(e.peak)) {
      if (!inYear(e.peak.date)) continue;
      const sign = signOf(longitude(Body.Moon, e.peak.date));
      events.push(event("eclipse", e.peak.date, `${kindName(e.kind)} lunar eclipse in ${sign}`, { sign }));
    }
    for (
      let e = SearchGlobalSolarEclipse(new Date(start.getTime() - DAY));
      e.peak.date < end;
      e = NextGlobalSolarEclipse(e.peak)
    ) {
      if (!inYear(e.peak.date)) continue;
      const sign = signOf(longitude(Body.Sun, e.peak.date));
      events.push(event("eclipse", e.peak.date, `${kindName(e.kind)} solar eclipse in ${sign}`, { sign }));
    }
  }

  if (want.has("season")) {
    const s = Seasons(year);
    const north = hemisphere === "north";
    const seasons: [Date, string, ZodiacSign][] = [
      [s.mar_equinox.date, north ? "Spring equinox" : "Autumn equinox", "Aries"],
      [s.jun_solstice.date, north ? "Summer solstice" : "Winter solstice", "Cancer"],
      [s.sep_equinox.date, north ? "Autumn equinox" : "Spring equinox", "Libra"],
      [s.dec_solstice.date, north ? "Winter solstice" : "Summer solstice", "Capricorn"],
    ];
    for (const [date, name, sign] of seasons) {
      events.push(event("season", date, name, { sign, description: `Sun enters ${sign}. ${sign} season begins` }));
    }
  }

  // Sun and planets: sample once a day, then narrow down each sign change and station.
  const bodies: [Body, string][] = [];
  if (want.has("season")) bodies.push([Body.Sun, "Sun"]);
  if (want.has("ingress") || want.has("retrograde")) {
    for (const p of planets) bodies.push([Body[p], p]);
  }
  const t0 = start.getTime() - DAY;
  const days = Math.round((end.getTime() - t0) / DAY) + 1;
  for (const [body, name] of bodies) {
    const lon = (t: number) => longitude(body, new Date(t));
    const sign = (t: number) => Math.floor(norm(lon(t)) / 30);
    const motion = (t: number) => turn(lon(t - 3_600_000), lon(t + 3_600_000));
    let prevLon = lon(t0);
    let prevDelta = turn(lon(t0 - DAY), prevLon);
    for (let i = 1; i < days; i++) {
      const t = t0 + i * DAY;
      const l = lon(t);
      const delta = turn(prevLon, l);
      if (Math.floor(norm(l) / 30) !== Math.floor(norm(prevLon) / 30)) {
        const from = Math.floor(norm(prevLon) / 30);
        const at = refine(t - DAY, t, (x) => sign(x) !== from);
        const entered = signOf(l);
        if (inYear(at)) {
          if (body === Body.Sun) {
            // Equinoxes and solstices already cover the cardinal signs.
            if (!["Aries", "Cancer", "Libra", "Capricorn"].includes(entered)) {
              events.push(
                event("season", at, `Sun enters ${entered}`, {
                  sign: entered,
                  description: `${entered} season begins`,
                }),
              );
            }
          } else if (want.has("ingress")) {
            events.push(
              event("ingress", at, delta < 0 ? `${name} retrogrades into ${entered}` : `${name} enters ${entered}`, {
                sign: entered,
              }),
            );
          }
        }
      }
      // A change in the direction of daily motion means a station in the last two days.
      if (body !== Body.Sun && want.has("retrograde") && Math.sign(delta) !== Math.sign(prevDelta)) {
        const wasForward = prevDelta > 0;
        const at = refine(t - 2 * DAY, t, (x) => motion(x) > 0 !== wasForward);
        const where = signOf(lon(at.getTime()));
        if (inYear(at)) {
          events.push(
            event("retrograde", at, `${name} stations ${wasForward ? "retrograde" : "direct"} in ${where}`, {
              sign: where,
              description: wasForward ? `${name} retrograde begins` : `${name} retrograde ends`,
            }),
          );
        }
      }
      prevLon = l;
      prevDelta = delta;
    }
  }

  events.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  cache.set(cacheKey, events);
  return events;
}
