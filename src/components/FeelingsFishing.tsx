// Feelings Fishing: a playable K-2 empathy game.
// Each round: read a short story, catch the fish with a feeling the character
// might have (name it), then share a time you felt it and act it out with a partner.
import { Link } from "@tanstack/react-router";
import { ArrowRight, Languages, RotateCcw, Users, Volume2, VolumeX, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PACKS, speak, stopSpeaking, type Lang, type Pack } from "@/components/feelings-i18n";
import { Pip } from "@/components/kit";
import { confetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

export type Feeling = "happy" | "sad" | "angry" | "scared" | "surprised" | "proud";

const FEELINGS: Record<Feeling, { body: string; fin: string }> = {
  happy: { body: "var(--star)", fin: "var(--honey)" },
  sad: { body: "var(--sky)", fin: "var(--sky-edge)" },
  angry: { body: "var(--berry)", fin: "var(--berry-edge)" },
  scared: { body: "var(--muted)", fin: "var(--border)" },
  surprised: { body: "var(--honey-soft)", fin: "var(--honey)" },
  proud: { body: "var(--leaf)", fin: "var(--leaf-edge)" },
};

interface Round {
  name: string;
  story: string;
  answers: Feeling[]; // any of these is a good answer
  why: string;
}

const ROUNDS: Round[] = [
  {
    name: "Leo",
    story: "Leo's block tower fell down right before he finished it.",
    answers: ["sad", "angry"],
    why: "He worked hard on it, and now it's gone.",
  },
  {
    name: "Ava",
    story: "Ava's grandma came to pick her up from school as a surprise!",
    answers: ["surprised", "happy"],
    why: "She didn't know Grandma was coming, and she loves her.",
  },
  {
    name: "Sam",
    story: "Sam has to sing a song alone in front of the whole class.",
    answers: ["scared"],
    why: "Doing something new with everyone watching can feel scary.",
  },
  {
    name: "Zara",
    story: "Zara tied her shoes all by herself for the very first time.",
    answers: ["proud", "happy"],
    why: "She kept practising until she could do it.",
  },
  {
    name: "Omar",
    story: "Someone took Omar's turn on the swing without asking.",
    answers: ["angry", "sad"],
    why: "It wasn't fair, and he was waiting for his turn.",
  },
];

type Phase = "catch" | "share" | "act" | "done";

export function FeelingsFishing({ slug }: { slug: string }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("catch");
  const [caught, setCaught] = useState<Feeling | null>(null);
  const [miss, setMiss] = useState<{ feeling: Feeling; n: number } | null>(null);
  const [misses, setMisses] = useState(0);
  const [xp, setXp] = useState(0);
  const [partner, setPartner] = useState(true);
  const [landing, setLanding] = useState<Feeling | null>(null);
  const [lang, setLangState] = useState<Lang>("en");
  const [readAloud, setReadAloud] = useState(false);

  // Remember the language and read-aloud choice on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb-ff-lang") as Lang | null;
      if (saved && saved in PACKS) setLangState(saved);
      if (localStorage.getItem("kb-ff-read") === "1") setReadAloud(true);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("kb-ff-lang", l);
    } catch {
      /* storage unavailable */
    }
  };
  const toggleRead = () => {
    const on = !readAloud;
    setReadAloud(on);
    if (!on) stopSpeaking();
    try {
      localStorage.setItem("kb-ff-read", on ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  };

  const r = ROUNDS[round]!;
  const P = PACKS[lang];
  const E = PACKS.en;
  const bilingual = lang !== "en";
  const text = P.stories[round]!;

  // What's on screen, as one line to read aloud.
  const spoken =
    phase === "catch"
      ? `${text.story} ${P.ask(r.name)}`
      : phase === "share" && caught
        ? `${P.yes(r.name, P.feeling[caught])} ${text.why} ${P.shareTitle}. ${P.share(P.feeling[caught], partner)}`
        : phase === "act" && caught
          ? `${P.actTitle}. ${P.act(P.feeling[caught], partner)}`
          : "";
  useEffect(() => {
    if (readAloud && spoken) speak(spoken, P.speech);
  }, [readAloud, spoken, P.speech]);
  useEffect(() => {
    if (readAloud && miss)
      speak(
        miss.n >= 2
          ? P.missHint(P.feeling[miss.feeling])
          : P.missTry(r.name, P.feeling[miss.feeling]),
        P.speech,
      );
  }, [miss]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSpeaking(), []);
  const last = round === ROUNDS.length - 1;

  const catchFish = (f: Feeling) => {
    if (phase !== "catch") return;
    if (landing) return;
    if (r.answers.includes(f)) {
      setCaught(f);
      setMiss(null);
      setXp((x) => x + 10);
      setLanding(f);
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(
        () => {
          setLanding(null);
          setPhase("share");
        },
        reduce ? 0 : 750,
      );
    } else {
      setMiss({ feeling: f, n: (miss?.n ?? 0) + 1 });
      setMisses((m) => m + 1);
    }
  };

  const next = () => {
    if (phase === "share") return setPhase("act");
    setXp((x) => x + 5);
    if (last) {
      setPhase("done");
      return;
    }
    setRound((n) => n + 1);
    setPhase("catch");
    setCaught(null);
    setMiss(null);
  };

  const restart = () => {
    setRound(0);
    setPhase("catch");
    setCaught(null);
    setMiss(null);
    setMisses(0);
    setXp(0);
  };

  useEffect(() => {
    if (phase === "done") confetti();
  }, [phase]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
      <header className="flex flex-wrap items-center gap-4">
        <Link
          to="/games/$slug"
          params={{ slug }}
          className="grid size-11 place-items-center rounded-full bg-card hover:bg-muted"
          aria-label="Quit game"
        >
          <X className="size-5" />
        </Link>
        <div
          className="flex flex-1 items-center gap-2"
          aria-label={`Round ${Math.min(round + 1, 5)} of 5`}
        >
          {ROUNDS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-4 flex-1 rounded-full transition-colors",
                i < round || phase === "done" ? "bg-leaf" : i === round ? "bg-honey" : "bg-muted",
              )}
            />
          ))}
        </div>
        <span className="flex items-center gap-1 font-display text-lg font-extrabold text-honey">
          <Zap className="size-5" aria-hidden /> {xp} XP
        </span>
      </header>

      {phase !== "done" && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-full bg-card py-1 pl-3 pr-1 text-sm font-bold">
            <Languages className="size-4 text-honey" aria-hidden />
            <span>Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="h-9 rounded-full bg-muted px-3 font-bold"
            >
              {(Object.keys(PACKS) as Lang[]).map((l) => (
                <option key={l} value={l}>
                  {PACKS[l].label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={readAloud}
            onClick={toggleRead}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition",
              readAloud ? "bg-leaf text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {readAloud ? (
              <Volume2 className="size-4" aria-hidden />
            ) : (
              <VolumeX className="size-4" aria-hidden />
            )}
            Read aloud {readAloud ? "on" : "off"}
          </button>
          {bilingual && (
            <span className="text-sm text-muted-foreground">English is shown underneath.</span>
          )}
        </div>
      )}

      {phase === "done" ? (
        <Finish xp={xp} misses={misses} slug={slug} onRestart={restart} />
      ) : (
        <>
          <section
            aria-live="polite"
            className="flex items-start gap-4 rounded-3xl bg-card p-5 md:p-6"
          >
            <Pip
              pose={phase === "catch" ? "search" : "wave"}
              className="size-20 shrink-0 md:size-24"
            />
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-muted-foreground">
                  {P.storyOf(round + 1, ROUNDS.length)}
                </p>
                <HearButton onClick={() => speak(spoken, P.speech)} />
              </div>
              <h1 className="text-2xl leading-snug md:text-3xl" lang={P.speech}>
                {text.story}
              </h1>
              {phase === "catch" && (
                <p className="text-lg" lang={P.speech}>
                  {P.ask(r.name)}
                </p>
              )}
              {phase !== "catch" && caught && (
                <p className="text-lg" lang={P.speech}>
                  <strong>{P.yes(r.name, P.feeling[caught])}</strong> {text.why}
                </p>
              )}
              {bilingual && (
                <p className="text-sm text-muted-foreground" lang="en">
                  {E.stories[round]!.story}{" "}
                  {phase === "catch"
                    ? E.ask(r.name)
                    : caught
                      ? `${E.yes(r.name, caught)} ${E.stories[round]!.why}`
                      : ""}
                </p>
              )}
            </div>
          </section>

          {phase === "catch" ? (
            <Pond
              pack={P}
              bilingual={bilingual}
              onCatch={catchFish}
              landing={landing}
              wiggle={miss?.feeling}
              hint={miss && miss.n >= 2 ? r.answers[0] : undefined}
            />
          ) : (
            <TalkCard
              phase={phase}
              feeling={caught!}
              partner={partner}
              last={last}
              onNext={next}
              pack={P}
              bilingual={bilingual}
            />
          )}

          {phase === "catch" && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-h-6 text-base font-bold" aria-live="polite">
                {miss &&
                  (miss.n >= 2
                    ? P.missHint(P.feeling[miss.feeling])
                    : P.missTry(r.name, P.feeling[miss.feeling]))}
              </p>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--leaf)]"
                  checked={partner}
                  onChange={(e) => setPartner(e.target.checked)}
                />
                <Users className="size-4" aria-hidden /> Playing with a partner
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- The pond ---------------- */

const LANES = [3, 23, 43, 63]; // vertical positions in %, spaced so a fish and its label clear the lane below

function Pond({
  pack,
  bilingual,
  onCatch,
  landing,
  wiggle,
  hint,
}: {
  pack: Pack;
  bilingual: boolean;
  onCatch: (f: Feeling) => void;
  landing: Feeling | null;
  wiggle?: Feeling | undefined;
  hint?: Feeling | undefined;
}) {
  const fish = useMemo(
    () =>
      (Object.keys(FEELINGS) as Feeling[]).map((f, i) => ({
        f,
        // Fish that share a lane share a speed and swim half a lap apart, so they never overlap.
        top: LANES[i % LANES.length]!,
        dur: 17 + (i % LANES.length) * 2,
        delay: i >= LANES.length ? -(17 + (i % LANES.length) * 2) / 2 : -(i % LANES.length) * 3,
        reverse: i % 2 === 1,
      })),
    [],
  );
  return (
    <div
      className={cn(
        "kb-pond relative h-[480px] overflow-hidden rounded-[2rem] bg-sky-soft md:h-[540px]",
        landing && "kb-pond-still",
      )}
      role="group"
      aria-label="The pond. Each fish is a feeling."
    >
      <PondScene />
      {fish.map(({ f, top, dur, delay, reverse }) => (
        <button
          key={f}
          type="button"
          onClick={() => onCatch(f)}
          aria-label={bilingual ? `${pack.feeling[f]} (${f}) fish` : `${f} fish`}
          className={cn(
            "kb-fish absolute z-10 flex w-[136px] flex-col items-center gap-1 rounded-3xl p-1 focus-visible:[animation-play-state:paused] hover:[animation-play-state:paused] md:w-[156px]",
            reverse && "kb-fish-rev",
            hint === f && "kb-fish-hint",
          )}
          style={{ top: `${top}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
        >
          <span
            className={cn(
              "relative block",
              wiggle === f && "kb-wiggle",
              landing === f && "kb-jump",
            )}
          >
            <span className="kb-bob block" style={{ animationDelay: `${delay / 3}s` }}>
              <FishArt feeling={f} flip={reverse} />
            </span>
            {landing === f && <Splash />}
          </span>
          <span className="flex flex-col items-center rounded-2xl bg-card px-3 py-0.5 leading-tight shadow-[0_3px_0_var(--sky-edge)]">
            <span className="font-display text-base font-extrabold capitalize" lang={pack.speech}>
              {pack.feeling[f]}
            </span>
            {bilingual && (
              <span className="text-[13px] font-bold capitalize text-muted-foreground">{f}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

/** Water bands, lily pads, reeds, pebbles, rising bubbles and ripples. Decoration only. */
function PondScene() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* light on the surface and a deeper band below */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0 H400 V18 Q 350 28 300 18 T 200 18 T 100 18 T 0 18 Z"
          fill="var(--card)"
          fillOpacity="0.45"
        />
        <path
          d="M0 150 Q 50 138 100 150 T 200 150 T 300 150 T 400 150 V200 H0 Z"
          fill="var(--sky)"
          fillOpacity="0.35"
        />
        <path
          d="M0 176 Q 60 166 120 176 T 240 176 T 360 176 T 400 176 V200 H0 Z"
          fill="var(--sky-edge)"
          fillOpacity="0.25"
        />
      </svg>
      {/* pebbles on the bottom */}
      <svg
        className="absolute inset-x-0 bottom-0 h-10 w-full"
        viewBox="0 0 400 40"
        preserveAspectRatio="xMidYMax slice"
      >
        {[
          [30, 32, 10],
          [52, 35, 6],
          [120, 33, 8],
          [210, 34, 11],
          [232, 36, 5],
          [300, 33, 9],
          [372, 35, 7],
        ].map(([x, y, r]) => (
          <ellipse
            key={x}
            cx={x}
            cy={y}
            rx={r! * 1.6}
            ry={r}
            fill="var(--honey-soft)"
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}
      </svg>
      {/* reeds at both edges */}
      <Reeds className="absolute -left-2 bottom-0 h-40 md:h-52" />
      <Reeds className="absolute -right-2 bottom-0 h-36 -scale-x-100 md:h-48" />
      {/* lily pads */}
      <LilyPad className="absolute left-[6%] top-[6%] w-20 md:w-24" flower />
      <LilyPad className="absolute right-[10%] top-[3%] w-16 rotate-45 md:w-20" />
      <LilyPad className="absolute left-[46%] top-[1%] w-12 -rotate-12" />
      {/* bubbles and ripples */}
      {[12, 31, 58, 77, 91].map((x, i) => (
        <span
          key={x}
          className="kb-bubble absolute bottom-6 block size-3 rounded-full border-2 border-card/80"
          style={{
            left: `${x}%`,
            animationDelay: `${i * 1.7}s`,
            animationDuration: `${6 + (i % 3)}s`,
          }}
        />
      ))}
      {[
        [22, 70],
        [68, 28],
        [84, 62],
      ].map(([x, y], i) => (
        <span
          key={x}
          className="kb-ripple absolute block h-6 w-16 rounded-[50%] border-2 border-card/70"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 1.3}s` }}
        />
      ))}
    </div>
  );
}

function LilyPad({ className, flower }: { className?: string; flower?: boolean }) {
  return (
    <svg viewBox="0 0 100 80" className={className}>
      <path d="M50 40 L84 22 A 44 34 0 1 1 64 8 Z" fill="var(--leaf)" fillOpacity="0.55" />
      <path
        d="M50 40 L20 30 M50 40 L28 60 M50 40 L62 70 M50 40 L88 50"
        stroke="var(--leaf-edge)"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      {flower && (
        <g transform="translate(30 30)">
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse
              key={a}
              cx="0"
              cy="-9"
              rx="5"
              ry="10"
              fill="var(--berry-soft)"
              stroke="var(--berry)"
              strokeOpacity="0.4"
              transform={`rotate(${a})`}
            />
          ))}
          <circle r="5" fill="var(--star)" />
        </g>
      )}
    </svg>
  );
}

