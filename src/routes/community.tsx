import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Lightbulb, MessageCircle, Search, ShieldCheck, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Cover } from "@/components/kit";
import {
  CATEGORIES,
  ME,
  requests as seedRequests,
  threads as seedThreads,
  type Author,
  type CategoryId,
  type Thread,
} from "@/data/community";
import { getGame, getGames } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const TITLE = "Community — Kitbit";
const DESC =
  "Teachers sharing what works: game tips, classroom ideas and requests for new soft-skills games.";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: CommunityPage,
});

const card = "rounded-3xl bg-card p-5 md:p-6";
type Filter = CategoryId | "all";

function CommunityPage() {
  const [list, setList] = useState<Thread[]>(seedThreads);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(seedThreads[0]!.id);
  const [liked, setLiked] = useState<string[]>([]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.filter(
      (t) =>
        (filter === "all" || t.category === filter) &&
        (!needle || `${t.title} ${t.body}`.toLowerCase().includes(needle)),
    );
  }, [list, filter, q]);

  const toggleLike = (id: string) =>
    setLiked((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  return (
    <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl">Community</h1>
          <p className="max-w-2xl">
            Teachers sharing what works: how they run a game, what they changed, and what their
            class needs next.
          </p>
        </header>

        <Composer
          onPost={(t) => {
            setList((l) => [t, ...l]);
            setFilter("all");
            setOpen(t.id);
            toast.success("Posted to the community");
          }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Topic"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            {[{ id: "all" as const, label: "Everything" }, ...CATEGORIES].map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={filter === c.id}
                onClick={() => setFilter(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition",
                  filter === c.id ? "bg-leaf text-primary-foreground" : "bg-card hover:bg-muted",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <label className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full border-2 bg-card px-4">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search discussions"
              aria-label="Search discussions"
              className="h-10 w-full bg-transparent outline-none"
            />
          </label>
        </div>

        <ul className="space-y-4">
          {shown.map((t) => (
            <ThreadItem
              key={t.id}
              t={t}
              open={open === t.id}
              onToggle={() => setOpen(open === t.id ? null : t.id)}
              liked={liked.includes(t.id)}
              onLike={() => toggleLike(t.id)}
              onReply={(body) =>
                setList((l) =>
                  l.map((x) =>
                    x.id === t.id
                      ? {
                          ...x,
                          replies: [
                            ...x.replies,
                            { id: `r${Date.now()}`, author: ME, body, daysAgo: 0, helpful: 0 },
                          ],
                        }
                      : x,
                  ),
                )
              }
            />
          ))}
          {shown.length === 0 && (
            <li className={cn(card, "text-center text-muted-foreground")}>
              No discussions match that yet. Start one above.
            </li>
          )}
        </ul>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Requests />
        <TalkedAbout threads={list} />
        <div className="flex gap-3 rounded-3xl bg-muted p-5 text-sm">
          <ShieldCheck className="size-5 shrink-0" aria-hidden />
          <div className="space-y-1">
            <p className="font-extrabold">Community guidelines</p>
            <p>
              Never post a student's name or photo. Share what you tried, what happened and what
              you'd change.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- New post ---------------- */

function Composer({ onPost }: { onPost: (t: Thread) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CategoryId>("games");
  const [game, setGame] = useState("");
  const [expanded, setExpanded] = useState(false);
  const ready = title.trim().length > 4 && body.trim().length > 4;

  return (
    <form
      className={cn(card, "space-y-3")}
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onPost({
          id: `t${Date.now()}`,
          category,
          title: title.trim(),
          body: body.trim(),
          author: ME,
          gameSlug: game || undefined,
          daysAgo: 0,
          helpful: 0,
          replies: [],
        });
        setTitle("");
        setBody("");
        setGame("");
        setExpanded(false);
      }}
    >
      <label className="block">
        <span className="sr-only">Discussion title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder="Share a tip or ask other teachers a question"
          className="h-12 w-full rounded-2xl border-2 bg-background px-4 font-bold outline-none focus:border-leaf"
        />
      </label>
      {expanded && (
        <>
          <label className="block">
            <span className="sr-only">Details</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="What did you try? What happened? Keep student names out."
              className="w-full rounded-2xl border-2 bg-background px-4 py-3 outline-none focus:border-leaf"
            />
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm font-bold">
              <span className="block">Topic</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="h-10 rounded-xl border-2 bg-card px-3"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-bold">
              <span className="block">About a game (optional)</span>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="h-10 max-w-[16rem] rounded-xl border-2 bg-card px-3"
              >
                <option value="">No game</option>
                {getGames().map((g) => (
                  <option key={g.id} value={g.slug}>
                    {g.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={!ready}
              className="btn-3d tone-leaf ml-auto disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </>
      )}
    </form>
  );
}

/* ---------------- A discussion ---------------- */

function AuthorLine({ a, daysAgo }: { a: Author; daysAgo: number }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xl"
        aria-hidden
      >
        {a.emoji}
      </span>
      <div className="min-w-0 leading-tight">
        <p className="font-extrabold">
          {a.name}
          {a.creator && (
            <span className="ml-2 rounded-full bg-honey-soft px-2 py-0.5 align-middle text-[13px] font-bold">
              Creator
            </span>
          )}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {a.role} · {a.school} ·{" "}
          {daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`}
        </p>
      </div>
    </div>
  );
}

function ThreadItem({
  t,
  open,
  onToggle,
  liked,
  onLike,
  onReply,
}: {
  t: Thread;
  open: boolean;
  onToggle: () => void;
  liked: boolean;
  onLike: () => void;
  onReply: (body: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const game = t.gameSlug ? getGame(t.gameSlug) : undefined;
  const cat = CATEGORIES.find((c) => c.id === t.category);
  return (
    <li className={cn(card, "space-y-4")}>
      <AuthorLine a={t.author} daysAgo={t.daysAgo} />
      <div className="space-y-2">
        <h2 className="text-xl leading-snug md:text-2xl">{t.title}</h2>
        <p className={cn(!open && "line-clamp-2")}>{t.body}</p>
      </div>
      {game && (
        <Link
          to="/games/$slug"
          params={{ slug: game.slug }}
          className="flex w-fit items-center gap-3 rounded-2xl bg-muted p-2 pr-4 hover:bg-leaf-soft"
        >
          <span className="h-10 w-16 shrink-0 overflow-hidden rounded-xl">
            <Cover game={game} />
          </span>
          <span className="text-sm font-bold">{game.title}</span>
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
        {cat && <span className="rounded-full bg-muted px-3 py-1">{cat.label}</span>}
        <button
          type="button"
          onClick={onLike}
          aria-pressed={liked}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 transition",
            liked ? "bg-leaf-soft text-leaf-edge" : "hover:bg-muted",
          )}
        >
          <ThumbsUp className="size-4" aria-hidden /> Helpful · {t.helpful + (liked ? 1 : 0)}
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1 hover:bg-muted"
        >
          <MessageCircle className="size-4" aria-hidden />
          {t.replies.length} {t.replies.length === 1 ? "reply" : "replies"}
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div className="space-y-3 rounded-2xl bg-background p-4">
          {t.replies.map((r) => (
            <div key={r.id} className="space-y-2">
              <AuthorLine a={r.author} daysAgo={r.daysAgo} />
              <p className="pl-[52px]">{r.body}</p>
            </div>
          ))}
          <form
            className="flex gap-2 pt-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              onReply(draft.trim());
              setDraft("");
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a reply"
              aria-label={`Reply to ${t.title}`}
              className="h-11 min-w-0 flex-1 rounded-full border-2 bg-card px-4 outline-none focus:border-leaf"
            />
            <button
              type="submit"
              className="btn-3d tone-leaf !min-h-11 !py-1"
              disabled={!draft.trim()}
            >
              Reply
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

/* ---------------- Sidebar ---------------- */

function Requests() {
  const [list, setList] = useState(seedRequests);
  const [voted, setVoted] = useState<string[]>([]);
  return (
    <section aria-label="Game requests" className={cn(card, "space-y-3")}>
      <div>
        <h2 className="flex items-center gap-2 text-xl">
          <Lightbulb className="size-5 text-honey" aria-hidden /> Game requests
        </h2>
        <p className="text-sm text-muted-foreground">
          What teachers want next. Creators see these and pick them up.
        </p>
      </div>
      <ul className="space-y-2">
        {[...list]
          .sort((a, b) => b.votes - a.votes)
          .map((r) => {
            const on = voted.includes(r.id);
            return (
              <li key={r.id} className="flex gap-3 rounded-2xl bg-background p-3">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${on ? "Remove vote" : "Vote"} for ${r.title}`}
                  onClick={() => {
                    setVoted((v) => (on ? v.filter((x) => x !== r.id) : [...v, r.id]));
                    setList((l) =>
                      l.map((x) => (x.id === r.id ? { ...x, votes: x.votes + (on ? -1 : 1) } : x)),
                    );
                  }}
                  className={cn(
                    "flex h-fit w-12 shrink-0 flex-col items-center rounded-xl py-1.5 text-sm font-extrabold transition",
                    on ? "bg-leaf text-primary-foreground" : "bg-card hover:bg-muted",
                  )}
                >
                  <ThumbsUp className="size-4" aria-hidden />
                  {r.votes}
                </button>
                <div className="min-w-0">
                  <p className="font-extrabold leading-tight">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{r.detail}</p>
                  {r.status === "in-progress" && (
                    <p className="mt-1 text-[13px] font-bold text-leaf-edge">
                      {r.creator} is making this
                    </p>
                  )}
                </div>
              </li>
            );
          })}
      </ul>
      <button
        type="button"
        className="w-full rounded-2xl bg-muted py-2.5 text-sm font-extrabold hover:bg-leaf-soft"
        onClick={() => toast("Request form coming soon. For now, post it under Ask for help.")}
      >
        Request a game
      </button>
    </section>
  );
}

function TalkedAbout({ threads }: { threads: Thread[] }) {
  const counts = new Map<string, number>();
  for (const t of threads)
    if (t.gameSlug) counts.set(t.gameSlug, (counts.get(t.gameSlug) ?? 0) + 1 + t.replies.length);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (top.length === 0) return null;
  return (
    <section aria-label="Most discussed games" className={cn(card, "space-y-3")}>
      <h2 className="text-xl">Most discussed games</h2>
      <ul className="space-y-1">
        {top.map(([slug, n]) => {
          const g = getGame(slug);
          if (!g) return null;
          return (
            <li key={slug}>
              <Link
                to="/games/$slug"
                params={{ slug }}
                className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-muted"
              >
                <span className="h-10 w-16 shrink-0 overflow-hidden rounded-xl">
                  <Cover game={g} />
                </span>
                <span className="min-w-0 flex-1 truncate font-bold">{g.title}</span>
                <span className="text-sm text-muted-foreground">{n} posts</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
