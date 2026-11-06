import {
  Blocks,
  Ear,
  Handshake,
  Hourglass,
  MessageCircleHeart,
  MessagesSquare,
  Mic,
  Signpost,
  Smartphone,
  Smile,
  Sprout,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { getCover, type CoverColor, type CoverIcon } from "@/lib/game-covers";
import { cn } from "@/lib/utils";

const ICONS: Record<CoverIcon, LucideIcon> = {
  handshake: Handshake,
  microphone: Mic,
  speech_bubbles: MessagesSquare,
  stacked_blocks: Blocks,
  trophy: Trophy,
  heart_chat: MessageCircleHeart,
  ear: Ear,
  hourglass: Hourglass,
  target: Target,
  sprout: Sprout,
  phone: Smartphone,
  signpost: Signpost,
  smile: Smile,
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

/** A game's cover: a big friendly icon on a solid color. Used everywhere a game appears. */
export function GameTile({
  game,
  size = "sm",
  className,
}: {
  game: { id: string; skill: string };
  size?: keyof typeof SIZES;
  className?: string | undefined;
}) {
  const { cover_icon, cover_color } = getCover(game);
  const Icon = ICONS[cover_icon];
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-primary-foreground",
        s.box,
        COLORS[cover_color],
        className,
      )}
    >
      <Icon className={s.icon} strokeWidth={2.5} />
    </span>
  );
}

/** The same cover, filling its container: card thumbnails and game page headers. */
export function GameCoverFill({
  game,
  className,
}: {
  game: { id: string; skill: string };
  className?: string | undefined;
}) {
  const { cover_icon, cover_color } = getCover(game);
  const Icon = ICONS[cover_icon];
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center text-primary-foreground",
        COLORS[cover_color],
        className,
      )}
    >
      <Icon className="h-1/3 w-1/3 max-h-24 max-w-24" strokeWidth={2.25} />
    </div>
  );
}
