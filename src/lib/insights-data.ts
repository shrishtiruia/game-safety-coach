/**
 * Game Insights seed data, shaped like the planned tables
 * (reviews, play_sessions, insight_themes, insight_requests, insight_actions)
 * so it can move into the database later without changing the pages.
 * Rank, badges and past updates are seeded sample data.
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

export type InsightRequest = {
  id: string;
  game_id: string;
  title: string;
  request_count: number;
  example_quote: string;
};

export type InsightAction = {
  id: string;
  game_id: string;
  title: string;
  evidence_summary: string;
  /** Which ranking factor it affects and the estimated effect. Always an estimate. */
  why_it_matters: string;
  priority: 1 | 2 | 3;
  /** Set when the fix matches a teacher request. */
  request_id?: string;
};

export type GameMeta = {
  rank: { position: number; category: string };
  /** At most two are shown. */
  badges: string[];
  pastUpdate?: {
    title: string;
    date: string;
    before: { completion: number; rank: number };
    after: { completion: number; rank: number };
  };
  /** Order in "Which game to improve first"; reason null means the game is doing great. */
  improve: { order: number; reason: string | null };
};

export type GameInsights = {
  reviews: Review[];
  playSessions: PlaySession[];
  themes: InsightTheme[];
  requests: InsightRequest[];
  actions: InsightAction[];
  meta: GameMeta;
};

export const GRADES: GradeUsed[] = ["6th", "7th", "8th"];

const HAGGLE = "11111111-1111-1111-1111-111111111111";
const SAY_IT = "44444444-4444-4444-4444-444444444444";
const CHAT_QUEST = "55555555-5555-5555-5555-555555555555";
const TEAM_UP = "66666666-6666-6666-6666-666666666666";

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

