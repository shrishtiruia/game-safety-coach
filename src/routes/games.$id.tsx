import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, ChevronDown, PartyPopper, Rocket, UserCheck, Wrench, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_ICON, ChunkyButton, SEVERITY_CLS, StatusPill } from "@/components/chunky";
import { resubmitGame } from "@/lib/evaluation.functions";
import {
  CATEGORY_INFO,
  FORMAT_LABEL,
  SEVERITY_LABEL,
  SKILL_LABEL,
  type Category,
  type Severity,
} from "@/lib/eval-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/$id")({
  head: () => ({
    meta: [
      { title: "Game review · SkillPlay Safety Check" },
      { name: "description", content: "Safety check result and coaching notes for your game." },
      { property: "og:title", content: "Game review · SkillPlay Safety Check" },
      { property: "og:description", content: "Safety check result and coaching notes for your game." },
    ],
  }),
  component: GamePage,
});

type Finding = {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  evidence: string;
  why_it_matters: string;
  suggested_fix: string;
  human_review: boolean;
};

function GamePage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
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

  if (isLoading || !data) {
    return <p className="p-10 text-center font-bold text-muted-foreground">Loading…</p>;
  }
  const { game, ev, findings } = data;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/" className="mb-6 inline-flex items-center gap-1 font-extrabold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-5 w-5" strokeWidth={3} /> Your games
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl">{game.title}</h1>
        <p className="mb-3 font-bold text-muted-foreground">
          {game.maker_name} · {SKILL_LABEL[game.skill]} · Grades {game.grade_band} · {game.duration_minutes} min ·{" "}
          {FORMAT_LABEL[game.format]}
        </p>
        <StatusPill status={game.status} />
      </div>

      {game.status === "submitted" || game.status === "in_review" || !ev ? (
        <StartCheck gameId={game.id} resubmit={!!ev} />
      ) : (
        <Result
          game={game}
          attempt={ev.attempt_number}
          result={ev.overall_result ?? game.status}
          findings={findings}
        />
      )}
    </main>
  );
}

function StartCheck({ gameId, resubmit }: { gameId: string; resubmit: boolean }) {
  const navigate = useNavigate();
  return (
    <section className="rounded-3xl border-2 border-secondary p-8 text-center">
      <div className="mx-auto mb-4 flex h-24 w-24 animate-bob items-center justify-center rounded-full bg-primary-soft text-primary">
        <Rocket className="h-12 w-12" strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl">{resubmit ? "Ready for round two?" : "Ready when you are!"}</h2>
      <p className="mx-auto mb-6 mt-1 max-w-sm font-semibold text-muted-foreground">
        {resubmit
          ? "We'll only re-check what had notes. About a minute."
          : "Six quick checks for safety and learning fit. About 5 minutes."}
      </p>
      <ChunkyButton size="lg" onClick={() => navigate({ to: "/games/$id/check", params: { id: gameId } })}>
        Start safety check
      </ChunkyButton>
    </section>
  );
}

const RESULT_STYLE = {
  approved: { cls: "bg-primary-soft text-primary-pressed", ring: "bg-primary", Icon: PartyPopper },
  approved_with_notes: { cls: "bg-warning-soft text-warning-pressed", ring: "bg-warning", Icon: Sparkles },
  needs_changes: { cls: "bg-danger-soft text-danger", ring: "bg-danger", Icon: Wrench },
} as const;

function headline(result: string, findings: Finding[]) {
  const must = findings.filter((f) => f.severity === "must_fix").length;
  const notes = findings.length;
  if (result === "approved") return { h: "Nailed it!", s: "Your game is cleared for classrooms." };
  if (result === "approved_with_notes")
    return {
      h: "You're in! Nice work.",
      s: `Teachers can find it now. ${notes} tip${notes === 1 ? "" : "s"} to make it shine.`,
    };
  return {
    h: `Almost there, ${must} thing${must === 1 ? "" : "s"} to fix`,
    s: "Quick fixes, then you're back in the game.",
  };
}

