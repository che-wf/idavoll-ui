// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { ArrowUp, Calculator, Moon, Sun } from "lucide-react";
import { useId, useState } from "react";
import { type BigThreeResult, bigThree, SIGNS, type Sign } from "@/components/idavoll/birth-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const DEFAULT_LABELS = {
  title: "Big three",
  sun: "Sun",
  moon: "Moon",
  rising: "Rising",
  notSet: "Not set",
  calculate: "Work them out from my birth details",
  hideCalculator: "Hide calculator",
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

/** Sun, Moon and Rising signs for a profile. Shows only the signs that are set; renders nothing if none are. */
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
        return (
          <li
            key={key}
            className={cn(
              "flex items-center gap-1.5 text-sm",
              variant === "chips" ? "rounded-full border bg-muted/40 py-0.5 pr-2.5 pl-2" : "justify-between px-3 py-2",
            )}
          >
            <span className="flex items-center gap-1.5 text-foreground/70">
              <Icon aria-hidden className="size-3.5" />
              {labels[key]}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span aria-hidden className="font-sans">
                {SIGN_GLYPHS[sign]}
              </span>
              {sign}
            </span>
          </li>
        );
      })}
    </ul>
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
        {ROWS.map(({ key, icon: Icon }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`${id}-${key}`} className="flex items-center gap-1.5">
              <Icon aria-hidden className="size-3.5" />
              {labels[key]}
            </Label>
            <select
              id={`${id}-${key}`}
              className={select}
              value={value[key] ?? ""}
              onChange={(e) => onChange({ ...value, [key]: (e.target.value || undefined) as Sign | undefined })}
            >
              <option value="">{labels.notSet}</option>
              {SIGNS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Calculator aria-hidden />
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
