import { z } from 'zod';

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(30, 'El nombre de usuario no puede superar los 30 caracteres')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'El nombre de usuario solo puede contener letras, números y guiones bajos (_)'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'El correo electrónico es obligatorio')
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z
      .string()
      .min(1, 'Debes confirmar tu contraseña'),
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, {
        message: 'Debes aceptar los términos y condiciones de VozComún',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const profileUpdateSchema = z.object({
  display_name: z
    .string()
    .trim()
    .max(60, 'El nombre visible no puede superar los 60 caracteres')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'La biografía no puede superar los 500 caracteres')
    .optional(),
  avatar_path: z.string().optional().nullable(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

