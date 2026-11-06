// Leaderboard data. Kitbit ranks classrooms, never individual students, and
// scores are badges per student so a class of 12 competes fairly with a class of 30.
// Student first names only appear inside the teacher's own class (shout-outs).
import type { Game } from "@/data/types";
import { getGames, type Period } from "@/lib/catalog";
import { classrooms } from "@/data/reviews";
import {
  assignmentsFor,
  classes,
  classStats,
  studentsIn,
  TRACKED_SKILLS,
  teacher,
  type TrackedSkill,
} from "@/data/teacher";
import { getGameById } from "@/lib/catalog";

export interface LeagueRow {
  id: string;
  className: string;
  school: string;
  students: number;
  badges: number;
  perStudent: number; // badges per student, 1 decimal
  change: number; // places moved since last period (+ = up)
  topSkill: TrackedSkill;
  mine: boolean;
}

// Mock class sizes and movement for the seeded classrooms in reviews.ts.
const SIZES = [24, 27, 18, 22, 14, 26, 20, 25, 19, 23];
const MOVES = [2, 0, -1, 3, 1, -2, 0, 4, -1, 1];

export function league(period: Period): LeagueRow[] {
  const mineStats = classStats("cl1");
  const myAll = mineStats.badges;
  const myBadges =
    period === "week"
      ? Math.round(myAll * 0.06)
      : period === "month"
        ? Math.round(myAll * 0.22)
        : myAll;
  const mine = classes[0]!;
  const rows: Omit<LeagueRow, "perStudent">[] = [
    ...classrooms.map((c, i) => ({
      id: c.id,
      className: c.className,
      school: c.school,
      students: SIZES[i] ?? 20,
      badges: c.badges[period],
      change: MOVES[i] ?? 0,
      topSkill: TRACKED_SKILLS[(i * 5) % TRACKED_SKILLS.length]!,
      mine: false,
    })),
    {
      id: "mine",
      className: `${teacher.name.replace("Ms. Maya ", "Ms. ")}'s ${mine.name}`,
      school: teacher.school,
      students: mineStats.students,
      badges: myBadges,
      change: 3,
      topSkill: mineStats.skills.reduce((a, b) => (b.value > a.value ? b : a)).skill,
      mine: true,
    },
  ];
  return rows
    .map((r) => ({ ...r, perStudent: Math.round((r.badges / r.students) * 10) / 10 }))
    .sort((a, b) => b.perStudent - a.perStudent);
}

/* ---------- Skill spotlights: which classroom grew most in each skill ---------- */

const SKILL_TO_GAME_SKILLS: Record<TrackedSkill, string[]> = {
  empathy: ["empathy"],
  teamwork: ["teamwork"],
  communication: ["face-to-face conversation", "active listening", "public speaking"],
  resilience: ["handling failure", "patience"],
  focus: ["focus"],
  "conflict resolution": ["conflict resolution"],
};

export const SKILL_COPY: Record<TrackedSkill, { emoji: string; why: string }> = {
  empathy: { emoji: "💛", why: "Noticing how others feel" },
  teamwork: { emoji: "🤝", why: "Working toward a shared goal" },
  communication: { emoji: "💬", why: "Listening and speaking up" },
  resilience: { emoji: "🪵", why: "Bouncing back after mistakes" },
  focus: { emoji: "🎯", why: "Staying with a task" },
  "conflict resolution": { emoji: "🕊️", why: "Solving disagreements fairly" },
};

export interface Spotlight {
  skill: TrackedSkill;
  className: string;
  school: string;
  growth: number; // percentage points this period
  game: Game | undefined;
}

export function spotlights(period: Period): Spotlight[] {
  const games = getGames();
  const scale = period === "week" ? 1 : period === "month" ? 3 : 8;
  return TRACKED_SKILLS.map((skill, i) => {
    const c =
      classrooms[
        (i * 3 + (period === "week" ? 0 : period === "month" ? 1 : 2)) % classrooms.length
      ]!;
    const pool = games.filter((g) => g.skills.some((k) => SKILL_TO_GAME_SKILLS[skill].includes(k)));
    const game = [...pool].sort((a, b) => b.weeklyPlays - a.weeklyPlays)[0];
    return {
      skill,
      className: c.className,
      school: c.school,
      growth: (3 + ((i * 7) % 6)) * scale,
      game,
    };
  });
}

/* ---------- Your class: a shared goal everyone builds together ---------- */

export const LOG_SIZE = 5; // badges per log on the dam

export function classGoal(classId: string) {
  const list = studentsIn(classId);
  const stats = classStats(classId);
  const earned = Math.round(stats.badges * 0.22); // this month
  const goal = Math.max(40, Math.ceil((list.length * 3) / LOG_SIZE) * LOG_SIZE);
  const contributors = list.filter((s) => s.lastActiveDaysAgo <= 7).length;

  // Where the badges came from, by skill, weighted by the class's assigned games.
  const weights = Object.fromEntries(TRACKED_SKILLS.map((k) => [k, 1])) as Record<
    TrackedSkill,
    number
  >;
  for (const a of assignmentsFor(classId)) {
    const g = getGameById(a.gameId);
    if (!g) continue;
    for (const k of TRACKED_SKILLS) {
      if (g.skills.some((s) => SKILL_TO_GAME_SKILLS[k].includes(s)))
        weights[k] += a.completionRate / 25;
    }
  }
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const bySkill = TRACKED_SKILLS.map((k) => ({
    skill: k,
    badges: Math.round((weights[k] / total) * earned),
  })).sort((a, b) => b.badges - a.badges);

  return {
    earned,
    goal,
    contributors,
    students: list.length,
    bySkill,
    reward: "Extra recess on Friday",
  };
}

/* ---------- Peer shout-outs (only visible to the teacher of that class) ---------- */

const SHOUTOUTS: { skill: TrackedSkill; text: string }[] = [
  { skill: "teamwork", text: "helped me finish our tower when I wanted to quit" },
  { skill: "empathy", text: "asked if I was okay when I was sad at lunch" },
  { skill: "communication", text: "listened to my whole idea before saying theirs" },
  { skill: "conflict resolution", text: "helped us take turns instead of arguing" },
  { skill: "resilience", text: "kept trying the puzzle and showed me how" },
];

export function shoutOutsFor(classId: string) {
  const list = studentsIn(classId);
  return SHOUTOUTS.map((s, i) => {
    const from = list[(i * 5 + 1) % list.length];
    const to = list[(i * 3 + 4) % list.length];
    return {
      id: `so${i}`,
      from: from?.firstName ?? "A classmate",
      to: to?.firstName ?? "a friend",
      toId: to?.id,
      daysAgo: i,
      ...s,
    };
  });
}
