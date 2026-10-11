'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import {
  isSupabaseConfigured,
  isSupabaseDemoMode,
  getAuthErrorMessage,
  MISSING_CONFIG_MESSAGE,
} from '@/lib/supabase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    if (!isSupabaseConfigured()) {
      setServerError(
        isSupabaseDemoMode()
          ? 'La aplicación está usando credenciales de ejemplo. Añade tus claves reales de Supabase en .env.local para habilitar el inicio de sesión.'
          : MISSING_CONFIG_MESSAGE
      );
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError(getAuthErrorMessage(error));
        return;
      }

      setServerSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      {serverSuccess && (
        <div className="p-3.5 rounded-2xl bg-menta-300/15 border border-menta-300/30 flex items-start space-x-2.5 text-menta-200 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-menta-300" />
          <span>{serverSuccess}</span>
        </div>
      )}

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@correo.com"
        autoComplete="email"
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="space-y-1">
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs text-teal-400 hover:text-menta-300 font-medium hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        size="lg"
        isLoading={isLoading}
      >
        Entrar a ladrando opiniones
      </Button>
    </form>
  );
}
