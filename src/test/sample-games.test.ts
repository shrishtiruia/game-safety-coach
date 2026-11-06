import { File as NodeFile } from "node:buffer";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { readUpload } from "@/lib/upload/read-upload";

const sample = (name: string) => {
  const bytes = readFileSync(resolve(__dirname, "../../sample-games", name));
  // jsdom's File has no arrayBuffer(); Node's matches what browsers provide.
  return new NodeFile([bytes], name, { type: "application/zip" }) as unknown as File;
};

describe("sample game uploads", () => {
  it("Haggle Hero: flags only the external 'Learn more' link, and extracts Level 3 dialogue", async () => {
    const u = await readUpload(sample("haggle-hero.zip"));
    expect(u.fileCount).toBe(3);
    expect(u.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(u.rules.map((r) => [r.category, r.severity, r.title])).toEqual([
      ["contact_social", "should_fix", '"Learn more" link leaves the game'],
    ]);
    expect(u.rules[0]?.evidence).toMatch(/^index\.html:\d+ — /);
    expect(u.digest).toMatch(/game\.js:\d+\| Notwithstanding your ostensibly generous proposition/);
    expect(u.digest).toMatch(/about 15 minutes/);
  });

  it("Comeback Kings: flags the name + school join screen, and extracts roast cards 4 and 7", async () => {
    const u = await readUpload(sample("comeback-kings.zip"));
    expect(u.rules.map((r) => [r.category, r.severity, r.title])).toEqual([
      ["privacy", "should_fix", "Asks players for first name and school name"],
    ]);
    expect(u.rules[0]?.evidence).toMatch(/^index\.html:\d+ — .*first-name/);
    expect(u.digest).toMatch(/game\.js:\d+\| Card 4: You're so heavy/);
    expect(u.digest).toMatch(/game\.js:\d+\| Card 7: Your face is so ugly/);
  });

  it("never keeps the raw file: the parsed result has no bytes or full file text", async () => {
    const u = await readUpload(sample("comeback-kings.zip"));
    expect(Object.keys(u).sort()).toEqual(
      [
        "digest",
        "fileCount",
        "fileName",
        "kind",
        "rules",
        "sha256",
        "size",
        "topLevel",
        "urlHint",
      ].sort(),
    );
  });
});
