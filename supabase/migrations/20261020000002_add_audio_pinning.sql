ALTER TABLE public.audios
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_audios_pinned_created
  ON public.audios (is_pinned DESC, created_at DESC);