const HAGGLE_REVIEWS: Review[] = REVIEW_ROWS.map(
  (
    [educator_name, verified_educator, grade_used, class_size, did_it_work, rating, note, date],
    i,
  ) => ({
    id: `hh-rev-${i + 1}`,
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

const EDUCATORS = [
  "Maya Chen",
  "Jordan Ellis",
  "Carmen Diaz",
  "Ravi Shah",
  "Emily Foster",
  "Kwame Asante",
  "Laura Bennett",
  "Omar Farouk",
  "Sarah Lindgren",
  "Tyler Brooks",
  "Ana Ruiz",
  "David Kim",
  "Jasmine Wright",
  "Noah Fischer",
  "Priya Menon",
  "Chris Doyle",
  "Zoe Martin",
  "Hiro Sato",
  "Grace Owens",
  "Mateo Silva",
  "Rebecca Stone",
  "Ibrahim Yusuf",
  "Claire Dubois",
  "Ethan Park",
  "Lucia Romano",
  "Marcus Hill",
  "Nadia Petrov",
  "Sam Whitaker",
  "Imani Cole",
  "Felix Wagner",
  "Hannah Lee",
  "Andre Moreau",
  "Keisha Grant",
  "Ben Novak",
  "Elena Garcia",
  "Owen Murphy",
  "Aisha Rahman",
  "Paul Jensen",
  "Mia Torres",
  "Victor Nguyen",
];

type GradeMix = { n: number; partly: number; no: number };

/**
 * Builds a game's reviews from exact counts so the headline numbers hold:
 * per grade, how many said partly / no (the rest said yes), and the full set of
 * star ratings, which go lowest to the "no" reviews and highest to the "yes" ones.
 */
function buildReviews(
  gameId: string,
  prefix: string,
  seed: number,
  mix: Record<GradeUsed, GradeMix>,
  ratings: number[],
  notes: Record<DidItWork, string[]>,
): Review[] {
  const rows = GRADES.flatMap((grade) => {
    const { n, partly, no } = mix[grade];
    return Array.from({ length: n }, (_, i): [GradeUsed, DidItWork] => [
      grade,
      i < no ? "no" : i < no + partly ? "partly" : "yes",
    ]);
  });
  const order: Record<DidItWork, number> = { no: 0, partly: 1, yes: 2 };
  const byOutcome = rows.map((r, i) => i).sort((a, b) => order[rows[a]![1]] - order[rows[b]![1]]);
  const sortedRatings = [...ratings].sort((a, b) => a - b);
  const ratingFor = new Map(byOutcome.map((rowIndex, k) => [rowIndex, sortedRatings[k] ?? 4]));
  const used: Record<DidItWork, number> = { yes: 0, partly: 0, no: 0 };

  return rows.map(([grade, outcome], i) => {
    const pool = notes[outcome];
    const note = pool[used[outcome]++ % pool.length] ?? "";
    const day = new Date(Date.UTC(2026, 8, 3 + ((i * 3 + seed) % 58)));
    return {
      id: `${prefix}-rev-${i + 1}`,
      game_id: gameId,
      educator_name: EDUCATORS[(i * 7 + seed * 11) % EDUCATORS.length] ?? "A teacher",
      verified_educator: (i + seed) % 4 !== 2,
      grade_used: grade,
      class_size: 18 + ((i * 5 + seed * 3) % 13),
      did_it_work: outcome,
      rating: ratingFor.get(i) ?? 4,
      note,
      created_at: day.toISOString(),
    };
  });
}

/** Sessions that stopped at Level 1, 2, 3, or finished Level 4. */
function buildSessions(gameId: string, prefix: string, stops: [number, number, number, number]) {
  return stops
    .flatMap((count, li) =>
      Array.from({ length: count }, () => (li + 1) as PlaySession["reached_level"]),
    )
    .map((level, n): PlaySession => ({
      id: `${prefix}-ps-${n + 1}`,
      game_id: gameId,
      grade_band: GRADES[n % 3] ?? "6th",
      reached_level: level,
      completed: level === 4,
    }));
}

const rep = (n: number, v: number) => Array.from({ length: n }, () => v);

const BY_GAME: Record<string, GameInsights> = {
  // Haggle Hero: rating 4.3, completion 63%, did-it-work 92%.
  [HAGGLE]: {
    reviews: HAGGLE_REVIEWS,
    playSessions: buildSessions(HAGGLE, "hh", [8, 21, 8, 63]),
    themes: [
      {
        id: "hh-th-1",
        game_id: HAGGLE,
        theme: "Students loved the negotiation scene",
        sentiment: "positive",
        mention_count: 14,
        example_quote:
          "The negotiation scene had everyone talking. They wanted to replay it. (Grace Kim, 7th grade)",
      },
      {
        id: "hh-th-2",
        game_id: HAGGLE,
        theme: "Level 3 runs too long",
        sentiment: "negative",
        mention_count: 11,
        example_quote:
          "Level 3 took twice as long as I planned, so we ran out of time. (Elena Petrova, 7th grade)",
      },
      {
        id: "hh-th-3",
        game_id: HAGGLE,
        theme: "Great in pairs",
        sentiment: "positive",
        mention_count: 9,
        example_quote:
          "Worked great in pairs. Even my quiet kids were bargaining. (Marcus Johnson, 7th grade)",
      },
      {
        id: "hh-th-4",
        game_id: HAGGLE,
        theme: "Reading level too high in Level 3",
        sentiment: "mixed",
        mention_count: 7,
        example_quote:
          "Level 3 text was too hard for my group. I read it aloud to help. (Hannah Weiss, 6th grade)",
      },
    ],
    requests: [
      {
        id: "hh-rq-1",
        game_id: HAGGLE,
        title: "Add a 2-minute class debrief",
        request_count: 6,
        example_quote:
          "A debrief prompt would help students reflect on what worked. (Daniel Mensah, 8th grade)",
      },
      {
        id: "hh-rq-2",
        game_id: HAGGLE,
        title: "Printable merchant cards",
        request_count: 4,
        example_quote:
          "I'd love paper versions of the merchant offers for my no-device days. (Aisha Bello, 6th grade)",
      },
      {
        id: "hh-rq-3",
        game_id: HAGGLE,
        title: "Answer key of good deals",
        request_count: 3,
        example_quote:
          "A quick key of fair deals would help me coach pairs. (Tom Lindqvist, 6th grade)",
      },
    ],
    actions: [
      {
        id: "hh-act-1",
        game_id: HAGGLE,
        priority: 1,
        title: "Split Level 3 into two shorter rounds",
        evidence_summary:
          "Still the biggest drop-off (92% to 71%), and 11 of 24 teachers say Level 3 runs long.",
        why_it_matters: "Completion rate affects ranking. Estimated to move you up 1-2 spots.",
      },
      {
        id: "hh-act-2",
        game_id: HAGGLE,
        priority: 2,
        title: "Simplify Level 3 dialogue for 6th graders",
        evidence_summary:
          "6th grade has the lowest did-it-work rate (86%), and 7 teachers flagged the reading level.",
        why_it_matters: "Did-it-work rate affects ranking. Estimated to help hold your #4 spot.",
      },
      {
        id: "hh-act-3",
        game_id: HAGGLE,
        priority: 3,
        title: "Add a 2-minute class debrief at the end",
        evidence_summary: "The most-requested addition from teachers.",
        why_it_matters: "Teacher ratings affect ranking. Estimated small rating lift.",
        request_id: "hh-rq-1",
      },
    ],
    meta: {
      rank: { position: 4, category: "Negotiation, Grades 6-8" },
      badges: ["Improved this month"],
      pastUpdate: {
        title: "Level 3 shortened",
        date: "Oct 14",
        before: { completion: 54, rank: 6 },
        after: { completion: 63, rank: 4 },
      },
      improve: { order: 2, reason: "Level 3 runs long and reads above grade level" },
    },
  },

  // Say It Out Loud: rating 4.6, completion 82%, did-it-work 95%. Doing great.
  [SAY_IT]: {
    reviews: buildReviews(
      SAY_IT,
      "sio",
      2,
      {
        "6th": { n: 7, partly: 1, no: 0 },
        "7th": { n: 7, partly: 1, no: 1 },
        "8th": { n: 6, partly: 0, no: 0 },
      },
      [3, ...rep(6, 4), ...rep(13, 5)],
      {
        yes: [
          "My shyest students were volunteering by the third round.",
          "Zero prep and the kids begged to keep going.",
          "The silly prompts take the pressure off. Great warm-up for speeches.",
          "Partner feedback cards are fantastic. Kids were kind and specific.",
          "Best public speaking activity I've used with this age group.",
        ],
        partly: ["Great overall, but a couple of anxious students needed a way to opt out."],
        no: ["Two of my students froze. I'd like a record-it option for them."],
      },
    ),
    playSessions: buildSessions(SAY_IT, "sio", [5, 6, 7, 82]),
    themes: [
      {
        id: "sio-th-1",
        game_id: SAY_IT,
        theme: "Kids got braver every round",
        sentiment: "positive",
        mention_count: 12,
        example_quote:
          "My shyest students were volunteering by the third round. (Maya Chen, 7th grade)",
      },
      {
        id: "sio-th-2",
        game_id: SAY_IT,
        theme: "Easy to run with no prep",
        sentiment: "positive",
        mention_count: 9,
        example_quote: "Zero prep and the kids begged to keep going. (Ravi Shah, 6th grade)",
      },
      {
        id: "sio-th-3",
        game_id: SAY_IT,
        theme: "Shy students needed an opt-out",
        sentiment: "mixed",
        mention_count: 5,
        example_quote:
          "A couple of anxious students needed a way to opt out. (Laura Bennett, 7th grade)",
      },
    ],
    requests: [
      {
        id: "sio-rq-1",
        game_id: SAY_IT,
        title: "Record instead of presenting live",
        request_count: 5,
        example_quote: "Let anxious kids record their talk first. (Laura Bennett, 7th grade)",
      },
      {
        id: "sio-rq-2",
        game_id: SAY_IT,
        title: "A 10-minute version for advisory",
        request_count: 4,
        example_quote:
          "I only have 10 minutes in advisory. A short mode would be perfect. (Kwame Asante, 8th grade)",
      },
      {
        id: "sio-rq-3",
        game_id: SAY_IT,
        title: "Simple grading rubric",
        request_count: 3,
        example_quote:
          "A 3-point rubric would help me grade the final speech. (Emily Foster, 6th grade)",
      },
    ],
    actions: [
      {
        id: "sio-act-1",
        game_id: SAY_IT,
        priority: 1,
        title: "Add a record-first option for shy students",
        evidence_summary:
          "5 teachers asked for it, and the only 'didn't work' review mentions students freezing.",
        why_it_matters: "Did-it-work rate affects ranking. Estimated to help protect your #2 spot.",
        request_id: "sio-rq-1",
      },
      {
        id: "sio-act-2",
        game_id: SAY_IT,
        priority: 2,
        title: "Offer a 10-minute short mode",
        evidence_summary: "4 teachers want to use it in shorter advisory periods.",
        why_it_matters: "Recent updates affect ranking. Estimated small boost from a fresh update.",
        request_id: "sio-rq-2",
      },
      {
        id: "sio-act-3",
        game_id: SAY_IT,
        priority: 3,
        title: "Add sentence starters to Level 1",
        evidence_summary: "Most drop-off happens early, from Level 1 to Level 2 (100% to 95%).",
        why_it_matters: "Completion rate affects ranking. Estimated small gain.",
      },
    ],
    meta: {
      rank: { position: 2, category: "Public speaking, Grades 6-8" },
      badges: ["Teacher favorite"],
      improve: { order: 4, reason: null },
    },
  },

  // Chat Quest: rating 3.9, completion 58%, did-it-work 78% (6th grade lowest). Highest priority.
  [CHAT_QUEST]: {
    reviews: buildReviews(
      CHAT_QUEST,
      "cq",
      5,
      {
        "6th": { n: 9, partly: 3, no: 3 },
        "7th": { n: 7, partly: 2, no: 1 },
        "8th": { n: 7, partly: 1, no: 1 },
      },
      [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, ...rep(6, 4), ...rep(6, 5)],
      {
        yes: [
          "Great conversation prompts. My 8th graders really listened to each other.",
          "The quest map keeps kids motivated to keep talking.",
          "Love the follow-up question practice. Very practical skill.",
          "Students liked unlocking each stop on the map.",
        ],
        partly: [
          "Level 2 instructions confused my students. I had to explain it myself.",
          "Good idea, but my 6th graders needed sentence starters.",
          "Once they got past Level 2 it went well.",
        ],
        no: [
          "Half my class was stuck on Level 2 and didn't know what to do.",
          "Too hard for my 6th graders without a lot of support.",
        ],
      },
    ),
    playSessions: buildSessions(CHAT_QUEST, "cq", [10, 24, 8, 58]),
    themes: [
      {
        id: "cq-th-1",
        game_id: CHAT_QUEST,
        theme: "Level 2 instructions are confusing",
        sentiment: "negative",
        mention_count: 9,
        example_quote:
          "Half my class was stuck on Level 2 and didn't know what to do. (Carmen Diaz, 6th grade)",
      },
      {
        id: "cq-th-2",
        game_id: CHAT_QUEST,
        theme: "Great conversation prompts",
        sentiment: "positive",
        mention_count: 8,
        example_quote:
          "Great conversation prompts. My 8th graders really listened to each other. (Jordan Ellis, 8th grade)",
      },
      {
        id: "cq-th-3",
        game_id: CHAT_QUEST,
        theme: "Too hard for 6th graders",
        sentiment: "negative",
        mention_count: 6,
        example_quote:
          "Too hard for my 6th graders without a lot of support. (Omar Farouk, 6th grade)",
      },
      {
        id: "cq-th-4",
        game_id: CHAT_QUEST,
        theme: "Students liked the quest map",
        sentiment: "positive",
        mention_count: 5,
        example_quote: "Students liked unlocking each stop on the map. (Ana Ruiz, 7th grade)",
      },
    ],
    requests: [
      {
        id: "cq-rq-1",
        game_id: CHAT_QUEST,
        title: "A worked example before Level 2",
        request_count: 7,
        example_quote:
          "Show one example conversation before Level 2 starts. (Carmen Diaz, 6th grade)",
      },
      {
        id: "cq-rq-2",
        game_id: CHAT_QUEST,
        title: "Sentence starters for younger students",
        request_count: 5,
        example_quote:
          "My 6th graders need starters like 'Tell me more about…'. (Omar Farouk, 6th grade)",
      },
      {
        id: "cq-rq-3",
        game_id: CHAT_QUEST,
        title: "Short teacher walkthrough video",
        request_count: 4,
        example_quote:
          "A 2-minute video for me would save a lot of explaining. (Tyler Brooks, 7th grade)",
      },
    ],
    actions: [
      {
        id: "cq-act-1",
        game_id: CHAT_QUEST,
        priority: 1,
        title: "Rewrite Level 2 instructions with a worked example",
        evidence_summary:
          "Biggest drop-off (90% to 66%), and 9 teachers called Level 2 instructions confusing.",
        why_it_matters: "Completion rate affects ranking. Estimated to move you up 2-3 spots.",
        request_id: "cq-rq-1",
      },
      {
        id: "cq-act-2",
        game_id: CHAT_QUEST,
        priority: 2,
        title: "Add sentence starters for 6th graders",
        evidence_summary: "Only 67% of 6th grade teachers said it worked, vs 86% in 7th and 8th.",
        why_it_matters: "Did-it-work rate affects ranking. Estimated to move you up 1-2 spots.",
        request_id: "cq-rq-2",
      },
      {
        id: "cq-act-3",
        game_id: CHAT_QUEST,
        priority: 3,
        title: "Add a 2-minute teacher walkthrough",
        evidence_summary:
          "4 teachers asked for one, and several said they had to explain the game themselves.",
        why_it_matters: "Teacher ratings affect ranking. Estimated small rating lift.",
        request_id: "cq-rq-3",
      },
    ],
    meta: {
      rank: { position: 9, category: "Conversation, Grades 6-8" },
      badges: [],
      improve: { order: 1, reason: "Biggest drop-off, 6th graders struggling" },
    },
  },

  // Team Up Tower: rating 4.4, completion 71%, did-it-work 90%. Strong with 6th grade.
  [TEAM_UP]: {
    reviews: buildReviews(
      TEAM_UP,
      "tut",
      8,
      {
        "6th": { n: 7, partly: 0, no: 0 },
        "7th": { n: 7, partly: 2, no: 1 },
        "8th": { n: 6, partly: 1, no: 1 },
      },
      [3, 3, 4, 4, 4, ...rep(5, 4), ...rep(10, 5)],
      {
        yes: [
          "Every student had a job. My 6th graders were all in.",
          "Role cards make collaboration concrete. Loved it.",
          "Great for 6th grade. The tower challenge is so engaging.",
          "Kids were still talking about teamwork the next day.",
        ],
        partly: [
          "Groups stalled in Level 2 deciding who does what.",
          "Building rounds ran over time for us.",
        ],
        no: ["We never got past Level 2. Groups argued about roles."],
      },
    ),
    playSessions: buildSessions(TEAM_UP, "tut", [12, 14, 3, 71]),
    themes: [
      {
        id: "tut-th-1",
        game_id: TEAM_UP,
        theme: "Every student had a job",
        sentiment: "positive",
        mention_count: 11,
        example_quote:
          "Every student had a job. My 6th graders were all in. (Sarah Lindgren, 6th grade)",
      },
      {
        id: "tut-th-2",
        game_id: TEAM_UP,
        theme: "Perfect for 6th grade",
        sentiment: "positive",
        mention_count: 8,
        example_quote:
          "Great for 6th grade. The tower challenge is so engaging. (David Kim, 6th grade)",
      },
      {
        id: "tut-th-3",
        game_id: TEAM_UP,
        theme: "Groups stalled in Level 2",
        sentiment: "negative",
        mention_count: 7,
        example_quote:
          "Groups stalled in Level 2 deciding who does what. (Noah Fischer, 7th grade)",
      },
      {
        id: "tut-th-4",
        game_id: TEAM_UP,
        theme: "Rounds ran over time",
        sentiment: "mixed",
        mention_count: 5,
        example_quote: "Building rounds ran over time for us. (Zoe Martin, 8th grade)",
      },
    ],
    requests: [
      {
        id: "tut-rq-1",
        game_id: TEAM_UP,
        title: "Printable role cards",
        request_count: 6,
        example_quote:
          "Paper role cards would make Level 2 so much smoother. (Noah Fischer, 7th grade)",
      },
      {
        id: "tut-rq-2",
        game_id: TEAM_UP,
        title: "End-of-game reflection prompt",
        request_count: 4,
        example_quote: "A reflection card at the end would tie it together. (Hiro Sato, 8th grade)",
      },
    ],
    actions: [
      {
        id: "tut-act-1",
        game_id: TEAM_UP,
        priority: 1,
        title: "Make Level 2 roles clearer with printable cards",
        evidence_summary:
          "Biggest drop-off happens in Level 2 (88% to 74%), and 7 teachers said groups stalled on roles.",
        why_it_matters: "Completion rate affects ranking. Estimated to move you up 1 spot.",
        request_id: "tut-rq-1",
      },
      {
        id: "tut-act-2",
        game_id: TEAM_UP,
        priority: 2,
        title: "Add a visible timer to building rounds",
        evidence_summary: "5 teachers said rounds ran over time.",
        why_it_matters: "Teacher ratings affect ranking. Estimated small rating lift.",
      },
      {
        id: "tut-act-3",
        game_id: TEAM_UP,
        priority: 3,
        title: "Add a reflection card at the end",
        evidence_summary: "Requested by teachers to help students connect the game to teamwork.",
        why_it_matters: "Did-it-work rate affects ranking. Estimated small gain.",
        request_id: "tut-rq-2",
      },
    ],
    meta: {
      rank: { position: 3, category: "Collaboration, Grades 6-8" },
      badges: ["Great for 6th grade"],
      improve: { order: 3, reason: "Students drop off during Level 2" },
    },
  },
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

export function stats(data: Pick<GameInsights, "reviews" | "playSessions">) {
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
