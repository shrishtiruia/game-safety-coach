import type { Device, Game, GameType, Grade, GroupSize, Skill } from "./types";

type Seed = [
  title: string,
  creatorId: string,
  tagline: string,
  grades: Grade[],
  skills: Skill[],
  type: GameType,
  groups: GroupSize[],
  minutes: number,
  devices: Device[],
  price: number,
  plays: number,
  weeklyPlays: number,
  publishedAt: string,
  extra?: Partial<Game>,
];

const seeds: Seed[] = [
  ["Feelings Fishing", "c6", "Reel in a feeling, then name it, share it, and act it out.", ["K-2"], ["empathy", "self-awareness"], "role-play", ["small group", "whole class"], 15, ["iPad", "projector"], 0, 48200, 3100, "2026-08-14", { featured: true, casel: true }],
  ["The Patience Dam", "c2", "Help Pip build a dam one log at a time. Rushing makes it leak!", ["3-5", "6-8"], ["patience", "focus"], "simulation", ["solo", "pairs"], 15, ["iPad", "Chromebook"], 4.99, 36100, 2400, "2026-09-02", { featured: true }],
  ["Talk It Out Treehouse", "c3", "Climb the treehouse by working through real playground disagreements.", ["3-5", "6-8"], ["conflict resolution", "active listening"], "story choices", ["small group"], 30, ["iPad", "Chromebook", "projector"], 6.99, 29800, 2900, "2026-07-21", { featured: true }],
  ["Pip's Team Raft", "c2", "Every player holds one oar. Only clear talk gets the raft downstream.", ["3-5", "6-8", "9-12"], ["teamwork", "face-to-face conversation"], "co-op puzzle", ["small group", "whole class"], 30, ["iPad", "projector"], 8.99, 41500, 3600, "2026-10-01", { featured: true }],
  ["Mic Drop Meadow", "c7", "Silly one-minute speeches judged by a very polite audience of forest animals.", ["6-8", "9-12"], ["public speaking", "self-awareness"], "discussion cards", ["whole class"], 15, ["projector", "screen-free"], 3.99, 18700, 1200, "2026-06-11"],
  ["Puzzle Patch Pals", "c5", "A giant paper puzzle that only fits together if everyone talks.", ["K-2", "3-5"], ["teamwork", "patience"], "unplugged / printable", ["small group"], 30, ["screen-free"], 0, 22400, 1500, "2026-05-03"],
  ["Crossroads Creek", "c1", "Branching stories where every choice ripples down the creek.", ["3-5", "6-8"], ["decision-making", "empathy"], "story choices", ["solo", "pairs"], 15, ["iPad", "Chromebook"], 2.99, 26300, 1900, "2026-09-18"],
  ["Card Circle Chats", "c4", "Conversation cards that get kids looking up and talking face-to-face.", ["K-2", "3-5", "6-8"], ["face-to-face conversation", "active listening"], "discussion cards", ["pairs", "small group"], 5, ["screen-free"], 0, 39000, 2700, "2026-04-22", { casel: true }],
  ["Calm Log Countdown", "c8", "A five-minute breathing and focus warm-up on a floating log.", ["K-2", "3-5"], ["focus", "self-awareness"], "simulation", ["whole class"], 5, ["projector", "iPad"], 0, 52100, 4100, "2026-03-15"],
  ["Kind Clicks", "c8", "Practice friendly replies, pauses, and when to log off.", ["3-5", "6-8"], ["digital etiquette", "empathy"], "quiz", ["solo", "whole class"], 15, ["Chromebook", "iPad", "projector"], 3.49, 24600, 2000, "2026-10-12"],
  ["Tumble Tower", "c6", "Build, topple, laugh, retry. Celebrate the oops!", ["K-2"], ["handling failure", "patience"], "unplugged / printable", ["small group"], 15, ["screen-free"], 1.99, 15800, 1100, "2026-10-20"],
  ["Tin Can Telephone", "c3", "Pass the message, check the message, fix the message.", ["K-2", "3-5"], ["active listening", "face-to-face conversation"], "role-play", ["pairs"], 5, ["screen-free"], 0, 31200, 2200, "2026-08-02"],
  ["Beaver Board Meeting", "c7", "Run the lodge council: debate, vote, and compromise on lodge rules.", ["6-8", "9-12"], ["decision-making", "conflict resolution"], "simulation", ["small group", "whole class"], 45, ["Chromebook", "projector"], 9.99, 12400, 900, "2026-07-09"],
  ["Feelings Forecast", "c4", "Check today's emotional weather and plan for a sunny afternoon.", ["K-2", "3-5"], ["self-awareness", "empathy"], "discussion cards", ["whole class"], 5, ["projector", "screen-free"], 0, 44800, 3300, "2026-02-27", { casel: true }],
  ["Oops Island", "c1", "Shipwrecked? Great! Every mistake unlocks a new tool.", ["3-5", "6-8"], ["handling failure", "decision-making"], "story choices", ["solo"], 30, ["iPad", "Chromebook"], 4.99, 20100, 1600, "2026-09-29"],
  ["Echo Pond", "c2", "Repeat back what your partner said before the ripples fade.", ["3-5", "6-8"], ["active listening", "focus"], "co-op puzzle", ["pairs"], 15, ["iPad"], 3.99, 17300, 1300, "2026-10-25"],
  ["Lodge Life Bundle", "c2", "Five Riverbend games plus a full semester of lesson plans.", ["3-5", "6-8"], ["teamwork", "patience", "empathy"], "simulation", ["small group", "whole class"], 45, ["iPad", "Chromebook", "projector"], 24.99, 9800, 700, "2026-10-28", { isBundle: true }],
  ["Speak Up Sprouts", "c7", "Tiny prompts that grow into confident little speeches.", ["K-2", "3-5"], ["public speaking", "self-awareness"], "role-play", ["whole class"], 15, ["projector", "screen-free"], 2.49, 14200, 1000, "2026-05-30"],
  ["Mind the Gap Chat", "c3", "A face-to-face conversation game for teens who'd rather text.", ["9-12"], ["face-to-face conversation", "digital etiquette"], "discussion cards", ["pairs", "small group"], 30, ["screen-free"], 5.99, 11600, 800, "2026-06-24"],
  ["Hollow Log Hide & Seek", "c8", "A sensory-friendly focus game with gentle sounds and no timers.", ["K-2", "3-5"], ["focus", "patience"], "co-op puzzle", ["solo", "pairs"], 15, ["iPad"], 0, 27700, 2100, "2026-08-30", { casel: true }],
  ["The Fair Share Picnic", "c5", "Split the picnic so everyone feels okay. Harder than it sounds!", ["K-2", "3-5"], ["conflict resolution", "empathy"], "unplugged / printable", ["small group"], 30, ["screen-free"], 2.99, 13900, 1000, "2026-07-14"],
  ["Pip's Big Choice Quiz", "c1", "Quick what-would-you-do quizzes with talk-it-over pauses.", ["3-5", "6-8"], ["decision-making", "digital etiquette"], "quiz", ["whole class"], 5, ["projector", "Chromebook"], 0, 33800, 2500, "2026-10-30"],
  ["Ripple Effect", "c4", "See how one kind or unkind act travels through a whole village.", ["6-8", "9-12"], ["empathy", "decision-making"], "simulation", ["solo", "small group"], 45, ["Chromebook", "iPad"], 7.99, 16400, 1400, "2026-09-07", { casel: true }],
  ["SEL Starter Bundle", "c4", "Ten printable classroom games for the first month of school.", ["K-2", "3-5", "6-8"], ["teamwork", "active listening", "self-awareness"], "unplugged / printable", ["whole class", "small group"], 30, ["screen-free", "projector"], 19.99, 8600, 600, "2026-08-05", { isBundle: true, casel: true }],
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const goalBank: Record<string, string[]> = {
  empathy: ["Name how someone else might be feeling", "Respond to a friend's feelings with kindness"],
  "active listening": ["Paraphrase what a partner said", "Ask a follow-up question before responding"],
  teamwork: ["Share roles fairly in a group", "Build on a teammate's idea out loud"],
  "conflict resolution": ["Use I-statements in a disagreement", "Find a compromise both sides can accept"],
  patience: ["Wait for a turn without frustration", "Stick with a slow task to the end"],
  focus: ["Use a breathing reset to refocus", "Notice and return from distractions"],
  "public speaking": ["Speak clearly to a group for one minute", "Use eye contact and pauses"],
  "face-to-face conversation": ["Start and keep a conversation going", "Read faces and body language"],
  "handling failure": ["Reframe a mistake as a next step", "Try again after a setback"],
  "digital etiquette": ["Write a kind, clear online reply", "Know when to pause or log off"],
  "decision-making": ["Weigh two choices and their outcomes", "Explain the reason for a choice"],
  "self-awareness": ["Name your own feelings in the moment", "Notice what helps you feel calm"],
};

export const games: Game[] = seeds.map((s, i) => {
  const [title, creatorId, tagline, grades, skills, type, groups, minutes, devices, price, plays, weeklyPlays, publishedAt, extra] = s;
  const goals = skills.flatMap((k) => goalBank[k] ?? []).slice(0, 5);
  return {
    id: `g${i + 1}`,
    slug: slugify(title),
    title,
    creatorId,
    tagline,
    description: `${tagline} ${title} is designed by educators for real classrooms: short rounds, clear instructions, and built-in pauses for students to reflect and talk with each other.`,
    coverIndex: i % 12,
    coverFlip: i >= 12,
    grades,
    skills,
    type,
    groups,
    minutes,
    devices,
    price,
    isBundle: false,
    casel: i % 3 === 0,
    lessonPlan: i % 4 !== 3,
    plays,
    weeklyPlays,
    publishedAt,
    featured: false,
    learningGoals: goals.length >= 3 ? goals : [...goals, "Reflect on the game with a partner"],
    steps: [
      { title: "Set the scene", text: `Project or print the ${type} intro and read the short story aloud.` },
      { title: "Play together", text: `Students play in ${groups[0]} rounds of about ${Math.max(3, Math.round(minutes / 3))} minutes.` },
      { title: "Talk it over", text: "Use the discussion prompts to connect the game to real life." },
    ],
    ...extra,
  };
});
