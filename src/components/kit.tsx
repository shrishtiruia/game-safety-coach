import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { GameCoverFill, GameTile } from "@/components/game-tile";
import { Pip as MascotPip, type PipPose } from "@/components/mascot";
import type { Creator, Game } from "@/data/types";
import { formatPrice, getCreator, gradeRange, ratingOf } from "@/lib/catalog";
import { confetti } from "@/lib/confetti";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Marketplace Pip: the shared SVG beaver, held still. The marketplace uses Pip as
 * artwork; the animated poses belong to the studio, where Pip reacts to the maker.
 */
const POSES = { wave: "idle", search: "thinking", trophy: "proud" } as const satisfies Record<
  string,
  PipPose
>;
export function Pip({
  pose = "wave",
  className,
}: {
  pose?: keyof typeof POSES;
  className?: string;
  /** Ignored: marketplace Pip doesn't move. Kept so existing call sites compile. */
  bob?: boolean;
}) {
  return <MascotPip pose={POSES[pose]} size={96} className={cn("pip--still", className)} />;
}

/** Cover for a marketplace game: the studio's icon tile, keyed by its first skill. */
const coverKey = (game: Game) => ({ id: game.id, skill: game.skills[0] ?? "" });

export function Cover({ game, className }: { game: Game; className?: string; eager?: boolean }) {
  return <GameCoverFill game={coverKey(game)} className={className} />;
}

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(value) ? "fill-sun text-sun" : "text-border"}
          aria-hidden
        />
      ))}
    </span>
  );
}

const toneBg = {
  honey: "bg-honey-soft",
  leaf: "bg-leaf-soft",
  sky: "bg-sky-soft",
  berry: "bg-berry-soft",
};
export function CreatorAvatar({
  creator,
  size = "md",
}: {
  creator: Creator;
  size?: "sm" | "md" | "lg";
}) {
  const s =
    size === "sm" ? "size-8 text-base" : size === "lg" ? "size-20 text-4xl" : "size-11 text-2xl";
  return (
    <span
      className={cn("inline-grid shrink-0 place-items-center rounded-full", toneBg[creator.tone], s)}
      role="img"
      aria-label={creator.name}
    >
      {creator.emoji}
    </span>
  );
}

export function SkillTag({
  skill,
  tone = "leaf",
}: {
  skill: string;
  tone?: "leaf" | "sky" | "berry" | "honey";
}) {
  const map = {
    leaf: "bg-primary-soft text-primary-pressed",
    sky: "bg-sky-soft text-foreground",
    berry: "bg-danger-soft text-danger-pressed",
    honey: "bg-info-soft text-info-pressed",
  };
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-extrabold capitalize",
        map[tone],
      )}
    >
      {skill}
    </span>
  );
}

export function useAddToClass() {
  const navigate = useNavigate();
  const { purchased } = useStore();
  return (game: Game) => {
    if (purchased.includes(game.id)) {
      toast(`${game.title} is already in your class library`);
      return;
    }
    if (game.price === 0) {
      actions.addToLibrary(game.id);
      confetti();
      toast.success(`${game.title} added to your class library!`, {
        action: { label: "View", onClick: () => navigate({ to: "/profile", hash: "library" }) },
      });
    } else {
      actions.addToCart(game.id);
      toast.success(`${game.title} added to cart`, {
        action: { label: "Checkout", onClick: () => navigate({ to: "/cart" }) },
      });
    }
  };
}

export function WishHeart({ game, className }: { game: Game; className?: string }) {
  const { wishlist } = useStore();
  const on = wishlist.includes(game.id);
  return (
    <button
      type="button"
      onClick={() => actions.toggleWishlist(game.id)}
      aria-pressed={on}
      aria-label={on ? `Remove ${game.title} from wishlist` : `Add ${game.title} to wishlist`}
      className={cn("btn-3d tone-cream size-12 !p-0", className)}
    >
      <Heart className={cn("size-5", on ? "fill-danger text-danger" : "text-foreground")} />
    </button>
  );
}

/** Marketplace game card, built like the studio's: tile, title, facts, one action. */
export function GameCard({
  game,
  className,
  tag,
}: {
  game: Game;
  className?: string;
  tag?: string;
}) {
  const creator = getCreator(game.creatorId);
  const { avg } = ratingOf(game.id);
  const addToClass = useAddToClass();
  return (
    <article
      className={cn(
        "group relative flex w-64 shrink-0 flex-col rounded-3xl border border-secondary bg-card p-5 transition hover:-translate-y-0.5 hover:border-info",
        className,
      )}
    >
      <Link
        to="/games/$slug"
        params={{ slug: game.slug }}
        className="flex flex-1 flex-col after:absolute after:inset-0 after:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <GameTile game={coverKey(game)} size="md" />
          <SkillTag skill={tag ?? game.skills[0] ?? ""} />
        </div>
        <h3 className="text-lg leading-tight group-hover:text-info">{game.title}</h3>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          {creator.name} · {gradeRange(game.grades)}
        </p>
        <p className="mt-2 flex items-center gap-1 text-sm font-extrabold">
          <Star className="size-4 fill-sun text-sun" aria-hidden />
          {avg.toFixed(1)}
        </p>
      </Link>
      <div className="relative mt-4 flex items-center justify-between gap-2">
        <p className="font-display text-lg font-extrabold">{formatPrice(game.price)}</p>
        <button
          type="button"
          className="font-extrabold text-info hover:underline"
          onClick={() => addToClass(game)}
          aria-label={`Add ${game.title} to class`}
        >
          Add to class
        </button>
      </div>
    </article>
  );
}

export function Row({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h2 className="flex items-center gap-2 text-2xl">
        {icon}
        {title}
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-6 pt-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-muted p-10 text-center">
      <Pip pose="search" className="size-28" />
      <h3 className="text-2xl">{title}</h3>
      {text && <p className="max-w-sm font-semibold text-muted-foreground">{text}</p>}
      {children}
    </div>
  );
}
