import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type React from "react";
import { ChevronDown, Loader2, UserCheck } from "lucide-react";
import { CATEGORY_ICON, ChunkyButton, chunkyVariants, SEVERITY_CLS } from "@/components/chunky";
import { MakerStatusChip } from "@/components/maker-status";
import { SubmitFlow } from "@/components/submit-flow";
import { GameDropzone } from "@/components/game-dropzone";
import type { ParsedUpload } from "@/lib/upload/read-upload";
import { attachUpload } from "@/lib/upload/session-upload";
import { Dam, Pip, SpeechBubble } from "@/components/mascot";
import { useGameDetail, type Finding } from "@/lib/game-queries";
import { isLive } from "@/lib/game-status";
import { resubmitGame } from "@/lib/evaluation.functions";
import { CATEGORY_INFO, SEVERITY_LABEL, type Category, type Severity } from "@/lib/eval-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/submit/$id/result")({
  head: () => ({
    meta: [
      { title: "Safety check result · Kitbit Studio" },
      { name: "description", content: "Your safety check result and what to do next." },
      { property: "og:title", content: "Safety check result · Kitbit Studio" },
      { property: "og:description", content: "Your safety check result and what to do next." },
    ],
  }),
  component: ResultStep,
});

function ResultStep() {
  const { id } = Route.useParams();
  const { data, isLoading } = useGameDetail(id);
  const navigate = useNavigate();
  const [fixing, setFixing] = useState(false);

  if (isLoading || !data) {
    return (
      <SubmitFlow step={4} title="Loading…">
        {null}
      </SubmitFlow>
    );
  }
  const { game, ev, findings } = data;

  // Never checked (or a resubmit that hasn't run yet): send them back into the check.
  if (!ev || game.status === "submitted" || game.status === "in_review") {
    return (
      <SubmitFlow
        step={3}
        game={game}
        title={`${game.title} is ready for its safety check`}
        sub={
          ev
            ? "We'll only re-check what had notes. About a minute."
            : "Six quick checks for safety and learning fit. About 5 minutes."
        }
      >
        <ChunkyButton
          size="lg"
          onClick={() => navigate({ to: "/studio/submit/$id/check", params: { id } })}
        >
          Run safety check
        </ChunkyButton>
      </SubmitFlow>
    );
  }

  const result = ev.overall_result ?? game.status;
  const live = isLive(result);
  const must = findings.filter((f) => f.severity === "must_fix").length;
  const humanCount = findings.filter((f) => f.human_review).length;

  const title = live
    ? "You're live!"
    : `Not live yet: ${must} thing${must === 1 ? "" : "s"} to fix`;
  const sub = live
    ? findings.length
      ? `Teachers can find ${game.title} now. Here ${findings.length === 1 ? "is 1 way" : `are ${findings.length} ways`} to make it even better.`
      : `Teachers can find ${game.title} now. Nothing to fix.`
    : "Fix them now and we'll only re-check what had notes. Or save to drafts and come back later.";

  const scene = fixing ? undefined : <ResultScene result={result} />;

  return (
    <SubmitFlow
      step={4}
      game={game}
      scene={scene}
      title={fixing ? `Fix ${game.title}` : title}
      sub={fixing ? "Make your fixes, then send it back for a quick re-check." : sub}
    >
      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-bold text-muted-foreground">
        <MakerStatusChip status={result} />
        <span>
          {game.title} · Attempt {ev.attempt_number}
        </span>
        {humanCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-info">
            <UserCheck className="h-4 w-4" strokeWidth={3} />
            {humanCount} item{humanCount === 1 ? "" : "s"} sent to a human reviewer
          </span>
        )}
      </div>

      {fixing ? (
        <ResubmitForm game={game} findings={findings} onCancel={() => setFixing(false)} />
      ) : (
        <>
          <div className="mb-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {live ? (
              <Link to="/studio" className={chunkyVariants({ size: "lg" })}>
                Go to My games
              </Link>
            ) : (
              <>
                <ChunkyButton size="lg" onClick={() => setFixing(true)}>
                  Fix now and resubmit
                </ChunkyButton>
                <ChunkyButton size="lg" variant="ghost" onClick={() => navigate({ to: "/studio" })}>
                  Save to drafts
                </ChunkyButton>
              </>
            )}
          </div>
          <Findings findings={findings} optional={live} />
        </>
      )}
    </SubmitFlow>
  );
}

/** Pip's reaction to the result. Kept in the header, never beside the findings themselves. */
function ResultScene({ result }: { result: string }) {
  if (result === "approved") {
    return (
      <div aria-hidden className="flex items-end">
        <Dam width={130} className="-mr-3" />
        <Pip pose="celebrating" size={120} />
      </div>
    );
  }
  if (result === "approved_with_notes") {
    return (
      <div aria-hidden className="flex items-center gap-1">
        <SpeechBubble pointer="right">You're live! A few ideas inside.</SpeechBubble>
        <Pip pose="proud" size={120} />
      </div>
    );
  }
  return (
    <div aria-hidden className="flex items-center gap-1">
      <SpeechBubble pointer="right">Almost there.</SpeechBubble>
      <Pip pose="oops" hardHat size={120} />
    </div>
  );
}

