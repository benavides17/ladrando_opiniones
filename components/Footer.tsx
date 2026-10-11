import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-petroleo-100 bg-white/70 py-8 text-petroleo-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <img
            src="/branding/ladrando-opiniones-icon.png"
            alt="Icono de ladrando opiniones"
            className="h-10 w-10 rounded-full object-cover object-center"
          />
          <span className="font-bold text-petroleo-800">ladrando opiniones</span>
        </div>

        <div className="flex items-center space-x-6 text-xs text-petroleo-500">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Inicio
          </Link>
          <Link href="/explorar" className="hover:text-teal-600 transition-colors">
            Explorar
          </Link>
          <Link href="/audios/new" className="hover:text-teal-600 transition-colors">
            Publicar audio
          </Link>
        </div>

        <div className="text-xs text-petroleo-400 flex items-center space-x-1">
          <span>Hecho con</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-current" />
          <span>para compartir nuestras historias y voces.</span>
        </div>
      </div>
    </footer>
  );
}
