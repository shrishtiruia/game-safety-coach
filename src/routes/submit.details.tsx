import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import type React from "react";
import { Loader2, Shuffle, Sparkles } from "lucide-react";
import { ChunkyButton, chunkyVariants } from "@/components/chunky";
import { GameTile } from "@/components/game-tile";
import { SubmitFlow } from "@/components/submit-flow";
import {
  autoCover,
  SKILL_COLOR,
  SKILL_ICONS,
  COVER_ICONS,
  isCoverIcon,
  type Cover,
} from "@/lib/game-covers";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { createGame, GRADE_BANDS, suggestDetails, type DetailSuggestions } from "@/lib/submit.functions";
import { attachUpload, getPendingUpload } from "@/lib/upload/session-upload";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/submit/details")({
  head: () => ({
    meta: [
      { title: "Game details · SkillPlay" },
      { name: "description", content: "Check the details for your game listing." },
      { property: "og:title", content: "Game details · SkillPlay" },
      { property: "og:description", content: "Check the details for your game listing." },
    ],
  }),
  component: DetailsStep,
});

const fieldCls =
  "w-full rounded-2xl border-2 border-secondary bg-background px-4 py-3 font-semibold focus:border-info";

type Form = {
  title: string;
  makerName: string;
  skill: string;
  gradeBand: string;
  durationMinutes: number | "";
  format: string;
  description: string;
  hostedUrl: string;
};
type Field = keyof Form;

