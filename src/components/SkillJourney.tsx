// Duolingo-style skill journey: one unit per soft skill, a winding path of
// chunky 3D step buttons, a bonus chest mid-unit and a trophy at the end.
import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Check,
  CircleCheck,
  Flame,
  Gift,
  Lock,
  PartyPopper,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Cover, Pip } from "@/components/kit";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  journeyOf,
  levelOf,
  questsOf,
  streakOf,
  type JourneyNode,
  type JourneyUnit,
  type UnitTone,
} from "@/data/student";
import type { Student } from "@/data/teacher";
import { confetti } from "@/lib/confetti";
import { isPlayable } from "@/lib/playable";
import { cn } from "@/lib/utils";
import { QuestIcon } from "@/components/icons";

const TONE: Record<UnitTone, { bg: string; edge: string; soft: string; fg: string }> = {
  leaf: {
    bg: "var(--leaf)",
    edge: "var(--leaf-edge)",
    soft: "var(--leaf-soft)",
    fg: "var(--primary-foreground)",
  },
  sky: {
    bg: "var(--sky)",
    edge: "var(--sky-edge)",
    soft: "var(--sky-soft)",
    fg: "var(--foreground)",
  },
  berry: {
    bg: "var(--berry)",
    edge: "var(--berry-edge)",
    soft: "var(--berry-soft)",
    fg: "var(--primary-foreground)",
  },
  honey: {
    bg: "var(--honey)",
    edge: "var(--honey-edge)",
    soft: "var(--honey-soft)",
    fg: "var(--primary-foreground)",
  },
};

// Path geometry (px). The path column is W wide; each node sits in a ROW-tall row.
const W = 340;
const ROW = 96;
const EXTRA = 44;
const SWING = [0, 52, 76, 52, 0, -52, -76, -52];

export function SkillJourney({ s }: { s: Student }) {
  const units = journeyOf(s);
  return (
    <section aria-label="Skill journey" className="space-y-4">
      <div>
        <h2 className="text-3xl">Skill journey</h2>
        <p className="text-muted-foreground">
          {s.firstName}'s path through six soft skills. Tap any step to see what it teaches.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-10">
          {units.map((u) => (
            <Unit key={u.skill} unit={u} mirror={u.index % 2 === 0} studentName={s.firstName} />
          ))}
        </div>
        <Rail s={s} units={units} />
      </div>
    </section>
  );
}

/* ---------------- Unit ---------------- */

