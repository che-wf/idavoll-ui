"use client";

import { Check, Plus } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import {
  CALENDAR_ICONS,
  type CalendarCategory,
  type CalendarEvent,
  type CalendarIconName,
  readableOn,
} from "@/components/idavoll/content-calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface CalendarColor {
  /** Name read by screen readers, e.g. "Teal". */
  name: string;
  /** Hex code, e.g. "#0d9488". */
  value: string;
}

/** Strong, mid-tone colors that work as icon tiles in light and dark themes. */
export const CALENDAR_COLORS: CalendarColor[] = [
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
  { name: "Amber", value: "#d97706" },
  { name: "Lime", value: "#65a30d" },
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#0d9488" },
  { name: "Sky", value: "#0284c7" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
  { name: "Slate", value: "#475569" },
];

const ICON_LABELS: Record<CalendarIconName, string> = {
  sparkles: "Sparkles",
  star: "Star",
  heart: "Heart",
  camera: "Camera",
  video: "Video",
  mic: "Microphone",
  music: "Music",
  pen: "Pen",
  book: "Book",
  coffee: "Coffee",
  dumbbell: "Workout",
  leaf: "Leaf",
  moon: "Moon",
  sun: "Sun",
  flame: "Flame",
  plane: "Travel",
  gift: "Gift",
  briefcase: "Work",
  party: "Party",
  flag: "Flag",
};

export interface CalendarEntryDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called to open or close it. */
  onOpenChange: (open: boolean) => void;
  /** The entry to edit. Leave unset to add a new one. */
  entry?: CalendarEvent;
  /** Date for a new entry, as "YYYY-MM-DD". */
  defaultDate: string;
  /** The viewer's categories to choose from. */
  categories?: CalendarCategory[];
  /** Called with the finished entry. New entries get a random id. */
  onSave: (entry: CalendarEvent) => void;
  /** Shows a Delete button when editing. */
  onDelete?: (id: string) => void;
  /** Lets the viewer make a new category from the form, using the chosen icon and color. */
  onCreateCategory?: (category: CalendarCategory) => void;
  /** Colors to offer. A "Custom" color picker is always added. Defaults to CALENDAR_COLORS. */
  colors?: CalendarColor[];
}

const NONE = "";
const NEW = "__new";
const swatch =
  "grid size-8 cursor-pointer place-items-center rounded-full ring-offset-2 ring-offset-background peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring";

/**
 * A form in a dialog for the viewer's own calendar entries: title, date, time, a category,
 * an icon and a color. Picking a category uses its icon and color unless the viewer picks
 * their own. Optionally creates a new category on the spot.
 */
