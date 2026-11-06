export type Severity = "must_fix" | "should_fix" | "suggestion";
export type OverallResult = "approved" | "approved_with_notes" | "needs_changes";
export type GameStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "approved_with_notes"
  | "needs_changes";

export const CATEGORIES = [
  "content_safety",
  "age_fit",
  "privacy",
  "ads_spending",
  "contact_social",
  "learning_fit",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<Category, { label: string; short: string; rubric: string }> = {
  content_safety: {
    label: "Content safety",
    short: "Hate, violence, profanity",
    rubric:
      "Hate or harassment, violence, sexual content, profanity, self-harm themes, and humor that targets bodies, appearance, identity or groups. Anything that mocks a student's body or appearance is must_fix.",
  },
  age_fit: {
    label: "Age fit",
    short: "Reading level, themes, tone",
    rubric:
      "Reading level, themes and tone vs the claimed grade band. Text noticeably above the band is should_fix; mature themes are must_fix.",
  },
  privacy: {
    label: "Privacy and data",
    short: "Personal info, accounts, trackers",
    rubric:
      "Collection of personal info (names, schools, emails, photos, location), required accounts, trackers or analytics. Identifying a minor (e.g. full name + school) is should_fix or must_fix if public.",
  },
  ads_spending: {
    label: "Ads and spending",
    short: "Ads, purchases, dark patterns",
    rubric:
      "Ads, in-app purchases, loot boxes, manipulative design (streak pressure, fake urgency). Any purchase flow is must_fix.",
  },
  contact_social: {
    label: "Contact and social",
    short: "Chat, user content, outbound links",
    rubric:
      "Open chat with strangers (must_fix), user-generated content shared publicly, outbound links that leave the game (should_fix).",
  },
  learning_fit: {
    label: "Learning fit",
    short: "Objective, bias, duration",
    rubric:
      "Clear soft-skill objective, no stereotypes or bias, and whether the stated duration seems accurate. Missing objective or stereotypes are should_fix; pacing or reflection ideas are suggestions.",
  },
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  must_fix: "Must fix",
  should_fix: "Should fix",
  suggestion: "Suggestion",
};

/** Overall result: any must_fix → needs_changes; any other finding → approved_with_notes; else approved. */
export function computeOverallResult(findings: { severity: Severity }[]): OverallResult {
  if (findings.some((f) => f.severity === "must_fix")) return "needs_changes";
  if (findings.length > 0) return "approved_with_notes";
  return "approved";
}

/** Low-confidence must_fix findings go to a human instead of an automatic verdict. */
export const HUMAN_REVIEW_THRESHOLD = 0.7;
export function needsHumanReview(f: { severity: Severity; confidence: number }) {
  return f.severity === "must_fix" && f.confidence < HUMAN_REVIEW_THRESHOLD;
}

export const SKILL_LABEL: Record<string, string> = {
  negotiation: "Negotiation",
  public_speaking: "Public speaking",
  conversation: "Conversation",
  collaboration: "Collaboration",
  conflict_resolution: "Conflict resolution",
};
export const FORMAT_LABEL: Record<string, string> = {
  solo: "Solo",
  pairs: "Pairs",
  whole_class: "Whole class",
};

export type FindingInput = {
  severity: Severity;
  title: string;
  evidence: string;
  why_it_matters: string;
  suggested_fix: string;
  confidence: number;
};

/** Demo fallback results used when the AI call fails or times out (first attempt only). */
export const FALLBACK_FINDINGS: Record<string, Partial<Record<Category, FindingInput[]>>> = {
  "Haggle Hero": {
    age_fit: [
      {
        severity: "should_fix",
        title: "Level 3 dialogue reads above 7th grade",
        evidence: "Level 3, merchant counter-offer text",
        why_it_matters: "Struggling readers may tune out right when the negotiation gets interesting.",
        suggested_fix: "Shorten sentences and swap complex words for everyday ones.",
        confidence: 0.86,
      },
    ],
    contact_social: [
      {
        severity: "should_fix",
        title: '"Learn more" link leaves the game',
        evidence: "End screen, footer link",
        why_it_matters: "Students can wander to an external site without a teacher knowing.",
        suggested_fix: "Remove the link or move it to a teacher-only info page.",
        confidence: 0.9,
      },
    ],
    learning_fit: [
      {
        severity: "suggestion",
        title: "Pacing suggests 20 minutes, not 15",
        evidence: "Game listing, stated duration",
        why_it_matters: "Teachers plan tight periods around your time estimate.",
        suggested_fix: "Update the duration to 20 minutes or trim a level.",
        confidence: 0.7,
      },
    ],
  },
  "Comeback Kings": {
    content_safety: [
      {
        severity: "must_fix",
        title: "Roast cards mock appearance and weight",
        evidence: "Round 2, 'roast' prompt cards 4 and 7",
        why_it_matters: "Body-based jokes can hurt students and invite bullying.",
        suggested_fix: "Rewrite cards to playfully challenge ideas or choices, never bodies or looks.",
        confidence: 0.93,
      },
    ],
    privacy: [
      {
        severity: "should_fix",
        title: "Leaderboard asks for name and school",
        evidence: "Join screen",
        why_it_matters: "Pairing a name with a school identifies a minor.",
        suggested_fix: "Use auto-generated nicknames and drop the school field.",
        confidence: 0.88,
      },
    ],
    learning_fit: [
      {
        severity: "suggestion",
        title: "Add a reflection step",
        evidence: "After Round 2",
        why_it_matters: "Helps students connect banter to respectful disagreement.",
        suggested_fix: 'Add a 2-minute "how did that land?" discussion card.',
        confidence: 0.75,
      },
    ],
  },
};
