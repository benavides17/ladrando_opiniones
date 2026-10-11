export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-abc123xyz';

export const SUPABASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'audios';

const PLACEHOLDER_URLS = [
  'https://placeholder-project.supabase.co',
  'https://tu-proyecto.supabase.co',
];

const PLACEHOLDER_KEYS = ['placeholder-anon-key-abc123xyz', 'tu-anon-key-aqui'];

export function isSupabaseConfigured(): boolean {
  const url = SUPABASE_URL.trim();
  const key = SUPABASE_ANON_KEY.trim();

  const hasUrl = url.startsWith('http') && !PLACEHOLDER_URLS.includes(url);
  const hasKey = key.length > 20 && !PLACEHOLDER_KEYS.includes(key);

  return hasUrl && hasKey;
}

export function isSupabaseDemoMode(): boolean {
  const url = SUPABASE_URL.trim();
  const key = SUPABASE_ANON_KEY.trim();

  return Boolean(url) && Boolean(key) && !isSupabaseConfigured();
}

export const MISSING_CONFIG_MESSAGE =
  'La aplicación no está conectada a Supabase. Agrega tus credenciales reales en .env.local ' +
  '(NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY) y reinicia el servidor.';

export function getAuthErrorMessage(error: unknown): string {
  const raw =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message ?? '')
      : typeof error === 'string'
        ? error
        : '';

  const message = raw.trim();

  if (/already registered|already been registered|user already exists/i.test(message)) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }
  if (/invalid login credentials|invalid_grant/i.test(message)) {
    return 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.';
  }
  if (
    message === '' ||
    /failed to fetch|networkerror|load failed|network request failed|fetch failed|err_(connection|name|internet)/i.test(
      message
    )
  ) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.';
  }
  return message;
}
