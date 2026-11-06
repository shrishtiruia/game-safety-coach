import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { finalizeEvaluation, runCheck, startEvaluation } from "@/lib/evaluation.functions";
import { CATEGORY_INFO, type Category } from "@/lib/eval-config";
import { CATEGORY_ICON } from "@/components/chunky";
import { SubmitFlow } from "@/components/submit-flow";
import { useGameDetail } from "@/lib/game-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/submit/$id/check")({
  head: () => ({
    meta: [
      { title: "Running safety check · SkillPlay" },
      { name: "description", content: "Six safety and learning checks running on your game." },
      { property: "og:title", content: "Running safety check · SkillPlay" },
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
            await Promise.all([
              run({ data: { evaluationId: s.evaluationId, category: c } }),
              sleep(minPer + i * (s.attempt === 1 ? 2500 : 1500)),
            ]);
            setDone((d) => new Set(d).add(c));
          }),
        );
        await finalize({ data: { evaluationId: s.evaluationId } });
        await sleep(900);
        await qc.invalidateQueries();
        navigate({ to: "/submit/$id/result", params: { id } });
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

  return (
    <SubmitFlow
      step={2}
      title={allDone ? "All done! Tallying up…" : `Checking ${game?.title ?? "your game"}`}
      sub={
        error ??
        (allDone
          ? "One sec"
          : `${attempt > 1 ? "Only re-checking what had notes last time. " : ""}About ${minsLeft} min left · ${elapsed}s in`)
      }
    >
      {error ? (
        <Link to="/" className="inline-flex rounded-xl font-extrabold text-info hover:underline">
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
            className="mb-10 h-4 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          </div>

          <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
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
    </SubmitFlow>
  );
}
