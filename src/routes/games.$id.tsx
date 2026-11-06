import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type React from "react";
import {
  ChevronDown,
  PartyPopper,
  Rocket,
  UserCheck,
  Wrench,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { CATEGORY_ICON, ChunkyButton, SEVERITY_CLS, StatusPill } from "@/components/chunky";
import { Breadcrumbs, Container } from "@/components/app-shell";
import { GameSummaryCard } from "@/components/game-summary";
import { useGameDetail, type Finding } from "@/lib/game-queries";
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
      {
        property: "og:description",
        content: "Safety check result and coaching notes for your game.",
      },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useGameDetail(id);

  const [editing, setEditing] = useState(false);

  if (isLoading || !data) {
    return (
      <Container className="py-10">
        <p className="font-bold text-muted-foreground">Loading…</p>
      </Container>
    );
  }
  const { game, ev, findings } = data;
  const needsCheck = game.status === "submitted" || game.status === "in_review" || !ev;

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { label: "My games", to: "/" },
          { label: game.title, to: "/games/$id", params: { id: game.id } },
          ...(editing ? [{ label: "Fix and resubmit" }] : []),
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl">{game.title}</h1>
        <p className="font-bold text-muted-foreground">
          {game.maker_name} · {SKILL_LABEL[game.skill]} · Grades {game.grade_band} ·{" "}
          {game.duration_minutes} min · {FORMAT_LABEL[game.format]}
        </p>
      </div>

      {needsCheck ? (
        <TwoColumn aside={<GameSummaryCard game={game} showTitle={false} />} asideLastOnMobile>
          <StartCheck gameId={game.id} resubmit={!!ev} />
        </TwoColumn>
      ) : (
        <Result
          game={game}
          attempt={ev.attempt_number}
          result={ev.overall_result ?? game.status}
          findings={findings}
          editing={editing}
          setEditing={setEditing}
        />
      )}
    </Container>
  );
}

