import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pip } from "./pip";

const DONE = "skillplay:first-live-celebrated";
const PENDING = "skillplay:first-live-pending";

/** Call when a game has just gone live; the next My games visit celebrates, once per browser. */
export function queueFirstLiveCelebration() {
  try {
    if (!localStorage.getItem(DONE)) sessionStorage.setItem(PENDING, "1");
  } catch {
    // Storage can be blocked; skipping the toast is fine.
  }
}

/** Shows the one-time "first game is live" toast if one is queued. Returns true while it's showing. */
export function useFirstLiveCelebration() {
  const [showing, setShowing] = useState(false);
  useEffect(() => {
    let pending = false;
    try {
      pending = sessionStorage.getItem(PENDING) === "1" && !localStorage.getItem(DONE);
      sessionStorage.removeItem(PENDING);
      if (pending) localStorage.setItem(DONE, "1");
    } catch {
      return;
    }
    if (!pending) return;
    setShowing(true);
    toast.custom(
      () => (
        <div className="flex items-center gap-3 rounded-3xl border border-secondary bg-background py-2 pl-2 pr-5 font-[Nunito]">
          <Pip pose="celebrating" size={64} />
          <div>
            <p className="font-black">Your first game is live!</p>
            <p className="text-sm font-semibold text-muted-foreground">Teachers can find it now.</p>
          </div>
        </div>
      ),
      {
        unstyled: true,
        className: "!bg-transparent !border-0 !shadow-none",
        duration: 4500,
        onAutoClose: () => setShowing(false),
        onDismiss: () => setShowing(false),
      },
    );
  }, []);
  return showing;
}
