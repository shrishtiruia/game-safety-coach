import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { finalizeEvaluation, runCheck, startEvaluation } from "@/lib/evaluation.functions";
import { CATEGORY_INFO, type Category } from "@/lib/eval-config";
import { CATEGORY_ICON } from "@/components/chunky";
import { SubmitFlow } from "@/components/submit-flow";
import { Dam, Pip, SpeechBubble, type LogState, type PipPose } from "@/components/mascot";
import { queueFirstLiveCelebration } from "@/components/mascot/first-live-toast";
import { isLive } from "@/lib/game-status";
import { useGameDetail } from "@/lib/game-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio/submit/$id/check")({
  head: () => ({
    meta: [
      { title: "Running safety check · Kitbit Studio" },
      { name: "description", content: "Six safety and learning checks running on your game." },
      { property: "og:title", content: "Running safety check · Kitbit Studio" },
      {
        property: "og:description",
        content: "Six safety and learning checks running on your game.",
      },
    ],
  }),
  component: LiveCheck,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function LiveCheck() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const start = useServerFn(startEvaluation);
  const run = useServerFn(runCheck);
  const finalize = useServerFn(finalizeEvaluation);
  const started = useRef(false);
  const { data } = useGameDetail(id);
  const game = data?.game;

  const [cats, setCats] = useState<Category[]>([]);
  const [done, setDone] = useState<Set<Category>>(new Set());
  const [attempt, setAttempt] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Real progress events for the dam: checks in the order they finished, and whether each found an issue.
  const [finished, setFinished] = useState<{ category: Category; leak: boolean }[]>([]);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const s = await start({ data: { gameId: id } });
        setCats(s.categories);
        setAttempt(s.attempt);
        const minPer = s.attempt === 1 ? 7000 : 3500;
        await Promise.all(
          s.categories.map(async (c, i) => {
            const [checked] = await Promise.all([
              run({ data: { evaluationId: s.evaluationId, category: c } }),
              sleep(minPer + i * (s.attempt === 1 ? 2500 : 1500)),
            ]);
            setDone((d) => new Set(d).add(c));
            setFinished((f) => [...f, { category: c, leak: checked.count > 0 }]);
          }),
        );
        const final = await finalize({ data: { evaluationId: s.evaluationId } });
        setResult(final.result);
        if (isLive(final.result)) queueFirstLiveCelebration();
        await sleep(900);
        await qc.invalidateQueries();
        navigate({ to: "/studio/submit/$id/result", params: { id } });
      } catch (e) {
        console.error(e);
        setError("Something hiccupped. Your game is saved in drafts, so you can try again.");
      }
    })();
  }, [id, start, run, finalize, navigate, qc]);

  const total = cats.length || 6;
  const pct = Math.round((done.size / total) * 100);
  const budget = attempt === 1 ? 4 : 1;
  const minsLeft = Math.max(1, Math.ceil(budget * (1 - done.size / total)));
  const allDone = cats.length > 0 && done.size === total;

  // A re-check only re-runs flagged categories; the rest of the dam is already built.
  const logs: LogState[] = [
    ...Array.from({ length: cats.length ? 6 - cats.length : 0 }, (): LogState => "placed"),
    ...finished.map((f): LogState => (f.leak ? "leak" : "placed")),
  ];
  const anyLeak = finished.some((f) => f.leak);
  const scene: { pose: PipPose; line?: string; hardHat?: boolean } = error
    ? { pose: "oops", line: "Hmm, that didn't work." }
    : result === "approved"
      ? { pose: "celebrating", line: "Dam's done!" }
      : result === "approved_with_notes"
        ? { pose: "proud", line: "You're live!" }
        : result === "needs_changes"
          ? { pose: "oops", hardHat: true, line: "Almost there." }
          : anyLeak
            ? { pose: "thinking", line: "Found a gap, let's patch it." }
            : { pose: "working" };

  return (
    <SubmitFlow
      step={2}
      game={game}
      title={allDone ? "All done! Tallying up…" : `Checking ${game?.title ?? "your game"}`}
      sub={
        error ??
        (allDone
          ? "One sec"
          : `${attempt > 1 ? "Only re-checking what had notes last time. " : ""}About ${minsLeft} min left · ${elapsed}s in`)
      }
    >
      <div className="grid items-start gap-10 md:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {error ? (
            <Link
              to="/studio"
              className="inline-flex rounded-xl font-extrabold text-info hover:underline"
            >
              Back to My games
            </Link>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between text-sm font-extrabold">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-info" strokeWidth={3} />
                  {done.size} of {total} checks done
                </span>
                <span className="text-primary-pressed">{pct}%</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Safety check progress"
                className="mb-8 h-4 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>

              <ul className="space-y-5">
                {cats.map((c) => {
                  const Icon = CATEGORY_ICON[c];
                  const isDone = done.has(c);
                  return (
                    <li key={c} className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold">{CATEGORY_INFO[c].label}</p>
                        <p className="text-sm font-semibold text-muted-foreground">
                          {CATEGORY_INFO[c].short}
                        </p>
                      </div>
                      {isDone ? (
                        <Check className="h-6 w-6 animate-pop text-primary" strokeWidth={4} />
                      ) : (
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-secondary border-t-info" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <figure aria-hidden className="hidden flex-col items-center md:flex">
          <div className="mb-3 h-11">
            {scene.line && (
              <SpeechBubble key={scene.line} pointer="bottom" className="animate-pop">
                {scene.line}
              </SpeechBubble>
            )}
          </div>
          <div className="flex items-end">
            <Dam logs={logs} width={170} className="-mr-4" />
            <Pip key={scene.pose} pose={scene.pose} hardHat={scene.hardHat} size={130} />
          </div>
        </figure>
      </div>
    </SubmitFlow>
  );
}
