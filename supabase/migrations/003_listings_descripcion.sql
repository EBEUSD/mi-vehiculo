-- 003: add descripcion column for vehicle free-text description
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS descripcion text;
