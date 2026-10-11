'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Calendar, AlertCircle } from 'lucide-react';
import type { AudioWithProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/supabase/config';
import { useAuth } from '@/lib/context/AuthContext';
import { getAudioCategoryLabel } from '@/lib/validations/audio';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { getPublicStorageUrl } from '@/lib/utils/audio';
import { AudioPlayer } from './AudioPlayer';
import { AudioCommentsSection } from '@/components/comments/AudioCommentsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { SAMPLE_AUDIOS } from '@/lib/data/sampleAudios';

interface AudioDetailPageClientProps {
  id: string;
}

export function AudioDetailPageClient({ id }: AudioDetailPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [audio, setAudio] = useState<AudioWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadAudio() {
      try {
        const { data, error } = await supabase
          .from('audios')
          .select(`
            *,
            profile:profiles (
              id,
              username,
              display_name,
              avatar_path
            )
          `)
          .eq('id', id)
          .single();

        if (!error && data) {
          setAudio(data as unknown as AudioWithProfile);
          return;
        }

        // Buscar en audios de demostración
        const sample = SAMPLE_AUDIOS.find((a) => a.id === id);
        if (sample) {
          setAudio(sample);
          return;
        }

        setError('No pudimos encontrar esta publicación de audio.');
      } catch {
        const sample = SAMPLE_AUDIOS.find((a) => a.id === id);
        if (sample) {
          setAudio(sample);
        } else {
          setError('Ocurrió un error al cargar la información del audio.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAudio();
  }, [id, supabase]);

  const isOwner = user?.id && audio?.user_id === user.id;

  const handleDeleteAudio = async () => {
    if (!audio || !isOwner) return;
    setIsDeleting(true);

    try {
      if (audio.storage_path && !audio.storage_path.startsWith('http')) {
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([audio.storage_path]);
      }

      const { error: deleteError } = await supabase
        .from('audios')
        .delete()
        .eq('id', audio.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      router.push('/explorar');
      router.refresh();
    } catch (err: any) {
      alert('Error al eliminar la publicación: ' + (err.message || 'Error desconocido'));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-teal-300">Cargando publicación...</p>
      </div>
    );
  }

  if (error || !audio) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white">Audio no encontrado</h2>
        <p className="text-sm text-petroleo-200">{error}</p>
        <Link href="/explorar">
          <Button variant="outline" size="sm">
            Volver a explorar audios
          </Button>
        </Link>
      </div>
    );
  }

  const audioUrl = getPublicStorageUrl(audio.storage_path);
  const authorName = audio.profile?.display_name || audio.profile?.username || 'Anónimo';
  const authorUsername = audio.profile?.username || 'usuario';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navegación y acciones de autor */}
      <div className="flex items-center justify-between">
        <Link
          href="/explorar"
          className="inline-flex items-center space-x-2 text-sm text-petroleo-200 hover:text-menta-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo</span>
        </Link>

        {isOwner && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Eliminar mi audio
          </Button>
        )}
      </div>

      {/* Encabezado y metadatos del audio */}
      <div className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="menta" className="text-sm px-3.5 py-1">
            {getAudioCategoryLabel(audio.category)}
          </Badge>

          <div className="flex items-center space-x-2 text-xs text-teal-300/80">
            <Calendar className="w-3.5 h-3.5" />
            <span>Publicado {formatRelativeTime(audio.created_at)}</span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black text-white leading-tight">
            {audio.title}
          </h1>

          {audio.description && (
            <p className="mt-4 text-base text-petroleo-100 leading-relaxed whitespace-pre-wrap">
              {audio.description}
            </p>
          )}
        </div>

        {/* Tarjeta del autor */}
        <div className="pt-4 border-t border-deepblue-700/60 flex items-center justify-between">
          <Link
            href={`/perfil/${authorUsername}`}
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-sm ring-2 ring-menta-300/60 shadow-sm">
              {getInitials(authorName)}
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-menta-300 transition-colors">
                {authorName}
              </p>
              <p className="text-xs text-teal-300/70">
                @{authorUsername}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Reproductor interactivo */}
      <AudioPlayer
        id={audio.id}
        title={audio.title}
        authorName={authorName}
        url={audioUrl}
        duration={audio.duration_seconds || undefined}
      />

      {/* Sección interactiva de comentarios */}
      <AudioCommentsSection audioId={audio.id} />

      {/* Diálogo de confirmación para eliminar publicación */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="¿Eliminar esta publicación de audio?"
        description="Esta acción eliminará permanentemente la grabación de audio, sus archivos en el almacenamiento y todos sus comentarios. No se puede revertir."
        confirmText="Sí, eliminar audio"
        cancelText="Conservar audio"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAudio}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
