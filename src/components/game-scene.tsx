import type { ReactNode } from "react";
import { Pip, type PipPose } from "@/components/mascot";
import { cn } from "@/lib/utils";

/**
 * Flat cover scenes for marketplace games, drawn in Pip's style: the shared SVG
 * beaver (held still) in a simple setting, using the Kitbit palette.
 * Each scene redraws one of the original painted covers.
 */
export type SceneKey =
  | "pond"
  | "dam"
  | "treehouse"
  | "raft"
  | "stage"
  | "puzzle"
  | "creek"
  | "cards"
  | "log"
  | "clicks"
  | "tower"
  | "telephone";

/** Original cover order (coverIndex 0–11). */
export const SCENES: SceneKey[] = [
  "pond",
  "dam",
  "treehouse",
  "raft",
  "stage",
  "puzzle",
  "creek",
  "cards",
  "log",
  "clicks",
  "tower",
  "telephone",
];

const C = {
  sky: "#EEF3E6",
  cloud: "#FBF9F4",
  grass: "#9CBC82",
  grassDark: "#7FA567",
  leaf: "#267D30",
  canopy: "#5E9455",
  water: "#8FB7A8",
  waterDark: "#76A291",
  ripple: "#C9DFD6",
  wood: "#A0662F",
  woodLight: "#C98F5E",
  woodEnd: "#E8B57A",
  honey: "#925019",
  brick: "#B54531",
  amber: "#BF7B1F",
  star: "#E9B452",
  sage: "#AAC6AF",
  cream: "#F7F1E6",
  ink: "#361C11",
  white: "#FFFFFF",
};

/** Pip placed in scene coordinates: (x, y) is the top-left of a size×size box. */
function PipAt({
  x,
  y,
  size,
  pose,
  hardHat,
  flip,
}: {
  x: number;
  y: number;
  size: number;
  pose: PipPose;
  hardHat?: boolean;
  flip?: boolean;
}) {
  const t = flip ? `translate(${x + size} ${y}) scale(-1 1)` : `translate(${x} ${y})`;
  return (
    <g transform={t}>
      <Pip pose={pose} size={size} hardHat={hardHat} className="pip--still" />
    </g>
  );
}

const Sky = () => (
  <>
    <rect width="320" height="192" fill={C.sky} />
    <ellipse cx="62" cy="34" rx="26" ry="10" fill={C.cloud} />
    <ellipse cx="250" cy="26" rx="32" ry="11" fill={C.cloud} />
  </>
);

const Hills = ({ y = 128 }: { y?: number }) => (
  <>
    <path d={`M0 ${y} Q 80 ${y - 26} 170 ${y - 6} T 320 ${y - 14} V192 H0Z`} fill={C.grassDark} />
    <path d={`M0 ${y + 14} Q 110 ${y - 6} 220 ${y + 8} T 320 ${y + 4} V192 H0Z`} fill={C.grass} />
  </>
);

const Tree = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-5" y="0" width="10" height="34" rx="3" fill={C.wood} />
    <circle cx="0" cy="-8" r="22" fill={C.canopy} />
    <circle cx="-14" cy="2" r="14" fill={C.canopy} />
    <circle cx="14" cy="2" r="14" fill={C.canopy} />
  </g>
);

