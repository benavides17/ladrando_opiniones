import { describe, it, expect } from 'vitest';
import { commentSchema } from '@/lib/validations/comment';

describe('Validaciones de Comentarios (commentSchema)', () => {
  it('debe aceptar comentarios válidos con contenido real', () => {
    const valid = { content: '¡Excelente audio, me encantó la ambientación y la narración!' };
    const result = commentSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('debe rechazar comentarios vacíos o con solo espacios en blanco', () => {
    const empty = { content: '   ' };
    const result = commentSchema.safeParse(empty);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('no puede estar vacío');
    }
  });

  it('debe rechazar comentarios que superen los 1.000 caracteres', () => {
    const tooLong = { content: 'a'.repeat(1001) };
    const result = commentSchema.safeParse(tooLong);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('no puede superar los 1.000 caracteres');
    }
  });

  it('debe aceptar comentarios de exactamente 1.000 caracteres', () => {
    const exactlyMax = { content: 'a'.repeat(1000) };
    const result = commentSchema.safeParse(exactlyMax);
    expect(result.success).toBe(true);
  });
});

