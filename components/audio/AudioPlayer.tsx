'use client';

import React from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/lib/context/AudioContext';
import { formatDuration } from '@/lib/utils/formatters';

interface AudioPlayerProps {
  id: string;
  title: string;
  authorName: string;
  url: string;
  duration?: number;
}

export function AudioPlayer({ id, title, authorName, url, duration: initialDuration = 0 }: AudioPlayerProps) {
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggleAudio,
    seek,
    setVolume,
    skip,
  } = useAudio();

  const isCurrent = currentAudio?.id === id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const activeDuration = isCurrent && duration > 0 ? duration : initialDuration;
  const activeTime = isCurrent ? currentTime : 0;
  const progressPercent = activeDuration > 0 ? (activeTime / activeDuration) * 100 : 0;

  const handleToggle = () => {
    toggleAudio({
      id,
      title,
      authorName,
      url,
      duration: initialDuration,
    });
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (!isCurrent) {
      toggleAudio({
        id,
        title,
        authorName,
        url,
        duration: initialDuration,
      });
    }
    seek(newTime);
  };

  return (
    <div className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-6">
      {/* Visualizador de ondas con estilo ecualizador moderno */}
      <div className="h-24 bg-deepblue-900/80 rounded-2xl flex items-center justify-center space-x-1 sm:space-x-1.5 px-4 border border-deepblue-700/60 shadow-inner">
        {[40, 70, 25, 90, 60, 35, 80, 50, 65, 30, 95, 45, 85, 55, 75, 40, 60, 80, 50, 70, 30, 85, 45, 90].map(
          (height, idx) => {
            const isPlayed = (idx / 24) * 100 <= progressPercent;
            return (
              <div
                key={idx}
                className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                  isCurrentlyPlaying
                    ? isPlayed
                      ? 'bg-gradient-to-t from-teal-400 to-menta-300 scale-y-110 shadow-glowTeal'
                      : 'bg-deepblue-600/70'
                    : isPlayed
                    ? 'bg-teal-500'
                    : 'bg-deepblue-700'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          }
        )}
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        <div className="relative w-full h-2 bg-deepblue-700/70 rounded-full overflow-hidden cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-menta-300 rounded-full shadow-glowTeal transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={activeDuration || 100}
          step={0.1}
          value={activeTime}
          onChange={handleSeek}
          className="w-full -mt-2 opacity-0 cursor-pointer h-3"
          aria-label="Línea de tiempo del audio"
        />

        <div className="flex justify-between text-xs font-mono text-teal-300/80">
          <span>{formatDuration(activeTime)}</span>
          <span>{formatDuration(activeDuration)}</span>
        </div>
      </div>

      {/* Controles principales y volumen */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Controles de reproducción */}
        <div className="flex items-center space-x-5">
          <button
            onClick={() => skip(-10)}
            disabled={!isCurrent}
            className="p-2 text-petroleo-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Retroceder 10s"
            aria-label="Retroceder 10 segundos"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggle}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white flex items-center justify-center shadow-glowTeal ring-4 ring-menta-300/20 transition-transform active:scale-95"
            aria-label={isCurrentlyPlaying ? 'Pausar audio' : 'Reproducir audio'}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            disabled={!isCurrent}
            className="p-2 text-petroleo-300 hover:text-white disabled:opacity-30 transition-colors"
            title="Avanzar 10s"
            aria-label="Avanzar 10 segundos"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {/* Control de volumen */}
        <div className="flex items-center space-x-2.5 bg-deepblue-750/70 px-4 py-2 rounded-2xl border border-deepblue-600/50 shadow-sm">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.85)}
            className="text-petroleo-300 hover:text-white"
            aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-teal-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-teal-400 cursor-pointer h-1.5 bg-deepblue-600 rounded-lg"
            aria-label="Volumen"
          />
        </div>
      </div>
    </div>
  );
}