function Unit({
  unit,
  mirror,
  studentName,
}: {
  unit: JourneyUnit;
  mirror: boolean;
  studentName: string;
}) {
  const t = TONE[unit.tone];
  const offsets = unit.nodes.map((_, i) => (SWING[i % SWING.length] ?? 0) * (mirror ? -1 : 1));
  // Rows are ROW apart; the current step gets extra room above it for the START bubble.
  const ys: number[] = [];
  unit.nodes.forEach((n, i) => {
    const extra = n.state === "current" ? EXTRA : 0;
    ys.push(i === 0 ? ROW / 2 + extra : (ys[i - 1] ?? 0) + ROW + extra);
  });
  const points = offsets.map((o, i) => ({ x: W / 2 + o, y: ys[i] ?? 0 }));
  const reached = unit.nodes.reduce((last, n, i) => (n.state !== "locked" ? i : last), 0);
  const height = (ys.at(-1) ?? 0) + ROW / 2;

  return (
    <div id={`unit-${unit.index}`} className="scroll-mt-24 space-y-6">
      <UnitBanner unit={unit} />
      <div className="relative mx-auto max-w-full" style={{ width: W, height }}>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${W} ${height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d={curve(points)}
            fill="none"
            stroke="var(--border)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray="2 20"
            vectorEffect="non-scaling-stroke"
          />
          {reached > 0 && (
            <path
              d={curve(points.slice(0, reached + 1))}
              fill="none"
              stroke={t.bg}
              strokeOpacity={0.45}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="2 20"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {unit.nodes.map((node, i) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `calc(50% + ${offsets[i] ?? 0}px)`, top: ys[i] ?? 0 }}
          >
            <Step
              node={node}
              unit={unit}
              side={(offsets[i] ?? 0) > 0 ? "left" : "right"}
              studentName={studentName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function curve(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return "";
  const [first, ...rest] = pts;
  let d = `M ${first!.x} ${first!.y}`;
  let prev = first!;
  for (const p of rest) {
    const my = (prev.y + p.y) / 2;
    d += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
    prev = p;
  }
  return d;
}

function UnitBanner({ unit }: { unit: JourneyUnit }) {
  const t = TONE[unit.tone];
  const steps = unit.nodes.filter((n) => n.kind !== "chest");
  return (
    <div
      className="z-20 flex lg:sticky lg:top-[76px] items-center gap-4 rounded-2xl px-5 py-4"
      style={{ background: t.bg, color: t.fg, boxShadow: `0 5px 0 ${t.edge}` }}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold opacity-85">
          Unit {unit.index} · {unit.stepsDone} of {unit.stepsTotal} steps
          {unit.isFocus && " · Focus skill"}
        </p>
        <h3 className="text-2xl capitalize leading-tight">{unit.skill}</h3>
        <p className="text-sm font-bold opacity-90">{unit.blurb}</p>
        <div className="mt-2 h-2.5 max-w-xs rounded-full bg-black/15">
          <div
            className="h-2.5 rounded-full bg-white/90"
            style={{ width: `${(unit.stepsDone / unit.stepsTotal) * 100}%` }}
          />
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-white/40 px-3 py-2 text-sm font-extrabold transition hover:bg-white/15"
            style={{ boxShadow: `0 4px 0 ${t.edge}` }}
          >
            <BookOpen className="size-5" aria-hidden />
            <span className="hidden sm:inline">Guidebook</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-3 rounded-3xl border-2">
          <div>
            <p className="text-xs font-extrabold text-muted-foreground">
              Unit {unit.index} guidebook
            </p>
            <h4 className="font-display text-xl font-extrabold capitalize">{unit.skill}</h4>
          </div>
          <ol className="space-y-2">
            {steps.map((n) => (
              <li key={n.id} className="flex gap-3">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold"
                  style={
                    n.state === "locked"
                      ? { background: "var(--muted)", color: "var(--muted-foreground)" }
                      : { background: t.bg, color: t.fg }
                  }
                >
                  {n.state === "done" ? <Check className="size-4" strokeWidth={3} /> : n.stepNumber}
                </span>
                <div>
                  <p className="text-sm font-extrabold leading-tight">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.teaches}</p>
                </div>
              </li>
            ))}
          </ol>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/* ---------------- Step node ---------------- */

function Step({
  node,
  unit,
  side,
  studentName,
}: {
  node: JourneyNode;
  unit: JourneyUnit;
  side: "left" | "right";
  studentName: string;
}) {
  const t = TONE[unit.tone];
  const locked = node.state === "locked";
  const current = node.state === "current";
  const big = node.kind !== "lesson";
  const size = big ? 76 : 68;

  const bg = locked
    ? "var(--muted)"
    : node.kind === "chest" || (node.kind === "trophy" && node.state === "done")
      ? "var(--star)"
      : t.bg;
  const edge = locked
    ? "var(--border)"
    : node.kind === "chest" || (node.kind === "trophy" && node.state === "done")
      ? "var(--honey)"
      : t.edge;
  const fg = locked
    ? "var(--muted-foreground)"
    : node.kind === "chest"
      ? "var(--foreground)"
      : t.fg;
  const Icon =
    node.kind === "chest"
      ? Gift
      : node.kind === "trophy"
        ? Trophy
        : locked
          ? Lock
          : node.state === "done"
            ? Check
            : Star;

  const stateLabel = node.state === "done" ? "Completed" : current ? "Up next" : "Locked";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {current && (
        <>
          <ProgressRing
            size={size + 22}
            done={node.lessonsDone}
            total={node.lessonsTotal}
            color={t.bg}
          />
          <span
            className="animate-bob absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 bg-card px-3 py-1.5 text-sm font-extrabold shadow-card"
            style={{
              color: t.bg === "var(--sky)" ? "var(--sky-edge)" : t.bg,
              borderColor: "var(--border)",
            }}
          >
            {node.lessonsDone > 0 ? "Continue" : "Start"}
            <span
              className="absolute left-1/2 top-full size-3 -translate-x-1/2 -translate-y-1.5 rotate-45 border-b-2 border-r-2 bg-card"
              style={{ borderColor: "var(--border)" }}
              aria-hidden
            />
          </span>
          <Pip
            className={cn(
              "pointer-events-none absolute -top-10 size-16",
              side === "right" ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]",
            )}
            bob
          />
        </>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`${node.title}, ${stateLabel}`}
            className={cn(
              "relative z-10 grid size-full place-items-center rounded-full transition-[transform,box-shadow] duration-100 hover:brightness-105 active:translate-y-[6px]",
              node.kind === "chest" && "rounded-[26px]",
            )}
            style={{ background: bg, color: fg, boxShadow: `0 6px 0 ${edge}` }}
          >
            <Icon
              className={big ? "size-9" : "size-8"}
              strokeWidth={3}
              fill={node.kind === "lesson" && current ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <StepCard node={node} unit={unit} studentName={studentName} />
      </Popover>

      <StepLabel node={node} side={side} color={t.bg === "var(--sky)" ? "var(--sky-edge)" : t.bg} />
    </div>
  );
}

function ProgressRing({
  size,
  done,
  total,
  color,
}: {
  size: number;
  done: number;
  total: number;
  color: string;
}) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <svg
      width={size}
      height={size}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-3px)] -rotate-90"
      aria-hidden
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  );
}

function StepLabel({
  node,
  side,
  color,
}: {
  node: JourneyNode;
  side: "left" | "right";
  color: string;
}) {
  const locked = node.state === "locked";
  const current = node.state === "current";
  const kicker =
    node.kind === "chest"
      ? `Bonus · +${node.xp} XP`
      : node.kind === "trophy"
        ? "Unit review"
        : `Step ${node.stepNumber}`;
  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 w-[118px] -translate-y-1/2 leading-tight",
        side === "right"
          ? "left-[calc(100%+16px)] text-left"
          : "right-[calc(100%+16px)] text-right",
        current && "w-[124px]",
      )}
    >
      <p className="text-[13px] font-extrabold text-muted-foreground">{kicker}</p>
      <p
        className={cn("text-sm font-extrabold", locked && "text-muted-foreground")}
        style={current ? { color } : undefined}
      >
        {node.title}
      </p>
      {current && node.lessonsTotal > 0 && (
        <p className="text-xs font-bold text-muted-foreground">
          {node.lessonsDone}/{node.lessonsTotal} lessons
        </p>
      )}
    </div>
  );
}

