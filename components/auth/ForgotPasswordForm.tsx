'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/client';
import {
  isSupabaseConfigured,
  isSupabaseDemoMode,
  getAuthErrorMessage,
  MISSING_CONFIG_MESSAGE,
} from '@/lib/supabase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError(null);

    if (!isSupabaseConfigured()) {
      setServerError(
        isSupabaseDemoMode()
          ? 'La aplicación está usando credenciales de ejemplo. Añade tus claves reales de Supabase en .env.local para recuperar la contraseña.'
          : MISSING_CONFIG_MESSAGE
      );
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/login`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setServerError(getAuthErrorMessage(error));
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setServerError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 rounded-2xl bg-menta-50 border border-menta-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-petroleo-900">Correo enviado</h3>
        <p className="text-sm text-petroleo-600 leading-relaxed">
          Si el correo está registrado en ladrando opiniones, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{serverError}</span>
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

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        size="lg"
        isLoading={isLoading}
      >
        Enviar enlace de recuperación
      </Button>
    </form>
  );
}
