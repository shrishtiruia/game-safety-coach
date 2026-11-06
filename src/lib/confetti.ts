const COLORS = ["var(--honey)", "var(--leaf)", "var(--sky)", "var(--berry)", "var(--star)"];

export function confetti(count = 70) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div");
  box.setAttribute("aria-hidden", "true");
  box.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden";
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = 6 + Math.random() * 8;
    p.style.cssText = `position:absolute;top:-20px;left:${Math.random() * 100}%;width:${size}px;height:${size * 0.6}px;border-radius:3px;background:${COLORS[i % COLORS.length]};--dx:${(Math.random() - 0.5) * 300}px;animation:confetti-fall ${1.6 + Math.random() * 1.4}s cubic-bezier(.2,.6,.4,1) ${Math.random() * 0.3}s forwards`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3500);
}
