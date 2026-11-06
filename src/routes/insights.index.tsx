import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Star } from "lucide-react";
import { Container } from "@/components/app-shell";
import { chunkyVariants } from "@/components/chunky";
import { GameTile } from "@/components/game-tile";
import { StatStrip } from "@/components/insights-widgets";
import { useGames } from "@/lib/game-queries";
import { isLive } from "@/lib/game-status";
import { getGameInsights, stats } from "@/lib/insights-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights · SkillPlay" },
      {
        name: "description",
        content: "How your live games are doing in classrooms, and which one to improve first.",
      },
      { property: "og:title", content: "Insights · SkillPlay" },
      {
        property: "og:description",
        content: "How your live games are doing in classrooms, and which one to improve first.",
      },
    ],
  }),
  component: InsightsOverview,
});

function InsightsOverview() {
  const { data: games, isLoading } = useGames();

  if (isLoading) {
    return (
      <Container className="py-12">
        <p className="font-bold text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  // Only live games have insights; drafts and flagged games never appear here.
  const live = (games ?? [])
    .filter((g) => isLive(g.status))
    .flatMap((g) => {
      const insights = getGameInsights(g.id);
      return insights ? [{ game: g, insights, stats: stats(insights) }] : [];
    })
    .sort((a, b) => a.insights.meta.improve.order - b.insights.meta.improve.order);

  if (!live.length) {
    return (
      <Container className="py-12">
        <h1 className="mb-8 text-3xl sm:text-4xl">Insights: all your games</h1>
        <div className="rounded-3xl bg-muted p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground" strokeWidth={2.5} />
          <h2 className="text-2xl">No live games yet</h2>
          <p className="mx-auto mt-1 max-w-md font-semibold text-muted-foreground">
            Once a game is live and teachers start using it, you'll see how it's doing here.
          </p>
        </div>
      </Container>
    );
  }

  const n = live.length;
  const scope = `across ${n} game${n === 1 ? "" : "s"}`;
  const all = stats({
    reviews: live.flatMap((l) => l.insights.reviews),
    playSessions: live.flatMap((l) => l.insights.playSessions),
  });

  return (
    <Container className="py-12">
      <header className="mb-10 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl sm:text-4xl">Insights: all your games</h1>
        <span className="rounded-full bg-muted px-3 py-1 text-sm font-extrabold text-muted-foreground">
          {n} live game{n === 1 ? "" : "s"}
        </span>
      </header>

      <StatStrip
        stats={[
          {
            value: all.rating.toFixed(1),
            label: `Average rating ${scope}`,
            sub: `out of 5, from ${all.reviewCount} teachers`,
          },
          {
            value: `${all.completion}%`,
            label: `Completion rate ${scope}`,
            sub: `of ${all.sessionCount} class sessions finished`,
          },
          {
            value: `${all.didItWork}%`,
            label: `Did it work ${scope}`,
            sub: "teachers who said yes or partly",
          },
        ]}
      />

      <section>
        <h2 className="mb-2 text-2xl">Which game to improve first</h2>
        <p className="mb-6 font-semibold text-muted-foreground">
          Ranked by where a fix would help teachers most.
        </p>
        <ol>
          {live.map(({ game, insights, stats: s }, i) => {
            const top = i === 0;
            const reason = insights.meta.improve.reason;
            return (
              <li
                key={game.id}
                className={cn(
                  "flex items-center gap-5 rounded-3xl px-5 py-4",
                  top
                    ? "bg-primary-soft"
                    : "rounded-none border-b-2 border-secondary last:border-b-0",
                )}
              >
                <span className="w-6 shrink-0 text-center text-lg font-black text-muted-foreground">
                  {i + 1}
                </span>
                <GameTile game={game} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
                    {game.title}
                    {top && (
                      <span className="text-xs font-extrabold uppercase tracking-wide text-primary-pressed">
                        Start here
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "font-semibold",
                      reason ? "text-muted-foreground" : "text-primary-pressed",
                    )}
                  >
                    {reason ?? "Doing great"}
                  </p>
                </div>
                <div className="w-20 text-right">
                  <p className="flex items-center justify-end gap-1 font-black">
                    <Star className="h-4 w-4 fill-sun text-sun" strokeWidth={2.5} />
                    {s.rating.toFixed(1)}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">rating</p>
                </div>
                <div className="w-24 text-right">
                  <p className="font-black">{s.completion}%</p>
                  <p className="text-xs font-bold text-muted-foreground">completion</p>
                </div>
                <Link
                  to="/insights/$id"
                  params={{ id: game.id }}
                  className={cn(
                    top
                      ? chunkyVariants({ size: "md" })
                      : chunkyVariants({ variant: "ghost", size: "md" }),
                    "shrink-0",
                  )}
                >
                  View
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </Container>
  );
}
