import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Severity } from "@/lib/eval-config";
import { SAMPLE_GAMES } from "@/lib/sample-games";

export type Finding = {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  evidence: string;
  why_it_matters: string;
  suggested_fix: string;
  human_review: boolean;
};

/** All games, oldest first, including the in-code sample games. */
export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").order("created_at");
      if (error) throw error;
      const ids = new Set(data.map((g) => g.id));
      return [...data, ...SAMPLE_GAMES.filter((g) => !ids.has(g.id))].sort((a, b) =>
        a.created_at.localeCompare(b.created_at),
      );
    },
  });
}

export type LatestResult = {
  result: string;
  attempt: number;
  mustFix: number;
  notes: number;
};

/** Latest complete evaluation outcome per game, with how many must-fix findings it had. */
export function useLatestResults() {
  return useQuery({
    queryKey: ["latest-results"],
    queryFn: async () => {
      const { data: evs, error } = await supabase
        .from("evaluations")
        .select("id, game_id, attempt_number, overall_result")
        .eq("status", "complete")
        .order("attempt_number", { ascending: false });
      if (error) throw error;
      const latest = new Map<string, NonNullable<typeof evs>[number]>();
      for (const ev of evs ?? []) if (!latest.has(ev.game_id)) latest.set(ev.game_id, ev);
      const ids = [...latest.values()].map((ev) => ev.id);
      const { data: findings } = ids.length
        ? await supabase.from("findings").select("evaluation_id, severity").in("evaluation_id", ids)
        : { data: [] as { evaluation_id: string; severity: string }[] };
      const out: Record<string, LatestResult> = {};
      for (const [gameId, ev] of latest) {
        const mine = (findings ?? []).filter((f) => f.evaluation_id === ev.id);
        out[gameId] = {
          result: ev.overall_result ?? "",
          attempt: ev.attempt_number,
          mustFix: mine.filter((f) => f.severity === "must_fix").length,
          notes: mine.length,
        };
      }
      return out;
    },
  });
}

/** A game plus its latest complete evaluation and that evaluation's findings. */
export function useGameDetail(id: string) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      const { data: game, error } = await supabase.from("games").select("*").eq("id", id).single();
      if (error) throw error;
      const { data: ev } = await supabase
        .from("evaluations")
        .select("*")
        .eq("game_id", id)
        .eq("status", "complete")
        .order("attempt_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      let findings: Finding[] = [];
      if (ev) {
        const { data: f } = await supabase.from("findings").select("*").eq("evaluation_id", ev.id);
        findings = (f ?? []) as Finding[];
      }
      return { game, ev, findings };
    },
  });
}
