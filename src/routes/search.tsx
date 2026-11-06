import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ActiveChips, FilterSidebar } from "@/components/filters";
import { EmptyState, GameCard } from "@/components/kit";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SKILLS } from "@/data/types";
import {
  emptyFilters,
  FILTER_KEYS,
  getCreators,
  getGames,
  parseFilters,
  searchGames,
  SORTS,
  type Filters,
} from "@/lib/catalog";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): Filters => parseFilters(s),
  head: () => ({
    meta: [
      { title: "Search games — Kitbit" },
      {
        name: "description",
        content: "Filter soft-skill classroom games by grade, skill, time, group size and device.",
      },
      { property: "og:title", content: "Search soft-skill games — Kitbit" },
      {
        property: "og:description",
        content: "Find the right classroom game by grade, skill, time and device.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const filters = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const set = (f: Filters) => navigate({ search: f, replace: true });
  const [text, setText] = useState(filters.q);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchGames(filters), [filters]);
  const activeCount = FILTER_KEYS.reduce((a, k) => a + filters[k].length, 0);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (q.length < 2) return [];
    return [
      ...getGames()
        .filter((g) => g.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map((g) => ({ kind: "Game", label: g.title })),
      ...SKILLS.filter((s) => s.includes(q))
        .slice(0, 3)
        .map((s) => ({ kind: "Skill", label: s })),
      ...getCreators()
        .filter((c) => c.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map((c) => ({ kind: "Creator", label: c.name })),
    ];
  }, [text]);

  const pick = (s: { kind: string; label: string }) => {
    setOpen(false);
    if (s.kind === "Skill") {
      setText("");
      set({ ...filters, q: "", skills: [...new Set([...filters.skills, s.label])] });
    } else {
      setText(s.label);
      set({ ...filters, q: s.label });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          set({ ...filters, q: text });
        }}
      >
        <div className="flex items-center gap-3 rounded-full border-4 border-border bg-card px-6 shadow-card focus-within:border-sky-edge">
          <Search className="size-7 text-honey" aria-hidden />
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Try “empathy”, “Patience Dam” or “Maya”"
            aria-label="Search games, skills and creators"
            aria-autocomplete="list"
            className="h-16 w-full bg-transparent text-2xl font-bold outline-none"
          />
          <button type="submit" className="btn-3d tone-honey">
            Search
          </button>
        </div>
        {open && suggestions.length > 0 && (
          <ul
            className="absolute inset-x-6 top-full z-30 mt-2 overflow-hidden rounded-lg bg-popover p-2 shadow-card"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s.kind + s.label}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={() => pick(s)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 text-left font-semibold capitalize hover:bg-muted"
                >
                  <span className="rounded-full bg-sky-soft px-2 text-xs font-bold normal-case">
                    {s.kind}
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto rounded-lg border bg-card p-5 shadow-card">
            <FilterSidebar filters={filters} onChange={set} />
          </div>
        </aside>
        <div className="min-w-0 flex-1 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Drawer>
              <DrawerTrigger className="btn-3d tone-cream lg:hidden">
                <SlidersHorizontal className="size-5" /> Filters
                {activeCount ? ` (${activeCount})` : ""}
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh] bg-background">
                <DrawerHeader>
                  <DrawerTitle className="text-2xl">Filters</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-auto px-5 pb-10">
                  <FilterSidebar filters={filters} onChange={set} />
                </div>
              </DrawerContent>
            </Drawer>
            <p className="text-xl font-bold" aria-live="polite">
              {results.length} {results.length === 1 ? "game" : "games"}
              {filters.q && ` for “${filters.q}”`}
            </p>
            <label className="ml-auto flex items-center gap-2 font-bold">
              Sort by
              <select
                value={filters.sort}
                onChange={(e) => set({ ...filters, sort: e.target.value })}
                className="min-h-11 rounded-full border-2 bg-card px-4 font-bold"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ActiveChips filters={filters} onChange={set} />
          {results.length === 0 ? (
            <EmptyState
              title="Pip couldn't find any games…"
              text="Try fewer filters or a different word!"
            >
              <button
                type="button"
                className="btn-3d tone-leaf"
                onClick={() => {
                  setText("");
                  set(emptyFilters);
                }}
              >
                Clear everything
              </button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-6">
              {results.map((g) => (
                <GameCard key={g.id} game={g} className="w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
