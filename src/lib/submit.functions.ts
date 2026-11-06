import { createServerFn } from "@tanstack/react-start";
import { FORMAT_LABEL, SKILL_LABEL } from "./eval-config";

export type NewGame = {
  title: string;
  makerName: string;
  skill: string;
  gradeBand: string;
  durationMinutes: number;
  format: string;
  description: string;
};

export const GRADE_BANDS = ["3-5", "6-8", "9-12"] as const;

/** Step 1 of the submit flow: saves the game as a draft, ready for its safety check. */
export const createGame = createServerFn({ method: "POST" })
  .inputValidator((d: NewGame) => {
    const title = d.title.trim().slice(0, 120);
    const makerName = d.makerName.trim().slice(0, 120);
    const description = d.description.trim().slice(0, 5000);
    if (!title || !makerName || !description) throw new Error("Please fill in every field");
    if (!(d.skill in SKILL_LABEL)) throw new Error("Unknown skill");
    if (!(d.format in FORMAT_LABEL)) throw new Error("Unknown format");
    if (!(GRADE_BANDS as readonly string[]).includes(d.gradeBand))
      throw new Error("Unknown grade band");
    return {
      ...d,
      title,
      makerName,
      description,
      durationMinutes: Math.max(1, Math.min(180, Math.round(d.durationMinutes))),
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: game, error } = await db
      .from("games")
      .insert({
        title: data.title,
        maker_name: data.makerName,
        skill: data.skill,
        grade_band: data.gradeBand,
        duration_minutes: data.durationMinutes,
        format: data.format,
        description: data.description,
        status: "submitted",
      })
      .select("id")
      .single();
    if (error || !game) throw new Error("Could not save your game");
    return { id: game.id };
  });
