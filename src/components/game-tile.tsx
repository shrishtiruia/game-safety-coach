import {
  Bird,
  Blocks,
  Coins,
  Ear,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  MessageCircle,
  MessageCircleHeart,
  MessagesSquare,
  Mic,
  Presentation,
  Puzzle,
  Rocket,
  Scale,
  Store,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getCover, type Cover, type CoverColor, type CoverIcon } from "@/lib/game-covers";
import { cn } from "@/lib/utils";

const ICONS: Record<CoverIcon, LucideIcon> = {
  handshake: Handshake,
  scale: Scale,
  coins: Coins,
  store: Store,
  microphone: Mic,
  megaphone: Megaphone,
  presentation: Presentation,
  trophy: Trophy,
  speech_bubbles: MessagesSquare,
  message_circle: MessageCircle,
  ear: Ear,
  users: Users,
  stacked_blocks: Blocks,
  puzzle: Puzzle,
  rocket: Rocket,
  heart_chat: MessageCircleHeart,
  heart_handshake: HeartHandshake,
  bird: Bird,
  lightbulb: Lightbulb,
};

const COLORS: Record<CoverColor, string> = {
  orange: "bg-warning",
  blue: "bg-info",
  green: "bg-primary",
  yellow: "bg-sun",
  red: "bg-danger",
};

const SIZES = {
  sm: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
  md: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
  lg: { box: "h-24 w-24 rounded-3xl", icon: "h-12 w-12" },
} as const;

/**
 * A game's thumbnail: a big friendly icon on a solid color. Used everywhere a game appears.
 * Pass `cover` to preview a specific cover (e.g. while a maker is choosing one).
 */
export function GameTile({
  game,
  cover,
  size = "sm",
  className,
}: {
  game?: { id: string; skill: string; title?: string; cover_icon?: unknown; cover_color?: unknown };
  cover?: Cover;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const c: Cover =
    cover ?? (game ? getCover(game) : { cover_icon: "lightbulb", cover_color: "green" });
  const Icon = ICONS[c.cover_icon];
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-primary-foreground",
        s.box,
        COLORS[c.cover_color],
        className,
      )}
    >
      <Icon className={s.icon} strokeWidth={2.5} />
    </span>
  );
}
