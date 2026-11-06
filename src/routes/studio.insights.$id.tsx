import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Breadcrumbs, Container } from "@/components/app-shell";
import { chunkyVariants } from "@/components/chunky";
import { GameTile } from "@/components/game-tile";
import { Pip } from "@/components/mascot";
import {
  FunnelChart,
  GradeChart,
  ImprovedCard,
  RankingInfo,
  RequestsList,
  ReviewList,
  StatStrip,
  ThemesPanel,
  TopImprovements,
} from "@/components/insights-widgets";
import { useGames } from "@/lib/game-queries";
import { isLive } from "@/lib/game-status";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { funnel, getGameInsights, outcomesByGrade, stats } from "@/lib/insights-data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

/** hosted_url arrives with a Lovable migration; until then only sample games have one. */
const hostedUrl = (g: object) =>
  "hosted_url" in g && typeof g.hosted_url === "string" && g.hosted_url ? g.hosted_url : undefined;

export const Route = createFileRoute("/studio/insights/$id")({
  head: () => ({
    meta: [
      { title: "Game insights · Kitbit Studio" },
      {
        name: "description",
        content: "What teachers are saying about your game, and the top things to improve.",
      },
      { property: "og:title", content: "Game insights · Kitbit Studio" },
      {
        property: "og:description",
        content: "What teachers are saying about your game, and the top things to improve.",
      },
    ],
  }),
  component: GameInsights,
});

const TABS = [
  { key: "feedback", label: "Feedback" },
  { key: "requests", label: "Requests" },
  { key: "dropoff", label: "Drop-off" },
  { key: "grades", label: "Grade outcomes" },
  { key: "reviews", label: "All reviews" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function GameInsights() {
  const { id } = Route.useParams();
  const { data: games, isLoading } = useGames();

  if (isLoading) {
    return (
      <Container className="py-12">
        <p className="font-bold text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  const game = games?.find((g) => g.id === id);
  const insights = game && isLive(game.status) ? getGameInsights(game.id) : null;

  if (!game || !insights) {
    const liveNoReviews = !!game && isLive(game.status);
    return (
      <Container className="py-10">
        <Breadcrumbs
          items={[{ label: "Insights", to: "/studio/insights" }, { label: game?.title ?? "Game" }]}
        />
        {liveNoReviews ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Pip pose="waiting" size="lg" />
            <h1 className="mt-4 text-2xl">No reviews yet for {game.title}</h1>
            <p className="mb-6 mt-1 font-semibold text-muted-foreground">
              It's live. Insights appear once teachers try it.
            </p>
            <Link to="/studio" className={chunkyVariants()}>
              Back to My games
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl bg-muted p-12 text-center">
            <h1 className="text-2xl">No insights for this game</h1>
            <p className="mx-auto mt-1 max-w-md font-semibold text-muted-foreground">
              Insights show up once a game is live and teachers start using it.
            </p>
            <Link
              to="/studio/insights"
              className="mt-4 inline-flex rounded-xl font-extrabold text-info hover:underline"
            >
              Back to Insights
            </Link>
          </div>
        )}
      </Container>
    );
  }

  return <Dashboard game={game} insights={insights} />;
}

function Dashboard({
  game,
  insights,
}: {
  game: {
    id: string;
    title: string;
    skill: string;
    grade_band: string;
    duration_minutes: number;
    format: string;
  };
  insights: NonNullable<ReturnType<typeof getGameInsights>>;
}) {
  const [tab, setTab] = useState<TabKey>("feedback");
  const [highlight, setHighlight] = useState<string | null>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const s = stats(insights);
  const { meta } = insights;

  const showRequest = (requestId: string) => {
    setTab("requests");
    setHighlight(requestId);
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Container className="py-10">
      <Breadcrumbs items={[{ label: "Insights", to: "/studio/insights" }, { label: game.title }]} />

      <header className="mb-10 flex items-center gap-6">
        <GameTile game={game} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-3xl sm:text-4xl">{game.title}</h1>
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary-pressed">
              <span className="h-2 w-2 rounded-full bg-primary" /> Live
            </span>
          </div>
          <p className="mt-1 font-semibold text-muted-foreground">
            {SKILL_LABEL[game.skill]} · Grades {game.grade_band} · {game.duration_minutes} min ·{" "}
            {FORMAT_LABEL[game.format]}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-extrabold">
              #{meta.rank.position} in {meta.rank.category}
            </span>
            {meta.badges.slice(0, 2).map((b) => (
              <span key={b} className="text-sm font-extrabold text-warning-pressed">
                ★ {b}
              </span>
            ))}
            <RankingInfo />
            {hostedUrl(game) && (
              <a
                href={hostedUrl(game)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded text-sm font-extrabold text-info hover:underline"
              >
                Play game <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
              </a>
            )}
          </p>
        </div>
      </header>

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

      {meta.pastUpdate && <ImprovedCard update={meta.pastUpdate} />}

      <TopImprovements
        gameId={game.id}
        seeded={insights.actions}
        requests={insights.requests}
        onShowRequest={showRequest}
      />

      <section ref={tabsRef} className="scroll-mt-24">
        <div
          role="tablist"
          aria-label="More insights"
          className="mb-8 flex gap-8 overflow-x-auto border-b-2 border-secondary"
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
              {t.key === "requests" && (
                <span className="ml-1.5 text-muted-foreground">{insights.requests.length}</span>
              )}
              {t.key === "reviews" && (
                <span className="ml-1.5 text-muted-foreground">{insights.reviews.length}</span>
              )}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === "feedback" && <ThemesPanel themes={insights.themes} />}
          {tab === "requests" && (
            <RequestsList requests={insights.requests} highlightId={highlight} />
          )}
          {tab === "dropoff" && <FunnelChart data={funnel(insights.playSessions)} />}
          {tab === "grades" && <GradeChart data={outcomesByGrade(insights.reviews)} />}
          {tab === "reviews" && <ReviewList reviews={insights.reviews} />}
        </div>
      </section>
    </Container>
  );
}
