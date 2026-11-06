import { useRef, useState } from "react";
import { FileArchive, FileCode2, Loader2, UploadCloud } from "lucide-react";
import { Pip, SpeechBubble } from "@/components/mascot";
import { ACCEPTED, readUpload, UploadError, type ParsedUpload } from "@/lib/upload/read-upload";
import { cn } from "@/lib/utils";

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Drop a .zip or .html. The file is read as text in the browser only; it is never
 * run, rendered, or uploaded anywhere. Pip waits by the dropzone and catches the file.
 */
export function GameDropzone({
  upload,
  onChange,
  showPip = true,
}: {
  upload: ParsedUpload | null;
  onChange: (u: ParsedUpload | null) => void;
  showPip?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const take = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setReading(true);
    try {
      onChange(await readUpload(file));
    } catch (e) {
      console.error(e);
      setError(
        e instanceof UploadError ? e.message : "We couldn't read that file. Try another one.",
      );
    } finally {
      setReading(false);
      if (input.current) input.current.value = "";
    }
  };

  const pip = reading
    ? { pose: "thinking" as const, line: "Taking a look…" }
    : upload
      ? { pose: "celebrating" as const, line: "Got it!" }
      : { pose: "waiting" as const, line: undefined };

  return (
    <div className="flex items-end gap-6">
      <div className="min-w-0 flex-1">
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          id="game-file"
          onChange={(e) => take(e.target.files?.[0])}
        />
        {upload ? (
          <div className="rounded-3xl border-2 border-secondary p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-info-soft text-info">
                {upload.kind === "zip" ? (
                  <FileArchive className="h-6 w-6" strokeWidth={2.5} />
                ) : (
                  <FileCode2 className="h-6 w-6" strokeWidth={2.5} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold">{upload.fileName}</p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {formatSize(upload.size)}
                  {upload.kind === "zip" &&
                    ` · ${upload.fileCount} file${upload.fileCount === 1 ? "" : "s"}`}
                </p>
                {upload.kind === "zip" && (
                  <p className="mt-2 text-sm font-bold text-muted-foreground">
                    {upload.topLevel.slice(0, 8).join(" · ")}
                    {upload.topLevel.length > 8 && ` and ${upload.topLevel.length - 8} more`}
                  </p>
                )}
              </div>
              <label
                htmlFor="game-file"
                className="shrink-0 cursor-pointer rounded-xl px-3 py-2 font-extrabold text-info hover:bg-info-soft"
              >
                Replace file
              </label>
            </div>
          </div>
        ) : (
          <label
            htmlFor="game-file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              take(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors",
              dragging
                ? "border-info bg-info-soft"
                : "border-secondary hover:border-info hover:bg-muted",
            )}
          >
            {reading ? (
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-info" strokeWidth={2.5} />
            ) : (
              <UploadCloud className="mb-3 h-10 w-10 text-info" strokeWidth={2.5} />
            )}
            <span className="text-xl font-extrabold">
              {reading ? "Reading your game…" : "Drop your game here"}
            </span>
            <span className="mt-1 font-semibold text-muted-foreground">
              or click to choose a file · .zip or .html · up to 25 MB
            </span>
          </label>
        )}
        {error && (
          <p role="alert" className="mt-3 font-bold text-danger">
            {error}
          </p>
        )}
      </div>

      {showPip && (
        <div aria-hidden className="hidden w-[150px] shrink-0 flex-col items-center md:flex">
          <div className="mb-2 h-10">
            {pip.line && (
              <SpeechBubble key={pip.line} pointer="bottom" className="animate-pop">
                {pip.line}
              </SpeechBubble>
            )}
          </div>
          <Pip key={pip.pose} pose={pip.pose} size={130} />
        </div>
      )}
    </div>
  );
}
