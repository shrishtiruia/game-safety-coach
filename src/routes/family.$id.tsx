// Family view: what a parent or carer sees about their own child.
// Plain words instead of percentages, no comparison with other children,
// and one small thing to try at home each week.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, Footprints, Home, Lock, Play, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeIcon, SkillIcon } from "@/components/icons";
import { Cover, Pip } from "@/components/kit";
import { badgesOf, dateDaysAgo, journeyOf, studentGames, teacherNotesOf } from "@/data/student";
import {
  getClass,
  getStudent,
  teacher,
  topSkill,
  TRACKED_SKILLS,
  weakSkill,
  type Student,
  type TrackedSkill,
} from "@/data/teacher";
import { isPlayable } from "@/lib/playable";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/family/$id")({
  loader: ({ params }) => {
    const student = getStudent(params.id);
    if (!student) throw notFound();
    return { student };
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.student.firstName}'s week — Kitbit for families`
      : "Family view — Kitbit";
    const desc = "What your child practised this week, and one thing to try at home.";
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
  component: FamilyPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl space-y-4 p-10 text-center">
      <Pip pose="search" className="mx-auto size-32" bob />
      <h1 className="text-3xl">We couldn't find that link</h1>
      <p>Ask your child's teacher to send the family link again.</p>
    </div>
  ),
});

const card = "rounded-3xl bg-card p-5 md:p-6";

const SKILL_PLAIN: Record<TrackedSkill, string> = {
  empathy: "Noticing how other people feel",
  teamwork: "Working with classmates toward one goal",
  communication: "Listening, and saying what they think",
  resilience: "Bouncing back when something goes wrong",
  focus: "Staying with a task until it's done",
  "conflict resolution": "Sorting out disagreements fairly",
};

const AT_HOME: Record<TrackedSkill, { question: string; activity: string; notice: string }> = {
  empathy: {
    question: "Who looked happy at school today? How could you tell?",
    activity:
      "While watching a show together, pause and guess how a character feels. Then check if you agree.",
    notice:
      "When they comfort a sibling or friend, name it: “That was kind. You noticed they were sad.”",
  },
  teamwork: {
    question: "What did you and a classmate make or solve together today?",
    activity:
      "Cook something simple together where each person has one job, then swap jobs next time.",
    notice: "Point out when they share a task: “We finished faster because we did it together.”",
  },
  communication: {
    question: "What's something a friend told you today? Tell me it in your own words.",
    activity:
      "Play “say it back”: one person shares something, the other repeats it before replying.",
    notice: "When they wait for you to finish a sentence, thank them for listening.",
  },
  resilience: {
    question: "What was tricky today? What did you try when it didn't work?",
    activity:
      "Build a tower of cups or blocks until it falls, then talk about what you'd change next time.",
    notice: "Praise the trying, not the result: “You kept going even when it was hard.”",
  },
  focus: {
    question: "What was the thing you worked on longest today?",
    activity:
      "Set a 5-minute timer for a puzzle or drawing with no screens nearby, and do it alongside them.",
    notice: "When they finish something, ask what helped them stay with it.",
  },
  "conflict resolution": {
    question: "Did anyone disagree at school today? How did it get sorted out?",
    activity:
      "Next time siblings argue over a toy, ask each to say what they want, then find a fix together.",
    notice: "When they suggest taking turns, say so: “That was a fair idea.”",
  },
};

const level = (v: number) => (v >= 70 ? "Strong" : v >= 45 ? "Growing" : "Getting started");

