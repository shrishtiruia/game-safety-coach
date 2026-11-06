// Single data-access layer. Swap these functions for Lovable Cloud queries later.
import { creators } from "@/data/creators";
import { games } from "@/data/games";
import { classrooms, reviewReplies, reviews } from "@/data/reviews";
import type { Game, Review } from "@/data/types";

export interface Filters {
  q: string;
  grades: string[];
  skills: string[];
  types: string[];
  groups: string[];
  times: string[];
  devices: string[];
  prices: string[];
  more: string[];
  sort: string;
}

export const FILTER_KEYS = ["grades", "skills", "types", "groups", "times", "devices", "prices", "more"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export const emptyFilters: Filters = {
  q: "", grades: [], skills: [], types: [], groups: [], times: [], devices: [], prices: [], more: [], sort: "relevance",
};

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : typeof v === "string" && v ? [v] : [];

export function parseFilters(s: Record<string, unknown>): Filters {
  return {
    q: typeof s["q"] === "string" ? s["q"] : "",
    grades: arr(s["grades"]), skills: arr(s["skills"]), types: arr(s["types"]), groups: arr(s["groups"]),
    times: arr(s["times"]), devices: arr(s["devices"]), prices: arr(s["prices"]), more: arr(s["more"]),
    sort: typeof s["sort"] === "string" ? s["sort"] : "relevance",
  };
}

export const getGames = () => games;
export const getCreators = () => creators;
export const getClassrooms = () => classrooms;
export const getGame = (slug: string) => games.find((g) => g.slug === slug);
export const getGameById = (id: string) => games.find((g) => g.id === id);
export const getCreator = (id: string) => creators.find((c) => c.id === id)!;
export const gamesByCreator = (id: string) => games.filter((g) => g.creatorId === id);
export const reviewsFor = (gameId: string) => reviews.filter((r) => r.gameId === gameId);
export const replyFor = (reviewId: string) => reviewReplies.find((r) => r.reviewId === reviewId);

export function ratingOf(gameId: string, extra: Review[] = []) {
  const rs = [...reviewsFor(gameId), ...extra.filter((r) => r.gameId === gameId)];
  const avg = rs.length ? rs.reduce((a, r) => a + r.stars, 0) / rs.length : 0;
  return { avg: Math.round(avg * 10) / 10, count: rs.length };
}

export function timeBucket(min: number) {
  if (min <= 5) return "5";
  if (min <= 15) return "15";
  if (min <= 30) return "30";
  return "45+";
}

export function matches(g: Game, f: Filters): boolean {
  const any = (sel: string[], vals: string[]) => sel.length === 0 || sel.some((s) => vals.includes(s));
  if (f.q) {
    const q = f.q.toLowerCase();
    const hay = [g.title, g.tagline, getCreator(g.creatorId).name, ...g.skills, g.type].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (!any(f.grades, g.grades)) return false;
  if (!any(f.skills, g.skills)) return false;
  if (!any(f.types, [g.type])) return false;
  if (!any(f.groups, g.groups)) return false;
  if (!any(f.times, [timeBucket(g.minutes)])) return false;
  if (!any(f.devices, g.devices)) return false;
  if (f.prices.length) {
    const tags = [g.price === 0 ? "free" : "paid", ...(g.isBundle ? ["bundles"] : [])];
    if (!f.prices.some((p) => tags.includes(p))) return false;
  }
  if (f.more.includes("rating 4+") && ratingOf(g.id).avg < 4) return false;
  if (f.more.includes("CASEL aligned") && !g.casel) return false;
  if (f.more.includes("lesson plan") && !g.lessonPlan) return false;
  return true;
}

export const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Top rated" },
  { value: "plays", label: "Most played" },
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price: low to high" },
];

export function sortGames(list: Game[], sort: string): Game[] {
  const out = [...list];
  if (sort === "rating") out.sort((a, b) => ratingOf(b.id).avg - ratingOf(a.id).avg);
  else if (sort === "plays") out.sort((a, b) => b.plays - a.plays);
  else if (sort === "newest") out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  else if (sort === "price") out.sort((a, b) => a.price - b.price);
  return out;
}

export const searchGames = (f: Filters) => sortGames(games.filter((g) => matches(g, f)), f.sort);

export const formatPrice = (p: number) => (p === 0 ? "Free" : `$${p.toFixed(2)}`);

export type Period = "week" | "month" | "all";
export function topGames(period: Period) {
  const score = (g: Game) => (period === "week" ? g.weeklyPlays : period === "month" ? g.weeklyPlays * 4 + g.plays * 0.05 : g.plays);
  return [...games].sort((a, b) => score(b) - score(a)).map((g) => ({ game: g, score: Math.round(score(g)) }));
}
export function topCreators(period: Period) {
  return creators
    .map((c) => ({ creator: c, score: topGames(period).filter((x) => x.game.creatorId === c.id).reduce((a, x) => a + x.score, 0) }))
    .sort((a, b) => b.score - a.score);
}
export function topClassrooms(period: Period) {
  return [...classrooms].sort((a, b) => b.badges[period] - a.badges[period]).map((c) => ({ classroom: c, score: c.badges[period] }));
}

/** "K-2", "3-5" → "Grades K–5" */
export function gradeRange(grades: readonly string[]) {
  if (grades.length === 0) return "All grades";
  const lo = grades[0]!.split("-")[0];
  const hi = grades.at(-1)!.split("-").at(-1);
  return `Grades ${lo}–${hi}`;
}
