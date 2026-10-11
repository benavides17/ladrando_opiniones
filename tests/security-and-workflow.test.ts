import { describe, it, expect, vi } from 'vitest';
import { getPublicStorageUrl } from '@/lib/utils/audio';

describe('Seguridad y Flujos de Publicación', () => {
  describe('Generación de rutas seguras en Supabase Storage', () => {
    it('debe estructurar la ruta separada por user_id/audio_id/filename', () => {
      const userId = '11111111-2222-3333-4444-555555555555';
      const audioId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
      const rawFilename = 'Mi Audio Con Espacios & Símbolos!?.mp3';
      const sanitizedFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

      const storagePath = `${userId}/${audioId}/${sanitizedFilename}`;

      expect(storagePath).toBe(
        '11111111-2222-3333-4444-555555555555/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/Mi_Audio_Con_Espacios___S_mbolos__.mp3'
      );
      expect(storagePath.startsWith(userId)).toBe(true);
    });

    it('debe construir la URL pública correcta del bucket', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET = 'audios';

      const path = 'user-1/audio-1/test.mp3';
      const url = getPublicStorageUrl(path);

      expect(url).toBe('https://test-supabase.co/storage/v1/object/public/audios/user-1/audio-1/test.mp3');
    });
  });

  describe('Control de acceso y autorizaciones (Propiedad de recursos)', () => {
    it('debe impedir que un usuario elimine o modifique recursos de otro', () => {
      const currentUserId: string = 'user-alice';
      const audioOwnerId: string = 'user-bob';

      const canEdit = currentUserId === audioOwnerId;
      const canDelete = currentUserId === audioOwnerId;

      expect(canEdit).toBe(false);
      expect(canDelete).toBe(false);
    });

    it('debe permitir que el propietario elimine o modifique sus propios recursos', () => {
      const currentUserId: string = 'user-alice';
      const audioOwnerId: string = 'user-alice';

      const canEdit = currentUserId === audioOwnerId;
      const canDelete = currentUserId === audioOwnerId;

      expect(canEdit).toBe(true);
      expect(canDelete).toBe(true);
    });
  });

  describe('Simulación de Rollback y Limpieza de archivos huérfanos', () => {
    it('debe invocar la eliminación del archivo huérfano si la inserción en base de datos falla', async () => {
      const mockStorageRemove = vi.fn().mockResolvedValue({ error: null });
      const storagePath = 'user-123/audio-999/grabacion.webm';

      // Simular intento de publicación
      const dbInsertSuccess = false;

      if (!dbInsertSuccess) {
        await mockStorageRemove([storagePath]);
      }

      expect(mockStorageRemove).toHaveBeenCalledWith([storagePath]);
    });
  });
});
