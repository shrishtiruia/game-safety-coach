import { Clock, GraduationCap, Lightbulb, Users } from "lucide-react";
import { StatusPill } from "@/components/chunky";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";

type GameSummary = {
  title: string;
  maker_name: string;
  skill: string;
  grade_band: string;
  duration_minutes: number;
  format: string;
  status: string;
  description?: string;
};

/** Left-column card on the game pages: what the game is, at a glance. */
export function GameSummaryCard({
  game,
  showTitle = true,
}: {
  game: GameSummary;
  showTitle?: boolean;
}) {
  const facts = [
    { Icon: Lightbulb, label: SKILL_LABEL[game.skill] },
    { Icon: GraduationCap, label: `Grades ${game.grade_band}` },
    { Icon: Clock, label: `${game.duration_minutes} min` },
    { Icon: Users, label: FORMAT_LABEL[game.format] },
  ];
  return (
    <section className="rounded-3xl border-2 border-b-4 border-secondary p-6">
      {showTitle && (
        <>
          <h2 className="text-2xl">{game.title}</h2>
          <p className="mb-3 font-bold text-muted-foreground">{game.maker_name}</p>
        </>
      )}
      <StatusPill status={game.status} />
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {facts.map(({ Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm font-extrabold">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            {label}
          </li>
        ))}
      </ul>
      {game.description && (
        <p className="mt-5 line-clamp-5 border-t-2 border-secondary pt-4 text-sm font-semibold text-muted-foreground">
          {game.description}
        </p>
      )}
    </section>
  );
}
