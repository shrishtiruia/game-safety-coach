// One icon language for skills, badges and quests (lucide line icons in the
// palette's ink), so the interface doesn't rely on emoji. Animal avatars and
// Pip stay as they are: they are characters, not interface icons.
import {
  Award,
  CalendarCheck,
  Crown,
  Ear,
  Feather,
  Flame,
  Gamepad2,
  Hand,
  Handshake,
  Heart,
  MessageCircleHeart,
  RotateCcw,
  Sprout,
  Target,
  Timer,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { TrackedSkill } from "@/data/teacher";
import { cn } from "@/lib/utils";

const SKILL_ICONS: Record<TrackedSkill, LucideIcon> = {
  empathy: Heart,
  teamwork: Handshake,
  communication: MessageCircleHeart,
  resilience: Sprout,
  focus: Target,
  "conflict resolution": Feather,
};

const BADGE_ICONS: Record<string, LucideIcon> = {
  "first-game": Gamepad2,
  "great-listener": Ear,
  "empathy-explorer": Heart,
  "team-player": Handshake,
  "streak-7": Flame,
  "bounce-back": RotateCcw,
  "focus-finder": Target,
  peacemaker: Feather,
  "five-games": Hand,
  "kind-words": MessageCircleHeart,
  "weekly-warrior": CalendarCheck,
  "skill-master": Crown,
};

const QUEST_ICONS: Record<string, LucideIcon> = { q1: Zap, q2: Gamepad2, q3: Timer };

type IconProps = { className?: string };

export function SkillIcon({ skill, className }: IconProps & { skill: TrackedSkill }) {
  const Icon = SKILL_ICONS[skill] ?? Award;
  return <Icon className={cn("size-5", className)} strokeWidth={2.4} aria-hidden />;
}

export function BadgeIcon({ id, className }: IconProps & { id: string }) {
  const Icon = BADGE_ICONS[id] ?? Award;
  return <Icon className={cn("size-7", className)} strokeWidth={2.4} aria-hidden />;
}

export function QuestIcon({ id, className }: IconProps & { id: string }) {
  const Icon = QUEST_ICONS[id] ?? Zap;
  return <Icon className={cn("size-6", className)} strokeWidth={2.4} aria-hidden />;
}
