import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpDown,
  Award,
  Clock,
  Flame,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import { Cover, Pip } from "@/components/kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  assignments as seedAssignments,
  classes,
  classStats,
  lastActiveLabel,
  needsAttention,
  overallOf,
  studentName,
  studentsIn,
  teacher,
  topSkill,
  weakSkill,
  type Assignment,
  type Student,
} from "@/data/teacher";
import { getGameById, getGames } from "@/lib/catalog";
import { confetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

const TITLE = "My Profile & Classes — Kitbit";
const DESC =
  "See your classes' soft-skill progress, student roster, and assigned Kitbit games in one place.";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ProfilePage,
});

const toneBg = {
  honey: "bg-honey-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  berry: "bg-berry-soft",
};
const card = "rounded-3xl bg-card p-5 shadow-card md:p-6";

function ProfilePage() {
  const [classId, setClassId] = useState(classes[0]!.id);
  const [asg, setAsg] = useState<Assignment[]>(seedAssignments);
  const [assignOpen, setAssignOpen] = useState(false);
  const stats = useMemo(() => classStats(classId), [classId]);
  const totalStudents = classes.reduce((a, c) => a + studentsIn(c.id).length, 0);
  const current = classes.find((c) => c.id === classId)!;

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
      {/* Header */}
      <section className={cn(card, "relative overflow-hidden bg-honey-soft")}>
        <Pip className="absolute -bottom-6 right-2 hidden size-40 opacity-90 md:block" bob />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span
            className="grid size-28 shrink-0 place-items-center rounded-full border-4 border-card bg-leaf-soft text-6xl shadow-card"
            role="img"
            aria-label={teacher.name}
          >
            {teacher.emoji}
          </span>
          <div className="space-y-2 md:pr-44">
            <h1 className="text-3xl md:text-4xl">{teacher.name}</h1>
            <p className="font-bold">
              {teacher.school} · {teacher.grades.join(", ")} · {teacher.subject}
            </p>
            <p className="max-w-2xl text-muted-foreground">{teacher.bio}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Chip icon={<Flame className="size-4 text-honey" />}>
                {teacher.streakDays}-day Kitbit streak
              </Chip>
              <Chip icon={<Users className="size-4" />}>
                {classes.length} classes · {totalStudents} students
              </Chip>
              <Chip icon={<Award className="size-4 text-honey" />}>
                {asg.length} games assigned
              </Chip>
            </div>
            <StreakDots days={teacher.streakDays} />
            <Link to="/plan" className="btn-3d tone-leaf mt-3 w-fit">
              <Sparkles className="size-5" aria-hidden /> Plan my week
            </Link>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section aria-label="Your classes" className="space-y-3">
        <h2 className="text-3xl">Your classes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => {
            const s = classStats(c.id);
            const active = c.id === classId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setClassId(c.id)}
                className={cn(
                  card,
                  "card-tilt text-left ring-4 transition",
                  active ? "ring-leaf" : "ring-transparent",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl text-3xl",
                      toneBg[c.tone],
                    )}
                    aria-hidden
                  >
                    {c.emoji}
                  </span>
                  <div>
                    <h3 className="text-xl leading-tight">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.students} students · {asg.filter((a) => a.classId === c.id).length} games
                    </p>
                  </div>
                  {active && (
                    <span className="ml-auto rounded-full bg-leaf px-3 py-1 text-xs font-bold text-primary-foreground">
                      Viewing
                    </span>
                  )}
                </div>
                <Bar value={s.avgProgress} label="Average progress" className="mt-4" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Dashboard */}
      <section aria-label={`Dashboard for ${current.name}`} className="space-y-4">
        <h2 className="text-3xl">{current.name} dashboard</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={<Users />}
            label="Active this week"
            value={`${stats.activeThisWeek}/${stats.students}`}
            tone="leaf"
          />
          <Stat
            icon={<Clock />}
            label="Minutes played"
            value={stats.minutes.toLocaleString()}
            tone="leaf"
          />
          <Stat
            icon={<Award />}
            label="Badges earned"
            value={stats.badges.toLocaleString()}
            tone="honey"
          />
          <Stat
            icon={<Flame />}
            label="Avg progress"
            value={`${stats.avgProgress}%`}
            tone="honey"
          />
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <div className={card}>
            <h3 className="text-xl">Soft-skill progress</h3>
            <div className="grid items-center gap-4 md:grid-cols-2">
              <div className="h-64">
                <ResponsiveContainer>
                  <RadarChart data={stats.skills} outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fontSize: 11, fill: "var(--foreground)" }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--leaf)"
                      fill="var(--leaf)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {stats.skills.map((s) => (
                  <Bar key={s.skill} value={s.value} label={s.skill} />
                ))}
              </div>
            </div>
          </div>
          <div className={card}>
            <h3 className="text-xl">Class progress · last 8 weeks</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart
                  data={stats.weekly}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
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
                    stroke="var(--honey)"
                    strokeWidth={4}
                    dot={{ r: 5, fill: "var(--honey)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={card}>
            <h3 className="mb-3 text-xl">Game completion</h3>
            <div className="space-y-3">
              {(
                [
                  ["Assigned", stats.assigned, "bg-border"],
                  ["Started", stats.started, "bg-honey"],
                  ["Completed", stats.completed, "bg-leaf"],
                ] as const
              ).map(([l, v, c]) => (
                <div key={l}>
                  <div className="flex justify-between text-sm font-bold">
                    <span>{l}</span>
                    <span>{v}</span>
                  </div>
                  <div className="h-4 rounded-full bg-muted">
                    <div
                      className={cn("h-4 rounded-full", c)}
                      style={{ width: `${stats.assigned ? (v / stats.assigned) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Student-game pairs across {stats.gamesAssigned} assigned games.
              </p>
            </div>
          </div>
          <NeedsAttention classId={classId} />
        </div>
      </section>

      <Roster classId={classId} />

      {/* Library */}
      <section id="library" aria-label="Class library" className="scroll-mt-24 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl">Class library</h2>
          <button type="button" className="btn-3d tone-leaf" onClick={() => setAssignOpen(true)}>
            Assign game
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {asg.map((a) => {
            const g = getGameById(a.gameId);
            const c = classes.find((x) => x.id === a.classId);
            if (!g || !c) return null;
            return (
              <article key={a.id} className="overflow-hidden rounded-3xl bg-card shadow-card">
                <Link
                  to="/games/$slug"
                  params={{ slug: g.slug }}
                  className="block aspect-[5/3] overflow-hidden"
                >
                  <Cover game={g} />
                </Link>
                <div className="space-y-2 p-4">
                  <h3 className="text-lg leading-tight">{g.title}</h3>
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
                      toneBg[c.tone],
                    )}
                  >
                    {c.name}
                    {a.studentIds.length ? ` · ${a.studentIds.length} students` : ""}
                  </span>
                  <Bar value={a.completionRate} label="Completion" />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <AssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        defaultClass={classId}
        onAssign={(a) => setAsg((xs) => [a, ...xs])}
      />
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-bold shadow-card">
      {icon}
      {children}
    </span>
  );
}

function StreakDots({ days }: { days: number }) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div
      className="flex items-center gap-1.5 pt-1"
      aria-label={`Active ${Math.min(days, 5)} of the last 7 days`}
    >
      {labels.map((l, i) => (
        <span
          key={i}
          className={cn(
            "grid size-8 place-items-center rounded-full text-xs font-extrabold",
            i < 5 ? "bg-leaf text-primary-foreground" : "bg-card text-muted-foreground",
          )}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function Bar({ value, label, className }: { value: number; label: string; className?: string }) {
  const color = value >= 50 ? "bg-leaf" : "bg-honey";
  return (
    <div className={className}>
      <div className="flex justify-between text-sm font-bold capitalize">
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
        <div
          className={cn("h-3 rounded-full transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: keyof typeof toneBg;
}) {
  // KPIs are type, not tiles: a small grey icon beside the label, the figure in ink.
  void tone;
  return (
    <div className={cn(card, "space-y-1")}>
      <p className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground [&>svg]:size-4">
        {icon}
        {label}
      </p>
      <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
    </div>
  );
}

function NeedsAttention({ classId }: { classId: string }) {
  const list = needsAttention(classId);
  return (
    <div className={card}>
      <h3 className="mb-3 flex items-center gap-2 text-xl">
        <AlertTriangle className="size-5 text-berry" /> Needs attention
      </h3>
      {list.length === 0 ? (
        <p className="text-muted-foreground">Everyone's on track. Pip is proud!</p>
      ) : (
        <ul className="space-y-2">
          {list.map(({ student: s, reason, detail }) => (
            <li key={s.id}>
              <Link
                to="/students/$id"
                params={{ id: s.id }}
                className="flex items-center gap-3 rounded-2xl p-2 hover:bg-muted"
              >
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <span className="font-bold">{studentName(s)}</span>
                <span className="text-sm text-muted-foreground">{detail}</span>
                <span
                  className={cn(
                    "ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold",
                    reason === "inactive" ? "bg-berry-soft" : "bg-honey-soft",
                  )}
                >
                  {reason === "inactive" ? "Inactive" : "Falling behind"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type SortKey = "name" | "progress" | "games" | "badges" | "active";
const sorters: Record<SortKey, (a: Student, b: Student) => number> = {
  name: (a, b) => a.firstName.localeCompare(b.firstName),
  progress: (a, b) => overallOf(a) - overallOf(b),
  games: (a, b) => a.gamesCompleted - b.gamesCompleted,
  badges: (a, b) => a.badges - b.badges,
  active: (a, b) => a.lastActiveDaysAgo - b.lastActiveDaysAgo,
};

function Roster({ classId }: { classId: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "progress", dir: -1 });
  const rows = useMemo(
    () =>
      studentsIn(classId)
        .filter((s) => studentName(s).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => sorters[sort.key](a, b) * sort.dir),
    [classId, q, sort],
  );
  const Th = ({
    k,
    children,
    className,
  }: {
    k: SortKey;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      className={cn("p-3", className)}
      aria-sort={sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 font-extrabold"
        onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : 1 }))}
      >
        {children}
        <ArrowUpDown className="size-3.5" aria-hidden />
      </button>
    </th>
  );
  return (
    <section aria-label="Student roster" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Student roster</h2>
        <label className="flex w-full items-center gap-2 rounded-full border-2 bg-card px-4 sm:w-72">
          <Search className="size-5 text-muted-foreground" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search students"
            aria-label="Search students"
            className="h-11 w-full bg-transparent outline-none"
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-card shadow-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <Th k="name">Student</Th>
              <Th k="progress">Overall</Th>
              <th className="p-3 font-extrabold">Top skill</th>
              <th className="p-3 font-extrabold">Work on</th>
              <Th k="games" className="text-right">
                Games done
              </Th>
              <Th k="badges" className="text-right">
                Badges
              </Th>
              <Th k="active">Last active</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer border-t-2 border-border hover:bg-honey-soft"
                onClick={() => navigate({ to: "/students/$id", params: { id: s.id } })}
              >
                <td className="p-3">
                  <Link
                    to="/students/$id"
                    params={{ id: s.id }}
                    className="flex items-center gap-2 font-bold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span
                      className="grid size-10 place-items-center rounded-full bg-muted text-xl"
                      aria-hidden
                    >
                      {s.emoji}
                    </span>
                    {studentName(s)}
                  </Link>
                </td>
                <td className="p-3 w-40">
                  <Bar value={overallOf(s)} label="" />
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-bold capitalize">
                    {topSkill(s)}
                  </span>
                </td>
                <td className="p-3">
                  <span className="rounded-full bg-honey-soft px-2.5 py-0.5 text-xs font-bold capitalize">
                    {weakSkill(s)}
                  </span>
                </td>
                <td className="p-3 pr-6 text-right font-bold">{s.gamesCompleted}</td>
                <td className="p-3 pr-6 text-right font-bold">{s.badges}</td>
                <td className={cn("p-3", s.lastActiveDaysAgo > 7 && "font-bold text-berry-edge")}>
                  {lastActiveLabel(s.lastActiveDaysAgo)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No students match “{q}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AssignDialog({
  open,
  onOpenChange,
  defaultClass,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultClass: string;
  onAssign: (a: Assignment) => void;
}) {
  const games = getGames();
  const [gameId, setGameId] = useState(games[0]!.id);
  const [classId, setClassId] = useState(defaultClass);
  const [picked, setPicked] = useState<string[]>([]);
  const list = studentsIn(classId);
  const whole = picked.length === 0;
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) {
          setClassId(defaultClass);
          setPicked([]);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Assign a game</DialogTitle>
          <DialogDescription>
            Pick a game, a class, and optionally specific students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="font-bold">Game</span>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="h-11 w-full rounded-2xl border-2 bg-card px-3"
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="space-y-1">
            <legend className="font-bold">Class</legend>
            <div className="flex flex-wrap gap-2">
              {classes.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={c.id === classId}
                  onClick={() => {
                    setClassId(c.id);
                    setPicked([]);
                  }}
                  className={cn("btn-3d", c.id === classId ? "tone-leaf" : "tone-cream")}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="font-bold">Students</legend>
            <label className="flex items-center gap-2 font-bold">
              <input
                type="checkbox"
                className="size-5 accent-[var(--leaf)]"
                checked={whole}
                onChange={() => setPicked([])}
              />{" "}
              Whole class ({list.length})
            </label>
            <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto rounded-2xl bg-muted p-2">
              {list.map((s) => (
                <label
                  key={s.id}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-2 hover:bg-card"
                >
                  <input
                    type="checkbox"
                    className="size-5 accent-[var(--leaf)]"
                    checked={picked.includes(s.id)}
                    onChange={() =>
                      setPicked((p) =>
                        p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id],
                      )
                    }
                  />
                  <span aria-hidden>{s.emoji}</span>
                  {studentName(s)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <DialogFooter>
          <button type="button" className="btn-3d tone-cream" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-3d tone-leaf"
            onClick={() => {
              const g = getGameById(gameId)!;
              const c = classes.find((x) => x.id === classId)!;
              onAssign({
                id: `a${Date.now()}`,
                gameId,
                classId,
                studentIds: picked,
                completionRate: 0,
              });
              onOpenChange(false);
              confetti();
              toast.success(
                `${g.title} assigned to ${whole ? c.name : `${picked.length} students in ${c.name}`}`,
              );
            }}
          >
            Assign
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
