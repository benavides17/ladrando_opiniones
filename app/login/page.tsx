import { Suspense } from 'react';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export const metadata = {
  title: 'Iniciar sesión — ladrando opiniones',
  description: 'Ingresa a tu cuenta de ladrando opiniones para publicar audios y comentar.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-petroleo-100 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-petroleo-900 flex items-center justify-center mx-auto mb-3 shadow-soft">
            <Mic className="w-6 h-6 text-dorado-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-petroleo-900">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-sm text-petroleo-500 mt-1">
            Inicia sesión para compartir tu voz con la comunidad.
          </p>
        </div>

        <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
          <LoginForm />
        </Suspense>

        {/* Footer link */}
        <div className="mt-6 text-center text-sm text-petroleo-500 pt-6 border-t border-humo-200">
          ¿Aún no tienes una cuenta?{' '}
          <Link
            href="/register"
            className="text-teal-600 font-semibold hover:text-teal-700 hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
