import type { Category, FindingInput } from "@/lib/eval-config";

/**
 * Rules-based static scan of a game's files (no AI). Reads code as text only.
 * Each finding cites the file and line it came from. `keywords` let the
 * evaluation drop AI findings that repeat the same issue.
 */
export type RuleFinding = FindingInput & { category: Category; keywords: string[] };

type TextFile = { path: string; text: string };

const ANALYTICS = [
  "google-analytics.com",
  "googletagmanager.com",
  "cdn.segment.com",
  "api.segment.io",
  "mixpanel.com",
  "amplitude.com",
  "hotjar.com",
  "clarity.ms",
  "connect.facebook.net",
];
const ADS = [
  "doubleclick.net",
  "googlesyndication.com",
  "adsbygoogle",
  "adservice.google",
  "amazon-adsystem.com",
];
const PERSONAL_FIELD =
  /\b(first[\s_-]?name|last[\s_-]?name|full[\s_-]?name|firstname|lastname|e-?mail|school(?:[\s_-]?name)?|phone|address|birthday|date of birth)\b/i;

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};
const snippet = (s: string) => s.trim().replace(/\s+/g, " ").slice(0, 110);
const where = (f: TextFile, i: number, line: string) => `${f.path}:${i + 1} — ${snippet(line)}`;

export function scanFiles(files: TextFile[]): RuleFinding[] {
  const out: RuleFinding[] = [];
  const seen = new Set<string>();
  const add = (key: string, f: RuleFinding) => {
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };

  for (const f of files) {
    if (!/\.(html?|m?js|cjs|jsx|ts|tsx|json)$/i.test(f.path)) continue;
    const lines = f.text.split(/\r?\n/);
    const personal: { field: string; i: number; line: string }[] = [];

    lines.forEach((line, i) => {
      const lower = line.toLowerCase();

      // Ad networks and analytics SDKs.
      for (const d of ADS) {
        if (lower.includes(d)) {
          add(`ads:${d}`, {
            category: "ads_spending",
            severity: "must_fix",
            title: `Loads an ad network (${d})`,
            evidence: where(f, i, line),
            why_it_matters: "Ads in a classroom game expose students to marketing and tracking.",
            suggested_fix: "Remove the ad code entirely.",
            confidence: 0.95,
            keywords: ["ad", "ads", "advert"],
          });
        }
      }
      for (const d of ANALYTICS) {
        if (lower.includes(d)) {
          add(`analytics:${d}`, {
            category: "privacy",
            severity: "should_fix",
            title: `Tracks players with analytics (${d})`,
            evidence: where(f, i, line),
            why_it_matters:
              "Third-party trackers collect data about students without a teacher knowing.",
            suggested_fix: "Remove the tracker, or use anonymous, school-approved analytics.",
            confidence: 0.92,
            keywords: ["analytics", "tracker", "tracking"],
          });
        }
      }

      // Remote script includes (code from another site can change after review).
      const remote = line.match(/<script[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/i);
      if (remote?.[1] && ![...ADS, ...ANALYTICS].some((d) => remote[1]!.includes(d))) {
        add(`script:${remote[1]}`, {
          category: "privacy",
          severity: "should_fix",
          title: `Loads a script from ${host(remote[1])}`,
          evidence: where(f, i, line),
          why_it_matters: "Code from another site can change after review or track students.",
          suggested_fix:
            "Bundle the script with your game instead of loading it from another site.",
          confidence: 0.85,
          keywords: ["script", "remote"],
        });
      }

      // Links that leave the game.
      for (const m of line.matchAll(/<a\b[^>]*\bhref=["'](https?:\/\/[^"']+)["'][^>]*>([^<]*)/gi)) {
        const url = m[1] ?? "";
        const text = (m[2] ?? "").trim();
        add(`link:${url}`, {
          category: "contact_social",
          severity: "should_fix",
          title: text ? `"${text}" link leaves the game` : `Link to ${host(url)} leaves the game`,
          evidence: where(f, i, line),
          why_it_matters: "Students can wander to an external site without a teacher knowing.",
          suggested_fix: "Remove the link or move it to a teacher-only info page.",
          confidence: 0.95,
          keywords: ["link", "external", "leaves"],
        });
      }
      const nav = line.match(
        /(?:window\.open|location\.(?:href|assign|replace))\s*[(=]\s*["'](https?:\/\/[^"']+)/i,
      );
      if (nav?.[1]) {
        add(`link:${nav[1]}`, {
          category: "contact_social",
          severity: "should_fix",
          title: `Sends players to ${host(nav[1])}`,
          evidence: where(f, i, line),
          why_it_matters: "Students can wander to an external site without a teacher knowing.",
          suggested_fix: "Keep players inside the game, or move the link to a teacher-only page.",
          confidence: 0.9,
          keywords: ["link", "external", "leaves"],
        });
      }

      // Chat or real-time messaging.
      if (
        /new\s+WebSocket\s*\(|socket\.io|\bRTCPeerConnection\b|\bio\s*\(\s*["']https?:/i.test(line)
      ) {
        add(`chat:${f.path}`, {
          category: "contact_social",
          severity: "must_fix",
          title: "Opens a live chat or messaging connection",
          evidence: where(f, i, line),
          why_it_matters: "Open messaging can let strangers contact students.",
          suggested_fix: "Remove live messaging, or limit it to preset phrases between classmates.",
          confidence: 0.85,
          keywords: ["chat", "message", "socket"],
        });
      }

      // Saving personal info on the device.
      if (/localStorage\.setItem/i.test(line) && PERSONAL_FIELD.test(line)) {
        add(`storage:${f.path}:${i}`, {
          category: "privacy",
          severity: "should_fix",
          title: "Saves personal info on the device",
          evidence: where(f, i, line),
          why_it_matters: "Shared classroom devices can expose one student's details to the next.",
          suggested_fix:
            "Don't store names or contact details; use a nickname for the session only.",
          confidence: 0.85,
          keywords: ["localstorage", "saves", "stores"],
        });
      }

      // Form inputs that ask for personal info.
      if (/<input\b/i.test(line)) {
        const attrs = [...line.matchAll(/\b(?:name|id|placeholder|aria-label)=["']([^"']+)["']/gi)]
          .map((m) => m[1] ?? "")
          .join(" ");
        const field = attrs.match(PERSONAL_FIELD)?.[1];
        if (field) personal.push({ field: field.toLowerCase(), i, line });
      }
    });

    if (personal.length) {
      const names = [...new Set(personal.map((p) => prettyField(p.field)))];
      const first = personal[0]!;
      add(`personal:${f.path}`, {
        category: "privacy",
        severity: "should_fix",
        title: `Asks players for ${names.join(" and ")}`,
        evidence: personal.map((p) => where(f, p.i, p.line)).join("; "),
        why_it_matters:
          names.some((n) => /school/.test(n)) && names.some((n) => /name/.test(n))
            ? "Pairing a name with a school identifies a minor."
            : "Collecting personal details from students needs a clear reason and consent.",
        suggested_fix: "Use auto-generated nicknames and drop the personal fields.",
        confidence: first ? 0.9 : 0.8,
        keywords: ["name", "school", "email", "personal"],
      });
    }
  }
  return out;
}

function prettyField(f: string) {
  if (/first/.test(f)) return "first name";
  if (/last/.test(f)) return "last name";
  if (/full/.test(f)) return "full name";
  if (/school/.test(f)) return "school name";
  if (/mail/.test(f)) return "email";
  return f.replace(/[_-]/g, " ");
}
