import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type LogState = "slot" | "placed" | "leak";

/** Log ends stacked as a little pyramid: bottom row first, so logs fill in build order. */
const LOGS = [
  { cx: 72, cy: 102 },
  { cx: 96, cy: 102 },
  { cx: 120, cy: 102 },
  { cx: 84, cy: 80 },
  { cx: 108, cy: 80 },
  { cx: 96, cy: 58 },
];

/**
 * A beaver dam. Two uses:
 * - `logs`: one state per check; a newly placed log slides in and settles.
 * - `level`: a water gauge (0-100) that rises from `from` to `to` once it scrolls into view.
 */
export function Dam({
  logs = LOGS.map((): LogState => "placed"),
  level,
  width = 160,
  className,
  label,
}: {
  logs?: LogState[];
  level?: { from: number; to: number };
  width?: number;
  className?: string;
  label?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!level || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [level]);

  // Water fills the pool on the left; with a gauge, its height tracks `to` (0-100).
  const waterTop = level ? 116 - (level.to / 100) * 64 : 70;
  const style = level
    ? ({ "--dam-from": String(Math.min(1, level.from / Math.max(level.to, 1))) } as CSSProperties)
    : undefined;

  return (
    <svg
      ref={ref}
      viewBox="0 0 150 120"
      width={width}
      height={(width * 120) / 150}
      className={cn("dam shrink-0", level && "dam--gauge", visible && "is-visible", className)}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/* Pool behind the dam */}
      <rect x="0" y="40" width="80" height="76" rx="10" fill="#7FA99A" opacity="0.08" />
      <rect
        className="dam-water"
        x="0"
        y={waterTop}
        width="80"
        height={116 - waterTop}
        rx="8"
        fill="#7FA99A"
        opacity="0.35"
      />
      {/* Riverbed */}
      <rect x="0" y="112" width="150" height="8" rx="4" fill="#E8C9A0" />

      {LOGS.map((pos, i) => {
        const state = logs[i] ?? "slot";
        if (state === "slot") {
          return (
            <circle
              key={i}
              className="dam-log dam-log--slot"
              cx={pos.cx}
              cy={pos.cy}
              r="11"
              fill="#E5E1DA"
            />
          );
        }
        return (
          <g key={i}>
            <g className="dam-log dam-log--placed">
              <circle cx={pos.cx} cy={pos.cy} r="11.5" fill="#A0662F" />
              <circle cx={pos.cx} cy={pos.cy} r="7.5" fill="#D9A066" />
              <circle cx={pos.cx} cy={pos.cy} r="3" fill="#A0662F" opacity="0.6" />
            </g>
            {state === "leak" && (
              <path
                className="dam-leak"
                d={`M${pos.cx + 13} ${pos.cy - 2} q-4 7 0 9 q4 -2 0 -9z`}
                fill="#7FA99A"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
