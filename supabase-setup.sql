-- ================================================
-- PASO 1: Crear tabla informes
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ================================================

CREATE TABLE IF NOT EXISTS informes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_ot text,
  direccion text,
  ubicacion text,
  comuna text,

  numero_atm text,
  serie_atm text,

  modelo_mmbb text,
  serie_mmbb text,

  solicitante text,
  tecnico_supervisor text,

  fecha_inicio timestamptz,
  fecha_fin timestamptz,

  valor_servicio text,

  detalle text,
  resumen_trabajo text,

  imagenes jsonb DEFAULT '[]'::jsonb,

  created_at timestamptz DEFAULT now()
);

-- Deshabilitar RLS para desarrollo (sin autenticación)
ALTER TABLE informes DISABLE ROW LEVEL SECURITY;

-- ================================================
-- PASO 2: Crear bucket de imágenes
-- ================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('imagenes-informes', 'imagenes-informes', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage públicas (para desarrollo sin auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Allow public uploads'
  ) THEN
    CREATE POLICY "Allow public uploads"
      ON storage.objects FOR INSERT TO public
      WITH CHECK (bucket_id = 'imagenes-informes');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Allow public reads'
  ) THEN
    CREATE POLICY "Allow public reads"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'imagenes-informes');
  END IF;
END $$;
