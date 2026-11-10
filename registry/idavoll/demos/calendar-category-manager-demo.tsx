// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { Settings2 } from "lucide-react";
import { useState } from "react";
import { CalendarCategoryManager } from "@/components/idavoll/calendar-category-manager";
import type { CalendarCategory } from "@/components/idavoll/content-calendar";
import { Button } from "@/components/ui/button";

export default function CalendarCategoryManagerDemo() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CalendarCategory[]>([
    { id: "filming", name: "Filming", color: "#0d9488", icon: "camera" },
    { id: "rest", name: "Rest", color: "#7c3aed", icon: "leaf" },
    { id: "deals", name: "Brand deals", color: "#d97706", icon: "briefcase" },
  ]);
  return (
    <>
      <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(true)}>
        <Settings2 aria-hidden />
        Manage calendars
      </Button>
      <CalendarCategoryManager
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        entryCounts={{ filming: 4, rest: 1 }}
        labels={{ title: "Your calendars", noun: "calendar" }}
        onSave={(c) =>
          setCategories((list) =>
            list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c],
          )
        }
        onDelete={(id) => setCategories((list) => list.filter((x) => x.id !== id))}
      />
    </>
  );
}