/** Sticky summary on the left, main content on the right; stacks on small screens. */
function TwoColumn({
  aside,
  asideLastOnMobile,
  children,
}: {
  aside: React.ReactNode;
  asideLastOnMobile?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[360px_1fr]">
      <aside
        className={cn(
          "space-y-4 lg:sticky lg:top-24",
          asideLastOnMobile && "order-last lg:order-none",
        )}
      >
        {aside}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function StartCheck({ gameId, resubmit }: { gameId: string; resubmit: boolean }) {
  const navigate = useNavigate();
  return (
    <section className="rounded-3xl border-2 border-b-4 border-secondary p-8 text-center sm:p-12">
      <div className="mx-auto mb-4 flex h-24 w-24 animate-bob items-center justify-center rounded-full bg-primary-soft text-primary">
        <Rocket className="h-12 w-12" strokeWidth={2.5} />
      </div>
      <h2 className="text-2xl">{resubmit ? "Ready for round two?" : "Ready when you are!"}</h2>
      <p className="mx-auto mb-6 mt-1 max-w-sm font-semibold text-muted-foreground">
        {resubmit
          ? "We'll only re-check what had notes. About a minute."
          : "Six quick checks for safety and learning fit. About 5 minutes."}
      </p>
      <ChunkyButton
        size="lg"
        onClick={() => navigate({ to: "/games/$id/check", params: { id: gameId } })}
      >
        Start safety check
      </ChunkyButton>
    </section>
  );
}

const RESULT_STYLE = {
  approved: { cls: "bg-primary-soft text-primary-pressed", ring: "bg-primary", Icon: PartyPopper },
  approved_with_notes: {
    cls: "bg-warning-soft text-warning-pressed",
    ring: "bg-warning",
    Icon: Sparkles,
  },
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
  editing,
  setEditing,
}: {
  game: { id: string; description: string; duration_minutes: number };
  attempt: number;
  result: string;
  findings: Finding[];
  editing: boolean;
  setEditing: (v: boolean) => void;
}) {
  const style = RESULT_STYLE[result as keyof typeof RESULT_STYLE] ?? RESULT_STYLE.approved;
  const { h, s } = headline(result, findings);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const humanCount = findings.filter((f) => f.human_review).length;
  const groups: Severity[] = ["must_fix", "should_fix"];
  const suggestions = findings.filter((f) => f.severity === "suggestion");

  const summary = (
    <>
      <section className={cn("rounded-3xl p-8 text-center", style.cls)}>
        <div
          className={cn(
            "mx-auto mb-4 flex h-20 w-20 animate-pop items-center justify-center rounded-full text-primary-foreground",
            style.ring,
          )}
        >
          <style.Icon className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <div className="mb-3 flex justify-center">
          <StatusPill status={result} />
        </div>
        <p className="text-sm font-extrabold uppercase tracking-wide opacity-80">
          Attempt {attempt}
        </p>
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
        <ChunkyButton
          size="lg"
          variant={result === "needs_changes" ? "primary" : "ghost"}
          onClick={() => setEditing(true)}
          className="w-full sm:w-full"
        >
          Fix and resubmit
        </ChunkyButton>
      )}
    </>
  );

  if (editing) {
    return (
      <TwoColumn aside={summary}>
        <ResubmitForm game={game} findings={findings} onCancel={() => setEditing(false)} />
      </TwoColumn>
    );
  }

  return (
    <TwoColumn aside={summary}>
      {findings.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-secondary p-10 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-primary" strokeWidth={2.5} />
          <p className="font-extrabold">No notes on this one.</p>
        </div>
      )}
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
            <ChevronDown
              className={cn("h-5 w-5 transition", showSuggestions && "rotate-180")}
              strokeWidth={3}
            />
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
    </TwoColumn>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  const cat = (f.category in CATEGORY_INFO ? f.category : "learning_fit") as Category;
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="rounded-2xl border-2 border-b-4 border-secondary transition-colors hover:border-info">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 rounded-2xl p-4 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase",
                SEVERITY_CLS[f.severity],
              )}
            >
              {SEVERITY_LABEL[f.severity]}
            </span>
            {f.human_review && (
              <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-extrabold uppercase text-info">
                <UserCheck className="h-3 w-3" strokeWidth={3} /> Sent to human reviewer
              </span>
            )}
            <span className="text-xs font-bold text-muted-foreground">
              {CATEGORY_INFO[cat].label}
            </span>
          </div>
          <p className="font-extrabold">{f.title}</p>
          <p className="text-sm font-semibold text-muted-foreground">📍 {f.evidence}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-2 h-5 w-5 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
          strokeWidth={3}
        />
      </button>
      {open && (
        <div className="mx-4 mb-4 space-y-3 border-t-2 border-secondary pt-4 sm:pl-14">
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
  findings,
  onCancel,
}: {
  game: { id: string; description: string; duration_minutes: number };
  findings: Finding[];
  onCancel: () => void;
}) {
  const [desc, setDesc] = useState(game.description);
  const [dur, setDur] = useState(game.duration_minutes);
  const [busy, setBusy] = useState(false);
  const resubmit = useServerFn(resubmitGame);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toFix = [
    ...findings.filter((f) => f.severity === "must_fix"),
    ...findings.filter((f) => f.severity === "should_fix"),
  ];

  return (
    <section className="rounded-3xl border-2 border-b-4 border-info bg-info-soft p-6 sm:p-8">
      <h2 className="mb-1 text-2xl">Update your game</h2>
      <p className="mb-6 text-sm font-semibold text-muted-foreground">
        Make your fixes, then send it back.
      </p>

      <ol className="space-y-6">
        {toFix.length > 0 && (
          <Step n={1} title="What to fix">
            <ul className="space-y-2">
              {toFix.map((f) => (
                <li key={f.id} className="flex items-start gap-2 rounded-2xl bg-background p-3">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase",
                      SEVERITY_CLS[f.severity],
                    )}
                  >
                    {SEVERITY_LABEL[f.severity]}
                  </span>
                  <span className="font-bold">{f.title}</span>
                </li>
              ))}
            </ul>
          </Step>
        )}
        <Step n={toFix.length > 0 ? 2 : 1} title="Game content">
          <label htmlFor="resubmit-content" className="sr-only">
            Game content
          </label>
          <textarea
            id="resubmit-content"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={9}
            className="w-full rounded-2xl border-2 border-secondary bg-background p-3 font-semibold focus:border-info"
          />
        </Step>
        <Step n={toFix.length > 0 ? 3 : 2} title="Duration (minutes)">
          <label htmlFor="resubmit-duration" className="sr-only">
            Duration (minutes)
          </label>
          <input
            id="resubmit-duration"
            type="number"
            value={dur}
            onChange={(e) => setDur(Number(e.target.value))}
            className="w-32 rounded-2xl border-2 border-secondary bg-background p-3 font-bold focus:border-info"
          />
        </Step>
      </ol>

      <div className="mt-8 flex flex-wrap gap-3 border-t-2 border-info/30 pt-6">
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

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info font-black text-primary-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="mb-2 mt-1 text-lg">{title}</h3>
        {children}
      </div>
    </li>
  );
}
