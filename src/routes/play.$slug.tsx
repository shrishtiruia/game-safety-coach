import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { FeelingsFishing } from "@/components/FeelingsFishing";
import { Pip } from "@/components/kit";
import { getGame } from "@/lib/catalog";
import { isPlayable } from "@/lib/playable";

export const Route = createFileRoute("/play/$slug")({
  loader: ({ params }) => {
    const game = getGame(params.slug);
    if (!game || !isPlayable(game.slug)) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `Play ${loaderData.game.title} — Kitbit` : "Play — Kitbit";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.game.tagline ?? "Play a Kitbit game." },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.game.tagline ?? "Play a Kitbit game." },
      ],
    };
  },
  component: PlayPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl space-y-4 p-10 text-center">
      <Pip pose="search" className="mx-auto size-32" bob />
      <h1 className="text-3xl">This game isn't playable here yet</h1>
      <p>Its creator hasn't added a browser version. You can still add it to your class.</p>
      <Link to="/" className="btn-3d tone-leaf">
        Back to games
      </Link>
    </div>
  ),
});

function PlayPage() {
  const { game } = Route.useLoaderData();
  return <FeelingsFishing slug={game.slug} />;
}
