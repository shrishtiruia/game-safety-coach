import { createFileRoute, redirect } from "@tanstack/react-router";

// A teacher's games live in the Class library on their profile.
export const Route = createFileRoute("/library")({
  beforeLoad: () => {
    throw redirect({ to: "/profile", hash: "library" });
  },
});
