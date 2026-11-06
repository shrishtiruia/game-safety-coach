import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Breadcrumbs, Container } from "@/components/app-shell";
import {
  FunnelChart,
  GameImprovements,
  GradeChart,
  ReviewList,
  StatStrip,
  ThemesPanel,
} from "@/components/insights-widgets";
import { useGames } from "@/lib/game-queries";
import { isLive } from "@/lib/game-status";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { funnel, getGameInsights, outcomesByGrade, stats } from "@/lib/insights-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights/$id")({
  head: () => ({
    meta: [
      { title: "Game insights · SkillPlay" },
      {
        name: "description",
        content: "What teachers are saying about your game, and the top things to improve.",
      },
      { property: "og:title", content: "Game insights · SkillPlay" },
      {
        property: "og:description",
        content: "What teachers are saying about your game, and the top things to improve.",
      },
    ],
  }),
  component: GameInsights,
});

const TABS = [
  { key: "themes", label: "What teachers are saying" },
  { key: "dropoff", label: "Where students drop off" },
  { key: "grades", label: "Outcomes by grade band" },
  { key: "reviews", label: "All reviews" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function GameInsights() {
  const { id } = Route.useParams();
  const { data: games, isLoading } = useGames();
  const [tab, setTab] = useState<TabKey>("themes");

  if (isLoading) {
    return (
      <Container className="py-12">
        <p className="font-bold text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  const game = games?.find((g) => g.id === id);
  const insights = game && isLive(game.status) ? getGameInsights(game.id) : null;

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[{ label: "Insights", to: "/insights" }, { label: game?.title ?? "Game" }]}
      />
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl">{game?.title ?? "Game not found"}</h1>
        {game && (
          <p className="mt-1 font-semibold text-muted-foreground">
            {SKILL_LABEL[game.skill]} · Grades {game.grade_band} · {game.duration_minutes} min ·{" "}
            {FORMAT_LABEL[game.format]}
          </p>
        )}
      </header>

      {!insights ? (
        <div className="rounded-3xl bg-muted p-12 text-center">
          <h2 className="text-2xl">No insights for this game</h2>
          <p className="mx-auto mt-1 max-w-md font-semibold text-muted-foreground">
            Insights show up once a game is live and teachers start using it.
          </p>
          <Link
            to="/insights"
            className="mt-4 inline-flex rounded-xl font-extrabold text-info hover:underline"
          >
            Back to Insights
          </Link>
        </div>
      ) : (
        <Dashboard gameId={id} insights={insights} tab={tab} setTab={setTab} />
      )}
    </Container>
  );
}

function Dashboard({
  gameId,
  insights,
  tab,
  setTab,
}: {
  gameId: string;
  insights: NonNullable<ReturnType<typeof getGameInsights>>;
  tab: TabKey;
  setTab: (t: TabKey) => void;
}) {
  const s = stats(insights);
  return (
    <>
      <StatStrip
        stats={[
          {
            value: `${s.completion}%`,
            label: "Completion rate",
            sub: `of ${s.sessionCount} class sessions finished`,
          },
          {
            value: `${s.didItWork}%`,
            label: "Said it worked",
            sub: `yes or partly, from ${s.reviewCount} teachers`,
          },
          { value: s.rating.toFixed(1), label: "Educator rating", sub: "average out of 5" },
        ]}
      />

      <GameImprovements gameId={gameId} seeded={insights.actions} />

      <section>
        <div
          role="tablist"
          aria-label="More insights"
          className="mb-8 flex gap-6 overflow-x-auto border-b-2 border-secondary"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls={`panel-${t.key}`}
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-0.5 shrink-0 whitespace-nowrap border-b-4 px-1 pb-3 font-extrabold transition-colors",
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.key === "reviews" && (
                <span className="ml-1.5 text-muted-foreground">{insights.reviews.length}</span>
              )}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "themes" && <ThemesPanel themes={insights.themes} />}
          {tab === "dropoff" && <FunnelChart data={funnel(insights.playSessions)} />}
          {tab === "grades" && <GradeChart data={outcomesByGrade(insights.reviews)} />}
          {tab === "reviews" && <ReviewList reviews={insights.reviews} />}
        </div>
      </section>
    </>
  );
}
