import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One short line from Pip (6 words or fewer). `pointer` is the side the
 * little tail points toward, i.e. where Pip is.
 */
export function SpeechBubble({
  children,
  pointer = "right",
  className,
}: {
  children: ReactNode;
  pointer?: "left" | "right" | "bottom";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-max max-w-[220px] rounded-2xl border-2 border-secondary bg-background px-4 py-2.5 text-sm font-extrabold leading-snug text-foreground",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute h-3.5 w-3.5 rotate-45 border-secondary bg-background",
          pointer === "right" && "-right-[9px] top-1/2 -mt-[7px] border-r-2 border-t-2",
          pointer === "left" && "-left-[9px] top-1/2 -mt-[7px] border-b-2 border-l-2",
          pointer === "bottom" && "-bottom-[9px] left-1/2 -ml-[7px] border-b-2 border-r-2",
        )}
      />
    </div>
  );
}
