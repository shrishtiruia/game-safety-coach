// Teacher community: discussions about games and teaching, plus game requests
// that creators can pick up. Mock data; shaped like future tables
// (threads, replies, requests). Posts never contain student names.

export const CATEGORIES = [
  { id: "games", label: "Game tips" },
  { id: "classroom", label: "Classroom ideas" },
  { id: "families", label: "Working with families" },
  { id: "help", label: "Ask for help" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface Author {
  name: string; // first name + last initial
  emoji: string;
  role: string; // e.g. "Grade 3 teacher"
  school: string;
  creator?: boolean;
}

export interface Reply {
  id: string;
  author: Author;
  body: string;
  daysAgo: number;
  helpful: number;
}

export interface Thread {
  id: string;
  category: CategoryId;
  title: string;
  body: string;
  author: Author;
  gameSlug?: string | undefined;
  daysAgo: number;
  helpful: number;
  replies: Reply[];
}

const A = {
  priya: {
    name: "Priya R.",
    emoji: "🦉",
    role: "Grade 4 teacher",
    school: "Maple Grove Elementary",
  },
  dev: { name: "Devon K.", emoji: "🐻", role: "Middle school counsellor", school: "Lakeview MS" },
  rosa: { name: "Rosa M.", emoji: "🦊", role: "Kindergarten teacher", school: "Sunnyside Primary" },
  jamal: { name: "Jamal W.", emoji: "🐢", role: "Grade 7 advisory", school: "Eastbrook Middle" },
  lena: {
    name: "Lena F.",
    emoji: "🦦",
    role: "Game creator · ex-K-2 teacher",
    school: "Kitbit creator",
    creator: true,
  },
  maya: { name: "Maya O.", emoji: "👩🏾‍🏫", role: "Grade 3–4 teacher", school: "Riverbend Elementary" },
  sun: { name: "Sun-hee P.", emoji: "🐰", role: "ELL specialist", school: "Harbor View K-8" },
  marcus: {
    name: "Marcus B.",
    emoji: "🦁",
    role: "Game creator",
    school: "Kitbit creator",
    creator: true,
  },
} satisfies Record<string, Author>;

export const ME: Author = A.maya;

export const threads: Thread[] = [
  {
    id: "t1",
    category: "games",
    title: "Feelings Fishing worked better when I added a 'two feelings' rule",
    body: "My K-2 kids kept arguing about the 'right' fish. I told them some stories have two right feelings, and if you catch one, your partner has to catch the other. The arguments turned into conversations.",
    author: A.rosa,
    gameSlug: "feelings-fishing",
    daysAgo: 1,
    helpful: 42,
    replies: [
      {
        id: "r1",
        author: A.lena,
        body: "Creator here. I love this. I'm adding a 'catch two' mode in the next update and I'll credit your class.",
        daysAgo: 1,
        helpful: 18,
      },
      {
        id: "r2",
        author: A.sun,
        body: "Tried it with my newcomers today. The word labels on the fish help a lot. I had them say the feeling in their home language too.",
        daysAgo: 0,
        helpful: 9,
      },
    ],
  },
  {
    id: "t2",
    category: "classroom",
    title: "How do you handle the student who won't play with a partner?",
    body: "One of my 4th graders shuts down whenever a game needs a partner. Solo mode works, but I don't want them to miss the point of the game. What's worked for you?",
    author: A.priya,
    daysAgo: 2,
    helpful: 27,
    replies: [
      {
        id: "r3",
        author: A.dev,
        body: "I start them as the 'game host' who reads the stories out loud. They're part of the group without being on the spot. After a week or two most kids ask to play.",
        daysAgo: 2,
        helpful: 31,
      },
      {
        id: "r4",
        author: A.maya,
        body: "Same experience here. Pairing them with the same calm partner every time helped more than rotating.",
        daysAgo: 1,
        helpful: 12,
      },
    ],
  },
  {
    id: "t3",
    category: "games",
    title: "Talk It Out Treehouse for advisory: our 3-week plan",
    body: "Week 1 we only played the listening rounds. Week 2 we added the 'say it back' cards. Week 3 students wrote their own scenarios from real hallway conflicts (names changed). Happy to share the scenario sheet.",
    author: A.jamal,
    gameSlug: "talk-it-out-treehouse",
    daysAgo: 3,
    helpful: 35,
    replies: [
      {
        id: "r5",
        author: A.priya,
        body: "Please share! Writing their own scenarios is such a good idea for older kids.",
        daysAgo: 3,
        helpful: 6,
      },
    ],
  },
  {
    id: "t4",
    category: "families",
    title: "What do you send home so families can practise too?",
    body: "Parents keep asking what they can do at home. I've started sending the 'Try at home' card from the family view. Has anyone found something families actually use?",
    author: A.maya,
    daysAgo: 4,
    helpful: 19,
    replies: [
      {
        id: "r6",
        author: A.rosa,
        body: "One dinner-table question a week. That's it. Anything longer doesn't get done.",
        daysAgo: 4,
        helpful: 22,
      },
    ],
  },
  {
    id: "t5",
    category: "help",
    title: "Screen-free games that work for 30 kids in a small room?",
    body: "No iPads this term and my room is tiny. Looking for whole-class games that don't need space to move around.",
    author: A.dev,
    daysAgo: 5,
    helpful: 14,
    replies: [
      {
        id: "r7",
        author: A.marcus,
        body: "Card Circle Chats works seated. Split into circles of 5 and it runs itself after the first round.",
        daysAgo: 5,
        helpful: 11,
      },
    ],
  },
  {
    id: "t6",
    category: "classroom",
    title: "Using the class dam goal without making it about rewards",
    body: "We hit our dam goal last month and the kids were thrilled, but I noticed some started chasing badges. This month the reward is 'we teach a game to the kindergarten class'. Curious how others frame it.",
    author: A.priya,
    daysAgo: 6,
    helpful: 24,
    replies: [],
  },
];

export interface GameRequest {
  id: string;
  title: string;
  detail: string;
  votes: number;
  status: "open" | "in-progress";
  creator?: string;
}

export const requests: GameRequest[] = [
  {
    id: "q1",
    title: "Losing gracefully, for grades 2–4",
    detail: "Something for the kids who melt down when they lose a game at recess.",
    votes: 128,
    status: "in-progress",
    creator: "Marcus B.",
  },
  {
    id: "q2",
    title: "Online etiquette for group chats",
    detail: "Middle schoolers, short scenarios, discussion-based.",
    votes: 96,
    status: "open",
  },
  {
    id: "q3",
    title: "Asking for help without feeling embarrassed",
    detail: "K-2, could be a puppet or role-play game.",
    votes: 71,
    status: "open",
  },
  {
    id: "q4",
    title: "Making friends in a new class",
    detail: "For newcomers and ELL students, works with very little English.",
    votes: 54,
    status: "in-progress",
    creator: "Lena F.",
  },
];
