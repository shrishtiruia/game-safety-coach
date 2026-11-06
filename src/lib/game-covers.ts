/**
 * Cover art for each game: a friendly icon on a solid color.
 * Shaped like the planned games.cover_icon / games.cover_color columns;
 * kept in code until those columns exist in the database.
 */
export type CoverIcon =
  | "handshake"
  | "microphone"
  | "speech_bubbles"
  | "stacked_blocks"
  | "trophy"
  | "heart_chat"
  | "ear"
  | "hourglass"
  | "target"
  | "sprout"
  | "phone"
  | "signpost"
  | "smile";
export type CoverColor = "orange" | "blue" | "green" | "yellow" | "red";
export type Cover = { cover_icon: CoverIcon; cover_color: CoverColor };

const BY_GAME: Record<string, Cover> = {
  "11111111-1111-1111-1111-111111111111": { cover_icon: "handshake", cover_color: "orange" }, // Haggle Hero
  "22222222-2222-2222-2222-222222222222": { cover_icon: "trophy", cover_color: "red" }, // Comeback Kings
  "33333333-3333-3333-3333-333333333333": { cover_icon: "heart_chat", cover_color: "green" }, // Talk It Out
  "44444444-4444-4444-4444-444444444444": { cover_icon: "microphone", cover_color: "blue" }, // Say It Out Loud
  "55555555-5555-5555-5555-555555555555": { cover_icon: "speech_bubbles", cover_color: "green" }, // Chat Quest
  "66666666-6666-6666-6666-666666666666": { cover_icon: "stacked_blocks", cover_color: "yellow" }, // Team Up Tower
};

/**
 * New games without a cover yet get one from their skill. Covers both the
 * maker side's snake_case skills and the marketplace's skill names.
 */
const BY_SKILL: Record<string, Cover> = {
  negotiation: { cover_icon: "handshake", cover_color: "orange" },
  public_speaking: { cover_icon: "microphone", cover_color: "blue" },
  "public speaking": { cover_icon: "microphone", cover_color: "blue" },
  conversation: { cover_icon: "speech_bubbles", cover_color: "green" },
  "face-to-face conversation": { cover_icon: "speech_bubbles", cover_color: "green" },
  collaboration: { cover_icon: "stacked_blocks", cover_color: "yellow" },
  teamwork: { cover_icon: "stacked_blocks", cover_color: "yellow" },
  conflict_resolution: { cover_icon: "heart_chat", cover_color: "green" },
  "conflict resolution": { cover_icon: "heart_chat", cover_color: "green" },
  empathy: { cover_icon: "heart_chat", cover_color: "red" },
  "active listening": { cover_icon: "ear", cover_color: "blue" },
  patience: { cover_icon: "hourglass", cover_color: "yellow" },
  focus: { cover_icon: "target", cover_color: "red" },
  "handling failure": { cover_icon: "sprout", cover_color: "green" },
  "digital etiquette": { cover_icon: "phone", cover_color: "blue" },
  "decision-making": { cover_icon: "signpost", cover_color: "orange" },
  "self-awareness": { cover_icon: "smile", cover_color: "orange" },
};

export function getCover(game: { id: string; skill: string }): Cover {
  return BY_GAME[game.id] ?? BY_SKILL[game.skill] ?? { cover_icon: "trophy", cover_color: "green" };
}