function StepCard({
  node,
  unit,
  studentName,
}: {
  node: JourneyNode;
  unit: JourneyUnit;
  studentName: string;
}) {
  const t = TONE[unit.tone];
  const locked = node.state === "locked";
  const done = node.state === "done";

  if (node.kind === "chest") {
    return (
      <PopoverContent className="w-72 space-y-2 rounded-3xl border-2 bg-honey-soft text-center">
        <p className="flex justify-center text-honey" aria-hidden>
          {done ? <PartyPopper className="size-10" /> : <Gift className="size-10" />}
        </p>
        <h4 className="font-display text-xl font-extrabold">
          {done ? "Chest opened!" : "Bonus chest"}
        </h4>
        <p className="text-sm">
          {done
            ? `${studentName} opened this chest and earned ${node.xp} bonus XP.`
            : `Finish steps 1 and 2 of ${unit.skill} to open this chest.`}
        </p>
      </PopoverContent>
    );
  }

  const stepLine =
    node.kind === "trophy"
      ? "Unit review"
      : `Step ${node.stepNumber} of 5 · ${node.lessonsDone}/${node.lessonsTotal} lessons`;

  return (
    <PopoverContent
      className="w-80 space-y-3 rounded-3xl border-0 p-5"
      style={
        locked
          ? {
              background: "var(--muted)",
              color: "var(--foreground)",
              boxShadow: "0 6px 0 var(--border)",
            }
          : { background: t.bg, color: t.fg, boxShadow: `0 6px 0 ${t.edge}` }
      }
    >
      <div>
        <p className="text-xs font-extrabold opacity-80">{stepLine}</p>
        <h4 className="font-display text-xl font-extrabold">{node.title}</h4>
        <p className="mt-1 text-sm opacity-90">{node.teaches}</p>
      </div>
      {node.game && !locked && (
        <Link
          to="/games/$slug"
          params={{ slug: node.game.slug }}
          className="flex items-center gap-2 rounded-2xl bg-white/20 p-2 hover:bg-white/30"
        >
          <span className="h-10 w-16 shrink-0 overflow-hidden rounded-xl">
            <Cover game={node.game} />
          </span>
          <span className="text-sm font-bold leading-tight">Practice game: {node.game.title}</span>
        </Link>
      )}
      {locked ? (
        <p className="rounded-2xl bg-card px-3 py-2 text-sm font-bold text-muted-foreground">
          Finish the steps above to unlock this.
        </p>
      ) : node.game && isPlayable(node.game.slug) ? (
        <Link
          to="/play/$slug"
          params={{ slug: node.game.slug }}
          className="block w-full rounded-2xl bg-card py-3 text-center font-extrabold transition active:translate-y-1"
          style={{
            color: t.bg === "var(--sky)" ? "var(--sky-edge)" : t.bg,
            boxShadow: "0 4px 0 var(--border)",
          }}
        >
          Play {node.game.title} +{node.xp} XP
        </Link>
      ) : (
        <button
          type="button"
          className="w-full rounded-2xl bg-card py-3 font-extrabold transition active:translate-y-1"
          style={{
            color: t.bg === "var(--sky)" ? "var(--sky-edge)" : t.bg,
            boxShadow: "0 4px 0 var(--border)",
          }}
          onClick={() => {
            if (done && node.kind === "trophy") confetti();
            toast(
              done
                ? `${studentName} is practising "${node.title}" again (+5 XP)`
                : `${studentName} is starting "${node.title}" (+${node.xp} XP)`,
            );
          }}
        >
          {done
            ? "Practise +5 XP"
            : node.lessonsDone > 0
              ? `Continue +${node.xp} XP`
              : `Start +${node.xp} XP`}
        </button>
      )}
    </PopoverContent>
  );
}

