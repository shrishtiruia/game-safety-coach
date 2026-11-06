import { createServerFn } from "@tanstack/react-start";
import {
  CATEGORIES,
  CATEGORY_INFO,
  FALLBACK_FINDINGS,
  computeOverallResult,
  needsHumanReview,
  type Category,
  type FindingInput,
  type Severity,
} from "./eval-config";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const isCategory = (c: string): c is Category => (CATEGORIES as readonly string[]).includes(c);

/** Creates a new evaluation attempt; on resubmits only re-runs categories that had findings. */
export const startEvaluation = createServerFn({ method: "POST" })
  .inputValidator((d: { gameId: string }) => d)
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: game, error } = await db.from("games").select("*").eq("id", data.gameId).single();
    if (error || !game) throw new Error("Game not found");

    const { data: prev } = await db
      .from("evaluations")
      .select("id, attempt_number")
      .eq("game_id", game.id)
      .order("attempt_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    let categories: Category[] = [...CATEGORIES];
    if (prev) {
      const { data: prevFindings } = await db
        .from("findings")
        .select("category")
        .eq("evaluation_id", prev.id)
        .eq("resolved", false);
      const flagged = [...new Set((prevFindings ?? []).map((f) => f.category))].filter(isCategory);
      if (flagged.length > 0) categories = flagged;
    }

    const { data: evaluation, error: evErr } = await db
      .from("evaluations")
      .insert({
        game_id: game.id,
        attempt_number: (prev?.attempt_number ?? 0) + 1,
        status: "running",
        categories_run: categories,
      })
      .select()
      .single();
    if (evErr || !evaluation) throw new Error("Could not start evaluation");

    await db.from("games").update({ status: "in_review" }).eq("id", game.id);
    return { evaluationId: evaluation.id, attempt: evaluation.attempt_number, categories };
  });

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

async function askJson(system: string, user: string): Promise<unknown> {
  const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
  const res = await withTimeout(
    generateChatCompletion({
      model: "openai/gpt-6-astra",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
    60000,
  );
  const content = res.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("empty");
  return JSON.parse(content);
}

const SEVERITIES: Severity[] = ["must_fix", "should_fix", "suggestion"];

function cleanFindings(raw: unknown): FindingInput[] {
  const list = (raw as { findings?: unknown[] })?.findings;
  if (!Array.isArray(list)) return [];
  return list
    .map((f) => f as Record<string, unknown>)
    .filter((f) => typeof f.evidence === "string" && f.evidence.trim().length > 0)
    .filter((f) => SEVERITIES.includes(f.severity as Severity) && typeof f.title === "string")
    .map((f) => ({
      severity: f.severity as Severity,
      title: String(f.title),
      evidence: String(f.evidence),
      why_it_matters: String(f.why_it_matters ?? ""),
      suggested_fix: String(f.suggested_fix ?? ""),
      confidence: Math.max(0, Math.min(1, Number(f.confidence ?? 0.5))),
    }));
}

/** Runs one category check: focused rubric call, evidence filter, then verification pass. */
export const runCheck = createServerFn({ method: "POST" })
  .inputValidator((d: { evaluationId: string; category: string }) => d)
  .handler(async ({ data }) => {
    if (!isCategory(data.category)) throw new Error("Unknown category");
    const category = data.category;
    const db = await admin();
    const { data: ev } = await db
      .from("evaluations")
      .select("id, attempt_number, game_id")
      .eq("id", data.evaluationId)
      .single();
    if (!ev) throw new Error("Evaluation not found");
    const { data: game } = await db.from("games").select("*").eq("id", ev.game_id).single();
    if (!game) throw new Error("Game not found");

    const info = CATEGORY_INFO[category];
    const gameText = `Title: ${game.title}\nMaker: ${game.maker_name}\nSkill: ${game.skill}\nGrade band: ${game.grade_band}\nDuration: ${game.duration_minutes} min\nFormat: ${game.format}\nGame content:\n${game.description}`;

    let findings: FindingInput[] = [];
    let source: "ai" | "fallback" = "ai";
    try {
      const raw = await askJson(
        `You review classroom soft-skills games for grades ${game.grade_band}. Check ONLY this category: ${info.label}.
Rubric: ${info.rubric}
Return JSON {"findings":[{"severity":"must_fix|should_fix|suggestion","title":"short, friendly","evidence":"exact quote or location in the game, e.g. 'Level 3, NPC dialogue'","why_it_matters":"one line","suggested_fix":"one concrete fix","confidence":0-1}]}.
Only report issues supported by the game content. Every finding MUST cite evidence. Return {"findings":[]} if nothing applies.`,
        gameText,
      );
      findings = cleanFindings(raw);

      if (findings.length > 0) {
        const verdict = await askJson(
          `You double-check flagged issues in a classroom game. For each numbered finding answer: is this a real problem given the game content? Return JSON {"results":[{"index":0,"real":true,"confidence":0-1}]}.`,
          `${gameText}\n\nFindings:\n${findings.map((f, i) => `${i}. [${f.severity}] ${f.title} — evidence: ${f.evidence}`).join("\n")}`,
        );
        const results = (verdict as { results?: { index: number; real: boolean; confidence?: number }[] })
          .results;
        if (Array.isArray(results)) {
          findings = findings
            .map((f, i) => {
              const r = results.find((x) => x.index === i);
              if (!r) return f;
              if (!r.real) return null;
              return { ...f, confidence: Math.min(f.confidence, Number(r.confidence ?? f.confidence)) };
            })
            .filter((f): f is FindingInput => f !== null);
        }
      }
    } catch (e) {
      console.error("AI check failed, using fallback", category, e);
      source = "fallback";
      findings = ev.attempt_number === 1 ? (FALLBACK_FINDINGS[game.title]?.[category] ?? []) : [];
    }

    if (findings.length > 0) {
      await db.from("findings").insert(
        findings.map((f) => ({
          evaluation_id: ev.id,
          category,
          ...f,
          human_review: needsHumanReview(f),
        })),
      );
    }
    return { category, count: findings.length, source };
  });

/** Computes the overall result and updates the game status. */
export const finalizeEvaluation = createServerFn({ method: "POST" })
  .inputValidator((d: { evaluationId: string }) => d)
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: ev } = await db.from("evaluations").select("*").eq("id", data.evaluationId).single();
    if (!ev) throw new Error("Evaluation not found");
    const { data: findings } = await db
      .from("findings")
      .select("severity")
      .eq("evaluation_id", ev.id);
    const result = computeOverallResult((findings ?? []) as { severity: Severity }[]);

    // Earlier findings in re-checked categories are now superseded.
    const { data: older } = await db
      .from("evaluations")
      .select("id")
      .eq("game_id", ev.game_id)
      .lt("attempt_number", ev.attempt_number);
    if (older && older.length) {
      await db
        .from("findings")
        .update({ resolved: true })
        .in(
          "evaluation_id",
          older.map((o) => o.id),
        );
    }

    await db.from("evaluations").update({ status: "complete", overall_result: result }).eq("id", ev.id);
    await db.from("games").update({ status: result }).eq("id", ev.game_id);
    return { result };
  });

/** Maker edits their game and sends it back for checks. */
export const resubmitGame = createServerFn({ method: "POST" })
  .inputValidator((d: { gameId: string; description: string; durationMinutes: number }) => d)
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db
      .from("games")
      .update({
        description: data.description.slice(0, 5000),
        duration_minutes: Math.max(1, Math.min(180, Math.round(data.durationMinutes))),
        status: "submitted",
      })
      .eq("id", data.gameId);
    if (error) throw new Error("Could not resubmit");
    return { ok: true };
  });