function Findings({ findings, optional }: { findings: Finding[]; optional: boolean }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  if (!findings.length) return null;

  if (optional) {
    return (
      <section>
        <h2 className="mb-4 text-xl">Optional improvements</h2>
        <div className="space-y-3">
          {findings.map((f) => (
            <FindingCard key={f.id} f={f} />
          ))}
        </div>
      </section>
    );
  }

  const groups: Severity[] = ["must_fix", "should_fix"];
  const suggestions = findings.filter((f) => f.severity === "suggestion");
  return (
    <div className="space-y-10">
      {groups.map((sev) => {
        const list = findings.filter((f) => f.severity === sev);
        if (!list.length) return null;
        return (
          <section key={sev}>
            <h2 className="mb-4 text-xl">
              {SEVERITY_LABEL[sev]} <span className="text-muted-foreground">· {list.length}</span>
            </h2>
            <div className="space-y-3">
              {list.map((f) => (
                <FindingCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        );
      })}
      {suggestions.length > 0 && (
        <section>
          <button
            onClick={() => setShowSuggestions((v) => !v)}
            aria-expanded={showSuggestions}
            className="mb-4 flex items-center gap-2 rounded-xl text-xl font-extrabold hover:text-info"
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
    </div>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const [open, setOpen] = useState(false);
  const cat = (f.category in CATEGORY_INFO ? f.category : "learning_fit") as Category;
  const Icon = CATEGORY_ICON[cat];
  return (
    <div className="rounded-2xl border-2 border-secondary transition-colors hover:border-info">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-4 rounded-2xl p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-extrabold",
                SEVERITY_CLS[f.severity],
              )}
            >
              {SEVERITY_LABEL[f.severity]}
            </span>
            {CATEGORY_INFO[cat].label}
            {f.human_review && (
              <span className="inline-flex items-center gap-1 text-info">
                <UserCheck className="h-3 w-3" strokeWidth={3} /> Human reviewer
              </span>
            )}
          </p>
          <p className="font-extrabold">{f.title}</p>
          <p className="text-sm font-semibold text-muted-foreground">{f.evidence}</p>
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
  const [upload, setUpload] = useState<ParsedUpload | null>(null);
  const [dur, setDur] = useState(game.duration_minutes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resubmit = useServerFn(resubmitGame);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toFix = [
    ...findings.filter((f) => f.severity === "must_fix"),
    ...findings.filter((f) => f.severity === "should_fix"),
  ];

  return (
    <section>
      <ol className="space-y-8">
        {toFix.length > 0 && (
          <Step n={1} title="What to fix">
            <ul className="space-y-2">
              {toFix.map((f) => (
                <li key={f.id} className="flex items-start gap-2 rounded-2xl bg-muted p-3">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold",
                      SEVERITY_CLS[f.severity],
                    )}
                  >
                    {SEVERITY_LABEL[f.severity]}
                  </span>
                  <span className="font-bold">
                    {f.title}
                    <span className="block text-sm font-semibold text-muted-foreground">
                      Try this: {f.suggested_fix}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Step>
        )}
        <Step n={toFix.length > 0 ? 2 : 1} title="Upload the fixed file">
          <p className="mb-4 font-semibold text-muted-foreground">
            We never keep a copy of your game, so upload the fixed version. We'll only re-check what
            had notes.
          </p>
          <GameDropzone upload={upload} onChange={setUpload} />
        </Step>
        <Step n={toFix.length > 0 ? 3 : 2} title="Check the duration (minutes)">
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

      {error && (
        <p role="alert" className="mt-6 rounded-2xl bg-danger-soft px-4 py-3 font-bold text-danger">
          {error}
        </p>
      )}
      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <ChunkyButton
          size="lg"
          disabled={busy || !upload}
          onClick={async () => {
            if (!upload) return;
            setBusy(true);
            setError(null);
            try {
              await resubmit({
                data: { gameId: game.id, description: game.description, durationMinutes: dur },
              });
              attachUpload(game.id, upload);
              await qc.invalidateQueries();
              navigate({ to: "/studio/submit/$id/check", params: { id: game.id } });
            } catch (e) {
              console.error(e);
              setError("We couldn't send it back. Your game is still saved in drafts.");
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 className="h-5 w-5 animate-spin" />} Resubmit for a re-check
        </ChunkyButton>
        <ChunkyButton size="lg" variant="ghost" onClick={onCancel}>
          Back
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
        <h3 className="mb-3 mt-1 text-lg">{title}</h3>
        {children}
      </div>
    </li>
  );
}
