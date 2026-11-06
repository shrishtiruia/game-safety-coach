import { scanFiles, type RuleFinding } from "./rules-scan";

/**
 * Reads an uploaded game entirely in the browser. Files are read as text only:
 * nothing is executed or rendered, and the raw file is never sent anywhere.
 * What we keep (in memory only) is the extracted text, the rules-scan results,
 * a small file summary, and a SHA-256 fingerprint.
 */

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
export const ACCEPTED = [".zip", ".html", ".htm"];

/** Text-like files we read; everything else in a zip (images, audio, fonts) is skipped. */
const TEXT_EXT = /\.(html?|js|mjs|cjs|jsx|ts|tsx|json|css|txt|md|csv|xml|svg)$/i;

export type TextFile = { path: string; text: string };

export type ParsedUpload = {
  fileName: string;
  size: number;
  kind: "zip" | "html";
  /** Top-level entries of a zip (or the html file itself), for the summary. */
  topLevel: string[];
  fileCount: number;
  sha256: string;
  /** Extracted player-facing text, one "file:line| text" per line, sent to the AI review. */
  digest: string;
  /** Deterministic findings from the rules scan, with file:line evidence. */
  rules: RuleFinding[];
  /** The game's own address if its HTML declares one (canonical link, og:url, or base href). */
  urlHint: string | null;
};

export class UploadError extends Error {}

export async function readUpload(file: File): Promise<ParsedUpload> {
  const lower = file.name.toLowerCase();
  const kind = lower.endsWith(".zip") ? "zip" : /\.html?$/.test(lower) ? "html" : null;
  if (!kind) throw new UploadError("Please upload a .zip or .html file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("That file is over the 25 MB limit.");

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const sha256 = await fingerprint(buffer);

  let files: TextFile[];
  let topLevel: string[];
  let fileCount: number;
  if (kind === "zip") {
    const entries = readZipDirectory(bytes);
    fileCount = entries.filter((e) => !e.name.endsWith("/")).length;
    topLevel = [
      ...new Set(entries.map((e) => e.name.split("/")[0] + (e.name.includes("/") ? "/" : ""))),
    ];
    files = [];
    for (const e of entries) {
      if (e.name.endsWith("/") || !TEXT_EXT.test(e.name) || e.name.startsWith("__MACOSX/"))
        continue;
      files.push({ path: e.name, text: await inflateEntry(bytes, e) });
    }
  } else {
    files = [{ path: file.name, text: new TextDecoder().decode(bytes) }];
    topLevel = [file.name];
    fileCount = 1;
  }
  if (!files.length) throw new UploadError("We couldn't find any HTML or code in that zip.");

  return {
    fileName: file.name,
    size: file.size,
    kind,
    topLevel,
    fileCount,
    sha256,
    digest: extractDigest(files),
    rules: scanFiles(files),
    urlHint: findUrlHint(files),
  };
}

/** Only reads tag attributes as text; https/http addresses only. */
function findUrlHint(files: TextFile[]): string | null {
  const patterns = [
    /<link[^>]*rel=["']canonical["'][^>]*href=["'](https?:\/\/[^"']+)["']/i,
    /<link[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*rel=["']canonical["']/i,
    /<meta[^>]*property=["']og:url["'][^>]*content=["'](https?:\/\/[^"']+)["']/i,
    /<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*property=["']og:url["']/i,
    /<base[^>]*href=["'](https?:\/\/[^"']+)["']/i,
  ];
  for (const f of files) {
    if (!/\.html?$/i.test(f.path)) continue;
    for (const re of patterns) {
      const m = f.text.match(re);
      if (m?.[1]) return m[1];
    }
  }
  return null;
}

async function fingerprint(buffer: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Minimal zip reader (stored + deflate), using the browser's DecompressionStream ----------

type ZipEntry = { name: string; method: number; compSize: number; localOffset: number };

function readZipDirectory(b: Uint8Array): ZipEntry[] {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  // End of central directory record: scan back from the end (comment can be up to 64 KB).
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new UploadError("That doesn't look like a valid zip file.");
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries: ZipEntry[] = [];
  for (let i = 0; i < count; i++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new UploadError("That zip file looks damaged.");
    const method = v.getUint16(p + 10, true);
    const compSize = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const localOffset = v.getUint32(p + 42, true);
    const name = decoder.decode(b.subarray(p + 46, p + 46 + nameLen));
    entries.push({ name, method, compSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflateEntry(b: Uint8Array, e: ZipEntry): Promise<string> {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const nameLen = v.getUint16(e.localOffset + 26, true);
  const extraLen = v.getUint16(e.localOffset + 28, true);
  const start = e.localOffset + 30 + nameLen + extraLen;
  const data = b.subarray(start, start + e.compSize);
  if (e.method === 0) return new TextDecoder().decode(data);
  if (e.method !== 8) throw new UploadError(`We can't read how ${e.name} is compressed.`);
  const body = new Response(data.slice()).body;
  if (!body) throw new UploadError(`We couldn't read ${e.name}.`);
  const stream = body.pipeThrough(new DecompressionStream("deflate-raw"));
  return new TextDecoder().decode(await new Response(stream).arrayBuffer());
}

// ---------- Text extraction: what players read (dialogue, prompts, instructions) ----------

const MAX_DIGEST_CHARS = 40_000;

function extractDigest(files: TextFile[]): string {
  const out: string[] = [];
  let total = 0;
  for (const f of files) {
    const isHtml = /\.html?$/i.test(f.path);
    const isCode = /\.(m?js|cjs|jsx|ts|tsx|json)$/i.test(f.path);
    const isText = /\.(txt|md|csv)$/i.test(f.path);
    if (!isHtml && !isCode && !isText) continue;
    let inScriptOrStyle = false;
    f.text.split(/\r?\n/).forEach((raw, i) => {
      let text = "";
      if (isHtml) {
        if (/<(script|style)\b/i.test(raw)) inScriptOrStyle = true;
        if (!inScriptOrStyle) text = stripTags(raw);
        if (/<\/(script|style)>/i.test(raw)) inScriptOrStyle = false;
        // Also keep string literals inside inline scripts (dialogue often lives there).
        if (inScriptOrStyle) text = stringLiterals(raw);
      } else if (isCode) {
        text = stringLiterals(raw);
      } else {
        text = raw.trim();
      }
      if (text.split(/\s+/).filter(Boolean).length < 3 || total > MAX_DIGEST_CHARS) return;
      const line = `${f.path}:${i + 1}| ${text}`;
      out.push(line);
      total += line.length;
    });
  }
  return out.join("\n");
}

function stripTags(line: string) {
  return line
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function stringLiterals(line: string) {
  const parts: string[] = [];
  for (const m of line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)) {
    const s = m[2] ?? "";
    if (/\s/.test(s) && /[a-z]{2,}/i.test(s)) parts.push(s);
  }
  return parts.join(" ").trim();
}
