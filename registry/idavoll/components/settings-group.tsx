// SPDX-License-Identifier: MIT
// Copyright (c) 2026 idavoll-ui contributors. Part of idavoll-ui: https://github.com/che-wf/idavoll-ui
"use client";

import { Check, ChevronRight, CircleAlert, Loader2 } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useId, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface SettingsGroupProps extends Omit<ComponentProps<"section">, "title"> {
  /** Heading above the group, e.g. "Notifications". */
  title?: ReactNode;
  /** One line under the heading. */
  description?: ReactNode;
  /** Small print under the group, e.g. who can see a setting. */
  footer?: ReactNode;
  /** Heading level for `title`, to fit your page outline. Defaults to 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** A titled card of settings rows, separated by dividers. */
export function SettingsGroup({
  title,
  description,
  footer,
  headingLevel = 3,
  className,
  children,
  ...props
}: SettingsGroupProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section aria-labelledby={title ? headingId : undefined} className={cn("space-y-2", className)} {...props}>
      {(title || description) && (
        <div className="space-y-0.5 px-1">
          {title && (
            <Heading id={headingId} className="font-heading font-semibold text-base">
              {title}
            </Heading>
          )}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      <div className="divide-y overflow-hidden rounded-xl border bg-card text-card-foreground">{children}</div>
      {footer && <p className="px-1 text-muted-foreground text-xs">{footer}</p>}
    </section>
  );
}

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface SaveStatusProps {
  /** Where the save is up to. "saved" shows briefly, then hides. */
  status?: SaveState;
  /** Defaults to "Saving…". */
  savingLabel?: string;
  /** Defaults to "Saved". */
  savedLabel?: string;
  /** Defaults to "Couldn't save". Stays until the status changes. */
  errorLabel?: string;
  /** Milliseconds to show "Saved" before hiding it. Defaults to 2000. */
  hideAfter?: number;
  className?: string;
}

/**
 * Small inline save feedback for settings that save right away: "Saving…", then "Saved".
 * Screen readers hear each change politely, without focus moving.
 */
export function SaveStatus({
  status = "idle",
  savingLabel = "Saving…",
  savedLabel = "Saved",
  errorLabel = "Couldn't save",
  hideAfter = 2000,
  className,
}: SaveStatusProps) {
  const [visible, setVisible] = useState(status);
  useEffect(() => {
    setVisible(status);
    if (status !== "saved") return;
    const timer = setTimeout(() => setVisible("idle"), hideAfter);
    return () => clearTimeout(timer);
  }, [status, hideAfter]);

  return (
    // The live region is always present, so screen readers notice when its text changes.
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-xs",
        visible === "error" ? "text-destructive" : "text-foreground/70",
        className,
      )}
    >
      {visible === "saving" && (
        <>
          <Loader2 aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" />
          {savingLabel}
        </>
      )}
      {visible === "saved" && (
        <>
          <Check aria-hidden className="size-3.5 text-emerald-700 dark:text-emerald-400" />
          {savedLabel}
        </>
      )}
      {visible === "error" && (
        <>
          <CircleAlert aria-hidden className="size-3.5" />
          {errorLabel}
        </>
      )}
    </span>
  );
}

interface RowBaseProps {
  /** Small icon shown in a rounded tile on the left. */
  icon?: ReactNode;
  /** Tile background, e.g. "#ee2a7b" or "var(--chart-2)". The icon turns white. Defaults to a muted tile. */
  iconColor?: string;
  /** The setting's name. */
  label: ReactNode;
  /** One or two lines explaining the setting. */
  description?: ReactNode;
  /** Red text, for actions like "Delete account". */
  destructive?: boolean;
  /**
   * Save feedback shown beside the control, for settings that save right away. Set "saving"
   * when the request starts, then "saved" or "error".
   */
  saveStatus?: SaveState;
  className?: string;
}

