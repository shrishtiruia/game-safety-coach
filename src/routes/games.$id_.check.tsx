import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { finalizeEvaluation, runCheck, startEvaluation } from "@/lib/evaluation.functions";
import { CATEGORY_INFO, type Category } from "@/lib/eval-config";
import { CATEGORY_ICON } from "@/components/chunky";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games/$id_/check")({
  head: () => ({
    meta: [
      { title: "Running safety check · SkillPlay" },
      { name: "description", content: "Six safety and learning checks running on your game." },
      { property: "og:title", content: "Running safety check · SkillPlay" },
      { property: "og:description", content: "Six safety and learning checks running on your game." },
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
        navigate({ to: "/games/$id", params: { id } });
      } catch (e) {
        console.error(e);
        setError("Something hiccupped. Head back and try again.");
      }
    })();
  }, [id, start, run, finalize, navigate, qc]);

  const total = cats.length || 6;
  const pct = Math.round((done.size / total) * 100);
  const budget = attempt === 1 ? 4 : 1;
  const minsLeft = Math.max(1, Math.ceil(budget * (1 - done.size / total)));
  const allDone = cats.length > 0 && done.size === total;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-10">
      <div className="mb-8 h-5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 animate-bob items-center justify-center rounded-full bg-info-soft text-info">
          <Sparkles className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-info">Attempt {attempt}</p>
        <h1 className="text-3xl">{allDone ? "All done! Tallying up…" : "Checking your game"}</h1>
        <p className="mt-1 font-bold text-muted-foreground">
          {error ?? (allDone ? "One sec" : `About ${minsLeft} min left · ${elapsed}s in`)}
        </p>
        {attempt > 1 && !allDone && (
          <p className="mt-2 text-sm font-bold text-muted-foreground">Only re-checking what had notes last time.</p>
        )}
      </div>

      <ul className="space-y-3">
        {cats.map((c) => {
          const Icon = CATEGORY_ICON[c];
          const isDone = done.has(c);
          return (
            <li
              key={c}
              className={cn(
                "flex items-center gap-4 rounded-2xl border-2 p-4 transition-colors",
                isDone ? "border-primary bg-primary-soft" : "border-secondary",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  isDone ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="font-extrabold">{CATEGORY_INFO[c].label}</p>
                <p className="text-sm font-semibold text-muted-foreground">{CATEGORY_INFO[c].short}</p>
              </div>
              {isDone ? (
                <div className="flex h-9 w-9 animate-pop items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-5 w-5" strokeWidth={4} />
                </div>
              ) : (
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-secondary border-t-info" />
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
