import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BadgeCheck,
  Frown,
  Loader2,
  Meh,
  MessageSquareQuote,
  RefreshCw,
  Smile,
  Star,
  TrendingDown,
} from "lucide-react";
import { ChunkyButton } from "@/components/chunky";
import type {
  DidItWork,
  InsightAction,
  InsightTheme,
  Review,
  Sentiment,
} from "@/lib/insights-data";
import { refreshInsights } from "@/lib/insights.functions";
import { cn } from "@/lib/utils";

/** Three headline numbers in one calm strip. */
export function StatStrip({ stats }: { stats: { value: string; label: string; sub: string }[] }) {
  return (
    <section
      aria-label="Headline stats"
      className="mb-10 grid gap-px overflow-hidden rounded-3xl bg-secondary sm:grid-cols-3"
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-muted px-6 py-5">
          <p className="text-4xl font-black leading-none">{s.value}</p>
          <p className="mt-2 font-extrabold">{s.label}</p>
          <p className="text-sm font-semibold text-muted-foreground">{s.sub}</p>
        </div>
      ))}
    </section>
  );
}

export type LabeledAction = InsightAction & { gameTitle?: string };

/** The star of the insights pages: numbered improvement cards on a soft green panel. */
export function ImprovementsPanel({
  title,
  sub,
  actions,
  action,
}: {
  title: string;
  sub: string;
  actions: LabeledAction[];
  action?: ReactNode;
}) {
  return (
    <section className="mb-12 rounded-3xl bg-primary-soft p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl">{title}</h2>
          <p className="text-sm font-bold text-primary-pressed">{sub}</p>
        </div>
        {action}
      </div>
      <ol className="grid gap-4 md:grid-cols-3">
        {actions.map((a, i) => (
          <li key={a.id} className="flex flex-col rounded-3xl bg-background p-5">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground"
                aria-label={`Priority ${i + 1}`}
              >
                {i + 1}
              </span>
              {a.gameTitle && (
                <Link
                  to="/insights/$id"
                  params={{ id: a.game_id }}
                  className="truncate rounded text-sm font-extrabold text-muted-foreground hover:text-info hover:underline"
                >
                  {a.gameTitle}
                </Link>
              )}
            </div>
            <h3 className="mb-2 text-lg leading-snug">{a.title}</h3>
            <p className="font-semibold text-muted-foreground">{a.evidence_summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Game-level Top 3 with the AI "Refresh insights" button (falls back to seeded actions). */
export function GameImprovements({ gameId, seeded }: { gameId: string; seeded: InsightAction[] }) {
  const refresh = useServerFn(refreshInsights);
  const [actions, setActions] = useState(seeded);
  const [source, setSource] = useState<"seed" | "ai" | "fallback">("seed");
  const [busy, setBusy] = useState(false);
  return (
    <ImprovementsPanel
      title="Top 3 things to improve"
      sub={
        source === "ai"
          ? "Fresh from your latest reviews and play data"
          : source === "fallback"
            ? "Couldn't refresh right now, showing your saved insights"
            : "Based on teacher reviews and where students drop off"
      }
      actions={busy ? seeded : actions}
      action={
        <ChunkyButton
          variant="ghost"
          disabled={busy}
          className="shrink-0"
          onClick={async () => {
            setBusy(true);
            try {
              const res = await refresh({ data: { gameId } });
              setActions(res.actions);
              setSource(res.source);
            } catch {
              setActions(seeded);
              setSource("fallback");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />
          ) : (
            <RefreshCw className="h-4 w-4" strokeWidth={3} />
          )}
          Refresh insights
        </ChunkyButton>
      }
    />
  );
}

const SENTIMENT: Record<Sentiment, { cls: string; Icon: typeof Smile; label: string }> = {
  positive: { cls: "bg-primary-soft text-primary-pressed", Icon: Smile, label: "Positive" },
  mixed: { cls: "bg-sun-soft text-foreground", Icon: Meh, label: "Mixed" },
  negative: { cls: "bg-danger-soft text-danger", Icon: Frown, label: "Negative" },
};

export function ThemesPanel({ themes }: { themes: InsightTheme[] }) {
  const [openId, setOpenId] = useState<string | null>(themes[0]?.id ?? null);
  const open = themes.find((t) => t.id === openId);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {themes.map((t) => {
          const s = SENTIMENT[t.sentiment];
          const isOpen = t.id === openId;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={isOpen}
              onClick={() => setOpenId(isOpen ? null : t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 font-extrabold transition hover:brightness-95",
                s.cls,
                isOpen && "ring-2 ring-foreground/20",
              )}
            >
              <s.Icon className="h-4 w-4" strokeWidth={3} aria-label={s.label} />
              {t.theme}
              <span className="text-sm opacity-70">{t.mention_count}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {open && (
          <figure className="mt-6 flex items-start gap-3">
            <MessageSquareQuote className="mt-1 h-5 w-5 shrink-0 text-info" strokeWidth={2.5} />
            <div>
              <blockquote className="text-lg font-semibold">
                “{open.example_quote.replace(/ \(.*\)$/, "")}”
              </blockquote>
              <figcaption className="mt-1 text-sm font-bold text-muted-foreground">
                {open.example_quote.match(/\((.*)\)$/)?.[1] ?? "A teacher"} · {open.mention_count}{" "}
                teachers mentioned this
              </figcaption>
            </div>
          </figure>
        )}
      </div>
    </div>
  );
}

function Tooltip({ children }: { children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-foreground px-3 py-1.5 text-xs font-extrabold text-background group-hover:block"
    >
      {children}
    </span>
  );
}

export function FunnelChart({ data }: { data: { level: number; pct: number }[] }) {
  const drops = data
    .slice(1)
    .map((d, i) => ({ level: d.level, drop: (data[i]?.pct ?? d.pct) - d.pct }));
  const biggest = drops.reduce<{ level: number; drop: number } | undefined>(
    (a, b) => (!a || b.drop > a.drop ? b : a),
    undefined,
  );
  return (
    <div className="max-w-2xl">
      <p className="mb-6 text-sm font-semibold text-muted-foreground">
        Share of class sessions that reached each level
      </p>
      <ul className="space-y-4">
        {data.map((d) => {
          const isBiggest = biggest && d.level === biggest.level && biggest.drop > 0;
          return (
            <li key={d.level} className="grid grid-cols-[72px_1fr] items-center gap-3">
              <span className="text-sm font-extrabold">
                Level {d.level}
                {d.level === 4 && (
                  <span className="block text-xs text-muted-foreground">Finish</span>
                )}
              </span>
              <div className="group relative flex items-center gap-3">
                <div className="h-8 flex-1 rounded-r-md bg-muted">
                  <div
                    className="h-full rounded-r-md bg-info transition-[width] duration-700"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-12 text-right font-black">{d.pct}%</span>
                <Tooltip>
                  {d.pct}% of sessions reached Level {d.level}
                </Tooltip>
              </div>
              {isBiggest && (
                <span className="col-start-2 -mt-2 inline-flex items-center gap-1 text-sm font-extrabold text-danger">
                  <TrendingDown className="h-4 w-4" strokeWidth={3} />
                  Biggest drop: −{biggest.drop} pts from Level {biggest.level - 1}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GradeChart({ data }: { data: { grade: string; pct: number; n: number }[] }) {
  return (
    <div className="max-w-md">
      <p className="mb-6 text-sm font-semibold text-muted-foreground">
        Teachers who said it worked (yes or partly)
      </p>
      <div className="flex h-56 items-end justify-around gap-4 border-b-2 border-secondary">
        {data.map((d) => (
          <div
            key={d.grade}
            className="group relative flex h-full w-16 flex-col items-center justify-end"
          >
            <span className="mb-1 font-black">{d.pct}%</span>
            <div
              className="w-full rounded-t-md bg-info transition-[height] duration-700"
              style={{ height: `${d.pct * 0.82}%` }}
            />
            <Tooltip>
              {d.grade} grade: {d.pct}% from {d.n} teachers
            </Tooltip>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-around gap-4">
        {data.map((d) => (
          <span key={d.grade} className="w-16 text-center text-sm font-extrabold">
            {d.grade}
          </span>
        ))}
      </div>
    </div>
  );
}

const WORKED: Record<DidItWork, { label: string; cls: string }> = {
  yes: { label: "It worked", cls: "text-primary-pressed" },
  partly: { label: "Partly worked", cls: "text-warning-pressed" },
  no: { label: "Didn't work", cls: "text-danger" },
};

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const sorted = [...reviews].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return (
    <ul className="divide-y-2 divide-secondary">
      {sorted.map((r) => (
        <li key={r.id} className="grid gap-2 py-4 md:grid-cols-[240px_1fr]">
          <div>
            <p className="flex flex-wrap items-center gap-2 font-extrabold">
              {r.educator_name}
              {r.verified_educator && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-info">
                  <BadgeCheck className="h-4 w-4" strokeWidth={2.5} /> Verified educator
                </span>
              )}
            </p>
            <p className="text-sm font-bold text-muted-foreground">
              {r.grade_used} grade · {r.class_size} students ·{" "}
              {new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="mb-1 flex flex-wrap items-center gap-3 text-sm">
              <span
                className="inline-flex items-center gap-0.5"
                aria-label={`${r.rating} out of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-4 w-4",
                      n <= r.rating ? "fill-sun text-sun" : "text-secondary",
                    )}
                    strokeWidth={2.5}
                  />
                ))}
              </span>
              <span className={cn("font-extrabold", WORKED[r.did_it_work].cls)}>
                {WORKED[r.did_it_work].label}
              </span>
            </p>
            <p className="font-semibold">{r.note}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
