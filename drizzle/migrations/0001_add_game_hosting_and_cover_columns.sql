ALTER TABLE public.games ADD COLUMN IF NOT EXISTS hosted_url text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS file_sha256 text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS cover_icon text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS cover_color text;