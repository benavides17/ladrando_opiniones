import { describe, it, expect } from 'vitest';
import {
  formatDuration,
  formatFileSize,
  getInitials,
} from '@/lib/utils/formatters';

describe('Funciones de Formato (formatters)', () => {
  describe('formatDuration', () => {
    it('debe formatear segundos en formato mm:ss', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(45)).toBe('00:45');
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(599)).toBe('09:59');
    });

    it('debe formatear duraciones mayores a 1 hora en hh:mm:ss', () => {
      expect(formatDuration(3600)).toBe('01:00:00');
      expect(formatDuration(3665)).toBe('01:01:05');
    });

    it('debe manejar valores nulos o negativos retornando 00:00', () => {
      expect(formatDuration(null)).toBe('00:00');
      expect(formatDuration(undefined)).toBe('00:00');
      expect(formatDuration(-10)).toBe('00:00');
    });
  });

  describe('formatFileSize', () => {
    it('debe formatear bytes a KB y MB', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048 * 1024)).toBe('2.0 MB');
      expect(formatFileSize(20 * 1024 * 1024)).toBe('20.0 MB');
    });

    it('debe manejar valores nulos', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(null)).toBe('0 B');
    });
  });

  describe('getInitials', () => {
    it('debe extraer iniciales de un nombre', () => {
      expect(getInitials('Camilo Torres')).toBe('CT');
      expect(getInitials('Nathalia')).toBe('NA');
      expect(getInitials('camilo_voz')).toBe('CV');
      expect(getInitials('')).toBe('VC');
    });
  });
});

