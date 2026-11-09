// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { ExternalLink, TriangleAlert } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { CopyField } from "@/components/idavoll/copy-field";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  newTab: "(opens in a new tab)",
  warning: "Important:",
  /** {title} becomes the step title. */
  markDone: "Done: {title}",
  copy: "Copy",
  copied: "Copied",
};

export interface GuideStep {
  /** What to do, e.g. "Create a project". */
  title: ReactNode;
  /** More detail under the title. */
  body?: ReactNode;
  /** A link for this step, opened in a new tab. */
  href?: string;
  /** Link text, e.g. "Open Google Cloud Console". Defaults to the address. */
  linkLabel?: string;
  /** A value to copy for this step, e.g. the redirect URL. Never a secret. */
  copyValue?: string;
  /** Label for the copy field. */
  copyLabel?: string;
  /** "warning" highlights a step that's easy to get wrong. */
  tone?: "default" | "warning";
}

export interface GuideStepsProps {
  /** The steps, in order. */
  steps: GuideStep[];
  /** Give each step a checkbox so people can keep their place. Ticks are only visual help. Defaults to false. */
  checkable?: boolean;
  /** Text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  className?: string;
}

/**
 * Numbered instructions, e.g. for creating a developer app. Steps can include a link that
 * opens in a new tab, a value to copy, and a warning style. With `checkable`, each step
 * gets a checkbox so people can tick off what they've done.
 */
export function GuideSteps({ steps, checkable = false, labels: labelOverrides, className }: GuideStepsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const id = useId();
  const [done, setDone] = useState<Set<number>>(new Set());

  return (
    <ol className={cn("space-y-3", className)}>
      {steps.map((step, i) => {
        const warning = step.tone === "warning";
        const isDone = done.has(i);
        const titleId = `${id}-${i}`;
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: steps are a fixed, ordered list.
            key={i}
            className={cn("flex gap-3 rounded-xl border p-3", warning && "border-amber-500/60 bg-amber-500/10")}
          >
            {checkable ? (
              <Checkbox
                checked={isDone}
                onCheckedChange={(on) =>
                  setDone((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(i);
                    else next.delete(i);
                    return next;
                  })
                }
                aria-label={labels.markDone.replace(
                  "{title}",
                  typeof step.title === "string" ? step.title : String(i + 1),
                )}
                className="mt-0.5 size-6 rounded-full border-foreground/45 [&_svg]:size-4"
              />
            ) : (
              <span
                aria-hidden
                className="grid size-6 shrink-0 place-items-center rounded-full bg-muted font-semibold text-xs tabular-nums"
              >
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <p id={titleId} className={cn("font-medium text-sm leading-6", isDone && "text-foreground/70")}>
                {warning && (
                  <>
                    <TriangleAlert
                      aria-hidden
                      className="mr-1.5 inline size-4 -translate-y-px text-amber-700 dark:text-amber-400"
                    />
                    <span className="sr-only">{labels.warning} </span>
                  </>
                )}
                {checkable && <span className="sr-only">{i + 1}. </span>}
                {step.title}
              </p>
              {step.body && <div className="text-foreground/80 text-sm leading-relaxed">{step.body}</div>}
              {step.href && (
                <a
                  href={step.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-primary text-sm underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {step.linkLabel ?? step.href}
                  <ExternalLink aria-hidden className="size-3.5" />
                  <span className="sr-only"> {labels.newTab}</span>
                </a>
              )}
              {step.copyValue && (
                <CopyField
                  value={step.copyValue}
                  label={step.copyLabel}
                  labels={{ copy: labels.copy, copied: labels.copied }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
