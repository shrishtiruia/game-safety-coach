// Games that have a playable in-browser version on Kitbit.
export const PLAYABLE = new Set(["feelings-fishing"]);
export const isPlayable = (slug: string) => PLAYABLE.has(slug);
