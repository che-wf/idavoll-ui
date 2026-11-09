// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import {
  type Body,
  Ecliptic,
  EclipticGeoMoon,
  e_tilt,
  GeoVector,
  MakeTime,
  SiderealTime,
  SunPosition,
} from "astronomy-engine";

export const SIGNS = [
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
export type Sign = (typeof SIGNS)[number];

const norm = (deg: number) => ((deg % 360) + 360) % 360;
export const signOf = (longitude: number) => SIGNS[Math.floor(norm(longitude) / 30)] as Sign;

/** Offset of a time zone from UTC at a moment, in minutes (e.g. -300 for New York in winter). */
function zoneOffset(utcMs: number, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, Number(p.value)]),
  );
  const n = (key: string) => parts[key] ?? 0;
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return Math.round((asUtc - utcMs) / 60_000);
}

/** Converts a wall-clock time in a time zone ("1990-07-14", "06:30", "America/Chicago") to a Date. */
export function zonedTime(date: string, time: string, timeZone: string): Date {
  const [y = 1970, m = 1, d = 1] = date.split("-").map(Number);
  const [h = 0, min = 0] = time.split(":").map(Number);
  const wall = Date.UTC(y, m - 1, d, h, min);
  // Two passes settle daylight-saving changes.
  let utc = wall - zoneOffset(wall, timeZone) * 60_000;
  utc = wall - zoneOffset(utc, timeZone) * 60_000;
  return new Date(utc);
}

/**
 * Ecliptic longitude of the ascendant, in degrees, from the sidereal angle of the meridian
 * (RAMC), latitude and the obliquity of the ecliptic.
 */
export function ascendantLongitude(ramcDeg: number, latitudeDeg: number, obliquityDeg: number) {
  const r = (deg: number) => (deg * Math.PI) / 180;
  const ramc = r(ramcDeg);
  const eps = r(obliquityDeg);
  const lat = r(latitudeDeg);
  return norm(
    (Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) * 180) / Math.PI,
  );
}

export interface BirthDetails {
  /** Birth date, "YYYY-MM-DD". */
  date: string;
  /** Birth time, "HH:MM" (24-hour), in the birthplace's local time. Needed for the Moon (usually) and Rising. */
  time?: string;
  /** IANA time zone of the birthplace, e.g. "America/Chicago". Defaults to the viewer's. */
  timeZone?: string;
  /** Birthplace latitude and longitude in degrees (north and east positive). Needed for Rising. */
  latitude?: number;
  longitude?: number;
}

export interface BigThreeResult {
  sun: Sign;
  /** Undefined when there's no birth time and the Moon changed sign that day. */
  moon?: Sign;
  /** The two possible Moon signs when the time is missing and the Moon changed sign that day. */
  moonOptions?: [Sign, Sign];
  /** Undefined without a birth time and place. */
  rising?: Sign;
}

/**
 * Sun, Moon and Rising signs (tropical zodiac) from birth details. Pure and offline; it
 * runs in the browser, so birth details never need to leave the device. Store only the
 * resulting signs.
 */
export function bigThree(birth: BirthDetails): BigThreeResult {
  const zone = birth.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const moonAt = (d: Date) => signOf(EclipticGeoMoon(d).lon);

  if (!birth.time) {
    const start = zonedTime(birth.date, "00:00", zone);
    const end = zonedTime(birth.date, "23:59", zone);
    const noon = zonedTime(birth.date, "12:00", zone);
    const [a, b] = [moonAt(start), moonAt(end)];
    return {
      sun: signOf(SunPosition(noon).elon),
      ...(a === b ? { moon: a } : { moonOptions: [a, b] as [Sign, Sign] }),
    };
  }

  const when = zonedTime(birth.date, birth.time, zone);
  const result: BigThreeResult = { sun: signOf(SunPosition(when).elon), moon: moonAt(when) };
  if (birth.latitude !== undefined && birth.longitude !== undefined && Math.abs(birth.latitude) < 66) {
    const t = MakeTime(when);
    const ramc = norm(SiderealTime(t) * 15 + birth.longitude);
    result.rising = signOf(ascendantLongitude(ramc, birth.latitude, e_tilt(t).tobl));
  }
  return result;
}

// Kept for completeness: geocentric longitude of a planet, if a fuller chart is added later.
export const planetLongitude = (body: Body, when: Date) => Ecliptic(GeoVector(body, when, true)).elon;