/* ---------------- Right rail ---------------- */

function Rail({ s, units }: { s: Student; units: JourneyUnit[] }) {
  const lvl = levelOf(s);
  const streak = streakOf(s);
  const focus = units.find((u) => u.isFocus);
  return (
    <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24 lg:self-start">
      <div className="grid grid-cols-3 gap-2">
        <RailStat icon={<Flame />} value={String(streak)} label="day streak" />
        <RailStat icon={<Zap />} value={lvl.xp.toLocaleString()} label="total XP" />
        <RailStat icon={<Award />} value={String(s.badges)} label="badges" />
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-card">
        <h3 className="mb-3 text-xl">Daily quests</h3>
        <ul className="space-y-3">
          {questsOf(s).map((q) => {
            const pct = Math.min(100, (q.have / q.need) * 100);
            return (
              <li key={q.id} className="flex items-center gap-3">
                <QuestIcon id={q.id} className="shrink-0 text-honey" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">{q.label}</p>
                  <div className="relative h-4 rounded-full bg-muted">
                    <div
                      className={cn("h-4 rounded-full", pct >= 100 ? "bg-leaf" : "bg-star")}
                      style={{ width: `${pct}%` }}
                    />
                    <span className="absolute inset-0 grid place-items-center text-[10px] font-extrabold">
                      {Math.min(q.have, q.need)} / {q.need}
                    </span>
                  </div>
                </div>
                {pct >= 100 ? (
                  <CircleCheck className="size-5 text-leaf-edge" aria-label="Done" />
                ) : (
                  <Gift className="size-5 text-muted-foreground" aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-3xl bg-card p-5 shadow-card">
        <h3 className="mb-3 text-xl">Units</h3>
        <ul className="space-y-2">
          {units.map((u) => {
            const t = TONE[u.tone];
            return (
              <li key={u.skill}>
                <a
                  href={`#unit-${u.index}`}
                  className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-muted"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-extrabold"
                    style={{ background: t.bg, color: t.fg, boxShadow: `0 3px 0 ${t.edge}` }}
                  >
                    {u.index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold capitalize">{u.skill}</span>
                    <span className="block h-2 rounded-full bg-muted">
                      <span
                        className="block h-2 rounded-full"
                        style={{
                          width: `${(u.stepsDone / u.stepsTotal) * 100}%`,
                          background: t.bg,
                        }}
                      />
                    </span>
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {u.stepsDone}/{u.stepsTotal}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {focus && (
        <div className="flex items-center gap-3 rounded-3xl bg-honey-soft p-4">
          <Pip pose="search" className="size-16 shrink-0" />
          <p className="text-sm font-bold">
            Pip's tip: {s.firstName} should practise{" "}
            <span className="capitalize">{focus.skill}</span> next. It's their lowest skill at{" "}
            {focus.value}%.
          </p>
        </div>
      )}
    </aside>
  );
}

function RailStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-card">
      <p className="mb-1 flex justify-center text-honey [&>svg]:size-5" aria-hidden>
        {icon}
      </p>
      <p className="font-display text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[13px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
