import { games } from "./games";
import { GRADES, REVIEW_TAGS, type ClassroomEntry, type Review, type ReviewReply } from "./types";

const names = ["Ana", "Jamal", "Megan", "Luis", "Keiko", "Sarah", "Tomás", "Nia", "Ben", "Fatima", "Grace", "Omar", "Hannah", "Diego", "Lily", "Chris"];
const bodies = [
  "My students asked to play again the next day. The discussion afterward was the best part of our week.",
  "Setup took under five minutes. I projected it and the whole class was hooked.",
  "A couple of my quieter kids really opened up during the talk-it-over step.",
  "Great for my ELL group — the visuals carry a lot of the meaning.",
  "Worked well with my students who need predictable routines. No surprise timers!",
  "Solid game. I wish there were a few more rounds, but the lesson plan is excellent.",
  "We used it as a morning warm-up and it set a calm tone for the whole day.",
  "Kids loved Pip. I loved the rubric. Everybody wins.",
  "A little long for my 45-minute block, so I split it across two days.",
  "Honestly better than half the paid SEL curriculum my district bought.",
];

// Small deterministic PRNG so mock data is stable between server and browser.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const reviews: Review[] = [];
export const reviewReplies: ReviewReply[] = [];

games.forEach((g, gi) => {
  const r = rng(gi + 7);
  const count = 4 + Math.floor(r() * 5);
  for (let k = 0; k < count; k++) {
    const roll = r();
    const stars = roll > 0.35 ? 5 : roll > 0.12 ? 4 : roll > 0.04 ? 3 : 2;
    const tags = REVIEW_TAGS.filter(() => r() > 0.6);
    const id = `r${g.id}-${k}`;
    reviews.push({
      id,
      gameId: g.id,
      teacherFirstName: names[Math.floor(r() * names.length)] ?? "Ana",
      grade: g.grades[Math.floor(r() * g.grades.length)] ?? GRADES[0],
      classSize: 14 + Math.floor(r() * 18),
      stars,
      tags: tags.length ? tags : [REVIEW_TAGS[0]],
      body: bodies[Math.floor(r() * bodies.length)] ?? bodies[0]!,
      createdAt: new Date(Date.UTC(2026, 9 - Math.floor(r() * 6), 1 + Math.floor(r() * 27))).toISOString(),
      helpful: Math.floor(r() * 40),
      verified: r() > 0.15,
    });
    if (k === 0 || r() > 0.8) {
      reviewReplies.push({
        id: `rp-${id}`,
        reviewId: id,
        creatorId: g.creatorId,
        body: "Thank you so much for sharing this! We're adding more rounds in the next update.",
      });
    }
  }
});

export const classrooms: ClassroomEntry[] = [
  ["Ms. Rivera's 4th grade", "Maple Grove Elementary", 42, 160, 980],
  ["Mr. Patel's 7th grade advisory", "Lakeview Middle", 38, 171, 1120],
  ["Room 12 Kindergarten", "Sunnyside Primary", 51, 149, 860],
  ["Mrs. Johnson's 2nd grade", "Cedar Creek Elementary", 29, 140, 1010],
  ["Coach Bell's Speech & Debate", "Riverside High", 33, 122, 770],
  ["Ms. Nguyen's 5th grade", "Willow Park Elementary", 36, 155, 900],
  ["Mr. Alvarez's 3rd grade", "Hillcrest Elementary", 25, 133, 1060],
  ["Ms. Kim's 8th grade homeroom", "Oak Hollow Middle", 22, 118, 690],
  ["The Otter Room (1st grade)", "Pinecone Academy", 40, 128, 720],
  ["Ms. Brooks' 6th grade", "Brookside Middle", 19, 101, 640],
].map(([className, school, week, month, all], i) => ({
  id: `cl${i + 1}`,
  className: className as string,
  school: school as string,
  badges: { week: week as number, month: month as number, all: all as number },
}));
