import { createFileRoute, redirect } from "@tanstack/react-router";

// The leaderboard became Class goals; keep old links working.
export const Route = createFileRoute("/leaderboard")({
  beforeLoad: () => {
    throw redirect({ to: "/goals" });
  },
});
