'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Mic, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  audioMetadataSchema,
  AUDIO_CATEGORIES,
  type AudioMetadataFormData,
  MAX_AUDIO_SIZE_BYTES,
  MAX_AUDIO_DURATION_SECONDS,
} from '@/lib/validations/audio';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/supabase/config';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { AudioRecorder } from './AudioRecorder';
import { AudioUploadPicker } from './AudioUploadPicker';

export function AudioPublishForm() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [mode, setMode] = useState<'record' | 'upload'>('record');
  const [audioSource, setAudioSource] = useState<{
    blob: Blob;
    duration: number;
    mimeType: string;
    extension: string;
    filename: string;
  } | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AudioMetadataFormData>({
    resolver: zodResolver(audioMetadataSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'ayuda',
    },
  });

  const handleRecordingComplete = (
    blob: Blob,
    duration: number,
    mimeType: string,
    extension: string
  ) => {
    setAudioSource({
      blob,
      duration,
      mimeType,
      extension,
      filename: `grabacion-${Date.now()}.${extension}`,
    });
    setFormError(null);
  };

  const handleFileSelected = (file: File, duration: number) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    setAudioSource({
      blob: file,
      duration,
      mimeType: file.type || 'audio/mpeg',
      extension: ext,
      filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
    });
    setFormError(null);
  };

  const handleClearAudio = () => {
    setAudioSource(null);
  };

  const onSubmit = async (data: AudioMetadataFormData) => {
    setFormError(null);

    if (!user) {
      setFormError('Debes iniciar sesión para publicar un audio en la comunidad.');
      return;
    }

    if (!audioSource) {
      setFormError('Debes grabar o seleccionar un audio antes de publicar.');
      return;
    }

    if (audioSource.blob.size > MAX_AUDIO_SIZE_BYTES) {
      setFormError('El audio supera el límite máximo de 20 MB.');
      return;
    }

    if (
      audioSource.duration > 0 &&
      audioSource.duration > MAX_AUDIO_DURATION_SECONDS
    ) {
      setFormError('El audio supera el límite máximo de duración de 10 minutos.');
      return;
    }

    setIsPublishing(true);
    setUploadProgress('Subiendo archivo de audio...');

    const audioId = crypto.randomUUID();
    const sanitizedFileName = audioSource.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${audioId}/${sanitizedFileName}`;

    try {
      const { data: existingProfile, error: profileLookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileLookupError) {
        throw new Error('No se pudo verificar tu perfil: ' + profileLookupError.message);
      }

      if (!existingProfile) {
        const metadataUsername =
          typeof user.user_metadata?.username === 'string'
            ? user.user_metadata.username
            : '';
        const baseUsername =
          metadataUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24) ||
          `usuario_${user.id.slice(0, 8)}`;
        let username = baseUsername;

        const { data: usernameTaken, error: usernameLookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();

        if (usernameLookupError) {
          throw new Error('No se pudo verificar el nombre de usuario: ' + usernameLookupError.message);
        }

        if (usernameTaken && usernameTaken.id !== user.id) {
          username = `${baseUsername.slice(0, 18)}_${user.id.slice(0, 4)}`;
        }

        const { error: profileInsertError } = await supabase.from('profiles').insert({
          id: user.id,
          username,
          display_name:
            typeof user.user_metadata?.display_name === 'string'
              ? user.user_metadata.display_name
              : username,
        });

        if (profileInsertError) {
          throw new Error('No se pudo crear tu perfil: ' + profileInsertError.message);
        }
      }

      const { error: storageError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(storagePath, audioSource.blob, {
          contentType: audioSource.mimeType,
          upsert: false,
        });

      if (storageError) {
        throw new Error(
          'Error al subir el archivo: ' + storageError.message
        );
      }

      setUploadProgress('Guardando publicación en la base de datos...');

      const { data: newAudio, error: dbError } = await supabase
        .from('audios')
        .insert({
          id: audioId,
          user_id: user.id,
          title: data.title.trim(),
          description: data.description?.trim() || null,
          category: data.category,
          storage_path: storagePath,
          mime_type: audioSource.mimeType,
          file_size: audioSource.blob.size,
          duration_seconds: audioSource.duration > 0 ? audioSource.duration : null,
          status: 'published',
        })
        .select()
        .single();

      if (dbError || !newAudio) {
        await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([storagePath]);
        throw new Error('Error al registrar la publicación: ' + (dbError?.message || 'Error desconocido'));
      }

      setUploadProgress('¡Publicación creada exitosamente!');
      router.push(`/audios/${newAudio.id}`);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error inesperado al publicar.');
    } finally {
      setIsPublishing(false);
      setUploadProgress(null);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {uploadProgress && (
        <div className="p-4 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-start space-x-3 text-teal-200 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-teal-400 animate-pulse" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {/* Pestañas para elegir modo: Grabar o Subir */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-white">
          Audio a publicar <span className="text-dorado-400">*</span>
        </label>

        <div className="flex rounded-2xl bg-deepblue-900/90 border border-deepblue-600/50 p-1.5 max-w-md shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMode('record');
              handleClearAudio();
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'record'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-glowTeal'
                : 'text-petroleo-200 hover:text-white hover:bg-deepblue-750/60'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Grabar audio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('upload');
              handleClearAudio();
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
              mode === 'upload'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-glowTeal'
                : 'text-petroleo-200 hover:text-white hover:bg-deepblue-750/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Subir archivo</span>
          </button>
        </div>
      </div>

      {/* Componente según modo */}
      {mode === 'record' ? (
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onReset={handleClearAudio}
          onUseUpload={() => {
            setMode('upload');
            handleClearAudio();
          }}
        />
      ) : (
        <AudioUploadPicker
          onFileSelected={handleFileSelected}
          onFileCleared={handleClearAudio}
        />
      )}

      {/* Campos de metadatos */}
      <div className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-5">
        <h3 className="text-lg font-bold text-white">
          Información de la publicación
        </h3>

        <Input
          label="Título del audio"
          placeholder="ej. Mi perspectiva sobre la convivencia con los perros"
          error={errors.title?.message}
          {...register('title')}
        />

        <Select
          label="Sección"
          options={AUDIO_CATEGORIES}
          error={errors.category?.message}
          {...register('category')}
        />

        <Textarea
          label="Descripción (opcional)"
          placeholder="Comparte detalles, créditos o contexto sobre este audio..."
          rows={4}
          error={errors.description?.message}
          {...register('description')}
        />
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end items-center pt-2">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="shadow-glowGold font-bold text-deepblue-950 px-8"
          isLoading={isPublishing}
          disabled={!audioSource}
        >
          {isPublishing ? 'Publicando audio...' : 'Publicar audio en la comunidad'}
        </Button>
      </div>
    </form>
  );
}
