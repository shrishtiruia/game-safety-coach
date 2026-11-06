import { createServerFn } from "@tanstack/react-start";
import { FORMAT_LABEL, SKILL_LABEL } from "./eval-config";
import { COVER_ICON_HINTS, isCoverColor, isCoverIcon } from "./game-covers";

export type NewGame = {
  title: string;
  makerName: string;
  skill: string;
  gradeBand: string;
  durationMinutes: number;
  format: string;
  description: string;
  hostedUrl: string;
  coverIcon: string;
  coverColor: string;
};

export const GRADE_BANDS = ["3-5", "6-8", "9-12"] as const;

const isHttpUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/**
 * Saves columns that Lovable adds in a later migration (hosted_url, file_sha256,
 * reviewed_at). Best-effort: until the columns exist this logs and moves on.
 */
async function saveExtraColumns(gameId: string, values: Record<string, string>) {
  const db = await admin();
  const { error } = await db
    .from("games")
    .update(values as never)
    .eq("id", gameId);
  if (error) console.warn("Skipped saving", Object.keys(values).join(", "), "-", error.message);
}

/** Details step: saves the game as a draft, ready for its safety check. The uploaded file is never sent here. */
export const createGame = createServerFn({ method: "POST" })
  .inputValidator((d: NewGame) => {
    const title = d.title.trim().slice(0, 120);
    const makerName = d.makerName.trim().slice(0, 120);
    const description = d.description.trim().slice(0, 1000);
    const hostedUrl = d.hostedUrl.trim().slice(0, 500);
    if (!title || !makerName || !description) throw new Error("Please fill in every field");
    if (!isHttpUrl(hostedUrl)) throw new Error("Please add the link where your game is hosted");
    if (!isCoverIcon(d.coverIcon) || !isCoverColor(d.coverColor)) throw new Error("Unknown cover");
    if (!(d.skill in SKILL_LABEL)) throw new Error("Unknown skill");
    if (!(d.format in FORMAT_LABEL)) throw new Error("Unknown format");
    if (!(GRADE_BANDS as readonly string[]).includes(d.gradeBand))
      throw new Error("Unknown grade band");
    return {
      ...d,
      title,
      makerName,
      description,
      hostedUrl,
      durationMinutes: Math.max(1, Math.min(180, Math.round(d.durationMinutes))),
    };
  })
  .handler(async ({ data }) => {
    const db = await admin();
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
    // Saved separately so one missing column doesn't block the other.
    await saveExtraColumns(game.id, { hosted_url: data.hostedUrl });
    await saveExtraColumns(game.id, { cover_icon: data.coverIcon, cover_color: data.coverColor });
    return { id: game.id };
  });

/** After a check finishes: keep only the file's SHA-256 fingerprint and when it was reviewed. */
export const recordReview = createServerFn({ method: "POST" })
  .inputValidator((d: { gameId: string; sha256: string }) => {
    if (!/^[a-f0-9]{64}$/.test(d.sha256)) throw new Error("Bad fingerprint");
    return d;
  })
  .handler(async ({ data }) => {
    await saveExtraColumns(data.gameId, {
      file_sha256: data.sha256,
      reviewed_at: new Date().toISOString(),
    });
    return { ok: true };
  });

export type DetailSuggestions = Partial<{
  title: string;
  description: string;
  skill: string;
  gradeBand: string;
  format: string;
  durationMinutes: number;
  coverIcon: string;
}>;

/** Suggests Details fields from the text extracted in the browser. Returns {} if the AI call fails. */
export const suggestDetails = createServerFn({ method: "POST" })
  .inputValidator((d: { content: string; fileName: string }) => ({
    content: String(d.content ?? "").slice(0, 12_000),
    fileName: String(d.fileName ?? "").slice(0, 200),
  }))
  .handler(async ({ data }): Promise<DetailSuggestions> => {
    try {
      const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
      const res = await Promise.race([
        generateChatCompletion({
          model: "openai/gpt-6-astra",
          messages: [
            {
              role: "system",
              content: `You read the text of a classroom soft-skills web game and suggest its listing details. Return JSON {"title","description","skill","grade_band","format","duration_minutes","cover_icon"}. description: one or two plain sentences on how it plays. skill: one of ${Object.keys(SKILL_LABEL).join(" | ")}. grade_band: one of ${GRADE_BANDS.join(" | ")}. format: one of ${Object.keys(FORMAT_LABEL).join(" | ")}. duration_minutes: a whole number. cover_icon: the thumbnail icon that best fits the game, one of: ${Object.entries(
                COVER_ICON_HINTS,
              )
                .map(([k, v]) => `${k} (${v})`)
                .join(", ")}. Use "" for anything you can't tell.`,
            },
            { role: "user", content: `File: ${data.fileName}\n${data.content}` },
          ],
          response_format: { type: "json_object" },
        }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 20_000)),
      ]);
      const raw = JSON.parse(res.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>;
      const out: DetailSuggestions = {};
      const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
      if (str(raw["title"])) out.title = str(raw["title"]).slice(0, 120);
      if (str(raw["description"])) out.description = str(raw["description"]).slice(0, 600);
      if (str(raw["skill"]) in SKILL_LABEL) out.skill = str(raw["skill"]);
      if ((GRADE_BANDS as readonly string[]).includes(str(raw["grade_band"])))
        out.gradeBand = str(raw["grade_band"]);
      if (str(raw["format"]) in FORMAT_LABEL) out.format = str(raw["format"]);
      const mins = Math.round(Number(raw["duration_minutes"]));
      if (mins > 0 && mins <= 180) out.durationMinutes = mins;
      if (isCoverIcon(raw["cover_icon"])) out.coverIcon = raw["cover_icon"];
      return out;
    } catch (e) {
      console.error("suggestDetails failed; leaving fields empty", e);
      return {};
    }
  });
