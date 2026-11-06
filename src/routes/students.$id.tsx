import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Award, Flame, Gamepad2, Home, Lock, Play, Sparkles, Sprout, Star } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Cover, Pip, SkillTag } from "@/components/kit";
import { SkillJourney } from "@/components/SkillJourney";
import { BadgeIcon } from "@/components/icons";
import {
  badgesOf,
  dateDaysAgo,
  levelOf,
  streakOf,
  studentGames,
  teacherNotesOf,
  type StudentBadge,
  type StudentGame,
} from "@/data/student";
import {
  getClass,
  getStudent,
  lastActiveLabel,
  overallOf,
  studentName,
  topSkill,
  TRACKED_SKILLS,
  weakSkill,
  type Student,
} from "@/data/teacher";
import { confetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/students/$id")({
  loader: ({ params }) => {
    const student = getStudent(params.id);
    if (!student) throw notFound();
    return { student };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${studentName(loaderData.student)} — Student profile | Kitbit`
      : "Student | Kitbit";
    const desc = "Assigned games, skill journey, development and badges for one student.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: StudentPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl space-y-4 p-10 text-center">
      <Pip pose="search" className="mx-auto size-32" bob />
      <h1 className="text-3xl">Student not found</h1>
      <Link to="/profile" className="btn-3d tone-leaf">
        Back to my classes
      </Link>
    </div>
  ),
  errorComponent: () => <p className="p-10 text-center">Couldn't load this student.</p>,
});

const card = "rounded-lg border bg-card p-5 shadow-card md:p-6";
const toneBg = {
  honey: "bg-honey-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  berry: "bg-berry-soft",
};

function StudentPage() {
  const { student: s } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 md:px-8">
      <Header s={s} />
      <AssignedGames s={s} />
      <SkillJourney s={s} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Development s={s} />
        <Notes s={s} />
      </div>
      <Badges s={s} />
    </div>
  );
}

/* ---------------- Header ---------------- */

function Header({ s }: { s: Student }) {
  const cls = getClass(s.classId);
  const lvl = levelOf(s);
  const streak = streakOf(s);
  const overall = overallOf(s);
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/profile" className="font-bold text-muted-foreground hover:underline">
          ← Back to {cls?.name ?? "my classes"}
        </Link>
        <Link
          to="/family/$id"
          params={{ id: s.id }}
          className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-extrabold hover:bg-muted"
        >
          <Home className="size-4 text-honey" aria-hidden /> Family view
        </Link>
      </div>
      <div className={cn(card, "relative overflow-hidden")}>
        <Pip pose="trophy" className="absolute -bottom-4 right-2 hidden size-36 md:block" bob />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center md:pr-40">
          <ProgressRing value={overall}>
            <span className="text-5xl" aria-hidden>
              {s.emoji}
            </span>
          </ProgressRing>
          <div className="min-w-0 flex-1 space-y-2">
            <h1 className="text-3xl md:text-4xl">{studentName(s)}</h1>
            <p className="font-bold">
              {cls?.name} · {overall}% overall · last active{" "}
              {lastActiveLabel(s.lastActiveDaysAgo).toLowerCase()}
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip>
                <Star className="size-4 fill-star text-star" aria-hidden /> Level {lvl.level} ·{" "}
                {lvl.name}
              </Chip>
              <Chip>
                <Flame
                  className={cn("size-4", streak ? "text-honey" : "text-muted-foreground")}
                  aria-hidden
                />
                {streak ? `${streak}-day streak` : "Streak paused"}
              </Chip>
              <Chip>
                <Award className="size-4 text-honey" aria-hidden /> {s.badges} badges
              </Chip>
              <Chip>
                <Gamepad2 className="size-4 text-honey" aria-hidden /> {s.gamesCompleted} games done
              </Chip>
            </div>
            <div className="max-w-md pt-1">
              <div className="flex justify-between text-sm font-bold">
                <span>XP to level {lvl.level + 1}</span>
                <span>
                  {lvl.intoLevel}/{lvl.perLevel}
                </span>
              </div>
              <div
                className="h-4 rounded-full bg-card"
                role="progressbar"
                aria-valuenow={lvl.intoLevel}
                aria-valuemin={0}
                aria-valuemax={lvl.perLevel}
                aria-label="XP to next level"
              >
                <div
                  className="h-4 rounded-full bg-honey transition-all duration-700"
                  style={{ width: `${(lvl.intoLevel / lvl.perLevel) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressRing({ value, children }: { value: number; children: React.ReactNode }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative grid size-32 shrink-0 place-items-center"
      role="img"
      aria-label={`${value}% overall progress`}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="var(--card)" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--leaf)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-all duration-700"
        />
      </svg>
      {children}
      <span className="absolute -bottom-1 rounded-full bg-leaf px-2.5 py-0.5 text-xs font-extrabold text-primary-foreground">
        {value}%
      </span>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-bold shadow-card">
      {children}
    </span>
  );
}

/* ---------------- Assigned games ---------------- */

const statusMeta = {
  "not-started": { label: "Not started", cls: "bg-muted text-muted-foreground", cta: "Play" },
  "in-progress": { label: "In progress", cls: "bg-honey-soft", cta: "Continue" },
  completed: { label: "Completed", cls: "bg-leaf-soft", cta: "Play again" },
} as const;

function AssignedGames({ s }: { s: Student }) {
  const list = studentGames(s);
  return (
    <section aria-label="Assigned games" className="space-y-3">
      <h2 className="text-3xl">Assigned games</h2>
      {list.length === 0 ? (
        <p className={card}>No games assigned yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((g) => (
            <GameTile key={g.assignmentId} g={g} name={s.firstName} />
          ))}
        </div>
      )}
    </section>
  );
}

