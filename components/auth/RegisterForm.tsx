'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import {
  isSupabaseConfigured,
  isSupabaseDemoMode,
  getAuthErrorMessage,
  MISSING_CONFIG_MESSAGE,
} from '@/lib/supabase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setServerError(null);

    if (!isSupabaseConfigured()) {
      setServerError(
        isSupabaseDemoMode()
          ? 'La aplicación está usando credenciales de ejemplo. Añade tus claves reales de Supabase en .env.local para habilitar el registro.'
          : MISSING_CONFIG_MESSAGE
      );
      setIsLoading(false);
      return;
    }

    try {
      // 1. Verificar si el username ya está en uso en profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        setServerError('El nombre de usuario ya está en uso. Por favor elige otro.');
        setIsLoading(false);
        return;
      }

      // 2. Crear usuario con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username.toLowerCase(),
            display_name: data.username,
          },
        },
      });

      if (authError) {
        setServerError(getAuthErrorMessage(authError));
        return;
      }

      if (authData.session) {
        router.push('/');
        router.refresh();
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 rounded-2xl bg-menta-300/15 border border-menta-300/30 text-center space-y-3.5 shadow-glowTeal">
        <div className="w-12 h-12 rounded-full bg-teal-500/20 text-menta-300 flex items-center justify-center mx-auto border border-teal-500/30">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-petroleo-900">¡Cuenta creada con éxito!</h3>
        <p className="text-sm text-petroleo-200 leading-relaxed">
          Hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar tu cuenta antes de iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      <Input
        label="Nombre de usuario"
        type="text"
        placeholder="ej. camilo_voz"
        autoComplete="username"
        helperText="Solo letras, números y guiones bajos (mínimo 3 caracteres)"
        leftIcon={<User className="w-4 h-4" />}
        error={errors.username?.message}
        {...register('username')}
      />

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@correo.com"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        autoComplete="new-password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        autoComplete="new-password"
        leftIcon={<Lock className="w-4 h-4" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div className="space-y-1 pt-1">
        <label className="flex items-start space-x-2.5 text-xs text-petroleo-200 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-deepblue-600 bg-deepblue-900 text-teal-500 focus:ring-teal-400 mt-0.5"
            {...register('termsAccepted')}
          />
          <span>
            Acepto los términos de uso y las políticas de privacidad de la comunidad ladrando opiniones.
          </span>
        </label>
        {errors.termsAccepted && (
          <p className="text-xs text-rose-400 font-medium">
            {errors.termsAccepted.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        size="lg"
        isLoading={isLoading}
      >
        Crear cuenta en ladrando opiniones
      </Button>
    </form>
  );
}
