'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Play, Pause, X, AlertCircle } from 'lucide-react';
import { validateAudioFile } from '@/lib/validations/audio';
import { formatFileSize, formatDuration } from '@/lib/utils/formatters';
import { getAudioBlobDuration } from '@/lib/utils/audio';
import { Button } from '@/components/ui/Button';

interface AudioUploadPickerProps {
  onFileSelected: (file: File, duration: number) => void;
  onFileCleared: () => void;
}

export function AudioUploadPicker({ onFileSelected, onFileCleared }: AudioUploadPickerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Archivo inválido');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);

    const audioDur = await getAudioBlobDuration(file);
    setDuration(audioDur);

    onFileSelected(file, audioDur);
  };

  const handleClear = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onFileCleared();
  };

  const togglePreview = () => {
    if (!previewUrl) return;

    if (!audioElementRef.current) {
      const audio = new Audio(previewUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
    } else {
      audioElementRef.current.play();
    }
  };

  return (
    <div className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/webm,audio/mp4,audio/aac,audio/x-m4a,.mp3,.wav,.ogg,.webm,.m4a,.aac,.mp4"
        className="hidden"
        id="audio-file-input"
      />

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-2.5 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-deepblue-600 hover:border-teal-400 bg-deepblue-900/80 hover:bg-deepblue-750/50 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3.5"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/30 group-hover:scale-105 transition-transform shadow-glowTeal flex items-center justify-center text-teal-300">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-bold text-white">
              Haz clic para seleccionar un archivo de audio
            </p>
            <p className="text-xs text-petroleo-300 mt-1">
              Formatos: MP3, WAV, M4A, WebM, OGG (Máx. 20 MB y 10 minutos)
            </p>
          </div>
          <Button variant="outline" size="sm" type="button">
            Explorar archivos en mi equipo
          </Button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-deepblue-900/90 border border-deepblue-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="flex items-center space-x-3.5 min-w-0 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-glowTeal">
              <FileAudio className="w-6 h-6 text-dorado-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-teal-300/80">
                {formatFileSize(selectedFile.size)} · {duration > 0 ? formatDuration(duration) : 'Calculando...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={togglePreview}
              leftIcon={
                isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )
              }
            >
              {isPlaying ? 'Pausar' : 'Escuchar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleClear}
              title="Quitar archivo"
            >
              <X className="w-4 h-4 text-petroleo-300 hover:text-rose-400" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