export function CalendarEntryDialog({
  open,
  onOpenChange,
  entry,
  defaultDate,
  categories = [],
  onSave,
  onDelete,
  onCreateCategory,
  colors = CALENDAR_COLORS,
}: CalendarEntryDialogProps) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState(NONE);
  const [newCategory, setNewCategory] = useState("");
  // undefined means "use the category's".
  const [icon, setIcon] = useState<CalendarIconName | undefined>();
  const [color, setColor] = useState<string | undefined>();

  // Fill the form each time it opens.
  useEffect(() => {
    if (!open) return;
    setTitle(entry?.title ?? "");
    setDate(entry?.date ?? defaultDate);
    setTime(entry?.time ?? "");
    setNotes(entry?.description ?? "");
    setCategory(entry?.category ?? NONE);
    setNewCategory("");
    setIcon(entry?.icon);
    setColor(entry?.color);
  }, [open, entry, defaultDate]);

  const chosen = categories.find((c) => c.id === category);
  const shownIcon = icon ?? chosen?.icon ?? "sparkles";
  const shownColor = color ?? chosen?.color ?? colors[0]?.value ?? "#475569";
  const isCustomColor = !colors.some((c) => c.value === shownColor);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    let categoryId = chosen?.id;
    if (category === NEW && newCategory.trim() && onCreateCategory) {
      categoryId = crypto.randomUUID();
      onCreateCategory({ id: categoryId, name: newCategory.trim(), color: shownColor, icon: shownIcon });
    }
    const usesCategory = categoryId !== undefined && category !== NEW;
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      title: title.trim(),
      date,
      time: time || undefined,
      description: notes.trim() || undefined,
      category: categoryId,
      // Only store an icon or color that differs from the category's, so editing the category updates the entry.
      icon: usesCategory && shownIcon === chosen?.icon ? undefined : shownIcon,
      color: usesCategory && shownColor === chosen?.color ? undefined : shownColor,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded-md"
                style={{ background: shownColor, color: readableOn(shownColor) }}
              >
                {(() => {
                  const Icon = CALENDAR_ICONS[shownIcon];
                  return <Icon className="size-4" strokeWidth={2.5} />;
                })()}
              </span>
              {entry ? "Edit entry" : "Add to calendar"}
            </DialogTitle>
            <DialogDescription>Your own events, like filming days, launches or rest.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor={`${id}-title`}>Title</Label>
            <Input
              id={`${id}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Filming day"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={`${id}-date`}>Date</Label>
              <Input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-time`}>
                Time <span className="font-normal text-foreground/70">(optional)</span>
              </Label>
              <Input id={`${id}-time`} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {(categories.length > 0 || onCreateCategory) && (
            <fieldset className="space-y-2">
              <legend className="mb-2 font-medium text-sm">Category</legend>
              <div className="flex flex-wrap gap-1.5">
                {[{ id: NONE, name: "None" } as const, ...categories].map((c) => (
                  <label key={c.id} className="relative">
                    <input
                      type="radio"
                      name={`${id}-category`}
                      value={c.id}
                      checked={category === c.id}
                      onChange={() => {
                        setCategory(c.id);
                        setIcon(undefined);
                        setColor(undefined);
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm peer-checked:border-foreground peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                      {"color" in c && (
                        <span aria-hidden className="size-2.5 rounded-full" style={{ background: c.color }} />
                      )}
                      {c.name}
                    </span>
                  </label>
                ))}
                {onCreateCategory && (
                  <label className="relative">
                    <input
                      type="radio"
                      name={`${id}-category`}
                      value={NEW}
                      checked={category === NEW}
                      onChange={() => setCategory(NEW)}
                      className="peer sr-only"
                    />
                    <span className="flex cursor-pointer items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-sm peer-checked:border-solid peer-checked:border-foreground peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                      <Plus aria-hidden className="size-3.5" />
                      New category
                    </span>
                  </label>
                )}
              </div>
              {category === NEW && (
                <div className="space-y-2 pt-1">
                  <Label htmlFor={`${id}-new-category`}>Category name</Label>
                  <Input
                    id={`${id}-new-category`}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    placeholder="Brand deals"
                    autoComplete="off"
                  />
                  <p className="text-foreground/70 text-xs">It uses the icon and color you pick below.</p>
                </div>
              )}
            </fieldset>
          )}

          <fieldset>
            <legend className="mb-2 font-medium text-sm">Icon</legend>
            <div className="grid grid-cols-10 gap-1">
              {(Object.keys(CALENDAR_ICONS) as CalendarIconName[]).map((name) => {
                const Icon = CALENDAR_ICONS[name];
                return (
                  <label key={name} className="relative">
                    <input
                      type="radio"
                      name={`${id}-icon`}
                      value={name}
                      checked={shownIcon === name}
                      onChange={() => setIcon(name)}
                      className="peer sr-only"
                      aria-label={ICON_LABELS[name]}
                    />
                    <span className="grid aspect-square cursor-pointer place-items-center rounded-md border border-transparent hover:bg-muted peer-checked:border-foreground peer-checked:bg-muted peer-focus-visible:outline-2 peer-focus-visible:outline-ring">
                      <Icon aria-hidden className="size-4" />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-medium text-sm">Color</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <label key={c.value} className="relative">
                  <input
                    type="radio"
                    name={`${id}-color`}
                    value={c.value}
                    checked={shownColor === c.value}
                    onChange={() => setColor(c.value)}
                    className="peer sr-only"
                    aria-label={c.name}
                  />
                  <span aria-hidden className={swatch} style={{ background: c.value, color: readableOn(c.value) }}>
                    {shownColor === c.value && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </label>
              ))}
              <label className="relative" title="Custom color">
                <input
                  type="color"
                  value={shownColor}
                  onChange={(e) => setColor(e.target.value)}
                  className="peer absolute inset-0 size-8 cursor-pointer opacity-0"
                  aria-label="Custom color"
                />
                <span
                  aria-hidden
                  className={cn(
                    swatch,
                    "pointer-events-none bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]",
                    isCustomColor && "ring-2 ring-foreground",
                  )}
                >
                  {isCustomColor && (
                    <span className="size-4 rounded-full border-2 border-white" style={{ background: shownColor }} />
                  )}
                </span>
              </label>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor={`${id}-notes`}>
              Notes <span className="font-normal text-foreground/70">(optional)</span>
            </Label>
            <Input
              id={`${id}-notes`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Shown under the title in week and agenda views"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {entry && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={() => {
                  onDelete(entry.id);
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{entry ? "Save" : "Add"}</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
