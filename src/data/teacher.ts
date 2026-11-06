// Mock teacher/classroom data shaped like future tables:
// teachers, classes, students, student_skill_scores, assignments, class_weekly_progress.
// Shared by the Teacher Profile and Student Profile pages.

export const TRACKED_SKILLS = ["empathy", "teamwork", "communication", "resilience", "focus", "conflict resolution"] as const;
export type TrackedSkill = (typeof TRACKED_SKILLS)[number];

export interface Teacher {
  id: string;
  name: string;
  emoji: string;
  school: string;
  grades: string[];
  subject: string;
  bio: string;
  streakDays: number;
  joined: string;
}

export interface ClassRoom {
  id: string;
  teacherId: string;
  name: string;
  grade: string;
  emoji: string;
  tone: "honey" | "leaf" | "sky" | "berry";
}

export interface Student {
  id: string;
  classId: string;
  firstName: string;
  lastInitial: string;
  emoji: string;
  skills: Record<TrackedSkill, number>; // 0-100
  gamesCompleted: number;
  gamesStarted: number;
  badges: number;
  minutesThisWeek: number;
  lastActiveDaysAgo: number;
  weekly: number[]; // overall progress last 8 weeks
}

export interface Assignment {
  id: string;
  gameId: string; // FK -> games.id
  classId: string;
  studentIds: string[]; // empty = whole class
  completionRate: number; // 0-100
}

export const teacher: Teacher = {
  id: "t1",
  name: "Ms. Maya Okafor",
  emoji: "👩🏾‍🏫",
  school: "Riverbend Elementary",
  grades: ["Grade 3", "Grade 4"],
  subject: "Homeroom & SEL",
  bio: "Eleven years in the classroom. I use short games to help my kids practice listening, patience and bouncing back from mistakes — and to put the iPads down and talk to each other.",
  streakDays: 23,
  joined: "2025-08-18",
};

export const classes: ClassRoom[] = [
  { id: "cl1", teacherId: "t1", name: "Grade 4 – Room 12", grade: "Grade 4", emoji: "🦫", tone: "honey" },
  { id: "cl2", teacherId: "t1", name: "Grade 3 – Room 8", grade: "Grade 3", emoji: "🐸", tone: "leaf" },
  { id: "cl3", teacherId: "t1", name: "SEL Club – Fridays", grade: "Grades 3-5", emoji: "🦉", tone: "honey" },
];

const NAMES = [
  "Ava", "Liam", "Sofia", "Noah", "Zara", "Mateo", "Priya", "Eli", "Maya", "Jonah", "Amara", "Leo", "Hana", "Diego",
  "Chloe", "Omar", "Isla", "Kai", "Nia", "Ezra", "Lucy", "Ravi", "Grace", "Theo", "Aiyana", "Felix", "Mila", "Sam",
  "June", "Arjun", "Rosa", "Finn", "Layla", "Owen", "Yuki", "Caleb", "Iris", "Malik", "Elena", "Ben", "Ada", "Hugo",
  "Tess", "Kofi", "Wren", "Luca", "Ines", "Max", "Ruby", "Jude", "Lena", "Asher",
];
const ANIMALS = ["🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐰", "🦉", "🐢", "🐙", "🦄", "🐝", "🦋", "🐧", "🐳", "🦔"];
const INITIALS = "ABCDEFGHJKLMNOPRSTVW";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const counts: Record<string, number> = { cl1: 24, cl2: 21, cl3: 12 };
const rand = rng(42);
let n = 0;
export const students: Student[] = classes.flatMap((c) =>
  Array.from({ length: counts[c.id] ?? 0 }, () => {
    const i = n++;
    const base = 35 + rand() * 50;
    const skills = Object.fromEntries(
      TRACKED_SKILLS.map((s) => [s, Math.round(Math.min(98, Math.max(8, base + (rand() - 0.5) * 40)))]),
    ) as Record<TrackedSkill, number>;
    const overall = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / TRACKED_SKILLS.length);
    const inactive = rand() < 0.12;
    const weekly = Array.from({ length: 8 }, (_, w) => Math.round(Math.max(5, overall - (7 - w) * (2 + rand() * 4))));
    weekly[7] = overall;
    return {
      id: `s${i + 1}`,
      classId: c.id,
      firstName: NAMES[i % NAMES.length]!,
      lastInitial: INITIALS[(i * 7) % INITIALS.length]!,
      emoji: ANIMALS[i % ANIMALS.length]!,
      skills,
      gamesCompleted: Math.round(overall / 12 + rand() * 2),
      gamesStarted: Math.round(overall / 10 + 1 + rand() * 2),
      badges: Math.round(overall / 8 + rand() * 4),
      minutesThisWeek: inactive ? 0 : Math.round(10 + rand() * 70),
      lastActiveDaysAgo: inactive ? 8 + Math.floor(rand() * 10) : Math.floor(rand() * 4),
      weekly,
    };
  }),
);

