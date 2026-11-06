/**
 * Makers only ever see two states: Live or Draft.
 * The database still stores the detailed status the evaluation flow writes;
 * a game is live once its latest check came back approved (with or without notes).
 * Educators only ever see live games.
 */
export type MakerStatus = "live" | "draft";

export function isLive(status: string) {
  return status === "approved" || status === "approved_with_notes";
}

export function makerStatus(status: string): MakerStatus {
  return isLive(status) ? "live" : "draft";
}
