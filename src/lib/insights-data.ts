/**
 * Game Insights seed data, shaped exactly like the planned tables
 * (reviews, play_sessions, insight_themes, insight_actions) so it can move
 * into the database later without changing the page.
 */

export type DidItWork = "yes" | "partly" | "no";
export type Sentiment = "positive" | "mixed" | "negative";
export type GradeUsed = "6th" | "7th" | "8th";

export type Review = {
  id: string;
  game_id: string;
  educator_name: string;
  verified_educator: boolean;
  grade_used: GradeUsed;
  class_size: number;
  did_it_work: DidItWork;
  rating: number;
  note: string;
  created_at: string;
};

export type PlaySession = {
  id: string;
  game_id: string;
  grade_band: GradeUsed;
  reached_level: 1 | 2 | 3 | 4;
  completed: boolean;
};

export type InsightTheme = {
  id: string;
  game_id: string;
  theme: string;
  sentiment: Sentiment;
  mention_count: number;
  example_quote: string;
};

export type InsightAction = {
  id: string;
  game_id: string;
  title: string;
  evidence_summary: string;
  priority: 1 | 2 | 3;
};

export const GRADES: GradeUsed[] = ["6th", "7th", "8th"];

const HAGGLE = "11111111-1111-1111-1111-111111111111";

// [name, verified, grade, class size, did it work, rating, note, date]
const REVIEW_ROWS: [string, boolean, GradeUsed, number, DidItWork, number, string, string][] = [
  [
    "Maria Alvarez",
    true,
    "6th",
    24,
    "yes",
    5,
    "My kids loved haggling with the merchant. Lots of laughing and real back-and-forth.",
    "2026-09-08",
  ],
  [
    "James Okafor",
    true,
    "6th",
    28,
    "partly",
    4,
    "Great in pairs, but Level 3 ran long and a few readers got stuck on the merchant's speeches.",
    "2026-09-10",
  ],
  [
    "Priya Natarajan",
    false,
    "6th",
    22,
    "no",
    2,
    "Level 3 text was too hard for my group. We didn't finish in the period.",
    "2026-09-12",
  ],
  [
    "Hannah Weiss",
    true,
    "6th",
    26,
    "yes",
    4,
    "The negotiation scene was a hit. I read Level 3 aloud to help struggling readers.",
    "2026-09-15",
  ],
  [
    "Diego Ramirez",
    true,
    "6th",
    19,
    "yes",
    5,
    "Perfect pairs activity. Students kept using 'meet me in the middle' all week.",
    "2026-09-17",
  ],
  [
    "Aisha Bello",
    false,
    "6th",
    30,
    "partly",
    4,
    "Fun, but Level 3 dragged. I'd love a short debrief prompt at the end.",
    "2026-09-19",
  ],
  [
    "Tom Lindqvist",
    true,
    "6th",
    25,
    "yes",
    4,
    "Solid. Some vocabulary in Level 3 was above grade level.",
    "2026-09-22",
  ],
  [
    "Grace Kim",
    true,
    "7th",
    27,
    "yes",
    5,
    "Students loved the negotiation scene. They wanted to replay it.",
    "2026-09-09",
  ],
  [
    "Marcus Johnson",
    true,
    "7th",
    23,
    "yes",
    5,
    "Worked great in pairs. Even my quiet kids were bargaining.",
    "2026-09-11",
  ],
  [
    "Elena Petrova",
    false,
    "7th",
    29,
    "no",
    3,
    "Level 3 took twice as long as I planned, so we ran out of time.",
    "2026-09-14",
  ],
  [
    "Samuel Osei",
    true,
    "7th",
    21,
    "yes",
    5,
    "Best negotiation practice I've used. The merchant is hilarious.",
    "2026-09-16",
  ],
  [
    "Rachel Cohen",
    true,
    "7th",
    26,
    "partly",
    4,
    "Good, but Level 3 runs too long for a 45-minute period.",
    "2026-09-18",
  ],
  [
    "Kevin Tran",
    true,
    "7th",
    24,
    "yes",
    4,
    "Kids loved the haggling. I added my own debrief questions after.",
    "2026-09-23",
  ],
  [
    "Fatima Haddad",
    false,
    "7th",
    18,
    "yes",
    5,
    "Great pairs energy. Students were negotiating win-win deals by Level 2.",
    "2026-09-25",
  ],
  [
    "Luis Moreno",
    true,
    "7th",
    28,
    "partly",
    3,
    "The middle of Level 3 lost some students. The rest was strong.",
    "2026-09-29",
  ],
  [
    "Nina Patel",
    true,
    "7th",
    22,
    "yes",
    5,
    "The negotiation scene is so well written. Easy win for my class.",
    "2026-10-02",
  ],
  [
    "Beth Sullivan",
    true,
    "8th",
    30,
    "yes",
    5,
    "My 8th graders got competitive in the best way. Loved the market scene.",
    "2026-09-13",
  ],
  [
    "Andre Williams",
    true,
    "8th",
    25,
    "yes",
    5,
    "Worked perfectly in pairs. Would love a wrap-up discussion card.",
    "2026-09-20",
  ],
  [
    "Yuki Tanaka",
    false,
    "8th",
    20,
    "yes",
    4,
    "Level 3 is a little long, but my students stayed engaged.",
    "2026-09-24",
  ],
  [
    "Olivia Brooks",
    true,
    "8th",
    27,
    "yes",
    5,
    "Students loved bargaining with the merchant. Great anchoring practice.",
    "2026-09-27",
  ],
  [
    "Daniel Mensah",
    true,
    "8th",
    23,
    "partly",
    4,
    "Good activity. A debrief prompt would help students reflect on what worked.",
    "2026-09-30",
  ],
  [
    "Sofia Rossi",
    true,
    "8th",
    26,
    "yes",
    5,
    "The negotiation scene had everyone talking. Easy to run.",
    "2026-10-03",
  ],
  [
    "Ben Carter",
    false,
    "8th",
    29,
    "yes",
    4,
    "Fun and quick in pairs. Level 3 runs a bit long.",
    "2026-10-06",
  ],
  [
    "Leah Goldberg",
    true,
    "8th",
    24,
    "yes",
    5,
    "Students asked to play again. The merchant scene is the highlight.",
    "2026-10-08",
  ],
];

