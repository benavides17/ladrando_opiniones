'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  profileUpdateSchema,
  type ProfileUpdateFormData,
} from '@/lib/validations/auth';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { getInitials } from '@/lib/utils/formatters';

export function EditProfileForm() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('display_name', profile.display_name || '');
      setValue('bio', profile.bio || '');
    }
  }, [profile, setValue]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: data.display_name?.trim() || null,
          bio: data.bio?.trim() || null,
        })
        .eq('id', user.id);

      if (error) {
        setServerError('No se pudo guardar los cambios: ' + error.message);
        return;
      }

      await refreshProfile();
      setSuccessMessage('¡Tu perfil ha sido actualizado con éxito!');
    } catch {
      setServerError('Ocurrió un error inesperado al actualizar tu perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = profile?.display_name || profile?.username || 'Usuario';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-menta-100/80 border border-menta-300 flex items-start space-x-3 text-petroleo-800 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-teal-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Avatar actual */}
      <div className="flex items-center space-x-4 p-4 rounded-2xl bg-humo-100 border border-humo-200">
        <div className="w-16 h-16 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl ring-4 ring-menta-200 shadow-soft">
          {getInitials(displayName)}
        </div>
        <div>
          <p className="text-sm font-bold text-petroleo-900">@{profile?.username}</p>
          <p className="text-xs text-petroleo-400">
            El nombre de usuario identifica tu enlace público.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Nombre visible"
          placeholder="ej. Juan Pérez"
          helperText="El nombre que otros usuarios verán junto a tus audios."
          leftIcon={<User className="w-4 h-4" />}
          error={errors.display_name?.message}
          {...register('display_name')}
        />

        <Textarea
          label="Biografía personal"
          placeholder="Cuéntanos un poco sobre ti, los temas que te apasionan o lo que grabas..."
          helperText="Máximo 500 caracteres"
          rows={4}
          error={errors.bio?.message}
          {...register('bio')}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/perfil/${profile?.username}`)}
        >
          Ver perfil público
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

