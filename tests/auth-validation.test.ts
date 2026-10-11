import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  profileUpdateSchema,
} from '@/lib/validations/auth';

describe('Validaciones de Autenticación (Auth)', () => {
  describe('Registro de usuario (registerSchema)', () => {
    it('debe aceptar datos de registro válidos', () => {
      const validData = {
        username: 'camilo_voz99',
        email: 'camilo@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar un nombre de usuario con caracteres inválidos', () => {
      const invalidData = {
        username: 'camilo@voz!',
        email: 'camilo@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('solo puede contener letras');
      }
    });

    it('debe rechazar si las contraseñas no coinciden', () => {
      const invalidData = {
        username: 'camilo_voz',
        email: 'camilo@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Las contraseñas no coinciden');
      }
    });

    it('debe rechazar si no se aceptan los términos y condiciones', () => {
      const invalidData = {
        username: 'camilo_voz',
        email: 'camilo@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: false,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Debes aceptar los términos');
      }
    });

    it('debe rechazar nombres de usuario menores a 3 caracteres', () => {
      const invalidData = {
        username: 'ab',
        email: 'camilo@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Inicio de sesión (loginSchema)', () => {
    it('debe aceptar credenciales con email y contraseña válidos', () => {
      const validData = {
        email: 'usuario@vozcomun.com',
        password: 'MiContrasenaSegura',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar formato de correo inválido', () => {
      const invalidData = {
        email: 'no-es-un-email',
        password: 'Password123!',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Ingresa un correo electrónico válido');
      }
    });

    it('debe rechazar contraseña vacía', () => {
      const invalidData = {
        email: 'usuario@vozcomun.com',
        password: '',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Recuperación de contraseña (forgotPasswordSchema)', () => {
    it('debe validar correo electrónico para recuperación', () => {
      const valid = forgotPasswordSchema.safeParse({ email: 'test@vozcomun.com' });
      expect(valid.success).toBe(true);

      const invalid = forgotPasswordSchema.safeParse({ email: 'correo-invalido' });
      expect(invalid.success).toBe(false);
    });
  });

  describe('Actualización de perfil (profileUpdateSchema)', () => {
    it('debe permitir biografía y nombre visible válidos', () => {
      const validData = {
        display_name: 'Camilo Narrador',
        bio: 'Creador de historias sonoras y paisajes acústicos de la ciudad.',
      };
      const result = profileUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('debe rechazar biografía que exceda los 500 caracteres', () => {
      const invalidData = {
        display_name: 'Camilo',
        bio: 'a'.repeat(501),
      };
      const result = profileUpdateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