function Reeds({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 160" className={className}>
      {[
        [12, 18, -4],
        [24, 4, 2],
        [36, 26, 5],
        [46, 40, 8],
      ].map(([x, y, lean]) => (
        <g key={x}>
          <path
            d={`M${x} 160 Q ${x! + lean!} ${(160 + y!) / 2} ${x! + lean! * 2} ${y! + 26}`}
            stroke="var(--leaf-edge)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <rect x={x! + lean! * 2 - 4} y={y} width="8" height="28" rx="4" fill="var(--honey)" />
        </g>
      ))}
      <path
        d="M4 160 Q 10 110 2 70 M18 160 Q 30 120 26 90"
        stroke="var(--leaf)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Splash() {
  return (
    <svg
      viewBox="0 0 120 60"
      className="kb-splash pointer-events-none absolute -bottom-6 left-1/2 w-32 -translate-x-1/2"
      aria-hidden
    >
      <ellipse cx="60" cy="40" rx="44" ry="10" fill="none" stroke="var(--card)" strokeWidth="3" />
      {[
        [30, 22],
        [48, 10],
        [72, 10],
        [90, 22],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="4" fill="var(--card)" />
      ))}
    </svg>
  );
}

function FishArt({ feeling, flip, big }: { feeling: Feeling; flip?: boolean; big?: boolean }) {
  const c = FEELINGS[feeling];
  return (
    <svg
      viewBox="0 0 140 90"
      className={cn(
        big ? "h-28 w-44" : "h-[68px] w-28 md:h-[76px] md:w-[120px]",
        flip && "-scale-x-100",
      )}
      aria-hidden
    >
      {/* tail wags from where it meets the body */}
      <path
        className="kb-tail"
        style={{ transformOrigin: "24px 45px", transformBox: "view-box" }}
        d="M24 45 L3 22 Q 12 45 3 68 Z"
        fill={c.fin}
      />
      {/* top fin */}
      <path d="M56 18 Q 70 -2 94 14 Q 80 15 72 24 Z" fill={c.fin} />
      {/* body */}
      <path
        d="M20 45 C 34 12, 98 8, 124 40 Q 129 45 124 50 C 98 82, 34 78, 20 45 Z"
        fill={c.body}
        stroke={c.fin}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* belly */}
      <path
        d="M36 55 C 58 72, 98 72, 118 53 C 98 62, 58 64, 36 55 Z"
        fill="var(--card)"
        fillOpacity="0.45"
      />
      {/* scales */}
      <g fill="none" stroke={c.fin} strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round">
        <path d="M44 36 q 6 6 0 12" />
        <path d="M54 30 q 6 6 0 12" />
        <path d="M54 46 q 6 6 0 12" />
        <path d="M64 38 q 6 6 0 12" />
      </g>
      {/* side fin */}
      <path d="M70 52 Q 80 64 66 70 Q 63 61 70 52 Z" fill={c.fin} fillOpacity="0.85" />
      {/* cheek */}
      <circle cx="104" cy="54" r="5" fill="var(--berry)" fillOpacity="0.22" />
      <g transform="translate(18 4)">
        <Face feeling={feeling} />
      </g>
    </svg>
  );
}

