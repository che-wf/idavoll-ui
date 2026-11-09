// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
import { useState } from "react";
import { BigThree, BigThreeEditor, type BigThreeSigns } from "@/components/idavoll/big-three";
import { SettingsGroup, SettingsSwitch } from "@/components/idavoll/settings-group";

export default function BigThreeDemo() {
  const [show, setShow] = useState(true);
  const [signs, setSigns] = useState<BigThreeSigns>({ sun: "Leo", moon: "Pisces" });
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
      <SettingsGroup title="Big three" description="Optional. Shown on your public challenge page.">
        <SettingsSwitch label="Show my big three" checked={show} onCheckedChange={setShow} />
        {show && (
          <div className="p-4">
            <BigThreeEditor value={signs} onChange={setSigns} />
          </div>
        )}
      </SettingsGroup>
      <div className="space-y-2">
        <p className="font-medium text-sm">Preview</p>
        {show && (signs.sun || signs.moon || signs.rising) ? (
          <BigThree signs={signs} variant="list" />
        ) : (
          <p className="text-foreground/70 text-sm">Hidden from your profile.</p>
        )}
      </div>
    </div>
  );
}
