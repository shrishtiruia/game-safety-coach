import type { ParsedUpload } from "./read-upload";

/**
 * In-memory only (never storage, never the database): the extracted text and scan
 * results of an upload while the maker is in the submit flow. Cleared when a check
 * finishes or the maker leaves the flow; a page reload also clears it.
 */
let pending: ParsedUpload | null = null;
const byGame = new Map<string, ParsedUpload>();

/** Uploaded on step 1, before the game exists. */
export const setPendingUpload = (u: ParsedUpload | null) => {
  pending = u;
};
export const getPendingUpload = () => pending;

/** The game now exists: hand the upload to its safety check. */
export function attachUpload(gameId: string, u: ParsedUpload) {
  byGame.set(gameId, u);
  if (pending === u) pending = null;
}
export const getUpload = (gameId: string) => byGame.get(gameId) ?? null;
export const discardUpload = (gameId: string) => byGame.delete(gameId);

export function discardAllUploads() {
  pending = null;
  byGame.clear();
}
