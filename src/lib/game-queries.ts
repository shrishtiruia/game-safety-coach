import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Severity } from "@/lib/eval-config";

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
