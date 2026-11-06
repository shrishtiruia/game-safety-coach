/**
 * Game thumbnails: one friendly icon on one solid palette color, so every game
 * looks like part of the same set. Shaped like games.cover_icon / games.cover_color.
 * A game without saved cover columns gets a stable cover from its skill and title.
 */
export const COVER_ICONS = [
  "handshake",
  "scale",
  "coins",
  "store",
  "microphone",
  "megaphone",
  "presentation",
  "trophy",
  "speech_bubbles",
  "message_circle",
  "ear",
  "users",
  "stacked_blocks",
  "puzzle",
  "rocket",
  "heart_chat",
  "heart_handshake",
  "bird",
  "lightbulb",
] as const;
export type CoverIcon = (typeof COVER_ICONS)[number];

export const COVER_COLORS = ["orange", "blue", "green", "yellow", "red"] as const;
export type CoverColor = (typeof COVER_COLORS)[number];
export type Cover = { cover_icon: CoverIcon; cover_color: CoverColor };

/** What each icon is for, so the AI can pick one that fits the game. */
export const COVER_ICON_HINTS: Record<CoverIcon, string> = {
  handshake: "making a deal, agreeing",
  scale: "fairness, weighing options",
  coins: "money, trading, budgets",
  store: "shops, markets, buying and selling",
  microphone: "speaking, performing, presenting aloud",
  megaphone: "announcing, persuading a crowd",
  presentation: "slides, giving a talk, explaining",
  trophy: "competition, winning, challenges",
  speech_bubbles: "back-and-forth conversation",
  message_circle: "asking questions, chatting",
  ear: "listening",
  users: "groups, classmates, teams",
  stacked_blocks: "building together",
  puzzle: "solving problems together, fitting pieces",
  rocket: "missions, adventure, launching projects",
  heart_chat: "feelings, kind words",
  heart_handshake: "making up, empathy, repairing relationships",
  bird: "peace, calm, resolving conflict",
  lightbulb: "ideas, reflection, learning",
};

/** Icons that fit each skill, used for the automatic cover and "Try another". */
export const SKILL_ICONS: Record<string, CoverIcon[]> = {
  negotiation: ["handshake", "store", "coins", "scale"],
  public_speaking: ["microphone", "megaphone", "presentation", "trophy"],
  conversation: ["speech_bubbles", "message_circle", "ear", "users"],
  collaboration: ["stacked_blocks", "puzzle", "rocket", "users"],
  conflict_resolution: ["heart_chat", "heart_handshake", "bird", "scale"],
};

/** One color per skill keeps the library consistent. */
export const SKILL_COLOR: Record<string, CoverColor> = {
  negotiation: "orange",
  public_speaking: "blue",
  conversation: "green",
  collaboration: "yellow",
  conflict_resolution: "red",
};

/** Seeded games whose covers were chosen by hand. */
const BY_GAME: Record<string, Cover> = {
  "11111111-1111-1111-1111-111111111111": { cover_icon: "handshake", cover_color: "orange" }, // Haggle Hero
  "22222222-2222-2222-2222-222222222222": { cover_icon: "trophy", cover_color: "red" }, // Comeback Kings
  "33333333-3333-3333-3333-333333333333": { cover_icon: "heart_chat", cover_color: "green" }, // Talk It Out
  "44444444-4444-4444-4444-444444444444": { cover_icon: "microphone", cover_color: "blue" }, // Say It Out Loud
  "55555555-5555-5555-5555-555555555555": { cover_icon: "speech_bubbles", cover_color: "green" }, // Chat Quest
  "66666666-6666-6666-6666-666666666666": { cover_icon: "stacked_blocks", cover_color: "yellow" }, // Team Up Tower
};

export const isCoverIcon = (v: unknown): v is CoverIcon =>
  typeof v === "string" && (COVER_ICONS as readonly string[]).includes(v);
export const isCoverColor = (v: unknown): v is CoverColor =>
  typeof v === "string" && (COVER_COLORS as readonly string[]).includes(v);

/** A cover for a game that doesn't have one saved: same game, same cover, every time. */
export function autoCover(skill: string, title: string): Cover {
  const icons = SKILL_ICONS[skill] ?? ["lightbulb"];
  let hash = 0;
  for (const ch of title.trim().toLowerCase()) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    cover_icon: icons[hash % icons.length] ?? "lightbulb",
    cover_color: SKILL_COLOR[skill] ?? "green",
  };
}

export function getCover(game: {
  id: string;
  skill: string;
  title?: string;
  cover_icon?: unknown;
  cover_color?: unknown;
}): Cover {
  if (isCoverIcon(game.cover_icon) && isCoverColor(game.cover_color)) {
    return { cover_icon: game.cover_icon, cover_color: game.cover_color };
  }
  return BY_GAME[game.id] ?? autoCover(game.skill, game.title ?? game.id);
}
