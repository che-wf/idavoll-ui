// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { ArrowUp, Check, Moon, Sparkles, Sun, X } from "lucide-react";
import { useId, useState } from "react";
import { type BigThreeResult, bigThree, SIGNS, type Sign } from "@/components/idavoll/birth-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export { bigThree, SIGNS, type Sign };

/** Zodiac glyphs, forced to text style so they don't turn into emoji. */
export const SIGN_GLYPHS: Record<Sign, string> = {
  Aries: "♈︎",
  Taurus: "♉︎",
  Gemini: "♊︎",
  Cancer: "♋︎",
  Leo: "♌︎",
  Virgo: "♍︎",
  Libra: "♎︎",
  Scorpio: "♏︎",
  Sagittarius: "♐︎",
  Capricorn: "♑︎",
  Aquarius: "♒︎",
  Pisces: "♓︎",
};

type Element = "fire" | "earth" | "air" | "water";

/** Each sign's element and its usual Sun dates (tropical zodiac; edges shift by a day some years). */
export const SIGN_INFO: Record<Sign, { element: Element; dates: string }> = {
  Aries: { element: "fire", dates: "Mar 21 – Apr 19" },
  Taurus: { element: "earth", dates: "Apr 20 – May 20" },
  Gemini: { element: "air", dates: "May 21 – Jun 20" },
  Cancer: { element: "water", dates: "Jun 21 – Jul 22" },
  Leo: { element: "fire", dates: "Jul 23 – Aug 22" },
  Virgo: { element: "earth", dates: "Aug 23 – Sep 22" },
  Libra: { element: "air", dates: "Sep 23 – Oct 22" },
  Scorpio: { element: "water", dates: "Oct 23 – Nov 21" },
  Sagittarius: { element: "fire", dates: "Nov 22 – Dec 21" },
  Capricorn: { element: "earth", dates: "Dec 22 – Jan 19" },
  Aquarius: { element: "air", dates: "Jan 20 – Feb 18" },
  Pisces: { element: "water", dates: "Feb 19 – Mar 20" },
};

/** Element tints for the glyph badges: warm fire, green earth, sky air, violet water. */
const ELEMENT_STYLE: Record<Element, string> = {
  fire: "bg-orange-500/15 text-orange-700 ring-orange-500/30 dark:text-orange-300",
  earth: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
  air: "bg-sky-500/15 text-sky-700 ring-sky-500/30 dark:text-sky-300",
  water: "bg-violet-500/15 text-violet-700 ring-violet-500/30 dark:text-violet-300",
};

/** A sign's glyph in a round badge tinted by its element. */
export function SignGlyph({ sign, className }: { sign: Sign; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid size-6 shrink-0 place-items-center rounded-full font-sans text-sm leading-none ring-1 ring-inset",
        ELEMENT_STYLE[SIGN_INFO[sign].element],
        className,
      )}
    >
      {SIGN_GLYPHS[sign]}
    </span>
  );
}

const DEFAULT_LABELS = {
  title: "Big three",
  sun: "Sun",
  moon: "Moon",
  rising: "Rising",
  notSet: "Not set",
  sunMeaning: "Who you are",
  moonMeaning: "How you feel",
  risingMeaning: "How you come across",
  choose: "Choose your sign",
  /** {placement} becomes Sun, Moon or Rising. */
  pickerTitle: "Your {placement} sign",
  clear: "Clear",
  /** {sign} and {placement} are filled in, e.g. "Leo Sun". */
  phrase: "{sign} {placement}",
  calculate: "Don't know your Moon or Rising? Work them out",
  hideCalculator: "Hide the calculator",
  birthDate: "Birth date",
  birthTime: "Birth time (optional)",
  timeZone: "Time zone where you were born",
  latitude: "Birthplace latitude",
  longitude: "Birthplace longitude",
  placeHint: "Search your birth town on a map to find these. Needed for Rising only.",
  privacy: "Worked out on this device. Only the signs are saved, never your birth details.",
  use: "Use these signs",
  /** {a} and {b} become two signs. */
  moonUnclear: "Your Moon was in {a} or {b} that day. Add a birth time to know which.",
  needsTimeAndPlace: "Rising needs a birth time and place.",
  chooseZone: "Choose a time zone",
  needsZone: "Pick your birthplace's time zone to use the birth time. It may differ from where you live now.",
};

