'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause, MessageSquare, Clock } from 'lucide-react';
import type { AudioWithProfile } from '@/types/database';
import { useAudio } from '@/lib/context/AudioContext';
import { formatDuration, formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { getPublicStorageUrl } from '@/lib/utils/audio';
import { Badge } from '@/components/ui/Badge';
import { getAudioCategoryLabel } from '@/lib/validations/audio';

interface AudioCardProps {
  audio: AudioWithProfile;
}

export function AudioCard({ audio }: AudioCardProps) {
  const { currentAudio, isPlaying, toggleAudio } = useAudio();

  const isCurrent = currentAudio?.id === audio.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const audioUrl = getPublicStorageUrl(audio.storage_path);
  const authorName = audio.profile?.display_name || audio.profile?.username || 'Anónimo';
  const authorUsername = audio.profile?.username || 'usuario';

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleAudio({
      id: audio.id,
      title: audio.title,
      authorName,
      url: audioUrl,
      duration: audio.duration_seconds || undefined,
    });
  };

  return (
    <div className="bg-deepblue-800/60 hover:bg-deepblue-750/80 backdrop-blur-xl border border-deepblue-600/50 hover:border-teal-500/50 shadow-card hover:shadow-glowTeal rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Cabecera de la tarjeta: autor y categoría */}
        <div className="flex items-center justify-between mb-3.5">
          <Link
            href={`/perfil/${authorUsername}`}
            className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-xs ring-2 ring-menta-300/60 shadow-sm shrink-0">
              {getInitials(authorName)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white group-hover:text-menta-300 transition-colors truncate">
                {authorName}
              </p>
              <p className="text-[11px] text-teal-300/70">
                @{authorUsername}
              </p>
            </div>
          </Link>

          <Badge variant="menta">
            {getAudioCategoryLabel(audio.category)}
          </Badge>
        </div>

        {/* Título y descripción */}
        <Link href={`/audios/${audio.id}`} className="block group-hover:text-menta-200 transition-colors">
          <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-menta-200 line-clamp-1 mb-1.5 leading-snug">
            {audio.title}
          </h3>
          {audio.description && (
            <p className="text-xs sm:text-sm text-petroleo-200 line-clamp-2 leading-relaxed mb-4">
              {audio.description}
            </p>
          )}
        </Link>
      </div>

      {/* Barra de control y metadatos */}
      <div className="pt-3 border-t border-deepblue-700/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePlayToggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isCurrentlyPlaying
                ? 'bg-gradient-to-tr from-teal-500 to-teal-400 text-white shadow-glowTeal ring-4 ring-menta-300/30 scale-105'
                : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-white border border-teal-500/30'
            }`}
            aria-label={isCurrentlyPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="flex items-center space-x-1 text-xs font-mono text-teal-300/80">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(audio.duration_seconds)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-petroleo-300">
          <Link
            href={`/audios/${audio.id}#comentarios`}
            className="flex items-center space-x-1 hover:text-menta-300 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{audio.comments_count ?? 0}</span>
          </Link>

          <span>·</span>
          <span>{formatRelativeTime(audio.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
