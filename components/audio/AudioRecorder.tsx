'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupportedAudioMimeType, getAudioBlobDuration } from '@/lib/utils/audio';
import { formatDuration } from '@/lib/utils/formatters';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number, mimeType: string, extension: string) => void;
  onReset: () => void;
  onUseUpload?: () => void;
}

export function AudioRecorder({ onRecordingComplete, onReset, onUseUpload }: AudioRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const mimeTypeInfoRef = useRef<{ mimeType: string; extension: string }>({
    mimeType: 'audio/webm',
    extension: 'webm',
  });

  useEffect(() => {
    return () => {
      stopTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 600) {
          stopRecording();
          return 600;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || typeof navigator?.mediaDevices?.getUserMedia !== 'function') {
      setPermissionError(
        'Tu navegador no soporta grabación de audio o necesitas conexión segura (HTTPS/localhost).'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeInfo = getSupportedAudioMimeType();
      mimeTypeInfoRef.current = mimeInfo;

      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported(mimeInfo.mimeType)) {
        options.mimeType = mimeInfo.mimeType;
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: mimeInfo.mimeType,
        });
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);

        const calculatedDuration = await getAudioBlobDuration(finalBlob);
        const finalDuration = calculatedDuration > 0 ? calculatedDuration : recordSeconds;
        setRecordedDuration(finalDuration);

        onRecordingComplete(
          finalBlob,
          finalDuration,
          mimeInfo.mimeType,
          mimeInfo.extension
        );
        stopTracks();
      };

      recorder.start(250);
      setStatus('recording');
      setRecordSeconds(0);
      startTimer();
    } catch (err: any) {
      stopTracks();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(
          'Permiso de micrófono denegado. Haz clic en el candado o cámara en tu barra de direcciones para habilitarlo.'
        );
      } else {
        setPermissionError('No se pudo acceder al micrófono: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        setStatus('paused');
        pauseTimer();
      } catch {}
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && status === 'paused') {
      try {
        mediaRecorderRef.current.resume();
        setStatus('recording');
        startTimer();
      } catch {}
    }
  };

  const stopRecording = () => {
    pauseTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setStatus('stopped');
  };

  const resetRecording = () => {
    stopTracks();
    pauseTimer();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setStatus('idle');
    setRecordSeconds(0);
    setRecordedDuration(0);
    setIsPlayingPreview(false);
    onReset();
  };

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
      audio.onpause = () => setIsPlayingPreview(false);
      audio.onplay = () => setIsPlayingPreview(true);
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play();
    }
  };

  return (
    <div className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-6">
      {/* Mensaje de error de permisos */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start space-x-3 text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">Acceso al micrófono requerido</p>
            <p>{permissionError}</p>
            {onUseUpload && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onUseUpload}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Subir un audio existente
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Visualizador de ondas animadas y contador */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-10 bg-deepblue-900/90 rounded-2xl border border-deepblue-700/60 shadow-inner">
        <div className="flex items-center space-x-1.5 h-16 mb-4">
          {status === 'recording' ? (
            <>
              <span className="w-1.5 h-6 bg-gradient-to-t from-teal-500 to-menta-300 rounded-full animate-wave-1 shadow-glowTeal" />
              <span className="w-1.5 h-10 bg-gradient-to-t from-teal-500 to-menta-300 rounded-full animate-wave-2 shadow-glowTeal" />
              <span className="w-1.5 h-14 bg-gradient-to-t from-teal-400 to-menta-300 rounded-full animate-wave-3 shadow-glowTeal" />
              <span className="w-1.5 h-8 bg-gradient-to-t from-teal-500 to-menta-300 rounded-full animate-wave-4 shadow-glowTeal" />
              <span className="w-1.5 h-12 bg-gradient-to-t from-teal-400 to-menta-300 rounded-full animate-wave-5 shadow-glowTeal" />
              <span className="w-1.5 h-7 bg-gradient-to-t from-teal-500 to-menta-300 rounded-full animate-wave-2 shadow-glowTeal" />
              <span className="w-1.5 h-11 bg-gradient-to-t from-teal-500 to-menta-300 rounded-full animate-wave-1 shadow-glowTeal" />
            </>
          ) : status === 'paused' ? (
            <div className="text-xs font-bold uppercase tracking-wider text-dorado-300 bg-dorado-400/20 px-3.5 py-1 rounded-full border border-dorado-400/30">
              Grabación en pausa
            </div>
          ) : status === 'stopped' ? (
            <div className="flex items-center space-x-2 text-menta-300 bg-menta-300/15 border border-menta-300/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-menta-300" />
              <span>Grabación lista para escuchar</span>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-deepblue-800 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glowTeal">
              <Mic className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Tiempo transcurrido */}
        <div className="text-4xl font-mono font-black text-white tracking-wider">
          {formatDuration(status === 'stopped' ? recordedDuration : recordSeconds)}
        </div>
        <p className="text-xs text-petroleo-300 mt-2">
          {status === 'recording'
            ? 'Grabando audio en directo... (Máx. 10 minutos)'
            : status === 'stopped'
            ? 'Puedes escuchar la toma o volver a grabar si lo deseas'
            : 'Haz clic en el botón para iniciar la captura de voz'}
        </p>
      </div>

      {/* Controles de grabación */}
      <div className="flex flex-wrap items-center justify-center gap-3.5">
        {status === 'idle' && (
          <Button
            variant="primary"
            size="lg"
            onClick={startRecording}
            leftIcon={<Mic className="w-5 h-5" />}
          >
            Iniciar grabación
          </Button>
        )}

        {status === 'recording' && (
          <>
            <Button
              variant="outline"
              onClick={pauseRecording}
              leftIcon={<Pause className="w-4 h-4" />}
            >
              Pausar
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={stopRecording}
              leftIcon={<Square className="w-5 h-5" />}
            >
              Detener grabación
            </Button>
          </>
        )}

        {status === 'paused' && (
          <>
            <Button
              variant="primary"
              onClick={resumeRecording}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Reanudar
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={stopRecording}
              leftIcon={<Square className="w-5 h-5" />}
            >
              Detener y guardar
            </Button>
          </>
        )}

        {status === 'stopped' && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={togglePreview}
              leftIcon={
                isPlayingPreview ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )
              }
            >
              {isPlayingPreview ? 'Pausar prueba' : 'Escuchar grabación'}
            </Button>
            <Button
              variant="ghost"
              onClick={resetRecording}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Volver a grabar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
