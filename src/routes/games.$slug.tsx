import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Cover, Stars, useAddToClass, WishHeart } from "@/components/kit";
import { formatPrice, getCreator, getGame, ratingOf } from "@/lib/catalog";
import { isPlayable } from "@/lib/playable";

export const Route = createFileRoute("/games/$slug")({
  loader: ({ params }) => {
    const game = getGame(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.game.title} — Kitbit` : "Game — Kitbit" },
      { name: "description", content: loaderData?.game.tagline ?? "A Kitbit classroom game." },
      { property: "og:title", content: loaderData?.game.title ?? "Kitbit game" },
      {
        property: "og:description",
        content: loaderData?.game.tagline ?? "A Kitbit classroom game.",
      },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { game } = Route.useLoaderData();
  const { avg, count } = ratingOf(game.id);
  const add = useAddToClass();
  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start lg:px-8">
      <div className="aspect-[5/3] overflow-hidden rounded-3xl border border-secondary">
        <Cover game={game} eager />
      </div>
      <div className="space-y-4">
      <h1 className="text-4xl">{game.title}</h1>
      <p className="font-semibold text-muted-foreground">by {getCreator(game.creatorId).name}</p>
      <p className="flex items-center gap-2 font-bold">
        <Stars value={avg} /> {avg} ({count} reviews)
      </p>
      <p className="text-lg font-semibold">{game.description}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        {isPlayable(game.slug) && (
          <Link to="/play/$slug" params={{ slug: game.slug }} className="btn-3d tone-leaf">
            Play it now
          </Link>
        )}
        <button type="button" className="btn-3d tone-berry" onClick={() => add(game)}>
          Add to class · {formatPrice(game.price)}
        </button>
        <WishHeart game={game} />
      </div>
      </div>
    </div>
  );
}