/** Faces sit on the right of the fish (its front). */
function Face({ feeling }: { feeling: Feeling }) {
  const ink = "var(--foreground)";
  const eyes = (
    <>
      <circle cx="74" cy="34" r="4.5" fill={ink} />
      <circle cx="90" cy="34" r="4.5" fill={ink} />
      <circle cx="75.5" cy="32.5" r="1.5" fill="var(--card)" />
      <circle cx="91.5" cy="32.5" r="1.5" fill="var(--card)" />
    </>
  );
  switch (feeling) {
    case "happy":
      return (
        <g>
          {eyes}
          <path
            d="M72 46 Q 82 56 92 46"
            stroke={ink}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "sad":
      return (
        <g>
          {eyes}
          <path
            d="M72 54 Q 82 45 92 54"
            stroke={ink}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M90 40 q 3 6 0 9 q -3 -3 0 -9" fill="var(--sky-edge)" />
        </g>
      );
    case "angry":
      return (
        <g>
          {eyes}
          <path
            d="M68 26 L79 30 M96 26 L85 30"
            stroke={ink}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path d="M73 52 L91 52" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    case "scared":
      return (
        <g>
          <circle cx="74" cy="33" r="5.5" fill="var(--card)" stroke={ink} strokeWidth="2" />
          <circle cx="90" cy="33" r="5.5" fill="var(--card)" stroke={ink} strokeWidth="2" />
          <circle cx="74" cy="33" r="2" fill={ink} />
          <circle cx="90" cy="33" r="2" fill={ink} />
          <path
            d="M71 51 q 3 -4 6 0 t 6 0 t 6 0 t 4 0"
            stroke={ink}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "surprised":
      return (
        <g>
          <path
            d="M68 24 Q 74 20 80 24 M84 24 Q 90 20 96 24"
            stroke={ink}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {eyes}
          <ellipse cx="82" cy="50" rx="5" ry="7" fill={ink} />
        </g>
      );
    case "proud":
      return (
        <g>
          <path
            d="M70 34 Q 74 30 78 34 M86 34 Q 90 30 94 34"
            stroke={ink}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M71 45 Q 82 57 93 45 Z" fill={ink} />
          <path
            d="M40 30 l 3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 Z"
            fill="var(--star)"
            stroke="var(--leaf-edge)"
            strokeWidth="1.5"
          />
        </g>
      );
  }
}

/* ---------------- Share it / Act it out ---------------- */

function TalkCard({
  phase,
  feeling,
  partner,
  last,
  onNext,
  pack,
  bilingual,
}: {
  phase: "share" | "act";
  feeling: Feeling;
  partner: boolean;
  last: boolean;
  onNext: () => void;
  pack: Pack;
  bilingual: boolean;
}) {
  const share = phase === "share";
  const E = PACKS.en;
  const title = share ? pack.shareTitle : pack.actTitle;
  const body = share
    ? pack.share(pack.feeling[feeling], partner)
    : pack.act(pack.feeling[feeling], partner);
  return (
    <section className="grid items-center gap-6 rounded-[2rem] bg-leaf-soft p-6 md:grid-cols-[auto_1fr] md:p-8">
      <div className="kb-bob mx-auto">
        <FishArt feeling={feeling} big />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl" lang={pack.speech}>
            {title}
          </h2>
          <HearButton onClick={() => speak(`${title}. ${body}`, pack.speech)} />
        </div>
        <p className="max-w-xl text-lg" lang={pack.speech}>
          {body}
        </p>
        {bilingual && (
          <p className="max-w-xl text-sm text-muted-foreground" lang="en">
            {share ? E.share(feeling, partner) : E.act(feeling, partner)}
          </p>
        )}
        <button type="button" className="btn-3d tone-leaf" onClick={onNext} autoFocus>
          {share ? pack.shared : last ? pack.finish : pack.next}{" "}
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    </section>
  );
}

function HearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Hear it"
      title="Hear it"
      className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-honey transition hover:bg-honey-soft active:scale-95"
    >
      <Volume2 className="size-5" />
    </button>
  );
}

/* ---------------- Finish ---------------- */

function Finish({
  xp,
  misses,
  slug,
  onRestart,
}: {
  xp: number;
  misses: number;
  slug: string;
  onRestart: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-[2rem] bg-card p-8 text-center md:p-12">
      <Pip pose="trophy" className="size-40" bob />
      <h1 className="text-4xl">You caught every feeling!</h1>
      <p className="max-w-lg text-lg">
        You named 5 feelings, shared 5 stories and acted out 5 faces. That's real empathy practice.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <span className="rounded-full bg-honey-soft px-4 py-2 font-display text-lg font-extrabold">
          +{xp} XP
        </span>
        <span className="rounded-full bg-leaf-soft px-4 py-2 font-display text-lg font-extrabold">
          Empathy Explorer progress
        </span>
        <span className="rounded-full bg-muted px-4 py-2 font-display text-lg font-extrabold">
          {misses === 0
            ? "No wrong catches"
            : `${misses} ${misses === 1 ? "try" : "tries"} to learn from`}
        </span>
      </div>
      <p className="max-w-lg text-sm text-muted-foreground">
        For teachers: ask the class which story had more than one right feeling. (Leo, Ava, Zara and
        Omar's did.)
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button type="button" className="btn-3d tone-cream" onClick={onRestart}>
          <RotateCcw className="size-5" aria-hidden /> Play again
        </button>
        <Link to="/games/$slug" params={{ slug }} className="btn-3d tone-leaf">
          Back to the game page
        </Link>
      </div>
    </section>
  );
}
