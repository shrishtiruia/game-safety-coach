import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/app-shell";
import { StickerBar } from "@/components/filters";
import { Cover, CreatorAvatar, GameCard, Row, useAddToClass } from "@/components/kit";
import { emptyFilters, formatPrice, getCreators, getGames, ratingOf } from "@/lib/catalog";
import { SKILL_AREAS, type Game, type Skill } from "@/data/types";
import { isPlayable } from "@/lib/playable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kitbit · Games that teach what screens can't" },
      {
        name: "description",
        content:
          "Teacher-made games that teach empathy, teamwork, focus and conversation. Every game is safety-checked.",
      },
      { property: "og:title", content: "Kitbit · Games that teach what screens can't" },
      {
        property: "og:description",
        content: "Browse teacher-made games that build empathy, teamwork and focus.",
      },
    ],
  }),
  component: Home,
});

/** The big featured tile: one game at a time, rotating every 6s unless hovered. */
function Featured() {
  const featured = getGames()
    .filter((g) => g.featured)
    .slice(0, 4);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const addToClass = useAddToClass();
  useEffect(() => {
    if (paused || featured.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % featured.length), 6000);
    return () => clearInterval(t);
  }, [paused, featured.length]);
  const g = featured[i] ?? featured[0];
  if (!g) return null;
  const step = (d: number) => setI((x) => (x + d + featured.length) % featured.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured games"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="space-y-4"
    >
      <div className="grid overflow-hidden rounded-3xl border border-secondary bg-card md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Link
          to="/games/$slug"
          params={{ slug: g.slug }}
          className="aspect-[5/3] overflow-hidden md:aspect-auto md:min-h-[320px]"
          tabIndex={-1}
          aria-hidden
        >
          <Cover game={g} eager />
        </Link>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10" aria-live="polite">
          <span className="w-fit rounded-full bg-sun-soft px-3 py-1 text-xs font-extrabold text-info-pressed">
            Featured game
          </span>
          <h2 className="text-3xl sm:text-4xl">{g.title}</h2>
          <p className="text-lg font-semibold text-muted-foreground">{g.tagline}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            {isPlayable(g.slug) ? (
              <Link to="/play/$slug" params={{ slug: g.slug }} className="btn-3d tone-leaf">
                Play it now
              </Link>
            ) : (
              <Link to="/games/$slug" params={{ slug: g.slug }} className="btn-3d tone-leaf">
                See the game
              </Link>
            )}
            <button type="button" className="btn-3d tone-cream" onClick={() => addToClass(g)}>
              Add to class · {formatPrice(g.price)}
            </button>
          </div>
        </div>
      </div>
      {featured.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous featured game"
            className="grid size-11 place-items-center rounded-xl hover:bg-muted"
          >
            <ChevronLeft className="size-5" strokeWidth={3} />
          </button>
          <div className="flex gap-1" role="tablist" aria-label="Choose featured game">
            {featured.map((f, k) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={f.title}
                onClick={() => setI(k)}
                className="grid size-11 place-items-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all",
                    k === i ? "w-6 bg-primary" : "w-2 bg-secondary",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next featured game"
            className="grid size-11 place-items-center rounded-xl hover:bg-muted"
          >
            <ChevronRight className="size-5" strokeWidth={3} />
          </button>
        </div>
      )}
    </section>
  );
}

function FeaturedCreators() {
  return (
    <Row title="Featured creators">
      {getCreators().map((c) => (
        <Link
          key={c.id}
          to="/search"
          search={{ ...emptyFilters, q: c.name }}
          className="flex w-40 shrink-0 flex-col items-center gap-2 rounded-3xl border border-secondary bg-card p-4 text-center transition hover:-translate-y-0.5 hover:border-info"
        >
          <CreatorAvatar creator={c} size="lg" />
          <span className="font-extrabold leading-tight">{c.name}</span>
          <span className="text-xs font-bold text-muted-foreground">{c.role}</span>
        </Link>
      ))}
    </Row>
  );
}

/** Browse by the five SEL areas, then narrow to one skill. */
function BrowseBySkill({ games }: { games: Game[] }) {
  const [areaId, setAreaId] = useState<string>(SKILL_AREAS[0].id);
  const [skill, setSkill] = useState<Skill | "all">("all");
  const area = SKILL_AREAS.find((x) => x.id === areaId) ?? SKILL_AREAS[0];
  const inArea = (g: Game) => g.skills.some((k) => (area.skills as readonly string[]).includes(k));
  const pool = games.filter((g) => (skill === "all" ? inArea(g) : g.skills.includes(skill)));
  const top = [...pool].sort((a, b) => ratingOf(b.id).avg - ratingOf(a.id).avg).slice(0, 3);
  const linkSkills: string[] = skill === "all" ? [...area.skills] : [skill];

  return (
    <section aria-labelledby="by-skill" className="space-y-5">
      <div>
        <h2 id="by-skill" className="text-2xl">
          Browse by skill
        </h2>
        <p className="mt-1 max-w-2xl font-semibold text-muted-foreground">
          Every game is tagged with the soft skills it teaches, grouped into the five areas schools
          use for social-emotional learning.
        </p>
      </div>
      <div
        role="tablist"
        aria-label="Skill areas"
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-2xl sm:bg-muted sm:p-1"
      >
        {SKILL_AREAS.map((x) => {
          const on = x.id === area.id;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setAreaId(x.id);
                setSkill("all");
              }}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-xl px-4 py-2 font-extrabold transition",
                on
                  ? "bg-background text-foreground shadow-[0_2px_0_0_var(--color-secondary)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" aria-label={`${area.label} games`} className="space-y-4">
        <p className="font-semibold text-muted-foreground">{area.line}</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Skills in ${area.label}`}>
          {(["all", ...area.skills] as const).map((k) => {
            const on = skill === k;
            const n =
              k === "all"
                ? games.filter(inArea).length
                : games.filter((g) => g.skills.includes(k)).length;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSkill(k)}
                className="sticker first-letter:uppercase"
                data-active={on}
              >
                {k === "all" ? "All" : k}
                <span className="font-semibold text-muted-foreground">{n}</span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              className="w-auto"
              tag={
                skill === "all"
                  ? (g.skills.find((k) => (area.skills as readonly string[]).includes(k)) ??
                    g.skills[0] ??
                    "")
                  : skill
              }
            />
          ))}
        </div>
        <Link
          to="/search"
          search={{ ...emptyFilters, skills: linkSkills }}
          className="inline-flex items-center gap-1 font-extrabold text-info hover:underline"
        >
          See all {pool.length} {skill === "all" ? area.label.toLowerCase() : skill} games
          <ChevronRight className="h-4 w-4" strokeWidth={3} />
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
    <Container className="space-y-14 py-10">
      <Featured />

      <header className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl">Games that teach what screens can't</h1>
          <p className="mt-2 max-w-2xl text-lg font-semibold text-muted-foreground">
            Short, teacher-made rounds where kids practise empathy, teamwork, focus and
            conversation. Every game is safety-checked.
          </p>
        </div>
        <StickerBar filters={emptyFilters} onChange={(f) => navigate({ to: "/search", search: f })} />
      </header>

      <FeaturedCreators />

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
