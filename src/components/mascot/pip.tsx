import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PipPose =
  "idle" | "working" | "celebrating" | "thinking" | "oops" | "proud" | "waiting";
export type PipSize = "sm" | "md" | "lg";

const PX: Record<PipSize, number> = { sm: 48, md: 120, lg: 200 };

const C = {
  fur: "#8B5A2B",
  belly: "#E8C9A0",
  tail: "#5C3A1A",
  dark: "#2B1A0E",
  nose: "#3A2412",
  cheek: "#E8987A",
  log: "#C4843F",
  logEnd: "#E8B57A",
  logRing: "#A0662F",
  hat: "#E9B452",
  hatBrim: "#CA933E",
  water: "#7FA99A",
  ink: "#361C11",
};

/** Arm angles (degrees, around the shoulder; 0 = hanging straight down) and head tilt per pose. */
const POSE: Record<PipPose, { l: number; r: number; tilt: number; sitting?: boolean }> = {
  idle: { l: -25, r: 25, tilt: 0 },
  working: { l: -60, r: 60, tilt: 0 },
  celebrating: { l: 150, r: -150, tilt: 0 },
  thinking: { l: -20, r: -100, tilt: 8 },
  oops: { l: -20, r: -176, tilt: -6 },
  proud: { l: 58, r: -58, tilt: -4 },
  waiting: { l: -15, r: 15, tilt: 0, sitting: true },
};

const CONFETTI = [
  { dx: -46, dy: -40, rot: 140, c: "#267D30" },
  { dx: -30, dy: -58, rot: -90, c: "#7FA99A" },
  { dx: -8, dy: -64, rot: 200, c: "#E9B452" },
  { dx: 14, dy: -62, rot: -160, c: "#B54531" },
  { dx: 34, dy: -54, rot: 120, c: "#BF7B1F" },
  { dx: 50, dy: -36, rot: -220, c: "#267D30" },
  { dx: -56, dy: -16, rot: 90, c: "#BF7B1F" },
  { dx: 58, dy: -12, rot: -120, c: "#7FA99A" },
];

/**
 * Pip, the Kitbit beaver. One SVG, many poses.
 * Decorative by default (aria-hidden); pass `label` to announce it.
 */
