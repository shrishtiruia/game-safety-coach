import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight, Clock, GraduationCap, Plus, SlidersHorizontal, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChunkyButton, StatusPill } from "@/components/chunky";
import { Container, useNavSearch } from "@/components/app-shell";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My submissions · SkillPlay Safety Check" },
      {
        name: "description",
        content: "See every game you've submitted and where it stands in safety review.",
      },
      { property: "og:title", content: "My submissions · SkillPlay Safety Check" },
      {
        property: "og:description",
        content: "See every game you've submitted and where it stands in safety review.",
      },
    ],
  }),
  component: Submissions,
});

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "Ready to check",
  in_review: "Checking",
  approved: "Approved",
  approved_with_notes: "Approved with notes",
  needs_changes: "Needs changes",
};

type Filters = { status: string[]; skill: string[]; grade: string[] };
const NO_FILTERS: Filters = { status: [], skill: [], grade: [] };

function Submissions() {
  const { data: games, isLoading } = useGames();
  const { query } = useNavSearch();
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);

  const options = useMemo(() => {
    const uniq = (xs: string[]) => [...new Set(xs)];
    return {
      status: uniq((games ?? []).map((g) => g.status)).map((v) => ({
        value: v,
        label: STATUS_LABEL[v] ?? v,
      })),
      skill: uniq((games ?? []).map((g) => g.skill)).map((v) => ({
        value: v,
        label: SKILL_LABEL[v] ?? v,
      })),
      grade: uniq((games ?? []).map((g) => g.grade_band)).map((v) => ({
        value: v,
        label: `Grades ${v}`,
      })),
    };
  }, [games]);

  const q = query.trim().toLowerCase();
  const visible = (games ?? []).filter(
    (g) =>
      (!filters.status.length || filters.status.includes(g.status)) &&
      (!filters.skill.length || filters.skill.includes(g.skill)) &&
      (!filters.grade.length || filters.grade.includes(g.grade_band)) &&
      (!q ||
        [g.title, g.maker_name, SKILL_LABEL[g.skill]].some((s) => s?.toLowerCase().includes(q))),
  );
  const activeCount = filters.status.length + filters.skill.length + filters.grade.length;

  const toggle = (key: keyof Filters, value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const panel = (
    <FilterPanel
      options={options}
      filters={filters}
      onToggle={toggle}
      onClear={() => setFilters(NO_FILTERS)}
    />
  );

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Your games</h1>
          <p className="font-semibold text-muted-foreground">
            Every game gets a safety check before it reaches classrooms.
          </p>
        </div>
        <ChunkyButton disabled title="Coming soon" className="shrink-0">
          <Plus className="h-5 w-5" strokeWidth={3} /> Submit a game
        </ChunkyButton>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">{panel}</div>
        </aside>
        <details className="group rounded-2xl border-2 border-secondary lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl p-4 font-extrabold hover:bg-muted">
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2.5} /> Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-info px-2 text-xs text-primary-foreground">
                {activeCount}
              </span>
            )}
            <ChevronRight
              className="ml-auto h-5 w-5 transition group-open:rotate-90"
              strokeWidth={3}
            />
          </summary>
          <div className="border-t-2 border-secondary p-4">{panel}</div>
        </details>

        <div>
          {isLoading && <p className="font-bold text-muted-foreground">Loading…</p>}
          {!isLoading && visible.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-secondary p-10 text-center">
              <p className="font-extrabold">No games match.</p>
              <button
                onClick={() => setFilters(NO_FILTERS)}
                className="mt-2 rounded font-extrabold text-info hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((g) => (
              <li key={g.id}>
                <GameCard game={g} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}

function GameCard({
  game: g,
}: {
  game: {
    id: string;
    title: string;
    maker_name: string;
    skill: string;
    grade_band: string;
    duration_minutes: number;
    format: string;
    status: string;
  };
}) {
  return (
    <Link
      to="/games/$id"
      params={{ id: g.id }}
      className="group flex h-full flex-col rounded-3xl border-2 border-b-4 border-secondary bg-card p-5 transition hover:-translate-y-0.5 hover:border-info hover:shadow-[0_6px_0_0_var(--color-secondary)] active:translate-y-0.5"
    >
      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-info">
        {SKILL_LABEL[g.skill]}
      </p>
      <h2 className="text-xl group-hover:text-info">{g.title}</h2>
      <p className="mb-4 text-sm font-bold text-muted-foreground">{g.maker_name}</p>
      <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-muted-foreground">
        <li className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4" strokeWidth={2.5} /> Grades {g.grade_band}
        </li>
        <li className="flex items-center gap-1">
          <Clock className="h-4 w-4" strokeWidth={2.5} /> {g.duration_minutes} min
        </li>
        <li className="flex items-center gap-1">
          <Users className="h-4 w-4" strokeWidth={2.5} /> {FORMAT_LABEL[g.format]}
        </li>
      </ul>
      <div className="mt-auto flex items-center justify-between gap-2">
        <StatusPill status={g.status} />
        <ChevronRight
          className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-info"
          strokeWidth={3}
        />
      </div>
    </Link>
  );
}

function FilterPanel({
  options,
  filters,
  onToggle,
  onClear,
}: {
  options: Record<keyof Filters, { value: string; label: string }[]>;
  filters: Filters;
  onToggle: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}) {
  const groups: { key: keyof Filters; title: string }[] = [
    { key: "status", title: "Status" },
    { key: "skill", title: "Skill" },
    { key: "grade", title: "Grade band" },
  ];
  const any = filters.status.length + filters.skill.length + filters.grade.length > 0;
  return (
    <div className="space-y-6">
      {groups.map(({ key, title }) => (
        <fieldset key={key}>
          <legend className="mb-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            {title}
          </legend>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
            {options[key].map((o) => {
              const on = filters[key].includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onToggle(key, o.value)}
                  className={cn(
                    "rounded-xl border-2 border-b-4 px-3 py-1.5 text-sm font-extrabold transition",
                    on ? "border-info bg-info-soft text-info" : "border-secondary hover:bg-muted",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {any && (
        <button
          onClick={onClear}
          className="rounded text-sm font-extrabold text-info hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
