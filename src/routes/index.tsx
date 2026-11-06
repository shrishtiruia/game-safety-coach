import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusPill } from "@/components/chunky";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { ChevronRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My submissions · SkillPlay Safety Check" },
      { name: "description", content: "See every game you've submitted and where it stands in safety review." },
      { property: "og:title", content: "My submissions · SkillPlay Safety Check" },
      { property: "og:description", content: "See every game you've submitted and where it stands in safety review." },
    ],
  }),
  component: Submissions,
});

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

function Submissions() {
  const { data: games, isLoading } = useGames();
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl">Your games</h1>
          <p className="font-semibold text-muted-foreground">Every game gets a safety check before it reaches classrooms.</p>
        </div>
      </div>

      {isLoading && <p className="font-bold text-muted-foreground">Loading…</p>}
      <ul className="space-y-4">
        {games?.map((g) => (
          <li key={g.id}>
            <Link
              to="/games/$id"
              params={{ id: g.id }}
              className="flex items-center gap-4 rounded-3xl border-2 border-b-4 border-secondary p-5 transition hover:bg-muted active:translate-y-0.5"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-xl">{g.title}</h2>
                <p className="mb-3 text-sm font-bold text-muted-foreground">
                  {g.maker_name} · {SKILL_LABEL[g.skill]} · Grades {g.grade_band} · {g.duration_minutes} min ·{" "}
                  {FORMAT_LABEL[g.format]}
                </p>
                <StatusPill status={g.status} />
              </div>
              <ChevronRight className="h-7 w-7 text-muted-foreground" strokeWidth={3} />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
