// "Plan my week": turns a teacher's description of their class into a 5-day
// plan of Kitbit games with a discussion opener and a closing question each day.
//
// This version matches the teacher's words to soft skills with a phrase list,
// then picks games from the catalog that fit the class's grade, the minutes
// available and the devices in the room. It runs instantly and offline.
// The `understand` step is the one place an AI model would slot in later.
import type { Game, Grade, Skill } from "@/data/types";
import { getGames, ratingOf } from "@/lib/catalog";

/* ---------- 1. Understand what the teacher wrote ---------- */

interface Cue {
  words: string[];
  skills: Skill[];
  reason: string; // how we heard it, shown back to the teacher
  weight?: number; // places and times of day are context, not the problem itself
}

const CUES: Cue[] = [
  {
    words: ["argu", "fight", "conflict", "disagree", "yell", "shout", "tattl", "blame"],
    skills: ["conflict resolution", "active listening"],
    reason: "arguing",
  },
  {
    words: ["recess", "playground", "lunch", "line up", "lining up"],
    skills: ["conflict resolution", "teamwork"],
    reason: "unstructured time",
    weight: 0.4,
  },
  {
    words: ["share", "sharing", "turn", "turns", "wait", "patien", "grab"],
    skills: ["patience", "teamwork"],
    reason: "sharing and taking turns",
  },
  {
    words: ["interrupt", "blurt", "talk over", "listen", "not listening", "calling out"],
    skills: ["active listening", "patience"],
    reason: "listening",
  },
  {
    words: ["left out", "exclud", "lonely", "alone", "friend", "new student", "newcomer", "clique"],
    skills: ["empathy", "face-to-face conversation"],
    reason: "kids feeling left out",
  },
  {
    words: ["mean", "tease", "teasing", "bully", "rude", "unkind", "laugh at"],
    skills: ["empathy", "self-awareness"],
    reason: "unkindness",
  },
  {
    words: [
      "give up",
      "gives up",
      "quit",
      "frustrat",
      "meltdown",
      "melt down",
      "cry",
      "lose",
      "losing",
      "mistake",
      "perfection",
    ],
    skills: ["handling failure", "self-awareness"],
    reason: "giving up and losing",
  },
  {
    words: [
      "focus",
      "distract",
      "attention",
      "fidget",
      "off task",
      "off-task",
      "restless",
      "settle",
      "calm",
    ],
    skills: ["focus", "self-awareness"],
    reason: "focus",
  },
  {
    words: [
      "phone",
      "screen",
      "ipad",
      "tablet",
      "online",
      "chat",
      "group chat",
      "social media",
      "text",
    ],
    skills: ["digital etiquette", "face-to-face conversation"],
    reason: "screens and online behaviour",
  },
  {
    words: [
      "shy",
      "quiet",
      "won't speak",
      "wont speak",
      "present",
      "presentation",
      "speak up",
      "nervous",
    ],
    skills: ["public speaking", "face-to-face conversation"],
    reason: "speaking up",
  },
  {
    words: ["group work", "groupwork", "team", "project", "cooperat", "collaborat", "partner"],
    skills: ["teamwork", "active listening"],
    reason: "group work",
  },
  {
    words: [
      "eye contact",
      "conversation",
      "small talk",
      "talk to each other",
      "talking to each other",
    ],
    skills: ["face-to-face conversation", "active listening"],
    reason: "real conversation",
  },
  {
    words: ["choice", "decid", "impuls", "think before", "consequence"],
    skills: ["decision-making", "self-awareness"],
    reason: "decisions",
  },
  {
    words: ["feeling", "emotion", "angry", "anger", "upset", "sad", "anxious", "worried"],
    skills: ["self-awareness", "empathy"],
    reason: "big feelings",
  },
  { words: ["empath", "kind", "care", "caring"], skills: ["empathy"], reason: "kindness" },
];

export interface Understanding {
  skills: Skill[]; // most to least relevant, 1-3
  heard: string[]; // what we picked up, in plain words
}

export function understand(text: string, fallback: Skill): Understanding {
  const t = ` ${text.toLowerCase()} `;
  const score = new Map<Skill, number>();
  const heard: string[] = [];
  for (const cue of CUES) {
    const hits = cue.words.filter((w) => t.includes(w)).length;
    if (!hits) continue;
    if (!heard.includes(cue.reason)) heard.push(cue.reason);
    const w = cue.weight ?? 1;
    cue.skills.forEach((k, i) => score.set(k, (score.get(k) ?? 0) + hits * w * (i === 0 ? 2 : 1)));
  }
  const skills = [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, 3);
  return skills.length ? { skills, heard } : { skills: [fallback], heard: [] };
}