function FamilyPage() {
  const { student: s } = Route.useLoaderData();
  const cls = getClass(s.classId);
  const focus = weakSkill(s);
  const strong = topSkill(s);
  const home = AT_HOME[focus];
  const recent = badgesOf(s)
    .filter((b) => b.earned && (b.earnedDaysAgo ?? 99) <= 14)
    .sort((a, b) => (a.earnedDaysAgo ?? 0) - (b.earnedDaysAgo ?? 0));
  const stepsDone = journeyOf(s).reduce((a, u) => a + u.stepsDone, 0);
  const played = studentGames(s).filter((g) => g.status !== "not-started");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8">
      <p className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm">
        <Lock className="size-4" aria-hidden />
        This is a private family link from {teacher.name.replace("Maya ", "")}. You only see{" "}
        {s.firstName}'s progress, never other children's.
        <Link
          to="/students/$id"
          params={{ id: s.id }}
          className="ml-auto font-bold text-leaf-edge hover:underline"
        >
          Back to teacher view
        </Link>
      </p>

      <header className="flex flex-col gap-5 rounded-[2rem] bg-leaf-soft p-6 sm:flex-row sm:items-center md:p-8">
        <span
          className="grid size-24 shrink-0 place-items-center rounded-full bg-card text-5xl"
          aria-hidden
        >
          {s.emoji}
        </span>
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl">{s.firstName}'s week at school</h1>
          <p className="text-lg">
            {cls?.name} · {teacher.school}. This week {s.firstName} was strongest at{" "}
            <strong>{strong}</strong> and is practising <strong>{focus}</strong>.
          </p>
        </div>
      </header>

      <section aria-label="This week" className="grid gap-4 sm:grid-cols-3">
        <Fact icon={<Clock />} value={`${s.minutesThisWeek} min`} label="practising soft skills" />
        <Fact
          icon={<Footprints />}
          value={String(stepsDone)}
          label="journey steps finished so far"
        />
        <Fact
          icon={<BadgeIcon id="first-game" className="size-5" />}
          value={String(recent.length)}
          label="new badges in two weeks"
        />
      </section>

      <section aria-label="Try at home" className="space-y-3">
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl">
          <Home className="size-6 text-honey" aria-hidden /> Try at home this week
        </h2>
        <p>
          {s.firstName} is working on <strong>{focus}</strong>: {SKILL_PLAIN[focus].toLowerCase()}.
          One of these is plenty.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <HomeIdea title="At dinner, ask" text={home.question} />
          <HomeIdea title="Do together (5 minutes)" text={home.activity} />
          <HomeIdea title="When you see it, say it" text={home.notice} />
        </div>
      </section>

      <section aria-label="What they are learning" className={cn(card, "space-y-4")}>
        <h2 className="text-2xl">What {s.firstName} is learning</h2>
        <ul className="space-y-3">
          {TRACKED_SKILLS.map((k) => (
            <li
              key={k}
              className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_240px]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-honey">
                  <SkillIcon skill={k} />
                </span>
                <div>
                  <p className="font-extrabold capitalize">{k}</p>
                  <p className="text-sm text-muted-foreground">{SKILL_PLAIN[k]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <span className="h-2.5 w-24 rounded-full bg-muted">
                  <span
                    className="block h-2.5 rounded-full bg-leaf"
                    style={{ width: `${s.skills[k]}%` }}
                  />
                </span>
                <span className="w-32 whitespace-nowrap text-sm font-bold">{level(s.skills[k])}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid items-start gap-6 md:grid-cols-2">
        <section aria-label="Recent wins" className={cn(card, "space-y-3")}>
          <h2 className="text-2xl">Recent wins</h2>
          {recent.length === 0 ? (
            <p className="text-muted-foreground">
              No new badges in the last two weeks. That's okay, every step counts.
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((b) => (
                <li key={b.def.id} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-honey-soft text-honey">
                    <BadgeIcon id={b.def.id} className="size-5" />
                  </span>
                  <div>
                    <p className="font-extrabold">{b.def.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {b.def.desc} {dateDaysAgo(b.earnedDaysAgo ?? 0)}.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Games played" className={cn(card, "space-y-3")}>
          <h2 className="text-2xl">Games {s.firstName} played</h2>
          <ul className="space-y-2">
            {played.slice(0, 4).map((g) => (
              <li key={g.assignmentId} className="flex items-center gap-3">
                <span className="h-12 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Cover game={g.game} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold leading-tight">{g.game.title}</p>
                  <p className="text-sm text-muted-foreground">{g.game.tagline}</p>
                </div>
                {isPlayable(g.game.slug) && (
                  <Link
                    to="/play/$slug"
                    params={{ slug: g.game.slug }}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf text-primary-foreground"
                    aria-label={`Play ${g.game.title} together`}
                  >
                    <Play className="size-4" />
                  </Link>
                )}
              </li>
            ))}
            {played.length === 0 && (
              <p className="text-muted-foreground">No games yet this term.</p>
            )}
          </ul>
        </section>
      </div>

      <TeacherNote s={s} />
    </div>
  );
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className={cn(card, "space-y-1")}>
      <p className="text-honey [&>svg]:size-5" aria-hidden>
        {icon}
      </p>
      <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function HomeIdea({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-honey-soft p-5">
      <p className="mb-1 font-extrabold">{title}</p>
      <p>{text}</p>
    </div>
  );
}

function TeacherNote({ s }: { s: Student }) {
  const note = teacherNotesOf(s)[0]!;
  const [msg, setMsg] = useState("");
  return (
    <section aria-label="Note from the teacher" className={cn(card, "space-y-4")}>
      <div className="flex items-start gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-2xl"
          aria-hidden
        >
          {teacher.emoji}
        </span>
        <div>
          <h2 className="text-2xl">A note from {teacher.name.replace("Maya ", "")}</h2>
          <p className="text-sm text-muted-foreground">{dateDaysAgo(note.daysAgo)}</p>
          <p className="mt-2 text-lg">{note.text}</p>
        </div>
      </div>
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!msg.trim()) return;
          toast.success(`Sent to ${teacher.name.replace("Maya ", "")}`);
          setMsg("");
        }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={`Reply, or tell us how ${s.firstName} is doing at home`}
          aria-label="Message the teacher"
          className="h-12 min-w-0 flex-1 rounded-full border-2 bg-background px-4 outline-none focus:border-leaf"
        />
        <button type="submit" className="btn-3d tone-leaf" disabled={!msg.trim()}>
          <Send className="size-4" aria-hidden /> Send
        </button>
      </form>
    </section>
  );
}
