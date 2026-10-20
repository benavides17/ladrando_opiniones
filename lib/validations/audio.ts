import { z } from 'zod';

export const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_AUDIO_DURATION_SECONDS = 600; // 10 minutos

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  'audio/x-m4a',
] as const;

export const AUDIO_CATEGORIES = [
  { value: 'ayuda', label: '¿Quién tiene la voz?' },
] as const;

export function getAudioCategoryLabel(value: string): string {
  if (value === 'ayuda' || value === 'animalista' || value === 'denuncias' || value === 'musica') {
    return '¿Quién tiene la voz?';
  }
  return AUDIO_CATEGORIES.find((category) => category.value === value)?.label || '¿Quién tiene la voz?';
}

export const audioMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(150, 'El título no puede superar los 150 caracteres'),
  description: z
    .string()
    .trim()
    .max(2000, 'La descripción no puede superar los 2.000 caracteres')
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .min(1, 'Selecciona una categoría para el audio'),
});

export type AudioMetadataFormData = z.infer<typeof audioMetadataSchema>;

/**
 * Validador de archivos de audio (tamaño, tipo MIME, extensión)
 */
export function validateAudioFile(file: {
  size: number;
  type: string;
  name: string;
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Debes seleccionar o grabar un archivo de audio' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'El archivo de audio está vacío' };
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `El archivo pesa ${sizeMb} MB. El límite máximo permitido es de 20 MB.`,
    };
  }

  // Validación de extensión y mime type
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac', 'mp4'];

  const isMimeAllowed = ALLOWED_AUDIO_MIME_TYPES.some((m) =>
    file.type.toLowerCase().startsWith(m) || file.type.toLowerCase().includes('audio')
  );

  const isExtAllowed = allowedExtensions.includes(extension);

  if (!isMimeAllowed && !isExtAllowed) {
    return {
      valid: false,
      error: 'Formato no compatible. Usa archivos MP3, WAV, M4A, WebM u OGG.',
    };
  }

  return { valid: true };
}
