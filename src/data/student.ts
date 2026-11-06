// Per-student derived data for the Student Profile page.
// Everything is computed from src/data/teacher.ts so numbers always match the
// teacher roster (overall %, badges, games completed).
import type { Game } from "@/data/types";
import { getGameById, getGames } from "@/lib/catalog";
import {
  assignmentsFor,
  overallOf,
  topSkill,
  TRACKED_SKILLS,
  weakSkill,
  type Student,
  type TrackedSkill,
} from "@/data/teacher";

const hash = (str: string) => {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/* ---------- Level & streak ---------- */

export const LEVEL_NAMES = [
  "Tiny Twig",
  "Pebble Pal",
  "Ripple Maker",
  "Log Roller",
  "Dam Builder",
  "Pond Keeper",
  "Busy Beaver",
  "River Guide",
  "Lodge Leader",
  "Kitbit Legend",
];

export function levelOf(s: Student) {
  const perLevel = 400;
  const xp = overallOf(s) * 30 + s.badges * 50 + s.gamesCompleted * 40;
  const level = Math.floor(xp / perLevel) + 1;
  return {
    xp,
    level,
    name: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? "Kitbit Legend",
    intoLevel: xp % perLevel,
    perLevel,
  };
}

export const streakOf = (s: Student) => (s.lastActiveDaysAgo > 1 ? 0 : 2 + (hash(s.id) % 18));

/* ---------- Assigned games ---------- */

export type GameStatus = "not-started" | "in-progress" | "completed";
export interface StudentGame {
  assignmentId: string;
  game: Game;
  status: GameStatus;
  progress: number;
  dueInDays: number; // negative = finished that many days ago
}

export function studentGames(s: Student): StudentGame[] {
  const list = assignmentsFor(s.classId).filter(
    (a) => a.studentIds.length === 0 || a.studentIds.includes(s.id),
  );
  const r = rng(hash(s.id) + 7);
  return list.flatMap((a, i) => {
    const game = getGameById(a.gameId);
    if (!game) return [];
    const status: GameStatus =
      i < s.gamesCompleted ? "completed" : i < s.gamesStarted ? "in-progress" : "not-started";
    const progress =
      status === "completed" ? 100 : status === "in-progress" ? Math.round(20 + r() * 60) : 0;
    const dueInDays = status === "completed" ? -1 - Math.floor(r() * 10) : 2 + Math.floor(r() * 12);
    return [{ assignmentId: a.id, game, status, progress, dueInDays }];
  });
}

/* ---------- Skill journey ---------- */

const SKILL_GAME_MATCH: Record<TrackedSkill, string[]> = {
  "self-awareness": ["self-awareness", "honesty"],
  focus: ["focus", "calming down", "goal-setting"],
  resilience: ["handling failure", "patience"],
  empathy: ["empathy", "respecting differences", "gratitude", "standing up for others"],
  communication: [
    "face-to-face conversation",
    "active listening",
    "public speaking",
    "asking for help",
  ],
  teamwork: ["teamwork", "leadership"],
  "conflict resolution": ["conflict resolution"],
  "decision-making": ["decision-making", "digital etiquette", "curiosity"],
};

const STEPS: Record<TrackedSkill, { title: string; teaches: string }[]> = {
  "self-awareness": [
    { title: "Name my feeling", teaches: "Putting a word to how I feel right now." },
    {
      title: "Feelings in my body",
      teaches: "Noticing where a feeling shows up: tummy, face, hands.",
    },
    { title: "What helps me", teaches: "Finding what helps when a feeling gets big." },
    { title: "Tell the truth", teaches: "Being honest, even when it's hard." },
    {
      title: "Self-awareness chest",
      teaches: "Unit review: check in with yourself and a partner.",
    },
  ],
  "decision-making": [
    { title: "Stop and think", teaches: "Pausing before choosing." },
    { title: "What could happen?", teaches: "Imagining where each choice might lead." },
    { title: "Fair for everyone", teaches: "Thinking about how a choice affects other people." },
    { title: "Safe and kind online", teaches: "Making good choices on screens." },
    { title: "Choices chest", teaches: "Unit review: solve a real choice with your class." },
  ],
  empathy: [
    { title: "Name that feeling", teaches: "Spotting emotions on faces and in voices." },
    { title: "In their shoes", teaches: "Imagining how a situation feels to someone else." },
    { title: "Kind responses", teaches: "Choosing words that help when a friend is upset." },
    { title: "Including others", teaches: "Noticing who's left out and inviting them in." },
    { title: "Empathy chest", teaches: "Unit review: put all your empathy skills together." },
  ],
  teamwork: [
    { title: "Shared goals", teaches: "Agreeing on what the team is trying to do." },
    { title: "Taking turns", teaches: "Making sure everyone gets a say and a go." },
    { title: "Playing your role", teaches: "Owning your part so the team can succeed." },
    { title: "Team wins & losses", teaches: "Celebrating together and recovering together." },
    { title: "Teamwork chest", teaches: "Unit review: a co-op challenge with your class." },
  ],
  communication: [
    { title: "Eye contact", teaches: "Looking up from the screen and connecting." },
    { title: "Listen to understand", teaches: "Hearing the whole idea before replying." },
    { title: "Say it clearly", teaches: "Sharing your idea in a few clear sentences." },
    { title: "Ask good questions", teaches: "Keeping a conversation going with curiosity." },
    { title: "Communication chest", teaches: "Unit review: a real face-to-face conversation." },
  ],
  resilience: [
    { title: "Oops is okay", teaches: "Seeing mistakes as part of learning." },
    { title: "Calm-down tools", teaches: "Breathing and pausing when things feel hard." },
    { title: "Try another way", teaches: "Finding a new plan when the first one fails." },
    { title: "Keep going", teaches: "Sticking with a tricky task a little longer." },
    { title: "Resilience chest", teaches: "Unit review: bounce back from a tough challenge." },
  ],
  focus: [
    { title: "One thing at a time", teaches: "Putting distractions away to start a task." },
    { title: "Notice drifting", teaches: "Catching your mind wandering and coming back." },
    { title: "Chunk it up", teaches: "Breaking big tasks into small steps." },
    { title: "Finish strong", teaches: "Staying with a task until it's done." },
    { title: "Focus chest", teaches: "Unit review: a no-distractions mission." },
  ],
  "conflict resolution": [
    { title: "Cool down first", teaches: "Taking space before solving a problem." },
    { title: "I-statements", teaches: "Saying how you feel without blaming." },
    { title: "Hear both sides", teaches: "Letting each person tell their side." },
    { title: "Find a fair fix", teaches: "Brainstorming solutions everyone can accept." },
    { title: "Peacemaker chest", teaches: "Unit review: help two friends solve a disagreement." },
  ],
};

export type NodeState = "done" | "current" | "locked";
export type NodeKind = "lesson" | "chest" | "trophy";
export type UnitTone = "leaf" | "sky" | "berry" | "honey";

export interface JourneyNode {
  id: string;
  kind: NodeKind;
  state: NodeState;
  title: string;
  teaches: string;
  stepNumber?: number | undefined; // 1-based, lessons and trophy only
  lessonsDone: number; // mini-lessons finished inside this step
  lessonsTotal: number;
  xp: number;
  game?: Game | undefined;
}
export interface JourneyUnit {
  skill: TrackedSkill;
  index: number;
  tone: UnitTone;
  blurb: string;
  value: number;
  isFocus: boolean;
  stepsDone: number;
  stepsTotal: number;
  nodes: JourneyNode[];
}

// Two calm tones alternate so units read as separate without a rainbow.
const UNIT_TONES: UnitTone[] = ["leaf", "honey"];
const UNIT_BLURBS: Record<TrackedSkill, string> = {
  "self-awareness": "Know your feelings and what helps you",
  "decision-making": "Think choices through before you act",
  empathy: "Notice feelings and respond with kindness",
  teamwork: "Work toward a shared goal with classmates",
  communication: "Listen, speak up and keep a conversation going",
  resilience: "Bounce back when things get hard",
  focus: "Put distractions away and finish strong",
  "conflict resolution": "Solve disagreements fairly",
};
const LESSONS_PER_STEP = 4;

export function journeyOf(s: Student): JourneyUnit[] {
  const games = getGames();
  const focus = weakSkill(s);
  return TRACKED_SKILLS.map((skill, u) => {
    const value = s.skills[skill];
    const done = Math.min(5, Math.floor(value / 20)); // core steps finished (5 per unit)
    const partial = Math.floor((value % 20) / 5); // lessons into the current step
    const pool = games.filter((g) => g.skills.some((k) => SKILL_GAME_MATCH[skill].includes(k)));
    const stateOf = (i: number): NodeState =>
      i < done ? "done" : i === done ? "current" : "locked";
    const lessonsOf = (st: NodeState) =>
      st === "done" ? LESSONS_PER_STEP : st === "current" ? partial : 0;

    const core: JourneyNode[] = STEPS[skill].map((st, i) => {
      const state = stateOf(i);
      const last = i === 4;
      return {
        id: `${skill}-${i}`,
        kind: last ? "trophy" : "lesson",
        state,
        title: last ? st.title.replace(/ chest$/, " review") : st.title,
        teaches: st.teaches,
        stepNumber: i + 1,
        lessonsDone: lessonsOf(state),
        lessonsTotal: LESSONS_PER_STEP,
        xp: last ? 50 : 15,
        game: last
          ? undefined
          : (pool[i % Math.max(pool.length, 1)] ?? games[(u * 4 + i) % games.length]),
      };
    });
    const chest: JourneyNode = {
      id: `${skill}-chest`,
      kind: "chest",
      state: done >= 2 ? "done" : "locked",
      title: "Bonus chest",
      teaches: "A surprise reward for finishing the first two steps.",
      lessonsDone: 0,
      lessonsTotal: 0,
      xp: 20,
    };
    const nodes = [...core.slice(0, 2), chest, ...core.slice(2)];
    return {
      skill,
      index: u + 1,
      tone: UNIT_TONES[u % UNIT_TONES.length] ?? "leaf",
      blurb: UNIT_BLURBS[skill],
      value,
      isFocus: skill === focus,
      stepsDone: done,
      stepsTotal: 5,
      nodes,
    };
  });
}

/** Simple daily quests derived from the student's activity (mock). */
export function questsOf(s: Student) {
  const active = s.lastActiveDaysAgo <= 1;
  const mins = Math.min(15, Math.round(s.minutesThisWeek / 5));
  return [
    {
      id: "q1",
      emoji: "⚡",
      label: "Earn 50 XP",
      have: active ? 30 + (s.badges % 3) * 10 : 0,
      need: 50,
    },
    { id: "q2", emoji: "🎮", label: "Finish 1 game step", have: active ? 1 : 0, need: 1 },
    { id: "q3", emoji: "⏱️", label: "Play for 15 minutes", have: active ? mins : 0, need: 15 },
  ];
}

/* ---------- Badges ---------- */

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  tone: "honey" | "leaf" | "sky" | "berry";
  unit: string; // used in locked hint, e.g. "games"
  need: number;
}

