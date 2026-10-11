-- Migración inicial: VozComún — Comunidad de Audios
-- Archivo: supabase/migrations/20261010000001_initial_schema.sql

-- 1. Extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
  CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_]+$')
);

-- 3. TABLA DE PUBLICACIONES DE AUDIO (audios)
CREATE TABLE IF NOT EXISTS public.audios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ayuda',
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration_seconds NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 150),
  CONSTRAINT description_max_length CHECK (description IS NULL OR char_length(description) <= 2000),
  CONSTRAINT audio_status_check CHECK (status IN ('published', 'draft', 'archived')),
  CONSTRAINT file_size_positive CHECK (file_size > 0)
);

-- 4. TABLA DE COMENTARIOS (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id UUID NOT NULL REFERENCES public.audios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT comment_content_length CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 1000)
);

-- 5. ÍNDICES PARA ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_audios_created_at_desc ON public.audios (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audios_user_id ON public.audios (user_id);
CREATE INDEX IF NOT EXISTS idx_audios_category ON public.audios (category);
CREATE INDEX IF NOT EXISTS idx_audios_status ON public.audios (status);
CREATE INDEX IF NOT EXISTS idx_comments_audio_created ON public.comments (audio_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments (user_id);

-- 6. TRIGGER PARA CREACIÓN AUTOMÁTICA DE PERFIL AL REGISTRARSE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  desired_username TEXT;
  clean_username TEXT;
BEGIN
  -- Extraer username de la metadata o del email
  desired_username := NEW.raw_user_meta_data->>'username';
  IF desired_username IS NULL OR desired_username = '' THEN
    desired_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Limpiar caracteres no alfanuméricos
  clean_username := regexp_replace(desired_username, '[^a-zA-Z0-9_]', '', 'g');
  IF char_length(clean_username) < 3 THEN
    clean_username := 'usuario_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Si ya existe el username, añadir sufijo aleatorio
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = clean_username) THEN
    clean_username := clean_username || '_' || substr(NEW.id::text, 1, 4);
  END IF;

  INSERT INTO public.profiles (id, username, display_name, avatar_path)
  VALUES (
    NEW.id,
    clean_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', clean_username),
    NEW.raw_user_meta_data->>'avatar_path'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparar al registrar usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_audios_updated_at
  BEFORE UPDATE ON public.audios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. SEGURIDAD: ROW LEVEL SECURITY (RLS)

-- A. Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- B. Políticas para profiles
CREATE POLICY "Perfiles visibles públicamente"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- C. Políticas para audios
CREATE POLICY "Audios publicados visibles por cualquier visitante"
  ON public.audios FOR SELECT
  USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Usuarios autenticados pueden crear audios"
  ON public.audios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo el propietario puede actualizar su audio"
  ON public.audios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo el propietario puede eliminar su audio"
  ON public.audios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- D. Políticas para comments
CREATE POLICY "Comentarios visibles si el audio es público"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.audios
      WHERE audios.id = comments.audio_id
      AND (audios.status = 'published' OR audios.user_id = auth.uid())
    )
  );

CREATE POLICY "Usuarios autenticados pueden publicar comentarios"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo el autor puede editar su comentario"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo el autor puede eliminar su comentario"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. CONFIGURACIÓN DEL BUCKET DE SUPABASE STORAGE Y POLÍTICAS
-- Instrucción: Crear bucket 'audios' si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audios',
  'audios',
  true,
  20971520, -- 20 MB
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/x-m4a']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/x-m4a'];

-- Políticas de Storage RLS para el bucket 'audios':
-- 1) Lectura pública de objetos de audio
CREATE POLICY "Acceso público de lectura para audios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'audios');

-- 2) Subida de audios solo por el usuario autenticado en su propia carpeta: {user_id}/*
CREATE POLICY "Usuarios autenticados pueden subir audios en su carpeta"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audios'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3) Actualización de audio solo por su propietario
CREATE POLICY "Usuarios pueden actualizar sus propios audios en storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'audios'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Eliminación de audio solo por su propietario
CREATE POLICY "Usuarios pueden eliminar sus propios audios en storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'audios'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
