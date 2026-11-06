import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Plus, Star } from "lucide-react";
import { Container } from "@/components/app-shell";
import { chunkyVariants } from "@/components/chunky";
import { MakerStatusChip } from "@/components/maker-status";
import { useGames, useLatestResults, type LatestResult } from "@/lib/game-queries";
import { makerStatus } from "@/lib/game-status";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { getGameInsights, stats } from "@/lib/insights-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My games · SkillPlay" },
      {
        name: "description",
        content: "All your games in one place: what's live, and what's still in drafts.",
      },
      { property: "og:title", content: "My games · SkillPlay" },
      {
        property: "og:description",
        content: "All your games in one place: what's live, and what's still in drafts.",
      },
    ],
  }),
  component: MyGames,
});

const FILTERS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "draft", label: "Drafts" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

type Game = {
  id: string;
  title: string;
  skill: string;
  grade_band: string;
  duration_minutes: number;
  format: string;
  status: string;
};

function MyGames() {
  const { data: games, isLoading } = useGames();
  const { data: results } = useLatestResults();
  const [filter, setFilter] = useState<FilterKey>("all");

  const all = games ?? [];
  const count = (k: FilterKey) =>
    k === "all" ? all.length : all.filter((g) => makerStatus(g.status) === k).length;
  const visible = filter === "all" ? all : all.filter((g) => makerStatus(g.status) === filter);

  return (
    <Container className="py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">My games</h1>
          <p className="mt-1 font-semibold text-muted-foreground">
            {isLoading ? "Loading…" : `${all.length} game${all.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link to="/submit" className={cn(chunkyVariants(), "shrink-0")}>
          <Plus className="h-5 w-5" strokeWidth={3} /> Submit a game
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter games"
        className="mb-8 inline-flex rounded-2xl bg-muted p-1"
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-xl px-4 py-2 font-extrabold transition",
              filter === f.key
                ? "bg-background text-foreground shadow-[0_2px_0_0_var(--color-secondary)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label} <span className="ml-1 text-muted-foreground">{count(f.key)}</span>
          </button>
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <div className="rounded-3xl bg-muted p-12 text-center">
          <p className="font-extrabold">
            {filter === "live" ? "No live games yet." : "No drafts. Nice and tidy."}
          </p>
        </div>
      )}

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((g) => (
          <li key={g.id}>
            <GameCard game={g} latest={results?.[g.id]} />
          </li>
        ))}
      </ul>
    </Container>
  );
}

function GameCard({ game: g, latest }: { game: Game; latest: LatestResult | undefined }) {
  const live = makerStatus(g.status) === "live";
  const insights = live ? getGameInsights(g.id) : null;
  const s = insights ? stats(insights) : null;

  const meta = `${SKILL_LABEL[g.skill]} · Grades ${g.grade_band} · ${g.duration_minutes} min · ${FORMAT_LABEL[g.format]}`;
  const cardCls =
    "group flex h-full flex-col rounded-3xl border-2 border-b-4 border-secondary bg-card p-6 transition hover:-translate-y-0.5 hover:border-info active:translate-y-0.5";

  const body = (
    <>
      <MakerStatusChip status={g.status} className="mb-4 self-start" />
      <h2 className="text-xl group-hover:text-info">{g.title}</h2>
      <p className="mb-6 text-sm font-bold text-muted-foreground">{meta}</p>
    </>
  );

  if (live) {
    return (
      <Link to="/insights/$id" params={{ id: g.id }} className={cardCls}>
        {body}
        <div className="mt-auto flex items-end justify-between gap-4">
          {s ? (
            <dl className="flex gap-6">
              <div>
                <dt className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                  Rating
                </dt>
                <dd className="flex items-center gap-1 text-lg font-black">
                  <Star className="h-4 w-4 fill-sun text-sun" strokeWidth={2.5} />
                  {s.rating.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                  Completion
                </dt>
                <dd className="text-lg font-black">{s.completion}%</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm font-bold text-muted-foreground">No reviews yet</p>
          )}
          <span className="inline-flex shrink-0 items-center gap-1 font-extrabold text-info">
            View insights <ChevronRight className="h-4 w-4" strokeWidth={3} />
          </span>
        </div>
      </Link>
    );
  }

  const needsChanges = latest?.result === "needs_changes" && g.status === "needs_changes";
  const line = needsChanges
    ? `Needs changes · ${latest.mustFix} to fix`
    : g.status === "in_review"
      ? "Safety check in progress"
      : "Not checked yet";

  return (
    <Link to="/submit/$id/result" params={{ id: g.id }} className={cardCls}>
      {body}
      <div className="mt-auto flex items-end justify-between gap-4">
        <p
          className={cn(
            "text-sm font-extrabold",
            needsChanges ? "text-danger" : "text-muted-foreground",
          )}
        >
          {line}
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 font-extrabold text-info">
          {needsChanges ? "Continue fixing" : "Run safety check"}
          <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </span>
      </div>
    </Link>
  );
}
