import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Sparkles } from 'lucide-react';
import { AudioPublishForm } from '@/components/audio/AudioPublishForm';

export const metadata = {
  title: 'Publicar nuevo audio — ladrando opiniones',
  description: 'Graba o sube un archivo de audio para compartirlo con la comunidad de ladrando opiniones.',
};

export default function NewAudioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Navegación de retorno */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm text-petroleo-500 hover:text-teal-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-teal-600 text-sm font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Nueva publicación</span>
        </div>
        <h1 className="text-3xl font-extrabold text-petroleo-900 tracking-tight">
          Comparte tu voz con el mundo
        </h1>
        <p className="text-sm sm:text-base text-petroleo-500 mt-1 max-w-xl">
          Puedes grabar directamente desde tu micrófono o subir un archivo de audio ya preparado en tu computador o teléfono.
        </p>
      </div>

      {/* Formulario principal */}
      <AudioPublishForm />
    </div>
  );
}
