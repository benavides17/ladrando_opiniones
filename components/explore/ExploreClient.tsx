'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Headphones, Pause, Pin, Play, Sparkles } from 'lucide-react';
import type { AudioWithProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useAudio } from '@/lib/context/AudioContext';
import { useAuth } from '@/lib/context/AuthContext';
import { formatDuration, formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { getPublicStorageUrl } from '@/lib/utils/audio';

const REMOVED_AUDIO_IDS = new Set([
  '1b5b54c1-0b23-4d09-b390-255c7fee0e3a',
  'b4db15f2-0c4a-41a0-a348-8760b106c989',
]);

export function ExploreClient() {
  const [audios, setAudios] = useState<AudioWithProfile[]>([]);
  const { currentAudio, isPlaying, toggleAudio } = useAudio();
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const loadRecentVoices = async () => {
      let { data, error } = await supabase
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
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        ({ data, error } = await supabase
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
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(6));
      }

      if (!error && data && data.length > 0) {
        setAudios(
          (data as unknown as AudioWithProfile[]).filter(
            (audio) => !REMOVED_AUDIO_IDS.has(audio.id)
          )
        );
      } else if (error) {
        setAudios([]);
      }
    };

    loadRecentVoices();
  }, [supabase]);

  const handlePlay = (audio: AudioWithProfile) => {
    const authorName = audio.profile?.display_name || audio.profile?.username || 'Anónimo';
    toggleAudio({
      id: audio.id,
      title: audio.title,
      authorName,
      url: getPublicStorageUrl(audio.storage_path),
      duration: audio.duration_seconds || undefined,
    });
  };

  const handlePin = async (audio: AudioWithProfile) => {
    if (!user || user.id !== audio.user_id) return;

    const { data, error } = await supabase
      .from('audios')
      .update({ is_pinned: !audio.is_pinned })
      .eq('id', audio.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !data) {
      alert(`No se pudo ${audio.is_pinned ? 'quitar de arriba' : 'fijar arriba'} el audio.`);
      return;
    }

    setAudios((current) =>
      [...current.map((item) => item.id === audio.id ? { ...item, is_pinned: data.is_pinned } : item)]
        .sort((first, second) => {
          if (first.is_pinned !== second.is_pinned) return first.is_pinned ? -1 : 1;
          return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
        })
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-deepblue-600/60 bg-gradient-to-br from-deepblue-850 via-deepblue-800 to-teal-950/70 p-7 shadow-2xl sm:p-12 lg:p-16">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-menta-300/30 bg-menta-300/10 px-3.5 py-1.5 text-xs font-semibold text-menta-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-dorado-300" />
            <span>Una mirada diferente a la comunidad</span>
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            ¿Quién tiene la voz?
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-petroleo-100 sm:text-base">
            Un espacio para compartir perspectivas y repensar la forma en que convivimos con los perros.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-24 top-0 h-56 w-56 rounded-full bg-dorado-400/10 blur-3xl" />
      </section>

      <section className="space-y-6 rounded-[2rem] border border-deepblue-700/50 bg-deepblue-900/30 p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-deepblue-700/60 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Voces de la comunidad</p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">Lo que otros quieren compartir</h2>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10">
            <Headphones className="h-5 w-5 text-teal-300" />
          </div>
        </div>

        {audios.length === 0 && (
          <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-teal-400/20 bg-deepblue-950/25 px-6 py-10 text-center">
            <div className="max-w-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-400/10 text-teal-300 ring-1 ring-teal-300/20">
                <Headphones className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">Aún no hay voces para mostrar</p>
              <p className="mt-1 text-xs leading-5 text-petroleo-300">
                Cuando alguien comparta un audio, aparecerá aquí para que la comunidad pueda escucharlo.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {audios.map((audio, index) => {
            const authorName = audio.profile?.display_name || audio.profile?.username || 'Anónimo';
            const isCurrent = currentAudio?.id === audio.id;
            const isCurrentlyPlaying = isCurrent && isPlaying;

            return (
              <article
                key={audio.id}
                className="group flex items-center gap-4 rounded-2xl border border-deepblue-600/60 bg-deepblue-800/60 p-4 transition-all hover:-translate-y-0.5 hover:border-teal-400/60 hover:bg-deepblue-750/80"
              >
                <button
                  type="button"
                  onClick={() => handlePlay(audio)}
                  aria-label={isCurrentlyPlaying ? `Pausar ${audio.title}` : `Escuchar ${audio.title}`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-teal-200 ring-1 ring-teal-400/30 transition-colors hover:bg-teal-500 hover:text-white"
                >
                  {isCurrentlyPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-[9px] font-bold text-white">
                      {getInitials(authorName)}
                    </div>
                    <span className="truncate text-xs font-semibold text-teal-200">{authorName}</span>
                  </div>
                  <Link href={`/audios/${audio.id}`} className="mt-1 block truncate text-sm font-extrabold text-white transition-colors group-hover:text-menta-200">
                    {audio.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-petroleo-300">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(audio.duration_seconds)}</span>
                    <span>{formatRelativeTime(audio.created_at)}</span>
                  </div>
                </div>
                {user?.id === audio.user_id && (
                  <button
                    type="button"
                    onClick={() => handlePin(audio)}
                    aria-label={audio.is_pinned ? 'Quitar de arriba' : 'Fijar arriba'}
                    title={audio.is_pinned ? 'Quitar de arriba' : 'Fijar arriba'}
                    className={`rounded-lg p-2 transition-colors ${
                      audio.is_pinned
                        ? 'bg-dorado-300/20 text-dorado-300'
                        : 'text-petroleo-300 hover:bg-teal-300/10 hover:text-teal-200'
                    }`}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                )}
                <span className="hidden text-2xl font-black text-teal-400/30 sm:block">{String(index + 1).padStart(2, '0')}</span>
              </article>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center">
        <Link href="/audios/new" className="inline-flex items-center gap-2 rounded-xl border border-teal-300/30 bg-teal-300/10 px-5 py-3 text-sm font-bold text-teal-100 transition-colors hover:bg-teal-300/20">
          Comparte tu propia voz
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
