import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type React from "react";
import { Loader2 } from "lucide-react";
import { ChunkyButton } from "@/components/chunky";
import { SubmitFlow } from "@/components/submit-flow";
import { FORMAT_LABEL, SKILL_LABEL } from "@/lib/eval-config";
import { createGame, GRADE_BANDS } from "@/lib/submit.functions";

export const Route = createFileRoute("/studio/submit/")({
  head: () => ({
    meta: [
      { title: "Upload a game · Kitbit Studio" },
      {
        name: "description",
        content: "Tell us about your game, then it gets a quick safety check before going live.",
      },
      { property: "og:title", content: "Upload a game · Kitbit Studio" },
      {
        property: "og:description",
        content: "Tell us about your game, then it gets a quick safety check before going live.",
      },
    ],
  }),
  component: SubmitStep,
});

const fieldCls =
  "w-full rounded-2xl border-2 border-secondary bg-background px-4 py-3 font-semibold focus:border-info";

function SubmitStep() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createGame);
  const [form, setForm] = useState({
    title: "",
    makerName: "",
    skill: "negotiation",
    gradeBand: "6-8",
    durationMinutes: 15,
    format: "pairs",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <SubmitFlow
      step={1}
      title="Upload a game"
      sub="Tell us about your game. Next, it gets six quick safety checks, then it can go live."
    >
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            const { id } = await create({ data: form });
            await qc.invalidateQueries();
            navigate({ to: "/studio/submit/$id/check", params: { id } });
          } catch (err) {
            console.error(err);
            setError("We couldn't save your game. Please try again.");
            setBusy(false);
          }
        }}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Game title" htmlFor="title">
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
        <div className="grid gap-6 sm:grid-cols-4">
          <Field label="Skill" htmlFor="skill">
            <select
              id="skill"
              value={form.skill}
              onChange={(e) => set("skill", e.target.value)}
              className={fieldCls}
            >
              {Object.entries(SKILL_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Grades" htmlFor="grades">
            <select
              id="grades"
              value={form.gradeBand}
              onChange={(e) => set("gradeBand", e.target.value)}
              className={fieldCls}
            >
              {GRADE_BANDS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Minutes" htmlFor="minutes">
            <input
              id="minutes"
              type="number"
              min={1}
              max={180}
              required
              value={form.durationMinutes}
              onChange={(e) => set("durationMinutes", Number(e.target.value))}
              className={fieldCls}
            />
          </Field>
          <Field label="Format" htmlFor="format">
            <select
              id="format"
              value={form.format}
              onChange={(e) => set("format", e.target.value)}
              className={fieldCls}
            >
              {Object.entries(FORMAT_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field
          label="Game content"
          htmlFor="content"
          hint="Describe how it plays: levels, prompts, any links, accounts or data it collects."
        >
          <textarea
            id="content"
            required
            rows={8}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={fieldCls}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 font-bold text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            to="/studio"
            className="rounded-xl px-4 py-3 text-center font-extrabold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          <ChunkyButton type="submit" size="lg" disabled={busy}>
            {busy && <Loader2 className="h-5 w-5 animate-spin" />} Start safety check
          </ChunkyButton>
        </div>
      </form>
    </SubmitFlow>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-extrabold">
        {label}
      </label>
      {hint && <p className="mb-2 text-sm font-semibold text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
