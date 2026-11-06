import type { Tables } from "@/integrations/supabase/types";

/**
 * Sample live games that exist only in code (not in the database yet),
 * so the library and insights show a realistic portfolio of 4 live games.
 * They can't be safety-checked or edited until they're real database rows.
 */
export const SAMPLE_GAMES: (Tables<"games"> & { hosted_url: string })[] = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Say It Out Loud",
    hosted_url: "https://play.skillplay.example/say-it-out-loud",
    maker_name: "Bright Byte Studio",
    skill: "public_speaking",
    grade_band: "6-8",
    duration_minutes: 20,
    format: "whole_class",
    description:
      "Students take turns giving 30-second talks on silly prompts, building up to a 2-minute speech with a partner giving feedback.",
    status: "approved",
    created_at: "2026-08-20T15:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    title: "Chat Quest",
    hosted_url: "https://play.skillplay.example/chat-quest",
    maker_name: "Bright Byte Studio",
    skill: "conversation",
    grade_band: "6-8",
    duration_minutes: 15,
    format: "pairs",
    description:
      "Partners travel a quest map, unlocking each stop by keeping a conversation going: asking follow-up questions, listening, and sharing.",
    status: "approved",
    created_at: "2026-08-25T15:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    title: "Team Up Tower",
    hosted_url: "https://play.skillplay.example/team-up-tower",
    maker_name: "Bright Byte Studio",
    skill: "collaboration",
    grade_band: "6-8",
    duration_minutes: 25,
    format: "whole_class",
    description:
      "Small groups each get a role card and build a paper tower together across three timed rounds, then reflect on how they worked as a team.",
    status: "approved",
    created_at: "2026-09-01T15:00:00Z",
  },
];

export const isSampleGame = (id: string) => SAMPLE_GAMES.some((g) => g.id === id);