// Unlock order — earlier badges are earned first.
export const BADGES: BadgeDef[] = [
  {
    id: "first-game",
    name: "First Game",
    emoji: "🎮",
    desc: "Finished your very first Kitbit game.",
    tone: "sky",
    unit: "game",
    need: 1,
  },
  {
    id: "great-listener",
    name: "Great Listener",
    emoji: "👂",
    desc: "Completed 3 listening challenges.",
    tone: "leaf",
    unit: "challenges",
    need: 3,
  },
  {
    id: "empathy-explorer",
    name: "Empathy Explorer",
    emoji: "💛",
    desc: "Finished the first empathy steps.",
    tone: "honey",
    unit: "steps",
    need: 3,
  },
  {
    id: "team-player",
    name: "Team Player",
    emoji: "🤝",
    desc: "Won a co-op game with classmates.",
    tone: "berry",
    unit: "co-op wins",
    need: 2,
  },
  {
    id: "streak-7",
    name: "7-Day Streak",
    emoji: "🔥",
    desc: "Played Kitbit 7 days in a row.",
    tone: "berry",
    unit: "days",
    need: 7,
  },
  {
    id: "bounce-back",
    name: "Bounce Back",
    emoji: "🪵",
    desc: "Retried a level after a tough loss.",
    tone: "honey",
    unit: "retries",
    need: 3,
  },
  {
    id: "focus-finder",
    name: "Focus Finder",
    emoji: "🎯",
    desc: "Finished a game with zero distractions.",
    tone: "sky",
    unit: "missions",
    need: 3,
  },
  {
    id: "peacemaker",
    name: "Peacemaker",
    emoji: "🕊️",
    desc: "Solved a conflict scenario fairly.",
    tone: "leaf",
    unit: "scenarios",
    need: 4,
  },
  {
    id: "five-games",
    name: "High Five",
    emoji: "🖐️",
    desc: "Completed 5 different games.",
    tone: "sky",
    unit: "games",
    need: 5,
  },
  {
    id: "kind-words",
    name: "Kind Words",
    emoji: "💬",
    desc: "Got 10 shout-outs from classmates.",
    tone: "berry",
    unit: "shout-outs",
    need: 10,
  },
  {
    id: "weekly-warrior",
    name: "Weekly Warrior",
    emoji: "📅",
    desc: "Hit your weekly goal 4 weeks running.",
    tone: "honey",
    unit: "weeks",
    need: 4,
  },
  {
    id: "skill-master",
    name: "Skill Master",
    emoji: "👑",
    desc: "Reached 90% in any soft skill.",
    tone: "leaf",
    unit: "% top skill",
    need: 90,
  },
];