/* ---------- 2. Build the week ---------- */

export interface PlanOptions {
  grade: Grade;
  minutes: 5 | 15 | 30;
  screenFree: boolean;
}

export interface PlanDay {
  day: string;
  theme: string;
  skill: Skill;
  game: Game;
  goal: string;
  opener: string;
  closer: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const THEMES = [
  "Notice it",
  "Name it",
  "Practise it together",
  "Use it for real",
  "Look back and celebrate",
];

const OPENERS: Record<string, (k: string) => string> = {
  "Notice it": (k) => `When did you see someone show ${k} this week? What did it look like?`,
  "Name it": (k) => `What words could we use when ${k} is hard? Let's make a list on the board.`,
  "Practise it together": (k) =>
    `Today you'll practise ${k} with a partner. What's one thing a good partner does?`,
  "Use it for real": (k) =>
    `Where in our school day do we need ${k} most? Let's pick one moment to try it.`,
  "Look back and celebrate": (k) => `What got easier this week? Who helped you with ${k}?`,
};
const CLOSERS: Record<string, string> = {
  "Notice it": "Thumbs up, sideways or down: how did that game feel?",
  "Name it": "Tell your partner one word you'll use tomorrow.",
  "Practise it together": "What did your partner do that helped you?",
  "Use it for real": "Did you try it at recess or lunch? What happened?",
  "Look back and celebrate": "Give a shout-out to someone who showed it this week.",
};

export function buildWeek(
  skills: Skill[],
  opts: PlanOptions,
  swaps: Record<number, number> = {},
): PlanDay[] {
  const all = getGames().filter((g) => !g.isBundle);
  const fits = (g: Game, strict: boolean) =>
    (!opts.screenFree || g.devices.includes("screen-free")) &&
    (!strict || g.grades.includes(opts.grade)) &&
    g.minutes <= (strict ? opts.minutes : opts.minutes * 2);
  const rank = (list: Game[]) => [...list].sort((a, b) => ratingOf(b.id).avg - ratingOf(a.id).avg);

  const used = new Set<string>();
  return DAYS.map((day, i) => {
    // Spread the week across the skills we heard: the main one gets three days.
    const skill =
      skills.length === 1
        ? skills[0]!
        : [0, 1, 0, skills.length > 2 ? 2 : 1, 0].map((n) => skills[n]!)[i]!;
    // Teaching the day's skill matters more than an exact fit on minutes or grade.
    const pools = [
      all.filter((g) => g.skills.includes(skill) && fits(g, true)),
      all.filter((g) => g.skills.includes(skill) && fits(g, false)),
      all.filter((g) => skills.some((k) => g.skills.includes(k)) && fits(g, true)),
      all.filter((g) => skills.some((k) => g.skills.includes(k)) && fits(g, false)),
      all.filter((g) => fits(g, false)),
      all,
    ];
    const pool = rank(pools.find((p) => p.some((g) => !used.has(g.id))) ?? all);
    const fresh = pool.filter((g) => !used.has(g.id));
    const choices = fresh.length ? fresh : pool;
    const game = choices[(swaps[i] ?? 0) % choices.length]!;
    used.add(game.id);
    const theme = THEMES[i]!;
    // Name the skill this game really teaches, and take the goal from it.
    const taught = game.skills.includes(skill)
      ? skill
      : (skills.find((k) => game.skills.includes(k)) ?? game.skills[0]!);
    const goal =
      game.learningGoals[game.skills.indexOf(taught) * 2] ??
      game.learningGoals[0] ??
      `Practise ${taught}`;
    return {
      day,
      theme,
      skill: taught,
      game,
      goal,
      opener: OPENERS[theme]!(taught),
      closer: CLOSERS[theme]!,
    };
  });
}

/** "Grade 4" or "Grades 3-5" → the catalog's grade band. */
export function gradeBand(label: string): Grade {
  const m = label.match(/(\d+)/);
  const n = m ? Number(m[1]) : 0;
  if (/k/i.test(label) && !m) return "K-2";
  if (n <= 2) return "K-2";
  if (n <= 5) return "3-5";
  if (n <= 8) return "6-8";
  return "9-12";
}

export const EXAMPLES = [
  "Lots of arguing at recess, and they blame each other",
  "Kids give up as soon as something is hard",
  "They interrupt each other and don't listen",
  "A few students feel left out at lunch",
];