const reviews: Review[] = REVIEW_ROWS.map(
  (
    [educator_name, verified_educator, grade_used, class_size, did_it_work, rating, note, date],
    i,
  ) => ({
    id: `rev-${i + 1}`,
    game_id: HAGGLE,
    educator_name,
    verified_educator,
    grade_used,
    class_size,
    did_it_work,
    rating,
    note,
    created_at: `${date}T15:00:00Z`,
  }),
);

// 100 sessions: 8 stop at Level 1, 21 at Level 2, 8 at Level 3, 63 finish Level 4.
const STOPS: [PlaySession["reached_level"], number][] = [
  [1, 8],
  [2, 21],
  [3, 8],
  [4, 63],
];
const playSessions: PlaySession[] = STOPS.flatMap(([level, count]) =>
  Array.from({ length: count }, (_, i) => ({ level, i })),
).map(({ level }, n) => ({
  id: `ps-${n + 1}`,
  game_id: HAGGLE,
  grade_band: GRADES[n % 3] ?? "6th",
  reached_level: level,
  completed: level === 4,
}));

const themes: InsightTheme[] = [
  {
    id: "th-1",
    game_id: HAGGLE,
    theme: "Students loved the negotiation scene",
    sentiment: "positive",
    mention_count: 14,
    example_quote:
      "The negotiation scene had everyone talking. They wanted to replay it. (Grace Kim, 7th grade)",
  },
  {
    id: "th-2",
    game_id: HAGGLE,
    theme: "Level 3 runs too long",
    sentiment: "negative",
    mention_count: 11,
    example_quote:
      "Level 3 took twice as long as I planned, so we ran out of time. (Elena Petrova, 7th grade)",
  },
  {
    id: "th-3",
    game_id: HAGGLE,
    theme: "Great in pairs",
    sentiment: "positive",
    mention_count: 9,
    example_quote:
      "Worked great in pairs. Even my quiet kids were bargaining. (Marcus Johnson, 7th grade)",
  },
  {
    id: "th-4",
    game_id: HAGGLE,
    theme: "Reading level too high in Level 3",
    sentiment: "mixed",
    mention_count: 7,
    example_quote:
      "Level 3 text was too hard for my group. I read it aloud to help. (Hannah Weiss, 6th grade)",
  },
  {
    id: "th-5",
    game_id: HAGGLE,
    theme: "Wanted a debrief prompt",
    sentiment: "mixed",
    mention_count: 6,
    example_quote:
      "A debrief prompt would help students reflect on what worked. (Daniel Mensah, 8th grade)",
  },
];

/** Seeded actions; also the fallback when the AI refresh fails. */
const actions: InsightAction[] = [
  {
    id: "act-1",
    game_id: HAGGLE,
    title: "Shorten or split Level 3",
    evidence_summary:
      "Biggest drop-off (92% to 71%), and 11 of 24 teachers said Level 3 runs too long.",
    priority: 1,
  },
  {
    id: "act-2",
    game_id: HAGGLE,
    title: "Simplify Level 3 dialogue for 6th graders",
    evidence_summary:
      "6th grade has the lowest outcome rate, and 7 teachers flagged the Level 3 reading level.",
    priority: 2,
  },
  {
    id: "act-3",
    game_id: HAGGLE,
    title: "Add a 2-minute class debrief prompt at the end",
    evidence_summary: "6 teachers asked for a debrief prompt to help students reflect.",
    priority: 3,
  },
];

export type GameInsights = {
  reviews: Review[];
  playSessions: PlaySession[];
  themes: InsightTheme[];
  actions: InsightAction[];
};

const BY_GAME: Record<string, GameInsights> = {
  [HAGGLE]: { reviews, playSessions, themes, actions },
};

export function getGameInsights(gameId: string): GameInsights | null {
  return BY_GAME[gameId] ?? null;
}

/** Share of sessions that reached each level, Level 1 to 4. */
export function funnel(sessions: PlaySession[]) {
  const total = sessions.length || 1;
  return ([1, 2, 3, 4] as const).map((level) => ({
    level,
    pct: Math.round((sessions.filter((s) => s.reached_level >= level).length / total) * 100),
  }));
}

/** "Did it work" rate: yes + partly over all reviews. */
export function didItWorkRate(list: Review[]) {
  if (!list.length) return 0;
  return Math.round((list.filter((r) => r.did_it_work !== "no").length / list.length) * 100);
}

export function stats(data: GameInsights) {
  const { reviews: r, playSessions: s } = data;
  return {
    completion: Math.round((s.filter((x) => x.completed).length / (s.length || 1)) * 100),
    didItWork: didItWorkRate(r),
    rating: r.length ? r.reduce((sum, x) => sum + x.rating, 0) / r.length : 0,
    reviewCount: r.length,
    sessionCount: s.length,
  };
}

export function outcomesByGrade(list: Review[]) {
  return GRADES.map((grade) => {
    const inGrade = list.filter((r) => r.grade_used === grade);
    return { grade, pct: didItWorkRate(inGrade), n: inGrade.length };
  });
}
