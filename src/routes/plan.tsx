import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  MessageCircleQuestion,
  Printer,
  Repeat2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Cover, Pip } from "@/components/kit";
import { classes, classStats } from "@/data/teacher";
import { SKILLS, type Skill } from "@/data/types";
import { confetti } from "@/lib/confetti";
import { gradeRange } from "@/lib/catalog";
import { buildWeek, EXAMPLES, gradeBand, understand, type PlanOptions } from "@/lib/planner";
import { cn } from "@/lib/utils";

const TITLE = "Plan my week — Kitbit";
const DESC =
  "Describe what's happening in your class and get a five-day plan of soft-skills games with discussion questions.";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: PlanPage,
});

const card = "rounded-3xl bg-card p-5 md:p-6";

// The class's lowest tracked skill, mapped to the catalog's skill names.
const TRACKED_TO_CATALOG: Record<string, Skill> = {
  empathy: "empathy",
  teamwork: "teamwork",
  communication: "active listening",
  resilience: "handling failure",
  focus: "focus",
  "conflict resolution": "conflict resolution",
};

function PlanPage() {
  const [classId, setClassId] = useState(classes[0]!.id);
  const [text, setText] = useState("");
  const [minutes, setMinutes] = useState<PlanOptions["minutes"]>(15);
  const [screenFree, setScreenFree] = useState(false);
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [heard, setHeard] = useState<string[]>([]);
  const [swaps, setSwaps] = useState<Record<number, number>>({});

  const cls = classes.find((c) => c.id === classId)!;
  const weakest = useMemo(() => {
    const s = classStats(classId).skills.reduce((a, b) => (b.value < a.value ? b : a));
    return { tracked: s.skill, value: s.value, catalog: TRACKED_TO_CATALOG[s.skill] ?? "empathy" };
  }, [classId]);
  const opts: PlanOptions = { grade: gradeBand(cls.grade), minutes, screenFree };
  const week = useMemo(
    () => (skills ? buildWeek(skills, opts, swaps) : []),
    [skills, opts.grade, minutes, screenFree, swaps],
  );

  const make = () => {
    const u = understand(text, weakest.catalog);
    setSkills(u.skills);
    setHeard(u.heard);
    setSwaps({});
    setTimeout(
      () =>
        document.getElementById("the-plan")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-8">
      <header className="flex items-center gap-4 print:hidden">
        <Pip pose="search" className="hidden size-24 shrink-0 sm:block" />
        <div>
          <h1 className="text-3xl md:text-4xl">Plan my week</h1>
          <p className="max-w-2xl text-lg">
            Tell Kitbit what's going on in your class. You'll get five days of games, each with a
            question to open and one to close.
          </p>
        </div>
      </header>

      <form
        className={cn(card, "space-y-5 print:hidden")}
        onSubmit={(e) => {
          e.preventDefault();
          make();
        }}
      >
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Class">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={c.id === classId}
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

        <label className="block space-y-2">
          <span className="font-display text-xl font-extrabold">
            What's happening in your class?
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="For example: lots of arguing at recess, and they blame each other"
            className="w-full rounded-2xl border-2 bg-background px-4 py-3 text-lg outline-none focus:border-leaf"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold hover:bg-leaf-soft"
            >
              {ex}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setText(`Our class data says we're lowest in ${weakest.tracked}`)}
            className="rounded-full bg-honey-soft px-3 py-1.5 text-sm font-bold hover:bg-leaf-soft"
          >
            Use our class data: lowest in {weakest.tracked} ({weakest.value}%)
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <fieldset className="space-y-1">
            <legend className="text-sm font-bold">Time each day</legend>
            <div className="flex rounded-full bg-muted p-1">
              {([5, 15, 30] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={minutes === m}
                  onClick={() => setMinutes(m)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-extrabold",
                    minutes === m ? "bg-card" : "text-muted-foreground",
                  )}
                >
                  {m} min
                </button>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              className="size-5 accent-[var(--leaf)]"
              checked={screenFree}
              onChange={(e) => setScreenFree(e.target.checked)}
            />
            No devices this week (screen-free only)
          </label>
          <button type="submit" className="btn-3d tone-leaf ml-auto">
            <Sparkles className="size-5" aria-hidden /> Make my plan
          </button>
        </div>
      </form>

      {skills && (
        <section id="the-plan" aria-label="Your week" className="scroll-mt-24 space-y-5">
          <div className={cn(card, "space-y-3 bg-leaf-soft")}>
            <h2 className="text-2xl md:text-3xl">
              {cls.name}: a week of {skills[0]}
            </h2>
            <p>
              {heard.length
                ? `We heard ${listWords(heard)}, so this week practises ${listWords(skills)}.`
                : `This week practises ${listWords(skills)}, your class's lowest skill right now.`}{" "}
              {gradeRange([opts.grade])}, about {minutes} minutes a day
              {screenFree ? ", no devices" : ""}.
            </p>
            <FocusEditor
              skills={skills}
              onChange={(s) => {
                setSkills(s);
                setSwaps({});
              }}
            />
          </div>

          <ol className="space-y-4">
            {week.map((d, i) => (
              <li key={d.day} className={cn(card, "grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]")}>
                <div className="space-y-1">
                  <p className="flex items-center gap-2 font-display text-2xl font-extrabold">
                    <CalendarDays className="size-5 text-honey" aria-hidden /> {d.day}
                  </p>
                  <p className="font-bold">{d.theme}</p>
                  <p className="text-sm capitalize text-muted-foreground">{d.skill}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/games/$slug"
                      params={{ slug: d.game.slug }}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-muted p-2 hover:bg-leaf-soft"
                    >
                      <span className="h-16 w-28 shrink-0 overflow-hidden rounded-xl">
                        <Cover game={d.game} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-extrabold leading-tight">
                          {d.game.title}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {gradeRange(d.game.grades)} · {d.game.type}
                        </span>
                        <span className="block text-sm">Goal: {d.goal}</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSwaps((s) => ({ ...s, [i]: (s[i] ?? 0) + 1 }))}
                      className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-sm font-extrabold hover:bg-muted print:hidden"
                    >
                      <Repeat2 className="size-4" aria-hidden /> Swap game
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Prompt label="To open" text={d.opener} />
                    <Prompt label="To close" text={d.closer} />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              className="btn-3d tone-leaf"
              onClick={() => {
                confetti();
                toast.success(`5 games assigned to ${cls.name}, one a day from Monday`);
              }}
            >
              Assign the week to {cls.name}
            </button>
            <button
              type="button"
              className="btn-3d tone-cream"
              onClick={() => toast.success("Families will get Friday's question to try at home")}
            >
              <Send className="size-4" aria-hidden /> Tell families
            </button>
            <button type="button" className="btn-3d tone-cream" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden /> Print plan
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function Prompt({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-2xl bg-background p-3">
      <p className="mb-0.5 flex items-center gap-1.5 text-sm font-extrabold text-muted-foreground">
        <MessageCircleQuestion className="size-4" aria-hidden /> {label}
      </p>
      <p>{text}</p>
    </div>
  );
}

function FocusEditor({ skills, onChange }: { skills: Skill[]; onChange: (s: Skill[]) => void }) {
  const others = SKILLS.filter((k) => !skills.includes(k));
  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <span className="text-sm font-bold">Focus:</span>
      {skills.map((k) => (
        <span
          key={k}
          className="flex items-center gap-1 rounded-full bg-card py-1 pl-3 pr-1 text-sm font-bold capitalize"
        >
          {k}
          {skills.length > 1 && (
            <button
              type="button"
              aria-label={`Remove ${k}`}
              onClick={() => onChange(skills.filter((x) => x !== k))}
              className="grid size-6 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          )}
        </span>
      ))}
      {skills.length < 3 && (
        <select
          aria-label="Add a skill"
          value=""
          onChange={(e) => e.target.value && onChange([...skills, e.target.value as Skill])}
          className="h-8 rounded-full border-2 bg-card px-2 text-sm font-bold"
        >
          <option value="">Add a skill</option>
          {others.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function listWords(xs: string[]) {
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;
}
