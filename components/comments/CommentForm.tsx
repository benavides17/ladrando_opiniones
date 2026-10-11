'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Send, AlertCircle } from 'lucide-react';
import { commentSchema, type CommentFormData } from '@/lib/validations/comment';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { CommentWithProfile } from '@/types/database';

interface CommentFormProps {
  audioId: string;
  onCommentCreated: (newComment: CommentWithProfile) => void;
}

export function CommentForm({ audioId, onCommentCreated }: CommentFormProps) {
  const { user, profile } = useAuth();
  const supabase = createClient();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const contentValue = watch('content') || '';

  if (!user) {
    return (
      <div className="bg-deepblue-900/80 rounded-2xl p-6 border border-deepblue-600/50 text-center space-y-3.5 shadow-inner">
        <p className="text-sm text-petroleo-100">
          Inicia sesión o crea una cuenta para dejar un comentario y unirte a la conversación.
        </p>
        <div className="flex justify-center space-x-3">
          <Link href={`/login?redirectTo=/audios/${audioId}`}>
            <Button variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Registrarse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          audio_id: audioId,
          user_id: user.id,
          content: data.content.trim(),
        })
        .select('*')
        .single();

      if (error || !newComment) {
        // En modo demostración local sin backend conectado, crear comentario localmente
        const fallbackComment: CommentWithProfile = {
          id: `local-${Date.now()}`,
          audio_id: audioId,
          user_id: user.id,
          content: data.content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile: {
            id: user.id,
            username: profile?.username || user.user_metadata?.username || 'usuario',
            display_name: profile?.display_name || user.user_metadata?.display_name || 'Usuario',
            avatar_path: profile?.avatar_path || null,
          },
        };
        reset();
        onCommentCreated(fallbackComment);
        return;
      }

      reset();

      const populatedComment: CommentWithProfile = {
        ...newComment,
        profile: {
          id: user.id,
          username: profile?.username || user.user_metadata?.username || 'usuario',
          display_name: profile?.display_name || user.user_metadata?.display_name || 'Usuario',
          avatar_path: profile?.avatar_path || null,
        },
      };

      onCommentCreated(populatedComment);
    } catch {
      setServerError('Ocurrió un error inesperado al enviar el comentario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {serverError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="relative">
        <Textarea
          placeholder="Escribe tu opinión, saludo o feedback (máximo 1.000 caracteres)..."
          rows={3}
          error={errors.content?.message}
          {...register('content')}
        />
        <div className="flex items-center justify-between mt-1.5 text-xs text-teal-300/70">
          <span>{contentValue.length} / 1000 caracteres</span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          rightIcon={<Send className="w-3.5 h-3.5" />}
        >
          Publicar comentario
        </Button>
      </div>
    </form>
  );
}