export const assignments: Assignment[] = [
  { id: "a1", gameId: "g3", classId: "cl1", studentIds: [], completionRate: 78 },
  { id: "a2", gameId: "g4", classId: "cl1", studentIds: [], completionRate: 64 },
  { id: "a3", gameId: "g8", classId: "cl1", studentIds: [], completionRate: 91 },
  { id: "a4", gameId: "g16", classId: "cl1", studentIds: [], completionRate: 42 },
  { id: "a5", gameId: "g9", classId: "cl1", studentIds: [], completionRate: 85 },
  { id: "a6", gameId: "g1", classId: "cl2", studentIds: [], completionRate: 88 },
  { id: "a7", gameId: "g6", classId: "cl2", studentIds: [], completionRate: 70 },
  { id: "a8", gameId: "g12", classId: "cl2", studentIds: [], completionRate: 95 },
  { id: "a9", gameId: "g2", classId: "cl2", studentIds: [], completionRate: 51 },
  { id: "a10", gameId: "g14", classId: "cl3", studentIds: [], completionRate: 60 },
  { id: "a11", gameId: "g19", classId: "cl3", studentIds: [], completionRate: 73 },
  { id: "a12", gameId: "g4", classId: "cl3", studentIds: [], completionRate: 58 },
];

// ---- helpers ----
export const getClass = (id: string) => classes.find((c) => c.id === id);
export const getStudent = (id: string) => students.find((s) => s.id === id);
export const studentsIn = (classId: string) => students.filter((s) => s.classId === classId);
export const assignmentsFor = (classId: string) => assignments.filter((a) => a.classId === classId);
export const studentName = (s: Student) => `${s.firstName} ${s.lastInitial}.`;

export const overallOf = (s: Student) =>
  Math.round(TRACKED_SKILLS.reduce((a, k) => a + s.skills[k], 0) / TRACKED_SKILLS.length);
export const topSkill = (s: Student) => TRACKED_SKILLS.reduce((a, b) => (s.skills[b] > s.skills[a] ? b : a));
export const weakSkill = (s: Student) => TRACKED_SKILLS.reduce((a, b) => (s.skills[b] < s.skills[a] ? b : a));
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

export function classStats(classId: string) {
  const list = studentsIn(classId);
  const asg = assignmentsFor(classId);
  return {
    students: list.length,
    gamesAssigned: asg.length,
    avgProgress: avg(list.map(overallOf)),
    skills: TRACKED_SKILLS.map((k) => ({ skill: k, value: avg(list.map((s) => s.skills[k])) })),
    weekly: Array.from({ length: 8 }, (_, w) => ({ week: `W${w + 1}`, progress: avg(list.map((s) => s.weekly[w] ?? 0)) })),
    assigned: asg.length * list.length,
    started: list.reduce((a, s) => a + Math.min(asg.length, s.gamesStarted), 0),
    completed: list.reduce((a, s) => a + Math.min(asg.length, s.gamesCompleted), 0),
    activeThisWeek: list.filter((s) => s.lastActiveDaysAgo <= 7).length,
    minutes: list.reduce((a, s) => a + s.minutesThisWeek, 0),
    badges: list.reduce((a, s) => a + s.badges, 0),
  };
}

export type AttentionReason = "inactive" | "behind";
export function needsAttention(classId: string) {
  const list = studentsIn(classId);
  const classAvg = avg(list.map(overallOf));
  return list
    .flatMap((s): { student: Student; reason: AttentionReason; detail: string }[] => {
      if (s.lastActiveDaysAgo > 7) return [{ student: s, reason: "inactive" as const, detail: `Inactive for ${s.lastActiveDaysAgo} days` }];
      if (overallOf(s) < classAvg - 15) return [{ student: s, reason: "behind" as const, detail: `${overallOf(s)}% overall · needs ${weakSkill(s)}` }];
      return [];
    })
    .slice(0, 6);
}

export const lastActiveLabel = (d: number) => (d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`);
