-- Migration 002: Add tipo_publicacion and repuesto/accesorio fields
-- Run this in Supabase Dashboard → SQL Editor

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS tipo_publicacion  text    DEFAULT 'vehiculo',
  ADD COLUMN IF NOT EXISTS nombre_item       text,
  ADD COLUMN IF NOT EXISTS categoria_item    text,
  ADD COLUMN IF NOT EXISTS descripcion_item  text,
  ADD COLUMN IF NOT EXISTS compatible_marcas text,
  ADD COLUMN IF NOT EXISTS compatible_modelos text,
  ADD COLUMN IF NOT EXISTS compatible_anios  text,
  ADD COLUMN IF NOT EXISTS es_universal      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cantidad          integer DEFAULT 1;

-- Backfill existing rows
UPDATE public.listings SET tipo_publicacion = 'vehiculo' WHERE tipo_publicacion IS NULL;
