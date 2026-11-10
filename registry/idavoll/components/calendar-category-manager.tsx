// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useId, useState } from "react";
import {
  CALENDAR_COLORS,
  type CalendarColor,
  CalendarColorPicker,
  CalendarIconPicker,
} from "@/components/idavoll/calendar-entry-dialog";
import { type CalendarCategory, type CalendarIconName, EventIcon } from "@/components/idavoll/content-calendar";
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

export interface CalendarCategoryManagerProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called to open or close it. */
  onOpenChange: (open: boolean) => void;
  /** The viewer's categories. */
  categories: CalendarCategory[];
  /** Called with a new or changed category. New ones get crypto.randomUUID(). */
  onSave: (category: CalendarCategory) => void;
  /** Called to delete a category. Shows a Delete button on each one. */
  onDelete?: (id: string) => void;
  /** How many entries use each category, by id, so deleting can say what happens to them. */
  entryCounts?: Record<string, number>;
  /** Preset colors. Defaults to CALENDAR_COLORS. */
  colors?: CalendarColor[];
  /** Words for the dialog, e.g. { title: "Your calendars", noun: "calendar" }. */
  labels?: { title?: string; description?: string; noun?: string };
}

type Draft = { id?: string; name: string; color: string; icon: CalendarIconName };

/**
 * A dialog for the viewer's own calendar categories: add, rename, recolor, change the
 * icon, and delete (with a confirm step that says the entries stay). Pair it with
 * ContentCalendar's onManageCategories.
 */
export function CalendarCategoryManager({
  open,
  onOpenChange,
  categories,
  onSave,
  onDelete,
  entryCounts = {},
  colors = CALENDAR_COLORS,
  labels = {},
}: CalendarCategoryManagerProps) {
  const id = useId();
  const noun = labels.noun ?? "category";
  const blank = (): Draft => ({ name: "", color: colors[0]?.value ?? "#475569", icon: "sparkles" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setConfirming(null);
      setError(null);
    }
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    if (!name) {
      setError(`Give the ${noun} a name.`);
      return;
    }
    onSave({ id: draft.id ?? crypto.randomUUID(), name, color: draft.color, icon: draft.icon });
    setDraft(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{labels.title ?? "Your categories"}</DialogTitle>
          <DialogDescription>
            {labels.description ?? `Group your own entries. Each ${noun} has a color and an icon.`}
          </DialogDescription>
        </DialogHeader>

        {categories.length === 0 && !draft ? (
          <p className="text-foreground/70 text-sm">No {noun}s yet.</p>
        ) : (
          <ul className="-mx-2 space-y-0.5">
            {categories.map((c) => {
              const count = entryCounts[c.id] ?? 0;
              return (
                <li key={c.id} className="rounded-lg px-2 py-1.5">
                  {confirming === c.id ? (
                    <div className="space-y-2 text-sm">
                      <p className="[overflow-wrap:anywhere]">
                        Delete “{c.name}”?{" "}
                        {count > 0
                          ? `Its ${count} ${count === 1 ? "entry stays" : "entries stay"}, without a ${noun}.`
                          : `It has no entries.`}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="cursor-pointer"
                          onClick={() => {
                            onDelete?.(c.id);
                            setConfirming(null);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="cursor-pointer"
                          onClick={() => setConfirming(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-2">
                      <EventIcon
                        event={{ id: c.id, date: "", title: c.name, color: c.color, icon: c.icon ?? "sparkles" }}
                        className="size-6 rounded-md"
                      />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="block font-medium [overflow-wrap:anywhere]">{c.name}</span>
                        <span className="text-foreground/70 text-xs">
                          {count} {count === 1 ? "entry" : "entries"}
                        </span>
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 cursor-pointer"
                        aria-label={`Edit ${c.name}`}
                        onClick={() => {
                          setDraft({ id: c.id, name: c.name, color: c.color, icon: c.icon ?? "sparkles" });
                          setError(null);
                        }}
                      >
                        <Pencil aria-hidden />
                      </Button>
                      {onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 cursor-pointer hover:text-destructive"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => setConfirming(c.id)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {draft ? (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border p-4">
            <p className="font-medium text-sm">{draft.id ? `Edit ${noun}` : `New ${noun}`}</p>
            <div className="space-y-2">
              <Label htmlFor={`${id}-name`}>Name</Label>
              <Input
                id={`${id}-name`}
                value={draft.name}
                maxLength={60}
                autoFocus
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Filming days"
              />
              {error && (
                <p id={`${id}-error`} className="text-destructive text-sm">
                  {error}
                </p>
              )}
            </div>
            <CalendarIconPicker value={draft.icon} onChange={(icon) => setDraft({ ...draft, icon })} />
            <CalendarColorPicker
              value={draft.color}
              onChange={(color) => setDraft({ ...draft, color })}
              colors={colors}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="cursor-pointer">
                {draft.id ? "Save" : `Add ${noun}`}
              </Button>
              <Button type="button" size="sm" variant="ghost" className="cursor-pointer" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          {!draft ? (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setDraft(blank());
                setError(null);
              }}
            >
              <Plus aria-hidden />
              Add a {noun}
            </Button>
          ) : (
            <span />
          )}
          <Button className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