export interface StudentBadge {
  def: BadgeDef;
  earned: boolean;
  count: number; // times earned
  earnedDaysAgo?: number | undefined;
  have: number; // progress toward need when locked
}

export function badgesOf(s: Student): StudentBadge[] {
  const unique =
    s.badges === 0 ? 0 : Math.min(BADGES.length, Math.max(1, Math.ceil(s.badges * 0.6)));
  let extra = Math.max(0, s.badges - unique);
  const r = rng(hash(s.id) + 99);
  const counts: number[] = BADGES.map((_, i) => (i < unique ? 1 : 0));
  for (let i = 0; extra > 0 && unique > 0; i = (i + 1) % unique) {
    counts[i] = (counts[i] ?? 0) + 1;
    extra--;
  }
  return BADGES.map((def, i) => {
    const earned = i < unique;
    const have =
      def.id === "skill-master"
        ? s.skills[topSkill(s)]
        : def.id === "five-games"
          ? Math.min(def.need - 1, s.gamesCompleted)
          : Math.floor(r() * def.need);
    return {
      def,
      earned,
      count: counts[i] ?? 0,
      earnedDaysAgo: earned ? (unique - 1 - i) * 4 + 1 + Math.floor(r() * 3) : undefined,
      have: earned ? def.need : Math.min(have, def.need - 1),
    };
  });
}

/* ---------- Teacher notes ---------- */

export function teacherNotesOf(s: Student) {
  const top = topSkill(s);
  const weak = weakSkill(s);
  return [
    {
      daysAgo: 2,
      text: `${s.firstName} really shone during our ${top} activity — helped a classmate who was stuck without being asked.`,
    },
    {
      daysAgo: 6,
      text: `Working on ${weak}. Paired ${s.firstName} with a buddy for the next game; will check in Friday.`,
    },
    {
      daysAgo: 13,
      text:
        s.lastActiveDaysAgo > 7
          ? `Hasn't logged in recently — sending a note home to see if there's an iPad access issue.`
          : `Great energy this week. ${s.firstName} asked to replay a game to beat their own score.`,
    },
  ];
}

export const dateDaysAgo = (d: number) => {
  const dt = new Date(Date.UTC(2026, 10, 5));
  dt.setUTCDate(dt.getUTCDate() - d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};
