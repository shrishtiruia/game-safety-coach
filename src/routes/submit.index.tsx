import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ChunkyButton } from "@/components/chunky";
import { GameDropzone } from "@/components/game-dropzone";
import { SubmitFlow } from "@/components/submit-flow";
import { getPendingUpload, setPendingUpload } from "@/lib/upload/session-upload";

export const Route = createFileRoute("/submit/")({
  head: () => ({
    meta: [
      { title: "Submit a game · SkillPlay" },
      {
        name: "description",
        content: "Upload your game for a quick safety check. We never keep a copy.",
      },
      { property: "og:title", content: "Submit a game · SkillPlay" },
      {
        property: "og:description",
        content: "Upload your game for a quick safety check. We never keep a copy.",
      },
    ],
  }),
  component: UploadStep,
});

function UploadStep() {
  const navigate = useNavigate();
  const [upload, setUpload] = useState(getPendingUpload);
  const [permission, setPermission] = useState(false);

  return (
    <SubmitFlow
      step={1}
      title="Upload your game"
      sub="A .zip of your web game or a single .html file."
    >
      <GameDropzone
        upload={upload}
        onChange={(u) => {
          setUpload(u);
          setPendingUpload(u);
        }}
      />

      <p className="mt-5 flex items-center gap-2 font-bold text-muted-foreground">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} />
        We review your game and never keep a copy.
      </p>

      <label className="mt-8 flex cursor-pointer items-center gap-3 font-extrabold">
        <input
          type="checkbox"
          checked={permission}
          onChange={(e) => setPermission(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-primary)]"
        />
        I made this game or have permission to share it.
      </label>

      <div className="mt-10 flex items-center justify-end gap-3">
        <Link
          to="/"
          className="rounded-xl px-4 py-3 font-extrabold text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Link>
        <ChunkyButton
          size="lg"
          disabled={!upload || !permission}
          onClick={() => navigate({ to: "/submit/details" })}
        >
          Continue
        </ChunkyButton>
      </div>
    </SubmitFlow>
  );
}
