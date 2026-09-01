CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  edit_token text NOT NULL,
  name text NOT NULL DEFAULT 'My Goal',
  current_amount numeric NOT NULL DEFAULT 0,
  target_amount numeric NOT NULL DEFAULT 100,
  currency text NOT NULL DEFAULT '$',
  icon text NOT NULL DEFAULT 'pc',
  custom_image text,
  theme text NOT NULL DEFAULT 'gaming',
  bar_color text NOT NULL DEFAULT '#d8b26a',
  background text NOT NULL DEFAULT 'transparent',
  text_color text NOT NULL DEFAULT '#f2e7d4',
  size text NOT NULL DEFAULT 'md',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, slug, name, current_amount, target_amount, currency, icon, custom_image, theme, bar_color, background, text_color, size, created_at, updated_at) ON public.goals TO anon, authenticated;
GRANT ALL ON public.goals TO service_role;

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone with the link can view a goal"
ON public.goals FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER goals_set_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();