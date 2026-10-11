import Link from 'next/link';
import { Mic } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear cuenta — ladrando opiniones',
  description: 'Regístrate en ladrando opiniones para compartir tus grabaciones y conectar con la comunidad.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-petroleo-100 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-petroleo-900 flex items-center justify-center mx-auto mb-3 shadow-soft">
            <Mic className="w-6 h-6 text-dorado-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-petroleo-900">
            Únete a ladrando opiniones
          </h1>
          <p className="text-sm text-petroleo-500 mt-1">
            Crea tu cuenta gratuita y empieza a publicar audios hoy mismo.
          </p>
        </div>

        <RegisterForm />

        {/* Footer link */}
        <div className="mt-6 text-center text-sm text-petroleo-500 pt-6 border-t border-humo-200">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/login"
            className="text-teal-600 font-semibold hover:text-teal-700 hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
