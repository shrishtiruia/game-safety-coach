import { createServerFn } from "@tanstack/react-start";
import {
  funnel,
  getGameInsights,
  outcomesByGrade,
  stats,
  type InsightAction,
  type InsightRequest,
} from "./insights-data";

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

function cleanActions(raw: unknown, gameId: string, requests: InsightRequest[]): InsightAction[] {
  const list = (raw as { actions?: unknown[] })?.actions;
  if (!Array.isArray(list)) return [];
  return list
    .map((a) => a as Record<string, unknown>)
    .filter((a) => typeof a["title"] === "string" && typeof a["evidence_summary"] === "string")
    .slice(0, 3)
    .map((a, i) => {
      const requestTitle = typeof a["request_title"] === "string" ? a["request_title"] : "";
      const request = requests.find((r) => r.title === requestTitle);
      return {
        id: `ai-${i + 1}`,
        game_id: gameId,
        title: String(a["title"]).trim(),
        evidence_summary: String(a["evidence_summary"]).trim(),
        why_it_matters: String(a["why_it_matters"] ?? "").trim(),
        priority: (i + 1) as 1 | 2 | 3,
        ...(request ? { request_id: request.id } : {}),
      };
    });
}

/** Top 3 improvements from review themes and funnel data; falls back to the seeded actions. */
export const refreshInsights = createServerFn({ method: "POST" })
  .inputValidator((d: { gameId: string }) => d)
  .handler(async ({ data }) => {
    const insights = getGameInsights(data.gameId);
    if (!insights) throw new Error("No insights for this game");
    const fallback = { actions: insights.actions, source: "fallback" as const };

    const s = stats(insights);
    const summary = [
      `Reviews: ${s.reviewCount} teachers. Did it work (yes or partly): ${s.didItWork}%. Average rating ${s.rating.toFixed(1)}/5.`,
      `Funnel (share of sessions reaching each level): ${funnel(insights.playSessions)
        .map((f) => `Level ${f.level} ${f.pct}%`)
        .join(", ")}.`,
      `Did-it-work rate by grade: ${outcomesByGrade(insights.reviews)
        .map((g) => `${g.grade} ${g.pct}% (${g.n} reviews)`)
        .join(", ")}.`,
      `Review themes: ${insights.themes
        .map((t) => `"${t.theme}" (${t.sentiment}, ${t.mention_count} mentions)`)
        .join("; ")}.`,
      `Teacher requests: ${insights.requests
        .map((r) => `"${r.title}" (${r.request_count} teachers)`)
        .join("; ")}.`,
      `Current rank: #${insights.meta.rank.position} in ${insights.meta.rank.category}. Ranking factors: teacher ratings, did-it-work rate, completion rate, how recently the game was updated.`,
    ].join("\n");

    try {
      const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
      const res = await withTimeout(
        generateChatCompletion({
          model: "openai/gpt-6-astra",
          messages: [
            {
              role: "system",
              content: `You coach makers of classroom soft-skills games. From the data, pick the 3 most valuable improvements, most important first. Return JSON {"actions":[{"title","evidence_summary","why_it_matters","request_title"}]}. title: a short imperative action (under 60 characters). evidence_summary: one sentence citing specific numbers from the data (for example "11 of 24 teachers said Level 3 runs too long"). why_it_matters: one sentence naming the ranking factor it affects and an estimated effect (for example "Completion rate affects ranking. Estimated to move you up 1-2 spots."). request_title: the exact title of a matching teacher request, or "" if none. Only use numbers that appear in the data.`,
            },
            { role: "user", content: summary },
          ],
          response_format: { type: "json_object" },
        }),
        30000,
      );
      const content = res.choices?.[0]?.message?.content;
      if (typeof content !== "string") return fallback;
      const actions = cleanActions(JSON.parse(content), data.gameId, insights.requests);
      return actions.length === 3 ? { actions, source: "ai" as const } : fallback;
    } catch (e) {
      console.error("refreshInsights fell back to seeded actions", e);
      return fallback;
    }
  });
