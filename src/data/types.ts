// Shapes mirror future database tables (games, creators, reviews, review_replies,
// classes, leaderboard snapshots). Foreign keys are plain string ids.

export const GRADES = ["K-2", "3-5", "6-8", "9-12"] as const;
export const SKILLS = [
  "empathy",
  "active listening",
  "teamwork",
  "conflict resolution",
  "patience",
  "focus",
  "public speaking",
  "face-to-face conversation",
  "handling failure",
  "digital etiquette",
  "decision-making",
  "self-awareness",
] as const;
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
export type Skill = (typeof SKILLS)[number];
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
