import { Film, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/idavoll/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmptyStateDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <EmptyState
        icon={<Film />}
        title="No videos yet"
        description="Videos appear here after the first sync."
        action={
          <Button size="sm">
            <RefreshCw aria-hidden />
            Sync now
          </Button>
        }
      />
      <EmptyState
        icon={<RefreshCw />}
        title="Waiting for the first sync"
        description="This usually takes a minute or two. You can leave this page."
      />
      {/* For loads over about a second: a skeleton shaped like the final layout. */}
      <div aria-hidden className="space-y-3 rounded-xl border p-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}
