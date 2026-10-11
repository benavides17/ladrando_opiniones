'use client';

import React from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, X } from 'lucide-react';
import { useAudio } from '@/lib/context/AudioContext';
import { formatDuration } from '@/lib/utils/formatters';

export function GlobalAudioPlayerBar() {
  const {
    currentAudio,
    isPlaying,
    currentTime,
    duration,
    volume,
    toggleAudio,
    pauseAudio,
    seek,
    setVolume,
    skip,
  } = useAudio();

  if (!currentAudio) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-deepblue-950/95 backdrop-blur-2xl border-t border-deepblue-600/50 shadow-2xl transition-all">
      {/* Barra de progreso superior interactiva */}
      <div className="relative w-full h-1.5 bg-deepblue-800 cursor-pointer group">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-menta-300 rounded-r shadow-glowTeal transition-all"
          style={{ width: `${progressPercent}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeekChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Progreso del audio"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Metadatos del audio */}
        <div className="flex items-center space-x-3 min-w-0 max-w-[32%]">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 shadow-sm">
            <span className="text-lg">🎙️</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {currentAudio.title}
            </p>
            <p className="text-xs text-teal-300/80 truncate">
              {currentAudio.authorName}
            </p>
          </div>
        </div>

        {/* Controles centrales */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => skip(-10)}
              className="p-1.5 text-petroleo-300 hover:text-white transition-colors"
              title="Retroceder 10 segundos"
              aria-label="Retroceder 10 segundos"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleAudio(currentAudio)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white flex items-center justify-center shadow-glowTeal transition-transform active:scale-95"
              aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className="p-1.5 text-petroleo-300 hover:text-white transition-colors"
              title="Avanzar 10 segundos"
              aria-label="Avanzar 10 segundos"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] font-mono text-petroleo-300 mt-1">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </div>
        </div>

        {/* Volumen y cerrar */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-petroleo-300 hover:text-white"
              aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-teal-400 cursor-pointer h-1.5 bg-deepblue-700 rounded-lg"
              aria-label="Volumen"
            />
          </div>

          <button
            onClick={pauseAudio}
            className="p-1.5 text-petroleo-400 hover:text-white rounded-lg hover:bg-deepblue-800"
            title="Detener"
            aria-label="Detener reproducción"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
