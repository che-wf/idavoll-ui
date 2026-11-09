import type { ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** An icon, e.g. <Film />. */
  icon?: ReactNode;
  /** One short line, e.g. "No videos yet". */
  title: ReactNode;
  /** One sentence on what happens next, e.g. "Videos appear here after the first sync." */
  description?: ReactNode;
  /** One action, e.g. a "Sync now" button. */
  action?: ReactNode;
  /** Heading level for the title, to fit the page outline. Defaults to 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** An empty state: icon, one line, one sentence, one action. A thin wrapper over shadcn's Empty. */
export function EmptyState({ icon, title, description, action, headingLevel = 3, className }: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <Empty className={cn("border border-dashed", className)}>
      <EmptyHeader>
        {icon && (
          <EmptyMedia variant="icon" aria-hidden>
            {icon}
          </EmptyMedia>
        )}
        <EmptyTitle>
          <Heading className="font-heading font-semibold text-base">{title}</Heading>
        </EmptyTitle>
        {description && <EmptyDescription className="text-foreground/75">{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