export function Pip({
  pose = "idle",
  size = "md",
  accessory,
  hardHat,
  label,
  className,
}: {
  pose?: PipPose;
  size?: PipSize | number;
  /** Something to hold in the idle pose. */
  accessory?: "clipboard";
  /** Defaults to on for "working"; set it for e.g. an "oops" while patching. */
  hardHat?: boolean | undefined;
  label?: string | undefined;
  className?: string | undefined;
}) {
  const px = typeof size === "number" ? size : PX[size];
  const p = POSE[pose];
  const showHat = hardHat ?? pose === "working";
  const holding = pose === "working" ? "log" : pose === "idle" ? accessory : undefined;
  const arms =
    holding === "clipboard"
      ? { l: -50, r: 50 }
      : holding === "log"
        ? { l: -48, r: 48 }
        : { l: p.l, r: p.r };

  return (
    <svg
      viewBox="0 0 160 160"
      width={px}
      height={px}
      className={cn("pip shrink-0", `pip--${pose}`, className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {p.sitting && <Stream />}
      <g className="pip-root" transform={p.sitting ? "translate(6 6)" : undefined}>
        {/* Tail: flat paddle behind the body, pivoting at its base */}
        <g className="pip-tail">
          <ellipse
            cx="120"
            cy="128"
            rx="24"
            ry="10"
            fill={C.tail}
            transform="rotate(-18 120 128)"
          />
          <ellipse
            cx="124"
            cy="126"
            rx="12"
            ry="4"
            fill="#6E4622"
            transform="rotate(-18 124 126)"
          />
        </g>

        {/* Feet */}
        {p.sitting ? (
          <>
            <ellipse cx="66" cy="148" rx="13" ry="6" fill={C.tail} />
            <ellipse cx="94" cy="149" rx="13" ry="6" fill={C.tail} />
          </>
        ) : (
          <>
            <ellipse cx="66" cy="147" rx="11" ry="6" fill={C.tail} />
            <ellipse cx="94" cy="147" rx="11" ry="6" fill={C.tail} />
          </>
        )}

        <g className="pip-torso">
          <ellipse cx="80" cy="112" rx="34" ry="36" fill={C.fur} />
          <ellipse cx="80" cy="119" rx="22" ry="25" fill={C.belly} />

          {holding === "log" && <Log />}
          {holding === "clipboard" && <Clipboard />}

          <g className="pip-head" style={{ "--pip-tilt": `${p.tilt}deg` } as CSSProperties}>
            <circle cx="58" cy="38" r="9" fill={C.fur} />
            <circle cx="58" cy="39" r="4.5" fill={C.belly} />
            <circle cx="102" cy="38" r="9" fill={C.fur} />
            <circle cx="102" cy="39" r="4.5" fill={C.belly} />
            <circle cx="80" cy="62" r="28" fill={C.fur} />
            {showHat && <HardHat />}
            <g className="pip-eyes">
              <circle cx="70" cy="58" r="6.5" fill={C.dark} />
              <circle cx="90" cy="58" r="6.5" fill={C.dark} />
              <circle cx="72.2" cy="55.6" r="2.3" fill="#fff" />
              <circle cx="92.2" cy="55.6" r="2.3" fill="#fff" />
            </g>
            <circle cx="62" cy="70" r="4.5" fill={C.cheek} opacity="0.45" />
            <circle cx="98" cy="70" r="4.5" fill={C.cheek} opacity="0.45" />
            <ellipse cx="80" cy="72" rx="13" ry="9.5" fill={C.belly} />
            <rect x="76.2" y="76" width="3.6" height="7" rx="1.2" fill="#fff" />
            <rect x="80.2" y="76" width="3.6" height="7" rx="1.2" fill="#fff" />
            <ellipse cx="80" cy="66.5" rx="5" ry="3.6" fill={C.nose} />
            {pose === "oops" && (
              <path className="pip-sweat" d="M49 46 q-5 8 0 10 q5 -2 0 -10z" fill={C.water} />
            )}
          </g>

          <Arm side="l" x={54} angle={arms.l} cheerFrom={-110} bent={pose === "proud"} />
          <Arm side="r" x={106} angle={arms.r} cheerFrom={110} bent={pose === "proud"}>
            {pose === "thinking" && <MagnifyingGlass />}
          </Arm>
        </g>

        {pose === "celebrating" && (
          <g className="pip-confetti">
            {CONFETTI.map((c, i) => (
              <rect
                key={i}
                className="pip-confetti-piece"
                x="77"
                y="40"
                width="6"
                height="9"
                rx="2"
                fill={c.c}
                style={
                  {
                    "--dx": `${c.dx}px`,
                    "--dy": `${c.dy}px`,
                    "--rot": `${c.rot}deg`,
                  } as CSSProperties
                }
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

function Arm({
  side,
  x,
  angle,
  cheerFrom,
  bent,
  children,
}: {
  side: "l" | "r";
  x: number;
  angle: number;
  cheerFrom: number;
  /** Elbow bent back toward the body: hands on hips. */
  bent?: boolean;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} 96) rotate(${angle})`}>
      <g
        className={`pip-arm pip-arm-${side}`}
        style={{ "--pip-cheer-from": `${cheerFrom}deg` } as CSSProperties}
      >
        {bent ? (
          <>
            <rect x="-6.5" y="-5" width="13" height="24" rx="6.5" fill={C.fur} />
            <g transform={`translate(0 15) rotate(${side === "l" ? -100 : 100})`}>
              <rect x="-6" y="-4" width="12" height="20" rx="6" fill={C.fur} />
            </g>
          </>
        ) : (
          <rect x="-6.5" y="-5" width="13" height="30" rx="6.5" fill={C.fur} />
        )}
        {children}
      </g>
    </g>
  );
}

function HardHat() {
  return (
    <g>
      <path d="M54 46 a26 23 0 0 1 52 0 z" fill={C.hat} />
      <rect x="77" y="24" width="6" height="22" rx="3" fill={C.hatBrim} />
      <rect x="49" y="43" width="62" height="7" rx="3.5" fill={C.hatBrim} />
    </g>
  );
}

function Log() {
  return (
    <g>
      <rect x="34" y="106" width="96" height="20" rx="10" fill={C.log} />
      <rect x="42" y="112" width="40" height="3" rx="1.5" fill={C.logRing} opacity="0.35" />
      <circle cx="129" cy="116" r="10.5" fill={C.logEnd} />
      <circle cx="129" cy="116" r="6" fill={C.logRing} opacity="0.5" />
      <circle cx="129" cy="116" r="2.2" fill={C.logRing} />
    </g>
  );
}

function Clipboard() {
  return (
    <g>
      <rect x="65" y="100" width="30" height="36" rx="5" fill="#C98F5E" />
      <rect x="69" y="106" width="22" height="26" rx="2.5" fill="#fff" />
      <rect x="73" y="97" width="14" height="7" rx="2.5" fill="#B6ACA1" />
      <rect x="72" y="112" width="16" height="2.5" rx="1.25" fill="#E5E1DA" />
      <rect x="72" y="118" width="12" height="2.5" rx="1.25" fill="#E5E1DA" />
      <rect x="72" y="124" width="14" height="2.5" rx="1.25" fill="#267D30" />
    </g>
  );
}

/** Held in the right paw: the handle runs along the arm, the lens past the paw. */
function MagnifyingGlass() {
  return (
    <g className="pip-glass">
      <rect x="-2.5" y="22" width="5" height="10" rx="2.5" fill={C.tail} />
      <circle cx="0" cy="40" r="10" fill={C.ink} />
      <circle cx="0" cy="40" r="7" fill="#DEF1E1" />
      <circle cx="-2.5" cy="37.5" r="2" fill="#fff" />
    </g>
  );
}

function Stream() {
  return (
    <g>
      <rect x="-10" y="146" width="180" height="16" rx="8" fill={C.water} opacity="0.18" />
      <g className="pip-stream-wave">
        <path
          d="M-6 150 q8 -4 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0"
          stroke={C.water}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
      </g>
    </g>
  );
}
