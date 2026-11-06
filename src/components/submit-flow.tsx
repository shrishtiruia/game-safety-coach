import { Check } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Container } from "@/components/app-shell";
import { GameTile } from "@/components/game-tile";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Details", "Safety check", "Result"] as const;

/** Shared frame for the four submit steps: a stepper, a title, then the step's content. */
export function SubmitFlow({
  step,
  title,
  sub,
  game,
  scene,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  title: ReactNode;
  sub?: ReactNode;
  /** The game being checked; shows its tile beside the title. */
  game?: { id: string; skill: string } | undefined;
  /** Optional mascot moment, shown to the right of the title. */
  scene?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Container className="max-w-[880px] py-10 sm:py-14">
      <ol aria-label="Submit steps" className="mb-10 flex items-center gap-3">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const current = n === step;
          return (
            <Fragment key={label}>
              {i > 0 && (
                <li
                  aria-hidden
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    done || current ? "bg-primary" : "bg-secondary",
                  )}
                />
              )}
              <li aria-current={current ? "step" : undefined} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black",
                    done || current
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={4} /> : n}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-extrabold sm:inline",
                    current ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
      <header className="mb-8 flex items-center gap-5">
        {game && <GameTile game={game} size="md" />}
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {sub && <p className="mt-1 font-semibold text-muted-foreground">{sub}</p>}
        </div>
        {scene && <div className="ml-auto hidden shrink-0 md:block">{scene}</div>}
      </header>
      {children}
    </Container>
  );
}