function GameTile({ g, name }: { g: StudentGame; name: string }) {
  const m = statusMeta[g.status];
  return (
    <article className="card-tilt overflow-hidden rounded-lg border bg-card shadow-card">
      <Link
        to="/games/$slug"
        params={{ slug: g.game.slug }}
        className="relative block aspect-[5/3] overflow-hidden"
      >
        <Cover game={g.game} />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-extrabold shadow-card",
            m.cls,
          )}
        >
          {m.label}
        </span>
      </Link>
      <div className="space-y-2.5 p-4">
        <h3 className="text-lg leading-tight">{g.game.title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {g.game.skills.slice(0, 2).map((k, i) => (
            <SkillTag key={k} skill={k} tone={i ? "honey" : "leaf"} />
          ))}
        </div>
        <div>
          <div className="flex justify-between text-sm font-bold">
            <span>
              {g.status === "completed"
                ? `Done ${dateDaysAgo(-g.dueInDays)}`
                : `Due in ${g.dueInDays} days`}
            </span>
            <span>{g.progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div
              className={cn("h-3 rounded-full", g.status === "completed" ? "bg-leaf" : "bg-honey")}
              style={{ width: `${g.progress}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          className={cn("btn-3d w-full", g.status === "completed" ? "tone-cream" : "tone-leaf")}
          onClick={() => toast(`Opening ${g.game.title} for ${name}… (game player coming soon)`)}
        >
          <Play className="size-4" aria-hidden /> {m.cta}
        </button>
      </div>
    </article>
  );
}

/* ---------------- Development ---------------- */

function Development({ s }: { s: Student }) {
  const skills = TRACKED_SKILLS.map((k) => ({ skill: k, value: s.skills[k] }));
  const weekly = s.weekly.map((v, i) => ({ week: `W${i + 1}`, progress: v }));
  const top = topSkill(s);
  const weak = weakSkill(s);
  return (
    <section aria-label="Development" className="space-y-4">
      <h2 className="text-3xl">Development</h2>
      <div className={card}>
        <div className="grid items-center gap-4 md:grid-cols-2">
          <div className="h-60">
            <ResponsiveContainer>
              <RadarChart data={skills} outerRadius="58%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fontSize: 11, fill: "var(--foreground)" }}
                />
                <Radar dataKey="value" stroke="var(--leaf)" fill="var(--leaf)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {skills.map((k) => (
              <SkillBar key={k.skill} label={k.skill} value={k.value} />
            ))}
          </div>
        </div>
      </div>
      <div className={card}>
        <h3 className="text-xl">Progress · last 8 weeks</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)" }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  background: "var(--card)",
                  border: "2px solid var(--border)",
                }}
              />
              <Line
                type="monotone"
                dataKey="progress"
                stroke="var(--leaf)"
                strokeWidth={4}
                dot={{ r: 5, fill: "var(--leaf)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-leaf-soft p-5">
          <p className="flex items-center gap-1.5 text-sm font-extrabold">
            <Sparkles className="size-4" aria-hidden /> Strengths
          </p>
          <p className="mt-1 text-2xl font-extrabold inline-block first-letter:uppercase">
            {top}
          </p>
          <p className="text-sm">
            At {s.skills[top]}%, this is {s.firstName}'s strongest skill. Great time to let them
            lead a group game.
          </p>
        </div>
        <div className="rounded-lg bg-honey-soft p-5">
          <p className="flex items-center gap-1.5 text-sm font-extrabold">
            <Sprout className="size-4" aria-hidden /> Growing in
          </p>
          <p className="mt-1 text-2xl font-extrabold inline-block first-letter:uppercase">
            {weak}
          </p>
          <p className="text-sm">
            At {s.skills[weak]}%, this is the skill to practise next. Their journey highlights it as
            the focus unit.
          </p>
        </div>
      </div>
    </section>
  );
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const color = value >= 50 ? "bg-leaf" : "bg-honey";
  return (
    <div>
      <div className="flex justify-between text-sm font-bold [&>span:first-child]:first-letter:uppercase [&>span:first-child]:inline-block">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div
        className="h-3 rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn("h-3 rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Notes({ s }: { s: Student }) {
  return (
    <section aria-label="Teacher notes" className={card}>
      <h3 className="mb-3 text-xl">Teacher notes</h3>
      <ul className="space-y-3">
        {teacherNotesOf(s).map((n) => (
          <li key={n.daysAgo} className="rounded-2xl bg-muted p-3">
            <p className="text-xs font-bold text-muted-foreground">{dateDaysAgo(n.daysAgo)}</p>
            <p className="text-sm">{n.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Badges ---------------- */

function Badges({ s }: { s: Student }) {
  const all = badgesOf(s);
  const earned = all.filter((b) => b.earned);
  const latest = [...earned].sort((a, b) => (a.earnedDaysAgo ?? 99) - (b.earnedDaysAgo ?? 99))[0];
  return (
    <section aria-label="Badges" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-3xl">Badges</h2>
        <p className="font-bold text-muted-foreground">
          {earned.length} of {all.length} unlocked · {s.badges} earned in total
        </p>
      </div>
      {latest && (
        <button
          type="button"
          onClick={() => celebrate(latest, s.firstName)}
          className={cn(card, "flex w-full items-center gap-5 bg-honey-soft text-left")}
        >
          <span
            className="grid size-20 shrink-0 place-items-center rounded-full bg-card text-honey animate-bob"
            aria-hidden
          >
            <BadgeIcon id={latest.def.id} className="size-10" />
          </span>
          <div>
            <p className="text-xs font-extrabold">
              Latest badge · {dateDaysAgo(latest.earnedDaysAgo ?? 0)}
            </p>
            <p className="text-3xl font-extrabold">{latest.def.name}</p>
            <p className="text-sm">{latest.def.desc}</p>
          </div>
        </button>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {all.map((b) => (
          <BadgeTile key={b.def.id} b={b} name={s.firstName} />
        ))}
      </div>
    </section>
  );
}

function celebrate(b: StudentBadge, name: string) {
  confetti();
  toast.success(`${name} earned ${b.def.name}${b.count > 1 ? ` ×${b.count}` : ""}!`);
}

function BadgeTile({ b, name }: { b: StudentBadge; name: string }) {
  if (!b.earned) {
    return (
      <div
        className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center opacity-70 shadow-card"
        aria-label={`${b.def.name} — locked`}
      >
        <span
          className="relative grid size-16 place-items-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <BadgeIcon id={b.def.id} />
          <Lock className="absolute -bottom-1 -right-1 size-6 rounded-full bg-card p-1" />
        </span>
        <p className="font-bold leading-tight">{b.def.name}</p>
        <p className="text-xs text-muted-foreground">
          {b.have}/{b.def.need} {b.def.unit}
        </p>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-honey"
            style={{ width: `${(b.have / b.def.need) * 100}%` }}
          />
        </div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => celebrate(b, name)}
      aria-label={`${b.def.name} — earned, celebrate`}
      className={cn(
        "card-tilt flex flex-col items-center gap-2 rounded-lg p-4 text-center shadow-card",
        "bg-honey-soft",
      )}
    >
      <span
        className="relative grid size-16 place-items-center rounded-full bg-card text-honey"
        aria-hidden
      >
        <BadgeIcon id={b.def.id} />
        {b.count > 1 && (
          <span className="absolute -right-2 -top-1 rounded-full bg-honey px-1.5 text-xs font-extrabold text-primary-foreground">
            ×{b.count}
          </span>
        )}
      </span>
      <p className="font-bold leading-tight">{b.def.name}</p>
      <p className="text-xs">Earned {dateDaysAgo(b.earnedDaysAgo ?? 0)}</p>
    </button>
  );
}
