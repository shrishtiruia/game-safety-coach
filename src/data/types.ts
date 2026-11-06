// Shapes mirror future database tables (games, creators, reviews, review_replies,
// classes, leaderboard snapshots). Foreign keys are plain string ids.

export const GRADES = ["K-2", "3-5", "6-8", "9-12"] as const;
// Soft skills, grouped by the five CASEL competencies (casel.org). The list also
// covers the OECD's social and emotional skills and the WEF's top human skills.
export const SKILL_AREAS = [
  {
    id: "self-awareness",
    label: "Knowing myself",
    casel: "Self-awareness",
    line: "Naming my feelings, telling the truth, and learning from mistakes.",
    skills: ["self-awareness", "honesty", "handling failure"],
  },
  {
    id: "self-management",
    label: "Managing myself",
    casel: "Self-management",
    line: "Calming down, staying with a task, waiting my turn, and working toward a goal.",
    skills: ["calming down", "focus", "patience", "goal-setting"],
  },
  {
    id: "social-awareness",
    label: "Understanding others",
    casel: "Social awareness",
    line: "Noticing how others feel, respecting differences, and saying thank you.",
    skills: ["empathy", "respecting differences", "gratitude"],
  },
  {
    id: "relationship-skills",
    label: "Getting along",
    casel: "Relationship skills",
    line: "Listening, talking face to face, working as a team, solving disagreements, and asking for help.",
    skills: [
      "active listening",
      "face-to-face conversation",
      "public speaking",
      "teamwork",
      "conflict resolution",
      "asking for help",
      "standing up for others",
      "leadership",
    ],
  },
  {
    id: "decision-making",
    label: "Making good choices",
    casel: "Responsible decision-making",
    line: "Thinking choices through, being kind online, and staying curious.",
    skills: ["decision-making", "digital etiquette", "curiosity"],
  },
] as const;

export const SKILLS = SKILL_AREAS.flatMap((a) => a.skills);
export type SkillArea = (typeof SKILL_AREAS)[number];
export const areaOf = (skill: string) =>
  SKILL_AREAS.find((a) => (a.skills as readonly string[]).includes(skill));
export const GAME_TYPES = [
  "role-play",
  "story choices",
  "co-op puzzle",
  "discussion cards",
  "simulation",
  "quiz",
  "unplugged / printable",
] as const;
export const GROUP_SIZES = ["solo", "pairs", "small group", "whole class"] as const;
export const TIMES = ["5", "15", "30", "45+"] as const;
export const DEVICES = ["iPad", "Chromebook", "projector", "screen-free"] as const;
export const PRICES = ["free", "paid", "bundles"] as const;
export const MORE = ["rating 4+", "CASEL aligned", "lesson plan"] as const;
export const REVIEW_TAGS = [
  "Students were engaged",
  "Easy to set up",
  "Sparked great discussion",
  "Worked for neurodivergent learners",
  "Good for ELL students",
] as const;

export type Grade = (typeof GRADES)[number];
export type Skill = (typeof SKILL_AREAS)[number]["skills"][number];
export type GameType = (typeof GAME_TYPES)[number];
export type GroupSize = (typeof GROUP_SIZES)[number];
export type TimeBucket = (typeof TIMES)[number];
export type Device = (typeof DEVICES)[number];
export type PriceFilter = (typeof PRICES)[number];
export type MoreFilter = (typeof MORE)[number];
export type ReviewTag = (typeof REVIEW_TAGS)[number];

export interface Creator {
  id: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  emoji: string;
  tone: "honey" | "leaf" | "sky" | "berry";
  verified: boolean;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  creatorId: string;
  tagline: string;
  description: string;
  coverIndex: number; // 0-11, see src/data/covers.ts
  coverFlip: boolean;
  grades: Grade[];
  skills: Skill[];
  type: GameType;
  groups: GroupSize[];
  minutes: number;
  devices: Device[];
  price: number; // USD, 0 = free
  isBundle: boolean;
  casel: boolean;
  lessonPlan: boolean;
  plays: number;
  weeklyPlays: number;
  publishedAt: string; // ISO date
  featured: boolean;
  learningGoals: string[];
  steps: { title: string; text: string }[];
}

export interface Review {
  id: string;
  gameId: string;
  teacherFirstName: string;
  grade: Grade;
  classSize: number;
  stars: number;
  tags: ReviewTag[];
  body: string;
  createdAt: string;
  helpful: number;
  verified: boolean;
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  creatorId: string;
  body: string;
}

export interface ClassroomEntry {
  id: string;
  className: string; // class name only — never student names
  school: string;
  badges: { week: number; month: number; all: number };
}
