// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Check, ChevronLeft, Loader2, Redo2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_LABELS = {
  /** {current} and {total} are replaced with numbers. */
  stepOf: "Step {current} of {total}",
  progress: "Setup progress",
  back: "Back",
  skip: "Skip for now",
  next: "Next",
  finish: "Finish",
  done: "Done",
  skipped: "Skipped",
  optional: "Optional",
};

export interface WizardStep {
  /** Unique id. */
  id: string;
  /** Short name, e.g. "Pick platforms". Also the heading above the step's content. */
  title: string;
  /** Shows a Skip button on this step. */
  optional?: boolean;
}

export interface WizardStepsProps {
  /** The steps, in order. */
  steps: WizardStep[];
  /** Id of the step showing now. The app controls it, so it can resume after a reload. */
  current: string;
  /** Steps already done or skipped. */
  status?: Record<string, "done" | "skipped">;
  /** Called by the Back button. Hidden on the first step. */
  onBack?: () => void;
  /** Called by the Skip button, shown on optional steps. */
  onSkip?: () => void;
  /** Called by Next (or Finish on the last step). */
  onNext?: () => void;
  /** Text for the Next button. Defaults to "Next", or "Finish" on the last step. */
  nextLabel?: string;
  /** Turns Next off, e.g. until a required choice is made. */
  nextDisabled?: boolean;
  /** Shows a spinner on Next while the step saves. Focus stays on the button. */
  busy?: boolean;
  /** Heading level for the step title. Defaults to 2. */
  headingLevel?: 2 | 3 | 4;
  /** Button and status text, for translation. */
  labels?: Partial<typeof DEFAULT_LABELS>;
  /** The current step's content. The wizard holds no form state. */
  children?: ReactNode;
  className?: string;
}

/**
 * A multi-step setup flow: shows where you are, the current step's content, and Back,
 * Skip and Next buttons. When the step changes, focus moves to the new step's heading so
 * screen readers announce it.
 */
export function WizardSteps({
  steps,
  current,
  status = {},
  onBack,
  onSkip,
  onNext,
  nextLabel,
  nextDisabled,
  busy,
  headingLevel = 2,
  labels: labelOverrides,
  children,
  className,
}: WizardStepsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const index = Math.max(
    0,
    steps.findIndex((s) => s.id === current),
  );
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const stepOf = labels.stepOf.replace("{current}", String(index + 1)).replace("{total}", String(steps.length));
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(current);
  const Heading = `h${headingLevel}` as const;

  // Move focus to the new step's heading when the step changes, but not on first load.
  useEffect(() => {
    if (shownStep.current === current) return;
    shownStep.current = current;
    headingRef.current?.focus();
  }, [current]);

  return (
    <div className={cn("@container space-y-6", className)}>
      <nav aria-label={labels.progress}>
        {/* Phones: "Step 2 of 5 · Pick platforms" and a thin bar. */}
        <div aria-hidden className="space-y-2 @2xl:hidden">
          <p className="text-sm">
            <span className="font-medium">{stepOf}</span>
            <span className="text-foreground/70"> · {step?.title}</span>
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${((index + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        {/* Wide: every step by name. Screen readers always get this list. */}
        <ol className="sr-only @2xl:not-sr-only @2xl:flex @2xl:items-center @2xl:gap-2">
          {steps.map((s, i) => {
            const state = s.id === current ? "current" : status[s.id];
            return (
              <li
                key={s.id}
                aria-current={s.id === current ? "step" : undefined}
                className="flex min-w-0 flex-1 items-center gap-2 text-sm"
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border font-medium text-xs tabular-nums",
                    state === "current" && "border-primary bg-primary text-primary-foreground",
                    state === "done" && "border-primary text-primary",
                    state === "skipped" && "border-dashed text-foreground/70",
                  )}
                >
                  {state === "done" ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : state === "skipped" ? (
                    <Redo2 className="size-3.5" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="min-w-0">
                  <span className={cn("block truncate", state === "current" ? "font-medium" : "text-foreground/70")}>
                    {s.title}
                  </span>
                  {(state === "done" || state === "skipped") && (
                    <span className="block text-foreground/70 text-xs">
                      {state === "done" ? labels.done : labels.skipped}
                    </span>
                  )}
                </span>
                {i < steps.length - 1 && <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />}
              </li>
            );
          })}
        </ol>
      </nav>

      <section aria-labelledby={headingId} className="space-y-4">
        <div>
          <p className="text-foreground/70 text-sm">
            {stepOf}
            {step?.optional && ` · ${labels.optional}`}
          </p>
          <Heading
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="font-heading font-semibold text-xl outline-none"
          >
            {step?.title}
          </Heading>
        </div>
        {children}
      </section>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        {index > 0 && onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            <ChevronLeft aria-hidden />
            {labels.back}
          </Button>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {step?.optional && onSkip && (
            <Button type="button" variant="outline" onClick={onSkip} disabled={busy}>
              {labels.skip}
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              if (!busy) onNext?.();
            }}
            disabled={nextDisabled}
            aria-disabled={busy || undefined}
            aria-busy={busy || undefined}
            className="min-w-24 aria-disabled:cursor-wait aria-disabled:opacity-70"
          >
            {busy && <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" />}
            {nextLabel ?? (isLast ? labels.finish : labels.next)}
          </Button>
        </div>
      </div>
    </div>
  );
}
