import { makerStatus } from "@/lib/game-status";
import { cn } from "@/lib/utils";

/** The only status chip makers see: Live or Draft. */
export function MakerStatusChip({ status, className }: { status: string; className?: string }) {
  const live = makerStatus(status) === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide",
        live ? "bg-primary-soft text-primary-pressed" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", live ? "bg-primary" : "bg-muted-foreground")} />
      {live ? "Live" : "Draft"}
    </span>
  );
}
