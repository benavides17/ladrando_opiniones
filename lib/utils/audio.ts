/**
 * Utilidades para manejo de audio en el navegador y Supabase Storage
 */

/**
 * Obtiene el mejor tipo MIME soportado para grabación en el navegador del usuario
 */
export function getSupportedAudioMimeType(): { mimeType: string; extension: string } {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return { mimeType: 'audio/webm', extension: 'webm' };
  }

  const candidateTypes = [
    { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
    { mimeType: 'audio/webm', extension: 'webm' },
    { mimeType: 'audio/mp4;codecs=mp4a.40.2', extension: 'mp4' },
    { mimeType: 'audio/mp4', extension: 'mp4' },
    { mimeType: 'audio/aac', extension: 'aac' },
    { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' },
    { mimeType: 'audio/ogg', extension: 'ogg' },
  ];

  for (const candidate of candidateTypes) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) {
      return candidate;
    }
  }

  return { mimeType: 'audio/webm', extension: 'webm' };
}

/**
 * Calcula la duración exacta de un archivo Blob o File de audio usando Audio Context / HTMLAudioElement
 */
export function getAudioBlobDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(0);
    }

    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.preload = 'metadata';

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      audio.onloadedmetadata = () => {
        const duration = isFinite(audio.duration) ? audio.duration : 0;
        cleanup();
        resolve(duration);
      };

      audio.onerror = () => {
        cleanup();
        resolve(0);
      };

      audio.src = url;
    } catch {
      resolve(0);
    }
  });
}

/**
 * Obtiene la URL pública del archivo en Supabase Storage
 */
export function getPublicStorageUrl(storagePath: string): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'audios';

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}