function Result({
  game,
  attempt,
  result,
  findings,
}: {
  game: { id: string; description: string; duration_minutes: number };
  attempt: number;
  result: string;
  findings: Finding[];
}) {
  const style = RESULT_STYLE[result as keyof typeof RESULT_STYLE] ?? RESULT_STYLE.approved;
  const { h, s } = headline(result, findings);
  const [editing, setEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const humanCount = findings.filter((f) => f.human_review).length;
  const groups: Severity[] = ["must_fix", "should_fix"];
  const suggestions = findings.filter((f) => f.severity === "suggestion");

  return (
    <>
      <section className={cn("mb-8 rounded-3xl p-8 text-center", style.cls)}>
        <div className={cn("mx-auto mb-4 flex h-20 w-20 animate-pop items-center justify-center rounded-full text-primary-foreground", style.ring)}>
          <style.Icon className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-extrabold uppercase tracking-wide opacity-80">Attempt {attempt}</p>
        <h2 className="text-3xl">{h}</h2>
        <p className="mt-1 font-bold text-foreground">{s}</p>
        {humanCount > 0 && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-extrabold text-info">
            <UserCheck className="h-4 w-4" strokeWidth={3} />
            {humanCount} item{humanCount === 1 ? "" : "s"} sent to a human reviewer
          </p>
        )}
      </section>

      {result !== "approved" && !editing && (
        <div className="mb-10 text-center">
          <ChunkyButton
            size="lg"
            variant={result === "needs_changes" ? "primary" : "ghost"}
            onClick={() => setEditing(true)}
          >
            Fix and resubmit
          </ChunkyButton>
        </div>
      )}
      {editing && <ResubmitForm game={game} onCancel={() => setEditing(false)} />}

      {groups.map((sev) => {
        const list = findings.filter((f) => f.severity === sev);
        if (!list.length) return null;
        return (
          <section key={sev} className="mb-8">
            <h3 className="mb-3 text-xl">
              {SEVERITY_LABEL[sev]} <span className="text-muted-foreground">· {list.length}</span>
            </h3>
            <div className="space-y-3">
              {list.map((f) => (
                <FindingCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        );
      })}

      {suggestions.length > 0 && (
        <section className="mb-8">
          <button
            onClick={() => setShowSuggestions((v) => !v)}
            className="mb-3 flex items-center gap-2 text-xl font-extrabold"
          >
            Suggestions <span className="text-muted-foreground">· {suggestions.length}</span>
            <ChevronDown className={cn("h-5 w-5 transition", showSuggestions && "rotate-180")} strokeWidth={3} />
          </button>
          {showSuggestions && (
            <div className="space-y-3">
              {suggestions.map((f) => (
                <FindingCard key={f.id} f={f} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  const cat = (f.category in CATEGORY_INFO ? f.category : "learning_fit") as Category;
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="rounded-2xl border-2 border-b-4 border-secondary p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase", SEVERITY_CLS[f.severity])}>
              {SEVERITY_LABEL[f.severity]}
            </span>
            {f.human_review && (
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-extrabold uppercase text-info">
                <UserCheck className="h-3 w-3" strokeWidth={3} /> Sent to human reviewer
              </span>
            )}
            <span className="text-xs font-bold text-muted-foreground">{CATEGORY_INFO[cat].label}</span>
          </div>
          <p className="font-extrabold">{f.title}</p>
          <p className="text-sm font-semibold text-muted-foreground">📍 {f.evidence}</p>
        </div>
        <ChevronDown className={cn("mt-2 h-5 w-5 shrink-0 text-muted-foreground transition", open && "rotate-180")} strokeWidth={3} />
      </button>
      {open && (
        <div className="mt-4 space-y-3 border-t-2 border-secondary pt-4 pl-14">
          <div>
            <p className="text-xs font-extrabold uppercase text-muted-foreground">Why it matters</p>
            <p className="font-semibold">{f.why_it_matters}</p>
          </div>
          <div className="rounded-xl bg-primary-soft p-3">
            <p className="text-xs font-extrabold uppercase text-primary-pressed">Try this</p>
            <p className="font-semibold">{f.suggested_fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ResubmitForm({
  game,
  onCancel,
}: {
  game: { id: string; description: string; duration_minutes: number };
  onCancel: () => void;
}) {
  const [desc, setDesc] = useState(game.description);
  const [dur, setDur] = useState(game.duration_minutes);
  const [busy, setBusy] = useState(false);
  const resubmit = useServerFn(resubmitGame);
  const navigate = useNavigate();
  const qc = useQueryClient();

  return (
    <section className="mb-10 rounded-3xl border-2 border-info bg-info-soft p-6">
      <h3 className="mb-1 text-xl">Update your game</h3>
      <p className="mb-4 text-sm font-semibold text-muted-foreground">Make your fixes, then send it back.</p>
      <label className="mb-1 block text-sm font-extrabold">Game content</label>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={7}
        className="mb-4 w-full rounded-2xl border-2 border-secondary bg-background p-3 font-semibold outline-none focus:border-info"
      />
      <label className="mb-1 block text-sm font-extrabold">Duration (minutes)</label>
      <input
        type="number"
        value={dur}
        onChange={(e) => setDur(Number(e.target.value))}
        className="mb-6 w-32 rounded-2xl border-2 border-secondary bg-background p-3 font-bold outline-none focus:border-info"
      />
      <div className="flex flex-wrap gap-3">
        <ChunkyButton
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await resubmit({ data: { gameId: game.id, description: desc, durationMinutes: dur } });
            await qc.invalidateQueries();
            navigate({ to: "/games/$id/check", params: { id: game.id } });
          }}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Resubmit
        </ChunkyButton>
        <ChunkyButton variant="ghost" onClick={onCancel}>
          Cancel
        </ChunkyButton>
      </div>
    </section>
  );
}
