CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  maker_name text NOT NULL,
  skill text NOT NULL CHECK (skill IN ('negotiation','public_speaking','conversation','collaboration','conflict_resolution')),
  grade_band text NOT NULL DEFAULT '6-8',
  duration_minutes int NOT NULL,
  format text NOT NULL CHECK (format IN ('solo','pairs','whole_class')),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','in_review','approved','approved_with_notes','needs_changes')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games readable" ON public.games FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  attempt_number int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','complete')),
  overall_result text CHECK (overall_result IN ('approved','approved_with_notes','needs_changes')),
  categories_run text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.evaluations TO anon, authenticated;
GRANT ALL ON public.evaluations TO service_role;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Evaluations readable" ON public.evaluations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('must_fix','should_fix','suggestion')),
  title text NOT NULL,
  evidence text NOT NULL,
  why_it_matters text NOT NULL DEFAULT '',
  suggested_fix text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  confidence numeric NOT NULL DEFAULT 0.9,
  human_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.findings TO anon, authenticated;
GRANT ALL ON public.findings TO service_role;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Findings readable" ON public.findings FOR SELECT TO anon, authenticated USING (true);

WITH g AS (
  INSERT INTO public.games (id,title,maker_name,skill,grade_band,duration_minutes,format,description,status) VALUES
  ('11111111-1111-1111-1111-111111111111','Haggle Hero','Bright Byte Studio','negotiation','6-8',15,'pairs','Students pair up as buyer and merchant in a bustling market. Across 3 levels they trade offers, learn to anchor, find win-win deals, and walk away politely. Level 3 features a shrewd merchant with long counter-offer speeches. The end screen has an optional "Learn more" link to our studio website.','approved_with_notes'),
  ('22222222-2222-2222-2222-222222222222','Comeback Kings','Snap Studio','public_speaking','6-8',20,'whole_class','A whole-class speaking game. Round 1: warm-up tongue twisters. Round 2: students draw "roast" prompt cards and deliver quick comebacks to the class; card 4 jokes about a classmate''s weight and card 7 about how someone looks. A leaderboard asks players for first name and school name on the join screen.','needs_changes'),
  ('33333333-3333-3333-3333-333333333333','Talk It Out','Kindred Labs','conflict_resolution','6-8',10,'pairs','Partners read a short scenario about a disagreement over a group project, then take turns using "I feel... when... because..." statements. A timer guides 3 rounds, ending with a shared reflection card. No accounts, no links, no data collected.','submitted')
  RETURNING id
)
SELECT 1;

INSERT INTO public.evaluations (id,game_id,attempt_number,status,overall_result,categories_run) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',1,'complete','approved_with_notes','{content_safety,age_fit,privacy,ads_spending,contact_social,learning_fit}'),
('aaaaaaaa-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222',1,'complete','needs_changes','{content_safety,age_fit,privacy,ads_spending,contact_social,learning_fit}');

INSERT INTO public.findings (evaluation_id,category,severity,title,evidence,why_it_matters,suggested_fix,confidence) VALUES
('aaaaaaaa-0000-0000-0000-000000000001','age_fit','should_fix','Level 3 dialogue reads above 7th grade','Level 3, merchant counter-offer text','Struggling readers may tune out right when the negotiation gets interesting.','Shorten sentences and swap complex words for everyday ones (aim for grade 6-7).',0.86),
('aaaaaaaa-0000-0000-0000-000000000001','contact_social','should_fix','"Learn more" link leaves the game','End screen, footer link','Students can wander to an external site without a teacher knowing.','Remove the link or move it to a teacher-only info page.',0.9),
('aaaaaaaa-0000-0000-0000-000000000001','learning_fit','suggestion','Pacing suggests 20 minutes, not 15','Game listing, stated duration','Teachers plan tight periods around your time estimate.','Update the duration to 20 minutes or trim a level.',0.7),
('aaaaaaaa-0000-0000-0000-000000000002','content_safety','must_fix','Roast cards mock appearance and weight','Round 2, ''roast'' prompt cards 4 and 7','Body-based jokes can hurt students and invite bullying.','Rewrite cards to playfully challenge ideas or choices, never bodies or looks.',0.93),
('aaaaaaaa-0000-0000-0000-000000000002','privacy','should_fix','Leaderboard asks for name and school','Join screen','Pairing a name with a school identifies a minor.','Use auto-generated nicknames and drop the school field.',0.88),
('aaaaaaaa-0000-0000-0000-000000000002','learning_fit','suggestion','Add a reflection step','After Round 2','Helps students connect banter to respectful disagreement.','Add a 2-minute "how did that land?" discussion card.',0.75);