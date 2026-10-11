import { describe, it, expect } from 'vitest';
import {
  audioMetadataSchema,
  validateAudioFile,
  MAX_AUDIO_SIZE_BYTES,
  MAX_AUDIO_DURATION_SECONDS,
} from '@/lib/validations/audio';

describe('Validaciones de Audio y Publicación', () => {
  describe('Metadatos de publicación (audioMetadataSchema)', () => {
    it('debe aceptar título, categoría y descripción válidos', () => {
      const valid = {
        title: 'Sonidos del amanecer en el parque',
        category: 'naturaleza',
        description: 'Grabación de campo con aves cantando a las 6 AM.',
      };
      const result = audioMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe rechazar títulos de menos de 3 caracteres', () => {
      const invalid = {
        title: 'ab',
        category: 'general',
      };
      const result = audioMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('al menos 3 caracteres');
      }
    });

    it('debe rechazar títulos de más de 150 caracteres', () => {
      const invalid = {
        title: 'a'.repeat(151),
        category: 'general',
      };
      const result = audioMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe rechazar descripciones de más de 2000 caracteres', () => {
      const invalid = {
        title: 'Título válido',
        category: 'general',
        description: 'x'.repeat(2001),
      };
      const result = audioMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Inspección de archivos (validateAudioFile)', () => {
    it('debe validar un archivo MP3 de tamaño normal', () => {
      const mockFile = {
        name: 'entrevista.mp3',
        type: 'audio/mpeg',
        size: 5 * 1024 * 1024, // 5 MB
      };
      const result = validateAudioFile(mockFile);
      expect(result.valid).toBe(true);
    });

    it('debe validar una grabación en WebM Opus', () => {
      const mockFile = {
        name: 'grabacion.webm',
        type: 'audio/webm;codecs=opus',
        size: 1.5 * 1024 * 1024, // 1.5 MB
      };
      const result = validateAudioFile(mockFile);
      expect(result.valid).toBe(true);
    });

    it('debe rechazar archivos que superen los 20 MB', () => {
      const mockOversizedFile = {
        name: 'audio-gigante.wav',
        type: 'audio/wav',
        size: 25 * 1024 * 1024, // 25 MB > 20 MB
      };
      const result = validateAudioFile(mockOversizedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('límite máximo permitido es de 20 MB');
    });

    it('debe rechazar archivos con tamaño 0 o negativo', () => {
      const emptyFile = {
        name: 'vacio.mp3',
        type: 'audio/mp3',
        size: 0,
      };
      const result = validateAudioFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('vacío');
    });

    it('debe rechazar archivos que no sean de audio (ej. ejecutables, PDFs)', () => {
      const invalidFileType = {
        name: 'documento.pdf',
        type: 'application/pdf',
        size: 500 * 1024,
      };
      const result = validateAudioFile(invalidFileType);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Formato no compatible');
    });
  });

  describe('Límites del sistema', () => {
    it('debe definir 20 MB para tamaño y 600 segundos para duración', () => {
      expect(MAX_AUDIO_SIZE_BYTES).toBe(20 * 1024 * 1024);
      expect(MAX_AUDIO_DURATION_SECONDS).toBe(600);
    });
  });
});