export interface SettingsRowProps extends RowBaseProps {
  /**
   * The id of the control in `children`. Clicking the label then focuses it, and the
   * description gets the id `${controlId}-description` for the control's aria-describedby.
   */
  controlId?: string;
  /** Text shown on the right of a link row, e.g. the current language. */
  value?: ReactNode;
  /** Makes the whole row a button with a chevron, for rows that open another page or dialog. */
  onClick?: () => void;
  /** The control on the right: a switch, select, button… Ignored when `onClick` is set. */
  children?: ReactNode;
}

function RowIcon({ icon, color }: { icon: ReactNode; color?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg [&_svg]:size-4",
        color ? "text-white" : "bg-muted text-foreground",
      )}
      style={color ? { background: color } : undefined}
    >
      {icon}
    </span>
  );
}

const rowClass = "relative flex w-full items-center gap-3 px-4 py-3 text-left";

/** One setting: icon, label, description and a control on the right. With `onClick` it becomes a link row. */
export function SettingsRow({
  icon,
  iconColor,
  label,
  description,
  destructive,
  controlId,
  value,
  onClick,
  saveStatus,
  children,
  className,
}: SettingsRowProps) {
  const text = (
    <span className="min-w-0 flex-1 space-y-0.5">
      {controlId && !onClick ? (
        <label htmlFor={controlId} className={cn("block font-medium text-sm", destructive && "text-destructive")}>
          {label}
        </label>
      ) : (
        <span className={cn("block font-medium text-sm", destructive && "text-destructive")}>{label}</span>
      )}
      {description && (
        <span
          id={controlId ? `${controlId}-description` : undefined}
          className="block text-muted-foreground text-xs leading-relaxed"
        >
          {description}
        </span>
      )}
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          rowClass,
          "transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
          className,
        )}
      >
        {icon && <RowIcon icon={icon} color={iconColor} />}
        {text}
        {value && <span className="truncate text-muted-foreground text-sm">{value}</span>}
        {!destructive && <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />}
      </button>
    );
  }

  return (
    <div className={cn(rowClass, className)}>
      {icon && <RowIcon icon={icon} color={iconColor} />}
      {text}
      {value && <span className="truncate text-muted-foreground text-sm">{value}</span>}
      {saveStatus && <SaveStatus status={saveStatus} />}
      {children && <div className="flex shrink-0 items-center">{children}</div>}
    </div>
  );
}

export interface SettingsSwitchProps extends RowBaseProps {
  /** On or off, when you control it. */
  checked?: boolean;
  /** Starting state when you don't control it. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Greys the row out and stops changes. */
  disabled?: boolean;
  /** Form field name, if the switch is inside a form. */
  name?: string;
}

/** A settings row with an on/off switch. Clicking anywhere on the row toggles it. */
export function SettingsSwitch({
  icon,
  iconColor,
  label,
  description,
  destructive,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  saveStatus,
  className,
}: SettingsSwitchProps) {
  const id = useId();
  return (
    <div className={cn(rowClass, disabled && "opacity-60", className)}>
      {icon && <RowIcon icon={icon} color={iconColor} />}
      <span className="min-w-0 flex-1 space-y-0.5">
        {/* The label stretches over the whole row so the row is one big click target. */}
        <label
          htmlFor={id}
          className={cn(
            "block font-medium text-sm after:absolute after:inset-0",
            disabled ? "after:cursor-not-allowed" : "after:cursor-pointer",
            destructive && "text-destructive",
          )}
        >
          {label}
        </label>
        {description && (
          <span id={`${id}-description`} className="block text-muted-foreground text-xs leading-relaxed">
            {description}
          </span>
        )}
      </span>
      {saveStatus && <SaveStatus status={saveStatus} className="relative z-10" />}
      <Switch
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
        // A darker "off" track than shadcn's, so the white thumb stands out at 3:1 (WCAG 1.4.11).
        // In dark mode the thumb is light, so a dim track is enough.
        className="relative z-10 data-[state=unchecked]:bg-foreground/45! dark:data-[state=unchecked]:bg-foreground/25!"
      />
    </div>
  );
}
