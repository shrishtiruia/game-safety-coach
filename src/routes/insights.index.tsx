import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ChevronRight } from "lucide-react";
import { Container } from "@/components/app-shell";
import { ImprovementsPanel, StatStrip, type LabeledAction } from "@/components/insights-widgets";
import { useGames } from "@/lib/game-queries";
import { isLive } from "@/lib/game-status";
import { getGameInsights, stats } from "@/lib/insights-data";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    meta: [
      { title: "Insights · SkillPlay" },
      {
        name: "description",
        content: "How your live games are doing in classrooms, and what to improve first.",
      },
      { property: "og:title", content: "Insights · SkillPlay" },
      {
        property: "og:description",
        content: "How your live games are doing in classrooms, and what to improve first.",
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
    });

  if (!live.length) {
    return (
      <Container className="py-12">
        <h1 className="mb-8 text-3xl sm:text-4xl">Insights</h1>
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

  const all = stats({
    reviews: live.flatMap((l) => l.insights.reviews),
    playSessions: live.flatMap((l) => l.insights.playSessions),
    themes: [],
    actions: [],
  });

  const top: LabeledAction[] = live
    .flatMap((l) => l.insights.actions.map((a) => ({ ...a, gameTitle: l.game.title })))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);

  return (
    <Container className="py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl">Insights</h1>
        <p className="mt-1 font-semibold text-muted-foreground">
          Across your {live.length} live game{live.length === 1 ? "" : "s"}, from {all.reviewCount}{" "}
          teacher reviews and {all.sessionCount} class sessions.
        </p>
      </header>

      <StatStrip
        stats={[
          { value: all.rating.toFixed(1), label: "Average rating", sub: "out of 5 from teachers" },
          { value: `${all.completion}%`, label: "Completion rate", sub: "class sessions finished" },
          { value: `${all.didItWork}%`, label: "Said it worked", sub: "yes or partly" },
        ]}
      />

      <ImprovementsPanel
        title="Top things to improve"
        sub="The changes most likely to help teachers, across your games"
        actions={top}
      />

      <section>
        <h2 className="mb-4 text-xl">Your live games</h2>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b-2 border-secondary text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4">Game</th>
                <th className="py-3 pr-4">Rating</th>
                <th className="py-3 pr-4">Completion</th>
                <th className="py-3 pr-4">Top issue</th>
                <th className="py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {live.map(({ game, insights, stats: s }) => (
                <tr key={game.id} className="border-b-2 border-secondary last:border-b-0">
                  <td className="py-4 pr-4 font-extrabold">{game.title}</td>
                  <td className="py-4 pr-4 font-bold">{s.rating.toFixed(1)}</td>
                  <td className="py-4 pr-4 font-bold">{s.completion}%</td>
                  <td className="py-4 pr-4 font-semibold text-muted-foreground">
                    {insights.actions.find((a) => a.priority === 1)?.title ?? "None"}
                  </td>
                  <td className="py-4 text-right">
                    <Link
                      to="/insights/$id"
                      params={{ id: game.id }}
                      className="inline-flex items-center gap-1 rounded-xl px-3 py-2 font-extrabold text-info hover:bg-info-soft"
                    >
                      View <ChevronRight className="h-4 w-4" strokeWidth={3} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
