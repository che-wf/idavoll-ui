// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Check, Copy } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  copy: "Copy",
  copied: "Copied",
  /** Shown when the browser won't let the page copy. {keys} becomes Ctrl+C or ⌘C. */
  manual: "Selected. Press {keys} to copy.",
};

export interface CopyFieldProps {
  /**
   * The text to show and copy, e.g. a redirect URL. Never pass a secret: the value is
   * always visible, and there is deliberately no "reveal" mode.
   */
  value: string;
  /** Label above the field, e.g. "Redirect URL". Also names the Copy button. */
  label?: ReactNode;
  /** One line under the field, e.g. "Paste this into Authorized redirect URIs". */
  hint?: ReactNode;
  /** Button and status text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * A read-only value in a monospace box with a Copy button. After copying, the button
 * says "Copied" for 2 seconds and screen readers hear it. If the browser blocks copying,
 * the text is selected and the person is told which keys to press.
 */
export function CopyField({ value, label, hint, labels: labelOverrides, className }: CopyFieldProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const valueRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [keys, setKeys] = useState("Ctrl+C");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setKeys("⌘C");
  }, []);

  useEffect(() => {
    if (state !== "copied") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const selectText = () => {
    const el = valueRef.current;
    const selection = window.getSelection();
    if (!el || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("No clipboard");
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      selectText();
      setState("manual");
    }
  };

  const labelText = typeof label === "string" ? label : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div id={`${id}-label`} className="font-medium text-sm">
          {label}
        </div>
      )}
      <div className="flex items-stretch gap-2 rounded-lg border bg-muted/40 p-1 pl-3">
        <code ref={valueRef} className="min-w-0 flex-1 self-center break-all py-1 font-mono text-sm leading-relaxed">
          {value}
        </code>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copy}
          aria-label={labelText ? `${state === "copied" ? labels.copied : labels.copy}: ${labelText}` : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="shrink-0 self-start"
        >
          {state === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
          {state === "copied" ? labels.copied : labels.copy}
        </Button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-foreground/70 text-xs">
          {hint}
        </p>
      )}
      <p role="status" className={cn("text-xs", state === "manual" ? "text-foreground/70" : "sr-only")}>
        {state === "copied" ? labels.copied : state === "manual" ? labels.manual.replace("{keys}", keys) : ""}
      </p>
    </div>
  );
}
