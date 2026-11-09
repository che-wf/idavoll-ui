// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { DateField } from "@/components/idavoll/date-field";

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = toKey(new Date());

export default function DateFieldDemo() {
  const [start, setStart] = useState(today);
  const [income, setIncome] = useState("");
  return (
    <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
      <DateField
        label="Challenge start date"
        value={start}
        onChange={setStart}
        hint={start ? `Saved as ${start}` : "Pick the day you posted your first video."}
        required
      />
      <DateField
        label="Payment date"
        value={income}
        onChange={setIncome}
        max={today}
        hint="Type it or pick it. Future dates aren't allowed."
      />
    </div>
  );
}
