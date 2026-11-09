// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
export interface Holiday {
  /** The day, as "YYYY-MM-DD". */
  date: string;
  /** Holiday name, e.g. "Thanksgiving". */
  name: string;
  /** "federal" for US federal holidays (most offices and banks close); "observance" for other well-known days. */
  kind: "federal" | "observance";
  /** Filter group, for content-calendar markers. Always "Holidays". */
  group: "Holidays";
  /** Filter option, for content-calendar markers: "Federal holidays" or "Other holidays". */
  category: string;
  /** Icon name, for content-calendar markers: a flag for federal holidays, a star for others. */
  icon: "flag" | "star";
  /** Color, for content-calendar markers. */
  tone: "amber";
}

type HolidayBase = Pick<Holiday, "date" | "name" | "kind">;
const marker = (h: HolidayBase): Holiday => ({
  ...h,
  group: "Holidays",
  category: h.kind === "federal" ? "Federal holidays" : "Other holidays",
  icon: h.kind === "federal" ? "flag" : "star",
  tone: "amber",
});

export interface USHolidayOptions {
  /** Include well-known non-federal days that matter for content (Mother's Day, Halloween, Black Friday…). Defaults to true. */
  observances?: boolean;
  /**
   * Also add the weekday a federal holiday is observed on when it falls on a weekend
   * (Saturday → Friday, Sunday → Monday), e.g. "Independence Day (observed)". Defaults to false.
   */
  observed?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const key = (year: number, month: number, day: number) => {
  const d = new Date(year, month - 1, day);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** The nth weekday of a month (weekday 0 = Sunday). n = -1 means the last one. */
function nthWeekday(year: number, month: number, weekday: number, n: number) {
  if (n > 0) {
    const first = new Date(year, month - 1, 1).getDay();
    return key(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
  }
  const lastDate = new Date(year, month, 0);
  return key(year, month, lastDate.getDate() - ((lastDate.getDay() - weekday + 7) % 7));
}

/** Easter Sunday (Western), using the anonymous Gregorian algorithm. */
function easter(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return key(year, month, day);
}

const shift = (date: string, days: number) => {
  const [y = 1970, m = 1, d = 1] = date.split("-").map(Number);
  return key(y, m, d + days);
};

/**
 * US holidays for a year: the 11 federal holidays, plus (by default) well-known days that
 * creators plan content around. Works offline from fixed rules, so it needs no API.
 *
 * @example
 * <ContentCalendar markers={[...usHolidays(2026), ...usHolidays(2027)]} … />
 */
export function usHolidays(year: number, { observances = true, observed = false }: USHolidayOptions = {}): Holiday[] {
  const thanksgiving = nthWeekday(year, 11, 4, 4);
  const federal: HolidayBase[] = [
    { date: key(year, 1, 1), name: "New Year's Day" },
    { date: nthWeekday(year, 1, 1, 3), name: "Martin Luther King Jr. Day" },
    { date: nthWeekday(year, 2, 1, 3), name: "Presidents' Day" },
    { date: nthWeekday(year, 5, 1, -1), name: "Memorial Day" },
    { date: key(year, 6, 19), name: "Juneteenth" },
    { date: key(year, 7, 4), name: "Independence Day" },
    { date: nthWeekday(year, 9, 1, 1), name: "Labor Day" },
    { date: nthWeekday(year, 10, 1, 2), name: "Columbus Day" },
    { date: key(year, 11, 11), name: "Veterans Day" },
    { date: thanksgiving, name: "Thanksgiving" },
    { date: key(year, 12, 25), name: "Christmas Day" },
  ].map((h) => ({ ...h, kind: "federal" as const }));

  const extra: HolidayBase[] = [];
  if (observed) {
    for (const h of federal) {
      const weekday = new Date(`${h.date}T12:00`).getDay();
      const moved = weekday === 6 ? shift(h.date, -1) : weekday === 0 ? shift(h.date, 1) : null;
      if (moved) extra.push({ date: moved, name: `${h.name} (observed)`, kind: "federal" });
    }
  }
  if (observances) {
    extra.push(
      ...[
        { date: key(year, 2, 14), name: "Valentine's Day" },
        { date: key(year, 3, 17), name: "St. Patrick's Day" },
        { date: easter(year), name: "Easter" },
        { date: key(year, 4, 22), name: "Earth Day" },
        { date: nthWeekday(year, 5, 0, 2), name: "Mother's Day" },
        { date: nthWeekday(year, 6, 0, 3), name: "Father's Day" },
        { date: key(year, 10, 31), name: "Halloween" },
        { date: shift(thanksgiving, 1), name: "Black Friday" },
        { date: shift(thanksgiving, 4), name: "Cyber Monday" },
        { date: key(year, 12, 24), name: "Christmas Eve" },
        { date: key(year, 12, 31), name: "New Year's Eve" },
      ].map((h) => ({ ...h, kind: "observance" as const })),
    );
  }
  return [...federal, ...extra].map(marker).sort((a, b) => a.date.localeCompare(b.date));
}
