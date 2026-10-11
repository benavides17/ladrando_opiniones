'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface CurrentAudioInfo {
  id: string;
  title: string;
  authorName: string;
  url: string;
  duration?: number;
}

interface AudioContextType {
  currentAudio: CurrentAudioInfo | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playAudio: (audio: CurrentAudioInfo) => void;
  pauseAudio: () => void;
  toggleAudio: (audio: CurrentAudioInfo) => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  skip: (seconds: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentAudio, setCurrentAudio] = useState<CurrentAudioInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar elemento de audio persistente en el navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audioElementRef.current = audio;
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const playAudio = useCallback((audio: CurrentAudioInfo) => {
    const el = audioElementRef.current;
    if (!el) return;

    if (currentAudio?.id === audio.id) {
      el.play().catch(() => {});
      setIsPlaying(true);
      return;
    }

    // Nuevo audio: pausar anterior, resetear e iniciar
    el.pause();
    el.src = audio.url;
    el.currentTime = 0;
    setCurrentAudio(audio);
    setDuration(audio.duration || 0);
    setCurrentTime(0);

    el.play().catch(() => {});
    setIsPlaying(true);
  }, [currentAudio]);

  const pauseAudio = useCallback(() => {
    const el = audioElementRef.current;
    if (el) {
      el.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleAudio = useCallback((audio: CurrentAudioInfo) => {
    if (currentAudio?.id === audio.id && isPlaying) {
      pauseAudio();
    } else {
      playAudio(audio);
    }
  }, [currentAudio, isPlaying, pauseAudio, playAudio]);

  const seek = useCallback((seconds: number) => {
    const el = audioElementRef.current;
    if (el && isFinite(seconds)) {
      el.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const skip = useCallback((deltaSeconds: number) => {
    const el = audioElementRef.current;
    if (el) {
      const nextTime = Math.max(0, Math.min(el.currentTime + deltaSeconds, el.duration || 0));
      el.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(val, 1));
    setVolumeState(clamped);
    if (audioElementRef.current) {
      audioElementRef.current.volume = clamped;
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentAudio,
        isPlaying,
        currentTime,
        duration,
        volume,
        playAudio,
        pauseAudio,
        toggleAudio,
        seek,
        setVolume,
        skip,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio debe ser utilizado dentro de un AudioProvider');
  }
  return context;
}

