-- Migration 001: Create listings table
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.listings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Step 1: Datos básicos
  tipo_vehiculo text,
  marca         text,
  modelo        text,
  anio          integer,
  version       text,
  kilometraje   integer,
  condicion     text DEFAULT 'Usado',

  -- Step 2: Precio y operación
  precio           numeric,
  moneda           text DEFAULT 'USD',
  acepta_permuta   text,
  precio_negociable text,
  financiacion     text,
  info_financiacion text,

  -- Step 3: Características
  combustible text,
  transmision text,
  motor       text,
  color       text,
  puertas     text,
  carroceria  text,
  traccion    text,

  -- Step 4: Estado y documentación
  papeles_al_dia      text,
  tarjeta_circulacion text,
  deudas              text,
  titularidad         text,
  estado_general      text,
  observaciones       text,

  -- Step 5: Fotos (Cloudinary URLs)
  fotos text[] DEFAULT '{}',

  -- Step 6: Contacto y ubicación
  departamento     text,
  municipio        text,
  nombre_contacto  text,
  whatsapp         text,
  email_contacto   text,
  horario_contacto text,
  mostrar_whatsapp text,

  -- Step 8: Plan
  plan text DEFAULT 'gratuito',

  -- Metadata
  status     text    DEFAULT 'activo',
  vistas     integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Row-level security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read active listings
CREATE POLICY "listings_public_select" ON public.listings
  FOR SELECT USING (status = 'activo');

-- Authenticated sellers can insert their own listings
CREATE POLICY "listings_seller_insert" ON public.listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own listings
CREATE POLICY "listings_seller_update" ON public.listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "listings_seller_delete" ON public.listings
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

-- Auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
