'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, Edit3, Trash2, AlertCircle, Headphones } from 'lucide-react';
import type { Profile, AudioWithProfile } from '@/types/database';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/supabase/config';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { AudioCard } from '@/components/audio/AudioCard';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AudioCardSkeleton, LoadingSpinner } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

interface ProfileClientProps {
  username: string;
}

export function ProfileClient({ username }: ProfileClientProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [audios, setAudios] = useState<AudioWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [audioToDelete, setAudioToDelete] = useState<AudioWithProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProfileAndAudios() {
      try {
        // 1. Obtener perfil por username
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username.toLowerCase())
          .single();

        if (profileError || !profileData) {
          setError('El perfil de usuario no existe.');
          return;
        }

        setProfile(profileData as Profile);

        // 2. Obtener audios de este usuario
        const { data: audiosData, error: audiosError } = await supabase
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
          .eq('user_id', profileData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!audiosError && audiosData) {
          setAudios(audiosData as unknown as AudioWithProfile[]);
        }
      } catch {
        setError('Error al cargar la información del usuario.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileAndAudios();
  }, [username, supabase]);

  const isOwnProfile = user?.id && profile?.id === user.id;

  const handleDeleteAudio = async () => {
    if (!audioToDelete || !isOwnProfile) return;
    setIsDeleting(true);

    try {
      // 1. Eliminar de Storage
      if (audioToDelete.storage_path) {
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([audioToDelete.storage_path]);
      }

      // 2. Eliminar de la tabla audios
      const { error: deleteErr } = await supabase
        .from('audios')
        .delete()
        .eq('id', audioToDelete.id);

      if (deleteErr) {
        throw new Error(deleteErr.message);
      }

      setAudios((prev) => prev.filter((a) => a.id !== audioToDelete.id));
      setAudioToDelete(null);
    } catch (err: any) {
      alert('Error al eliminar publicación: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-petroleo-500">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-petroleo-900">Usuario no encontrado</h2>
        <p className="text-sm text-petroleo-500">{error}</p>
        <Link href="/">
          <Button variant="outline" size="sm">
            Volver al inicio
          </Button>
        </Link>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Tarjeta de cabecera de perfil */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-petroleo-100 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar con iniciales y aro de color de la paleta */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl ring-4 ring-menta-200 shadow-soft shrink-0">
          {getInitials(displayName)}
        </div>

        {/* Datos del usuario */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-petroleo-900">
                {displayName}
              </h1>
              <p className="text-sm font-semibold text-teal-600">
                @{profile.username}
              </p>
            </div>

            {isOwnProfile && (
              <Link href="/mi-perfil">
                <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                  Editar mi perfil
                </Button>
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-petroleo-600 max-w-2xl leading-relaxed pt-1 whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-petroleo-400 pt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Miembro desde {formatRelativeTime(profile.created_at)}</span>
            <span>·</span>
            <span>{audios.length} {audios.length === 1 ? 'audio publicado' : 'audios publicados'}</span>
          </div>
        </div>
      </div>

      {/* Lista de publicaciones del usuario */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-petroleo-900">
            Audios publicados por {displayName}
          </h2>
        </div>

        {audios.length === 0 ? (
          <EmptyState
            icon="mic"
            title="Este usuario aún no ha publicado audios"
            description={
              isOwnProfile
                ? '¡Comienza ahora! Graba tu primer audio o sube una pista de voz para compartir.'
                : 'Vuelve pronto para escuchar las historias y audios de este usuario.'
            }
            actionHref={isOwnProfile ? '/audios/new' : undefined}
            actionText={isOwnProfile ? 'Publicar mi primer audio' : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audios.map((audio) => (
              <div key={audio.id} className="relative group">
                <AudioCard audio={audio} />
                {isOwnProfile && (
                  <button
                    onClick={() => setAudioToDelete(audio)}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-rose-50 text-petroleo-400 hover:text-rose-600 rounded-xl shadow-sm border border-petroleo-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar este audio"
                    aria-label="Eliminar publicación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar audio */}
      <ConfirmDialog
        isOpen={!!audioToDelete}
        title="¿Eliminar esta publicación de audio?"
        description={`¿Estás seguro de que deseas eliminar "${audioToDelete?.title}"? Se borrará el archivo de almacenamiento y todos sus comentarios de forma permanente.`}
        confirmText="Eliminar audio"
        cancelText="Conservar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteAudio}
        onCancel={() => setAudioToDelete(null)}
      />
    </div>
  );
}
