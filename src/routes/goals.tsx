import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Cover, Pip } from "@/components/kit";
import { SkillIcon } from "@/components/icons";
import { classGoal, LOG_SIZE, shoutOutsFor, SKILL_COPY, spotlights } from "@/data/leaderboard";
import { classes } from "@/data/teacher";
import { topCreators, topGames, type Period } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const TITLE = "Class goals — Kitbit";
const DESC =
  "Your class builds a dam together: a shared goal, a kindness wall and what is working in other classrooms.";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: GoalsPage,
});

const card = "rounded-3xl bg-card p-5 shadow-card md:p-6";
const PERIOD: Period = "week";

function GoalsPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-8 md:px-8">
      <header className="max-w-2xl space-y-1">
        <h1 className="text-3xl md:text-4xl">Class goals</h1>
        <p className="text-lg">
          Your class works toward one goal together. Every badge a student earns adds a log to the
          class's dam, and a finished dam earns the whole class a reward. Nobody is ranked.
        </p>
      </header>

      <ClassGoal />
      <Spotlights period={PERIOD} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <TopGames period={PERIOD} />
        <TopCreators period={PERIOD} />
      </div>
    </div>
  );
}

/* ---------------- Your class goal (cooperative) ---------------- */

function ClassGoal() {
  const [classId, setClassId] = useState(classes[0]!.id);
  const goal = useMemo(() => classGoal(classId), [classId]);
  const shouts = useMemo(() => shoutOutsFor(classId), [classId]);
  const logsTotal = goal.goal / LOG_SIZE;
  const logsDone = Math.min(logsTotal, Math.floor(goal.earned / LOG_SIZE));
  const done = goal.earned >= goal.goal;
  const missing = goal.students - goal.contributors;
  const maxSkill = Math.max(1, ...goal.bySkill.map((b) => b.badges));

  return (
    <section aria-label="Your class goal" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Your class goal</h2>
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === classId}
              onClick={() => setClassId(c.id)}
              className={cn(
                "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition",
                c.id === classId
                  ? "border-leaf bg-leaf-soft"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className={cn(card, "space-y-5")}>
          <div className="flex items-start gap-4">
            <Pip pose={done ? "trophy" : "wave"} className="size-24 shrink-0" bob />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-muted-foreground">This month's dam</p>
              <p className="font-display text-3xl font-extrabold leading-tight">
                {goal.earned} of {goal.goal} badges
              </p>
              <p className="text-sm">
                Reward when it's finished: <span className="font-bold">{goal.reward}</span>
              </p>
            </div>
          </div>

          <Dam total={logsTotal} done={logsDone} />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-muted px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="size-4" aria-hidden /> {goal.contributors} of {goal.students}{" "}
              students added a log this week
            </span>
            {missing > 0 && (
              <Link
                to="/profile"
                className="font-bold text-leaf-edge underline-offset-2 hover:underline"
              >
                See who hasn't played yet →
              </Link>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-lg">Where the logs came from</h3>
            <ul className="space-y-1.5">
              {goal.bySkill.map((b) => (
                <li
                  key={b.skill}
                  className="grid grid-cols-[minmax(0,160px)_1fr_32px] items-center gap-3 text-sm"
                >
                  <span className="font-bold capitalize">
                    <SkillIcon
                      skill={b.skill}
                      className="mr-1 inline size-4 align-[-2px] text-honey"
                    />{" "}
                    {b.skill}
                  </span>
                  <span className="h-2.5 rounded-full bg-muted">
                    <span
                      className="block h-2.5 rounded-full bg-leaf"
                      style={{ width: `${(b.badges / maxSkill) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-bold text-muted-foreground">{b.badges}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn(card, "space-y-3")}>
          <div>
            <h3 className="text-xl">Kindness wall</h3>
            <p className="text-sm text-muted-foreground">
              Shout-outs students gave each other this week.
            </p>
          </div>
          <ul className="space-y-2.5">
            {shouts.map((s) => (
              <li key={s.id} className="rounded-2xl bg-muted p-3">
                <p className="text-sm">
                  <span className="font-extrabold">{s.from}</span> says{" "}
                  {s.toId ? (
                    <Link
                      to="/students/$id"
                      params={{ id: s.toId }}
                      className="font-extrabold hover:underline"
                    >
                      {s.to}
                    </Link>
                  ) : (
                    <span className="font-extrabold">{s.to}</span>
                  )}{" "}
                  {s.text}.
                </p>
                <p className="mt-1 text-xs font-bold text-muted-foreground">
                  <SkillIcon skill={s.skill} className="inline size-3.5 align-[-2px]" />{" "}
                  <span className="capitalize">{s.skill}</span> ·{" "}
                  {s.daysAgo === 0 ? "today" : `${s.daysAgo}d ago`}
                </p>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5" aria-hidden /> Only you can see student names. Other schools
            see your class name only.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Logs stacked like a beaver dam, staggered like bricks. */
function Dam({ total, done }: { total: number; done: number }) {
  const perRow = 8;
  const rows = Math.ceil(total / perRow);
  return (
    <div className="space-y-1.5" role="img" aria-label={`${done} of ${total} logs placed`}>
      {Array.from({ length: rows }, (_, r) => {
        const row = rows - 1 - r; // fill from the bottom row up
        return (
          <div key={row} className={cn("flex gap-1.5", row % 2 === 1 && "pl-4")}>
            {Array.from({ length: Math.min(perRow, total - row * perRow) }, (_, c) => {
              const i = row * perRow + c;
              const filled = i < done;
              return (
                <span
                  key={c}
                  className={cn(
                    "h-5 flex-1 rounded-full transition-colors",
                    filled
                      ? "bg-honey shadow-[inset_0_-3px_0_var(--honey-edge)]"
                      : "border-2 border-dashed border-border",
                  )}
                />
              );
            })}
          </div>
        );
      })}
      <p className="pt-1 text-xs text-muted-foreground">Each log is {LOG_SIZE} badges.</p>
    </div>
  );
}

/* ---------------- Skill spotlights ---------------- */

function Spotlights({ period }: { period: Period }) {
  const list = useMemo(() => spotlights(period), [period]);
  return (
    <section aria-label="What's working in other classes" className="space-y-4">
      <div>
        <h2 className="text-3xl">What's working in other classes</h2>
        <p className="text-muted-foreground">
          For each skill, the class that grew most this week and the game they used. Class names
          only.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <article key={s.skill} className={cn(card, "flex flex-col gap-3")}>
            <div className="flex items-center gap-3">
              <span
                className="grid size-12 place-items-center rounded-2xl bg-muted text-honey"
                aria-hidden
              >
                <SkillIcon skill={s.skill} className="size-6" />
              </span>
              <div>
                <h3 className="text-xl capitalize leading-tight">{s.skill}</h3>
                <p className="text-xs text-muted-foreground">{SKILL_COPY[s.skill].why}</p>
              </div>
            </div>
            <div>
              <p className="font-extrabold leading-tight">{s.className}</p>
              <p className="text-sm text-muted-foreground">
                {s.school} · <span className="font-bold text-leaf-edge">+{s.growth} pts</span>
              </p>
            </div>
            {s.game && (
              <Link
                to="/games/$slug"
                params={{ slug: s.game.slug }}
                className="mt-auto flex items-center gap-3 rounded-2xl bg-muted p-2 hover:bg-leaf-soft"
              >
                <span className="h-10 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Cover game={s.game} />
                </span>
                <span className="text-sm font-bold leading-tight">
                  They played <span className="underline-offset-2">{s.game.title}</span>
                </span>
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Games & creators ---------------- */

function TopGames({ period }: { period: Period }) {
  const list = useMemo(() => topGames(period).slice(0, 5), [period]);
  return (
    <section aria-label="Most-played games" className={card}>
      <h2 className="mb-3 text-2xl">Most-played games this week</h2>
      <ol className="space-y-2">
        {list.map(({ game, score }, i) => (
          <li key={game.id}>
            <Link
              to="/games/$slug"
              params={{ slug: game.slug }}
              className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-muted"
            >
              <span className="w-5 text-center font-display font-extrabold text-muted-foreground">
                {i + 1}
              </span>
              <span className="h-11 w-[72px] shrink-0 overflow-hidden rounded-xl">
                <Cover game={game} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{game.title}</span>
                <span className="block truncate text-xs capitalize text-muted-foreground">
                  {game.skills.slice(0, 2).join(" · ")}
                </span>
              </span>
              <span className="text-sm font-bold text-muted-foreground">
                {score.toLocaleString()} plays
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function TopCreators({ period }: { period: Period }) {
  const list = useMemo(() => topCreators(period).slice(0, 5), [period]);
  return (
    <section aria-label="Top creators" className={card}>
      <h2 className="mb-3 text-2xl">Top creators</h2>
      <ol className="space-y-2">
        {list.map(({ creator, score }, i) => (
          <li key={creator.id} className="flex items-center gap-3 rounded-2xl p-1.5">
            <span className="w-5 text-center font-display font-extrabold text-muted-foreground">
              {i + 1}
            </span>
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-2xl"
              aria-hidden
            >
              {creator.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-extrabold">{creator.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{creator.role}</span>
            </span>
            <span className="text-sm font-bold text-muted-foreground">
              {score.toLocaleString()} plays
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