const Water = ({ y }: { y: number }) => (
  <>
    <rect x="0" y={y} width="320" height={192 - y} fill={C.water} />
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${30 + i * 100} ${y + 22 + (i % 2) * 18} q 12 -6 24 0 t 24 0`}
        stroke={C.ripple}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    ))}
  </>
);

const Log = ({ x, y, w = 70 }: { x: number; y: number; w?: number }) => (
  <g>
    <rect x={x} y={y} width={w} height="16" rx="8" fill={C.woodLight} />
    <ellipse cx={x + w - 4} cy={y + 8} rx="7" ry="8" fill={C.woodEnd} />
    <ellipse cx={x + w - 4} cy={y + 8} rx="3" ry="3.5" fill={C.wood} />
  </g>
);

const Fish = ({ x, y, color, heart }: { x: number; y: number; color: string; heart?: boolean }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M12 0 l10 -7 v14z" fill={color} />
    {heart ? (
      <path d="M0 -2 c0 -8 -12 -8 -12 0 c0 6 12 12 12 12 c0 0 12 -6 12 -12 c0 -8 -12 -8 -12 0z" fill={color} />
    ) : (
      <circle r="11" fill={color} />
    )}
    <circle cx="-3" cy="-2" r="1.8" fill={C.ink} />
    <circle cx="4" cy="-2" r="1.8" fill={C.ink} />
    <path d="M-3 3 q3.5 3 7 0" stroke={C.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </g>
);

const Critter = ({ x, y, color, ears = "round" }: { x: number; y: number; color: string; ears?: "round" | "long" | "pointy" }) => (
  <g transform={`translate(${x} ${y})`}>
    {ears === "round" && (
      <>
        <circle cx="-11" cy="-12" r="6" fill={color} />
        <circle cx="11" cy="-12" r="6" fill={color} />
      </>
    )}
    {ears === "long" && (
      <>
        <rect x="-10" y="-34" width="7" height="24" rx="3.5" fill={color} />
        <rect x="3" y="-34" width="7" height="24" rx="3.5" fill={color} />
      </>
    )}
    {ears === "pointy" && (
      <>
        <path d="M-15 -6 l4 -16 l9 10z" fill={color} />
        <path d="M15 -6 l-4 -16 l-9 10z" fill={color} />
      </>
    )}
    <circle r="16" fill={color} />
    <circle cx="-5" cy="-2" r="2.2" fill={C.ink} />
    <circle cx="5" cy="-2" r="2.2" fill={C.ink} />
    <ellipse cy="5" rx="5" ry="3.5" fill={C.cream} />
  </g>
);

const SCENE_ART: Record<SceneKey, () => ReactNode> = {
  pond: () => (
    <>
      <Sky />
      <Hills y={92} />
      <Water y={112} />
      <ellipse cx="60" cy="168" rx="20" ry="6" fill={C.leaf} />
      <ellipse cx="270" cy="150" rx="16" ry="5" fill={C.leaf} />
      <path d="M150 62 L232 36 L232 128" stroke={C.wood} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M232 36 V128" stroke={C.ink} strokeWidth="1" />
      <Fish x={232} y={138} color={C.brick} heart />
      <Fish x={150} y={160} color={C.star} />
      <Fish x={292} y={176} color={C.sage} />
      <PipAt x={64} y={36} size={110} pose="proud" />
    </>
  ),
  dam: () => (
    <>
      <Sky />
      <Hills y={100} />
      <Water y={140} />
      {[0, 1, 2, 3].map((r) => (
        <Log key={r} x={168 + (r % 2) * 10} y={150 - r * 16} w={110 - r * 12} />
      ))}
      <PipAt x={36} y={44} size={120} pose="working" />
    </>
  ),
  treehouse: () => (
    <>
      <Sky />
      <Hills y={136} />
      <rect x="196" y="70" width="22" height="100" rx="5" fill={C.wood} />
      <circle cx="207" cy="44" r="46" fill={C.canopy} />
      <circle cx="166" cy="62" r="28" fill={C.canopy} />
      <circle cx="250" cy="60" r="30" fill={C.canopy} />
      <rect x="176" y="62" width="62" height="34" rx="4" fill={C.woodLight} />
      <path d="M170 64 L207 40 L244 64Z" fill={C.brick} />
      <rect x="200" y="74" width="14" height="22" rx="3" fill={C.honey} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="156" y={102 + i * 14} width="24" height="4" rx="2" fill={C.honey} />
      ))}
      <PipAt x={34} y={66} size={112} pose="thinking" />
    </>
  ),
  raft: () => (
    <>
      <Sky />
      <Tree x={40} y={86} s={0.9} />
      <Tree x={286} y={80} />
      <Hills y={108} />
      <Water y={122} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={98 + i * 26} y="150" width="24" height="16" rx="8" fill={C.woodLight} />
      ))}
      <rect x="226" y="84" width="4" height="68" fill={C.wood} />
      <path d="M230 86 l30 10 l-30 10z" fill={C.brick} />
      <path d="M96 126 L70 176" stroke={C.wood} strokeWidth="5" strokeLinecap="round" />
      <PipAt x={110} y={56} size={100} pose="celebrating" />
      <Critter x={206} y={140} color={C.amber} ears="round" />
    </>
  ),
  stage: () => (
    <>
      <rect width="320" height="192" fill="#F3E9DA" />
      <path d="M0 0 H70 Q 60 90 74 150 H0Z" fill={C.brick} />
      <path d="M320 0 H250 Q 260 90 246 150 H320Z" fill={C.brick} />
      <path d="M118 0 H202 L232 128 H88Z" fill="#FBF3E2" />
      <ellipse cx="160" cy="132" rx="96" ry="18" fill={C.woodLight} />
      <rect x="64" y="132" width="192" height="24" fill={C.wood} />
      <PipAt x={106} y={30} size={108} pose="proud" />
      <rect x="196" y="74" width="5" height="20" rx="2" fill={C.ink} transform="rotate(20 198 84)" />
      <circle cx="202" cy="72" r="7" fill={C.ink} />
      <Critter x={50} y={180} color={C.honey} ears="round" />
      <Critter x={120} y={184} color="#8F8A86" ears="long" />
      <Critter x={200} y={184} color={C.amber} ears="pointy" />
      <Critter x={272} y={180} color={C.wood} ears="round" />
    </>
  ),
  puzzle: () => (
    <>
      <Sky />
      <Hills y={124} />
      {[
        { x: 170, y: 54, c: C.brick },
        { x: 222, y: 54, c: C.star },
        { x: 170, y: 106, c: C.leaf },
        { x: 222, y: 106, c: C.sage },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width="50" height="50" rx="8" fill={p.c} />
          <circle cx={p.x + 50} cy={p.y + 25} r="8" fill={p.c} />
          <circle cx={p.x + 25} cy={p.y + 50} r="8" fill={p.c} />
        </g>
      ))}
      <PipAt x={40} y={56} size={118} pose="celebrating" />
    </>
  ),
  creek: () => (
    <>
      <Sky />
      <Hills y={96} />
      <path d="M160 96 C 150 130 120 150 60 192 H118 C 150 160 166 140 170 120 C 176 140 200 162 250 192 H306 C 240 150 186 128 176 96Z" fill={C.water} />
      <rect x="244" y="70" width="6" height="66" rx="3" fill={C.wood} />
      <path d="M216 74 h30 v14 h-30 l-8 -7z" fill={C.amber} />
      <path d="M250 92 h30 l8 7 l-8 7 h-30z" fill={C.brick} />
      <Tree x={292} y={66} s={0.8} />
      <PipAt x={20} y={70} size={110} pose="thinking" />
    </>
  ),
  cards: () => (
    <>
      <rect width="320" height="192" fill="#F3E9DA" />
      <ellipse cx="200" cy="164" rx="120" ry="26" fill={C.woodLight} />
      {[
        { r: -16, c: C.brick },
        { r: -4, c: C.star },
        { r: 8, c: C.sage },
        { r: 20, c: C.leaf },
      ].map((k, i) => (
        <rect
          key={i}
          x="186"
          y="66"
          width="44"
          height="62"
          rx="6"
          fill={k.c}
          stroke={C.white}
          strokeWidth="3"
          transform={`rotate(${k.r} 208 150)`}
        />
      ))}
      <path d="M232 26 h56 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-36 l-10 10 v-10 h-10 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10z" fill={C.white} />
      <circle cx="248" cy="46" r="3.5" fill={C.honey} />
      <circle cx="260" cy="46" r="3.5" fill={C.honey} />
      <circle cx="272" cy="46" r="3.5" fill={C.honey} />
      <PipAt x={28} y={52} size={118} pose="idle" />
    </>
  ),
  log: () => (
    <>
      <Sky />
      <Hills y={88} />
      <Water y={104} />
      <circle cx="160" cy="70" r="40" fill="none" stroke={C.sage} strokeWidth="3" strokeDasharray="4 8" />
      <circle cx="160" cy="70" r="58" fill="none" stroke={C.sage} strokeWidth="2" strokeDasharray="3 10" opacity="0.7" />
      <Log x={96} y={148} w={140} />
      <PipAt x={112} y={58} size={100} pose="idle" />
      <ellipse cx="60" cy="170" rx="18" ry="5" fill={C.leaf} />
    </>
  ),
  clicks: () => (
    <>
      <Sky />
      <Hills y={140} />
      <rect x="172" y="34" width="96" height="134" rx="14" fill={C.ink} />
      <rect x="180" y="46" width="80" height="110" rx="6" fill={C.cream} />
      <rect x="188" y="56" width="50" height="16" rx="8" fill={C.sage} />
      <rect x="208" y="80" width="44" height="16" rx="8" fill={C.leaf} />
      <path d="M230 120 c0 -7 -10 -7 -10 0 c0 5 10 10 10 10 c0 0 10 -5 10 -10 c0 -7 -10 -7 -10 0z" fill={C.brick} />
      <PipAt x={34} y={62} size={112} pose="idle" />
    </>
  ),
  tower: () => (
    <>
      <Sky />
      <Hills y={140} />
      <rect x="190" y="138" width="34" height="26" rx="4" fill={C.brick} />
      <rect x="228" y="138" width="34" height="26" rx="4" fill={C.star} />
      <rect x="206" y="110" width="34" height="26" rx="4" fill={C.sage} />
      <rect x="236" y="70" width="34" height="26" rx="4" fill={C.leaf} transform="rotate(24 253 83)" />
      <rect x="270" y="112" width="34" height="26" rx="4" fill={C.amber} transform="rotate(-18 287 125)" />
      <path d="M280 52 l4 -10 M292 58 l10 -6 M268 50 l-2 -10" stroke={C.honey} strokeWidth="3" strokeLinecap="round" />
      <PipAt x={40} y={56} size={118} pose="oops" />
    </>
  ),
  telephone: () => (
    <>
      <Sky />
      <Hills y={128} />
      <path d="M96 104 Q 160 76 228 104" stroke={C.honey} strokeWidth="2" fill="none" strokeDasharray="5 4" />
      <rect x="90" y="96" width="16" height="20" rx="3" fill={C.sage} />
      <rect x="220" y="96" width="16" height="20" rx="3" fill={C.star} />
      <PipAt x={0} y={56} size={110} pose="idle" />
      <Critter x={262} y={128} color={C.amber} ears="pointy" />
    </>
  ),
};

export function GameScene({ scene, className }: { scene: SceneKey; className?: string | undefined }) {
  return (
    <svg
      viewBox="0 0 320 192"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn("block h-full w-full", className)}
    >
      {SCENE_ART[scene]()}
    </svg>
  );
}