function DetailsStep() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createGame);
  const suggest = useServerFn(suggestDetails);
  const [upload] = useState(getPendingUpload);
  const [form, setForm] = useState<Form>({
    title: "",
    makerName: "",
    skill: "",
    gradeBand: "",
    durationMinutes: "",
    format: "",
    description: "",
    hostedUrl: "",
  });
  const [suggested, setSuggested] = useState<Set<Field>>(new Set());
  // Thumbnail: an icon picked from the file (or tried by the maker), colored by skill.
  const [coverIcon, setCoverIcon] = useState<string | null>(null);
  const [coverSuggested, setCoverSuggested] = useState(false);
  // Hosted at: filled in automatically until the maker edits it.
  const [urlEdited, setUrlEdited] = useState(false);
  const [suggesting, setSuggesting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofill from the extracted text; if it fails the fields just stay empty.
  useEffect(() => {
    if (!upload) return;
    let cancelled = false;
    suggest({ data: { content: upload.digest, fileName: upload.fileName } })
      .catch((): DetailSuggestions => ({}))
      .then((s) => {
        if (cancelled) return;
        const filled = new Set<Field>();
        setForm((f) => {
          const next = { ...f };
          const { coverIcon: icon, ...fields } = s;
          if (isCoverIcon(icon)) {
            setCoverIcon(icon);
            setCoverSuggested(true);
          }
          for (const [k, v] of Object.entries(fields) as [Field, string | number][]) {
            if (v !== undefined && v !== "" && next[k] === "") {
              (next as Record<Field, string | number>)[k] = v;
              filled.add(k);
            }
          }
          return next;
        });
        setSuggested(filled);
        setSuggesting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [upload, suggest]);

  if (!upload) {
    return (
      <SubmitFlow
        step={2}
        title="Upload your game first"
        sub="We only keep your file while you're here."
      >
        <Link to="/submit" className={chunkyVariants()}>
          Back to upload
        </Link>
      </SubmitFlow>
    );
  }

  const set = <K extends Field>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSuggested((s) => {
      const n = new Set(s);
      n.delete(k);
      return n;
    });
  };
  const hint = (k: Field) => suggested.has(k) && <SuggestedTag />;

  const cover: Cover = isCoverIcon(coverIcon)
    ? { cover_icon: coverIcon, cover_color: SKILL_COLOR[form.skill] ?? "green" }
    : autoCover(form.skill, form.title || upload.fileName);
  const tryAnotherCover = () => {
    const pool = [
      ...(SKILL_ICONS[form.skill] ?? []),
      ...COVER_ICONS.filter((i) => !(SKILL_ICONS[form.skill] ?? []).includes(i)),
    ];
    const next = pool[(pool.indexOf(cover.cover_icon) + 1) % pool.length] ?? "lightbulb";
    setCoverIcon(next);
    setCoverSuggested(false);
  };

  const slug = form.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const autoUrl = upload.urlHint ?? (slug ? `https://play.skillplay.example/${slug}` : "");
  const hostedUrl = urlEdited ? form.hostedUrl : autoUrl;

  return (
    <SubmitFlow
      step={2}
      title="Game details"
      sub={
        suggesting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading {upload.fileName} to suggest
            details…
          </span>
        ) : (
          `From ${upload.fileName}. Check everything, then start the safety check.`
        )
      }
    >
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.skill || !form.gradeBand || !form.format || !form.durationMinutes) {
            setError("Please fill in every field.");
            return;
          }
          setBusy(true);
          setError(null);
          try {
            const { id } = await create({
              data: {
                ...form,
                hostedUrl,
                durationMinutes: Number(form.durationMinutes),
                coverIcon: cover.cover_icon,
                coverColor: cover.cover_color,
              },
            });
            attachUpload(id, upload);
            await qc.invalidateQueries();
            navigate({ to: "/submit/$id/check", params: { id } });
          } catch (err) {
            console.error(err);
            setError("We couldn't save your game. Please try again.");
            setBusy(false);
          }
        }}
      >
        <div className="flex items-center gap-5">
          <GameTile cover={cover} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold">
              Thumbnail
              {coverSuggested && <SuggestedTag />}
            </p>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              Made from your game, in the same style as every SkillPlay game. The color follows the
              skill.
            </p>
            <button
              type="button"
              onClick={tryAnotherCover}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-extrabold text-info hover:bg-info-soft"
            >
              <Shuffle className="h-4 w-4" strokeWidth={2.5} /> Try another
            </button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Game title" htmlFor="title" tag={hint("title")}>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={fieldCls}
            />
          </Field>
          <Field label="Studio or maker name" htmlFor="maker">
            <input
              id="maker"
              required
              value={form.makerName}
              onChange={(e) => set("makerName", e.target.value)}
              className={fieldCls}
            />
          </Field>
        </div>
        <Field label="Short description" htmlFor="description" tag={hint("description")}>
          <textarea
            id="description"
            required
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={fieldCls}
          />
        </Field>
        <div className="grid gap-6 sm:grid-cols-4">
          <Field label="Skill" htmlFor="skill" tag={hint("skill")}>
            <select
              id="skill"
              required
              value={form.skill}
              onChange={(e) => set("skill", e.target.value)}
              className={fieldCls}
            >
              <option value="">Choose…</option>
              {Object.entries(SKILL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Grades" htmlFor="grades" tag={hint("gradeBand")}>
            <select
              id="grades"
              required
              value={form.gradeBand}
              onChange={(e) => set("gradeBand", e.target.value)}
              className={fieldCls}
            >
              <option value="">Choose…</option>
              {GRADE_BANDS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Minutes" htmlFor="minutes" tag={hint("durationMinutes")}>
            <input
              id="minutes"
              type="number"
              min={1}
              max={180}
              required
              value={form.durationMinutes}
              onChange={(e) =>
                set("durationMinutes", e.target.value === "" ? "" : Number(e.target.value))
              }
              className={fieldCls}
            />
          </Field>
          <Field label="Format" htmlFor="format" tag={hint("format")}>
            <select
              id="format"
              required
              value={form.format}
              onChange={(e) => set("format", e.target.value)}
              className={fieldCls}
            >
              <option value="">Choose…</option>
              {Object.entries(FORMAT_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Hosted at"
          htmlFor="hosted"
          tag={
            !urlEdited &&
            autoUrl && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-info">
                <Sparkles className="h-3 w-3" strokeWidth={3} />
                {upload.urlHint ? "Found in your file" : "Suggested from your title"}
              </span>
            )
          }
          hint="The link where teachers will play your game. Needed to go live."
        >
          <input
            id="hosted"
            type="url"
            required
            placeholder="https://"
            value={hostedUrl}
            onChange={(e) => {
              setUrlEdited(true);
              set("hostedUrl", e.target.value);
            }}
            className={fieldCls}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 font-bold text-danger">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/submit"
            className="rounded-xl px-4 py-3 font-extrabold text-muted-foreground hover:text-foreground"
          >
            Back
          </Link>
          <ChunkyButton type="submit" size="lg" disabled={busy}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />} Start safety check
          </ChunkyButton>
        </div>
      </form>
    </SubmitFlow>
  );
}

function SuggestedTag() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-info">
      <Sparkles className="h-3 w-3" strokeWidth={3} /> Suggested from your file
    </span>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  tag,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  tag?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-extrabold")}>
        {label}
        {tag}
      </label>
      {hint && <p className="mb-2 text-sm font-semibold text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
