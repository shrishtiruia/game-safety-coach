import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/kit";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Kitbit" },
      { name: "description", content: "Kitbit cart page for teachers." },
      { property: "og:title", content: "Cart — Kitbit" },
      { property: "og:description", content: "Kitbit cart page for teachers." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <EmptyState title="Cart is coming soon" text="Pip is still building this page." />
    </div>
  ),
});