export interface BigThreeSigns {
  sun?: Sign;
  moon?: Sign;
  rising?: Sign;
}

const ROWS = [
  { key: "sun", icon: Sun },
  { key: "moon", icon: Moon },
  { key: "rising", icon: ArrowUp },
] as const;

export interface BigThreeProps {
  /** The person's signs. Any can be missing. */
  signs: BigThreeSigns;
  /** "chips" for a profile line, "list" for a settings card. Defaults to "chips". */
  variant?: "chips" | "list";
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Sun, Moon and Rising signs for a profile, phrased the way astrology fans say them ("Leo Sun"),
 * each with its glyph in a badge tinted by element. Shows only the signs that are set; renders
 * nothing if none are.
 */
export function BigThree({ signs, variant = "chips", labels: labelOverrides, className }: BigThreeProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const rows = ROWS.filter((r) => signs[r.key]);
  if (rows.length === 0) return null;
  return (
    <ul
      aria-label={labels.title}
      className={cn(variant === "chips" ? "flex flex-wrap gap-1.5" : "divide-y rounded-xl border", className)}
    >
      {rows.map(({ key, icon: Icon }) => {
        const sign = signs[key] as Sign;
        const phrase = labels.phrase.replace("{sign}", sign).replace("{placement}", labels[key]);
        return variant === "chips" ? (
          <li key={key} className="flex items-center gap-1.5 rounded-full border bg-card py-0.5 pr-3 pl-0.5 text-sm">
            <SignGlyph sign={sign} />
            <span className="flex items-center gap-1">
              <span className="font-medium">{sign}</span>
              {/* The placement's own symbol: sun, moon or rising arrow. */}
              <span className="flex items-center gap-0.5 text-foreground/70">
                <Icon aria-hidden className="size-3.5" />
                {labels[key]}
              </span>
            </span>
          </li>
        ) : (
          <li key={key} className="flex items-center gap-3 px-3 py-2.5">
            <SignGlyph sign={sign} className="size-9 text-lg" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-sm">{phrase}</span>
              <span className="flex items-center gap-1 text-foreground/70 text-xs">
                <Icon aria-hidden className="size-3" />
                {labels[`${key}Meaning`]}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** One placement's card: shows the chosen sign, and opens a grid of all twelve to pick from. */
function SignSlot({
  placement,
  icon: Icon,
  value,
  onChange,
  labels,
}: {
  placement: "sun" | "moon" | "rising";
  icon: typeof Sun;
  value?: Sign;
  onChange: (sign: Sign | undefined) => void;
  labels: typeof DEFAULT_LABELS;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const name = labels[placement];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full cursor-pointer flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-ring",
            !value && "border-dashed",
          )}
        >
          <span className="flex w-full items-center gap-1.5 text-foreground/70 text-xs">
            <Icon aria-hidden className="size-3.5" />
            <span className="font-medium text-foreground">{name}</span>
            <span aria-hidden>·</span>
            {labels[`${placement}Meaning`]}
          </span>
          <span className="flex items-center gap-2.5">
            {value ? (
              <SignGlyph sign={value} className="size-10 text-xl" />
            ) : (
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full border border-dashed text-foreground/50"
              >
                <Sparkles className="size-4" />
              </span>
            )}
            <span className={cn("font-heading text-base", value ? "font-semibold" : "text-foreground/70")}>
              {value ?? labels.choose}
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <fieldset>
          <legend className="mb-2 font-heading font-semibold text-sm">
            {labels.pickerTitle.replace("{placement}", name)}
          </legend>
          <div className="grid grid-cols-3 gap-1.5">
            {SIGNS.map((sign) => (
              <label key={sign} className="relative">
                <input
                  type="radio"
                  name={id}
                  value={sign}
                  checked={value === sign}
                  onChange={() => {
                    onChange(sign);
                    setOpen(false);
                  }}
                  className="peer sr-only"
                />
                <span className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-transparent p-2 text-center transition-colors hover:bg-muted peer-checked:border-foreground/40 peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                  <SignGlyph sign={sign} className="size-8 text-base" />
                  <span className="font-medium text-xs">{sign}</span>
                  {placement === "sun" && (
                    <span className="text-[0.6rem] text-foreground/70 leading-tight">{SIGN_INFO[sign].dates}</span>
                  )}
                </span>
                {value === sign && <Check aria-hidden className="absolute top-1 right-1 size-3.5 text-foreground/70" />}
              </label>
            ))}
          </div>
        </fieldset>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            <X aria-hidden />
            {labels.clear}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export interface BigThreeEditorProps {
  /** The chosen signs. */
  value: BigThreeSigns;
  /** Called with the new signs. Save these, not birth details. */
  onChange: (value: BigThreeSigns) => void;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Pick Sun, Moon and Rising signs, for people who know them. An optional calculator works
 * them out from birth date, time and place, entirely on the device; only the signs are
 * passed on.
 */
export function BigThreeEditor({ value, onChange, labels: labelOverrides, className }: BigThreeEditorProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // No default: the viewer's current zone is often not their birthplace's, and an hour off can change two signs.
  const [zone, setZone] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const zones = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

  let result: BigThreeResult | undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    try {
      const latitude = lat.trim() === "" ? undefined : Number(lat);
      const longitude = lon.trim() === "" ? undefined : Number(lon);
      result = bigThree({
        date,
        time: time && zone ? time : undefined,
        timeZone: zone || "UTC",
        latitude: Number.isFinite(latitude) ? latitude : undefined,
        longitude: Number.isFinite(longitude) ? longitude : undefined,
      });
    } catch {
      result = undefined;
    }
  }

  const select =
    "h-9 w-full cursor-pointer rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring";

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-3">
        {ROWS.map(({ key, icon }) => (
          <SignSlot
            key={key}
            placement={key}
            icon={icon}
            value={value[key]}
            onChange={(sign) => onChange({ ...value, [key]: sign })}
            labels={labels}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 text-primary"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Sparkles aria-hidden />
        {open ? labels.hideCalculator : labels.calculate}
      </Button>

      {open && (
        <div className="space-y-3 rounded-xl border p-3">
          <p className="text-foreground/75 text-xs">{labels.privacy}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-date`}>{labels.birthDate}</Label>
              <Input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-time`}>{labels.birthTime}</Label>
              <Input id={`${id}-time`} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`${id}-zone`}>{labels.timeZone}</Label>
              <select id={`${id}-zone`} className={select} value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="">{labels.chooseZone}</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {z.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-lat`}>{labels.latitude}</Label>
              <Input
                id={`${id}-lat`}
                inputMode="decimal"
                placeholder="e.g. 41.88"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                aria-describedby={`${id}-place-hint`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${id}-lon`}>{labels.longitude}</Label>
              <Input
                id={`${id}-lon`}
                inputMode="decimal"
                placeholder="e.g. -87.63"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                aria-describedby={`${id}-place-hint`}
              />
            </div>
            <p id={`${id}-place-hint`} className="text-foreground/70 text-xs sm:col-span-2">
              {labels.placeHint}
            </p>
          </div>

          {result && (
            <div className="space-y-2 border-t pt-3" aria-live="polite">
              <BigThree signs={{ sun: result.sun, moon: result.moon, rising: result.rising }} />
              {result.moonOptions && !time && (
                <p className="text-foreground/75 text-xs">
                  {labels.moonUnclear.replace("{a}", result.moonOptions[0]).replace("{b}", result.moonOptions[1])}
                </p>
              )}
              {time && !zone ? (
                <p className="text-foreground/75 text-xs">{labels.needsZone}</p>
              ) : (
                !result.rising && <p className="text-foreground/75 text-xs">{labels.needsTimeAndPlace}</p>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onChange({
                    sun: result.sun,
                    moon: result.moon ?? value.moon,
                    rising: result.rising ?? value.rising,
                  });
                  setOpen(false);
                }}
              >
                {labels.use}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
