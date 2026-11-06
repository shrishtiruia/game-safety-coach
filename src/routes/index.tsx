import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/app-shell";
import { StickerBar } from "@/components/filters";
import { GameCard, Row } from "@/components/kit";
import { emptyFilters, getGames, ratingOf } from "@/lib/catalog";
import type { Game, Skill } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitbit · Browse soft-skill games for your classroom" },
      {
        name: "description",
        content:
          "Teacher-made games that teach empathy, teamwork, focus and conversation. Every game is safety-checked.",
      },
      { property: "og:title", content: "Kitbit · Soft-skill games for classrooms" },
      {
        property: "og:description",
        content: "Browse teacher-made games that build empathy, teamwork and focus.",
      },
    ],
  }),
  component: Home,
});

const SKILL_PICKS: { skill: Skill; line: string }[] = [
  { skill: "empathy", line: "Noticing how someone else feels, and doing something kind about it." },
  { skill: "teamwork", line: "Working toward one goal with classmates, and sharing the credit." },
  { skill: "active listening", line: "Hearing the whole idea before answering it." },
  { skill: "conflict resolution", line: "Solving a disagreement so nobody has to lose." },
  { skill: "handling failure", line: "Bouncing back when a plan goes wrong, and trying another way." },
  { skill: "focus", line: "Putting distractions away and staying with a task until it's done." },
];

function BrowseBySkill({ games }: { games: Game[] }) {
  const [active, setActive] = useState<Skill>("empathy");
  const pick = SKILL_PICKS.find((p) => p.skill === active);
  const all = games.filter((g) => g.skills.includes(active));
  const top = [...all].sort((a, b) => ratingOf(b.id).avg - ratingOf(a.id).avg).slice(0, 3);
  return (
    <section aria-labelledby="by-skill" className="space-y-5">
      <h2 id="by-skill" className="text-2xl">
        Browse by skill
      </h2>
      <div
        role="tablist"
        aria-label="Soft skills"
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-2xl sm:bg-muted sm:p-1"
      >
        {SKILL_PICKS.map((p) => {
          const on = p.skill === active;
          return (
            <button
              key={p.skill}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(p.skill)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-xl px-4 py-2 font-extrabold capitalize transition",
                on
                  ? "bg-background text-foreground shadow-[0_2px_0_0_var(--color-secondary)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.skill}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" aria-label={`${active} games`} className="space-y-4">
        <p className="font-semibold text-muted-foreground">{pick?.line}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((g) => (
            <GameCard key={g.id} game={g} className="w-auto" tag={active} />
          ))}
        </div>
        <Link
          to="/search"
          search={{ ...emptyFilters, skills: [active] }}
          className="inline-flex items-center gap-1 font-extrabold text-info hover:underline"
        >
          See all {all.length} {active} games <ChevronRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const games = getGames();
  const by = (fn: (a: Game, b: Game) => number) => [...games].sort(fn).slice(0, 10);

  return (
    <Container className="space-y-14 py-12">
      <header className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl">Games that teach soft skills</h1>
          <p className="mt-2 max-w-2xl text-lg font-semibold text-muted-foreground">
            Made by teachers, safety-checked before they reach your class.
          </p>
        </div>
        <StickerBar filters={emptyFilters} onChange={(f) => navigate({ to: "/search", search: f })} />
      </header>

      <Row title="Trending in classrooms this week">
        {by((a, b) => b.weeklyPlays - a.weeklyPlays).map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </Row>

      <BrowseBySkill games={games} />

      <Row title="Teacher favourites">
        {by((a, b) => ratingOf(b.id).avg - ratingOf(a.id).avg).map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </Row>
    </Container>
  );
}
